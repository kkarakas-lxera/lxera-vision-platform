import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SkillsGapSignupPayload {
  email: string;
  name: string;
  source?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  
  try {
    const payload: SkillsGapSignupPayload = await req.json();
    const { 
      email, 
      name, 
      source = 'skills-gap-landing',
      utm_source, 
      utm_medium, 
      utm_campaign 
    } = payload;

    // Validate required fields
    if (!email || !name) {
      throw new Error('Missing required fields: email and name');
    }

    // Validate email format
    if (!email.includes('@')) {
      throw new Error('Invalid email address');
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if lead already exists
    const { data: existingLead } = await supabase
      .from('skills_gap_leads')
      .select('id, status, email')
      .eq('email', email.toLowerCase())
      .single();

    let leadId;
    
    if (existingLead) {
      leadId = existingLead.id;
      
      // Update existing lead with new data
      await supabase
        .from('skills_gap_leads')
        .update({
          name,
          utm_source,
          utm_medium,
          utm_campaign
        })
        .eq('id', leadId);
      
      // If already converted, redirect to login
      if (existingLead.status === 'converted') {
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'already_converted',
            leadId,
            redirectTo: '/login'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      // Create new lead
      const { data: newLead, error: leadError } = await supabase
        .from('skills_gap_leads')
        .insert({
          email: email.toLowerCase(),
          name,
          source,
          utm_source,
          utm_medium,
          utm_campaign,
          status: 'pending_verification'
        })
        .select()
        .single();

      if (leadError) {
        logSanitizedError(leadError, {
          requestId,
          functionName: 'skills-gap-signup',
          metadata: { context: 'create_lead' }
        });
        throw new Error('Failed to create skills gap lead');
      }
      
      leadId = newLead.id;
    }

    // Create verification session
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const { data: session, error: sessionError } = await supabase
      .from('skills_gap_sessions')
      .insert({
        lead_id: leadId,
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single();

    if (sessionError) {
      logSanitizedError(sessionError, {
        requestId,
        functionName: 'skills-gap-signup',
        metadata: { context: 'create_session' }
      });
      throw new Error('Failed to create verification session');
    }

    // Send verification email
    const siteUrl = Deno.env.get('PUBLIC_SITE_URL') || 'https://www.lxera.ai';
    const verificationLink = `${siteUrl}/skills-gap-onboarding?token=${session.token}`;

    // Initialize Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured');
    }
    
    const resend = new Resend(resendApiKey);

    // Send verification email
    try {
      const { data: emailData, error: emailError } = await resend.emails.send({
        from: 'LXERA <hello@lxera.ai>',
        to: email,
        subject: 'Complete your Skills Gap Analysis setup',
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
                  <h1 style="font-size: 28px; font-weight: 700; color: #191919; margin: 0 0 20px; text-align: center;">Complete Your Skills Gap Analysis Setup</h1>
                  <p style="color: #666; font-size: 16px; margin-bottom: 30px; text-align: center; line-height: 1.6;">
                    Hi ${name},<br><br>
                    Thanks for starting your skills gap analysis!<br><br>
                    Click below to complete your setup and access your dashboard:
                  </p>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationLink}" style="display: inline-block; background: #191919; color: white; padding: 16px 40px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Complete Setup & Access Dashboard</a>
                  </div>
                  <div style="text-align: center; color: #666; font-size: 14px; margin: 20px 0;">
                    🔒 Link expires in 24 hours
                  </div>
                  <div style="background: #7AE5C6; color: #191919; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                    <div style="font-size: 18px; font-weight: 600; margin-bottom: 10px;">Free Skills Gap Analysis</div>
                    <div style="font-size: 14px;">✓ Analyze up to 10 employees<br>✓ AI-powered CV analysis<br>✓ Detailed gap reports</div>
                  </div>
                  <div style="font-size: 12px; color: #999; word-break: break-all; margin-top: 15px; text-align: center;">
                    If the button doesn't work, copy and paste this link:<br>
                    ${verificationLink}
                  </div>
                </div>
                
                <!-- Footer -->
                <div style="padding: 30px 40px; border-top: 1px solid #f0f0f0; text-align: center;">
                  <p style="color: #666; font-size: 14px; margin-bottom: 15px;">Questions? We're here to help!</p>
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
        text: `Complete Your Skills Gap Analysis Setup - LXERA

Hi ${name},

Thanks for starting your skills gap analysis!

Complete your setup and access your dashboard: ${verificationLink}

Free Skills Gap Analysis:
✓ Analyze up to 10 employees
✓ AI-powered CV analysis
✓ Detailed gap reports

This link expires in 24 hours.

If you didn't request this, you can safely ignore this email.

Beyond Learning | www.lxera.ai
© 2025 LXERA. All rights reserved.`
      });

      if (emailError) {
        logSanitizedError(emailError, {
          requestId,
          functionName: 'skills-gap-signup',
          metadata: { context: 'send_email' }
        });
        throw new Error('Failed to send verification email');
      }

    } catch (emailErr) {
      logSanitizedError(emailErr, {
        requestId,
        functionName: 'skills-gap-signup',
        metadata: { context: 'email_sending' }
      });
      throw new Error('Failed to send verification email. Please try again.');
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'verification_email_sent',
        leadId,
        // Only include in development
        ...(Deno.env.get('ENVIRONMENT') === 'development' && { verificationLink })
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return createErrorResponse(error, {
      requestId,
      functionName: 'skills-gap-signup'
    }, getErrorStatusCode(error));
  }
});

// Error handling utilities
function createErrorResponse(error, metadata, statusCode = 500) {
  return new Response(
    JSON.stringify({
      error: error.message || 'Internal server error',
      success: false,
      requestId: metadata.requestId
    }),
    {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

function logSanitizedError(error, metadata) {
  console.error('Edge function error:', {
    message: error?.message,
    code: error?.code,
    ...metadata
  });
}

function getErrorStatusCode(error) {
  // Map specific error types to HTTP status codes
  if (error.message?.includes('already exists')) return 409;
  if (error.message?.includes('not found')) return 404;
  if (error.message?.includes('unauthorized')) return 401;
  if (error.message?.includes('forbidden')) return 403;
  if (error.message?.includes('Invalid') || error.message?.includes('required')) return 400;
  return 500;
}