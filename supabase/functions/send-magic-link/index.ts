
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { createErrorResponse } from '../_shared/error-utils.ts'

interface MagicLinkRequest {
  email: string;
  employee_id?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const requestId = crypto.randomUUID()
  
  try {
    const { email, employee_id }: MagicLinkRequest = await req.json()

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Send magic link
    const { error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        redirectTo: `${Deno.env.get('SUPABASE_URL')}/auth/v1/callback?redirect_to=${encodeURIComponent('https://preview--lxera-vision-platform.lovable.app/learn')}`
      }
    })

    if (error) throw error

    return new Response(
      JSON.stringify({ message: 'Magic link sent successfully' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    return createErrorResponse(error, {
      requestId,
      functionName: 'send-magic-link'
    }, 400)
  }
})
