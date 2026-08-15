# Score Saving Feature Documentation

## Overview
Implementasi fitur penyimpanan skor ke profile talent setelah menyelesaikan simulation scenario menggunakan **Next.js API Routes** untuk keamanan dan best practice.

## Architecture

```
Client (Browser)
      ↓
Service Layer (profile.service.ts)
      ↓
API Route (/api/score)
      ↓
Supabase Server SDK
      ↓
PostgreSQL Database (profiles table)
```

**Why API Route?**
- ✅ Secure - Database credentials tidak exposed ke client
- ✅ Server-side validation
- ✅ Centralized error handling
- ✅ Better RLS policy control
- ✅ Logging dan monitoring terpusat

## Database Schema

### Table: `profiles`
```sql
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email text,
  role text DEFAULT 'talent'::text 
    CHECK (role = ANY (ARRAY['talent'::text, 'hr'::text])),
  job_title character varying,
  skor bigint,  -- ← Field untuk menyimpan total skor
  CONSTRAINT profiles_pkey PRIMARY KEY (id)
);
```

**Important Notes:**
- `skor` adalah **cumulative** (akumulatif) - setiap simulation yang diselesaikan akan **menambah** skor existing
- Skor disimpan hanya ketika `totalScore !== 0`
- Penyimpanan terjadi **otomatis** ketika game selesai (`next_problem_statement_id = NULL`)

---

## Implementation Architecture

### 1. API Route Layer
**File:** `app/api/score/route.ts`

#### `POST /api/score`
Update talent's score after completing simulation.

**Request:**
```typescript
POST /api/score
Content-Type: application/json

{
  scoreToAdd: number  // Score dari completed simulation
}
```

**Response Success (200):**
```typescript
{
  success: true,
  previousScore: number,
  addedScore: number,
  newScore: number,
  message: "Score successfully updated"
}
```

**Response Error:**
- `401` - User not authenticated
- `400` - Invalid score value
- `500` - Server error

**Flow:**
1. Authenticate user via `supabase.auth.getUser()`
2. Validate request body (`scoreToAdd` must be number)
3. Fetch current score from `profiles` table
4. Calculate new score: `currentScore + scoreToAdd`
5. Update `profiles.skor` with new score
6. Return success response with score details

#### `GET /api/score`
Get current authenticated user's score.

**Request:**
```typescript
GET /api/score
```

**Response Success (200):**
```typescript
{
  score: number,
  email: string
}
```

**Response Error:**
- `401` - User not authenticated
- `500` - Server error

---

### 2. Service Layer
**File:** `app/services/game/profile.service.ts`

#### `updateProfileScore(scoreToAdd: number)`
Client-side service untuk call API route.

**Implementation:**
```typescript
export async function updateProfileScore(scoreToAdd: number) {
  const response = await fetch('/api/score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scoreToAdd }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update score');
  }

  return await response.json();
}
```

**Returns:**
```typescript
{
  success: boolean;
  previousScore: number;
  addedScore: number;
  newScore: number;
}
```

#### `getUserScore()`
Get current user's score via API.

**Implementation:**
```typescript
export async function getUserScore() {
  const response = await fetch('/api/score', {
    method: 'GET',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch score');
  }

  return await response.json();
}
```

**Returns:**
```typescript
{
  score: number;
  email: string;
}
```

---

### 3. Game Store Enhancement
**File:** `app/store/gameStore.ts`

#### New State Properties
```typescript
interface GameState {
  // ... existing properties
  isSavingScore: boolean;    // Indicator sedang menyimpan
  scoreSaved: boolean;        // Indicator berhasil disimpan
  // error: string | null;    // Digunakan untuk error save
}
```

#### Updated `continueAfterDecision()`
```typescript
continueAfterDecision: async () => {
  const decision = get().selectedDecision;
  if (!decision) return;

  const nextProblemStatementId = decision.next_problem_statement_id;

  if (!nextProblemStatementId) {
    // Game selesai - terminal node
    set({ isGameCompleted: true });
    
    // Save score to profile
    const totalScore = get().totalScore;
    if (totalScore !== 0) {
      set({ isSavingScore: true });
      try {
        await updateProfileScore(totalScore);
        set({ isSavingScore: false, scoreSaved: true });
      } catch (error) {
        console.error("Failed to save score:", error);
        set({ 
          isSavingScore: false, 
          error: "Skor tidak dapat disimpan. Silakan coba lagi." 
        });
      }
    }
    
    return;
  }

  await get().loadProblemStatement(nextProblemStatementId);
}
```

**Logic:**
- Hanya save jika `totalScore !== 0`
- Set `isSavingScore: true` sebelum API call
- Set `scoreSaved: true` jika berhasil
- Set `error` jika gagal
- Tidak block UI - penyimpanan berjalan di background

---

### 4. UI Components Update

#### A. Data Center - GameCompleted.tsx
**File:** `app/components/game/dataCenter/GameCompleted.tsx`

**New Props:**
```typescript
{
  // ... existing props
  isSavingScore?: boolean;
  scoreSaved?: boolean;
  saveError?: string | null;
}
```

**UI Feedback:**
```tsx
{totalScore !== 0 && (
  <div className="mt-4 flex items-center gap-2">
    {isSavingScore && (
      <>
        <Loader2 size={16} className="animate-spin text-primary" />
        <span>Menyimpan skor...</span>
      </>
    )}
    {scoreSaved && !isSavingScore && (
      <>
        <CheckCircle size={16} className="text-green-500" />
        <span>Skor berhasil disimpan ke profil</span>
      </>
    )}
    {saveError && !isSavingScore && (
      <>
        <AlertCircle size={16} className="text-red-500" />
        <span>{saveError}</span>
      </>
    )}
  </div>
)}
```

#### B. Cybersecurity - CyberGameCompleted.tsx
**File:** `app/components/game/cyber/CyberGameCompleted.tsx`

**New Props & UI:**
Same pattern dengan Data Center, tetapi menggunakan theme tertiary (cyan) untuk konsistensi SOC interface.

```tsx
{isSavingScore && (
  <>
    <Loader2 size={16} className="animate-spin text-tertiary" />
    <span>Saving score...</span>
  </>
)}
{scoreSaved && !isSavingScore && (
  <>
    <CheckCircle2 size={16} className="text-green-500" />
    <span>Score saved to profile</span>
  </>
)}
```

#### C. Parent Components Update

**DataCenterGame.tsx:**
```typescript
const {
  // ... existing
  isSavingScore,
  scoreSaved,
  error,
} = useGameStore();

// Pass to GameCompleted
<GameCompleted
  // ... existing props
  isSavingScore={isSavingScore}
  scoreSaved={scoreSaved}
  saveError={error}
/>
```

**CybersecurityGame.tsx:**
Same pattern dengan DataCenterGame.

---

## User Experience Flow

### 1. Playing the Game
```
User selects scenario
  ↓
Makes decisions
  ↓
Accumulates score
  ↓
Reaches terminal node (next_problem_statement_id = NULL)
  ↓
Game completed screen appears
```

### 2. Score Saving (Automatic)
```
Game completed
  ↓
[UI shows] "Menyimpan skor..." + spinner
  ↓
API call to Supabase
  ↓
Update profiles.skor
  ↓
[UI shows] "Skor berhasil disimpan" + checkmark
```

### 3. If Save Fails
```
API error occurs
  ↓
[UI shows] "Skor tidak dapat disimpan. Silakan coba lagi." + alert icon
  ↓
User can still exit or restart
  ↓
Score remains in game history for potential manual retry
```

---

## Security & Data Integrity

### Authentication
- Menggunakan `supabase.auth.getUser()` untuk mendapatkan authenticated user
- Tidak ada user ID yang di-pass dari client
- RLS (Row Level Security) harus diaktifkan di Supabase

### Recommended RLS Policy
```sql
-- Allow users to read their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow users to update their own profile score
CREATE POLICY "Users can update own profile score"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

### Data Validation
- Score tidak boleh negatif di level database:
```sql
ALTER TABLE public.profiles 
ADD CONSTRAINT skor_non_negative 
CHECK (skor >= 0);
```

---

## Testing Scenarios

### API Route Testing

#### Test API Endpoint Directly

**Using cURL:**
```bash
# Update score (requires authenticated session cookie)
curl -X POST http://localhost:3000/api/score \
  -H "Content-Type: application/json" \
  -d '{"scoreToAdd": 50}' \
  -b "cookies.txt"

# Get current score
curl -X GET http://localhost:3000/api/score \
  -b "cookies.txt"
```

**Using Browser Console:**
```javascript
// Update score
fetch('/api/score', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ scoreToAdd: 50 })
})
.then(res => res.json())
.then(data => console.log(data));

// Get score
fetch('/api/score')
.then(res => res.json())
.then(data => console.log(data));
```

**Expected Response:**
```json
{
  "success": true,
  "previousScore": 0,
  "addedScore": 50,
  "newScore": 50,
  "message": "Score successfully updated"
}
```

### Test Case 1: Normal Flow - Positive Score
**Steps:**
1. Login sebagai talent
2. Start simulation
3. Complete dengan positive score (e.g., +65)
4. Verify UI shows "Menyimpan skor..."
5. Verify UI shows "Skor berhasil disimpan"
6. Check database: `SELECT skor FROM profiles WHERE id = [user_id]`
7. Expected: skor bertambah sesuai score simulation

### Test Case 2: Normal Flow - Negative Score
**Steps:**
1. Login sebagai talent
2. Start simulation
3. Complete dengan negative score (e.g., -15)
4. Verify UI shows saving indicator
5. Verify score still saved (cumulative)
6. Expected: skor di database berkurang

### Test Case 3: Zero Score
**Steps:**
1. Complete simulation dengan total score = 0
2. Expected: NO save attempt (skip saving)
3. UI should not show saving indicator

### Test Case 4: Multiple Simulations
**Steps:**
1. Complete simulation #1 with +50 score
2. Check database: skor = 50
3. Complete simulation #2 with +30 score
4. Check database: skor = 80 (cumulative)
5. Complete simulation #3 with -20 score
6. Check database: skor = 60

### Test Case 5: Network Error
**Steps:**
1. Disconnect network / disable Supabase
2. Complete simulation
3. Expected: Error message appears
4. User can still exit or restart game
5. Reconnect and verify data consistency

### Test Case 6: Concurrent Sessions
**Steps:**
1. User opens 2 tabs
2. Complete simulation in tab 1
3. Complete simulation in tab 2
4. Expected: Both scores accumulated correctly (no race condition)

---

## Monitoring & Debugging

### Console Logs
Service logs success:
```
Score updated: 0 + 65 = 65
```

Service logs errors:
```
Auth error: [error details]
Fetch profile error: [error details]  
Update profile error: [error details]
Failed to save score: [error details]
```

### Debugging Checklist
1. ✅ User authenticated? Check `supabase.auth.getUser()`
2. ✅ Profile exists? Check `profiles` table
3. ✅ RLS policies active? Check Supabase dashboard
4. ✅ Network connection? Check browser console
5. ✅ Correct permissions? Check Supabase logs

---

## Future Enhancements

### 1. Score History Table
Track individual simulation attempts:
```sql
CREATE TABLE public.simulation_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_id uuid REFERENCES profiles(id),
  scenario_id uuid REFERENCES mst_skenario(id),
  score bigint,
  completed_at timestamp with time zone DEFAULT now()
);
```

### 2. Leaderboard
Rank talents by total score:
```sql
SELECT 
  p.email,
  p.skor as total_score,
  RANK() OVER (ORDER BY p.skor DESC) as rank
FROM profiles p
WHERE p.role = 'talent'
ORDER BY p.skor DESC
LIMIT 10;
```

### 3. Score Analytics
Track average score per scenario:
```sql
SELECT 
  s.skenario,
  AVG(sh.score) as avg_score,
  COUNT(*) as attempts
FROM simulation_history sh
JOIN mst_skenario s ON sh.scenario_id = s.id
GROUP BY s.skenario;
```

### 4. Retry Mechanism
Jika save gagal, tampilkan button "Retry Save":
```tsx
{saveError && (
  <button onClick={handleRetrySave}>
    Coba Simpan Lagi
  </button>
)}
```

### 5. Offline Support
Store score di localStorage jika offline, sync ketika online kembali.

---

## Summary

✅ **Implemented:**
- ✅ Profile service untuk update score
- ✅ Game store enhancement untuk auto-save
- ✅ UI feedback (loading, success, error)
- ✅ Support untuk Data Center & Cybersecurity scenarios
- ✅ Cumulative score calculation
- ✅ Error handling

🎯 **Key Features:**
- Automatic score saving ketika game selesai
- Real-time UI feedback
- Non-blocking (tidak mengganggu user experience)
- Cumulative scoring across simulations
- Secure (menggunakan authenticated user)

⚠️ **Important Notes:**
- Score hanya disimpan jika `totalScore !== 0`
- RLS policies harus dikonfigurasi di Supabase
- User harus authenticated (login)
- Score bersifat cumulative, bukan per-simulation
