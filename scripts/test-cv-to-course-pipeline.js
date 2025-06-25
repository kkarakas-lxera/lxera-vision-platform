import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import fs from 'fs';
import { analyzeCV } from './cv-analysis-service.js';
import { calculateSkillsGap } from './calculate-skills-gap.js';
import { generateCourseFromGaps } from './generate-course-from-gaps.js';

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

// Sample CV content for different skill levels
const SAMPLE_CVS = {
  junior: `
ALICE JOHNSON
Junior Frontend Developer
alice.johnson@testcompany.com | LinkedIn: linkedin.com/in/alicejohnson

PROFESSIONAL SUMMARY
Motivated junior developer with 2 years of experience in web development. 
Strong foundation in HTML, CSS, and JavaScript with growing expertise in React.

WORK EXPERIENCE

Junior Frontend Developer | TestCompany Inc. | 2022 - Present
• Developed responsive UI components using React and Material-UI
• Collaborated with senior developers on feature implementation
• Fixed bugs and improved website performance
• Technologies: React, JavaScript, HTML5, CSS3, Git

Web Development Intern | StartupABC | 2021 - 2022
• Built landing pages using HTML, CSS, and vanilla JavaScript
• Assisted in WordPress site maintenance
• Learned version control with Git

EDUCATION
Bachelor of Science in Computer Science | State University | 2021

TECHNICAL SKILLS
Languages: JavaScript, HTML, CSS
Frameworks: React (beginner), Bootstrap
Tools: Git, VS Code, Chrome DevTools
Currently Learning: TypeScript, Node.js

PROJECTS
• Personal Portfolio Website - Built with React
• Todo App - JavaScript and local storage
`,

  senior: `
BOB SMITH
Senior Full-Stack Developer
bob.smith@testcompany.com | GitHub: github.com/bobsmith

PROFESSIONAL SUMMARY
Seasoned full-stack developer with 10+ years building enterprise applications.
Expert in React, Node.js, Python, and cloud architecture. Technical lead experience.

WORK EXPERIENCE

Senior Software Engineer | TestCompany Inc. | 2020 - Present
• Architected microservices platform serving 1M+ users
• Led team of 8 developers using Agile/Scrum methodology
• Implemented CI/CD pipelines reducing deployment time by 70%
• Mentored junior developers and conducted technical interviews
• Technologies: React, TypeScript, Node.js, Python, AWS, Docker, Kubernetes

Lead Developer | TechGiant Corp | 2016 - 2020
• Built scalable APIs handling 50K requests/second
• Designed database architecture for high-performance applications
• Introduced React/Redux architecture improving UI performance by 60%
• Technologies: React, Redux, Node.js, PostgreSQL, Redis, AWS

Software Engineer | Innovation Labs | 2013 - 2016
• Developed Python Django applications for enterprise clients
• Implemented real-time features using WebSockets
• Optimized database queries improving response time by 80%

EDUCATION
Master of Science in Computer Science | Tech University | 2013
Bachelor of Science in Software Engineering | State College | 2011

TECHNICAL SKILLS
Languages: JavaScript, TypeScript, Python, Java, Go, SQL
Frontend: React, Redux, Vue.js, Angular, HTML5, CSS3, SASS
Backend: Node.js, Express, Django, FastAPI, GraphQL
Databases: PostgreSQL, MongoDB, Redis, Elasticsearch
Cloud: AWS (Certified), GCP, Docker, Kubernetes, Terraform
Tools: Git, Jenkins, JIRA, Webpack, Babel

CERTIFICATIONS
• AWS Certified Solutions Architect – Professional
• Certified Kubernetes Administrator (CKA)
• Scrum Master Certification (CSM)

LANGUAGES
• English (Native)
• Spanish (Fluent)
• Mandarin (Conversational)
`
};

/**
 * Test the complete CV to Course pipeline
 */
async function testCompletePipeline() {
  console.log('🚀 Testing Complete CV Analysis to Course Generation Pipeline\n');

  // Check OpenAI API key
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY environment variable not set!');
    console.error('Please set it in your .env file or environment');
    console.error('Example: OPENAI_API_KEY=sk-...');
    return;
  }

  try {
    // Step 1: Get test employees
    console.log('1️⃣ Getting test employees...');
    const { data: employees } = await supabase
      .from('employees')
      .select(`
        id,
        position,
        current_position_id,
        target_position_id,
        users!inner(full_name, email)
      `)
      .eq('company_id', '48d3de72-ca8c-40fe-8f7b-8b0dc29cb7d8') // Test company
      .in('users.email', ['alice.johnson@testcompany.com', 'bob.smith@testcompany.com'])
      .limit(2);

    if (!employees || employees.length === 0) {
      console.error('❌ Test employees not found. Run employee import first.');
      return;
    }

    console.log(`✅ Found ${employees.length} test employees`);

    // Process each employee
    for (const employee of employees) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Processing: ${employee.users.full_name} (${employee.users.email})`);
      console.log(`${'='.repeat(60)}`);

      // Determine which CV to use based on email
      const cvContent = employee.users.email.includes('alice') 
        ? SAMPLE_CVS.junior 
        : SAMPLE_CVS.senior;

      // Save CV to temporary file
      const cvPath = `./temp-cv-${employee.id}.txt`;
      fs.writeFileSync(cvPath, cvContent);

      try {
        // Step 2: Analyze CV with OpenAI
        console.log('\n2️⃣ Analyzing CV with OpenAI...');
        const cvAnalysis = await analyzeCV(
          employee.id,
          cvPath,
          employee.current_position_id,
          employee.target_position_id
        );

        console.log(`\n📋 CV Analysis Results:`);
        console.log(`Summary: ${cvAnalysis.summary}`);
        console.log(`Total Skills Extracted: ${cvAnalysis.totalSkills}`);
        console.log(`NESTA Mapped Skills: ${cvAnalysis.nestaSkills}`);
        console.log(`Experience Years: ${cvAnalysis.experienceYears}`);

        // Step 3: Calculate Skills Gap
        console.log('\n3️⃣ Calculating skills gap...');
        const gapAnalysis = await calculateSkillsGap(employee.id);

        console.log(`\n📊 Skills Gap Analysis:`);
        console.log(`Position: ${gapAnalysis.positionTitle}`);
        console.log(`Skills Match Score: ${gapAnalysis.skillsMatchScore}%`);
        console.log(`Career Readiness: ${gapAnalysis.careerReadinessScore}%`);
        console.log(`Total Gaps: ${gapAnalysis.skillGaps.length}`);
        console.log(`Critical Gaps: ${gapAnalysis.summary.criticalGaps}`);

        if (gapAnalysis.skillGaps.length > 0) {
          console.log('\nTop 3 Skill Gaps:');
          gapAnalysis.skillGaps.slice(0, 3).forEach((gap, i) => {
            console.log(`${i + 1}. ${gap.skill_name} (Gap: ${gap.gap_size} levels, ${gap.gap_severity})`);
          });
        }

        // Step 4: Generate Personalized Course
        if (gapAnalysis.skillGaps.length > 0) {
          console.log('\n4️⃣ Generating personalized course...');
          const course = await generateCourseFromGaps(employee.id);

          if (course) {
            console.log(`\n🎓 Course Generated Successfully!`);
            console.log(`Course Name: ${course.courseName}`);
            console.log(`Duration: ${course.duration} weeks`);
            console.log(`Total Hours: ${course.totalHours}`);
            console.log(`Skills Targeted: ${course.skillsTargeted}`);
            console.log(`Focus Areas: ${course.focusAreas.join(', ')}`);
            console.log(`Due Date: ${new Date(course.dueDate).toLocaleDateString()}`);
            console.log(`Course ID: ${course.courseId}`);

            // Verify course content was created
            const { data: courseContent } = await supabase
              .from('cm_module_content')
              .select('module_name, status, total_word_count')
              .eq('content_id', course.courseId)
              .single();

            if (courseContent) {
              console.log(`\n✅ Course Content Verified:`);
              console.log(`Module: ${courseContent.module_name}`);
              console.log(`Status: ${courseContent.status}`);
              console.log(`Content Size: ${courseContent.total_word_count} words`);
            }
          }
        } else {
          console.log('\n✅ No skill gaps found! Employee meets all requirements.');
        }

      } finally {
        // Clean up temp file
        if (fs.existsSync(cvPath)) {
          fs.unlinkSync(cvPath);
        }
      }
    }

    // Step 5: Show Dashboard Summary
    console.log(`\n\n${'='.repeat(60)}`);
    console.log('📊 PIPELINE SUMMARY');
    console.log(`${'='.repeat(60)}`);

    const { data: profiles } = await supabase
      .from('st_employee_skills_profile')
      .select('skills_match_score, career_readiness_score')
      .in('employee_id', employees.map(e => e.id));

    const { data: assignments } = await supabase
      .from('course_assignments')
      .select('status')
      .in('employee_id', employees.map(e => e.id));

    console.log(`Employees Processed: ${employees.length}`);
    console.log(`CVs Analyzed: ${profiles?.length || 0}`);
    console.log(`Average Skills Match: ${Math.round(
      profiles?.reduce((sum, p) => sum + p.skills_match_score, 0) / profiles?.length || 0
    )}%`);
    console.log(`Courses Generated: ${assignments?.length || 0}`);

    console.log('\n✅ Pipeline test completed successfully!');
    console.log('\n🌐 Next Steps:');
    console.log('1. Login to dashboard: http://localhost:8080/dashboard/onboarding');
    console.log('2. View employee progress and skills analysis');
    console.log('3. Monitor course assignments and completion');

  } catch (error) {
    console.error('\n❌ Pipeline test failed:', error);
    console.error('Error details:', error.message);
  }
}

// Run the test
testCompletePipeline();