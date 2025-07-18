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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get authenticated user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Get user's company
    const { data: userProfile } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single();

    if (!userProfile?.company_id) {
      throw new Error('Company not found');
    }

    // Find employees with incomplete profiles who were invited but haven't completed
    const { data: pendingEmployees, error: fetchError } = await supabase
      .from('profile_invitations')
      .select(`
        invitation_token,
        employee_id,
        employees!inner(
          id,
          users!inner(email, full_name),
          companies!inner(name),
          profile_complete
        )
      `)
      .eq('employees.company_id', userProfile.company_id)
      .eq('employees.profile_complete', false)
      .not('sent_at', 'is', null)
      .is('completed_at', null)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Only invites from last 7 days
      .lte('sent_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // At least 24 hours old

    if (fetchError || !pendingEmployees || pendingEmployees.length === 0) {
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: 'No pending employees to remind' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let sent = 0;
    const errors = [];

    // Send reminder emails
    for (const invitation of pendingEmployees) {
      try {
        const siteUrl = Deno.env.get('PUBLIC_SITE_URL') || Deno.env.get('PUBLIC_APP_URL') || 'https://www.lxera.ai';
        const profileUrl = `${siteUrl}/login?redirect=/learner/profile&token=${invitation.invitation_token}`;
        
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'LXERA Team <hello@lxera.ai>',
            to: invitation.employees.users.email,
            subject: `Reminder: Complete Your Profile at ${invitation.employees.companies.name}`,
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
                    <h1 style="font-size: 28px; font-weight: 700; color: #191919; margin: 0 0 20px; text-align: center;">Don't Miss Out on Your Learning Journey!</h1>
                    <p style="color: #666; font-size: 16px; margin-bottom: 30px; text-align: center; line-height: 1.6;">
                      Hi ${invitation.employees.users.full_name}, your profile is waiting!
                    </p>
                    
                    <div style="background: #FEF3C7; border: 2px solid #F59E0B; padding: 20px; border-radius: 8px; margin: 20px 0;">
                      <p style="color: #191919; font-size: 15px; margin: 0 0 10px 0; font-weight: 600;">
                        ⏰ Your profile invitation expires soon!
                      </p>
                      <p style="color: #666; font-size: 15px; margin: 0; line-height: 1.6;">
                        Complete your profile now to unlock personalized learning recommendations tailored to your career goals.
                      </p>
                    </div>
                    
                    <h3 style="color: #191919; margin-top: 30px;">By completing your profile, you'll get:</h3>
                    <ul style="list-style: none; padding: 0; margin: 20px 0;">
                      <li style="padding: 12px 0; color: #666; font-size: 15px;">
                        🎯 Personalized course recommendations
                      </li>
                      <li style="padding: 12px 0; color: #666; font-size: 15px;">
                        📊 Skills gap analysis
                      </li>
                      <li style="padding: 12px 0; color: #666; font-size: 15px;">
                        🚀 Career development insights
                      </li>
                      <li style="padding: 12px 0; color: #666; font-size: 15px;">
                        🏆 Track your learning achievements
                      </li>
                    </ul>
                    
                    <div style="background: #7AE5C6; color: #191919; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; font-size: 14px;">
                      💡 <strong>Pro tip:</strong> You can import your LinkedIn profile in just one click!
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${profileUrl}" 
                         style="display: inline-block; background: #191919; color: white; padding: 16px 40px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                        Complete Your Profile Now
                      </a>
                      <p style="margin-top: 15px; color: #999; font-size: 14px;">This is a friendly reminder. Your invitation link will expire soon.</p>
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

        if (emailResponse.ok) {
          sent++;
          
          // Update last reminder sent
          await supabase
            .from('profile_invitations')
            .update({
              last_reminder_at: new Date().toISOString()
            })
            .eq('employee_id', invitation.employee_id);
        }
      } catch (err) {
        errors.push({
          employee: invitation.employees.users.email,
          error: err.message
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent,
        total: pendingEmployees.length,
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Send reminder error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});