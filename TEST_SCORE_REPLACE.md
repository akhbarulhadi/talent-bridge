# Test Score Replace Logic

## Quick Test untuk Verify Score REPLACE bukan ADD

### Test 1: Direct API Test

Login ke aplikasi, lalu jalankan di browser console:

```javascript
// Step 1: Check current score
fetch('/api/score')
  .then(res => res.json())
  .then(data => console.log('Current score:', data.score));

// Step 2: Set score to 100
fetch('/api/score', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ newScore: 100 })
})
  .then(res => res.json())
  .then(data => console.log('After setting to 100:', data));

// Step 3: Verify in database (wait 1 second)
setTimeout(() => {
  fetch('/api/score')
    .then(res => res.json())
    .then(data => console.log('Verified score:', data.score)); // Should be 100
}, 1000);

// Step 4: Set score to 50 (should REPLACE 100, not add to it!)
setTimeout(() => {
  fetch('/api/score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newScore: 50 })
  })
    .then(res => res.json())
    .then(data => {
      console.log('After setting to 50:', data);
      console.log('Previous was:', data.previousScore); // Should be 100
      console.log('New is:', data.newScore); // Should be 50
    });
}, 2000);

// Step 5: Final verification
setTimeout(() => {
  fetch('/api/score')
    .then(res => res.json())
    .then(data => {
      console.log('=== FINAL RESULT ===');
      console.log('Database score:', data.score);
      if (data.score === 50) {
        console.log('✅ SUCCESS: Score was REPLACED (not added)');
      } else if (data.score === 150) {
        console.log('❌ FAIL: Score was ADDED (100 + 50 = 150)');
      } else {
        console.log('❓ UNEXPECTED: Score is', data.score);
      }
    });
}, 3000);
```

**Expected Output:**
```
Current score: 0
After setting to 100: { success: true, previousScore: 0, newScore: 100 }
Verified score: 100
After setting to 50: { success: true, previousScore: 100, newScore: 50 }
=== FINAL RESULT ===
Database score: 50
✅ SUCCESS: Score was REPLACED (not added)
```

**If you see:**
```
Database score: 150
❌ FAIL: Score was ADDED
```

Then there's still a bug somewhere!

---

### Test 2: Check Database Directly

Run in Supabase SQL Editor:

```sql
-- Get your current score
SELECT id, email, skor FROM profiles WHERE id = auth.uid();

-- Manually set score to 100
UPDATE profiles SET skor = 100 WHERE id = auth.uid();

-- Verify
SELECT skor FROM profiles WHERE id = auth.uid(); -- Should be 100

-- Now use API to set to 50 (via browser console or game)
-- Then check again:
SELECT skor FROM profiles WHERE id = auth.uid(); -- Should be 50, NOT 150!
```

---

### Test 3: Complete Simulation Twice

1. **First Simulation:**
   - Complete simulation
   - Get score (e.g., 65)
   - Check database: `SELECT skor FROM profiles WHERE id = auth.uid();`
   - Should be: **65**

2. **Second Simulation (Restart):**
   - Restart or play again
   - Complete simulation
   - Get score (e.g., 30)
   - Check database immediately after
   - Should be: **30** (NOT 65 + 30 = 95!)

---

### Test 4: Watch Console Logs

During game completion, watch for these logs:

```
✅ CORRECT Flow:
[GameStore] 🎯 Game completed! Terminal node reached.
[GameStore] Total score: 30
[GameStore] Already saving? false
[GameStore] Already saved? false
[GameStore] Saving score to profile...
[Service] updateProfileScore called with newScore: 30
[API /api/score POST] Request body: { newScore: 30, type: 'number' }
[API /api/score POST] Score update: { previousScore: 65, newScore: 30, action: 'REPLACE (not add!)' }
[API /api/score POST] ✅ Success! Score REPLACED: 65 → 30

❌ WRONG (if you see this):
[API /api/score POST] Score update: { previousScore: 65, newScore: 95 }
(This means somewhere it's adding 65 + 30)
```

---

### Test 5: Check for Race Conditions

If score is being saved multiple times:

```
[GameStore] Saving score to profile...
[GameStore] Saving score to profile...  ← DUPLICATE!
```

The new protection should prevent this:

```
[GameStore] Saving score to profile...
[GameStore] ⚠️ Score already saved, skipping.  ← PROTECTED!
```

---

## Diagnostic Checklist

If score is still being added instead of replaced:

- [ ] Check console logs show `newScore` being sent (not `scoreToAdd`)
- [ ] Check API logs show `REPLACE (not add!)`
- [ ] Check API UPDATE query: `.update({ skor: newScore })`
- [ ] Check no calculation before update: `newScore = scoreToAdd` (not `previousScore + scoreToAdd`)
- [ ] Check database value after API call
- [ ] Check if multiple API calls happening (race condition)
- [ ] Check if old code cached (hard refresh: Ctrl+Shift+R)

---

## If Still Adding

Run this emergency diagnostic:

```javascript
// Intercept fetch to see what's actually being sent
const originalFetch = window.fetch;
window.fetch = function(...args) {
  const [url, options] = args;
  if (url === '/api/score' && options?.method === 'POST') {
    console.log('🔍 INTERCEPTED /api/score POST');
    console.log('Body:', options.body);
    const body = JSON.parse(options.body);
    console.log('Parsed:', body);
    if ('scoreToAdd' in body) {
      console.log('❌ WRONG: Using scoreToAdd (old parameter name)');
    }
    if ('newScore' in body) {
      console.log('✅ CORRECT: Using newScore');
    }
  }
  return originalFetch.apply(this, args);
};

// Now complete a simulation and watch the intercept logs
```

---

## Expected vs Actual

### Expected (REPLACE):
```
User score: 0
Complete game: +50
Database: 50 ✅

User score: 50
Complete game: +30
Database: 30 ✅ (replaced!)

User score: 30
Complete game: +100
Database: 100 ✅ (replaced!)
```

### Wrong (ADD):
```
User score: 0
Complete game: +50
Database: 50

User score: 50
Complete game: +30
Database: 80 ❌ (added!)

User score: 80
Complete game: +100
Database: 180 ❌ (added!)
```

---

## Solution Summary

The code now:
1. ✅ Uses `newScore` parameter (clear naming)
2. ✅ API does `.update({ skor: newScore })` - direct replace
3. ✅ No calculation: `newScore` is used as-is
4. ✅ Protection against duplicate saves
5. ✅ Detailed logging to track flow

**Every score should REPLACE the old one, not add to it!**
