-- ============================================
-- Setup RLS Policies for Score Saving Feature
-- ============================================
-- Run this in Supabase SQL Editor
-- This will enable proper Row Level Security for profiles table

-- Step 1: Ensure skor column exists
-- ============================================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
          AND column_name = 'skor'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN skor bigint DEFAULT 0;
        
        RAISE NOTICE '✅ Column skor added to profiles table';
    ELSE
        RAISE NOTICE '✅ Column skor already exists';
    END IF;
END $$;

-- Step 2: Enable RLS on profiles table
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop existing policies if any (clean slate)
-- ============================================
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own score" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to update own profile" ON public.profiles;

-- Step 4: Create SELECT policy (read own profile)
-- ============================================
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Step 5: Create UPDATE policy (update own profile including score)
-- ============================================
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Step 6: Verify policies were created
-- ============================================
DO $$
DECLARE
    select_policy_count INTEGER;
    update_policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO select_policy_count
    FROM pg_policies
    WHERE tablename = 'profiles' 
      AND cmd = 'SELECT';
    
    SELECT COUNT(*) INTO update_policy_count
    FROM pg_policies
    WHERE tablename = 'profiles' 
      AND cmd = 'UPDATE';
    
    IF select_policy_count > 0 THEN
        RAISE NOTICE '✅ SELECT policy exists (count: %)', select_policy_count;
    ELSE
        RAISE WARNING '❌ No SELECT policy found!';
    END IF;
    
    IF update_policy_count > 0 THEN
        RAISE NOTICE '✅ UPDATE policy exists (count: %)', update_policy_count;
    ELSE
        RAISE WARNING '❌ No UPDATE policy found!';
    END IF;
END $$;

-- Step 7: Test the policies
-- ============================================
-- This should work (reading your own profile)
SELECT id, email, role, skor 
FROM public.profiles 
WHERE id = auth.uid();

-- This should work (updating your own score)
UPDATE public.profiles 
SET skor = COALESCE(skor, 0) + 0 
WHERE id = auth.uid();

-- Step 8: Display current policies for verification
-- ============================================
SELECT 
    policyname as "Policy Name",
    cmd as "Command",
    qual as "USING Clause",
    with_check as "WITH CHECK Clause"
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;

-- ============================================
-- IMPORTANT NOTES
-- ============================================
-- 1. These policies allow authenticated users to:
--    - SELECT (read) their own profile
--    - UPDATE their own profile (including skor)
--
-- 2. The API route uses Supabase Server SDK with service role key,
--    which bypasses RLS. But having proper policies is still
--    good practice for direct client queries.
--
-- 3. If you still have issues after running this:
--    - Verify SUPABASE_SERVICE_ROLE_KEY is set in .env
--    - Restart your Next.js dev server
--    - Check browser console for detailed logs
--
-- 4. To test if policies work, run:
--    UPDATE profiles SET skor = 100 WHERE id = auth.uid();
--    If this works, policies are correct!
-- ============================================

-- Optional: Add constraint to ensure skor is never negative
-- ============================================
-- Uncomment if you want to prevent negative scores
-- ALTER TABLE public.profiles 
-- ADD CONSTRAINT skor_non_negative CHECK (skor >= 0);

-- Optional: Add default value for existing rows
-- ============================================
-- Update any NULL skor values to 0
UPDATE public.profiles 
SET skor = 0 
WHERE skor IS NULL;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '================================================';
    RAISE NOTICE '✅ RLS SETUP COMPLETE!';
    RAISE NOTICE '================================================';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Verify SUPABASE_SERVICE_ROLE_KEY in .env';
    RAISE NOTICE '2. Restart npm run dev';
    RAISE NOTICE '3. Complete a simulation and check score saves';
    RAISE NOTICE '================================================';
END $$;
