import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from "https://esm.sh/resend@2.0.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { employee_ids, company_id } = await req.json()

    if (!employee_ids || !Array.isArray(employee_ids) || employee_ids.length === 0) {
      throw new Error('Employee IDs are required')
    }

    if (!company_id) {
      throw new Error('Company ID is required')
    }

    // Create Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get company details
    const { data: company, error: companyError } = await supabaseAdmin
      .from('companies')
      .select('name')
      .eq('id', company_id)
      .single()

    if (companyError) throw companyError

    // Initialize Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY is not configured')
    }
    
    const resend = new Resend(resendApiKey)

    // Get PUBLIC_SITE_URL with fallback
    const siteUrl = Deno.env.get('PUBLIC_SITE_URL') || 'https://www.lxera.ai'
    console.log('Using site URL:', siteUrl)

    // Get employee details with user information and invitation
    const { data: employeeData, error: employeesError } = await supabaseAdmin
      .from('employees')
      .select(`
        id,
        users!inner(
          id,
          email,
          full_name
        ),
        profile_invitations!inner(
          invitation_token,
          sent_at,
          reminder_count,
          last_reminder_at
        )
      `)
      .in('id', employee_ids)

    if (employeesError) throw employeesError

    console.log(`Found ${employeeData?.length || 0} employees to reinvite`)

    // Transform data to match expected format
    const employees = employeeData?.map(emp => ({
      id: emp.id,
      email: emp.users.email,
      full_name: emp.users.full_name,
      user_id: emp.users.id,
      invitation_token: emp.profile_invitations[0]?.invitation_token,
      sent_at: emp.profile_invitations[0]?.sent_at,
      reminder_count: emp.profile_invitations[0]?.reminder_count || 0,
      last_reminder_at: emp.profile_invitations[0]?.last_reminder_at
    })) || []

    const results = []
    const errors = []

    for (const employee of employees) {
      try {
        // Generate new invitation token for reinvite
        const newInvitationToken = crypto.randomUUID()
        
        // Update invitation with new token and reset reminder count
        const { error: updateError } = await supabaseAdmin
          .from('profile_invitations')
          .update({
            invitation_token: newInvitationToken,
            sent_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
            reminder_count: 0,
            last_reminder_at: null
          })
          .eq('employee_id', employee.id)

        if (updateError) throw updateError

        // Calculate days since first invitation
        const daysSinceSent = employee.sent_at 
          ? Math.floor((Date.now() - new Date(employee.sent_at).getTime()) / (1000 * 60 * 60 * 24))
          : 0

        // Send reinvite email via Resend SDK
        const { data: emailData, error: emailError } = await resend.emails.send({
          from: 'LXERA Team <hello@lxera.ai>',
          to: employee.email,
          subject: `🔄 New invitation: Complete your profile at ${company.name}`,
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
                    <h1 style="font-size: 28px; font-weight: 700; color: #191919; margin: 0 0 20px; text-align: center;">Your Profile is Still Waiting!</h1>
                    <p style="color: #666; font-size: 16px; margin-bottom: 30px; text-align: center; line-height: 1.6;">
                      Hi ${employee.full_name}, we noticed you haven't completed your profile yet.
                    </p>
                    
                    <div style="background: #EFEFE3; padding: 20px; border-radius: 8px; margin: 20px 0;">
                      <p style="color: #191919; font-size: 15px; margin: 0; line-height: 1.6;">
                        We've generated a fresh invitation link for you. Your previous link has expired after ${daysSinceSent} days. 
                        Don't worry - you can start right where you left off!
                      </p>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${siteUrl}/signup/invitation?token=${newInvitationToken}" 
                         style="display: inline-block; background: #191919; color: white; padding: 16px 40px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                        Complete My Profile Now
                      </a>
                      <p style="margin-top: 15px; color: #999; font-size: 14px;">⏱️ This new link expires in 30 days</p>
                    </div>

                    <h3 style="color: #191919; margin-top: 40px;">Why complete your profile?</h3>
                    <ul style="list-style: none; padding: 0; margin: 20px 0;">
                      <li style="padding: 12px 0; color: #666; font-size: 15px;">
                        🎯 Get personalized learning recommendations
                      </li>
                      <li style="padding: 12px 0; color: #666; font-size: 15px;">
                        📊 Track your skills and career progress
                      </li>
                      <li style="padding: 12px 0; color: #666; font-size: 15px;">
                        🚀 Access tailored courses and development paths
                      </li>
                    </ul>
                    
                    <div style="background: #7AE5C6; color: #191919; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0; font-size: 14px;">
                      💡 Pro tip: It only takes 5-10 minutes to complete your profile!
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
          tags: [
            { name: 'category', value: 'profile_reinvite' },
            { name: 'company_id', value: company_id },
            { name: 'employee_id', value: employee.id }
          ]
        })

        if (emailError) {
          console.error('Resend error:', emailError)
          throw new Error(`Email sending failed: ${emailError.message}`)
        }

        console.log(`Reinvite email sent successfully to ${employee.email} with ID: ${emailData?.id}`)

        // Store the Resend email ID for webhook tracking
        if (emailData?.id) {
          const { error: trackingError } = await supabaseAdmin
            .from('profile_invitations')
            .update({
              resend_email_id: emailData.id
            })
            .eq('employee_id', employee.id)

          if (trackingError) {
            console.error('Failed to store email ID for tracking:', trackingError)
          }
        }

        results.push({
          employee_id: employee.id,
          email: employee.email,
          success: true,
          resend_email_id: emailData?.id
        })
      } catch (error) {
        console.error(`Failed to send reinvite to ${employee.email}:`, error)
        errors.push({
          employee_id: employee.id,
          email: employee.email,
          error: error.message
        })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        sent: results.length,
        failed: errors.length,
        results,
        errors
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in send-profile-reinvite:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString(),
        stack: error.stack
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})