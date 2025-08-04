import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert } from '@/components/ui/alert';
import { 
  Send, 
  Users, 
  MessageSquare, 
  AlertCircle,
  CheckCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PublishDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPublish: (notifyEmployees: boolean, notes: string, resetProgress?: boolean) => Promise<void>;
  courseName: string;
  employeeName: string;
  moduleId?: string;
  planId?: string;
}

const PublishDialog: React.FC<PublishDialogProps> = ({
  open,
  onOpenChange,
  onPublish,
  courseName,
  employeeName,
  moduleId,
  planId
}) => {
  const [notifyEmployees, setNotifyEmployees] = useState(true);
  const [publishNotes, setPublishNotes] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [hasMajorChanges, setHasMajorChanges] = useState(false);
  const [resetProgress, setResetProgress] = useState(false);
  const [affectedEmployees, setAffectedEmployees] = useState(0);
  
  // Check for major changes when dialog opens
  useEffect(() => {
    const checkMajorChanges = async () => {
      if (!open || !moduleId || !planId) return;
      
      try {
        // Check if there are major changes pending
        const { data, error } = await supabase
          .rpc('check_pending_major_changes', {
            p_module_id: moduleId
          });
          
        if (!error && data) {
          setHasMajorChanges(data.has_major_changes || false);
          setAffectedEmployees(data.affected_employees || 0);
        }
      } catch (err) {
        console.error('Error checking major changes:', err);
      }
    };
    
    checkMajorChanges();
  }, [open, moduleId, planId]);
  
  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      // If major changes and reset progress is selected, handle it
      if (hasMajorChanges && resetProgress) {
        const { error: resetError } = await supabase
          .rpc('reset_module_progress_for_major_change', {
            p_module_id: moduleId,
            p_plan_id: planId,
            p_editor_name: employeeName,
            p_change_summary: publishNotes
          });
          
        if (resetError) {
          console.error('Error resetting progress:', resetError);
          toast.error('Failed to reset employee progress');
        } else {
          toast.success(`Progress reset for ${affectedEmployees} employees`);
        }
      }
      
      await onPublish(notifyEmployees, publishNotes, resetProgress);
      onOpenChange(false);
      // Reset form
      setNotifyEmployees(true);
      setPublishNotes('');
      setResetProgress(false);
    } catch (error) {
      // Error handling is done in the parent
    } finally {
      setIsPublishing(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-future-green" />
            Publish Course Changes
          </DialogTitle>
          <DialogDescription>
            You're about to publish changes to <strong>{courseName}</strong> for {employeeName}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Publish Notes */}
          <div className="space-y-2">
            <label htmlFor="publish-notes" className="text-sm font-medium">
              <MessageSquare className="h-4 w-4 inline mr-1" />
              Change Summary (optional)
            </label>
            <Textarea
              id="publish-notes"
              placeholder="Describe what changed in this update..."
              value={publishNotes}
              onChange={(e) => setPublishNotes(e.target.value)}
              className="min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground">
              This will be recorded in the version history
            </p>
          </div>
          
          {/* Notification Option */}
          <div className="flex items-start space-x-3 rounded-lg border p-4">
            <Checkbox
              id="notify-employees"
              checked={notifyEmployees}
              onCheckedChange={(checked) => setNotifyEmployees(checked as boolean)}
            />
            <div className="space-y-1">
              <label
                htmlFor="notify-employees"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Notify assigned employees
              </label>
              <p className="text-xs text-muted-foreground">
                Send notifications to all employees currently assigned to this course about the updates
              </p>
            </div>
          </div>
          
          {/* Major Changes Warning and Reset Option */}
          {hasMajorChanges && (
            <div className="space-y-3">
              <Alert className="border-orange-500 bg-orange-50">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <div className="text-sm">
                  <strong>Major Content Changes Detected!</strong>
                  <p className="mt-1">
                    This update contains significant changes to the course structure or content. 
                    {affectedEmployees > 0 && `This will affect ${affectedEmployees} employees currently taking this course.`}
                  </p>
                </div>
              </Alert>
              
              <div className="flex items-start space-x-3 rounded-lg border border-orange-200 bg-orange-50 p-4">
                <Checkbox
                  id="reset-progress"
                  checked={resetProgress}
                  onCheckedChange={(checked) => setResetProgress(checked as boolean)}
                />
                <div className="space-y-1">
                  <label
                    htmlFor="reset-progress"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reset employee progress for this module
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Due to major changes, employees may need to restart this module. 
                    Their progress will be reset and they'll be notified to review the updated content.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Warning Alert */}
          <Alert className="border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <div className="text-sm">
              <strong>Important:</strong> Published changes will immediately be visible to all assigned employees. 
              Make sure all content has been reviewed and approved.
            </div>
          </Alert>
          
          {/* What happens next */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">What happens when you publish:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                All draft changes become live content
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                A new version is created in the history
              </li>
              {notifyEmployees && (
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Employees receive update notifications
                </li>
              )}
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                {resetProgress && hasMajorChanges 
                  ? `Progress will be reset for ${affectedEmployees} employees`
                  : 'Progress tracking continues uninterrupted'
                }
              </li>
            </ul>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPublishing}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePublish}
            disabled={isPublishing}
            className="flex items-center gap-2"
          >
            {isPublishing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Publish Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PublishDialog;