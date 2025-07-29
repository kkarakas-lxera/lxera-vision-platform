import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CompleteSignupPayload {
  token: string;
  password: string;
  company: string;
  industry: string;
  role: string;
  teamSize: string;
  useCases: string[];
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
    const { token, password, company, industry, role, teamSize, useCases, heardAbout }: CompleteSignupPayload = payload;

    console.log(`[${requestId}] Extracted values:`, {
      token: !!token,
      password: !!password,
      company: company || 'UNDEFINED',
      industry: industry || 'UNDEFINED',
      role: role || 'UNDEFINED',
      teamSize: teamSize || 'UNDEFINED',
      useCases: useCases || [],
      heardAbout: heardAbout || 'UNDEFINED'
    });

    if (!token || !password) {
      throw new Error('Token and password are required');
    }

    if (!company || !role) {
      console.error(`[${requestId}] Missing required fields:`, { company: company || 'null', role: role || 'null' });
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

    // Create company record with Skills Gap suffix like early access
    const { data: companyRecord, error: companyError } = await supabase
      .from('companies')
      .insert({
        name: `${company} (Skills Gap)`,
        domain: companyDomain,
        plan_type: 'free_skills_gap',
        max_employees: 10,
        max_courses: 0,
        is_active: true,
        settings: {
          industry: industry,
          team_size: teamSize,
          use_cases: useCases,
          heard_about: heardAbout,
          skills_gap: true,
          skills_gap_lead_id: lead.id
        }
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
          full_name: lead.name || company,
          skills_gap: true,
          skills_gap_lead_id: lead.id,
          signup_type: 'skills_gap'
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
      // User profile exists, update it to company_admin
      console.log(`[${requestId}] Updating existing user to company_admin`);
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          role: 'company_admin',
          company_id: companyRecord.id,
          position: role || 'HR Manager',
          is_active: true,
          email_verified: true,
          metadata: {
            skills_gap: true,
            skills_gap_lead_id: lead.id,
            onboarded_from: 'skills_gap_signup'
          }
        })
        .eq('id', existingUser.id)
        .select()
        .single();
      
      if (updateError) {
        console.error(`[${requestId}] User update error:`, updateError);
        // Clean up company if update fails
        await supabase
          .from('companies')
          .delete()
          .eq('id', companyRecord.id);
        throw new Error('Failed to update user profile');
      }
      
      user = updatedUser;
    } else {
      // Create new user profile
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({
          id: authUser.id,
          email: lead.email,
          password_hash: 'supabase_managed',
          full_name: lead.name || company,
          role: 'company_admin',
          company_id: companyRecord.id,
          position: role || 'HR Manager',
          is_active: true,
          email_verified: true,
          metadata: {
            skills_gap: true,
            skills_gap_lead_id: lead.id,
            onboarded_from: 'skills_gap_signup'
          }
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

    // Update lead status to converted and store onboarding data (matching early access structure)
    await supabase
      .from('skills_gap_leads')
      .update({ 
        status: 'converted',
        converted_to_user_id: user.id,
        company: company,
        role: role,
        team_size: teamSize,
        use_case: useCases.join(', '), // Store as comma-separated string for now
        heard_about: heardAbout,
        enrichment_data: {
          ...lead.enrichment_data,
          industry: industry,
          teamSize: teamSize,
          useCases: useCases,
          heardAbout: heardAbout
        },
        onboarded_at: new Date().toISOString(),
        password_set: true,
        auth_user_id: authUser.id,
        converted_to_auth_at: new Date().toISOString(),
        converted_to_company_id: companyRecord.id
      })
      .eq('id', lead.id);

    // Send welcome email
    try {
      const resendApiKey = Deno.env.get('RESEND_API_KEY');
      if (resendApiKey) {
        const resend = new Resend(resendApiKey);
        const siteUrl = Deno.env.get('PUBLIC_SITE_URL') || 'https://www.lxera.ai';
        
        await resend.emails.send({
          from: 'LXERA <hello@lxera.ai>',
          to: user.email,
          subject: 'Welcome to LXERA - Your Skills Gap Analysis is Ready!',
          html: `
            <div style="font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #EFEFE3 0%, rgba(122, 229, 198, 0.1) 50%, #EFEFE3 100%); padding: 40px 20px;">
                <div style="background: white; border-radius: 16px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1); overflow: hidden;">
                  <!-- Header -->
                  <div style="text-align: center; padding: 40px 40px 30px; border-bottom: 1px solid #f0f0f0;">
                    <img src="https://www.lxera.ai/lovable-uploads/ed8138a6-1489-4140-8b44-0003698e8154.png" alt="LXERA" style="height: 60px; margin-bottom: 15px; display: block; margin-left: auto; margin-right: auto;">
                    <div style="color: #666; font-size: 14px; font-weight: 500; letter-spacing: 0.5px;">Beyond Learning</div>
                  </div>
                  
                  <!-- Content -->
                  <div style="padding: 40px;">
                    <h1 style="font-size: 28px; font-weight: 700; color: #191919; margin: 0 0 20px; text-align: center;">Welcome to LXERA, ${user.full_name}!</h1>
                    <p style="color: #666; font-size: 16px; margin-bottom: 30px; text-align: center; line-height: 1.6;">
                      Your account has been successfully created and your Skills Gap Analysis platform is ready to use.
                    </p>
                    
                    <div style="background: #f8f9fa; border-radius: 12px; padding: 24px; margin: 24px 0;">
                      <h3 style="color: #191919; font-size: 18px; margin: 0 0 16px;">Your Account Details:</h3>
                      <p style="color: #666; margin: 8px 0;"><strong>Company:</strong> ${company}</p>
                      <p style="color: #666; margin: 8px 0;"><strong>Plan:</strong> Free Skills Gap Analysis (up to 10 employees)</p>
                      <p style="color: #666; margin: 8px 0;"><strong>Email:</strong> ${user.email}</p>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${siteUrl}/login" style="display: inline-block; background: #191919; color: white; padding: 16px 40px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Access Your Dashboard</a>
                    </div>
                    
                    <div style="background: #7AE5C6; color: #191919; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                      <div style="font-size: 18px; font-weight: 600; margin-bottom: 10px;">What's Next?</div>
                      <div style="font-size: 14px;">
                        1. Import your employees<br>
                        2. Upload their CVs<br>
                        3. Run AI-powered skills analysis<br>
                        4. View comprehensive gap reports
                      </div>
                    </div>
                  </div>
                  
                  <!-- Footer -->
                  <div style="padding: 30px 40px; border-top: 1px solid #f0f0f0; text-align: center;">
                    <p style="color: #666; font-size: 14px; margin-bottom: 15px;">Need help getting started?</p>
                    <div style="margin: 20px 0;">
                      <a href="mailto:hello@lxera.ai" style="display: inline-block; background: #0077B5; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 500; font-size: 14px;">
                        📧 Contact Support
                      </a>
                    </div>
                    <p style="color: #666; font-size: 13px; margin: 20px 0 10px;">
                      Beyond Learning | <a href="https://www.lxera.ai" style="color: #666; text-decoration: none;">www.lxera.ai</a>
                    </p>
                    <p style="color: #999; font-size: 13px; margin: 0;">© 2025 LXERA. All rights reserved.</p>
                  </div>
                </div>
              </div>
            </div>
          `
        });
        console.log(`[${requestId}] Welcome email sent to ${user.email}`);
      }
    } catch (emailError) {
      // Log error but don't fail the signup
      console.error(`[${requestId}] Failed to send welcome email:`, emailError);
    }

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