import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { employeeId } = await req.json();
    
    if (!employeeId) {
      throw new Error('Employee ID is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get CV analysis data from the enhanced skills profile
    const { data: skillsProfile, error: fetchError } = await supabase
      .from('st_employee_skills_profile')
      .select('*')
      .eq('employee_id', employeeId)
      .single();

    if (fetchError || !skillsProfile) {
      throw new Error('No CV analysis data found');
    }

    // Also get the raw CV extracted data from employees table
    const { data: employee } = await supabase
      .from('employees')
      .select('cv_extracted_data')
      .eq('id', employeeId)
      .single();

    const cvData = employee?.cv_extracted_data || {};
    const skillsData = skillsProfile;
    const importResults = {
      sectionsImported: [],
      errors: []
    };

    // Import basic info - derive from skills profile summary
    if (skillsData.cv_summary) {
      const { error } = await supabase
        .from('employee_profile_sections')
        .upsert({
          employee_id: employeeId,
          section_name: 'basic_info',
          data: {
            summary: skillsData.cv_summary,
            experienceYears: skillsData.experience_years || 0,
            educationLevel: skillsData.education_level
          },
          is_complete: false, // User needs to verify
          updated_at: new Date().toISOString()
        }, { onConflict: 'employee_id,section_name' });

      if (error) {
        importResults.errors.push({ section: 'basic_info', error: error.message });
      } else {
        importResults.sectionsImported.push('basic_info');
      }
    }

    // Import work experience
    if (cvData.work_experience && cvData.work_experience.length > 0) {
      // Transform work experience data to match the expected format
      const transformedExperiences = cvData.work_experience.map((job: any) => ({
        id: crypto.randomUUID(),
        title: job.title || job.position || '',
        company: job.company || '',
        startDate: job.startDate || job.start_date || '',
        endDate: job.current ? null : (job.endDate || job.end_date || ''),
        current: job.current || false,
        description: job.description || 
                    (job.responsibilities && job.achievements ? 
                      `Responsibilities:\n${Array.isArray(job.responsibilities) ? job.responsibilities.join('\n') : job.responsibilities}\n\nAchievements:\n${Array.isArray(job.achievements) ? job.achievements.join('\n') : job.achievements}` :
                      (job.responsibilities ? (Array.isArray(job.responsibilities) ? job.responsibilities.join('\n') : job.responsibilities) : 
                       (job.achievements ? (Array.isArray(job.achievements) ? job.achievements.join('\n') : job.achievements) : ''))),
        duration: job.duration || '',
        technologies: job.technologies || [],
        responsibilities: job.responsibilities || [],
        achievements: job.achievements || []
      }));

      const { error } = await supabase
        .from('employee_profile_sections')
        .upsert({
          employee_id: employeeId,
          section_name: 'work_experience',
          data: transformedExperiences, // This is already an array, which is what WorkExperienceSection expects
          is_complete: false,
          updated_at: new Date().toISOString()
        }, { onConflict: 'employee_id,section_name' });

      if (error) {
        importResults.errors.push({ section: 'work_experience', error: error.message });
      } else {
        importResults.sectionsImported.push('work_experience');
      }

      // Also populate current work if the person has a current job
      const currentJob = cvData.work_experience.find((job: any) => job.current === true);
      if (currentJob) {
        await supabase
          .from('employee_current_work')
          .upsert({
            employee_id: employeeId,
            project_name: `Current Role at ${currentJob.company}`,
            role_in_project: currentJob.title || currentJob.position,
            description: currentJob.description || 
                        (currentJob.responsibilities ? 
                          (Array.isArray(currentJob.responsibilities) ? currentJob.responsibilities.join('\n') : currentJob.responsibilities) : 
                          ''),
            technologies: currentJob.technologies || [],
            start_date: currentJob.startDate || currentJob.start_date,
            is_primary: true,
            status: 'active'
          }, { onConflict: 'employee_id,project_name' });
      }
    }

    // Import education
    if (cvData.education && cvData.education.length > 0) {
      const { error } = await supabase
        .from('employee_profile_sections')
        .upsert({
          employee_id: employeeId,
          section_name: 'education',
          data: { education: cvData.education },
          is_complete: false,
          updated_at: new Date().toISOString()
        }, { onConflict: 'employee_id,section_name' });

      if (error) {
        importResults.errors.push({ section: 'education', error: error.message });
      } else {
        importResults.sectionsImported.push('education');
      }
    }

    // Import skills from enhanced analysis
    if (skillsData.extracted_skills && skillsData.extracted_skills.length > 0) {
      const { error } = await supabase
        .from('employee_profile_sections')
        .upsert({
          employee_id: employeeId,
          section_name: 'skills',
          data: { 
            skills: skillsData.extracted_skills,
            technicalSkills: skillsData.technical_skills || [],
            softSkills: skillsData.soft_skills || []
          },
          is_complete: false,
          updated_at: new Date().toISOString()
        }, { onConflict: 'employee_id,section_name' });

      if (error) {
        importResults.errors.push({ section: 'skills', error: error.message });
      } else {
        importResults.sectionsImported.push('skills');
      }
    }

    // Import certifications
    if (cvData.certifications && cvData.certifications.length > 0) {
      const { error } = await supabase
        .from('employee_profile_sections')
        .upsert({
          employee_id: employeeId,
          section_name: 'certifications',
          data: { certifications: cvData.certifications },
          is_complete: false,
          updated_at: new Date().toISOString()
        }, { onConflict: 'employee_id,section_name' });

      if (error) {
        importResults.errors.push({ section: 'certifications', error: error.message });
      } else {
        importResults.sectionsImported.push('certifications');
      }
    }

    // Import languages
    if (skillsData.languages && skillsData.languages.length > 0) {
      const { error } = await supabase
        .from('employee_profile_sections')
        .upsert({
          employee_id: employeeId,
          section_name: 'languages',
          data: { languages: skillsData.languages },
          is_complete: false,
          updated_at: new Date().toISOString()
        }, { onConflict: 'employee_id,section_name' });

      if (error) {
        importResults.errors.push({ section: 'languages', error: error.message });
      } else {
        importResults.sectionsImported.push('languages');
      }
    }

    // Import projects
    if (cvData.projects && cvData.projects.length > 0) {
      const { error } = await supabase
        .from('employee_profile_sections')
        .upsert({
          employee_id: employeeId,
          section_name: 'projects',
          data: { projects: cvData.projects },
          is_complete: false,
          updated_at: new Date().toISOString()
        }, { onConflict: 'employee_id,section_name' });

      if (error) {
        importResults.errors.push({ section: 'projects', error: error.message });
      } else {
        importResults.sectionsImported.push('projects');
      }
    }

    // Import tools
    if (cvData.tools && cvData.tools.length > 0) {
      // Insert tools into employee_tools table
      for (const tool of cvData.tools) {
        await supabase
          .from('employee_tools')
          .upsert({
            employee_id: employeeId,
            tool_name: tool.name,
            category: tool.category,
            proficiency: tool.proficiency,
            years_experience: tool.yearsExperience
          }, { onConflict: 'employee_id,tool_name' });
      }

      // Also add to profile section
      const { error } = await supabase
        .from('employee_profile_sections')
        .upsert({
          employee_id: employeeId,
          section_name: 'tools_technologies',
          data: { tools: cvData.tools },
          is_complete: false,
          updated_at: new Date().toISOString()
        }, { onConflict: 'employee_id,section_name' });

      if (error) {
        importResults.errors.push({ section: 'tools_technologies', error: error.message });
      } else {
        importResults.sectionsImported.push('tools_technologies');
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        ...importResults,
        message: 'CV data imported successfully. Please review and complete each section.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('CV import error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});