-- Create HRIS connections table
CREATE TABLE IF NOT EXISTS hris_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('unified_to', 'bamboohr', 'workday', 'adp')),
    connection_id TEXT,
    sync_status TEXT NOT NULL DEFAULT 'idle' CHECK (sync_status IN ('idle', 'syncing', 'error')),
    sync_error TEXT,
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id)
);

-- Create index for performance
CREATE INDEX idx_hris_connections_company ON hris_connections(company_id);

-- Create HRIS sync logs table
CREATE TABLE IF NOT EXISTS hris_sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    sync_type TEXT NOT NULL CHECK (sync_type IN ('manual', 'scheduled')),
    status TEXT NOT NULL CHECK (status IN ('started', 'completed', 'failed')),
    employees_synced INTEGER DEFAULT 0,
    errors JSONB DEFAULT '{}',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX idx_hris_sync_logs_company ON hris_sync_logs(company_id);
CREATE INDEX idx_hris_sync_logs_created ON hris_sync_logs(created_at DESC);

-- Enable RLS
ALTER TABLE hris_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE hris_sync_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for hris_connections
CREATE POLICY "Company users can view their HRIS connections" ON hris_connections
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = auth.uid()
            AND up.company_id = hris_connections.company_id
        )
    );

CREATE POLICY "Company admins can manage HRIS connections" ON hris_connections
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = auth.uid()
            AND up.company_id = hris_connections.company_id
            AND up.role IN ('company_admin', 'super_admin')
        )
    );

-- Create RLS policies for hris_sync_logs
CREATE POLICY "Company users can view their sync logs" ON hris_sync_logs
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = auth.uid()
            AND up.company_id = hris_sync_logs.company_id
        )
    );

CREATE POLICY "System can insert sync logs" ON hris_sync_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = auth.uid()
            AND up.company_id = hris_sync_logs.company_id
        )
    );

CREATE POLICY "System can update sync logs" ON hris_sync_logs
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = auth.uid()
            AND up.company_id = hris_sync_logs.company_id
        )
    );

-- Add comments
COMMENT ON TABLE hris_connections IS 'Stores HRIS integration connections for companies';
COMMENT ON TABLE hris_sync_logs IS 'Logs of HRIS synchronization operations';