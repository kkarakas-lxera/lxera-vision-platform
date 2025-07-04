import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'
import { corsHeaders } from '../_shared/cors.ts'

interface ContactSalesPayload {
  firstName: string
  lastName: string
  email: string
  company: string
  jobTitle?: string
  phone?: string
  companySize?: string
  country?: string
  message?: string
  budgetRange?: string
  timeline?: string
  useCase?: string
  source?: string
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const payload: ContactSalesPayload = await req.json()

    // Validate required fields
    if (!payload.firstName || !payload.lastName || !payload.email || !payload.company) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Insert contact sales ticket using service role key (bypasses RLS)
    const { data, error } = await supabase
      .from('tickets')
      .insert({
        first_name: payload.firstName,
        last_name: payload.lastName,
        email: payload.email,
        company: payload.company,
        job_title: payload.jobTitle || null,
        phone: payload.phone || null,
        company_size: payload.companySize || null,
        country: payload.country || null,
        message: payload.message || null,
        source: payload.source || 'Website',
        ticket_type: 'contact_sales',
        budget_range: payload.budgetRange || null,
        timeline: payload.timeline || null,
        use_case: payload.useCase || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error inserting contact sales ticket:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to submit contact sales request' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})