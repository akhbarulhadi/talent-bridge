# Debug Guide: Score Not Saving

## Problem
Score tidak tersimpan di table `profiles` kolom `skor` setelah simulation selesai.

---

## Enhanced Logging Added

Saya sudah menambahkan detailed logging di 3 layer:

### 1. GameStore (`app/store/gameStore.ts`)
```
[GameStore] 🎯 Game completed! Terminal node reached.
[GameStore] Total score: 65
[GameStore] Saving score to profile...
[GameStore] ✅ Score saved successfully: {...}
```

### 2. Service Layer (`app/services/game/profile.service.ts`)
```
[Service] updateProfileScore called with: 65
[Service] API response status: 200
[Service] ✅ Score update successful: {...}
```

### 3. API Route (`app/api/score/route.ts`)
```
[API /api/score POST] Auth check: {...}
[API /api/score POST] Request body: {...}
[API /api/score POST] Fetch profile result: {...}
[API /api/score POST] Score calculation: {...}
[API /api/score POST] Update result: {...}
[API /api/score POST] ✅ Success! Score updated from 0 to 65
```

---

## Step-by-Step Debugging Process

### Step 1: Verify Console Logs

**Action:**
1. Run `npm run dev`
2. Open browser to `http://localhost:3000`
3. Open DevTools (F12) → Console tab
4. Login as talent
5. Complete a simulation
6. Watch console logs

**Expected Logs Flow:**
```
[GameStore] 🎯 Game completed! Terminal node reached.
[GameStore] Total score: 65
[GameStore] Saving score to profile...
[Service] updateProfileScore called with: 65
[Service] API response status: 200
[API /api/score POST] Auth check: { hasUser: true, userId: '...' }
[API /api/score POST] Request body: { scoreToAdd: 65, type: 'number' }
[API /api/score POST] Fetch profile result: { profile: { skor: 0 } }
[API /api/score POST] Score calculation: { currentScore: 0, scoreToAdd: 65, newScore: 65 }
[API /api/score POST] Update result: { updateData: [...] }
[API /api/score POST] ✅ Success! Score updated from 0 to 65
[Service] ✅ Score update successful: { success: true, ... }
[GameStore] ✅ Score saved successfully: { success: true, ... }
```

**If you see these logs but score not in DB → Go to Step 2**
**If logs stop at a certain point → See "Common Issues" below**

---

### Step 2: Check RLS Policies in Supabase

**Possible Issue:** Row Level Security (RLS) blocking the update.

**Action:**
1. Go to Supabase Dashboard
2. Navigate to Authentication → Policies
3. Select `profiles` table
4. Check if UPDATE policy exists

**Required Policy:**
```sql
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

**Test Query (run in Supabase SQL Editor):**
```sql
-- This should work if you're authenticated
UPDATE profiles 
SET skor = 100 
WHERE id = auth.uid();

-- Check result
SELECT id, email, skor FROM profiles WHERE id = auth.uid();
```

**If UPDATE policy doesn't exist → Create it**
**If policy exists but still fails → Go to Step 3**

---

### Step 3: Check Supabase Service Role Key

**Possible Issue:** API using anon key instead of service role key.

**Action:**
1. Check `.env` or `.env.local` file
2. Verify these variables exist:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...  ← This one is critical!
   ```

3. Check `utils/supabase/server.ts`:
   ```typescript
   export async function createClient() {
     return createServerClient(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.SUPABASE_SERVICE_ROLE_KEY!,  ← Should use service key
       // NOT anon key
     );
   }
   ```

**If using anon key → RLS will block update**
**If using service key → RLS is bypassed (should work)**

---

### Step 4: Verify Database Column Exists

**Action:**
Run this SQL query in Supabase:

```sql
-- Check if skor column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' 
  AND table_schema = 'public'
  AND column_name = 'skor';
```

**Expected Result:**
| column_name | data_type | is_nullable |
|-------------|-----------|-------------|
| skor        | bigint    | YES         |

**If column doesn't exist:**
```sql
ALTER TABLE public.profiles 
ADD COLUMN skor bigint DEFAULT 0;
```

---

### Step 5: Check Profile Exists

**Action:**
```sql
-- Check if user profile exists
SELECT id, email, role, skor 
FROM profiles 
WHERE id = auth.uid();
```

**Expected:**
- Returns 1 row with your email
- `skor` column exists

**If profile doesn't exist:**
```sql
-- Create profile (if using trigger, this should auto-create)
INSERT INTO profiles (id, email, role, skor)
VALUES (auth.uid(), 'your-email@example.com', 'talent', 0);
```

---

### Step 6: Test API Directly

**Action:**
Open browser console and run:

```javascript
// Test 1: Check auth
fetch('/api/score')
  .then(res => res.json())
  .then(data => console.log('Current score:', data))
  .catch(err => console.error('Error:', err));

// Test 2: Update score
fetch('/api/score', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ scoreToAdd: 50 })
})
  .then(res => res.json())
  .then(data => console.log('Update result:', data))
  .catch(err => console.error('Error:', err));
```

**Expected Results:**

Test 1:
```json
{
  "score": 0,
  "email": "talent@example.com"
}
```

Test 2:
```json
{
  "success": true,
  "previousScore": 0,
  "addedScore": 50,
  "newScore": 50,
  "message": "Score successfully updated"
}
```

**If Test 2 returns success but DB not updated → RLS issue or wrong client**

---

### Step 7: Check Server Logs

**Action:**
Look at terminal where `npm run dev` is running.

**Look for:**
```
[API /api/score POST] Update result: { 
  updateData: [...],
  updateError: 'Row level security policy violation' 
}
```

**Common errors:**
- `Row level security policy violation` → RLS blocking
- `relation "profiles" does not exist` → Table name issue
- `column "skor" does not exist` → Column missing
- `null value in column "id" violates not-null constraint` → Auth issue

---

## Common Issues & Solutions

### Issue 1: "User not authenticated" (401)
**Symptoms:**
```
[API /api/score POST] Auth check: { hasUser: false, authError: '...' }
```

**Solutions:**
- User not logged in → Login first
- Session expired → Re-login
- Cookie not sent → Check browser settings
- Wrong Supabase URL → Check .env

---

### Issue 2: "Failed to fetch user profile" (500)
**Symptoms:**
```
[API /api/score POST] Fetch profile result: { 
  profile: null,
  fetchError: 'Row level security policy violation'
}
```

**Solutions:**
- RLS blocking SELECT → Add SELECT policy
- Profile doesn't exist → Create profile
- Wrong user ID → Check auth.uid()

---

### Issue 3: "Failed to update score" (500)
**Symptoms:**
```
[API /api/score POST] Update result: { 
  updateData: null,
  updateError: 'Row level security policy violation'
}
```

**Solutions:**
- RLS blocking UPDATE → Add UPDATE policy
- Using anon key → Use service role key in API
- Wrong user ID match → Check auth.uid() = id

---

### Issue 4: API returns success but DB not updated
**Symptoms:**
- All logs show success
- API returns 200
- But SELECT still shows old score

**Solutions:**

**A. Check transaction completion:**
```sql
-- In Supabase SQL Editor, run this after API call:
SELECT id, email, skor, updated_at
FROM profiles
WHERE id = auth.uid();
```

**B. Check if using correct database:**
- Development vs Production
- Different Supabase projects
- Local Supabase vs Cloud

**C. Verify API is actually calling database:**
Add this to API route temporarily:
```typescript
// After update, verify it worked
const { data: verifyData } = await supabase
  .from('profiles')
  .select('skor')
  .eq('id', user.id)
  .single();

console.log('Verification query:', verifyData);
```

---

### Issue 5: Score is 0, nothing happens
**Symptoms:**
```
[GameStore] ⚠️ Score is 0, skipping save.
```

**Solution:**
This is expected behavior! Score only saves if `totalScore !== 0`.

**To test:**
- Make decisions that give positive or negative scores
- Check `mst_decision` table has `skor` values set

---

## Quick Diagnostic Checklist

Run through this checklist:

- [ ] `npm run dev` running without errors
- [ ] User logged in as talent
- [ ] Simulation completed (reached terminal node)
- [ ] Console logs show "[GameStore] 🎯 Game completed!"
- [ ] Console logs show "[GameStore] Saving score to profile..."
- [ ] Console logs show "[API /api/score POST] ✅ Success!"
- [ ] `.env` has `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `profiles` table has `skor` column (bigint)
- [ ] Profile row exists for current user
- [ ] RLS UPDATE policy exists and allows `auth.uid() = id`
- [ ] API route at `/api/score` accessible
- [ ] Direct API test via console works

---

## Manual Database Test

If all else fails, test database directly:

```sql
-- 1. Check your user ID
SELECT auth.uid() as my_user_id;

-- 2. Check profile exists
SELECT * FROM profiles WHERE id = auth.uid();

-- 3. Manually update score
UPDATE profiles 
SET skor = 999 
WHERE id = auth.uid();

-- 4. Verify update worked
SELECT id, email, skor FROM profiles WHERE id = auth.uid();
```

**If step 3 fails:**
- Error message will tell you the issue
- Most likely RLS policy problem

---

## Nuclear Option: Disable RLS Temporarily

**⚠️ WARNING: Only for debugging! NOT for production!**

```sql
-- Disable RLS on profiles table
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Now try updating score via game
-- ...

-- After confirming it works, RE-ENABLE RLS:
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- And add proper policy:
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

**If it works with RLS disabled:**
→ Problem is definitely RLS policy
→ Fix policy and re-enable RLS

---

## Contact for Support

If you've tried all steps above and still not working, provide:

1. Console logs (full flow from game completion to API)
2. Server logs (`npm run dev` terminal output)
3. Supabase RLS policies screenshot
4. Result of manual UPDATE query
5. `.env` file (hide actual keys)
6. Supabase project URL

This will help diagnose the exact issue.

---

## Summary

Most common issues:
1. **RLS blocking update** (90% of cases)
2. **Using anon key instead of service key** in API
3. **Profile row doesn't exist**
4. **Column doesn't exist or wrong name**

The enhanced logging will tell you exactly where it's failing! 🔍
