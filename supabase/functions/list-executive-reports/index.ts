// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// @ts-ignore: URL import (resolved by Deno at runtime)
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
// @ts-ignore: URL import (resolved by Deno at runtime)
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, serviceKey)

    const authHeader = req.headers.get('authorization') || ''
    const jwt = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : undefined
    if (!jwt) return json({ error: 'Missing Authorization' }, 401)

    const { data: userRes, error: userErr } = await supabase.auth.getUser(jwt)
    if (userErr || !userRes?.user) return json({ error: 'Unauthorized' }, 401)
    const userId = userRes.user.id

    // Resolve company
    const { data: userRow } = await supabase.from('users').select('company_id').eq('id', userId).single()
    let companyId: string | null = userRow?.company_id ?? null
    if (!companyId) {
      const { data: empRow } = await supabase.from('employees').select('company_id').eq('user_id', userId).single()
      companyId = empRow?.company_id ?? null
    }
    if (!companyId) return json({ error: 'No company context' }, 400)

    const url = new URL(req.url)
    const limit = Number(url.searchParams.get('limit') || '20')
    const scope = url.searchParams.get('scope') || undefined
    const dept = url.searchParams.get('department') || undefined

    let query = supabase
      .from('market_executive_reports')
      .select('id, scope, scope_id, period_start, period_end, generated_at, pdf_path, version')
      .eq('company_id', companyId)
      .order('generated_at', { ascending: false })
      .limit(limit)

    if (scope === 'department' && dept) query = query.eq('scope', 'department').eq('scope_id', dept)
    if (scope === 'organization') query = query.eq('scope', 'organization')

    const { data, error } = await query
    if (error) return json({ error: error.message }, 500)

    // Return signed URLs for each item that has a pdf_path
    const bucket = 'reports'
    const items = await Promise.all((data || []).map(async (row: any) => {
      if (row.pdf_path) {
        try {
          const { data: signed } = await supabase.storage.from(bucket).createSignedUrl(row.pdf_path, 60 * 60)
          return { ...row, pdf_url: signed?.signedUrl }
        } catch {
          return row
        }
      }
      return row
    }))

    return json({ items })
  } catch (e: any) {
    console.error('list-executive-reports error', e)
    return json({ error: e?.message || 'Unknown error' }, 500)
  }
})


