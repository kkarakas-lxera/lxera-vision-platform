// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// @ts-ignore
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

function cors() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors(), 'Content-Type': 'application/json' } })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors() })
  try {
    // @ts-ignore
    const supabaseUrl = (globalThis as any).Deno?.env.get('SUPABASE_URL')!
    // @ts-ignore
    const serviceKey = (globalThis as any).Deno?.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, serviceKey)

    const body = await req.json().catch(() => ({})) as { company_id?: string, scope?: 'employee'|'organization' }
    const companyId = body.company_id
    const scope = body.scope || 'employee'
    if (!companyId) return json({ error: 'company_id required' }, 400)

    if (scope === 'employee') {
      const { data: empIds, error } = await supabase
        .from('employees')
        .select('id')
        .eq('company_id', companyId)
      if (error) return json({ error: error.message }, 500)

      const rows = (empIds || []).map((e: any) => ({ company_id: companyId, scope: 'employee', scope_id: e.id, reason: 'manual_seed' }))
      if (rows.length > 0) {
        await supabase.from('market_compute_queue').insert(rows)
      }
    } else {
      await supabase.from('market_compute_queue').insert({ company_id: companyId, scope: 'organization', scope_id: companyId, reason: 'manual_seed' })
    }

    return json({ enqueued: true })
  } catch (e: any) {
    return json({ error: e?.message || 'Unknown error' }, 500)
  }
})


