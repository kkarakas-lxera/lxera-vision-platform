
-- Phase 1: Database Schema Alignment (Corrected for existing tables only)
-- Add company_id only to cm_* tables that actually exist

-- Add company_id to cm_module_content (if not exists)
ALTER TABLE cm_module_content 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;

-- Add company_id to cm_quality_assessments (if not exists)  
ALTER TABLE cm_quality_assessments
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;

-- Add company_id to cm_content_sections (if not exists)
ALTER TABLE cm_content_sections
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;

-- Add company_id to cm_enhancement_sessions (if not exists)
ALTER TABLE cm_enhancement_sessions
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;

-- Add company_id to cm_research_sessions (if not exists)
ALTER TABLE cm_research_sessions
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;

-- Create indexes for performance on existing tables only
CREATE INDEX IF NOT EXISTS idx_cm_module_content_company ON cm_module_content(company_id);
CREATE INDEX IF NOT EXISTS idx_cm_quality_assessments_company ON cm_quality_assessments(company_id);
CREATE INDEX IF NOT EXISTS idx_cm_content_sections_company ON cm_content_sections(company_id);
CREATE INDEX IF NOT EXISTS idx_cm_enhancement_sessions_company ON cm_enhancement_sessions(company_id);
CREATE INDEX IF NOT EXISTS idx_cm_research_sessions_company ON cm_research_sessions(company_id);

-- Enable RLS on existing cm_ tables
ALTER TABLE cm_module_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE cm_quality_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cm_content_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE cm_enhancement_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cm_research_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then create new ones
DO $$ 
BEGIN
    -- Drop existing policies (ignore errors if they don't exist)
    DROP POLICY IF EXISTS "Super admins can see all content" ON cm_module_content;
    DROP POLICY IF EXISTS "Super admins can see all assessments" ON cm_quality_assessments;
    DROP POLICY IF EXISTS "Super admins can see all sections" ON cm_content_sections;
    DROP POLICY IF EXISTS "Super admins can see all enhancement sessions" ON cm_enhancement_sessions;
    DROP POLICY IF EXISTS "Super admins can see all research sessions" ON cm_research_sessions;
    
    DROP POLICY IF EXISTS "Company users can see their company content" ON cm_module_content;
    DROP POLICY IF EXISTS "Company users can see their company assessments" ON cm_quality_assessments;
    DROP POLICY IF EXISTS "Company users can see their company sections" ON cm_content_sections;
    DROP POLICY IF EXISTS "Company users can see their company enhancement sessions" ON cm_enhancement_sessions;
    DROP POLICY IF EXISTS "Company users can see their company research sessions" ON cm_research_sessions;
EXCEPTION
    WHEN OTHERS THEN NULL; -- Ignore any errors
END $$;

-- Create RLS policies for super admins to see all data (existing tables only)
CREATE POLICY "Super admins can see all content" ON cm_module_content
    FOR ALL USING (auth.jwt() ->> 'role' = 'super_admin');

CREATE POLICY "Super admins can see all assessments" ON cm_quality_assessments
    FOR ALL USING (auth.jwt() ->> 'role' = 'super_admin');

CREATE POLICY "Super admins can see all sections" ON cm_content_sections
    FOR ALL USING (auth.jwt() ->> 'role' = 'super_admin');

CREATE POLICY "Super admins can see all enhancement sessions" ON cm_enhancement_sessions
    FOR ALL USING (auth.jwt() ->> 'role' = 'super_admin');

CREATE POLICY "Super admins can see all research sessions" ON cm_research_sessions
    FOR ALL USING (auth.jwt() ->> 'role' = 'super_admin');

-- Create RLS policies for company users to see their company data (existing tables only)
CREATE POLICY "Company users can see their company content" ON cm_module_content
    FOR ALL USING (
        auth.jwt() ->> 'role' IN ('company_admin', 'learner')
        AND company_id::text = auth.jwt() ->> 'company_id'
    );

CREATE POLICY "Company users can see their company assessments" ON cm_quality_assessments
    FOR ALL USING (
        auth.jwt() ->> 'role' IN ('company_admin', 'learner')
        AND company_id::text = auth.jwt() ->> 'company_id'
    );

CREATE POLICY "Company users can see their company sections" ON cm_content_sections
    FOR ALL USING (
        auth.jwt() ->> 'role' IN ('company_admin', 'learner')
        AND company_id::text = auth.jwt() ->> 'company_id'
    );

CREATE POLICY "Company users can see their company enhancement sessions" ON cm_enhancement_sessions
    FOR ALL USING (
        auth.jwt() ->> 'role' IN ('company_admin', 'learner')
        AND company_id::text = auth.jwt() ->> 'company_id'
    );

CREATE POLICY "Company users can see their company research sessions" ON cm_research_sessions
    FOR ALL USING (
        auth.jwt() ->> 'role' IN ('company_admin', 'learner')
        AND company_id::text = auth.jwt() ->> 'company_id'
    );
