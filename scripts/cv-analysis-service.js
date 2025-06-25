import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
// import pdfParse from 'pdf-parse'; // Temporarily disabled due to module issue
import mammoth from 'mammoth';
import { config } from 'dotenv';

// Load environment variables
config();

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

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

if (!OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY environment variable not set!');
  console.error('Please set it in your .env file');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

/**
 * Extract text from various document formats
 */
async function extractTextFromFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  
  if (ext === '.pdf') {
    // const dataBuffer = fs.readFileSync(filePath);
    // const data = await pdfParse(dataBuffer);
    // return data.text;
    throw new Error('PDF parsing temporarily disabled. Please use .txt or .docx files.');
  } else if (ext === '.docx') {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } else if (ext === '.txt') {
    return fs.readFileSync(filePath, 'utf8');
  } else {
    throw new Error(`Unsupported file format: ${ext}`);
  }
}

/**
 * Analyze CV with OpenAI and extract structured information
 */
async function analyzeCVWithOpenAI(cvText, currentPosition, targetPosition) {
  const prompt = `You are an expert HR analyst specializing in skills assessment. Analyze the following CV and extract structured information.

CV Text:
${cvText}

${currentPosition ? `Current Position: ${currentPosition}` : ''}
${targetPosition ? `Target Position: ${targetPosition}` : ''}

Please extract and return the following information in JSON format:
{
  "summary": "A brief professional summary (2-3 sentences)",
  "extracted_skills": [
    {
      "skill_name": "The specific skill name",
      "category": "technical|soft|domain|tool",
      "proficiency_description": "Brief description of proficiency level",
      "years_experience": number or null,
      "evidence": "Specific evidence from CV that demonstrates this skill",
      "context": "Where/how this skill was used"
    }
  ],
  "work_experience": [
    {
      "company": "Company name",
      "position": "Job title",
      "duration": "Time period",
      "key_achievements": ["achievement1", "achievement2"],
      "technologies_used": ["tech1", "tech2"]
    }
  ],
  "education": [
    {
      "institution": "School/University name",
      "degree": "Degree type",
      "field": "Field of study",
      "graduation_year": "Year or expected year"
    }
  ],
  "certifications": ["cert1", "cert2"],
  "languages": [
    {
      "language": "Language name",
      "proficiency": "Native|Fluent|Intermediate|Basic"
    }
  ],
  "total_experience_years": number
}

Important instructions:
1. Extract ALL identifiable skills, including programming languages, frameworks, tools, methodologies, and soft skills
2. Be specific with skill names (e.g., "React.js" not just "JavaScript frameworks")
3. Provide actual evidence from the CV for each skill
4. Estimate years of experience based on work history and project descriptions
5. Categorize skills appropriately
6. Extract both technical and soft skills

Return only valid JSON.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert CV analyzer. Extract comprehensive skill information from CVs with high accuracy. Always return valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 4000,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(completion.choices[0].message.content);
    console.log(`✅ OpenAI extracted ${result.extracted_skills.length} skills`);
    return result;
  } catch (error) {
    console.error('❌ OpenAI API error:', error.message);
    throw error;
  }
}

/**
 * Map extracted skills to NESTA taxonomy
 */
async function mapSkillsToNESTA(extractedSkills) {
  const mappedSkills = [];

  for (const skill of extractedSkills) {
    try {
      // Search for skill in NESTA taxonomy
      const { data: matches, error } = await supabase
        .rpc('search_skills', {
          search_term: skill.skill_name,
          limit_count: 5
        });

      if (error) throw error;

      let mappedSkill;

      if (matches && matches.length > 0) {
        // Find best match based on relevance and skill type
        const bestMatch = matches[0];
        
        mappedSkill = {
          skill_id: bestMatch.skill_id,
          skill_name: bestMatch.skill_name,
          original_skill_name: skill.skill_name,
          skill_type: bestMatch.skill_type,
          hierarchy_level: bestMatch.hierarchy_level,
          proficiency_level: determineProficiencyLevel(skill.years_experience),
          years_experience: skill.years_experience,
          evidence: skill.evidence,
          context: skill.context,
          category: skill.category,
          match_confidence: bestMatch.relevance || 0.8,
          is_nesta_skill: true
        };
      } else {
        // No NESTA match found, store as custom skill
        mappedSkill = {
          skill_id: null,
          skill_name: skill.skill_name,
          original_skill_name: skill.skill_name,
          skill_type: 'custom',
          proficiency_level: determineProficiencyLevel(skill.years_experience),
          years_experience: skill.years_experience,
          evidence: skill.evidence,
          context: skill.context,
          category: skill.category,
          match_confidence: 1.0,
          is_nesta_skill: false
        };
      }

      mappedSkills.push(mappedSkill);
    } catch (error) {
      console.error(`Error mapping skill "${skill.skill_name}":`, error.message);
    }
  }

  console.log(`✅ Mapped ${mappedSkills.filter(s => s.is_nesta_skill).length}/${mappedSkills.length} skills to NESTA taxonomy`);
  return mappedSkills;
}

/**
 * Determine proficiency level based on years of experience
 */
function determineProficiencyLevel(yearsExperience) {
  if (!yearsExperience) return 2; // Default to basic
  if (yearsExperience < 1) return 1; // Beginner
  if (yearsExperience < 2) return 2; // Basic
  if (yearsExperience < 4) return 3; // Intermediate
  if (yearsExperience < 7) return 4; // Advanced
  return 5; // Expert
}

/**
 * Main CV analysis function
 */
export async function analyzeCV(employeeId, cvFilePath, currentPositionId, targetPositionId) {
  console.log('\n🔍 Starting CV Analysis...');
  console.log(`Employee ID: ${employeeId}`);
  console.log(`CV File: ${cvFilePath}`);

  try {
    // Step 1: Extract text from CV
    console.log('\n1. Extracting text from CV...');
    const cvText = await extractTextFromFile(cvFilePath);
    console.log(`✅ Extracted ${cvText.length} characters from CV`);

    // Get position information for context
    let currentPosition = null;
    let targetPosition = null;

    if (currentPositionId) {
      const { data } = await supabase
        .from('st_company_positions')
        .select('position_title')
        .eq('id', currentPositionId)
        .single();
      currentPosition = data?.position_title;
    }

    if (targetPositionId) {
      const { data } = await supabase
        .from('st_company_positions')
        .select('position_title')
        .eq('id', targetPositionId)
        .single();
      targetPosition = data?.position_title;
    }

    // Step 2: Analyze with OpenAI
    console.log('\n2. Analyzing CV with OpenAI...');
    const analysisResult = await analyzeCVWithOpenAI(cvText, currentPosition, targetPosition);

    // Step 3: Map skills to NESTA taxonomy
    console.log('\n3. Mapping skills to NESTA taxonomy...');
    const mappedSkills = await mapSkillsToNESTA(analysisResult.extracted_skills);

    // Step 4: Calculate initial skills match score (will be refined later with gap analysis)
    const nestaSkillsCount = mappedSkills.filter(s => s.is_nesta_skill).length;
    const skillsMatchScore = Math.round((nestaSkillsCount / mappedSkills.length) * 100);

    // Step 5: Save to database
    console.log('\n4. Saving analysis results...');
    
    const profileData = {
      employee_id: employeeId,
      cv_file_path: cvFilePath,
      cv_summary: analysisResult.summary,
      extracted_skills: mappedSkills,
      current_position_id: currentPositionId,
      target_position_id: targetPositionId,
      skills_match_score: skillsMatchScore,
      career_readiness_score: skillsMatchScore, // Will be refined with gap analysis
      analyzed_at: new Date().toISOString()
    };

    const { data: savedProfile, error: saveError } = await supabase
      .from('st_employee_skills_profile')
      .upsert(profileData)
      .select()
      .single();

    if (saveError) throw saveError;

    // Update employee record
    await supabase
      .from('employees')
      .update({
        cv_file_path: cvFilePath,
        cv_extracted_data: {
          work_experience: analysisResult.work_experience,
          education: analysisResult.education,
          certifications: analysisResult.certifications,
          languages: analysisResult.languages,
          total_experience_years: analysisResult.total_experience_years
        },
        skills_last_analyzed: new Date().toISOString()
      })
      .eq('id', employeeId);

    console.log('✅ CV analysis completed successfully!');

    return {
      profileId: savedProfile.id,
      summary: analysisResult.summary,
      totalSkills: mappedSkills.length,
      nestaSkills: nestaSkillsCount,
      skillsMatchScore,
      experienceYears: analysisResult.total_experience_years,
      extractedSkills: mappedSkills
    };

  } catch (error) {
    console.error('❌ CV analysis failed:', error);
    throw error;
  }
}

// Test function
async function testCVAnalysis() {

  // Create a sample CV file for testing
  const sampleCV = `
JOHN DOE
Senior Software Engineer
john.doe@email.com | +1-234-567-8900 | LinkedIn: linkedin.com/in/johndoe

PROFESSIONAL SUMMARY
Experienced full-stack developer with 8+ years building scalable web applications. 
Expertise in React, Node.js, Python, and cloud technologies. Led teams of 5+ developers.

WORK EXPERIENCE

Senior Software Engineer | TechCorp Inc. | 2019 - Present
• Led development of microservices architecture using Node.js and Docker
• Implemented CI/CD pipelines with Jenkins and GitLab
• Mentored junior developers and conducted code reviews
• Technologies: React, TypeScript, Node.js, PostgreSQL, AWS, Docker

Software Engineer | StartupXYZ | 2016 - 2019  
• Built RESTful APIs with Python Django and Flask
• Developed responsive frontend applications with React and Redux
• Improved application performance by 40% through optimization
• Technologies: Python, JavaScript, React, MongoDB, Redis

Junior Developer | WebAgency | 2015 - 2016
• Created websites using HTML, CSS, JavaScript
• Worked with WordPress and PHP
• Collaborated with design team on UI/UX improvements

EDUCATION
Bachelor of Science in Computer Science | State University | 2015

TECHNICAL SKILLS
Languages: JavaScript, TypeScript, Python, Java, SQL
Frameworks: React, Node.js, Express, Django, Flask
Databases: PostgreSQL, MongoDB, Redis, MySQL
Cloud: AWS (EC2, S3, Lambda), Docker, Kubernetes
Tools: Git, Jenkins, JIRA, Agile/Scrum

CERTIFICATIONS
• AWS Certified Developer – Associate
• Certified Scrum Master (CSM)

LANGUAGES
• English (Native)
• Spanish (Intermediate)
`;

  // Save sample CV
  const cvPath = './test-cv.txt';
  fs.writeFileSync(cvPath, sampleCV);

  // Get a test employee
  const { data: employees } = await supabase
    .from('employees')
    .select('id, current_position_id, target_position_id')
    .limit(1);

  if (!employees || employees.length === 0) {
    console.error('❌ No test employees found. Run employee import first.');
    return;
  }

  const testEmployee = employees[0];
  console.log(`\n🧪 Testing CV analysis for employee: ${testEmployee.id}`);

  try {
    const result = await analyzeCV(
      testEmployee.id,
      cvPath,
      testEmployee.current_position_id,
      testEmployee.target_position_id
    );

    console.log('\n📊 Analysis Results:');
    console.log(`Profile ID: ${result.profileId}`);
    console.log(`Summary: ${result.summary}`);
    console.log(`Total Skills: ${result.totalSkills}`);
    console.log(`NESTA Mapped Skills: ${result.nestaSkills}`);
    console.log(`Skills Match Score: ${result.skillsMatchScore}%`);
    console.log(`Experience Years: ${result.experienceYears}`);

    console.log('\n🎯 Sample Extracted Skills:');
    result.extractedSkills.slice(0, 5).forEach((skill, index) => {
      console.log(`${index + 1}. ${skill.skill_name} (${skill.is_nesta_skill ? 'NESTA' : 'Custom'})`);
      console.log(`   Proficiency: Level ${skill.proficiency_level}`);
      console.log(`   Evidence: ${skill.evidence}`);
    });

    // Clean up
    fs.unlinkSync(cvPath);

  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Export for use in other scripts
export default {
  analyzeCV,
  extractTextFromFile,
  mapSkillsToNESTA
};

// Run test if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testCVAnalysis();
}