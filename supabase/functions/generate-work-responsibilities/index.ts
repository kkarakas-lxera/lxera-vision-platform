import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface WorkExperience {
  title: string;
  company: string;
  duration: string;
  employeeId?: string;
}

interface GeneratedDetails {
  responsibilities: string[];
  achievements: string[];
  technologies: string[];
}

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { workExperiences, employeeId } = await req.json() as { 
      workExperiences: WorkExperience[]; 
      employeeId?: string;
    };

    if (!workExperiences || workExperiences.length === 0) {
      throw new Error('No work experiences provided');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch employee's current position details if employeeId provided
    let positionContext = null;
    if (employeeId) {
      const { data: employee } = await supabase
        .from('employees')
        .select(`
          current_position_id,
          st_company_positions!employees_current_position_id_fkey (
            position_title,
            description,
            required_skills,
            nice_to_have_skills,
            department
          )
        `)
        .eq('id', employeeId)
        .single();

      if (employee?.st_company_positions) {
        positionContext = employee.st_company_positions;
      }
    }

    // Generate responsibilities for each work experience
    const results = await Promise.all(
      workExperiences.map(async (work) => {
        const systemPrompt = `You are an expert HR professional helping to generate detailed work responsibilities and achievements.

${positionContext ? `Context: The employee's current official position is "${positionContext.position_title}" with the following description:
${positionContext.description || 'No description available'}

Required skills for this position: ${positionContext.required_skills?.map((s: any) => s.skill_name).join(', ') || 'Not specified'}
Department: ${positionContext.department || 'Not specified'}

Generate responsibilities that align with both the actual job title "${work.title}" and the official position requirements.` : ''}

Generate realistic, specific responsibilities, achievements, and technologies for:
- Job Title: ${work.title}
- Company: ${work.company}
- Duration: ${work.duration}

Rules:
1. Responsibilities should be specific, actionable, and demonstrate impact
2. Include 4-6 key responsibilities that show progression and growth
3. Achievements should be measurable when possible
4. Technologies should be relevant to the role and industry
5. Use active voice starting with action verbs
6. Tailor to the seniority level implied by the title
7. Consider the company type and industry if known

Return JSON in this exact format:
{
  "responsibilities": ["responsibility 1", "responsibility 2", ...],
  "achievements": ["achievement 1", "achievement 2", ...],
  "technologies": ["tech 1", "tech 2", ...]
}`;

        const userPrompt = `Generate work details for: ${work.title} at ${work.company}`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4-turbo-preview',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.7,
            max_tokens: 800
          }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          console.error('OpenAI API error:', data);
          throw new Error(data.error?.message || 'Failed to generate responsibilities');
        }

        const generated = JSON.parse(data.choices[0].message.content) as GeneratedDetails;
        
        // Ensure arrays are properly formatted
        return {
          ...work,
          responsibilities: generated.responsibilities || [],
          achievements: generated.achievements || [],
          technologies: generated.technologies || []
        };
      })
    );

    return new Response(JSON.stringify({ 
      success: true, 
      workExperiences: results 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-work-responsibilities:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to generate responsibilities' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});