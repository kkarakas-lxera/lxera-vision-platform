-- Create game progress state table for saving/resuming game sessions
CREATE TABLE IF NOT EXISTS game_progress_state (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  mission_id UUID NOT NULL REFERENCES game_missions(id) ON DELETE CASCADE,
  current_question_index INTEGER DEFAULT 0,
  responses JSONB DEFAULT '[]'::jsonb,
  game_mode TEXT DEFAULT 'playing',
  selected_task JSONB,
  content_section_id UUID,
  section_name TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  final_results JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(employee_id, mission_id),
  CHECK (current_question_index >= 0),
  CHECK (game_mode IN ('playing', 'results', 'puzzle'))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_game_progress_state_employee_id ON game_progress_state(employee_id);
CREATE INDEX IF NOT EXISTS idx_game_progress_state_mission_id ON game_progress_state(mission_id);
CREATE INDEX IF NOT EXISTS idx_game_progress_state_incomplete ON game_progress_state(employee_id, updated_at) 
  WHERE completed_at IS NULL;

-- Enable RLS
ALTER TABLE game_progress_state ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Employees can view own game progress" ON game_progress_state
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM employees e 
      WHERE e.id = game_progress_state.employee_id 
      AND e.user_id = auth.uid()
    )
  );

CREATE POLICY "Employees can insert own game progress" ON game_progress_state
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees e 
      WHERE e.id = game_progress_state.employee_id 
      AND e.user_id = auth.uid()
    )
  );

CREATE POLICY "Employees can update own game progress" ON game_progress_state
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM employees e 
      WHERE e.id = game_progress_state.employee_id 
      AND e.user_id = auth.uid()
    )
  );

-- Allow service role full access for edge functions
CREATE POLICY "Service role can manage all game progress" ON game_progress_state
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Add helpful comments
COMMENT ON TABLE game_progress_state IS 'Stores game session state for resume functionality';
COMMENT ON COLUMN game_progress_state.responses IS 'Array of question responses with timestamps';
COMMENT ON COLUMN game_progress_state.selected_task IS 'The task object that initiated this game session';
COMMENT ON COLUMN game_progress_state.final_results IS 'Final game results when completed';