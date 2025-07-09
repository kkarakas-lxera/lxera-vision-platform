import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('Webhook received:', req.method, req.url);
  
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    
    // Log all headers for debugging
    console.log('Headers received:', Object.fromEntries(req.headers.entries()));
    console.log('Tally webhook payload:', JSON.stringify(payload, null, 2));
    
    // Temporarily skip secret validation to debug
    // TODO: Re-enable after confirming header format

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, eventType, formId } = payload;

    if (eventType !== 'FORM_RESPONSE') {
      return new Response(
        JSON.stringify({ success: true, message: 'Event type not handled' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract form data from Tally's structure
    const fields = data.fields || [];
    const fieldMap: any = {};
    
    // Convert array of fields to a map for easier access
    fields.forEach((field: any) => {
      if (field.type === 'MULTIPLE_CHOICE' && Array.isArray(field.value)) {
        // For multiple choice, get the text of the selected option
        const selectedOption = field.options?.find((opt: any) => field.value.includes(opt.id));
        fieldMap[field.label.toLowerCase().replace(/[^a-z0-9]/g, '_')] = selectedOption?.text || field.value[0];
      } else {
        fieldMap[field.label.toLowerCase().replace(/[^a-z0-9]/g, '_')] = field.value;
      }
    });
    
    const email = fieldMap.email;

    if (!email) {
      throw new Error('Email is required');
    }

    // Handle Early Access form (w2dO6L)
    if (formId === 'w2dO6L') {
      console.log('Processing Early Access form for email:', email);
      
      // First check if lead exists
      const { data: existingLead, error: checkError } = await supabase
        .from('early_access_leads')
        .select('id')
        .eq('email', email)
        .single();
        
      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 is "not found" which is expected for new leads
        console.error('Error checking existing lead:', checkError);
      }

      if (existingLead) {
        // Update existing lead
        const { error: updateError } = await supabase
          .from('early_access_leads')
          .update({
            name: fieldMap.what_s_your_name_,
            company: fieldMap.where_do_you_work_,
            role: fieldMap.i_m_responsible_for___,
            use_case: fieldMap.i_need_help_with___,
            status: 'profile_completed',
            onboarded_at: new Date().toISOString()
          })
          .eq('email', email);

        if (updateError) throw updateError;
      } else {
        // Create new lead
        const { error: insertError } = await supabase
          .from('early_access_leads')
          .insert({
            email,
            name: fieldMap.what_s_your_name_,
            company: fieldMap.where_do_you_work_,
            role: fieldMap.i_m_responsible_for___,
            use_case: fieldMap.i_need_help_with___,
            status: 'profile_completed',
            onboarded_at: new Date().toISOString()
          });

        if (insertError) throw insertError;
      }

      // Assign waitlist position
      const { data: positionData, error: positionError } = await supabase
        .rpc('assign_waitlist_position', { lead_email: email });
      
      if (positionError) {
        console.error('Position assignment error:', positionError);
        // Don't fail the whole webhook if position assignment fails
      }

      // Get the lead ID for logging
      const { data: leadRecord } = await supabase
        .from('early_access_leads')
        .select('id')
        .eq('email', email)
        .single();

      // Mark any active sessions as used since profile is now complete
      if (leadRecord) {
        await supabase
          .from('lead_sessions')
          .update({ used: true })
          .eq('lead_id', leadRecord.id)
          .eq('used', false);
      }

      if (leadRecord) {
        // Send welcome email
        const resendApiKey = Deno.env.get('RESEND_API_KEY');
        if (resendApiKey) {
          const resend = new Resend(resendApiKey);
          
          try {
            await resend.emails.send({
              from: 'LXERA <hello@lxera.ai>',
              to: email,
              subject: 'Welcome to LXERA Early Access! 🎉',
              html: `
                <!DOCTYPE html>
                <html>
                  <head>
                    <meta charset="utf-8">
                    <title>Welcome to LXERA</title>
                    <style>
                      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
                      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                      .header { text-align: center; margin-bottom: 30px; }
                      .logo { font-size: 28px; font-weight: bold; color: #000; }
                      .button { display: inline-block; padding: 14px 30px; background-color: #B1B973; color: #000; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
                      .position-box { background: #f8f9fa; border-radius: 12px; padding: 24px; margin: 20px 0; text-align: center; }
                      .position-number { font-size: 48px; font-weight: bold; color: #B1B973; margin: 10px 0; }
                      .section { margin: 30px 0; }
                      .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
                    </style>
                  </head>
                  <body>
                    <div class="container">
                      <div class="header">
                        <div class="logo">LXERA</div>
                      </div>
                      
                      <h2>Welcome to the future of learning, ${fieldMap.what_s_your_name_ || 'there'}! 🚀</h2>
                      
                      <p>Thank you for joining LXERA Early Access. You're now part of an exclusive group of innovators transforming how teams learn and grow.</p>
                      
                      <div class="position-box">
                        <p style="margin: 0; color: #666;">Your waitlist position</p>
                        <div class="position-number">#${positionData || 'TBD'}</div>
                      </div>
                      
                      <div class="section">
                        <h3>What happens next?</h3>
                        <ul>
                          <li><strong>Check your status anytime</strong> - Visit your personalized waiting room</li>
                          <li><strong>Jump the line</strong> - Refer 3 colleagues and move up 50 spots each</li>
                          <li><strong>Stay informed</strong> - We'll email you updates and exclusive content</li>
                          <li><strong>Get ready</strong> - We're onboarding teams weekly starting March 2025</li>
                        </ul>
                      </div>
                      
                      <div style="text-align: center;">
                        <a href="https://lxera.ai/waiting-room?email=${encodeURIComponent(email)}" class="button">View Your Waiting Room</a>
                      </div>
                      
                      <div class="section">
                        <h3>Your Profile:</h3>
                        <p style="background: #f8f9fa; padding: 16px; border-radius: 8px;">
                          <strong>Company:</strong> ${fieldMap.where_do_you_work_}<br>
                          <strong>Role:</strong> ${fieldMap.i_m_responsible_for___}<br>
                          <strong>Focus:</strong> ${fieldMap.i_need_help_with___}
                        </p>
                      </div>
                      
                      <div class="footer">
                        <p>© 2025 LXERA. All rights reserved.</p>
                        <p>You're receiving this because you signed up for early access.</p>
                      </div>
                    </div>
                  </body>
                </html>
              `,
              text: `Welcome to LXERA Early Access!

Hi ${fieldMap.what_s_your_name_ || 'there'},

Thank you for joining LXERA Early Access. You're now part of an exclusive group of innovators transforming how teams learn and grow.

Your waitlist position: #${positionData || 'TBD'}

What happens next?
- Check your status anytime in your waiting room
- Refer 3 colleagues to jump 50 spots each
- We'll send you updates and exclusive content
- We're onboarding teams weekly starting March 2025

View your waiting room: https://lxera.ai/waiting-room?email=${encodeURIComponent(email)}

Your Profile:
Company: ${fieldMap.where_do_you_work_}
Role: ${fieldMap.i_m_responsible_for___}
Focus: ${fieldMap.i_need_help_with___}

© 2025 LXERA. All rights reserved.`
            });
            
            console.log('Welcome email sent to:', email);
          } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
          }
        }
        
        // Log email
        await supabase
          .from('lead_email_log')
          .insert({
            lead_id: leadRecord.id,
            email_type: 'welcome',
            subject: 'Welcome to LXERA Early Access!'
          });
      }

      // Set up email preferences
      const emailTypes = ['welcome', 'waitlist_update', 'weekly_content', 'position_improved', 'product_updates'];
      const { data: lead } = await supabase
        .from('early_access_leads')
        .select('id')
        .eq('email', email)
        .single();

      if (lead) {
        await supabase
          .from('lead_email_preferences')
          .upsert(
            emailTypes.map(type => ({
              lead_id: lead.id,
              email_type: type,
              opted_in: true
            }))
          );
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'early_access_registered',
          waitlist_position: positionData,
          redirect: `/waiting-room?email=${encodeURIComponent(email)}`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle Demo Request form (nr924l)
    if (formId === 'nr924l') {
      // Get or create lead
      const { data: existingLead } = await supabase
        .from('early_access_leads')
        .select('id')
        .eq('email', email)
        .single();

      let leadId;
      if (existingLead) {
        leadId = existingLead.id;
      } else {
        const { data: newLead } = await supabase
          .from('early_access_leads')
          .insert({
            email,
            name: fieldMap.what_s_your_name_ || fieldMap.name || fieldMap.full_name,
            company: fieldMap.where_do_you_work_ || fieldMap.company,
            status: 'demo_requested'
          })
          .select()
          .single();
        leadId = newLead?.id;
      }

      // Create demo request record
      const { error: demoError } = await supabase
        .from('demo_requests')
        .insert({
          lead_id: leadId,
          email,
          name: fieldMap.what_s_your_name_ || fieldMap.name || fieldMap.full_name,
          company: fieldMap.where_do_you_work_ || fieldMap.company,
          job_title: fieldMap.job_title,
          phone: fieldMap.phone,
          demo_focus: fieldMap.demo_focus || fieldMap.what_would_you_like_to_see_in_the_demo,
          specific_requirements: fieldMap.specific_requirements || fieldMap.tell_us_about_your_specific_needs,
          preferred_date: fieldMap.preferred_date,
          timezone: fieldMap.timezone,
          tally_submission_id: data.responseId
        });

      if (demoError) throw demoError;

      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'demo_requested',
          redirect: '/demo-requested-success'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Unknown form ID
    return new Response(
      JSON.stringify({ 
        success: false,
        error: `Unknown form ID: ${formId}`
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Webhook error:', error);
    console.error('Error stack:', error.stack);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: error.details || error.hint || 'Unknown error'
      }),
      { 
        status: error.message?.includes('required') ? 400 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});