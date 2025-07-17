import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CompleteSignupPayload {
  token: string;
  password: string;
  company: string;
  role: string;
  teamSize: string;
  useCase: string;
  heardAbout: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] Request received`);
  
  try {
    const payload = await req.json();
    console.log(`[${requestId}] Payload parsed:`, JSON.stringify(payload));
    const { token, password, company, role, teamSize, useCase, heardAbout }: CompleteSignupPayload = payload;

    if (!token || !password) {
      throw new Error('Token and password are required');
    }

    if (!company || !role) {
      throw new Error('Company and role are required');
    }

    // Validate password strength
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error(`[${requestId}] Missing environment variables`);
      throw new Error('Server configuration error');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log(`[${requestId}] Supabase client created`);

    // Verify token and get lead data
    const { data: session, error: sessionError } = await supabase
      .from('skills_gap_sessions')
      .select(`
        *,
        skills_gap_leads(*)
      `)
      .eq('token', token)
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (sessionError || !session) {
      console.error(`[${requestId}] Session verification error:`, sessionError);
      console.error(`[${requestId}] Token used:`, token);
      throw new Error('Invalid or expired token');
    }
    console.log(`[${requestId}] Session verified successfully`);

    const lead = session.skills_gap_leads;

    // Check if already converted
    if (lead.status === 'converted') {
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'already_converted',
          redirectTo: '/dashboard'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate company domain from email with timestamp for uniqueness
    const emailDomain = lead.email.split('@')[1];
    const timestamp = Date.now().toString(36); // Convert timestamp to base36 for shorter string
    const companyDomain = `${emailDomain}-${lead.id.substring(0, 8)}-${timestamp}`;

    // Create company record
    const { data: companyRecord, error: companyError } = await supabase
      .from('companies')
      .insert({
        name: company,
        domain: companyDomain,
        plan_type: 'free_skills_gap',
        max_employees: 10,
        max_courses: 0,
        is_active: true
      })
      .select()
      .single();

    if (companyError) {
      console.error(`[${requestId}] Company creation error:`, companyError);
      console.error(`[${requestId}] Company creation details:`, { name: company, domain: companyDomain });
      throw new Error(`Failed to create company record: ${companyError.message || 'Unknown error'}`);
    }

    // Check if auth user already exists
    console.log(`[${requestId}] Checking for existing auth user: ${lead.email}`);
    let existingAuthUser;
    let authCheckError;
    
    try {
      const authCheckResult = await supabase.auth.admin.getUserByEmail(lead.email);
      existingAuthUser = authCheckResult.data;
      authCheckError = authCheckResult.error;
    } catch (e) {
      console.error(`[${requestId}] Auth check exception:`, e);
      authCheckError = e;
    }
    
    console.log(`[${requestId}] Auth user check result:`, { exists: !!existingAuthUser?.user, error: authCheckError });

    let authUser;
    
    if (existingAuthUser?.user) {
      // User exists in auth, check if they can be used for skills gap
      if (existingAuthUser.user.email === 'kubilay.karakas@lxera.ai') {
        // Super admin can test skills gap flow
        authUser = existingAuthUser.user;
      } else {
        // Regular user exists, cannot create duplicate
        await supabase
          .from('companies')
          .delete()
          .eq('id', companyRecord.id);
        throw new Error('User already exists with this email');
      }
    } else {
      // Create new auth user
      const { data: newAuthUser, error: authError } = await supabase.auth.admin.createUser({
        email: lead.email,
        password: password,
        email_confirm: true,
        user_metadata: {
          full_name: lead.name,
        }
      });

      if (authError || !newAuthUser.user) {
        console.error(`[${requestId}] Auth user creation error:`, authError);
        console.error(`[${requestId}] Auth creation details:`, { email: lead.email });
        
        // If auth user creation fails, clean up company
        await supabase
          .from('companies')
          .delete()
          .eq('id', companyRecord.id);
          
        throw new Error('Failed to create authentication account');
      }
      
      authUser = newAuthUser.user;
    }

    // Check if profile user already exists
    const { data: existingUsers, error: userCheckError } = await supabase
      .from('users')
      .select('*')
      .eq('email', lead.email);
    
    const existingUser = existingUsers && existingUsers.length > 0 ? existingUsers[0] : null;

    let user;
    
    if (existingUser) {
      // User profile exists, use it
      user = existingUser;
    } else {
      // Create new user profile
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({
          id: authUser.id,
          email: lead.email,
          password_hash: 'supabase_managed',
          full_name: lead.name,
          role: 'company_admin',
          company_id: companyRecord.id,
          position: role || 'HR Manager',
          is_active: true,
          email_verified: true
        })
        .select()
        .single();

      if (userError) {
        console.error(`[${requestId}] User profile creation error:`, userError);
        console.error(`[${requestId}] User creation details:`, { 
          id: authUser.id, 
          email: lead.email, 
          company_id: companyRecord.id 
        });
        
        // If user profile creation fails, clean up company and auth user
        await supabase
          .from('companies')
          .delete()
          .eq('id', companyRecord.id);
          
        if (authUser.id !== existingAuthUser?.user?.id) {
          await supabase.auth.admin.deleteUser(authUser.id);
        }
          
        throw new Error('Failed to create user profile');
      }
      
      user = newUser;
    }

    // Mark session as used
    await supabase
      .from('skills_gap_sessions')
      .update({ used_at: new Date().toISOString() })
      .eq('id', session.id);

    // Update lead status to converted and store onboarding data
    await supabase
      .from('skills_gap_leads')
      .update({ 
        status: 'converted',
        converted_to_user_id: user.id,
        company: company,
        role: role,
        team_size: teamSize,
        use_case: useCase,
        heard_about: heardAbout
      })
      .eq('id', lead.id);

    // Return success
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'account_created',
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role
        },
        company: {
          id: companyRecord.id,
          name: companyRecord.name,
          plan_type: companyRecord.plan_type
        },
        redirectTo: '/dashboard'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error(`[${requestId}] Error occurred:`, error);
    console.error(`[${requestId}] Error stack:`, error.stack);
    return createErrorResponse(error, {
      requestId,
      functionName: 'complete-skills-gap-signup'
    }, getErrorStatusCode(error));
  }
});

// Error handling utilities
function createErrorResponse(error: any, metadata: any, statusCode = 500) {
  const errorMessage = error?.message || error?.toString() || 'Internal server error';
  console.error(`[${metadata.requestId}] Creating error response:`, {
    message: errorMessage,
    statusCode,
    errorType: error?.constructor?.name
  });
  
  return new Response(
    JSON.stringify({
      error: errorMessage,
      success: false,
      requestId: metadata.requestId
    }),
    {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

function logSanitizedError(error: any, metadata: any) {
  console.error('Edge function error:', {
    message: error?.message,
    code: error?.code,
    ...metadata
  });
}

function getErrorStatusCode(error: any) {
  const message = error?.message || '';
  // Map specific error types to HTTP status codes
  if (message.includes('already exists')) return 409;
  if (message.includes('not found')) return 404;
  if (message.includes('unauthorized')) return 401;
  if (message.includes('forbidden')) return 403;
  if (message.includes('Invalid') || message.includes('required')) return 400;
  return 500;
}