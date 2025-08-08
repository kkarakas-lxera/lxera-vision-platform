// deno-lint-ignore-file no-explicit-any
// Deno types for Supabase Edge runtime
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// @ts-ignore: URL import (resolved by Deno at runtime)
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
// @ts-ignore: URL import (resolved by Deno at runtime)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
// @ts-ignore: URL import (resolved by Deno at runtime)
import { PDFDocument, StandardFonts } from 'https://esm.sh/pdf-lib@1.17.1'

type Scope = 'organization' | 'department'

interface GenerateRequestBody {
  scope: Scope
  scope_id?: string
  period?: { start?: string; end?: string }
  include_citations?: boolean
}

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
    // @ts-ignore: Provided by Edge runtime
    const supabaseUrl = (globalThis as any).Deno?.env.get('SUPABASE_URL')!
    // @ts-ignore: Provided by Edge runtime
    const serviceKey = (globalThis as any).Deno?.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, serviceKey)

    const authHeader = req.headers.get('authorization') || ''
    const jwt = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : undefined
    if (!jwt) return json({ error: 'Missing Authorization' }, 401)

    const { data: userRes, error: userErr } = await supabase.auth.getUser(jwt)
    if (userErr || !userRes?.user) return json({ error: 'Unauthorized' }, 401)
    const userId = userRes.user.id

    const body = (await req.json().catch(() => ({}))) as GenerateRequestBody
    const scope: Scope = body.scope || 'organization'
    const scopeId = body.scope_id
    const includeCitations = body.include_citations ?? true

    // Resolve company_id for the requester
    const { data: userRow } = await supabase.from('users').select('company_id').eq('id', userId).single()
    let companyId: string | null = userRow?.company_id ?? null
    if (!companyId) {
      const { data: empRow } = await supabase.from('employees').select('company_id').eq('user_id', userId).single()
      companyId = empRow?.company_id ?? null
    }
    if (!companyId) {
      // Admin fallback: treat user id as company id if exists
      const { data: companyCheck } = await supabase.from('companies').select('id').eq('id', userId).single()
      companyId = companyCheck?.id ?? null
    }
    if (!companyId) return json({ error: 'No company context' }, 400)

    // Period
    const periodEnd = body.period?.end ? new Date(body.period.end) : new Date()
    const periodStart = body.period?.start ? new Date(body.period.start) : new Date(Date.now() - 30 * 24 * 3600 * 1000)

    // KPIs from current tables
    const { data: orgCurrent } = await supabase
      .from('organization_market_match_current')
      .select('*')
      .eq('company_id', companyId)
      .single()

    const { data: deptCurrent } = await supabase
      .from('department_market_match_current')
      .select('*')
      .eq('company_id', companyId)

    // Build KPI payload
    const topMissing = Array.isArray(orgCurrent?.top_missing_skills) ? orgCurrent!.top_missing_skills : []
    const topDepartments = (deptCurrent || [])
      .slice()
      .sort((a: any, b: any) => (b.avg_market_match || 0) - (a.avg_market_match || 0))
      .slice(0, 5)
      .map((d: any) => ({
        department: d.department,
        avgMarketMatch: Number(d.avg_market_match || 0),
        analyzedCount: Number(d.analyzed_count || 0),
        employeeCount: Number(d.employee_count || 0),
        criticalGaps: Number(d.critical_gaps || 0),
        emergingGaps: Number(d.emerging_gaps || 0),
        lastComputedAt: d.last_computed_at,
      }))

    // Trends from snapshots
    async function delta(days: number) {
      const since = new Date(Date.now() - days * 24 * 3600 * 1000)
      const { data: snapshots } = await supabase
        .from('market_benchmark_snapshots')
        .select('snapshot_date, metrics')
        .eq('company_id', companyId)
        .lte('snapshot_date', since.toISOString())
        .order('snapshot_date', { ascending: false })
        .limit(1)
      if (!snapshots || snapshots.length === 0) return { coverage: 0, alignment: 0, criticalGaps: 0 }
      const baseline = snapshots[0].metrics as any
      const coverageNow = Number(orgCurrent?.market_coverage_rate || 0)
      const alignNow = Number(orgCurrent?.industry_alignment_index || 0)
      const critNow = Number(orgCurrent?.critical_skills_count || 0)
      const coverageThen = Number(baseline?.coverage || baseline?.average_match || 0)
      const alignThen = Number(baseline?.alignment || baseline?.average_match || 0)
      const critThen = Number(baseline?.critical_gaps || 0)
      return {
        coverage: coverageNow - coverageThen,
        alignment: alignNow - alignThen,
        criticalGaps: critThen - critNow,
      }
    }
    const trends = {
      delta7d: await delta(7),
      delta30d: await delta(30),
      delta90d: await delta(90),
    }

    const kpis = {
      organization: {
        marketCoverageRate: Number(orgCurrent?.market_coverage_rate || 0),
        industryAlignmentIndex: Number(orgCurrent?.industry_alignment_index || 0),
        criticalSkillsCount: Number(orgCurrent?.critical_skills_count ?? 0),
        moderateSkillsCount: Number(orgCurrent?.moderate_skills_count ?? 0),
        lastComputedAt: orgCurrent?.last_computed_at || null,
      },
      departments: topDepartments,
      topMissingSkills: (topMissing as any[]).map((s) => ({
        skillName: s.skill_name,
        severity: s.severity || 'moderate',
        affectedEmployees: s.affected_employees,
      })),
      trends,
    }

    // Optional insights/citations via existing function
    let narrative = ''
    let citations: any[] = []
    if (includeCitations) {
      const { data: benchResp } = await supabase.functions.invoke('generate-market-benchmarks', {
        body: { role: 'General Manager', include_insights: true },
      })
      if (benchResp?.insights?.executive_summary) narrative = benchResp.insights.executive_summary
      if (Array.isArray(benchResp?.insights?.citations)) citations = benchResp.insights.citations
    }
    if (!narrative) {
      narrative = `Your current market coverage is ${kpis.organization.marketCoverageRate}% with an alignment index of ${kpis.organization.industryAlignmentIndex}/10. Focus on closing ${kpis.organization.criticalSkillsCount} critical gaps to improve competitiveness.`
    }

    const methodology = {
      baseline: 'Latest market skills baseline by role/department',
      scoring: 'Employee proficiency 0-3 scaled to 0-100 match; department/org aggregated averages',
      coverage: 'Share of analyzed employees with average proficiency >= 2/3',
      dataSources: ['organization_market_match_current', 'department_market_match_current', 'market_benchmark_snapshots'],
    }

    // Persist report row
    const reportRow = {
      company_id: companyId,
      scope,
      scope_id: scope === 'department' ? (scopeId || null) : null,
      period_start: periodStart.toISOString(),
      period_end: periodEnd.toISOString(),
      kpis,
      narrative,
      citations,
      methodology,
      generated_by: userId,
    }
    const { data: inserted, error: insErr } = await supabase.from('market_executive_reports').insert(reportRow).select('id').single()
    if (insErr) return json({ error: 'Insert failed', details: insErr.message }, 500)
    const reportId = inserted.id as string

    // Create a simple PDF
    const pdfDoc = await PDFDocument.create()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const page = pdfDoc.addPage([595, 842]) // A4
    const drawText = (text: string, x: number, y: number, size = 12) => {
      page.drawText(text, { x, y, size, font })
    }
    let y = 800
    drawText('Market Executive Report', 50, y, 18); y -= 24
    drawText(`Company: ${companyId}`, 50, y); y -= 16
    drawText(`Period: ${periodStart.toISOString()} to ${periodEnd.toISOString()}`, 50, y); y -= 20
    drawText(`Coverage: ${kpis.organization.marketCoverageRate}%  |  Alignment: ${kpis.organization.industryAlignmentIndex}/10`, 50, y); y -= 20
    drawText(`Critical gaps: ${kpis.organization.criticalSkillsCount}`, 50, y); y -= 20
    drawText('Top Departments:', 50, y); y -= 16
    topDepartments.forEach((d) => { drawText(`- ${d.department}: ${d.avgMarketMatch}% match, ${d.analyzedCount}/${d.employeeCount} analyzed`, 60, y); y -= 14 })
    y -= 10
    drawText('Executive Summary:', 50, y); y -= 16
    const summaryLines = wrapText(narrative, 80)
    summaryLines.forEach((line) => { drawText(line, 60, y); y -= 14 })

    const pdfBytes = await pdfDoc.save()

    // Ensure storage bucket exists
    const bucket = 'reports'
    await supabase.storage.createBucket(bucket).catch(() => undefined)
    const objectPath = `${companyId}/${reportId}.pdf`
    const { error: upErr } = await supabase.storage.from(bucket).upload(objectPath, new Blob([pdfBytes], { type: 'application/pdf' }), { upsert: true })
    if (upErr) return json({ error: 'Upload failed', details: upErr.message }, 500)

    await supabase.from('market_executive_reports').update({ pdf_path: objectPath }).eq('id', reportId)
    const { data: signed } = await supabase.storage.from(bucket).createSignedUrl(objectPath, 60 * 60)

    return json({ id: reportId, pdf_url: signed?.signedUrl, company_id: companyId })
  } catch (e: any) {
    console.error('generate-executive-report error', e)
    return json({ error: e?.message || 'Unknown error' }, 500)
  }
})

function wrapText(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''
  for (const w of words) {
    if ((current + ' ' + w).trim().length > maxCharsPerLine) {
      lines.push(current.trim())
      current = w
    } else {
      current += ' ' + w
    }
  }
  if (current.trim()) lines.push(current.trim())
  return lines.slice(0, 40) // cap
}


