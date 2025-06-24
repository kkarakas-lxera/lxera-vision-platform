-- This script should be run using Supabase's SQL editor or through the Supabase CLI
-- It creates test users properly through Supabase Auth

-- First, ensure we have the test company
INSERT INTO companies (id, name, domain, plan_type, max_employees, max_courses, is_active)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'LXERA Test Company',
  'test.lxera.com', 
  'premium',
  50,
  20,
  true
) ON CONFLICT (domain) DO NOTHING;

-- NOTE: The following users need to be created through Supabase Auth Admin API
-- or through the Supabase Dashboard. They cannot be created via SQL.
-- 
-- Test Users to create:
-- 1. Email: learner@test.lxera.com
--    Password: password123
--    Role: learner
--    Company: LXERA Test Company
--
-- 2. Email: admin@test.lxera.com  
--    Password: password123
--    Role: company_admin
--    Company: LXERA Test Company

-- After creating users through Supabase Auth, update their profiles:
-- This should be run AFTER the users are created in Supabase Auth

-- Update learner user profile
UPDATE users 
SET 
  role = 'learner',
  company_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  full_name = 'John Test Learner',
  position = 'Financial Analyst',
  department = 'Finance',
  is_active = true,
  email_verified = true
WHERE email = 'learner@test.lxera.com';

-- Update company admin user profile  
UPDATE users 
SET 
  role = 'company_admin',
  company_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  full_name = 'Jane Test Admin',
  position = 'Learning Manager',
  department = 'HR',
  is_active = true,
  email_verified = true
WHERE email = 'admin@test.lxera.com';

-- Create employee record for learner
INSERT INTO employees (
  id,
  user_id,
  company_id,
  employee_id,
  department,
  position,
  current_role,
  skill_level,
  is_active
)
SELECT
  gen_random_uuid(),
  u.id,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'EMP001',
  'Finance',
  'Financial Analyst',
  'analyst',
  'intermediate',
  true
FROM users u
WHERE u.email = 'learner@test.lxera.com'
ON CONFLICT DO NOTHING;

-- Create sample course content
INSERT INTO cm_module_content (
  content_id,
  company_id,
  module_name,
  employee_name,
  session_id,
  introduction,
  core_content,
  practical_applications,
  status,
  module_spec,
  assigned_to
)
VALUES (
  gen_random_uuid(),
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Financial Analysis Fundamentals',
  'John Test Learner',
  'session_001',
  'This module introduces the core concepts of financial analysis...',
  'Financial analysis involves examining financial statements to understand company performance...',
  'Apply these concepts to real-world scenarios including ratio analysis and trend identification...',
  'approved',
  '{"target_audience": "financial_analysts", "difficulty": "intermediate", "duration_hours": 8}',
  (SELECT id FROM employees WHERE employee_id = 'EMP001')
);

-- Create course assignment
INSERT INTO course_assignments (
  id,
  employee_id,
  course_id,
  company_id,
  assigned_by,
  status,
  progress_percentage,
  priority
)
SELECT
  gen_random_uuid(),
  e.id,
  c.content_id,
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  u.id,
  'assigned',
  0,
  'high'
FROM employees e
CROSS JOIN cm_module_content c
CROSS JOIN users u
WHERE e.employee_id = 'EMP001'
  AND c.module_name = 'Financial Analysis Fundamentals'
  AND u.email = 'admin@test.lxera.com'
ON CONFLICT DO NOTHING;