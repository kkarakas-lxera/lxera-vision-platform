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
      companySize, 
      source,
      stepCompleted = 1,
      utmSource,
      utmMedium,
      utmCampaign 
    } = await req.json()

    // Validate required fields
    if (!email || !source) {
      return new Response(
        JSON.stringify({ error: 'Email and source are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Check if demo capture already exists
    const { data: existingCapture } = await supabase
      .from('demo_captures')
      .select('*')
      .eq('email', email)
      .single()

    let demoCapture

    if (existingCapture) {
      // Update existing capture with new data
      const updateData: any = {
        updated_at: new Date().toISOString(),
        step_completed: Math.max(existingCapture.step_completed, stepCompleted)
      }

      // Only update fields if they have values
      if (name) updateData.name = name
      if (company) updateData.company = company
      if (companySize) updateData.company_size = companySize
      if (utmSource) updateData.utm_source = utmSource
      if (utmMedium) updateData.utm_medium = utmMedium
      if (utmCampaign) updateData.utm_campaign = utmCampaign

      const { data: updatedCapture, error: updateError } = await supabase
        .from('demo_captures')
        .update(updateData)
        .eq('id', existingCapture.id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating demo capture:', updateError)
        throw updateError
      }

      demoCapture = updatedCapture
    } else {
      // Create new demo capture
      const { data: newCapture, error: insertError } = await supabase
        .from('demo_captures')
        .insert({
          email,
          name: name || null,
          company: company || null,
          company_size: companySize || null,
          source,
          step_completed: stepCompleted,
          utm_source: utmSource || null,
          utm_medium: utmMedium || null,
          utm_campaign: utmCampaign || null,
          status: 'captured'
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error creating demo capture:', insertError)
        throw insertError
      }

      demoCapture = newCapture
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: demoCapture,
        message: existingCapture ? 'Demo capture updated' : 'Demo capture created'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in capture-demo function:', error)
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