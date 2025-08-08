import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  EyeOff, 
  Clock,
  User,
  Calendar,
  AlertCircle,
  CheckCircle,
  Loader2,
  History,
  FileDown,
  Shield,
  MoreVertical
} from 'lucide-react';
import ModuleNavigator from './components/ModuleNavigator';
import ContentEditor from './components/ContentEditor';
import PublishDialog from './components/PublishDialog';
import VersionHistory from './components/VersionHistory';
import ExportPDF from './components/ExportPDF';
import EditPermissions from './components/EditPermissions';
import { CourseEditorProvider, useCourseEditor } from './hooks/useCourseEditor';
import type { Database } from '@/integrations/supabase/types';

type ModuleContent = Database['public']['Tables']['cm_module_content']['Row'];

const CourseEditorContent = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showExportPDF, setShowExportPDF] = useState(false);
  const [showEditPermissions, setShowEditPermissions] = useState(false);
  
  const {
    coursePlan,
    modules,
    activeModule,
    activeSection,
    editedContent,
    isDirty,
    isSaving,
    isPreviewMode,
    showPublishDialog,
    setActiveModuleId,
    setActiveSection,
    updateContent,
    saveContent,
    togglePreview,
    setShowPublishDialog,
    publishChanges,
    loading,
    error,
    restoreVersion
  } = useCourseEditor();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-future-green" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="h-12 w-12 text-lxera-red mb-4" />
        <h2 className="text-xl font-semibold mb-2">Error Loading Course</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => navigate('/dashboard/courses')}>
          Back to Courses
        </Button>
      </div>
    );
  }

  if (!coursePlan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="h-12 w-12 text-lxera-red mb-4" />
        <h2 className="text-xl font-semibold mb-2">Course Not Found</h2>
        <Button onClick={() => navigate('/dashboard/courses')}>
          Back to Courses
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard/courses')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="min-w-0">
                <nav className="text-xs text-muted-foreground">
                  <span
                    className="hover:underline cursor-pointer"
                    onClick={() => navigate('/dashboard/courses')}
                  >
                    Courses
                  </span>
                  <span className="mx-1">/</span>
                  <span className="text-foreground truncate inline-block max-w-[40vw] align-bottom">
                    {coursePlan.course_title}
                  </span>
                </nav>
                <h1 className="text-xl font-semibold text-foreground mt-1 truncate max-w-[50vw]">
                  {coursePlan.course_title}
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {coursePlan.employee_name} • {coursePlan.total_modules} modules
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {activeModule?.last_edited_at && (
                <div className="hidden md:flex items-center gap-1 text-xs text-muted-foreground mr-2">
                  <Clock className="h-3 w-3" />
                  Last edited {new Date(activeModule.last_edited_at).toLocaleDateString()}
                </div>
              )}

              <ToggleGroup
                type="single"
                value={isPreviewMode ? 'preview' : 'edit'}
                onValueChange={(v) => v && togglePreview()}
                className="hidden sm:flex"
              >
                <ToggleGroupItem value="edit" aria-label="Edit" className="h-8 px-3">
                  <EyeOff className="h-4 w-4 mr-1" /> Edit
                </ToggleGroupItem>
                <ToggleGroupItem value="preview" aria-label="Preview" className="h-8 px-3">
                  <Eye className="h-4 w-4 mr-1" /> Preview
                </ToggleGroupItem>
              </ToggleGroup>

              <Button
                variant="secondary"
                size="sm"
                onClick={saveContent}
                disabled={!isDirty || isSaving}
                className="gap-2"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <MoreVertical className="h-4 w-4" />
                    More
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowExportPDF(true)}>
                    <FileDown className="h-4 w-4 mr-2" /> Export
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowVersionHistory(true)}>
                    <History className="h-4 w-4 mr-2" /> Version history
                  </DropdownMenuItem>
                  {userProfile?.role === 'company_admin' && (
                    <DropdownMenuItem onClick={() => setShowEditPermissions(true)}>
                      <Shield className="h-4 w-4 mr-2" /> Permissions
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                size="sm"
                onClick={() => setShowPublishDialog(true)}
                disabled={isDirty}
                className="ml-1"
              >
                Publish
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Module Navigator */}
          <div className="lg:col-span-1">
            <ModuleNavigator
              modules={modules}
              activeModuleId={activeModule?.content_id || ''}
              onModuleSelect={setActiveModuleId}
              isDirty={isDirty}
            />
          </div>

          {/* Content Editor */}
          <div className="lg:col-span-3">
            {activeModule ? (
              <ContentEditor
                module={activeModule}
                activeSection={activeSection}
                onSectionChange={setActiveSection}
                content={editedContent}
                onContentChange={updateContent}
                isPreviewMode={isPreviewMode}
              />
            ) : (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground">
                  Select a module to start editing
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Publish Dialog */}
      <PublishDialog
        open={showPublishDialog}
        onOpenChange={setShowPublishDialog}
        onPublish={publishChanges}
        courseName={coursePlan.course_title || ''}
        employeeName={coursePlan.employee_name}
        moduleId={activeModule?.module_id}
        planId={coursePlan.plan_id}
      />
      
      {/* Version History */}
      {activeModule && (
        <VersionHistory
          open={showVersionHistory}
          onOpenChange={setShowVersionHistory}
          contentId={activeModule.content_id}
          moduleId={activeModule.module_id}
          planId={activeModule.plan_id}
          onRestore={restoreVersion}
        />
      )}
      
      {/* Export PDF */}
      {coursePlan && (
        <ExportPDF
          open={showExportPDF}
          onOpenChange={setShowExportPDF}
          coursePlan={coursePlan}
          modules={modules}
        />
      )}
      
      {/* Edit Permissions */}
      {coursePlan && userProfile?.company_id && (
        <EditPermissions
          open={showEditPermissions}
          onOpenChange={setShowEditPermissions}
          courseId={coursePlan.plan_id}
          courseName={coursePlan.course_title || ''}
          companyId={userProfile.company_id}
        />
      )}
    </div>
  );
};

const CourseEditor = () => {
  const { courseId } = useParams();
  
  if (!courseId) {
    return <div>Invalid course ID</div>;
  }

  return (
    <CourseEditorProvider courseId={courseId}>
      <CourseEditorContent />
    </CourseEditorProvider>
  );
};

export default CourseEditor;