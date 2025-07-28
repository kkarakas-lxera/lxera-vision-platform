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
          const siteUrl = Deno.env.get('PUBLIC_SITE_URL') || 'https://www.lxera.ai';
          
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
                        <h1 style="font-size: 28px; font-weight: 700; color: #191919; margin: 0 0 20px; text-align: center;">Welcome to Early Access!</h1>
                        
                        <div style="background: #7AE5C6; color: #191919; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0;">
                          <p style="font-size: 36px; font-weight: 700; margin: 0;">You're #${leadData.waitlist_position}!</p>
                          <p style="font-size: 16px; font-weight: 500; margin: 5px 0 0;">Top ${progressPercentage}% of waitlist</p>
                        </div>
                        
                        <div style="background: #f8f8f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                          <h3 style="margin-top: 0; color: #191919;">Your Profile</h3>
                          <div style="padding: 8px 0; color: #666;">
                            <strong>Company:</strong> ${leadData.company || 'Not specified'}
                          </div>
                          <div style="padding: 8px 0; color: #666;">
                            <strong>Role:</strong> ${leadData.role ? leadData.role.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) : 'Not specified'}
                          </div>
                          <div style="padding: 8px 0; color: #666;">
                            <strong>Focus:</strong> ${leadData.use_case ? leadData.use_case.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) : 'Not specified'}
                          </div>
                        </div>
                        
                        <h3 style="color: #191919;">What's Next?</h3>
                        <ol style="color: #666; line-height: 1.8; margin: 20px 0; padding-left: 20px;">
                          <li><strong>Join your personalized waiting room</strong> - Track your position and access exclusive resources</li>
                          <li><strong>Complete your profile for priority access</strong> - Get ahead in the queue with more details</li>
                          <li><strong>Get notified when we launch</strong> - We'll keep you updated on your progress</li>
                        </ol>
                        
                        <div style="text-align: center; margin: 30px 0;">
                          <a href="${siteUrl}/login" style="display: inline-block; background: #191919; color: white; padding: 16px 40px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Access Your Waiting Room</a>
                        </div>
                        <div style="text-align: center; color: #666; font-size: 14px; margin: 10px 0;">
                          First time? You'll receive a password setup email when you click above.
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
                        <p style="color: #666; font-size: 13px; margin: 10px 0;">
                          <a href="#" style="color: #666; text-decoration: none;">Unsubscribe</a> | <a href="#" style="color: #666; text-decoration: none;">Update Preferences</a>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              `,
              text: `Welcome to LXERA Early Access!\n\nYou're #${leadData.waitlist_position}! (Top ${progressPercentage}% of waitlist)\n\nWhat's Next?\n1. Join your personalized waiting room\n2. Complete your profile for priority access\n3. Get notified when we launch\n\nAccess your waiting room: ${siteUrl}/login\n(First time? You'll receive a password setup email)\n\nBeyond Learning | www.lxera.ai\n© 2025 LXERA. All rights reserved.`
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