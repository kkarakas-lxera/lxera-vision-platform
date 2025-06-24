
-- Create a test company
INSERT INTO companies (id, name, domain, plan_type, max_employees, max_courses, is_active)
VALUES (
  gen_random_uuid(),
  'LXERA Test Company',
  'test.lxera.com',
  'premium',
  50,
  20,
  true
);

-- Create a test learner user
INSERT INTO users (id, email, password_hash, full_name, role, company_id, is_active, email_verified, position, department)
VALUES (
  gen_random_uuid(),
  'learner@test.lxera.com',
  '$2b$12$LQv3c1yqBwWFcZPMtS.4K.6P8vU6OxZdHJ5QKG8vY.7JZu9Z1QY6m', -- bcrypt hash of 'password123'
  'John Test Learner',
  'learner',
  (SELECT id FROM companies WHERE domain = 'test.lxera.com'),
  true,
  true,
  'Financial Analyst',
  'Finance'
);

-- Create an employee record for the learner
INSERT INTO employees (id, user_id, company_id, employee_id, department, position, employee_role, skill_level, is_active)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM users WHERE email = 'learner@test.lxera.com'),
  (SELECT id FROM companies WHERE domain = 'test.lxera.com'),
  'EMP001',
  'Finance',
  'Financial Analyst',
  'analyst',
  'intermediate',
  true
);

-- Create a test company admin user
INSERT INTO users (id, email, password_hash, full_name, role, company_id, is_active, email_verified, position, department)
VALUES (
  gen_random_uuid(),
  'admin@test.lxera.com',
  '$2b$12$LQv3c1yqBwWFcZPMtS.4K.6P8vU6OxZdHJ5QKG8vY.7JZu9Z1QY6m', -- bcrypt hash of 'password123'
  'Jane Test Admin',
  'company_admin',
  (SELECT id FROM companies WHERE domain = 'test.lxera.com'),
  true,
  true,
  'Learning Manager',
  'HR'
);

-- Create some sample course content for the company
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
  (SELECT id FROM companies WHERE domain = 'test.lxera.com'),
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

-- Create a course assignment
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
VALUES (
  gen_random_uuid(),
  (SELECT id FROM employees WHERE employee_id = 'EMP001'),
  (SELECT content_id FROM cm_module_content WHERE module_name = 'Financial Analysis Fundamentals'),
  (SELECT id FROM companies WHERE domain = 'test.lxera.com'),
  (SELECT id FROM users WHERE email = 'admin@test.lxera.com'),
  'assigned',
  0,
  'high'
);
