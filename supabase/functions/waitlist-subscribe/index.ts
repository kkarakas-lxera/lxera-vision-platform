import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WaitlistFormData {
  // From WaitingListForm (detailed)
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  role?: string;
  teamSize?: string;
  interests?: string[];
  
  // From WaitlistModal (simple)
  fullName?: string;
  interest?: string;
  
  // New onboarding fields
  roleOther?: string;
  useCases?: string[];
  useCasesOther?: string;
  heardAbout?: string;
  onboardingCompleted?: boolean;
  
  // B2C Questionnaire data
  variant?: 'enterprise' | 'personal';
  questionnaireData?: {
    career_stage?: string;
    industry?: string;
    industry_other?: string;
    current_company?: string;
    location_country?: string;
    skills_interested?: string[];
    skills_other?: string;
    motivation?: string;
    motivation_other?: string;
  };
  
  // Common fields
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

  // Detect variant based on source patterns
  const detectVariant = (source: string): 'enterprise' | 'personal' => {
    const personalIndicators = [
      'personal',
      'b2c',
      'individual',
      'career',
      '-personal-',
      '/personal/'
    ];
    
    const sourceStr = (source || '').toLowerCase();
    return personalIndicators.some(indicator => 
      sourceStr.includes(indicator)
    ) ? 'personal' : 'enterprise';
  };

  const requestId = crypto.randomUUID();
  
  try {
    const formData: WaitlistFormData = await req.json();

    // Validate required fields
    if (!formData.email) {
      throw new Error('Email is required');
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Normalize data from both form types
    let firstName = formData.firstName;
    let lastName = formData.lastName;
    let fullName = formData.fullName;

    // If we have fullName but not firstName/lastName, split it
    if (formData.fullName && !firstName && !lastName) {
      const nameParts = formData.fullName.trim().split(' ');
      firstName = nameParts[0];
      lastName = nameParts.slice(1).join(' ') || '';
      fullName = formData.fullName;
    } 
    // If we have firstName/lastName but not fullName, combine them
    else if (firstName && lastName && !fullName) {
      fullName = `${firstName} ${lastName}`.trim();
    }

    // Check if contact already exists
    const { data: existingContact } = await supabase
      .from('waitlist_contacts')
      .select('id, brevo_contact_id, brevo_synced_at')
      .eq('email', formData.email)
      .single();

    let contactId;
    let brevoContactId = null;
    
    // Determine variant once for the entire request
    const variant = formData.variant || detectVariant(formData.source);

    if (existingContact) {
      contactId = existingContact.id;
      brevoContactId = existingContact.brevo_contact_id;
      
      // Update existing contact with any new information
      const updateData: any = {
        source: formData.source || 'website',
        utm_source: formData.utm_source,
        utm_medium: formData.utm_medium,
        utm_campaign: formData.utm_campaign,
        variant: variant,
      };

      // Only update name fields if we have better data
      if (firstName) updateData.first_name = firstName;
      if (lastName) updateData.last_name = lastName;
      if (fullName) updateData.full_name = fullName;
      if (formData.company) updateData.company = formData.company;
      if (formData.role) updateData.role = formData.role;
      if (formData.teamSize) updateData.team_size = formData.teamSize;
      if (formData.interest) updateData.interest = formData.interest;
      if (formData.interests && formData.interests.length > 0) updateData.interest = formData.interests.join(', ');
      
      // Update onboarding fields
      if (formData.roleOther) updateData.role_other = formData.roleOther;
      if (formData.useCases && formData.useCases.length > 0) updateData.use_cases = formData.useCases;
      if (formData.useCasesOther) updateData.use_cases_other = formData.useCasesOther;
      if (formData.heardAbout) updateData.heard_about = formData.heardAbout;
      if (formData.onboardingCompleted !== undefined) {
        updateData.onboarding_completed = formData.onboardingCompleted;
        if (formData.onboardingCompleted) {
          updateData.onboarding_completed_at = new Date().toISOString();
        }
      }
      
      // Update questionnaire data if provided
      if (formData.questionnaireData) {
        updateData.questionnaire_data = formData.questionnaireData;
      }

      const { error: updateError } = await supabase
        .from('waitlist_contacts')
        .update(updateData)
        .eq('id', contactId);

      if (updateError) {
        console.error('Failed to update existing contact:', updateError);
        throw new Error(`Failed to update contact: ${updateError.message}`);
      }
    } else {
      // Create new contact
      const { data: newContact, error: contactError } = await supabase
        .from('waitlist_contacts')
        .insert({
          email: formData.email,
          first_name: firstName,
          last_name: lastName,
          full_name: fullName,
          company: formData.company,
          role: formData.role,
          team_size: formData.teamSize,
          interest: formData.interest || (formData.interests && formData.interests.length > 0 ? formData.interests.join(', ') : null),
          source: formData.source || 'website',
          utm_source: formData.utm_source,
          utm_medium: formData.utm_medium,
          utm_campaign: formData.utm_campaign,
          variant: variant,
          questionnaire_data: formData.questionnaireData || {},
          brevo_sync_status: 'pending',
          // New onboarding fields
          role_other: formData.roleOther,
          use_cases: formData.useCases || [],
          use_cases_other: formData.useCasesOther,
          heard_about: formData.heardAbout,
          onboarding_completed: formData.onboardingCompleted || false,
          onboarding_completed_at: formData.onboardingCompleted ? new Date().toISOString() : null
        })
        .select()
        .single();

      if (contactError) throw contactError;
      contactId = newContact.id;
    }

    
    // Get appropriate Brevo list ID
    const getBrevoListId = (variant: string): number[] => {
      switch (variant) {
        case 'personal':
          return [4]; // B2C Personal List
        case 'enterprise':
        default:
          return [3]; // B2B Enterprise List
      }
    };

    // Sync to Brevo
    const brevoApiKey = Deno.env.get('BREVO_API_KEY');
    if (!brevoApiKey) {
      console.error('BREVO_API_KEY not configured');
    } else {
      try {
        // Prepare Brevo contact data with variant info and questionnaire data
        const brevoAttributes: any = {
          FIRSTNAME: firstName || '',
          LASTNAME: lastName || '',
          SOURCE: formData.source || 'website',
          VARIANT: variant
        };
        
        // Add questionnaire data to Brevo attributes if available
        if (formData.questionnaireData) {
          const q = formData.questionnaireData;
          if (q.career_stage) brevoAttributes.CAREER_STAGE = q.career_stage;
          if (q.industry) brevoAttributes.INDUSTRY = q.industry;
          if (q.current_company) brevoAttributes.COMPANY = q.current_company;
          if (q.location_country) brevoAttributes.COUNTRY = q.location_country;
          if (q.skills_interested) brevoAttributes.SKILLS_INTERESTED = q.skills_interested.join(', ');
          if (q.motivation) brevoAttributes.MOTIVATION = q.motivation;
        }
        
        const brevoContact: any = {
          email: formData.email,
          attributes: brevoAttributes,
          listIds: getBrevoListId(variant),
          updateEnabled: true // Handle duplicates
        };

        // Remove empty attributes
        Object.keys(brevoContact.attributes).forEach(key => {
          if (!brevoContact.attributes[key]) {
            delete brevoContact.attributes[key];
          }
        });

        const brevoResponse = await fetch('https://api.brevo.com/v3/contacts', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'api-key': brevoApiKey,
            'content-type': 'application/json'
          },
          body: JSON.stringify(brevoContact)
        });

        if (brevoResponse.ok) {
          if (brevoResponse.status === 201) {
            // New contact created - response has JSON body with contact ID
            const brevoData = await brevoResponse.json();
            brevoContactId = brevoData.id;
            console.log(`New contact created in Brevo with ID: ${brevoContactId}`);
          } else if (brevoResponse.status === 204) {
            // Contact updated - no response body, keep existing Brevo ID
            brevoContactId = existingContact?.brevo_contact_id || null;
            console.log(`Contact updated in Brevo with existing ID: ${brevoContactId}`);
          } else {
            // Other success status - try to parse JSON if present
            const responseText = await brevoResponse.text();
            if (responseText) {
              try {
                const brevoData = JSON.parse(responseText);
                brevoContactId = brevoData.id || brevoContactId;
              } catch (parseError) {
                console.log(`Brevo returned status ${brevoResponse.status} with non-JSON response: ${responseText}`);
              }
            }
          }

          // Update Supabase with Brevo sync info only if we have a contact ID
          if (brevoContactId) {
            await supabase
              .from('waitlist_contacts')
              .update({
                brevo_contact_id: brevoContactId,
                brevo_synced_at: new Date().toISOString(),
                brevo_sync_status: 'synced'
              })
              .eq('id', contactId);

            console.log(`Contact synced to Brevo successfully with ID: ${brevoContactId}`);
          } else {
            console.warn('Brevo sync succeeded but no contact ID available');
            await supabase
              .from('waitlist_contacts')
              .update({
                brevo_synced_at: new Date().toISOString(),
                brevo_sync_status: 'synced_no_id'
              })
              .eq('id', contactId);
          }
        } else {
          const errorData = await brevoResponse.text();
          console.error('Brevo sync failed:', errorData);
          
          // Update sync status to failed
          await supabase
            .from('waitlist_contacts')
            .update({
              brevo_sync_status: 'failed'
            })
            .eq('id', contactId);
        }
      } catch (brevoError) {
        console.error('Brevo sync error:', brevoError);
        
        // Update sync status to failed
        await supabase
          .from('waitlist_contacts')
          .update({
            brevo_sync_status: 'failed'
          })
          .eq('id', contactId);
      }
    }

    // Send confirmation email
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured - confirmation email not sent');
    } else {
      try {
        // Create variant-specific email content
        const getEmailContent = (variant: string, name: string, email: string) => {
          const isPersonal = variant === 'personal';
          
          const subject = isPersonal 
            ? "You're on the list! LXERA early access confirmed" 
            : "Your LXERA early access request has been received";
          
          const greeting = `Hi ${name || 'there'},`;
          
          const mainMessage = isPersonal
            ? "Thank you for submitting your request for early access to LXERA. We've successfully received your information and you're now on our priority list for personal learning transformation."
            : "Thank you for submitting your request for early access to LXERA. We've successfully received your information and you're now on our priority list for enterprise learning solutions.";
            
          const anticipationMessage = isPersonal
            ? "Our team has been preparing something monumental - a learning platform that will transform how individuals approach skill development and personal growth. We're putting the finishing touches on an experience that we believe will revolutionize your learning journey."
            : "Our team has been preparing something monumental - a learning platform that will transform how organizations approach skill development and team growth. We're putting the finishing touches on an enterprise-grade experience that we believe will revolutionize learning.";

          const htmlContent = `
            <div style="font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #EFEFE3 0%, rgba(122, 229, 198, 0.1) 50%, #EFEFE3 100%); padding: 40px 20px;">
                <div style="background: white; border-radius: 16px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1); overflow: hidden;">
                  <!-- Header -->
                  <div style="text-align: center; padding: 40px 40px 30px; border-bottom: 1px solid #f0f0f0;">
                    <a href="https://www.lxera.ai" style="display: inline-block; text-decoration: none;">
                      <img src="https://www.lxera.ai/lovable-uploads/ed8138a6-1489-4140-8b44-0003698e8154.png" alt="LXERA" style="height: 60px; margin-bottom: 15px; display: block; margin-left: auto; margin-right: auto;">
                    </a>
                    <div style="color: #666; font-size: 14px; font-weight: 500; letter-spacing: 0.5px;">Beyond Learning</div>
                  </div>
                  
                  <!-- Content -->
                  <div style="padding: 40px;">
                    <h1 style="font-size: 28px; font-weight: 700; color: #191919; margin: 0 0 20px; text-align: center;">Welcome to LXERA Early Access!</h1>
                    <p style="color: #666; font-size: 16px; margin-bottom: 30px; text-align: center; line-height: 1.6;">
                      ${greeting}
                    </p>
                    
                    <div style="background: #EFEFE3; padding: 20px; border-radius: 8px; margin: 20px 0;">
                      <p style="color: #191919; font-size: 15px; margin: 0 0 15px; line-height: 1.6; font-weight: 600;">
                        ✅ Your request has been confirmed
                      </p>
                      <p style="color: #666; font-size: 15px; margin: 0; line-height: 1.6;">
                        ${mainMessage}
                      </p>
                    </div>
                    
                    <div style="background: #f8f9fa; border-radius: 8px; padding: 25px; margin: 25px 0;">
                      <h3 style="color: #191919; font-size: 18px; margin: 0 0 15px; text-align: center;">🚀 Something Monumental is Coming</h3>
                      <p style="color: #666; font-size: 15px; margin: 0; line-height: 1.6; text-align: center;">
                        ${anticipationMessage}
                      </p>
                    </div>
                    
                    <div style="background: #7AE5C6; color: #191919; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
                      <h4 style="margin: 0 0 10px; font-size: 16px; font-weight: 600;">📬 What's Next?</h4>
                      <p style="margin: 0; font-size: 14px; line-height: 1.5;">
                        We'll be in touch with you shortly about granting you access as an early-stage user. Please stay tuned for updates on your exclusive early access.
                      </p>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                      <p style="color: #666; font-size: 15px; margin: 0 0 20px;">
                        Meanwhile, if you have any questions or want to learn more about what we're building, please don't hesitate to get in touch - we'd love to hear from you.
                      </p>
                      <a href="mailto:hello@lxera.ai" style="display: inline-block; background: #191919; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                        Contact Us
                      </a>
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

          return { subject, htmlContent };
        };

        const { subject, htmlContent } = getEmailContent(variant, fullName, formData.email);

        // Send confirmation email via Resend
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'LXERA Team <hello@lxera.ai>',
            to: formData.email,
            subject: subject,
            html: htmlContent,
            tags: [
              { name: 'category', value: 'waitlist_confirmation' },
              { name: 'variant', value: variant }
            ]
          }),
        });

        if (emailResponse.ok) {
          console.log(`Confirmation email sent successfully to ${formData.email}`);
        } else {
          const errorData = await emailResponse.text();
          console.error('Failed to send confirmation email:', errorData);
          // Don't fail the whole request if email fails
        }

      } catch (emailError) {
        console.error('Confirmation email error:', emailError);
        // Don't fail the whole request if email fails
      }
    }

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true,
        message: existingContact ? 'Contact updated successfully' : 'Welcome to the waitlist!',
        contactId,
        brevoSynced: brevoContactId ? true : false
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Waitlist subscription error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Failed to join waitlist. Please try again.'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 500
      }
    );
  }
});