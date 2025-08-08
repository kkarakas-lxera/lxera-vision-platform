// @ts-ignore: Deno imports
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
// @ts-ignore: Deno imports
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

type Json = any

interface QueueTask {
  id: string
  company_id: string
  scope: 'employee' | 'department' | 'organization'
  scope_id?: string
  reason?: string
}

interface MarketSkill {
  skill_name: string
  match_percentage: number
  category?: 'critical' | 'emerging' | 'foundational'
  market_demand?: 'high' | 'medium' | 'low'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors() })

  try {
    // @ts-ignore
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    // @ts-ignore
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const url = new URL(req.url)
    const mode = url.searchParams.get('mode') || 'process'
    const limit = Number(url.searchParams.get('limit') || '25')

    if (mode === 'process') {
      // Dequeue tasks (FIFO by created_at)
      const { data: tasks, error } = await supabase
        .from('market_compute_queue')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(limit)

      if (error) throw error

      const processed: string[] = []

      for (const t of tasks as QueueTask[]) {
        try {
          if (t.scope === 'employee') {
            await recomputeEmployee(supabase, t.company_id, t.scope_id!)
            // Bubble up department/org recomputes
            await enqueue(supabase, t.company_id, 'organization', t.company_id, 'bubble_from_employee')
          } else if (t.scope === 'department') {
            await recomputeDepartment(supabase, t.company_id, t.scope_id!)
            await enqueue(supabase, t.company_id, 'organization', t.company_id, 'bubble_from_department')
          } else if (t.scope === 'organization') {
            await recomputeOrganization(supabase, t.company_id)
          }
          processed.push(t.id)
        } catch (err) {
          console.error('Task failed', t, err)
          // Continue with other tasks
        }
      }

      // Delete processed tasks
      if (processed.length > 0) {
        await supabase.from('market_compute_queue').delete().in('id', processed)
      }

      return json({ processed: processed.length })
    }

    return json({ ok: true })
  } catch (e: any) {
    console.error('compute-market-matches error:', e)
    return json({ error: e?.message || 'Unknown error' }, 500)
  }
})

function cors() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors(), 'Content-Type': 'application/json' } })
}

async function enqueue(supabase: any, companyId: string, scope: QueueTask['scope'], scopeId: string, reason: string) {
  await supabase.from('market_compute_queue').insert({ company_id: companyId, scope, scope_id: scopeId, reason })
}

async function fetchLatestBaseline(supabase: any, companyId: string, department?: string, roleName?: string) {
  // Try department match first, then role, then most recent overall baseline
  let query = supabase
    .from('market_skills_benchmarks')
    .select('id, role_name, industry, department, skills, generated_at')
    .order('generated_at', { ascending: false })
    .limit(1)

  if (department) {
    const { data } = await supabase
      .from('market_skills_benchmarks')
      .select('id, role_name, industry, department, skills, generated_at')
      .eq('department', department)
      .order('generated_at', { ascending: false })
      .limit(1)
    if (data && data.length > 0) return data[0]
  }

  if (roleName) {
    const { data } = await supabase
      .from('market_skills_benchmarks')
      .select('id, role_name, industry, department, skills, generated_at')
      .eq('role_name', roleName)
      .order('generated_at', { ascending: false })
      .limit(1)
    if (data && data.length > 0) return data[0]
  }

  const { data } = await query
  return data?.[0] || null
}

function compareSkills(baselineSkills: MarketSkill[], employeeSkills: { skill_name: string; proficiency: number }[]) {
  const map = new Map<string, number>()
  employeeSkills.forEach(s => map.set(s.skill_name.toLowerCase(), Number(s.proficiency || 0)))

  let total = 0
  const compared = baselineSkills.map(s => {
    const prof = map.get(s.skill_name.toLowerCase()) ?? 0
    const pct = Math.round((prof / 3) * 100)
    total += pct
    return {
      skill_name: s.skill_name,
      category: s.category || 'foundational',
      market_importance: s.match_percentage || 0,
      match_percentage: pct
    }
  })

  const avg = compared.length > 0 ? Math.round(total / compared.length) : 0
  const topMissing = compared
    .filter(x => x.match_percentage <= 40)
    .sort((a, b) => (b.market_importance || 0) - (a.market_importance || 0))
    .slice(0, 5)
    .map(x => ({ skill_name: x.skill_name, category: x.market_importance >= 80 ? 'critical' : x.market_importance >= 60 ? 'emerging' : 'foundational', market_importance: x.market_importance }))

  return { average: avg, topMissing }
}

async function recomputeEmployee(supabase: any, companyId: string, employeeId: string) {
  // Fetch employee basics & skills
  const { data: emp } = await supabase
    .from('employees')
    .select('id, department, company_id, current_position_id, st_company_positions(position_title), employee_skills(skill_name, proficiency, source)')
    .eq('id', employeeId)
    .single()

  if (!emp) return
  const roleName: string | undefined = emp.st_company_positions?.position_title || undefined
  const department: string | undefined = emp.department || undefined

  const baseline = await fetchLatestBaseline(supabase, companyId, department, roleName)
  if (!baseline) return

  const employeeSkills = (emp.employee_skills || []).map((s: any) => ({ skill_name: s.skill_name, proficiency: Number(s.proficiency || 0) }))
  const baselineSkills: MarketSkill[] = Array.isArray(baseline.skills) ? baseline.skills : []

  const { average, topMissing } = compareSkills(baselineSkills, employeeSkills)

  // skills_by_source quick counts
  const skillsBySource = { ai: 0, cv: 0, verified: 0 }
  ;(emp.employee_skills || []).forEach((s: any) => {
    const src = (s.source || 'cv') as keyof typeof skillsBySource
    if (skillsBySource[src] !== undefined) skillsBySource[src]++
  })

  await supabase
    .from('employee_market_match_current')
    .upsert({
      company_id: companyId,
      employee_id: employeeId,
      baseline_id: baseline.id,
      market_match_percentage: average,
      top_missing_skills: topMissing,
      skills_by_source: skillsBySource,
      last_computed_at: new Date().toISOString(),
    })
}

async function recomputeDepartment(supabase: any, companyId: string, department: string) {
  // Aggregate from employee current
  const { data: empRows } = await supabase
    .from('employees')
    .select('id')
    .eq('company_id', companyId)
    .eq('department', department)

  if (!empRows || empRows.length === 0) {
    await supabase.from('department_market_match_current').upsert({
      company_id: companyId,
      department,
      avg_market_match: 0,
      critical_gaps: 0,
      emerging_gaps: 0,
      top_gaps: [],
      analyzed_count: 0,
      employee_count: 0,
      last_computed_at: new Date().toISOString(),
    })
    return
  }

  const empIds = empRows.map((r: any) => r.id)
  const { data: current } = await supabase
    .from('employee_market_match_current')
    .select('market_match_percentage, top_missing_skills, baseline_id')
    .eq('company_id', companyId)
    .in('employee_id', empIds)

  const employeeCount = empRows.length
  const analyzedCount = current?.length || 0
  const avg = analyzedCount > 0 ? Math.round((current!.reduce((s: number, r: any) => s + Number(r.market_match_percentage || 0), 0)) / analyzedCount) : 0

  // Aggregate gaps: count top_missing_skills entries by category
  let critical = 0
  let emerging = 0
  const gapMap = new Map<string, number>()
  current?.forEach((r: any) => {
    const gaps = Array.isArray(r.top_missing_skills) ? r.top_missing_skills : []
    gaps.forEach((g: any) => {
      gapMap.set(g.skill_name, (gapMap.get(g.skill_name) || 0) + 1)
      if (g.category === 'critical') critical++
      else if (g.category === 'emerging') emerging++
    })
  })

  const topGaps = Array.from(gapMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([skill_name, count]) => ({ skill_name, gap_percentage: 100, category: 'critical' }))

  const baselineId = current && current[0] ? current[0].baseline_id : null

  await supabase
    .from('department_market_match_current')
    .upsert({
      company_id: companyId,
      department,
      baseline_id: baselineId,
      avg_market_match: avg,
      critical_gaps: critical,
      emerging_gaps: emerging,
      top_gaps: topGaps,
      analyzed_count: analyzedCount,
      employee_count: employeeCount,
      last_computed_at: new Date().toISOString(),
    })
}

async function recomputeOrganization(supabase: any, companyId: string) {
  const { data: depts } = await supabase
    .from('department_market_match_current')
    .select('avg_market_match, critical_gaps, emerging_gaps, analyzed_count, employee_count, baseline_id')
    .eq('company_id', companyId)

  const { data: employees } = await supabase
    .from('employee_market_match_current')
    .select('market_match_percentage')
    .eq('company_id', companyId)

  let totalWeighted = 0
  let totalAnalyzed = 0
  let critical = 0
  let moderate = 0

  depts?.forEach((d: any) => {
    totalWeighted += Number(d.avg_market_match || 0) * Number(d.analyzed_count || 0)
    totalAnalyzed += Number(d.analyzed_count || 0)
    critical += Number(d.critical_gaps || 0)
    moderate += Number(d.emerging_gaps || 0)
  })

  // Coverage: percentage of employees with match >= 67% (proxy for >= 2/3)
  const empCount = employees?.length || 0
  const covered = (employees || []).filter((e: any) => Number(e.market_match_percentage || 0) >= 67).length
  const coverage = empCount > 0 ? Math.round((covered / empCount) * 100) : 0

  const alignment = totalAnalyzed > 0 ? Math.round((totalWeighted / totalAnalyzed) / 10) : 0 // 0-10 scale

  const baselineId = depts && depts[0] ? depts[0].baseline_id : null

  await supabase
    .from('organization_market_match_current')
    .upsert({
      company_id: companyId,
      baseline_id: baselineId,
      market_coverage_rate: coverage,
      industry_alignment_index: alignment,
      critical_skills_count: critical,
      moderate_skills_count: moderate,
      top_missing_skills: [],
      last_computed_at: new Date().toISOString(),
    })
}


