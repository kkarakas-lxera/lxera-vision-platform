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

    if (existingContact) {
      contactId = existingContact.id;
      brevoContactId = existingContact.brevo_contact_id;
      
      // Update existing contact with any new information
      const updateData: any = {
        source: formData.source || 'website',
        utm_source: formData.utm_source,
        utm_medium: formData.utm_medium,
        utm_campaign: formData.utm_campaign,
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

    const variant = detectVariant(formData.source);
    
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
        // Prepare Brevo contact data with variant info
        const brevoContact: any = {
          email: formData.email,
          attributes: {
            FIRSTNAME: firstName || '',
            LASTNAME: lastName || '',
            SOURCE: formData.source || 'website',
            VARIANT: variant
          },
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