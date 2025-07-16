import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface HRISEmployee {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  department?: string;
  startDate?: string;
  manager?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { companyId, connectionId, provider } = await req.json()

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get HRIS connection details
    const { data: connection, error: connError } = await supabaseClient
      .from('hris_connections')
      .select('*')
      .eq('company_id', companyId)
      .single()

    if (connError || !connection) {
      throw new Error('HRIS connection not found')
    }

    // In production, this would call the actual HRIS API
    // For now, returning mock data
    const mockEmployees: HRISEmployee[] = [
      {
        id: 'hris-001',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        jobTitle: 'Software Engineer',
        department: 'Engineering',
        startDate: '2023-01-15'
      },
      {
        id: 'hris-002',
        email: 'jane.smith@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        jobTitle: 'Product Manager',
        department: 'Product',
        startDate: '2022-09-01'
      }
    ]

    // Process each employee
    let created = 0
    let updated = 0
    const errors: any[] = []

    for (const hrisEmp of mockEmployees) {
      try {
        // Check if user exists
        const { data: existingUser } = await supabaseClient
          .from('users')
          .select('id')
          .eq('email', hrisEmp.email)
          .single()

        if (existingUser) {
          // Update existing employee
          const { error: updateError } = await supabaseClient
            .from('employees')
            .update({
              hris_id: hrisEmp.id,
              hris_data: hrisEmp,
              position: hrisEmp.jobTitle
            })
            .eq('user_id', existingUser.id)
            .eq('company_id', companyId)

          if (updateError) throw updateError
          updated++
        } else {
          // Create new user and employee
          const { data: newUser, error: userError } = await supabaseClient.auth.admin.createUser({
            email: hrisEmp.email,
            password: Math.random().toString(36).slice(-12), // Temporary password
            email_confirm: true,
            user_metadata: {
              full_name: `${hrisEmp.firstName} ${hrisEmp.lastName}`
            }
          })

          if (userError) throw userError

          // Create user profile
          const { error: profileError } = await supabaseClient
            .from('users')
            .insert({
              id: newUser.user.id,
              email: hrisEmp.email,
              full_name: `${hrisEmp.firstName} ${hrisEmp.lastName}`,
              role: 'learner',
              company_id: companyId
            })

          if (profileError) throw profileError

          // Create employee record
          const { error: empError } = await supabaseClient
            .from('employees')
            .insert({
              user_id: newUser.user.id,
              company_id: companyId,
              position: hrisEmp.jobTitle,
              hris_id: hrisEmp.id,
              hris_data: hrisEmp
            })

          if (empError) throw empError
          created++
        }
      } catch (err) {
        errors.push({
          employee: hrisEmp.email,
          error: err.message
        })
      }
    }

    // Update sync log
    const { error: logError } = await supabaseClient
      .from('hris_sync_logs')
      .update({
        status: 'completed',
        employees_synced: mockEmployees.length,
        employees_created: created,
        employees_updated: updated,
        errors: errors.length > 0 ? errors : null,
        completed_at: new Date().toISOString()
      })
      .eq('company_id', companyId)
      .eq('status', 'started')
      .order('started_at', { ascending: false })
      .limit(1)

    return new Response(
      JSON.stringify({
        success: true,
        synced: mockEmployees.length,
        created,
        updated,
        errors
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})