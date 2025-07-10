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

    // Create beautiful HTML email with unified branding
    const htmlContent = `
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
                <h1 style="font-size: 28px; font-weight: 700; color: #191919; margin: 0 0 20px; text-align: center;">Hi ${firstName}, ready to see LXERA?</h1>
                <p style="color: #666; font-size: 16px; margin-bottom: 30px; text-align: center; line-height: 1.6;">
                  Thanks for your interest from ${company}!
                </p>
                
                <div style="border: 2px solid #f0f0f0; border-radius: 8px; padding: 30px; text-align: center; margin: 20px 0;">
                  <div style="font-size: 48px; margin-bottom: 10px;">📅</div>
                  <h2 style="margin: 10px 0; color: #191919;">Schedule Your Demo</h2>
                  <a href="${calendlyUrl}" style="display: inline-block; background: #191919; color: white; padding: 16px 40px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Schedule Demo Call</a>
                  <p style="margin-top: 15px; color: #999; font-size: 14px;">Takes just 30 seconds</p>
                </div>

                <h3 style="color: #191919; margin-top: 40px;">During our call, we'll cover:</h3>
                <ul style="list-style: none; padding: 0; margin: 20px 0;">
                  <li style="padding: 12px 0; color: #666; font-size: 15px;">
                    ✓ AI-powered skills gap analysis
                  </li>
                  <li style="padding: 12px 0; color: #666; font-size: 15px;">
                    ✓ Automated course creation
                  </li>
                  <li style="padding: 12px 0; color: #666; font-size: 15px;">
                    ✓ ROI calculator for your team
                  </li>
                  <li style="padding: 12px 0; color: #666; font-size: 15px;">
                    ✓ Live platform demonstration
                  </li>
                </ul>

                <div style="background: #EFEFE3; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0; font-size: 14px; color: #666;">
                  💡 Can't find a time that works? Simply reply to this email and we'll coordinate directly.
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
    `;

    // Send email via Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'LXERA Team <hello@lxera.ai>',
      to: email,
      subject: `${firstName}, ready to see LXERA in action? 🚀`,
      html: htmlContent,
      text: `Hi ${firstName}, ready to see LXERA?\n\nThanks for your interest from ${company}!\n\nSchedule your demo: ${calendlyUrl}\n\nDuring our call, we'll cover:\n✓ AI-powered skills gap analysis\n✓ Automated course creation\n✓ ROI calculator for your team\n✓ Live platform demonstration\n\nCan't find a time? Reply to this email and we'll coordinate directly.\n\nBeyond Learning | www.lxera.ai\n© 2025 LXERA. All rights reserved.`,
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