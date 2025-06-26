-- Add ai_suggestions column to st_company_positions table
-- This stores the original AI skill suggestions for later use in editing

BEGIN;

-- Add ai_suggestions column to store original AI suggestions
ALTER TABLE st_company_positions 
ADD COLUMN IF NOT EXISTS ai_suggestions JSONB DEFAULT '[]'::jsonb;

-- Add comment to document the column
COMMENT ON COLUMN st_company_positions.ai_suggestions IS 'Original AI skill suggestions from position creation, stored for use in editing without re-calling API';

-- Create index for better query performance on AI suggestions
CREATE INDEX IF NOT EXISTS idx_st_company_positions_ai_suggestions 
ON st_company_positions USING gin(ai_suggestions)
WHERE ai_suggestions IS NOT NULL AND ai_suggestions != '[]'::jsonb;

COMMIT;