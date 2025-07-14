-- Add deleted_at column to contact_sales table for soft delete functionality
ALTER TABLE contact_sales 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Create index for better performance when filtering non-deleted records
CREATE INDEX IF NOT EXISTS idx_contact_sales_deleted_at 
ON contact_sales(deleted_at) 
WHERE deleted_at IS NULL;

-- Update the unified_leads view to filter out deleted contact_sales records
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
    eal.source,
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
WHERE eal.deleted_at IS NULL

UNION ALL

SELECT 
    'contact_sales' as type,
    cs.id::text as id,
    cs.email,
    cs.name,
    cs.company,
    null as role,
    cs.message as use_case,  -- Using message field as use_case
    null as waitlist_position,
    cs.team_size as company_size,
    cs.source,
    cs.utm_source,
    cs.utm_medium,
    cs.utm_campaign,
    cs.status,
    cs.created_at,
    cs.updated_at,
    1 as progress_step,  -- Contact sales is always step 1
    false as calendly_scheduled,
    null as scheduled_at,
    null as completed_at
FROM contact_sales cs
WHERE cs.deleted_at IS NULL;

-- Grant access to authenticated users
GRANT SELECT ON unified_leads TO authenticated;
GRANT SELECT ON unified_leads TO service_role;