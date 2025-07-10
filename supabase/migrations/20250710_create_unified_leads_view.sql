-- Create unified leads view that combines demo captures and early access leads
CREATE OR REPLACE VIEW unified_leads AS
SELECT 
    'demo' as type,
    dc.id::text as id,
    dc.email,
    dc.name,
    dc.company,
    null as role,
    null as use_case,
    null as waitlist_position,
    dc.company_size,
    dc.source,
    dc.utm_source,
    dc.utm_medium,
    dc.utm_campaign,
    dc.status,
    dc.created_at,
    dc.updated_at,
    dc.step_completed as progress_step,
    dc.calendly_scheduled,
    dc.scheduled_at,
    dc.completed_at
FROM demo_captures dc
WHERE dc.deleted_at IS NULL

UNION ALL

SELECT 
    'early_access' as type,
    eal.id::text as id,
    eal.email,
    eal.name,
    eal.company,
    eal.role,
    eal.use_case,
    eal.waitlist_position,
    eal.company_size,
    'early_access' as source,
    null as utm_source,
    null as utm_medium,
    null as utm_campaign,
    CASE 
        WHEN eal.status = 'email_captured' THEN 'email_captured'
        WHEN eal.status = 'profile_completed' THEN 'profile_completed'
        WHEN eal.status = 'waitlisted' THEN 'waitlisted'
        ELSE 'captured'
    END as status,
    eal.created_at,
    eal.updated_at,
    CASE 
        WHEN eal.status = 'email_captured' THEN 1
        WHEN eal.status = 'profile_completed' THEN 2
        WHEN eal.status = 'waitlisted' THEN 3
        ELSE 1
    END as progress_step,
    false as calendly_scheduled,
    null as scheduled_at,
    null as completed_at
FROM early_access_leads eal
WHERE eal.deleted_at IS NULL;

-- Grant access to authenticated users
GRANT SELECT ON unified_leads TO authenticated;
GRANT SELECT ON unified_leads TO service_role;