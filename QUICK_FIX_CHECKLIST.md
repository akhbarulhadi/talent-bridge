# Quick Fix Checklist - Score Not Saving

## 🚨 Most Likely Issue: RLS Policy

**90% of "score not saving" issues are RLS (Row Level Security) policies blocking the update.**

---

## ⚡ Quick Fix (3 Minutes)

### Step 1: Check Supabase RLS Policy

Go to: **Supabase Dashboard → Authentication → Policies → profiles table**

**Required Policy:**
```sql
CREATE POLICY "Allow users to update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

**To create policy:**
1. Click "New Policy"
2. Select "Custom Policy"
3. Name: `Allow users to update own profile`
4. Operation: `UPDATE`
5. Policy definition (USING): `auth.uid() = id`
6. WITH CHECK: `auth.uid() = id`
7. Click "Review" → "Save"

---

### Step 2: Verify `.env` Has Service Role Key

Open `.env` or `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  ← THIS ONE IS CRITICAL!
```

**If missing:**
1. Go to Supabase Dashboard → Settings → API
2. Copy "service_role" key (under "Project API keys")
3. Add to `.env`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```
4. Restart `npm run dev`

---

### Step 3: Verify Column Exists

Run in **Supabase SQL Editor**:

```sql
-- Check column exists
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name = 'skor';
```

**Expected:** Returns 1 row showing `skor`

**If empty (column doesn't exist):**
```sql
ALTER TABLE public.profiles 
ADD COLUMN skor bigint DEFAULT 0;
```

---

### Step 4: Test API Directly

**Login to app first**, then open Browser Console (F12) and run:

```javascript
fetch('/api/score', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ scoreToAdd: 50 })
})
.then(res => res.json())
.then(data => {
  console.log('✅ API Response:', data);
  if (data.success) {
    console.log('✅ Score updated from', data.previousScore, 'to', data.newScore);
  } else {
    console.error('❌ Error:', data.error);
  }
})
.catch(err => console.error('❌ Fetch error:', err));
```

**Expected Output:**
```javascript
✅ API Response: {
  success: true,
  previousScore: 0,
  addedScore: 50,
  newScore: 50,
  message: "Score successfully updated"
}
```

---

### Step 5: Verify in Database

Run in **Supabase SQL Editor**:

```sql
-- Check your score
SELECT id, email, skor 
FROM profiles 
WHERE id = auth.uid();
```

**Expected:** Your profile with `skor = 50` (or whatever you added)

---

## 🔍 Enhanced Logging

I've added detailed console logs. After completing simulation, check console for:

```
✅ Success flow:
[GameStore] 🎯 Game completed! Terminal node reached.
[GameStore] Total score: 65
[GameStore] Saving score to profile...
[Service] updateProfileScore called with: 65
[API /api/score POST] Auth check: { hasUser: true }
[API /api/score POST] ✅ Success! Score updated from 0 to 65
[Service] ✅ Score update successful
[GameStore] ✅ Score saved successfully

❌ Error flow (tells you exactly what failed):
[API /api/score POST] Fetch profile error: Row level security policy violation
```

---

## 📋 Complete Checklist

Before asking for help, verify:

- [ ] **Step 1:** RLS UPDATE policy exists and allows `auth.uid() = id`
- [ ] **Step 2:** `.env` has `SUPABASE_SERVICE_ROLE_KEY`
- [ ] **Step 3:** `profiles.skor` column exists (bigint type)
- [ ] **Step 4:** Direct API test works (returns success)
- [ ] **Step 5:** Score appears in database after API test
- [ ] **Bonus:** Check console logs show success messages

---

## 🐛 If Still Not Working

### Check Server Supabase Client

Verify `utils/supabase/server.ts` uses **service role key**:

```typescript
import { createServerClient } from '@supabase/ssr';

export async function createClient() {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,  // ← Should be SERVICE ROLE
    // NOT NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  
  return supabase;
}
```

**If using anon key:**
- RLS will block the update
- Change to service role key
- Restart server

---

## 🎯 Diagnostic SQL Queries

Run these in Supabase SQL Editor:

### Query 1: Check your profile
```sql
SELECT * FROM profiles WHERE id = auth.uid();
```

### Query 2: Test manual update
```sql
UPDATE profiles 
SET skor = 100 
WHERE id = auth.uid()
RETURNING *;
```

**If Query 2 fails with error:**
- Read the error message carefully
- It will tell you exactly what's wrong
- Usually: "policy violation" = RLS issue

### Query 3: Check RLS policies
```sql
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles';
```

**Look for:**
- Policy with `cmd = 'UPDATE'`
- `qual` contains `auth.uid() = id`
- `with_check` contains `auth.uid() = id`

---

## 💡 Quick Win: Temporary RLS Disable

**⚠️ For debugging ONLY! Not for production!**

```sql
-- Disable RLS
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Try your simulation now
-- ...

-- If it works, RLS was the problem
-- Re-enable RLS and fix policy:
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

---

## 📞 Still Need Help?

Provide this info:

1. **Console logs** from completing simulation
2. **Result of Step 4** (direct API test)
3. **Result of diagnostic SQL** (Query 1 & 2)
4. **Screenshot of RLS policies** in Supabase
5. **Server terminal output** when API is called

With this info, I can pinpoint the exact issue! 🎯

---

## ✅ Success Indicators

You'll know it's working when:

1. ✅ Direct API test returns `{ success: true }`
2. ✅ Database shows updated score
3. ✅ Console logs show all success messages
4. ✅ Completion screen shows "Skor berhasil disimpan"
5. ✅ No errors in console or server logs

---

**Total time to fix: ~3 minutes if you follow steps above!**
