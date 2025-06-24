-- =====================================================
-- LXERA SAAS AUTHENTICATION & TENANT SCHEMA
-- =====================================================
-- Multi-tenant authentication system with 3 user roles:
-- 1. Super Admin - System-wide management
-- 2. Company Admin - Company-specific management  
-- 3. Learner - Course consumption
-- =====================================================

-- Enable Row Level Security extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. COMPANIES TABLE (TENANT ISOLATION)
-- =====================================================

CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    domain TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    settings JSONB DEFAULT '{}',
    
    -- Subscription info
    plan_type TEXT DEFAULT 'trial' CHECK (plan_type IN ('trial', 'basic', 'premium', 'enterprise')),
    max_employees INTEGER DEFAULT 10,
    max_courses INTEGER DEFAULT 5,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_companies_domain ON companies(domain);
CREATE INDEX IF NOT EXISTS idx_companies_active ON companies(is_active);

-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for companies
CREATE POLICY "Super admins can see all companies" ON companies
    FOR ALL USING (auth.jwt() ->> 'role' = 'super_admin');

CREATE POLICY "Company admins can see their company" ON companies
    FOR SELECT USING (
        auth.jwt() ->> 'role' = 'company_admin' 
        AND id::text = auth.jwt() ->> 'company_id'
    );

-- =====================================================
-- 2. USERS TABLE (AUTHENTICATION)
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    
    -- Role-based access
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'company_admin', 'learner')),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Profile info
    avatar_url TEXT,
    phone TEXT,
    department TEXT,
    position TEXT,
    
    -- Learning preferences
    learning_preferences JSONB DEFAULT '{}',
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_company_admin CHECK (
        (role = 'super_admin' AND company_id IS NULL) OR
        (role IN ('company_admin', 'learner') AND company_id IS NOT NULL)
    )
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_company_role ON users(company_id, role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Super admins can see all users" ON users
    FOR ALL USING (auth.jwt() ->> 'role' = 'super_admin');

CREATE POLICY "Company admins can see users in their company" ON users
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'company_admin' 
        AND company_id::text = auth.jwt() ->> 'company_id'
    );

CREATE POLICY "Users can see their own data" ON users
    FOR SELECT USING (id::text = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (id::text = auth.jwt() ->> 'sub');

-- =====================================================
-- 3. EMPLOYEES TABLE (COURSE ASSIGNMENTS)
-- =====================================================

CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Employee info
    employee_id TEXT, -- Company's internal employee ID
    department TEXT,
    position TEXT,
    manager_id UUID REFERENCES employees(id),
    
    -- Learning profile
    current_role TEXT,
    career_goal TEXT,
    skill_level TEXT DEFAULT 'beginner' CHECK (skill_level IN ('beginner', 'intermediate', 'advanced')),
    learning_style JSONB DEFAULT '{}',
    key_tools TEXT[] DEFAULT '{}',
    
    -- Progress tracking
    courses_completed INTEGER DEFAULT 0,
    total_learning_hours DECIMAL DEFAULT 0,
    last_activity TIMESTAMPTZ,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    hired_date DATE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_employees_company ON employees(company_id);
CREATE INDEX IF NOT EXISTS idx_employees_user ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_manager ON employees(manager_id);

-- Enable RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- RLS Policies for employees
CREATE POLICY "Super admins can see all employees" ON employees
    FOR ALL USING (auth.jwt() ->> 'role' = 'super_admin');

CREATE POLICY "Company admins can manage their company employees" ON employees
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'company_admin' 
        AND company_id::text = auth.jwt() ->> 'company_id'
    );

CREATE POLICY "Learners can see their own employee record" ON employees
    FOR SELECT USING (
        auth.jwt() ->> 'role' = 'learner' 
        AND user_id::text = auth.jwt() ->> 'sub'
    );

-- =====================================================
-- 4. COURSE ASSIGNMENTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS course_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    course_id UUID NOT NULL, -- References cm_module_content.content_id
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Assignment details
    assigned_by UUID REFERENCES users(id),
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    due_date TIMESTAMPTZ,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    
    -- Progress tracking
    status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'overdue')),
    progress_percentage DECIMAL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- Performance
    completion_time_minutes INTEGER,
    quiz_score DECIMAL,
    feedback JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_course_assignments_employee ON course_assignments(employee_id);
CREATE INDEX IF NOT EXISTS idx_course_assignments_course ON course_assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_course_assignments_company ON course_assignments(company_id);
CREATE INDEX IF NOT EXISTS idx_course_assignments_status ON course_assignments(status);

-- Enable RLS
ALTER TABLE course_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for course assignments
CREATE POLICY "Super admins can see all assignments" ON course_assignments
    FOR ALL USING (auth.jwt() ->> 'role' = 'super_admin');

CREATE POLICY "Company admins can manage their company assignments" ON course_assignments
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'company_admin' 
        AND company_id::text = auth.jwt() ->> 'company_id'
    );

CREATE POLICY "Learners can see their own assignments" ON course_assignments
    FOR SELECT USING (
        auth.jwt() ->> 'role' = 'learner' 
        AND employee_id IN (
            SELECT id FROM employees WHERE user_id::text = auth.jwt() ->> 'sub'
        )
    );

-- =====================================================
-- 5. TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_assignments_updated_at BEFORE UPDATE ON course_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. DEFAULT SUPER ADMIN (OPTIONAL)
-- =====================================================

-- Insert default super admin (change credentials in production!)
-- Password: 'admin123' (hashed with bcrypt)
INSERT INTO users (id, email, password_hash, full_name, role, is_active, email_verified)
VALUES (
    uuid_generate_v4(),
    'admin@lxera.com',
    '$2b$12$LQv3c1yqBwWFcZPMtS.4K.6P8vU6OxZdHJ5QKG8vY.7JZu9Z1QY6m', -- bcrypt hash of 'admin123'
    'System Administrator',
    'super_admin',
    true,
    true
) ON CONFLICT (email) DO NOTHING;