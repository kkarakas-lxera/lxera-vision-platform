import { supabase } from '@/integrations/supabase/client';

interface ModuleContentInfo {
  content_id: string;
  module_name: string;
  plan_id: string;
  created_at: string;
}

/**
 * Creates course module entries for a course assignment
 * This links multiple AI-generated content modules to a single course assignment
 */
export async function createCourseModules(
  assignmentId: string,
  planId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Fetch all module content for this plan
    const { data: modules, error: modulesError } = await supabase
      .from('cm_module_content')
      .select('content_id, module_name, plan_id, created_at')
      .eq('plan_id', planId)
      .order('created_at', { ascending: true });

    if (modulesError) throw modulesError;
    if (!modules || modules.length === 0) {
      throw new Error('No modules found for this course plan');
    }

    // Create course_modules entries
    const courseModules = modules.map((module, index) => ({
      assignment_id: assignmentId,
      content_id: module.content_id,
      module_number: index + 1,
      module_title: module.module_name,
      is_unlocked: index === 0, // Only first module is unlocked initially
      is_completed: false,
      progress_percentage: 0
    }));

    const { error: insertError } = await supabase
      .from('course_modules')
      .insert(courseModules);

    if (insertError) throw insertError;

    // Update course assignment with total modules count
    const { error: updateError } = await supabase
      .from('course_assignments')
      .update({ 
        total_modules: modules.length,
        modules_completed: 0
      })
      .eq('id', assignmentId);

    if (updateError) throw updateError;

    return { success: true };
  } catch (error) {
    console.error('Error creating course modules:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Updates module progress when a section is completed
 */
export async function updateModuleProgress(
  moduleId: string,
  sectionName: string,
  isCompleted: boolean
): Promise<void> {
  try {
    // Get current module and its sections progress
    const { data: module } = await supabase
      .from('course_modules')
      .select(`
        *,
        course_section_progress!inner(
          section_name,
          completed
        )
      `)
      .eq('id', moduleId)
      .single();

    if (!module) return;

    // Calculate progress based on completed sections
    const sections = ['introduction', 'core_content', 'practical_applications', 'case_studies', 'assessments'];
    const completedSections = module.course_section_progress.filter((p: any) => p.completed).length;
    const progressPercentage = Math.round((completedSections / sections.length) * 100);

    // Update module progress
    const updates: any = {
      progress_percentage: progressPercentage,
      updated_at: new Date().toISOString()
    };

    // Mark as completed if all sections done
    if (progressPercentage === 100 && !module.is_completed) {
      updates.is_completed = true;
      updates.completed_at = new Date().toISOString();
      
      // Unlock next module
      await unlockNextModule(module.assignment_id, module.module_number);
    }

    await supabase
      .from('course_modules')
      .update(updates)
      .eq('id', moduleId);
  } catch (error) {
    console.error('Error updating module progress:', error);
  }
}

/**
 * Unlocks the next module in sequence
 */
async function unlockNextModule(
  assignmentId: string,
  currentModuleNumber: number
): Promise<void> {
  try {
    await supabase
      .from('course_modules')
      .update({ 
        is_unlocked: true,
        updated_at: new Date().toISOString()
      })
      .eq('assignment_id', assignmentId)
      .eq('module_number', currentModuleNumber + 1);
  } catch (error) {
    console.error('Error unlocking next module:', error);
  }
}

/**
 * Gets the current learning module for an assignment
 */
export async function getCurrentModule(
  assignmentId: string
): Promise<string | null> {
  try {
    // Find the first unlocked, incomplete module
    const { data } = await supabase
      .from('course_modules')
      .select('content_id')
      .eq('assignment_id', assignmentId)
      .eq('is_unlocked', true)
      .eq('is_completed', false)
      .order('module_number')
      .limit(1)
      .single();

    return data?.content_id || null;
  } catch (error) {
    console.error('Error getting current module:', error);
    return null;
  }
}