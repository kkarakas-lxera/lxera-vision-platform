-- Add description column to st_company_positions table
-- This enables storing AI-generated position descriptions

BEGIN;

-- Add description column to positions table
ALTER TABLE st_company_positions 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add comment to document the column
COMMENT ON COLUMN st_company_positions.description IS 'AI-generated or manual position description detailing role responsibilities and requirements';

-- Create index for full-text search on position descriptions
CREATE INDEX IF NOT EXISTS idx_st_company_positions_description 
ON st_company_positions USING gin(to_tsvector('english', description))
WHERE description IS NOT NULL;

-- Update the updated_at trigger to include the new column
-- (The trigger should already exist for the table)

COMMIT;