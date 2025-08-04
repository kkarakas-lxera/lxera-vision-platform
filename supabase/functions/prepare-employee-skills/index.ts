import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

interface SkillForValidation {
  skill_name: string;
  skill_id: string | null;
  order: number;
  is_from_position: boolean;
  is_from_cv: boolean;
  priority: number;
  description?: string;
  areas_of_use?: string[];
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { employee_id } = await req.json()

    if (!employee_id) {
      throw new Error('employee_id is required')
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get employee with position information
    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select(`
        id,
        current_position_id,
        position,
        st_company_positions!employees_current_position_id_fkey (
          id,
          position_title,
          required_skills,
          nice_to_have_skills
        )
      `)
      .eq('id', employee_id)
      .single()

    if (empError || !employee) {
      throw new Error('Failed to fetch employee information')
    }

    // Get CV analysis results
    const { data: cvResults } = await supabase
      .from('cv_analysis_results')
      .select('extracted_skills')
      .eq('employee_id', employee_id)
      .eq('analysis_status', 'completed')
      .single()

    // Combine skills intelligently
    const validationSkills = combineSkillsForValidation(
      employee.st_company_positions?.required_skills || [],
      employee.st_company_positions?.nice_to_have_skills || [],
      cvResults?.extracted_skills || []
    )
    
    // Add descriptions and areas of use
    const enrichedSkills = await enrichSkillsWithDescriptions(validationSkills)

    // Return ordered list (max 30)
    return new Response(
      JSON.stringify({ 
        skills: enrichedSkills.slice(0, 30),
        total: enrichedSkills.length,
        position_title: employee.st_company_positions?.position_title || employee.position
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in prepare-employee-skills:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})

function combineSkillsForValidation(
  requiredSkills: any[],
  niceToHaveSkills: any[],
  cvSkills: any[]
): SkillForValidation[] {
  const skillMap = new Map<string, SkillForValidation>()
  let order = 0

  // Priority 1: Required position skills
  requiredSkills.forEach(skill => {
    const skillKey = normalizeSkillName(skill.skill_name)
    const cvMatch = findSkillInCV(skill.skill_name, cvSkills)
    
    skillMap.set(skillKey, {
      skill_name: skill.skill_name,
      skill_id: skill.skill_id || null,
      order: order++,
      is_from_position: true,
      is_from_cv: !!cvMatch,
      priority: 1
    })
  })

  // Priority 2: Nice-to-have position skills
  niceToHaveSkills.forEach(skill => {
    const skillKey = normalizeSkillName(skill.skill_name)
    if (!skillMap.has(skillKey)) {
      const cvMatch = findSkillInCV(skill.skill_name, cvSkills)
      
      skillMap.set(skillKey, {
        skill_name: skill.skill_name,
        skill_id: skill.skill_id || null,
        order: order++,
        is_from_position: true,
        is_from_cv: !!cvMatch,
        priority: 2
      })
    }
  })

  // Priority 3: CV skills not in position (only valid/clean ones)
  cvSkills.forEach(cvSkill => {
    const skillKey = normalizeSkillName(cvSkill.skill_name)
    
    // Skip if already added or if it's not a valid skill
    if (!skillMap.has(skillKey) && isValidSkill(cvSkill)) {
      skillMap.set(skillKey, {
        skill_name: cvSkill.skill_name,
        skill_id: cvSkill.skill_id || null,
        order: order++,
        is_from_position: false,
        is_from_cv: true,
        priority: 3
      })
    }
  })

  // Sort by priority and order
  return Array.from(skillMap.values())
    .sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority
      return a.order - b.order
    })
}

function normalizeSkillName(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '')
}

function findSkillInCV(skillName: string, cvSkills: any[]): any {
  const normalized = normalizeSkillName(skillName)
  return cvSkills.find(cvSkill => 
    normalizeSkillName(cvSkill.skill_name) === normalized ||
    similarityMatch(cvSkill.skill_name, skillName) > 0.8
  )
}

function isValidSkill(skill: any): boolean {
  const name = skill.skill_name || ''
  
  // Filter out obvious non-skills
  if (name.length < 2 || name.length > 50) return false
  if (name.includes(' - ') && name.includes(' ')) return false // Likely a phrase
  if (/[^\w\s\.\+\#\-]/.test(name)) return false // Contains special chars
  
  // Must be technical or soft skill category
  return skill.category === 'technical' || skill.category === 'soft'
}

function similarityMatch(str1: string, str2: string): number {
  const s1 = str1.toLowerCase()
  const s2 = str2.toLowerCase()
  
  // Exact match
  if (s1 === s2) return 1
  
  // One contains the other
  if (s1.includes(s2) || s2.includes(s1)) return 0.9
  
  // Common variations
  const variations = [
    ['javascript', 'js'],
    ['typescript', 'ts'],
    ['react', 'reactjs', 'react.js'],
    ['node', 'nodejs', 'node.js'],
    ['postgres', 'postgresql'],
    ['mongo', 'mongodb']
  ]
  
  for (const group of variations) {
    if (group.includes(s1) && group.includes(s2)) return 0.95
  }
  
  return 0
}

async function enrichSkillsWithDescriptions(skills: SkillForValidation[]): Promise<SkillForValidation[]> {
  // Add contextual descriptions for common skills
  const skillDescriptions: Record<string, { description: string; areas: string[] }> = {
    // Programming Languages
    'python': {
      description: 'High-level programming language known for simplicity and versatility',
      areas: ['Data Science', 'Web Development', 'Automation', 'Machine Learning', 'DevOps']
    },
    'javascript': {
      description: 'Dynamic programming language essential for web development',
      areas: ['Frontend Development', 'Backend (Node.js)', 'Mobile Apps', 'Desktop Apps', 'Real-time Applications']
    },
    'typescript': {
      description: 'Typed superset of JavaScript that compiles to plain JavaScript',
      areas: ['Enterprise Applications', 'Large-scale Projects', 'Type-safe Development', 'Modern Web Apps']
    },
    'java': {
      description: 'Object-oriented programming language for enterprise applications',
      areas: ['Enterprise Software', 'Android Development', 'Web Services', 'Microservices', 'Big Data']
    },
    
    // Frameworks
    'react': {
      description: 'JavaScript library for building user interfaces',
      areas: ['Single Page Applications', 'Component-based UIs', 'Mobile Apps (React Native)', 'Progressive Web Apps']
    },
    'angular': {
      description: 'TypeScript-based framework for building web applications',
      areas: ['Enterprise Web Apps', 'Progressive Web Apps', 'Cross-platform Development', 'Large-scale Applications']
    },
    'vue': {
      description: 'Progressive JavaScript framework for building UIs',
      areas: ['Interactive Web Interfaces', 'Single Page Applications', 'Component Libraries', 'Rapid Prototyping']
    },
    
    // Backend
    'node.js': {
      description: 'JavaScript runtime for server-side development',
      areas: ['REST APIs', 'Real-time Apps', 'Microservices', 'Command Line Tools', 'Serverless Functions']
    },
    'express': {
      description: 'Minimal and flexible Node.js web application framework',
      areas: ['RESTful APIs', 'Web Applications', 'Middleware Development', 'Server-side Routing']
    },
    
    // Databases
    'sql': {
      description: 'Language for managing and querying relational databases',
      areas: ['Data Analysis', 'Database Design', 'Report Generation', 'Data Migration', 'Performance Optimization']
    },
    'postgresql': {
      description: 'Advanced open-source relational database',
      areas: ['Complex Queries', 'Data Integrity', 'JSON Storage', 'Full-text Search', 'Geospatial Data']
    },
    'mongodb': {
      description: 'NoSQL database for flexible, document-based storage',
      areas: ['Real-time Analytics', 'Content Management', 'IoT Applications', 'Mobile Apps', 'Catalogs']
    },
    
    // Cloud & DevOps
    'aws': {
      description: 'Amazon Web Services cloud computing platform',
      areas: ['Cloud Infrastructure', 'Serverless Computing', 'Storage Solutions', 'Machine Learning', 'Container Orchestration']
    },
    'docker': {
      description: 'Platform for developing, shipping, and running applications in containers',
      areas: ['Microservices', 'CI/CD Pipelines', 'Development Environments', 'Application Deployment', 'Cloud Migration']
    },
    'kubernetes': {
      description: 'Container orchestration platform for automating deployment and scaling',
      areas: ['Container Management', 'Auto-scaling', 'Service Discovery', 'Load Balancing', 'Rolling Updates']
    },
    
    // Soft Skills
    'project management': {
      description: 'Planning, executing, and closing projects successfully',
      areas: ['Team Coordination', 'Resource Planning', 'Risk Management', 'Stakeholder Communication', 'Timeline Management']
    },
    'leadership': {
      description: 'Ability to guide, inspire, and influence teams',
      areas: ['Team Building', 'Strategic Planning', 'Decision Making', 'Conflict Resolution', 'Mentoring']
    },
    'communication': {
      description: 'Effectively conveying information and ideas',
      areas: ['Presentations', 'Technical Writing', 'Client Relations', 'Team Collaboration', 'Stakeholder Management']
    },
    'agile': {
      description: 'Iterative approach to project management and software development',
      areas: ['Sprint Planning', 'Daily Standups', 'Retrospectives', 'User Stories', 'Continuous Improvement']
    },
    'problem solving': {
      description: 'Analyzing issues and developing effective solutions',
      areas: ['Root Cause Analysis', 'Critical Thinking', 'Creative Solutions', 'Decision Making', 'Process Improvement']
    }
  }
  
  return skills.map(skill => {
    const normalizedName = skill.skill_name.toLowerCase()
    const enrichedSkill = { ...skill }
    
    // Check for exact match
    if (skillDescriptions[normalizedName]) {
      enrichedSkill.description = skillDescriptions[normalizedName].description
      enrichedSkill.areas_of_use = skillDescriptions[normalizedName].areas
    } else {
      // Check for partial matches
      for (const [key, value] of Object.entries(skillDescriptions)) {
        if (normalizedName.includes(key) || key.includes(normalizedName)) {
          enrichedSkill.description = value.description
          enrichedSkill.areas_of_use = value.areas
          break
        }
      }
    }
    
    // If no description found, generate a generic one based on category
    if (!enrichedSkill.description) {
      if (skill.is_from_position) {
        enrichedSkill.description = `Key skill required for your current position`
        enrichedSkill.areas_of_use = ['Role-specific Tasks', 'Team Collaboration', 'Project Delivery']
      } else {
        enrichedSkill.description = `Skill identified from your professional experience`
        enrichedSkill.areas_of_use = ['Professional Development', 'Career Growth', 'Cross-functional Work']
      }
    }
    
    return enrichedSkill
  })
}