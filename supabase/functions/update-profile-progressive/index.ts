import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { Resend } from 'https://esm.sh/resend@2.0.0';

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    );

    const { leadId, field, value, allData } = await req.json();

    if (!leadId || !field || !value) {
      throw new Error('Missing required fields');
    }

    // Map frontend field names to database column names
    const fieldMapping: Record<string, string> = {
      name: 'name',
      company: 'company',
      role: 'role',
      useCase: 'use_case',
      heardAbout: 'heard_about',
    };

    const dbField = fieldMapping[field];
    if (!dbField) {
      throw new Error('Invalid field name');
    }

    // Update the specific field
    const updateData: Record<string, string | Date> = {
      [dbField]: value,
    };

    // If updating the last field (heardAbout), also update status and completion timestamp
    if (field === 'heardAbout' && allData) {
      // Update all fields on final submission
      updateData.name = allData.name;
      updateData.company = allData.company;
      updateData.role = allData.role;
      updateData.use_case = allData.useCase;
      updateData.heard_about = allData.heardAbout;
      updateData.status = 'profile_completed';
      updateData.profile_completed_at = new Date().toISOString();
    }

    const { data, error } = await supabaseClient
      .from('early_access_leads')
      .update(updateData)
      .eq('id', leadId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // If profile is complete, assign waitlist position and send welcome email
    if (field === 'heardAbout' && data) {
      // Assign waitlist position
      const { data: positionData, error: positionError } = await supabaseClient
        .rpc('assign_waitlist_position', { lead_id: leadId });

      if (positionError) {
        console.error('Error assigning waitlist position:', positionError);
      } else if (positionData) {
        data.waitlist_position = positionData;
      }

      // Send welcome email
      try {
        const resendApiKey = Deno.env.get('RESEND_API_KEY');
        if (resendApiKey) {
          const resend = new Resend(resendApiKey);
          
          const { data: leadData } = await supabaseClient
            .from('early_access_leads')
            .select('*')
            .eq('id', leadId)
            .single();

          if (leadData) {
            // Calculate progress metrics for the email
            const { count: totalLeads } = await supabaseClient
              .from('early_access_leads')
              .select('*', { count: 'exact', head: true })
              .in('status', ['waitlisted', 'profile_completed', 'invited', 'converted']);

            const progressPercentage = leadData.waitlist_position && totalLeads
              ? Math.round(((totalLeads - leadData.waitlist_position + 1) / totalLeads) * 100)
              : 0;

            // Send welcome email
            await resend.emails.send({
              from: 'LXERA <hello@lxera.ai>',
              to: leadData.email,
              subject: `Welcome to LXERA Early Access - You're #${leadData.waitlist_position}!`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <div style="background-color: #f8f9fa; padding: 40px; border-radius: 10px;">
                    <h1 style="color: #333; text-align: center; margin-bottom: 30px;">Welcome to LXERA Early Access!</h1>
                    
                    <p style="font-size: 16px; color: #555; line-height: 1.6;">Hi ${leadData.name || 'there'},</p>
                    
                    <p style="font-size: 16px; color: #555; line-height: 1.6;">
                      Congratulations! You've successfully joined our early access waitlist. 
                      We're excited to have you as part of our journey to revolutionize L&D with AI.
                    </p>
                    
                    <div style="background-color: #B1B973; color: white; padding: 30px; border-radius: 8px; margin: 30px 0; text-align: center;">
                      <h2 style="margin: 0; font-size: 24px;">Your Position</h2>
                      <p style="font-size: 48px; font-weight: bold; margin: 15px 0;">#${leadData.waitlist_position}</p>
                      <p style="margin: 0; font-size: 14px;">of ${totalLeads} applicants (top ${progressPercentage}%)</p>
                    </div>
                    
                    <div style="background-color: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
                      <h3 style="color: #333; margin-bottom: 15px;">Your Profile Summary:</h3>
                      <ul style="color: #555; line-height: 1.8; list-style: none; padding: 0;">
                        <li><strong>Company:</strong> ${leadData.company || 'Not specified'}</li>
                        <li><strong>Role:</strong> ${leadData.role ? leadData.role.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) : 'Not specified'}</li>
                        <li><strong>Focus Area:</strong> ${leadData.use_case ? leadData.use_case.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) : 'Not specified'}</li>
                        <li><strong>Source:</strong> ${leadData.heard_about ? leadData.heard_about.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) : 'Not specified'}</li>
                      </ul>
                    </div>
                    
                    <h3 style="color: #333; margin-top: 30px;">What's Next?</h3>
                    <ol style="color: #555; line-height: 1.8;">
                      <li><strong>Check your dashboard:</strong> Visit your personalized waiting room to track your position and access exclusive resources.</li>
                      <li><strong>Join our community:</strong> Connect with other L&D professionals in our Slack workspace.</li>
                      <li><strong>Stay tuned:</strong> We'll keep you updated on your progress and share exclusive content.</li>
                    </ol>
                    
                    <div style="text-align: center; margin: 40px 0;">
                      <a href="https://lxera.ai/waiting-room?email=${encodeURIComponent(leadData.email)}" 
                         style="background-color: #B1B973; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                        Visit Your Dashboard
                      </a>
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 40px 0;">
                    
                    <p style="font-size: 14px; color: #888; text-align: center;">
                      © 2025 LXERA. All rights reserved.<br>
                      <a href="#" style="color: #888; text-decoration: underline;">Unsubscribe</a> | 
                      <a href="#" style="color: #888; text-decoration: underline;">Update Preferences</a>
                    </p>
                  </div>
                </div>
              `,
              text: `Welcome to LXERA Early Access!\n\nHi ${leadData.name || 'there'},\n\nCongratulations! You've successfully joined our early access waitlist at position #${leadData.waitlist_position}.\n\nVisit your dashboard: https://lxera.ai/waiting-room?email=${encodeURIComponent(leadData.email)}\n\n© 2025 LXERA. All rights reserved.`
            });

            // Log email sent
            await supabaseClient
              .from('lead_email_log')
              .insert({
                lead_id: leadId,
                email_type: 'welcome',
                subject: `Welcome to LXERA Early Access - You're #${leadData.waitlist_position}!`
              });

            // Set email preferences to all opted-in
            await supabaseClient
              .from('lead_email_preferences')
              .upsert({
                lead_id: leadId,
                welcome: true,
                waitlist_update: true,
                weekly_content: true,
                position_improved: true,
                product_updates: true
              });
          }
        }
      } catch (emailError) {
        console.error('Error sending welcome email:', emailError);
        // Don't fail the whole operation if email fails
      }
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in update-profile-progressive:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});