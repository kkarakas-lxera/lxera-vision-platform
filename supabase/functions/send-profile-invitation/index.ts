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

    const profileUrl = `${Deno.env.get('PUBLIC_APP_URL')}/learner/profile?token=${invitationToken}`;

    // Send email via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Lxera Platform <noreply@lxera.com>',
        to: employee.users.email,
        subject: `Complete Your Profile at ${employee.companies.name}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #2563eb; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #6b7280; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Welcome to ${employee.companies.name}!</h1>
                </div>
                <div class="content">
                  <p>Hi ${employee.users.full_name},</p>
                  
                  <p>We're excited to have you join our team! To get started with your personalized learning journey, we need you to complete your professional profile.</p>
                  
                  <p>Your profile helps us:</p>
                  <ul>
                    <li>Understand your skills and experience</li>
                    <li>Identify areas for growth and development</li>
                    <li>Recommend courses tailored to your career goals</li>
                    <li>Track your learning progress</li>
                  </ul>
                  
                  <p>You can even import your LinkedIn profile to save time!</p>
                  
                  <center>
                    <a href="${profileUrl}" class="button">Complete Your Profile</a>
                  </center>
                  
                  <p style="margin-top: 30px;">This link is unique to you and will expire in 7 days.</p>
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