import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DemoEmailPayload {
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  companySize?: string;
  ticketId?: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload: DemoEmailPayload = await req.json();
    const { email, firstName, lastName, company, companySize, ticketId } = payload;

    // Validate required fields
    if (!email || !firstName || !company) {
      throw new Error('Missing required fields');
    }

    // Initialize Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured');
    }
    
    const resend = new Resend(resendApiKey);

    // Build Calendly URL with pre-filled data
    const calendlyParams = new URLSearchParams({
      email,
      first_name: firstName,
      last_name: lastName || firstName,
      a1: company,
      a3: companySize || '',
      utm_source: "demo_email",
      utm_medium: "email",
      utm_campaign: "progressive_demo"
    });
    
    const calendlyUrl = `https://calendly.com/kubilay-karakas-lxera/30min?${calendlyParams.toString()}`;

    // Create beautiful HTML email
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Schedule Your LXERA Demo</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #22C55E 0%, #10B981 100%); padding: 48px 40px; text-align: center; }
    .logo { color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -1px; }
    .content { padding: 48px 40px; }
    .greeting { font-size: 20px; color: #111827; margin-bottom: 24px; font-weight: 600; }
    .message { font-size: 16px; color: #4b5563; line-height: 24px; margin-bottom: 32px; }
    .calendly-container { background-color: #f3f4f6; border-radius: 12px; padding: 32px; margin-bottom: 32px; text-align: center; }
    .calendly-title { font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 16px; }
    .calendly-embed { background-color: #ffffff; border-radius: 8px; padding: 24px; margin-bottom: 20px; border: 1px solid #e5e7eb; }
    .button { display: inline-block; background: linear-gradient(135deg, #22C55E 0%, #10B981 100%); color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); transition: all 0.2s; }
    .button:hover { box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15); transform: translateY(-1px); }
    .benefits { margin-top: 40px; }
    .benefit { display: flex; align-items: flex-start; margin-bottom: 20px; }
    .benefit-icon { width: 24px; height: 24px; background-color: #22C55E; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 16px; flex-shrink: 0; }
    .benefit-text { font-size: 15px; color: #4b5563; line-height: 22px; }
    .footer { background-color: #f9fafb; padding: 32px 40px; text-align: center; border-top: 1px solid #e5e7eb; }
    .footer-text { font-size: 14px; color: #6b7280; line-height: 20px; }
    .social-links { margin-top: 24px; }
    .social-link { display: inline-block; margin: 0 8px; }
    @media (max-width: 600px) {
      .header { padding: 32px 24px; }
      .content { padding: 32px 24px; }
      .footer { padding: 24px; }
      .button { width: 100%; display: block; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">LXERA</div>
    </div>
    
    <div class="content">
      <div class="greeting">Hi ${firstName} 👋</div>
      
      <div class="message">
        Thanks for your interest in LXERA! We're excited to show you how our AI-powered learning platform can transform ${company}'s training and development.
      </div>
      
      <div class="calendly-container">
        <div class="calendly-title">📅 Schedule Your Personalized Demo</div>
        <div class="calendly-embed">
          <p style="margin: 0 0 16px 0; color: #4b5563;">Click below to pick a time that works best for you:</p>
          <a href="${calendlyUrl}" class="button">Choose Your Demo Time</a>
        </div>
        <p style="margin: 0; font-size: 14px; color: #6b7280;">Takes just 30 seconds to schedule</p>
      </div>
      
      <div class="benefits">
        <div style="font-size: 16px; font-weight: 600; color: #111827; margin-bottom: 20px;">What you'll discover in your demo:</div>
        
        <div class="benefit">
          <div class="benefit-icon">
            <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
              <path d="M1 5L5 9L13 1" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="benefit-text">How AI analyzes employee skills and identifies gaps in real-time</div>
        </div>
        
        <div class="benefit">
          <div class="benefit-icon">
            <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
              <path d="M1 5L5 9L13 1" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="benefit-text">Automated course creation tailored to your team's needs</div>
        </div>
        
        <div class="benefit">
          <div class="benefit-icon">
            <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
              <path d="M1 5L5 9L13 1" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="benefit-text">ROI calculator showing potential savings for ${company}</div>
        </div>
        
        <div class="benefit">
          <div class="benefit-icon">
            <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
              <path d="M1 5L5 9L13 1" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="benefit-text">Live demo of our intuitive platform and mobile app</div>
        </div>
      </div>
      
      <div style="margin-top: 40px; padding: 20px; background-color: #f0fdf4; border-left: 4px solid #22C55E; border-radius: 4px;">
        <div style="font-size: 14px; color: #166534; font-weight: 600; margin-bottom: 8px;">Can't find a time that works?</div>
        <div style="font-size: 14px; color: #166534;">Reply to this email and we'll work around your schedule. We're here to help!</div>
      </div>
    </div>
    
    <div class="footer">
      <div class="footer-text">
        You're receiving this email because you requested a demo at lxera.ai<br>
        <a href="https://lxera.ai" style="color: #22C55E; text-decoration: none;">Visit our website</a> • 
        <a href="mailto:hello@lxera.ai" style="color: #22C55E; text-decoration: none;">Contact support</a>
      </div>
      
      <div class="footer-text" style="margin-top: 16px;">
        © 2025 LXERA. All rights reserved.<br>
        Empowering teams through AI-driven learning
      </div>
    </div>
  </div>
</body>
</html>
    `;

    // Send email via Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'LXERA Team <hello@lxera.ai>',
      to: email,
      subject: `${firstName}, ready to see LXERA in action? 🚀`,
      html: htmlContent,
      text: `Hi ${firstName},\n\nThanks for your interest in LXERA! We're excited to show you how our AI-powered learning platform can transform ${company}'s training and development.\n\nSchedule your personalized demo: ${calendlyUrl}\n\nWhat you'll discover:\n- How AI analyzes employee skills and identifies gaps\n- Automated course creation tailored to your needs\n- ROI calculator for ${company}\n- Live platform demo\n\nCan't find a time? Reply to this email and we'll work around your schedule.\n\nBest regards,\nThe LXERA Team`,
      tags: [
        { name: 'category', value: 'demo_scheduling' },
        { name: 'ticket_id', value: ticketId || 'direct' }
      ]
    });

    if (emailError) {
      console.error('Resend error:', emailError);
      throw new Error('Failed to send email');
    }

    // Log email event if we have a ticket ID
    if (ticketId) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      await supabase
        .from('email_logs')
        .insert({
          recipient: email,
          type: 'demo_scheduling',
          status: 'sent',
          metadata: {
            ticket_id: ticketId,
            resend_id: emailData?.id,
            calendly_url: calendlyUrl
          }
        });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Demo scheduling email sent successfully',
        emailId: emailData?.id 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to send demo email' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});