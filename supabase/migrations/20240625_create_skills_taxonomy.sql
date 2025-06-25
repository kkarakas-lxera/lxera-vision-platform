-- Create skills taxonomy tables with st_ prefix
-- This migration creates the foundation for skills-based employee onboarding

-- Skills taxonomy from NESTA UK
CREATE TABLE IF NOT EXISTS st_skills_taxonomy (
    skill_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_name TEXT NOT NULL,
    skill_type TEXT CHECK (skill_type IN ('category', 'skill_group', 'skill_cluster', 'skill')),
    parent_skill_id UUID REFERENCES st_skills_taxonomy(skill_id) ON DELETE CASCADE,
    hierarchy_level INTEGER NOT NULL DEFAULT 0,
    esco_uri TEXT,
    description TEXT,
    aliases TEXT[],
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_st_skills_taxonomy_parent ON st_skills_taxonomy(parent_skill_id);
CREATE INDEX idx_st_skills_taxonomy_type ON st_skills_taxonomy(skill_type);
CREATE INDEX idx_st_skills_taxonomy_name ON st_skills_taxonomy(skill_name);
CREATE INDEX idx_st_skills_taxonomy_level ON st_skills_taxonomy(hierarchy_level);

-- Full text search index
CREATE INDEX idx_st_skills_taxonomy_search ON st_skills_taxonomy USING gin(to_tsvector('english', skill_name || ' ' || COALESCE(description, '')));

-- Company position definitions with skill requirements
CREATE TABLE IF NOT EXISTS st_company_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    position_code TEXT NOT NULL,
    position_title TEXT NOT NULL,
    position_level TEXT,
    department TEXT,
    required_skills JSONB[] DEFAULT '{}', -- Array of {skill_id, skill_name, proficiency_level, is_mandatory}
    nice_to_have_skills JSONB[] DEFAULT '{}',
    is_template BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, position_code)
);

-- Indexes
CREATE INDEX idx_st_company_positions_company ON st_company_positions(company_id);
CREATE INDEX idx_st_company_positions_dept ON st_company_positions(department);

-- Employee skills profile from CV analysis
CREATE TABLE IF NOT EXISTS st_employee_skills_profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    cv_file_path TEXT,
    cv_summary TEXT,
    extracted_skills JSONB[] DEFAULT '{}', -- Array of {skill_id, skill_name, proficiency_level, years_experience, evidence}
    current_position_id UUID REFERENCES st_company_positions(id),
    target_position_id UUID REFERENCES st_company_positions(id),
    skills_match_score DECIMAL(5,2), -- 0-100 percentage
    career_readiness_score DECIMAL(5,2), -- 0-100 percentage
    analyzed_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_st_employee_skills_profile_employee ON st_employee_skills_profile(employee_id);
CREATE INDEX idx_st_employee_skills_profile_positions ON st_employee_skills_profile(current_position_id, target_position_id);

-- Simple import tracking
CREATE TABLE IF NOT EXISTS st_import_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    import_type TEXT DEFAULT 'employee_onboarding',
    csv_file_path TEXT,
    total_employees INTEGER NOT NULL DEFAULT 0,
    processed INTEGER DEFAULT 0,
    successful INTEGER DEFAULT 0,
    failed INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    error_log JSONB[] DEFAULT '{}',
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_st_import_sessions_company ON st_import_sessions(company_id);
CREATE INDEX idx_st_import_sessions_status ON st_import_sessions(status);
CREATE INDEX idx_st_import_sessions_created ON st_import_sessions(created_at DESC);

-- Individual import items for tracking
CREATE TABLE IF NOT EXISTS st_import_session_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    import_session_id UUID NOT NULL REFERENCES st_import_sessions(id) ON DELETE CASCADE,
    employee_email TEXT NOT NULL,
    employee_name TEXT,
    current_position_code TEXT,
    target_position_code TEXT,
    cv_filename TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    employee_id UUID REFERENCES employees(id),
    skills_profile_id UUID REFERENCES st_employee_skills_profile(id),
    error_message TEXT,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_st_import_session_items_session ON st_import_session_items(import_session_id);
CREATE INDEX idx_st_import_session_items_status ON st_import_session_items(status);

-- Update employees table to support skills
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS current_position_id UUID REFERENCES st_company_positions(id),
ADD COLUMN IF NOT EXISTS target_position_id UUID REFERENCES st_company_positions(id),
ADD COLUMN IF NOT EXISTS cv_file_path TEXT,
ADD COLUMN IF NOT EXISTS cv_extracted_data JSONB,
ADD COLUMN IF NOT EXISTS skills_last_analyzed TIMESTAMPTZ;

-- RLS Policies

-- Skills taxonomy is readable by all authenticated users
ALTER TABLE st_skills_taxonomy ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Skills taxonomy readable by all authenticated users" ON st_skills_taxonomy
    FOR SELECT
    TO authenticated
    USING (true);

-- Company positions - company-specific access
ALTER TABLE st_company_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company positions viewable by company members" ON st_company_positions
    FOR SELECT
    TO authenticated
    USING (
        company_id IN (
            SELECT company_id FROM users WHERE id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

CREATE POLICY "Company positions manageable by company admins" ON st_company_positions
    FOR ALL
    TO authenticated
    USING (
        company_id IN (
            SELECT company_id FROM users 
            WHERE id = auth.uid() AND role IN ('company_admin', 'super_admin')
        )
    );

-- Employee skills profiles - employee and company admin access
ALTER TABLE st_employee_skills_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employee skills viewable by self and company admins" ON st_employee_skills_profile
    FOR SELECT
    TO authenticated
    USING (
        employee_id IN (
            SELECT id FROM employees WHERE user_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM users u
            JOIN employees e ON e.id = st_employee_skills_profile.employee_id
            WHERE u.id = auth.uid() 
            AND u.role IN ('company_admin', 'super_admin')
            AND (u.company_id = e.company_id OR u.role = 'super_admin')
        )
    );

-- Import sessions - company admin only
ALTER TABLE st_import_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Import sessions viewable by company admins" ON st_import_sessions
    FOR SELECT
    TO authenticated
    USING (
        company_id IN (
            SELECT company_id FROM users 
            WHERE id = auth.uid() AND role IN ('company_admin', 'super_admin')
        )
    );

CREATE POLICY "Import sessions manageable by company admins" ON st_import_sessions
    FOR ALL
    TO authenticated
    USING (
        created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- Import session items - same as sessions
ALTER TABLE st_import_session_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Import items viewable by company admins" ON st_import_session_items
    FOR SELECT
    TO authenticated
    USING (
        import_session_id IN (
            SELECT id FROM st_import_sessions
            WHERE company_id IN (
                SELECT company_id FROM users 
                WHERE id = auth.uid() AND role IN ('company_admin', 'super_admin')
            )
        )
    );

-- Functions

-- Function to get skill path (all parents up to root)
CREATE OR REPLACE FUNCTION get_skill_path(skill_uuid UUID)
RETURNS TABLE (
    skill_id UUID,
    skill_name TEXT,
    skill_type TEXT,
    hierarchy_level INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE skill_path AS (
        SELECT s.skill_id, s.skill_name, s.skill_type, s.hierarchy_level, s.parent_skill_id
        FROM st_skills_taxonomy s
        WHERE s.skill_id = skill_uuid
        
        UNION ALL
        
        SELECT s.skill_id, s.skill_name, s.skill_type, s.hierarchy_level, s.parent_skill_id
        FROM st_skills_taxonomy s
        INNER JOIN skill_path sp ON s.skill_id = sp.parent_skill_id
    )
    SELECT sp.skill_id, sp.skill_name, sp.skill_type, sp.hierarchy_level
    FROM skill_path sp
    ORDER BY sp.hierarchy_level;
END;
$$ LANGUAGE plpgsql;

-- Function to search skills by name
CREATE OR REPLACE FUNCTION search_skills(search_term TEXT, limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    skill_id UUID,
    skill_name TEXT,
    skill_type TEXT,
    hierarchy_level INTEGER,
    full_path TEXT,
    relevance REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.skill_id,
        s.skill_name,
        s.skill_type,
        s.hierarchy_level,
        string_agg(sp.skill_name, ' > ' ORDER BY sp.hierarchy_level) as full_path,
        ts_rank(to_tsvector('english', s.skill_name || ' ' || COALESCE(s.description, '')), 
                plainto_tsquery('english', search_term)) as relevance
    FROM st_skills_taxonomy s
    LEFT JOIN LATERAL get_skill_path(s.skill_id) sp ON true
    WHERE to_tsvector('english', s.skill_name || ' ' || COALESCE(s.description, '')) 
          @@ plainto_tsquery('english', search_term)
    GROUP BY s.skill_id, s.skill_name, s.skill_type, s.hierarchy_level
    ORDER BY relevance DESC, s.hierarchy_level
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_st_skills_taxonomy_updated_at BEFORE UPDATE ON st_skills_taxonomy
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_st_company_positions_updated_at BEFORE UPDATE ON st_company_positions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_st_employee_skills_profile_updated_at BEFORE UPDATE ON st_employee_skills_profile
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();