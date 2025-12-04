-- ============================================
-- Fix user_id column - make it nullable or add default
-- ============================================

-- Option 1: Make user_id nullable (if it's not needed)
ALTER TABLE public.reviews 
ALTER COLUMN user_id DROP NOT NULL;

-- OR Option 2: Add a default value
-- ALTER TABLE public.reviews 
-- ALTER COLUMN user_id SET DEFAULT 'anonymous';

-- OR Option 3: If user_id shouldn't exist, drop it
-- ALTER TABLE public.reviews DROP COLUMN IF EXISTS user_id;

-- Check the column after fixing
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'reviews'
    AND column_name = 'user_id'
    AND table_schema = 'public';

