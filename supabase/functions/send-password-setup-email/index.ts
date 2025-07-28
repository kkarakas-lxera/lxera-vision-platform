import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'https://esm.sh/resend@2.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SendPasswordSetupRequest {
  email: string;
  isNewUser?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, isNewUser = true }: SendPasswordSetupRequest = await req.json()

    if (!email) {
      throw new Error('Email is required')
    }

    // Initialize Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check if lead exists
    const { data: lead, error: leadError } = await supabaseAdmin
      .from('early_access_leads')
      .select('id, name, status, password_set, auth_user_id')
      .eq('email', email.toLowerCase())
      .single()

    if (leadError || !lead) {
      throw new Error('No early access registration found for this email')
    }

    // If already has password, return error
    if (lead.password_set && lead.auth_user_id) {
      throw new Error('Account already exists. Please sign in with your password.')
    }

    // Generate session token
    const token = crypto.randomUUID()
    
    // Set expiration time (24 hours from now)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    // Create lead session
    const { error: sessionError } = await supabaseAdmin
      .from('lead_sessions')
      .insert({
        lead_id: lead.id,
        token: token,
        expires_at: expiresAt.toISOString()
      })

    if (sessionError) {
      console.error('Error creating session:', sessionError)
      throw new Error('Failed to create verification session')
    }

    // Send email with password setup link
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured')
    }

    const resend = new Resend(resendApiKey)
    const siteUrl = Deno.env.get('PUBLIC_SITE_URL') || 'https://www.lxera.ai'
    const verificationLink = `${siteUrl}/early-access/set-password?token=${token}`
    
    const { error: emailError } = await resend.emails.send({
      from: 'LXERA <hello@lxera.ai>',
      to: email,
      subject: 'Set your password for LXERA Early Access',
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
                <h1 style="font-size: 28px; font-weight: 700; color: #191919; margin: 0 0 20px; text-align: center;">
                  ${isNewUser ? 'Complete Your Early Access Setup' : 'Set Your Password'}
                </h1>
                <p style="color: #666; font-size: 16px; margin-bottom: 20px; line-height: 1.6;">
                  Hi ${lead.name || 'there'},<br><br>
                  ${isNewUser 
                    ? 'Thanks for your interest in LXERA Early Access! Click the button below to set your password and access the waiting room.'
                    : 'We\'ve upgraded our security. Please set a password to continue accessing LXERA Early Access.'}
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${verificationLink}" style="display: inline-block; background: #191919; color: white; padding: 16px 40px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                    Set Password & Access Early Access
                  </a>
                </div>
                
                <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
                  <div style="font-size: 16px; font-weight: 600; color: #191919; margin-bottom: 12px;">🚀 Early Access Benefits</div>
                  <div style="color: #666; font-size: 14px; line-height: 1.8;">
                    ✓ Be the first to try new features<br>
                    ✓ Direct feedback channel with our team<br>
                    ✓ Exclusive updates and insights<br>
                    ✓ Priority access when we launch
                  </div>
                </div>
                
                <p style="text-align: center; color: #666; font-size: 14px; margin: 20px 0;">
                  🔒 This link expires in 24 hours for security reasons
                </p>
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
      text: `Set your password for LXERA Early Access\n\nHi ${lead.name || 'there'},\n\n${isNewUser ? 'Thanks for your interest in LXERA Early Access! Click the link below to set your password and access the waiting room.' : 'We\'ve upgraded our security. Please set a password to continue accessing LXERA Early Access.'}\n\nSet your password: ${verificationLink}\n\nThis link expires in 24 hours.\n\nIf you didn't request this, please ignore this email.`
    })

    if (emailError) {
      console.error('Error sending email:', emailError)
      throw new Error('Failed to send password setup email')
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Password setup email sent successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Send password setup email error:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})