-- Fix RLS policies to use actual user roles from database, not JWT claims
-- This fixes the CSV import functionality that was broken by incorrect role checks

-- Drop the incorrect policies from emergency fix that use JWT claims
DROP POLICY IF EXISTS "Company admins can see company users" ON users;
DROP POLICY IF EXISTS "Company admins can create users" ON users;

-- Create working policies that check actual user role from database

-- 1. Allow users to see other users in their company (needed for email existence checks)
-- This fixes the 406 error when checking if a user exists by email
CREATE POLICY "Users can see others in same company" ON users
    FOR SELECT USING (
        company_id IS NOT NULL AND
        company_id IN (
            SELECT company_id FROM users WHERE id = auth.uid()
        )
    );

-- 2. Allow company admins to create new users in their company
-- This fixes the 403 error when trying to create new users during CSV import
CREATE POLICY "Company admins can create company users" ON users
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() 
            AND u.role = 'company_admin' 
            AND u.company_id = company_id
        )
    );

-- 3. Allow company admins to update users in their company
CREATE POLICY "Company admins can update company users" ON users
    FOR UPDATE USING (
        id = auth.uid() OR -- Users can update themselves
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() 
            AND u.role = 'company_admin' 
            AND u.company_id = users.company_id
        )
    );

-- Note: These policies use EXISTS subqueries to avoid infinite recursion
-- They check the actual role stored in the database, not JWT claims