import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, source = 'website', utm_source, utm_medium, utm_campaign } = await req.json();

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
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>Complete Your LXERA Profile</title>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .logo { font-size: 28px; font-weight: bold; color: #000; }
                .button { display: inline-block; padding: 14px 30px; background-color: #B1B973; color: #000; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
                .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <div class="logo">LXERA</div>
                </div>
                
                <h2>Welcome to LXERA Early Access! 🚀</h2>
                
                <p>Thank you for your interest in LXERA - The First Learning & Innovation Experience Platform.</p>
                
                <p>Click the button below to complete your profile and secure your spot in our early access program:</p>
                
                <div style="text-align: center;">
                  <a href="${magicLink}" class="button">Complete Your Profile</a>
                </div>
                
                <p><strong>This link expires in 24 hours.</strong></p>
                
                <p>If you didn't request this email, you can safely ignore it.</p>
                
                <div class="footer">
                  <p>© 2025 LXERA. All rights reserved.</p>
                  <p>If the button doesn't work, copy and paste this link into your browser:<br>
                  <span style="color: #666; word-break: break-all;">${magicLink}</span></p>
                </div>
              </div>
            </body>
          </html>
        `,
        text: `Welcome to LXERA Early Access!

Thank you for your interest in LXERA - The First Learning & Innovation Experience Platform.

Complete your profile here: ${magicLink}

This link expires in 24 hours.

If you didn't request this email, you can safely ignore it.

© 2025 LXERA. All rights reserved.`
      });

      if (emailError) {
        console.error('Resend error:', emailError);
        throw new Error('Failed to send email');
      }

      console.log('Email sent successfully:', emailData);
    } catch (emailErr) {
      console.error('Email sending failed:', emailErr);
      // Don't throw here - we still want to log the attempt
    }

    // Log email sent
    await supabase
      .from('lead_email_log')
      .insert({
        lead_id: leadId,
        email_type: 'magic_link',
        subject: 'Complete your LXERA early access profile'
      });

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
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});