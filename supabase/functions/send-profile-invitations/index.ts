import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

    // Get employee details
    const { data: employees, error: employeesError } = await supabaseAdmin
      .from('st_users')
      .select('id, email, full_name')
      .in('id', employee_ids)

    if (employeesError) throw employeesError

    const results = []
    const errors = []

    for (const employee of employees) {
      try {
        // Generate invitation token
        const invitationToken = crypto.randomUUID()
        
        // Create or update invitation record
        const { error: inviteError } = await supabaseAdmin
          .from('profile_invitations')
          .upsert({
            employee_id: employee.id,
            invitation_token: invitationToken,
            sent_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
            reminder_count: 0
          }, {
            onConflict: 'employee_id'
          })

        if (inviteError) throw inviteError

        // Send email via Resend (or your email service)
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'LXERA Platform <noreply@lxera.ai>',
            to: employee.email,
            subject: `Complete your profile at ${company.name}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Welcome to ${company.name}!</h2>
                <p>Hi ${employee.full_name},</p>
                <p>You've been invited to complete your professional profile and upload your CV to help us understand your skills and create personalized learning paths.</p>
                <div style="margin: 30px 0;">
                  <a href="${Deno.env.get('PUBLIC_SITE_URL')}/learner/profile?token=${invitationToken}" 
                     style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    Complete Your Profile
                  </a>
                </div>
                <p>This link will expire in 30 days.</p>
                <p>What you'll need to do:</p>
                <ul>
                  <li>Upload your CV/Resume</li>
                  <li>Review and update your profile information</li>
                  <li>Confirm your skills and experience</li>
                </ul>
                <p>If you have any questions, please contact your HR department.</p>
                <p>Best regards,<br>The ${company.name} Team</p>
              </div>
            `
          })
        })

        if (!emailResponse.ok) {
          const errorText = await emailResponse.text()
          throw new Error(`Email sending failed: ${errorText}`)
        }

        results.push({
          employee_id: employee.id,
          email: employee.email,
          success: true
        })
      } catch (error) {
        console.error(`Failed to send invitation to ${employee.email}:`, error)
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
    console.error('Error in send-profile-invitations:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})