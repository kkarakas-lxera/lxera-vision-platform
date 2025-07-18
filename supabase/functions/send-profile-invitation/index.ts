import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { employeeId, invitationToken } = await req.json();
    
    if (!employeeId || !invitationToken) {
      throw new Error('Missing required parameters');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get employee and company details
    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select(`
        id,
        users!inner(email, full_name),
        companies!inner(name)
      `)
      .eq('id', employeeId)
      .single();

    if (empError || !employee) {
      throw new Error('Employee not found');
    }

    const siteUrl = Deno.env.get('PUBLIC_SITE_URL') || Deno.env.get('PUBLIC_APP_URL') || 'https://www.lxera.ai';
    const profileUrl = `${siteUrl}/login?redirect=/learner/profile&token=${invitationToken}`;

    // Send email via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'LXERA Team <hello@lxera.ai>',
        to: employee.users.email,
        subject: `Complete Your Profile at ${employee.companies.name}`,
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
                    <h1 style="font-size: 28px; font-weight: 700; color: #191919; margin: 0 0 20px; text-align: center;">Welcome to ${employee.companies.name}!</h1>
                    <p style="color: #666; font-size: 16px; margin-bottom: 30px; text-align: center; line-height: 1.6;">
                      Hi ${employee.users.full_name}, let's get your profile set up!
                    </p>
                    
                    <div style="background: #EFEFE3; padding: 20px; border-radius: 8px; margin: 20px 0;">
                      <p style="color: #191919; font-size: 15px; margin: 0; line-height: 1.6;">
                        We're excited to have you join our team! To get started with your personalized learning journey, we need you to complete your professional profile.
                      </p>
                    </div>
                    
                    <h3 style="color: #191919; margin-top: 30px;">Your profile helps us:</h3>
                    <ul style="list-style: none; padding: 0; margin: 20px 0;">
                      <li style="padding: 12px 0; color: #666; font-size: 15px;">
                        ✓ Understand your skills and experience
                      </li>
                      <li style="padding: 12px 0; color: #666; font-size: 15px;">
                        ✓ Identify areas for growth and development
                      </li>
                      <li style="padding: 12px 0; color: #666; font-size: 15px;">
                        ✓ Recommend courses tailored to your career goals
                      </li>
                      <li style="padding: 12px 0; color: #666; font-size: 15px;">
                        ✓ Track your learning progress
                      </li>
                    </ul>
                    
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${profileUrl}" 
                         style="display: inline-block; background: #191919; color: white; padding: 16px 40px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                        Complete Your Profile
                      </a>
                      <p style="margin-top: 15px; color: #999; font-size: 14px;">⏱️ This link expires in 7 days</p>
                    </div>
                    
                    <div style="background: #7AE5C6; color: #191919; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0; font-size: 14px;">
                      💡 You can even import your LinkedIn profile to save time!
                    </div>
                  </div>
                  
                  <!-- Footer -->
                  <div style="padding: 30px 40px; border-top: 1px solid #f0f0f0; text-align: center;">
                    <p style="color: #666; font-size: 14px; margin-bottom: 15px;">Follow us for updates and insights:</p>
                    <div style="margin: 20px 0;">
                      <a href="https://www.linkedin.com/company/lxera" style="display: inline-block; background: #0077B5; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 500; font-size: 14px;">
                        🔗 Follow on LinkedIn
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
      }),
    });

    if (!emailResponse.ok) {
      const error = await emailResponse.text();
      throw new Error(`Failed to send email: ${error}`);
    }

    // Update invitation record
    await supabase
      .from('profile_invitations')
      .update({
        sent_at: new Date().toISOString()
      })
      .eq('employee_id', employeeId)
      .eq('invitation_token', invitationToken);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Send invitation error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});