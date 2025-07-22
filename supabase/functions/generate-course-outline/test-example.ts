/**
 * Test Example for Enhanced Course Outline Generator
 * 
 * This file shows how to test the enhanced generate-course-outline function
 */

// Example test payload - replace with actual employee ID from your database
const testPayload = {
  employee_id: "550e8400-e29b-41d4-a716-446655440000" // Replace with real UUID
}

// Example successful response structure
const exampleSuccessResponse = {
  "success": true,
  "request_id": "123e4567-e89b-12d3-a456-426614174000",
  "course_outline": {
    "course_title": "Advanced Financial Analysis Mastery for Business Performance Specialists",
    "description": "A comprehensive 4-week course designed to elevate your financial analysis capabilities and prepare you for senior analyst responsibilities in business performance reporting.",
    "total_duration_weeks": 4,
    "total_duration_hours": 18,
    "target_audience": "mid-level Financial Analyst seeking advancement",
    "prerequisites": ["Basic Excel proficiency", "Understanding of financial statements", "Experience with data analysis"],
    "learning_outcomes": [
      "Master advanced forecasting techniques using Excel and PowerBI",
      "Develop comprehensive budget management frameworks for business performance",
      "Create executive-level financial reports with actionable insights"
    ],
    "modules": [
      {
        "module_id": 1,
        "module_name": "Advanced Forecasting Techniques for Financial Planning",
        "week": 1,
        "duration_hours": 4,
        "priority": "critical",
        "skill_gap_addressed": "Forecasting and Budgeting",
        "tools_integration": ["Microsoft Excel", "PowerBI"],
        "learning_objectives": [
          "Apply Monte Carlo simulation techniques to financial forecasting",
          "Create dynamic budget models using advanced Excel functions"
        ],
        "key_topics": [
          "Statistical forecasting methods",
          "Scenario analysis and sensitivity testing",
          "Advanced Excel modeling techniques"
        ],
        "practical_exercises": [
          "Build a 12-month revenue forecast model using your company's historical data",
          "Create a variance analysis dashboard in PowerBI"
        ],
        "difficulty_level": "intermediate",
        "personalization_factors": {
          "practical_emphasis": 0.8,
          "tool_specific_content": 0.9,
          "experience_level": "mid-level"
        }
      },
      {
        "module_id": 2,
        "module_name": "Budget Management and Performance Tracking",
        "week": 2,
        "duration_hours": 4,
        "priority": "high",
        "skill_gap_addressed": "Budget Management",
        "tools_integration": ["SAP BPC", "Excel"],
        "learning_objectives": [
          "Implement rolling forecast processes",
          "Design KPI tracking systems for budget performance"
        ],
        "key_topics": [
          "Budget lifecycle management",
          "Performance metrics and KPI design",
          "Automated reporting systems"
        ],
        "practical_exercises": [
          "Design a budget tracking system using SAP BPC data",
          "Create automated budget vs. actual reports"
        ],
        "difficulty_level": "intermediate",
        "personalization_factors": {
          "practical_emphasis": 0.8,
          "tool_specific_content": 0.7,
          "experience_level": "mid-level"
        }
      }
    ],
    "personalization_score": 87,
    "personalization_metadata": {
      "employee_name": "John Doe",
      "current_role": "Financial Analyst",
      "experience_level": "mid-level",
      "skills_match_score": 72,
      "challenges_addressed": 4,
      "growth_areas_covered": 3
    },
    "generation_metadata": {
      "generated_for": "John Doe",
      "generated_at": "2025-01-22T10:30:00Z",
      "challenges_addressed": 4,
      "growth_areas_covered": 3,
      "skills_analyzed": 8,
      "experience_level": "mid-level",
      "practical_emphasis": "80%",
      "tool_integration": "70%",
      "is_completion_reward": true,
      "ai_model_used": "gpt-4",
      "processing_time_ms": 3500
    }
  },
  "reward_message": {
    "title": "🎉 Course Outline Generated Successfully!",
    "description": "Congratulations John Doe! Your personalized \"Advanced Financial Analysis Mastery for Business Performance Specialists\" course outline is ready.",
    "highlights": [
      "6 personalized modules",
      "18 hours of targeted learning",
      "87% personalization score",
      "4 challenges addressed",
      "Direct application to your Financial Analyst role"
    ]
  }
}

// Example error response structure
const exampleErrorResponse = {
  "error": "Profile not complete - please complete all 7 steps first",
  "request_id": "123e4567-e89b-12d3-a456-426614174000",
  "timestamp": "2025-01-22T10:30:00Z"
}

/**
 * Manual Testing Instructions:
 * 
 * 1. Deploy the function to Supabase:
 *    supabase functions deploy generate-course-outline
 * 
 * 2. Test with curl:
 *    curl -X POST https://your-project.supabase.co/functions/v1/generate-course-outline \
 *      -H "Authorization: Bearer YOUR_ANON_KEY" \
 *      -H "Content-Type: application/json" \
 *      -d '{"employee_id": "550e8400-e29b-41d4-a716-446655440000"}'
 * 
 * 3. Test in Supabase Dashboard:
 *    - Go to Edge Functions section
 *    - Find generate-course-outline function
 *    - Click "Test" and use the payload above
 * 
 * 4. Prerequisites for testing:
 *    - Employee must exist in employees table
 *    - Employee must have completed profile sections (employee_profile_sections table)
 *    - Required sections: work_experience, current_work, daily_tasks, tools_technologies
 *    - OpenAI API key must be configured in environment variables
 */

/**
 * Database Setup for Testing:
 */
const testDatabaseSetup = `
-- 1. Create a test employee
INSERT INTO employees (id, full_name, email, position, department) 
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'John Doe',
  'john.doe@company.com',
  'Financial Analyst',
  'Finance'
);

-- 2. Create test profile sections
INSERT INTO employee_profile_sections (employee_id, section_name, data, is_complete) VALUES
(
  '550e8400-e29b-41d4-a716-446655440000',
  'work_experience',
  '{"experiences": [{"title": "Junior Analyst", "company": "ABC Corp", "duration": "2021-2023"}]}',
  true
),
(
  '550e8400-e29b-41d4-a716-446655440000',
  'current_work',
  '{"projects": ["Budget Analysis", "Forecasting Model"], "teamSize": "5-10", "role": "Analyst"}',
  true
),
(
  '550e8400-e29b-41d4-a716-446655440000',
  'daily_tasks',
  '{"challenges": ["Complex forecasting", "Data accuracy", "Stakeholder reporting"]}',
  true
),
(
  '550e8400-e29b-41d4-a716-446655440000',
  'tools_technologies',
  '{"growthAreas": ["Advanced Excel", "PowerBI dashboards", "Financial modeling"]}',
  true
);

-- 3. Create test skills profile
INSERT INTO st_employee_skills_profile (employee_id, extracted_skills, skills_match_score)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  '[{"skill_name": "Excel", "proficiency": "intermediate"}, {"skill_name": "Financial Analysis", "proficiency": "beginner"}]',
  72
);
`

console.log("Test setup ready. Use the database setup SQL above and test with the payload:", testPayload)

export { testPayload, exampleSuccessResponse, exampleErrorResponse, testDatabaseSetup }