-- EMERGENCY FIX: Resolve infinite recursion in users table RLS policies
-- This migration fixes the authentication failure caused by recursive RLS policies

-- Drop all the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Authenticated users can read their own data" ON users;
DROP POLICY IF EXISTS "Authenticated users can update their own data" ON users;
DROP POLICY IF EXISTS "Company users can create new users in their company" ON users;

-- Restore simple, non-recursive policies that were working before
CREATE POLICY "Users can see their own data" ON users
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (id = auth.uid());

-- For company admins to manage users, we need a careful approach
-- This policy allows company admins to see all users in their company
CREATE POLICY "Company admins can see company users" ON users
    FOR SELECT USING (
        auth.jwt() ->> 'role' = 'company_admin' 
        AND company_id::text = auth.jwt() ->> 'company_id'
    );

-- Super admins can see all users (restore original policy)
CREATE POLICY "Super admins can see all users" ON users
    FOR SELECT USING (auth.jwt() ->> 'role' = 'super_admin');

-- For inserting new users, we'll use a function-based approach to avoid recursion
-- This policy allows authenticated users to create new users when they're company admins
CREATE POLICY "Company admins can create users" ON users
    FOR INSERT WITH CHECK (
        auth.jwt() ->> 'role' = 'company_admin' 
        AND company_id::text = auth.jwt() ->> 'company_id'
    );

-- Also allow super admins to create users
CREATE POLICY "Super admins can create users" ON users
    FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'super_admin');

-- Note: The v_company_employees view handles the complex joins without recursion
-- For the employee import functionality, we'll rely on the view rather than
-- complex RLS policies on the users table itself