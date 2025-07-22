/**
 * Enhanced Course Outline Generator Integration Guide
 * 
 * This guide shows how to integrate with the enhanced generate-course-outline edge function
 * that serves as the final reward for completing the 7-step employee profile process.
 */

// TypeScript interfaces for the enhanced function
interface CourseOutlineRequest {
  employee_id: string
}

interface PersonalizationFactors {
  practical_emphasis: number
  tool_integration_score: number
  experience_level: string
}

interface CourseModule {
  module_id: number
  module_name: string
  week: number
  duration_hours: number
  priority: 'critical' | 'high' | 'medium' | 'low'
  skill_gap_addressed: string
  tools_integration: string[]
  learning_objectives: string[]
  key_topics: string[]
  practical_exercises: string[]
  difficulty_level: 'beginner' | 'intermediate' | 'advanced'
  personalization_factors: {
    practical_emphasis: number
    tool_specific_content: number
    experience_level: string
  }
}

interface EnhancedCourseOutline {
  course_title: string
  description: string
  total_duration_weeks: number
  total_duration_hours: number
  target_audience: string
  prerequisites: string[]
  learning_outcomes: string[]
  modules: CourseModule[]
  personalization_score: number
  personalization_metadata: {
    employee_name: string
    current_role: string
    experience_level: string
    skills_match_score: number
    challenges_addressed: number
    growth_areas_covered: number
  }
  generation_metadata: {
    generated_for: string
    generated_at: string
    challenges_addressed: number
    growth_areas_covered: number
    skills_analyzed: number
    experience_level: string
    practical_emphasis: string
    tool_integration: string
    is_completion_reward: true
    ai_model_used: 'gpt-4'
    processing_time_ms: number
  }
}

interface CourseOutlineResponse {
  success: boolean
  request_id: string
  course_outline: EnhancedCourseOutline
  reward_message: {
    title: string
    description: string
    highlights: string[]
  }
}

interface CourseOutlineError {
  error: string
  request_id: string
  timestamp: string
  details?: string // Only in development mode
}

/**
 * Frontend Integration Example
 * 
 * Call this function when user completes the 7th step of profile building
 */
export async function generatePersonalizedCourseOutline(
  employeeId: string,
  supabaseUrl: string,
  supabaseAnonKey: string
): Promise<CourseOutlineResponse> {
  const response = await fetch(`${supabaseUrl}/functions/v1/generate-course-outline`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'apikey': supabaseAnonKey
    },
    body: JSON.stringify({
      employee_id: employeeId
    } as CourseOutlineRequest)
  })

  if (!response.ok) {
    const error: CourseOutlineError = await response.json()
    throw new Error(error.error || 'Failed to generate course outline')
  }

  return response.json() as Promise<CourseOutlineResponse>
}

/**
 * React Component Integration Example
 */
/*
import React, { useState } from 'react'

interface CourseRewardModalProps {
  employeeId: string
  isOpen: boolean
  onClose: () => void
}

export const CourseRewardModal: React.FC<CourseRewardModalProps> = ({
  employeeId,
  isOpen,
  onClose
}) => {
  const [courseOutline, setCourseOutline] = useState<EnhancedCourseOutline | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerateCourse = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      const result = await generatePersonalizedCourseOutline(
        employeeId,
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      
      setCourseOutline(result.course_outline)
      
      // Show success notification
      console.log('Course generated successfully:', result.reward_message)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate course outline')
    } finally {
      setIsGenerating(false)
    }
  }

  React.useEffect(() => {
    if (isOpen && !courseOutline && !isGenerating) {
      handleGenerateCourse()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">🎉 Your Personalized Course Outline</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {isGenerating && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Generating your personalized course outline...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={handleGenerateCourse}
              className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {courseOutline && (
          <div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                {courseOutline.course_title}
              </h3>
              <p className="text-green-700 mb-3">{courseOutline.description}</p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  {courseOutline.modules.length} Modules
                </span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {courseOutline.total_duration_hours} Hours
                </span>
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                  {courseOutline.personalization_score}% Personalized
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {courseOutline.modules.map((module) => (
                <div key={module.module_id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{module.module_name}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      module.priority === 'critical' ? 'bg-red-100 text-red-800' :
                      module.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {module.priority} priority
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Week {module.week} • {module.duration_hours} hours • {module.difficulty_level}
                  </p>
                  <p className="text-sm mb-2">
                    <strong>Addresses:</strong> {module.skill_gap_addressed}
                  </p>
                  <div className="text-sm">
                    <strong>Key Topics:</strong> {module.key_topics.join(', ')}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-4">
              <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                Start Learning Path
              </button>
              <button className="border border-gray-300 px-6 py-2 rounded hover:bg-gray-50">
                Download PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
*/

/**
 * Backend Integration Example - Triggering after profile completion
 */
export async function onProfileCompletion(employeeId: string) {
  // This function would be called when the 7th profile step is completed
  
  try {
    // 1. Verify all 7 profile sections are complete
    const profileComplete = await checkProfileCompleteness(employeeId)
    
    if (!profileComplete) {
      throw new Error('Profile not complete - cannot generate course outline')
    }

    // 2. Generate the course outline as reward
    const courseResult = await generatePersonalizedCourseOutline(
      employeeId,
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 3. Log the reward generation
    console.log(`Course outline reward generated for employee ${employeeId}:`, {
      course_title: courseResult.course_outline.course_title,
      personalization_score: courseResult.course_outline.personalization_score,
      modules_count: courseResult.course_outline.modules.length
    })

    // 4. Send notification to employee
    await sendCourseOutlineNotification(employeeId, courseResult)

    return courseResult

  } catch (error) {
    console.error(`Failed to generate course outline reward for employee ${employeeId}:`, error)
    throw error
  }
}

async function checkProfileCompleteness(employeeId: string): Promise<boolean> {
  // Implementation would check if all 7 profile sections are complete
  return true
}

async function sendCourseOutlineNotification(
  employeeId: string, 
  courseResult: CourseOutlineResponse
): Promise<void> {
  // Implementation would send email/push notification about the new course outline
  console.log(`Notification sent to employee ${employeeId} about their new course outline`)
}

/**
 * Database Schema Requirements
 * 
 * The function expects these database structures:
 */

/*
-- Employee profile sections (7 steps)
CREATE TABLE employee_profile_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  section_name VARCHAR NOT NULL, -- work_experience, education, current_work, daily_tasks, tools_technologies, etc.
  data JSONB NOT NULL,
  is_complete BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Employee skills profile
CREATE TABLE st_employee_skills_profile (
  employee_id UUID PRIMARY KEY REFERENCES employees(id),
  extracted_skills JSONB,
  skills_match_score DECIMAL(5,2),
  career_readiness_score DECIMAL(5,2),
  gap_analysis_completed_at TIMESTAMP WITH TIME ZONE
);

-- Course outlines storage
CREATE TABLE employee_course_outlines (
  employee_id UUID PRIMARY KEY REFERENCES employees(id),
  course_outline JSONB NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  context_used JSONB,
  personalization_factors JSONB,
  is_reward BOOLEAN DEFAULT false,
  status VARCHAR DEFAULT 'generated',
  request_id UUID
);

-- Company positions
CREATE TABLE st_company_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position_title VARCHAR NOT NULL,
  department VARCHAR,
  required_skills JSONB,
  nice_to_have_skills JSONB
);
*/

/**
 * Environment Variables Required
 */
/*
OPENAI_API_KEY=sk-... # OpenAI API key for GPT-4
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ... # Supabase anonymous key
SUPABASE_SERVICE_ROLE_KEY=eyJ... # Supabase service role key (for edge functions)
*/