import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
// ContentManager integration - we'll use direct Supabase calls for now
// import { ContentManager } from '../src/lib/ContentManager.js';
import { calculateSkillsGap, generateTrainingPlan } from './calculate-skills-gap.js';

// Load environment variables
config();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate environment variables
if (!SUPABASE_URL) {
  console.error('❌ SUPABASE_URL environment variable not set!');
  console.error('Please set it in your .env file');
  process.exit(1);
}

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable not set!');
  console.error('Please set it in your .env file');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * Convert skills gap analysis to ContentManager ModuleSpec format
 */
function createModuleSpecFromGaps(gapAnalysis, employeeInfo) {
  const { skillGaps, summary, employeeName, positionTitle } = gapAnalysis;
  
  // Select top priority skills for the course (max 5-7 skills per course)
  const priorityGaps = skillGaps
    .filter(g => g.gap_severity !== 'minor')
    .slice(0, 7);

  // Build key tools list from required skills
  const keyTools = priorityGaps
    .filter(g => g.skill_type === 'skill' || g.skill_type === 'skill_cluster')
    .map(g => g.skill_name)
    .slice(0, 5);

  // Create module specification
  const moduleSpec = {
    module_name: `Skills Development Program: ${positionTitle}`,
    employee_name: employeeName,
    current_role: employeeInfo.current_position || 'Employee',
    career_goal: positionTitle,
    key_tools: keyTools,
    personalization_level: 'advanced',
    priority_level: summary.criticalGaps > 2 ? 'high' : 'medium',
    
    // Custom fields for skills-based course
    learning_objectives: priorityGaps.map(gap => ({
      skill: gap.skill_name,
      from_level: gap.current_level,
      to_level: gap.required_level,
      importance: gap.is_mandatory ? 'required' : 'recommended'
    })),
    
    skill_gaps: priorityGaps.map(gap => ({
      skill_id: gap.skill_id,
      skill_name: gap.skill_name,
      gap_severity: gap.gap_severity,
      current_evidence: gap.evidence
    })),
    
    duration_weeks: Math.min(Math.ceil(summary.trainingHours / 40), 6), // Max 6 weeks
    estimated_hours: summary.trainingHours,
    
    focus_areas: determineFocusAreas(priorityGaps),
    
    personalization_context: {
      total_experience_years: employeeInfo.total_experience_years || 0,
      current_skills: employeeInfo.current_skills || [],
      learning_style: 'hands_on', // Could be determined from preferences
      time_availability: 'part_time' // 10 hours per week
    }
  };

  return moduleSpec;
}

/**
 * Determine focus areas based on skill gaps
 */
function determineFocusAreas(skillGaps) {
  const areas = new Set();
  
  skillGaps.forEach(gap => {
    if (gap.skill_type === 'category') {
      areas.add(gap.skill_name);
    } else if (gap.skill_type === 'skill_group') {
      areas.add(gap.skill_name.replace(/-/g, ' ').replace(/_/g, ' '));
    }
  });
  
  return Array.from(areas).slice(0, 3);
}

/**
 * Generate personalized course from skills gap analysis
 */
export async function generateCourseFromGaps(employeeId) {
  console.log('\n🎓 Generating Personalized Course from Skills Gaps...');

  try {
    // Step 1: Get employee information
    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select(`
        *,
        company_id,
        users!inner(full_name, email),
        st_employee_skills_profile!inner(*)
      `)
      .eq('id', employeeId)
      .single();

    if (empError || !employee) {
      throw new Error('Employee not found');
    }

    console.log(`Employee: ${employee.users.full_name}`);
    console.log(`Company: ${employee.company_id}`);

    // Step 2: Calculate skills gaps
    console.log('\n📊 Calculating skills gaps...');
    const gapAnalysis = await calculateSkillsGap(employeeId);

    if (gapAnalysis.skillGaps.length === 0) {
      console.log('✅ No skill gaps found! Employee meets all requirements.');
      return null;
    }

    // Step 3: Generate training plan
    const trainingPlan = generateTrainingPlan(gapAnalysis);
    console.log(`\n📋 Training Plan: ${trainingPlan.duration_weeks} weeks, ${trainingPlan.total_hours} hours`);

    // Step 4: Create module specification
    console.log('\n🔧 Creating course specification...');
    const moduleSpec = createModuleSpecFromGaps(gapAnalysis, {
      current_position: employee.position,
      total_experience_years: employee.cv_extracted_data?.total_experience_years,
      current_skills: employee.st_employee_skills_profile[0]?.extracted_skills?.map(s => s.skill_name)
    });

    console.log(`Module: ${moduleSpec.module_name}`);
    console.log(`Priority: ${moduleSpec.priority_level}`);
    console.log(`Duration: ${moduleSpec.duration_weeks} weeks`);

    // Step 5: Create course content (using direct Supabase instead of ContentManager for now)
    console.log('\n📚 Generating course content...');
    
    const courseContent = {
      company_id: employee.company_id,
      module_name: moduleSpec.module_name,
      employee_name: moduleSpec.employee_name,
      session_id: `session_${Date.now()}`,
      introduction: `Welcome to your personalized skills development program. This ${moduleSpec.duration_weeks}-week course is designed to close your skill gaps and prepare you for the ${moduleSpec.career_goal} role.`,
      core_content: `This course focuses on developing the following skills: ${moduleSpec.learning_objectives.map(obj => obj.skill).join(', ')}. Each module includes hands-on exercises and real-world applications.`,
      practical_applications: `You will work on projects that directly apply to your role, including: ${moduleSpec.key_tools.join(', ')}`,
      assessments: `Regular assessments will track your progress in: ${moduleSpec.focus_areas.join(', ')}`,
      module_spec: moduleSpec,
      status: 'draft',
      priority_level: moduleSpec.priority_level,
      created_by: employee.user_id,
      total_word_count: 5000 // Placeholder
    };

    const { data: createdContent, error: contentError } = await supabase
      .from('cm_module_content')
      .insert(courseContent)
      .select()
      .single();

    if (contentError) throw contentError;
    console.log(`✅ Course created: ${createdContent.content_id}`);

    // Step 6: Create course assignment
    console.log('\n📝 Creating course assignment...');
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (moduleSpec.duration_weeks * 7)); // Set due date based on duration

    const { data: assignment, error: assignError } = await supabase
      .from('course_assignments')
      .insert({
        employee_id: employeeId,
        course_id: createdContent.content_id,
        company_id: employee.company_id,
        assigned_by: employee.user_id, // Self-assigned for now
        due_date: dueDate.toISOString(),
        priority: moduleSpec.priority_level === 'high' ? 'high' : 'medium',
        status: 'assigned'
      })
      .select()
      .single();

    if (assignError) throw assignError;

    console.log(`✅ Course assigned to employee (Due: ${dueDate.toLocaleDateString()})`);

    // Step 7: Update course content with assignment info
    await supabase
      .from('cm_module_content')
      .update({
        assigned_to: employeeId,
        module_spec: {
          ...moduleSpec,
          assignment_id: assignment.id,
          training_plan: trainingPlan
        }
      })
      .eq('content_id', createdContent.content_id);

    console.log('\n🎉 Course generation completed successfully!');

    return {
      courseId: createdContent.content_id,
      assignmentId: assignment.id,
      courseName: moduleSpec.module_name,
      duration: moduleSpec.duration_weeks,
      totalHours: moduleSpec.estimated_hours,
      skillsTargeted: moduleSpec.learning_objectives.length,
      dueDate: dueDate.toISOString(),
      focusAreas: moduleSpec.focus_areas
    };

  } catch (error) {
    console.error('❌ Course generation failed:', error);
    throw error;
  }
}

/**
 * Generate courses for all employees with skill gaps
 */
export async function generateCoursesForAllEmployees(companyId) {
  console.log('\n🏢 Generating Courses for All Employees with Skill Gaps...');

  try {
    // Get all employees with analyzed CVs
    const { data: employees, error } = await supabase
      .from('employees')
      .select(`
        id,
        users!inner(full_name),
        st_employee_skills_profile!inner(skills_match_score)
      `)
      .eq('company_id', companyId)
      .eq('is_active', true);

    if (error) throw error;

    console.log(`Found ${employees.length} employees with analyzed CVs`);

    const results = {
      total: employees.length,
      successful: 0,
      failed: 0,
      courses: []
    };

    // Generate courses for employees with low skills match
    for (const employee of employees) {
      if (employee.st_employee_skills_profile[0]?.skills_match_score < 80) {
        try {
          console.log(`\n👤 Processing ${employee.users.full_name}...`);
          const course = await generateCourseFromGaps(employee.id);
          
          if (course) {
            results.successful++;
            results.courses.push({
              employeeName: employee.users.full_name,
              ...course
            });
          }
        } catch (error) {
          console.error(`Failed for ${employee.users.full_name}:`, error.message);
          results.failed++;
        }
      }
    }

    console.log('\n📊 Batch Course Generation Summary:');
    console.log(`Total Processed: ${results.total}`);
    console.log(`Courses Generated: ${results.successful}`);
    console.log(`Failed: ${results.failed}`);

    return results;

  } catch (error) {
    console.error('❌ Batch course generation failed:', error);
    throw error;
  }
}

// Test function
async function testCourseGeneration() {
  // Get a test employee with CV analysis and skill gaps
  const { data: employees } = await supabase
    .from('st_employee_skills_profile')
    .select('employee_id')
    .limit(1);

  if (!employees || employees.length === 0) {
    console.error('❌ No employees with analyzed CVs found. Run CV analysis first.');
    return;
  }

  const testEmployeeId = employees[0].employee_id;
  console.log(`\n🧪 Testing course generation for employee: ${testEmployeeId}`);

  try {
    const result = await generateCourseFromGaps(testEmployeeId);
    
    if (result) {
      console.log('\n✅ Course Generation Test Results:');
      console.log(`Course ID: ${result.courseId}`);
      console.log(`Course Name: ${result.courseName}`);
      console.log(`Duration: ${result.duration} weeks`);
      console.log(`Total Hours: ${result.totalHours}`);
      console.log(`Skills Targeted: ${result.skillsTargeted}`);
      console.log(`Focus Areas: ${result.focusAreas.join(', ')}`);
      console.log(`Due Date: ${new Date(result.dueDate).toLocaleDateString()}`);
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Export for use in other scripts
export default {
  generateCourseFromGaps,
  generateCoursesForAllEmployees
};

// Run test if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testCourseGeneration();
}