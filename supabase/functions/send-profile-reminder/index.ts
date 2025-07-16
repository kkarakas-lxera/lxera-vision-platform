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
        const profileUrl = `${Deno.env.get('PUBLIC_APP_URL')}/learner/profile?token=${invitation.invitation_token}`;
        
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Lxera Platform <noreply@lxera.com>',
            to: invitation.employees.users.email,
            subject: `Reminder: Complete Your Profile at ${invitation.employees.companies.name}`,
            html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #f59e0b; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                    .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #6b7280; }
                    .highlight { background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h1>Don't Miss Out on Your Learning Journey!</h1>
                    </div>
                    <div class="content">
                      <p>Hi ${invitation.employees.users.full_name},</p>
                      
                      <div class="highlight">
                        <strong>⏰ Your profile invitation expires soon!</strong>
                        <p>Complete your profile now to unlock personalized learning recommendations tailored to your career goals.</p>
                      </div>
                      
                      <p>By completing your profile, you'll get:</p>
                      <ul>
                        <li>🎯 Personalized course recommendations</li>
                        <li>📊 Skills gap analysis</li>
                        <li>🚀 Career development insights</li>
                        <li>🏆 Track your learning achievements</li>
                      </ul>
                      
                      <p><strong>Pro tip:</strong> You can import your LinkedIn profile in just one click!</p>
                      
                      <center>
                        <a href="${profileUrl}" class="button">Complete Your Profile Now</a>
                      </center>
                      
                      <p style="margin-top: 30px; font-size: 14px;">This is a friendly reminder. Your invitation link will expire soon.</p>
                    </div>
                    <div class="footer">
                      <p>If you have any questions, please contact your HR team.</p>
                      <p>&copy; 2024 Lxera Platform. All rights reserved.</p>
                    </div>
                  </div>
                </body>
              </html>
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