import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createErrorResponse, logSanitizedError, getErrorStatusCode } from '../_shared/error-utils.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID()
  
  try {
    const { email, name, source = 'website', utm_source, utm_medium, utm_campaign } = await req.json();

    // Validate email
    if (!email || !email.includes('@')) {
      throw new Error('Invalid email address');
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if lead already exists
    const { data: existingLead } = await supabase
      .from('early_access_leads')
      .select('id, status')
      .eq('email', email)
      .single();

    let leadId;
    
    if (existingLead) {
      leadId = existingLead.id;
      
      // Update name if provided
      if (name) {
        await supabase
          .from('early_access_leads')
          .update({ name })
          .eq('id', leadId);
      }
      
      // If they already completed profile, just send them to waiting room
      if (existingLead.status === 'waitlisted' || existingLead.status === 'profile_completed') {
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'already_registered',
            leadId 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      // Create new lead
      const { data: newLead, error: leadError } = await supabase
        .from('early_access_leads')
        .insert({
          email,
          name,
          source,
          utm_source,
          utm_medium,
          utm_campaign,
          status: 'email_captured'
        })
        .select()
        .single();

      if (leadError) throw leadError;
      leadId = newLead.id;
    }

    // Create magic link session
    const { data: session, error: sessionError } = await supabase
      .from('lead_sessions')
      .insert({
        lead_id: leadId,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      })
      .select()
      .single();

    if (sessionError) throw sessionError;

    // Send magic link email
    const siteUrl = Deno.env.get('PUBLIC_SITE_URL') || 'http://localhost:5173';
    const magicLink = `${siteUrl}/onboarding/early-access?token=${session.token}`;

    // Initialize Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured');
    }
    
    const resend = new Resend(resendApiKey);

    // Send email via Resend
    try {
      const { data: emailData, error: emailError } = await resend.emails.send({
        from: 'LXERA <hello@lxera.ai>',
        to: email,
        subject: 'Complete your LXERA early access profile',
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
                  <h1 style="font-size: 28px; font-weight: 700; color: #191919; margin: 0 0 20px; text-align: center;">Complete Your Profile</h1>
                  <p style="color: #666; font-size: 16px; margin-bottom: 30px; text-align: center; line-height: 1.6;">
                    Thanks for signing up for LXERA early access!<br><br>
                    Click below to complete your profile and secure your spot:
                  </p>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${magicLink}" style="display: inline-block; background: #191919; color: white; padding: 16px 40px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Complete Your Profile</a>
                  </div>
                  <div style="text-align: center; color: #666; font-size: 14px; margin: 20px 0;">
                    🔒 Link expires in 24 hours
                  </div>
                  <div style="font-size: 12px; color: #999; word-break: break-all; margin-top: 15px; text-align: center;">
                    If the button doesn't work, copy and paste this link:<br>
                    ${magicLink}
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
        `,
        text: `Complete Your Profile - LXERA Early Access

Thanks for signing up for LXERA early access!

Complete your profile here: ${magicLink}

This link expires in 24 hours.

If you didn't request this email, you can safely ignore it.

Beyond Learning | www.lxera.ai
© 2025 LXERA. All rights reserved.`
      });

      if (emailError) {
        logSanitizedError(emailError, {
          requestId,
          functionName: 'capture-email',
          metadata: { context: 'resend_email' }
        })
        throw new Error('Failed to send email');
      }

      // Email sent successfully
    } catch (emailErr) {
      logSanitizedError(emailErr, {
        requestId,
        functionName: 'capture-email',
        metadata: { context: 'email_sending' }
      })
      // Re-throw the error so the client knows email failed
      throw new Error('Failed to send magic link email. Please try again.');
    }


    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'magic_link_sent',
        leadId,
        // Only include in development
        ...(Deno.env.get('ENVIRONMENT') === 'development' && { magicLink })
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return createErrorResponse(error, {
      requestId,
      functionName: 'capture-email'
    }, getErrorStatusCode(error))
  }
});