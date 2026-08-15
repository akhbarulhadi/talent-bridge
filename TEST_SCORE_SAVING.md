# Testing Guide: Score Saving Feature

## Pre-requisites
1. ✅ Supabase project configured
2. ✅ User authenticated (logged in as talent)
3. ✅ At least one scenario available in database
4. ✅ `profiles` table has `skor` column (bigint)

---

## Quick Test Checklist

### ✅ Build Test
```bash
npm run build
```
**Expected:** Build succeeds without errors

### ✅ Runtime Test - Data Center Technician

#### Step 1: Check Initial Score
```sql
-- In Supabase SQL Editor
SELECT email, skor 
FROM profiles 
WHERE id = auth.uid();
```
**Note down current score:** `_______`

#### Step 2: Play Simulation
1. Login to application as talent
2. Navigate to dashboard
3. Select "Data Center Technician" scenario
4. Complete the simulation
5. Make decisions until you reach game completion

#### Step 3: Observe Completion Screen
**Expected UI Elements:**
- ✅ Trophy icon
- ✅ "Simulasi Selesai" text
- ✅ Total score displayed (e.g., +65)
- ✅ Decision timeline shown
- ✅ Score saving indicator appears:
  - First: 🔄 "Menyimpan skor..." (with spinner)
  - Then: ✅ "Skor berhasil disimpan ke profil" (green checkmark)

#### Step 4: Verify Database
```sql
-- In Supabase SQL Editor
SELECT email, skor 
FROM profiles 
WHERE id = auth.uid();
```
**Expected:** Score increased by simulation total

**Calculation:**
```
Previous Score: _______
Simulation Score: _______
Expected New Score: _______
Actual New Score: _______
```

---

### ✅ Runtime Test - Cybersecurity Analyst

#### Step 1: Check Current Score
```sql
SELECT email, skor 
FROM profiles 
WHERE id = auth.uid();
```
**Current score:** `_______`

#### Step 2: Play Simulation
1. Select "Cybersecurity Analyst" scenario
2. Complete the simulation
3. Reach "INCIDENT CLOSED" screen

#### Step 3: Observe Completion Screen
**Expected UI Elements:**
- ✅ Shield icon
- ✅ "INCIDENT CLOSED" text
- ✅ "Threat contained successfully."
- ✅ Security Outcome checklist
- ✅ Final Score displayed
- ✅ Score saving indicator:
  - First: 🔄 "Saving score..." (cyan spinner)
  - Then: ✅ "Score saved to profile" (green checkmark)

#### Step 4: Verify Database
```sql
SELECT email, skor 
FROM profiles 
WHERE id = auth.uid();
```
**Expected:** Score increased cumulatively

---

## Error Scenario Tests

### Test Case 1: Network Offline
**Steps:**
1. Open browser DevTools
2. Go to Network tab
3. Select "Offline" mode
4. Complete a simulation
5. **Expected:** ❌ "Skor tidak dapat disimpan. Silakan coba lagi."
6. Re-enable network
7. **Expected:** Score remains in game history, user can exit

### Test Case 2: Unauthenticated User
**Steps:**
1. Clear localStorage/cookies (logout)
2. Try to access game directly via URL
3. **Expected:** Redirect to login OR auth error
4. Complete simulation if somehow accessible
5. **Expected:** Save fails with auth error

### Test Case 3: Zero Score Simulation
**Steps:**
1. Create a test scenario where all decisions = 0 score
2. Complete the simulation
3. **Expected:** NO saving indicator appears
4. Check console: should skip save logic
5. Database score: unchanged

---

## Browser Console Checks

### Success Case
```
Score updated: 50 + 65 = 115
```

### Error Cases
```
Auth error: User not found
Fetch profile error: Failed to fetch user profile
Update profile error: Failed to save score to profile
Failed to save score: Error: User not authenticated
```

---

## Manual Database Verification

### Query 1: Check User Score
```sql
SELECT 
  id,
  email,
  role,
  skor,
  job_title
FROM profiles
WHERE id = auth.uid();
```

### Query 2: Score Change History (if implemented)
```sql
-- If you add simulation_history table later
SELECT 
  scenario_id,
  score,
  completed_at
FROM simulation_history
WHERE talent_id = auth.uid()
ORDER BY completed_at DESC;
```

### Query 3: All Talent Scores (HR view)
```sql
SELECT 
  email,
  skor as total_score,
  job_title
FROM profiles
WHERE role = 'talent'
ORDER BY skor DESC;
```

---

## RLS Policy Verification

### Check Current Policies
```sql
-- In Supabase SQL Editor
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check
FROM pg_policies
WHERE tablename = 'profiles';
```

### Required Policies
1. ✅ SELECT policy for own profile
2. ✅ UPDATE policy for own profile

### Test RLS
```sql
-- As authenticated user, this should work:
UPDATE profiles 
SET skor = skor + 10 
WHERE id = auth.uid();

-- As authenticated user, this should FAIL:
UPDATE profiles 
SET skor = skor + 10 
WHERE id != auth.uid();
```

---

## Integration Test Script

### Full Flow Test
```typescript
// Test scenario (pseudo-code)
async function testScoreSaving() {
  // 1. Get initial score
  const initialProfile = await getUserProfile();
  const initialScore = initialProfile.skor || 0;
  
  // 2. Simulate game completion with +50 score
  const simulationScore = 50;
  await updateProfileScore(simulationScore);
  
  // 3. Verify new score
  const updatedProfile = await getUserProfile();
  const expectedScore = initialScore + simulationScore;
  
  console.assert(
    updatedProfile.skor === expectedScore,
    `Score mismatch! Expected ${expectedScore}, got ${updatedProfile.skor}`
  );
  
  console.log('✅ Score saving test passed!');
}
```

---

## Performance Test

### Load Test Scenario
1. Multiple users complete simulations simultaneously
2. Each user completes 3 simulations back-to-back
3. Verify no score loss or duplication
4. Check Supabase dashboard for query performance

### Expected Metrics
- ⏱️ Score update: < 500ms
- 🔄 No race conditions
- ✅ All scores accurately accumulated

---

## Rollback Plan

If issues occur in production:

### Option 1: Feature Flag
```typescript
// Add to gameStore.ts
const ENABLE_SCORE_SAVING = process.env.NEXT_PUBLIC_ENABLE_SCORE_SAVING === 'true';

if (ENABLE_SCORE_SAVING && totalScore !== 0) {
  // ... save score logic
}
```

### Option 2: Database Rollback
```sql
-- Create backup before deployment
CREATE TABLE profiles_backup AS 
SELECT * FROM profiles;

-- Rollback if needed
UPDATE profiles 
SET skor = b.skor 
FROM profiles_backup b 
WHERE profiles.id = b.id;
```

---

## Checklist Before Production Deploy

- [ ] All tests passed
- [ ] RLS policies configured and tested
- [ ] Error messages user-friendly (not exposing internal errors)
- [ ] Console logging appropriate (not too verbose)
- [ ] Performance acceptable (< 500ms per save)
- [ ] Backup strategy in place
- [ ] Monitoring/alerting configured
- [ ] Documentation updated
- [ ] Team trained on new feature

---

## Support & Troubleshooting

### Common Issues

#### Issue: "Skor tidak dapat disimpan"
**Possible Causes:**
1. User not authenticated → Check auth status
2. RLS policy blocking → Check Supabase policies
3. Network error → Check connectivity
4. Column missing → Verify `profiles.skor` exists

**Solution:**
```sql
-- Verify column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'skor';

-- Add column if missing
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS skor bigint DEFAULT 0;
```

#### Issue: Score not accumulating correctly
**Check:**
1. Verify cumulative logic in `updateProfileScore()`
2. Check for race conditions (multiple saves)
3. Verify database transaction isolation

#### Issue: UI shows error but score was saved
**Check:**
1. Error thrown after successful save?
2. State update timing issue?
3. Network timeout but operation succeeded?

---

## Quick Debug Commands

### Check if service is working
```javascript
// In browser console
import { updateProfileScore } from '@/app/services/game/profile.service';
await updateProfileScore(10); // Should add 10 to current score
```

### Check game store state
```javascript
// In browser console (if exposed)
console.log(useGameStore.getState());
```

### Force save manually
```javascript
// Emergency manual save
const supabase = createClient();
const { data: { user } } = await supabase.auth.getUser();
await supabase.from('profiles').update({ skor: 100 }).eq('id', user.id);
```

---

## Sign-off

- [ ] Developer tested locally ✅
- [ ] QA tested in staging ✅
- [ ] Product owner approved ✅
- [ ] Ready for production 🚀
