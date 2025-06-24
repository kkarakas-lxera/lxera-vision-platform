-- Fix mm_script_generations table by adding metadata column
ALTER TABLE mm_script_generations 
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Verify all mm_ tables exist and have correct structure
-- If any tables are missing, this will help identify them
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'mm_%'
ORDER BY table_name;