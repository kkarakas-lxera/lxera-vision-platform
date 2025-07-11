import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'https://esm.sh/resend@2.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { 
      email, 
      name, 
      company, 
      teamSize, 
      message,
      source = 'pricing_page',
      utmSource,
      utmMedium,
      utmCampaign 
    } = await req.json()

    // Validate required fields
    if (!email || !name || !company || !teamSize) {
      return new Response(
        JSON.stringify({ error: 'Email, name, company, and team size are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate team size
    const validTeamSizes = ['1-10', '11-50', '51-200', '201-500', '500+']
    if (!validTeamSizes.includes(teamSize)) {
      return new Response(
        JSON.stringify({ error: 'Invalid team size' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Check if contact sales entry already exists
    const { data: existingContact } = await supabase
      .from('contact_sales')
      .select('*')
      .eq('email', email)
      .single()

    let contactSales

    if (existingContact) {
      // Update existing contact with new data
      const updateData: any = {
        updated_at: new Date().toISOString(),
        name,
        company,
        team_size: teamSize
      }

      // Only update optional fields if they have values
      if (message) updateData.message = message
      if (utmSource) updateData.utm_source = utmSource
      if (utmMedium) updateData.utm_medium = utmMedium
      if (utmCampaign) updateData.utm_campaign = utmCampaign

      const { data: updatedContact, error: updateError } = await supabase
        .from('contact_sales')
        .update(updateData)
        .eq('id', existingContact.id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating contact sales:', updateError)
        throw updateError
      }

      contactSales = updatedContact
    } else {
      // Create new contact sales entry
      const { data: newContact, error: insertError } = await supabase
        .from('contact_sales')
        .insert({
          email,
          name,
          company,
          team_size: teamSize,
          message: message || null,
          source,
          utm_source: utmSource || null,
          utm_medium: utmMedium || null,
          utm_campaign: utmCampaign || null,
          status: 'new'
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error creating contact sales:', insertError)
        throw insertError
      }

      contactSales = newContact
    }

    // Send confirmation email to user
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      // Don't fail the request if email can't be sent
    } else {
      try {
        const resend = new Resend(resendApiKey);

        // Send email via Resend
        const { data: emailData, error: emailError } = await resend.emails.send({
          from: 'LXERA <hello@lxera.ai>',
          to: email,
          subject: 'Thank you for contacting LXERA',
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
                    <h1 style="font-size: 28px; font-weight: 700; color: #191919; margin: 0 0 20px; text-align: center;">Thank You for Contacting Us!</h1>
                    <p style="color: #666; font-size: 16px; margin-bottom: 30px; text-align: center; line-height: 1.6;">
                      Hi ${name},<br><br>
                      Thank you for reaching out to LXERA. We've received your message and our sales team will be in touch with you within 24 hours to discuss how we can help ${company} achieve its learning and innovation goals.
                    </p>
                    <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
                      <h3 style="color: #191919; font-size: 18px; margin: 0 0 15px;">What happens next?</h3>
                      <ul style="color: #666; font-size: 16px; line-height: 1.6; margin: 0; padding-left: 20px;">
                        <li>A sales specialist will review your inquiry</li>
                        <li>We'll schedule a personalized demo tailored to your needs</li>
                        <li>We'll discuss how LXERA can transform your team's learning experience</li>
                      </ul>
                    </div>
                    <div style="text-align: center; color: #666; font-size: 14px; margin: 20px 0;">
                      ⏰ Expected response time: Within 24 hours
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
          text: `Thank You for Contacting LXERA

Hi ${name},

Thank you for reaching out to LXERA. We've received your message and our sales team will be in touch with you within 24 hours to discuss how we can help ${company} achieve its learning and innovation goals.

What happens next?
- A sales specialist will review your inquiry
- We'll schedule a personalized demo tailored to your needs
- We'll discuss how LXERA can transform your team's learning experience

Expected response time: Within 24 hours

Follow us on LinkedIn: https://www.linkedin.com/company/lxera

Beyond Learning | www.lxera.ai
© 2025 LXERA. All rights reserved.`
        });

        if (emailError) {
          console.error('Resend error:', emailError);
          // Don't fail the request if email can't be sent
        }

        // Email sent successfully
      } catch (emailErr) {
        console.error('Email sending failed:', emailErr);
        // Don't fail the request if email can't be sent
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: contactSales,
        message: existingContact ? 'Contact sales updated' : 'Contact sales created'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in capture-contact-sales function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})