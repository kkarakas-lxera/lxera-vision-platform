import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';
import type { Database } from '@/integrations/supabase/types';

type CoursePlan = Database['public']['Tables']['cm_course_plans']['Row'];
type ModuleContent = Database['public']['Tables']['cm_module_content']['Row'];
type ContentVersion = Database['public']['Tables']['course_content_versions']['Row'];

export type ContentSection = 'introduction' | 'core_content' | 'practical_applications' | 'case_studies' | 'assessments';

interface EditableContent {
  introduction: string;
  core_content: string;
  practical_applications: string;
  case_studies: string;
  assessments: string;
}

interface CourseEditorContextValue {
  // Course Data
  coursePlan: CoursePlan | null;
  modules: ModuleContent[];
  activeModule: ModuleContent | null;
  
  // Editor State
  activeSection: ContentSection;
  isDirty: boolean;
  isSaving: boolean;
  isPreviewMode: boolean;
  showPublishDialog: boolean;
  
  // Content State
  originalContent: EditableContent | null;
  editedContent: EditableContent | null;
  
  // Version Control
  versions: ContentVersion[];
  
  // Actions
  setActiveModuleId: (moduleId: string) => void;
  setActiveSection: (section: ContentSection) => void;
  updateContent: (section: ContentSection, content: string) => void;
  saveContent: () => Promise<void>;
  togglePreview: () => void;
  setShowPublishDialog: (show: boolean) => void;
  publishChanges: (notifyEmployees: boolean, notes: string, resetProgress?: boolean) => Promise<void>;
  restoreVersion: (version: any) => Promise<void>;
  
  // Status
  loading: boolean;
  error: string | null;
}

const CourseEditorContext = createContext<CourseEditorContextValue | undefined>(undefined);

export const useCourseEditor = () => {
  const context = useContext(CourseEditorContext);
  if (!context) {
    throw new Error('useCourseEditor must be used within CourseEditorProvider');
  }
  return context;
};

interface CourseEditorProviderProps {
  courseId: string;
  children: React.ReactNode;
}

export const CourseEditorProvider: React.FC<CourseEditorProviderProps> = ({ courseId, children }) => {
  const { userProfile } = useAuth();
  
  // Course Data
  const [coursePlan, setCoursePlan] = useState<CoursePlan | null>(null);
  const [modules, setModules] = useState<ModuleContent[]>([]);
  const [activeModuleId, setActiveModuleId] = useState<string>('');
  
  // Editor State
  const [activeSection, setActiveSection] = useState<ContentSection>('introduction');
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  
  // Content State
  const [originalContent, setOriginalContent] = useState<EditableContent | null>(null);
  const [editedContent, setEditedContent] = useState<EditableContent | null>(null);
  
  // Version Control
  const [versions, setVersions] = useState<ContentVersion[]>([]);
  
  // Status
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Debounced content for auto-save
  const debouncedContent = useDebounce(editedContent, 2000);
  
  // Auto-recovery key
  const getAutoRecoveryKey = (moduleId: string) => 
    `lxera-course-editor-draft-${courseId}-${moduleId}`;
  
  // Get active module
  const activeModule = modules.find(m => m.content_id === activeModuleId) || null;
  
  // Save draft to localStorage
  const saveDraftToLocalStorage = useCallback((moduleId: string, content: EditableContent) => {
    try {
      const key = getAutoRecoveryKey(moduleId);
      const draft = {
        content,
        timestamp: new Date().toISOString(),
        moduleId
      };
      localStorage.setItem(key, JSON.stringify(draft));
    } catch (err) {
      console.error('Failed to save draft to localStorage:', err);
    }
  }, [courseId]);
  
  // Load draft from localStorage
  const loadDraftFromLocalStorage = useCallback((moduleId: string): EditableContent | null => {
    try {
      const key = getAutoRecoveryKey(moduleId);
      const stored = localStorage.getItem(key);
      
      if (!stored) return null;
      
      const draft = JSON.parse(stored);
      
      // Check if draft is less than 24 hours old
      const draftAge = Date.now() - new Date(draft.timestamp).getTime();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      if (draftAge > maxAge) {
        localStorage.removeItem(key);
        return null;
      }
      
      return draft.content;
    } catch (err) {
      console.error('Failed to load draft from localStorage:', err);
      return null;
    }
  }, [courseId]);
  
  // Clear draft from localStorage
  const clearDraftFromLocalStorage = useCallback((moduleId: string) => {
    try {
      const key = getAutoRecoveryKey(moduleId);
      localStorage.removeItem(key);
    } catch (err) {
      console.error('Failed to clear draft from localStorage:', err);
    }
  }, [courseId]);
  
  // Load course data
  useEffect(() => {
    const loadCourseData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!userProfile?.company_id) {
          throw new Error('No company context available');
        }
        
        // First, get the course plan with company validation
        const { data: plan, error: planError } = await supabase
          .from('cm_course_plans')
          .select('*')
          .eq('plan_id', courseId)
          .eq('company_id', userProfile.company_id) // Ensure company context
          .single();
          
        if (planError) throw planError;
        if (!plan) throw new Error('Course not found or access denied');
        
        setCoursePlan(plan);
        
        // Then, get all modules for this course with company validation
        const { data: moduleData, error: moduleError } = await supabase
          .from('cm_module_content')
          .select('*')
          .eq('plan_id', courseId)
          .eq('company_id', userProfile.company_id) // Ensure company context
          .order('module_spec->module_id', { ascending: true });
          
        if (moduleError) throw moduleError;
        
        setModules(moduleData || []);
        
        // Set first module as active if any exist
        if (moduleData && moduleData.length > 0) {
          setActiveModuleId(moduleData[0].content_id);
        }
        
      } catch (err) {
        console.error('Error loading course:', err);
        setError(err instanceof Error ? err.message : 'Failed to load course');
      } finally {
        setLoading(false);
      }
    };
    
    if (courseId && userProfile) {
      loadCourseData();
    }
  }, [courseId, userProfile]);
  
  // Load module content when active module changes
  useEffect(() => {
    if (activeModule) {
      const content: EditableContent = {
        introduction: activeModule.introduction || '',
        core_content: activeModule.core_content || '',
        practical_applications: activeModule.practical_applications || '',
        case_studies: activeModule.case_studies || '',
        assessments: activeModule.assessments || ''
      };
      
      // If there's draft content, use that instead
      if (activeModule.is_draft && activeModule.draft_content) {
        const draft = activeModule.draft_content as any;
        if (draft.introduction) content.introduction = draft.introduction;
        if (draft.core_content) content.core_content = draft.core_content;
        if (draft.practical_applications) content.practical_applications = draft.practical_applications;
        if (draft.case_studies) content.case_studies = draft.case_studies;
        if (draft.assessments) content.assessments = draft.assessments;
      }
      
      // Check for auto-recovery draft
      const recoveredDraft = loadDraftFromLocalStorage(activeModule.content_id);
      
      if (recoveredDraft) {
        // Ask user if they want to restore the draft
        const shouldRestore = window.confirm(
          'An auto-saved draft was found for this module. Would you like to restore it?'
        );
        
        if (shouldRestore) {
          setEditedContent(recoveredDraft);
          setIsDirty(true);
          toast.success('Draft restored from auto-save');
        } else {
          // Clear the draft if user doesn't want it
          clearDraftFromLocalStorage(activeModule.content_id);
          setOriginalContent(content);
          setEditedContent(content);
          setIsDirty(false);
        }
      } else {
        setOriginalContent(content);
        setEditedContent(content);
        setIsDirty(false);
      }
    }
  }, [activeModule, loadDraftFromLocalStorage, clearDraftFromLocalStorage]);
  
  // Auto-save functionality
  useEffect(() => {
    if (isDirty && debouncedContent && !isSaving) {
      saveContent();
    }
  }, [debouncedContent]);
  
  // Handle window close/reload to ensure drafts are saved
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && activeModule && editedContent) {
        // Save draft one last time
        saveDraftToLocalStorage(activeModule.content_id, editedContent);
        
        // Show browser warning
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty, activeModule, editedContent, saveDraftToLocalStorage]);
  
  // Load version history for active module
  useEffect(() => {
    const loadVersions = async () => {
      if (!activeModule) return;
      
      const { data, error } = await supabase
        .from('course_content_versions')
        .select('*')
        .eq('content_id', activeModule.content_id)
        .order('version_number', { ascending: false });
        
      if (!error && data) {
        setVersions(data);
      }
    };
    
    loadVersions();
  }, [activeModule]);
  
  const updateContent = useCallback((section: ContentSection, content: string) => {
    if (!editedContent || !activeModule) return;
    
    const newContent = {
      ...editedContent,
      [section]: content
    };
    
    setEditedContent(newContent);
    setIsDirty(true);
    
    // Save draft to localStorage for auto-recovery
    saveDraftToLocalStorage(activeModule.content_id, newContent);
  }, [editedContent, activeModule, saveDraftToLocalStorage]);
  
  const saveContent = async () => {
    if (!activeModule || !editedContent || !userProfile) return;
    
    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('cm_module_content')
        .update({
          ...editedContent,
          draft_content: editedContent,
          is_draft: true,
          last_edited_by: userProfile.id,
          last_edited_at: new Date().toISOString()
        })
        .eq('content_id', activeModule.content_id);
        
      if (error) throw error;
      
      setOriginalContent(editedContent);
      setIsDirty(false);
      
      // Clear localStorage draft after successful save
      clearDraftFromLocalStorage(activeModule.content_id);
      
      toast.success('Draft saved');
      
    } catch (err) {
      console.error('Error saving content:', err);
      toast.error('Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };
  
  const publishChanges = async (notifyEmployees: boolean, notes: string, resetProgress?: boolean) => {
    if (!activeModule || !editedContent || !userProfile || !coursePlan) return;
    
    try {
      // Save the content as published (not draft)
      const { error: updateError } = await supabase
        .from('cm_module_content')
        .update({
          ...editedContent,
          draft_content: null,
          is_draft: false,
          last_edited_by: userProfile.id,
          last_edited_at: new Date().toISOString()
        })
        .eq('content_id', activeModule.content_id);
        
      if (updateError) throw updateError;
      
      // Create edit history entry
      const { error: historyError } = await supabase
        .from('course_edit_history')
        .insert({
          content_id: activeModule.content_id,
          module_id: activeModule.module_id,
          editor_id: userProfile.id,
          action_type: 'publish',
          new_value: notes
        });
        
      if (historyError) throw historyError;
      
      // Notify employees if requested
      if (notifyEmployees) {
        // Call the notification function
        const { data: notificationCount, error: notifyError } = await supabase
          .rpc('notify_course_update', {
            p_plan_id: coursePlan.plan_id,
            p_editor_name: userProfile.full_name || userProfile.email || 'Course Editor',
            p_course_title: coursePlan.course_title,
            p_change_summary: notes
          });
          
        if (notifyError) {
          console.error('Error sending notifications:', notifyError);
          toast.warning('Published successfully but failed to send notifications');
        } else if (notificationCount && notificationCount > 0) {
          toast.success(`Published and notified ${notificationCount} employees`);
        } else {
          toast.success('Published successfully (no active employees to notify)');
        }
      } else {
        toast.success('Published successfully');
      }
      
      setShowPublishDialog(false);
      setIsDirty(false);
      
      // Clear localStorage draft after successful publish
      clearDraftFromLocalStorage(activeModule.content_id);
      
    } catch (err) {
      console.error('Error publishing changes:', err);
      toast.error('Failed to publish changes');
    }
  };
  
  const togglePreview = () => {
    setIsPreviewMode(!isPreviewMode);
  };
  
  const restoreVersion = async (version: any) => {
    if (!activeModule || !userProfile) return;
    
    try {
      // Extract content from the version snapshot
      const snapshot = version.content_snapshot;
      
      // Update the edited content with the restored version
      setEditedContent({
        introduction: snapshot.introduction || '',
        core_content: snapshot.core_content || '',
        practical_applications: snapshot.practical_applications || '',
        case_studies: snapshot.case_studies || '',
        assessments: snapshot.assessments || ''
      });
      
      // Save the restored content
      const { error: updateError } = await supabase
        .from('cm_module_content')
        .update({
          introduction: snapshot.introduction || '',
          core_content: snapshot.core_content || '',
          practical_applications: snapshot.practical_applications || '',
          case_studies: snapshot.case_studies || '',
          assessments: snapshot.assessments || '',
          draft_content: null,
          is_draft: false,
          last_edited_by: userProfile.id,
          last_edited_at: new Date().toISOString()
        })
        .eq('content_id', activeModule.content_id);
        
      if (updateError) throw updateError;
      
      // Create a new version entry for the restore
      const { error: versionError } = await supabase
        .from('course_content_versions')
        .insert({
          content_id: activeModule.content_id,
          module_id: activeModule.module_id,
          plan_id: activeModule.plan_id,
          version_number: (versions[0]?.version_number || 0) + 1,
          content_snapshot: snapshot,
          edited_by: userProfile.id,
          change_summary: `Restored from version ${version.version_number}`,
          is_published: false
        });
        
      if (versionError) throw versionError;
      
      // Create edit history entry
      const { error: historyError } = await supabase
        .from('course_edit_history')
        .insert({
          content_id: activeModule.content_id,
          module_id: activeModule.module_id,
          editor_id: userProfile.id,
          action_type: 'restore',
          old_value: JSON.stringify({ version: version.version_number }),
          new_value: `Restored from version ${version.version_number}`
        });
        
      if (historyError) throw historyError;
      
      // Refresh the modules to get the updated content
      await fetchModules();
      
      toast.success(`Content restored from version ${version.version_number}`);
      setIsDirty(false);
      
    } catch (err) {
      console.error('Error restoring version:', err);
      toast.error('Failed to restore version');
      throw err;
    }
  };
  
  const value: CourseEditorContextValue = {
    coursePlan,
    modules,
    activeModule,
    activeSection,
    isDirty,
    isSaving,
    isPreviewMode,
    showPublishDialog,
    originalContent,
    editedContent,
    versions,
    setActiveModuleId,
    setActiveSection,
    updateContent,
    saveContent,
    togglePreview,
    setShowPublishDialog,
    publishChanges,
    restoreVersion,
    loading,
    error
  };
  
  return (
    <CourseEditorContext.Provider value={value}>
      {children}
    </CourseEditorContext.Provider>
  );
};