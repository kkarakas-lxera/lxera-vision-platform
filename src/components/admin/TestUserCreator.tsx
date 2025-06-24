
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

const TestUserCreator = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const createTestUser = async () => {
    setLoading(true);
    setMessage('');
    setError('');

    try {
      // Create a test user through Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: 'learner@test.lxera.com',
        password: 'password123',
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: 'John Test Learner',
            role: 'learner'
          }
        }
      });

      if (signUpError) {
        setError(`Failed to create test user: ${signUpError.message}`);
        return;
      }

      if (data.user) {
        // Now update the user record in our public.users table
        const { error: updateError } = await supabase
          .from('users')
          .upsert({
            id: data.user.id,
            email: 'learner@test.lxera.com',
            full_name: 'John Test Learner',
            role: 'learner',
            password_hash: 'supabase_managed', // Placeholder
            is_active: true,
            email_verified: true,
            position: 'Financial Analyst',
            department: 'Finance'
          });

        if (updateError) {
          console.error('Error updating user profile:', updateError);
        }

        setMessage('Test user created successfully! Email: learner@test.lxera.com, Password: password123');
      }
    } catch (err: any) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const createTestCompanyAdmin = async () => {
    setLoading(true);
    setMessage('');
    setError('');

    try {
      // First ensure we have a test company
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('domain', 'test.lxera.com')
        .maybeSingle();

      let companyId = companyData?.id;

      if (!companyId) {
        // Create test company first
        const { data: newCompany, error: createCompanyError } = await supabase
          .from('companies')
          .insert({
            name: 'LXERA Test Company',
            domain: 'test.lxera.com',
            plan_type: 'premium',
            max_employees: 50,
            max_courses: 20,
            is_active: true
          })
          .select('id')
          .single();

        if (createCompanyError) {
          setError(`Failed to create test company: ${createCompanyError.message}`);
          return;
        }
        companyId = newCompany.id;
      }

      // Create test admin user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: 'admin@test.lxera.com',
        password: 'password123',
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: 'Jane Test Admin',
            role: 'company_admin'
          }
        }
      });

      if (signUpError) {
        setError(`Failed to create test admin: ${signUpError.message}`);
        return;
      }

      if (data.user) {
        // Update the user record with company info
        const { error: updateError } = await supabase
          .from('users')
          .upsert({
            id: data.user.id,
            email: 'admin@test.lxera.com',
            full_name: 'Jane Test Admin',
            role: 'company_admin',
            company_id: companyId,
            password_hash: 'supabase_managed',
            is_active: true,
            email_verified: true,
            position: 'Learning Manager',
            department: 'HR'
          });

        if (updateError) {
          console.error('Error updating admin profile:', updateError);
        }

        setMessage('Test company admin created successfully! Email: admin@test.lxera.com, Password: password123');
      }
    } catch (err: any) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test User Creator</CardTitle>
        <CardDescription>Create test users for authentication testing</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-4">
          <Button onClick={createTestUser} disabled={loading}>
            Create Test Learner
          </Button>
          <Button onClick={createTestCompanyAdmin} disabled={loading}>
            Create Test Company Admin
          </Button>
        </div>

        {message && (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-700">
              {message}
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="text-sm text-gray-600 space-y-2">
          <p><strong>Note:</strong> These test users are created through Supabase Auth, not the migration data.</p>
          <p>The migration data in the database uses bcrypt hashes which are incompatible with Supabase Auth.</p>
          <p>For production, users should be created through the signup flow or admin interface.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestUserCreator;
