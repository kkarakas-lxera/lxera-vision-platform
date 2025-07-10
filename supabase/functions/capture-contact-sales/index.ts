import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

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