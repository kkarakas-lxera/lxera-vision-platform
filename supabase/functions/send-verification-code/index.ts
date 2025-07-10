import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'https://esm.sh/resend@2.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SendVerificationCodeRequest {
  email: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email }: SendVerificationCodeRequest = await req.json()

    if (!email) {
      throw new Error('Email is required')
    }

    // Initialize Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Set expiration time (15 minutes from now)
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 15)

    // Mark any existing unused codes for this email as used
    await supabaseAdmin
      .from('verification_codes')
      .update({ used: true })
      .eq('email', email)
      .eq('used', false)

    // Insert new verification code
    const { error: insertError } = await supabaseAdmin
      .from('verification_codes')
      .insert({
        email,
        code,
        expires_at: expiresAt.toISOString()
      })

    if (insertError) {
      console.error('Error inserting verification code:', insertError)
      throw new Error('Failed to generate verification code')
    }

    // Send email with verification code
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured')
    }

    const resend = new Resend(resendApiKey)
    
    const { error: emailError } = await resend.emails.send({
      from: 'LXERA <hello@lxera.ai>',
      to: email,
      subject: 'Your LXERA Verification Code',
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
                <h1 style="font-size: 28px; font-weight: 700; color: #191919; margin: 0 0 20px; text-align: center;">Verify Your Email</h1>
                <p style="color: #666; font-size: 16px; margin-bottom: 30px; text-align: center; line-height: 1.6;">
                  Hi there, welcome to LXERA!
                </p>
                
                <div style="background: #7AE5C6; color: #191919; padding: 30px; border-radius: 12px; text-align: center; margin: 30px 0; font-size: 36px; font-weight: 700; letter-spacing: 8px;">
                  ${code}
                </div>
                
                <p style="text-align: center; color: #666; font-size: 14px; margin: 20px 0;">
                  ⏱️ Code expires in 15 minutes
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
      text: `Your LXERA Verification Code: ${code}\n\nThis code will expire in 15 minutes. If you didn't request this code, please ignore this email.`
    })

    if (emailError) {
      console.error('Error sending email:', emailError)
      throw new Error('Failed to send verification email')
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Verification code sent successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Send verification code error:', error)
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