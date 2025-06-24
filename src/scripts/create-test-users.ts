import { createClient } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';

// NOTE: This script requires SUPABASE_SERVICE_ROLE_KEY environment variable
// which has admin privileges to create users
const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://xwfweumeryrgbguwrocr.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestUsers() {
  console.log('Creating test users...');

  try {
    // Create test company first
    const { data: company, error: companyError } = await supabaseAdmin
      .from('companies')
      .upsert({
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        name: 'LXERA Test Company',
        domain: 'test.lxera.com',
        plan_type: 'premium',
        max_employees: 50,
        max_courses: 20,
        is_active: true
      })
      .select()
      .single();

    if (companyError) {
      console.error('Error creating company:', companyError);
      return;
    }

    console.log('Company created:', company.name);

    // Create learner user
    const { data: learnerAuth, error: learnerAuthError } = await supabaseAdmin.auth.admin.createUser({
      email: 'learner@test.lxera.com',
      password: 'password123',
      email_confirm: true,
      user_metadata: {
        full_name: 'John Test Learner'
      }
    });

    if (learnerAuthError) {
      console.error('Error creating learner auth:', learnerAuthError);
    } else {
      console.log('Learner auth created:', learnerAuth.user.email);

      // Update learner profile
      const { error: learnerProfileError } = await supabaseAdmin
        .from('users')
        .update({
          role: 'learner',
          company_id: company.id,
          full_name: 'John Test Learner',
          position: 'Financial Analyst',
          department: 'Finance',
          is_active: true,
          email_verified: true
        })
        .eq('id', learnerAuth.user.id);

      if (learnerProfileError) {
        console.error('Error updating learner profile:', learnerProfileError);
      } else {
        console.log('Learner profile updated');

        // Create employee record
        const { error: employeeError } = await supabaseAdmin
          .from('employees')
          .insert({
            user_id: learnerAuth.user.id,
            company_id: company.id,
            employee_id: 'EMP001',
            department: 'Finance',
            position: 'Financial Analyst',
            current_role: 'analyst',
            skill_level: 'intermediate',
            is_active: true
          });

        if (employeeError) {
          console.error('Error creating employee record:', employeeError);
        } else {
          console.log('Employee record created');
        }
      }
    }

    // Create company admin user
    const { data: adminAuth, error: adminAuthError } = await supabaseAdmin.auth.admin.createUser({
      email: 'admin@test.lxera.com',
      password: 'password123',
      email_confirm: true,
      user_metadata: {
        full_name: 'Jane Test Admin'
      }
    });

    if (adminAuthError) {
      console.error('Error creating admin auth:', adminAuthError);
    } else {
      console.log('Admin auth created:', adminAuth.user.email);

      // Update admin profile
      const { error: adminProfileError } = await supabaseAdmin
        .from('users')
        .update({
          role: 'company_admin',
          company_id: company.id,
          full_name: 'Jane Test Admin',
          position: 'Learning Manager',
          department: 'HR',
          is_active: true,
          email_verified: true
        })
        .eq('id', adminAuth.user.id);

      if (adminProfileError) {
        console.error('Error updating admin profile:', adminProfileError);
      } else {
        console.log('Admin profile updated');
      }
    }

    console.log('\nTest users created successfully!');
    console.log('You can now login with:');
    console.log('- learner@test.lxera.com / password123 (Learner role)');
    console.log('- admin@test.lxera.com / password123 (Company Admin role)');
    console.log('- admin@lxera.com / admin123 (Super Admin role)');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createTestUsers();