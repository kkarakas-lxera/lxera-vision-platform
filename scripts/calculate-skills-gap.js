import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

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
 * Calculate the gap between current and required proficiency levels
 */
function calculateGapSeverity(currentLevel, requiredLevel) {
  const gap = requiredLevel - currentLevel;
  
  if (gap <= 0) return { gap: 0, severity: 'none' };
  if (gap === 1) return { gap, severity: 'minor' };
  if (gap === 2) return { gap, severity: 'moderate' };
  if (gap >= 3) return { gap, severity: 'critical' };
  
  return { gap, severity: 'unknown' };
}

/**
 * Convert proficiency level string to numeric value
 */
function proficiencyToNumeric(proficiency) {
  const levels = {
    'beginner': 1,
    'basic': 2,
    'intermediate': 3,
    'advanced': 4,
    'expert': 5
  };
  
  return levels[proficiency?.toLowerCase()] || 3; // Default to intermediate
}

/**
 * Calculate skills gap for an employee
 */
export async function calculateSkillsGap(employeeId) {
  console.log('\n📊 Calculating Skills Gap...');

  try {
    // Get employee's skills profile
    const { data: skillsProfile, error: profileError } = await supabase
      .from('st_employee_skills_profile')
      .select(`
        *,
        employees!inner(
          id,
          current_position_id,
          target_position_id,
          users!inner(full_name, email)
        )
      `)
      .eq('employee_id', employeeId)
      .single();

    if (profileError || !skillsProfile) {
      throw new Error('Skills profile not found. Please analyze CV first.');
    }

    console.log(`Employee: ${skillsProfile.employees.users.full_name}`);

    // Get position requirements
    const positionId = skillsProfile.target_position_id || skillsProfile.current_position_id;
    
    if (!positionId) {
      throw new Error('No position assigned to employee');
    }

    const { data: position, error: positionError } = await supabase
      .from('st_company_positions')
      .select('*')
      .eq('id', positionId)
      .single();

    if (positionError || !position) {
      throw new Error('Position not found');
    }

    console.log(`Target Position: ${position.position_title}`);

    // Extract employee's current skills
    const employeeSkills = new Map();
    skillsProfile.extracted_skills.forEach(skill => {
      if (skill.skill_id) {
        employeeSkills.set(skill.skill_id, {
          name: skill.skill_name,
          currentLevel: skill.proficiency_level || 1,
          evidence: skill.evidence,
          yearsExperience: skill.years_experience
        });
      }
    });

    // Calculate gaps for required skills
    const skillGaps = [];
    const requiredSkills = position.required_skills || [];
    
    requiredSkills.forEach(required => {
      const currentSkill = employeeSkills.get(required.skill_id);
      const requiredLevel = proficiencyToNumeric(required.proficiency_level);
      const currentLevel = currentSkill ? currentSkill.currentLevel : 0;
      
      const { gap, severity } = calculateGapSeverity(currentLevel, requiredLevel);
      
      if (gap > 0) {
        skillGaps.push({
          skill_id: required.skill_id,
          skill_name: required.skill_name,
          skill_type: required.skill_type,
          current_level: currentLevel,
          required_level: requiredLevel,
          gap_size: gap,
          gap_severity: severity,
          is_mandatory: true,
          evidence: currentSkill?.evidence || 'No evidence found',
          training_priority: severity === 'critical' ? 'high' : 
                           severity === 'moderate' ? 'medium' : 'low'
        });
      }
    });

    // Calculate gaps for nice-to-have skills
    const niceToHaveSkills = position.nice_to_have_skills || [];
    
    niceToHaveSkills.forEach(nice => {
      const currentSkill = employeeSkills.get(nice.skill_id);
      const requiredLevel = proficiencyToNumeric(nice.proficiency_level);
      const currentLevel = currentSkill ? currentSkill.currentLevel : 0;
      
      const { gap, severity } = calculateGapSeverity(currentLevel, requiredLevel);
      
      if (gap > 0) {
        skillGaps.push({
          skill_id: nice.skill_id,
          skill_name: nice.skill_name,
          skill_type: nice.skill_type,
          current_level: currentLevel,
          required_level: requiredLevel,
          gap_size: gap,
          gap_severity: severity,
          is_mandatory: false,
          evidence: currentSkill?.evidence || 'No evidence found',
          training_priority: 'low'
        });
      }
    });

    // Calculate overall scores
    const totalRequired = requiredSkills.length;
    const metRequired = requiredSkills.filter(req => 
      employeeSkills.has(req.skill_id) && 
      employeeSkills.get(req.skill_id).currentLevel >= proficiencyToNumeric(req.proficiency_level)
    ).length;

    const skillsMatchScore = totalRequired > 0 
      ? Math.round((metRequired / totalRequired) * 100) 
      : 100;

    const criticalGaps = skillGaps.filter(g => g.gap_severity === 'critical' && g.is_mandatory).length;
    const careerReadinessScore = Math.max(0, 100 - (criticalGaps * 20));

    // Update skills profile with gap analysis
    await supabase
      .from('st_employee_skills_profile')
      .update({
        skills_match_score: skillsMatchScore,
        career_readiness_score: careerReadinessScore,
        updated_at: new Date().toISOString()
      })
      .eq('id', skillsProfile.id);

    console.log('\n📈 Gap Analysis Results:');
    console.log(`Skills Match Score: ${skillsMatchScore}%`);
    console.log(`Career Readiness Score: ${careerReadinessScore}%`);
    console.log(`Total Gaps Identified: ${skillGaps.length}`);
    console.log(`Critical Gaps: ${skillGaps.filter(g => g.gap_severity === 'critical').length}`);
    console.log(`Moderate Gaps: ${skillGaps.filter(g => g.gap_severity === 'moderate').length}`);
    console.log(`Minor Gaps: ${skillGaps.filter(g => g.gap_severity === 'minor').length}`);

    return {
      employeeId,
      employeeName: skillsProfile.employees.users.full_name,
      positionTitle: position.position_title,
      skillsMatchScore,
      careerReadinessScore,
      skillGaps: skillGaps.sort((a, b) => {
        // Sort by priority and severity
        if (a.is_mandatory !== b.is_mandatory) return b.is_mandatory ? 1 : -1;
        if (a.gap_severity !== b.gap_severity) {
          const severityOrder = { critical: 0, moderate: 1, minor: 2 };
          return severityOrder[a.gap_severity] - severityOrder[b.gap_severity];
        }
        return b.gap_size - a.gap_size;
      }),
      summary: {
        totalRequired: totalRequired,
        metRequired: metRequired,
        totalGaps: skillGaps.length,
        criticalGaps: skillGaps.filter(g => g.gap_severity === 'critical').length,
        trainingHours: estimateTrainingHours(skillGaps)
      }
    };

  } catch (error) {
    console.error('❌ Skills gap calculation failed:', error);
    throw error;
  }
}

/**
 * Estimate training hours based on skill gaps
 */
function estimateTrainingHours(skillGaps) {
  let totalHours = 0;
  
  skillGaps.forEach(gap => {
    // Base hours per proficiency level gap
    const baseHours = {
      1: 20,  // 1 level gap = 20 hours
      2: 50,  // 2 level gap = 50 hours
      3: 100, // 3 level gap = 100 hours
      4: 150  // 4 level gap = 150 hours
    };
    
    let hours = baseHours[gap.gap_size] || 100;
    
    // Adjust for skill complexity
    if (gap.skill_type === 'skill_cluster' || gap.skill_type === 'skill') {
      hours *= 0.8; // More specific skills take less time
    }
    
    // Adjust for priority
    if (!gap.is_mandatory) {
      hours *= 0.7; // Nice-to-have skills get less time
    }
    
    totalHours += hours;
  });
  
  return Math.round(totalHours);
}

/**
 * Generate training recommendations from skill gaps
 */
export function generateTrainingPlan(gapAnalysis) {
  const { skillGaps, summary } = gapAnalysis;
  
  // Group gaps by severity and type
  const criticalTechnical = skillGaps.filter(g => 
    g.gap_severity === 'critical' && g.skill_type !== 'soft_skill'
  );
  
  const criticalSoft = skillGaps.filter(g => 
    g.gap_severity === 'critical' && g.skill_type === 'soft_skill'
  );
  
  // Create 4-6 week training plan
  const weeklyHours = 10; // Assume 10 hours per week for training
  const totalWeeks = Math.ceil(summary.trainingHours / weeklyHours);
  const targetWeeks = Math.min(Math.max(totalWeeks, 4), 6); // Clamp between 4-6 weeks
  
  const trainingPlan = {
    duration_weeks: targetWeeks,
    total_hours: summary.trainingHours,
    weekly_commitment: weeklyHours,
    focus_areas: [
      ...criticalTechnical.slice(0, 3).map(g => ({
        skill_name: g.skill_name,
        priority: 'critical',
        estimated_hours: Math.round(summary.trainingHours * 0.3)
      })),
      ...criticalSoft.slice(0, 2).map(g => ({
        skill_name: g.skill_name,
        priority: 'high',
        estimated_hours: Math.round(summary.trainingHours * 0.15)
      }))
    ],
    recommended_approach: determineApproach(skillGaps),
    success_metrics: [
      `Achieve ${gapAnalysis.careerReadinessScore + 20}% career readiness`,
      `Close ${criticalTechnical.length} critical technical gaps`,
      'Complete all mandatory skill requirements'
    ]
  };
  
  return trainingPlan;
}

/**
 * Determine training approach based on gaps
 */
function determineApproach(skillGaps) {
  const hasManyCritical = skillGaps.filter(g => g.gap_severity === 'critical').length > 3;
  const hasTechnicalGaps = skillGaps.some(g => g.skill_type === 'skill' || g.skill_type === 'skill_cluster');
  
  if (hasManyCritical) {
    return 'intensive_bootcamp';
  } else if (hasTechnicalGaps) {
    return 'project_based_learning';
  } else {
    return 'self_paced_modules';
  }
}

// Test function
async function testSkillsGapCalculation() {
  // Get a test employee with CV analysis
  const { data: employees } = await supabase
    .from('st_employee_skills_profile')
    .select('employee_id')
    .limit(1);

  if (!employees || employees.length === 0) {
    console.error('❌ No employees with analyzed CVs found. Run CV analysis first.');
    return;
  }

  const testEmployeeId = employees[0].employee_id;
  console.log(`\n🧪 Testing skills gap calculation for employee: ${testEmployeeId}`);

  try {
    const gapAnalysis = await calculateSkillsGap(testEmployeeId);
    
    console.log('\n🎯 Top Skill Gaps:');
    gapAnalysis.skillGaps.slice(0, 5).forEach((gap, index) => {
      console.log(`${index + 1}. ${gap.skill_name}`);
      console.log(`   Current: Level ${gap.current_level} → Required: Level ${gap.required_level}`);
      console.log(`   Gap: ${gap.gap_size} levels (${gap.gap_severity})`);
      console.log(`   Priority: ${gap.training_priority}`);
    });

    // Generate training plan
    const trainingPlan = generateTrainingPlan(gapAnalysis);
    
    console.log('\n📚 Recommended Training Plan:');
    console.log(`Duration: ${trainingPlan.duration_weeks} weeks`);
    console.log(`Total Hours: ${trainingPlan.total_hours}`);
    console.log(`Weekly Commitment: ${trainingPlan.weekly_commitment} hours`);
    console.log(`Approach: ${trainingPlan.recommended_approach}`);
    
    console.log('\nFocus Areas:');
    trainingPlan.focus_areas.forEach((area, index) => {
      console.log(`${index + 1}. ${area.skill_name} (${area.priority}) - ${area.estimated_hours} hours`);
    });

    return gapAnalysis;

  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Export for use in other scripts
export default {
  calculateSkillsGap,
  generateTrainingPlan
};

// Run test if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testSkillsGapCalculation();
}