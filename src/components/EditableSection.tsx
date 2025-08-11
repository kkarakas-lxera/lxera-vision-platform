import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Save, X, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface EditableSectionProps {
  title: string;
  content: string;
  contentId: string;
  sectionKey: 'introduction' | 'core_content' | 'practical_applications' | 'case_studies' | 'assessments';
  icon?: React.ReactNode;
  defaultExpanded?: boolean;
  versionNumber: number;
  onVersionUpdate: (newVersion: number) => void;
}

export const EditableSection: React.FC<EditableSectionProps> = ({
  title,
  content,
  contentId,
  sectionKey,
  icon,
  defaultExpanded = false,
  versionNumber,
  onVersionUpdate
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [isSaving, setIsSaving] = useState(false);
  const [hasConflict, setHasConflict] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // Update content when prop changes (e.g., after conflict resolution)
  useEffect(() => {
    setEditedContent(content);
  }, [content]);

  // Auto-save after 2 seconds of no typing
  useEffect(() => {
    if (isEditing && editedContent !== content) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      saveTimeoutRef.current = setTimeout(() => {
        handleSave();
      }, 2000);
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editedContent, isEditing]);

  // Adjust textarea height
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isEditing, editedContent]);

  // Save to localStorage for recovery
  useEffect(() => {
    if (isEditing) {
      const key = `course-edit-${contentId}-${sectionKey}`;
      localStorage.setItem(key, editedContent);
    }
  }, [editedContent, isEditing, contentId, sectionKey]);

  const handleEdit = () => {
    setIsEditing(true);
    setHasConflict(false);
    
    // Recover from localStorage if available
    const key = `course-edit-${contentId}-${sectionKey}`;
    const saved = localStorage.getItem(key);
    if (saved && saved !== content) {
      if (confirm('You have unsaved changes from a previous session. Would you like to restore them?')) {
        setEditedContent(saved);
      }
    }
  };

  const handleCancel = () => {
    setEditedContent(content);
    setIsEditing(false);
    setHasConflict(false);
    
    // Clear localStorage
    const key = `course-edit-${contentId}-${sectionKey}`;
    localStorage.removeItem(key);
  };

  const handleSave = async () => {
    if (editedContent === content) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    
    try {
      const { data, error } = await supabase.rpc('update_module_section', {
        p_content_id: contentId,
        p_section: sectionKey,
        p_new_text: editedContent,
        p_version: versionNumber
      });

      if (error) throw error;

      if (data === false) {
        // Version conflict
        setHasConflict(true);
        toast.error('This section was modified by another user. Please refresh to see the latest version.');
        return;
      }

      // Success
      onVersionUpdate(versionNumber + 1);
      setIsEditing(false);
      setHasConflict(false);
      
      // Clear localStorage
      const key = `course-edit-${contentId}-${sectionKey}`;
      localStorage.removeItem(key);
      
      toast.success('Changes saved');
    } catch (error) {
      console.error('Error saving section:', error);
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const renderContent = () => {
    if (!isExpanded) return null;

    if (isEditing) {
      return (
        <div className="space-y-3">
          <Textarea
            ref={textareaRef}
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="min-h-[200px] font-mono text-sm"
            placeholder="Enter content..."
          />
          {hasConflict && (
            <div className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-950/30 rounded text-sm text-yellow-600 dark:text-yellow-400">
              <AlertCircle className="h-4 w-4" />
              <span>Version conflict detected. Another user has edited this section.</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {isSaving ? 'Saving...' : 'Auto-saves after 2 seconds'}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isSaving}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving || editedContent === content}
              >
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // Parse and render content (handles markdown-like formatting)
    const formattedContent = content
      .split('\n')
      .map((line, index) => {
        // Handle headers
        if (line.startsWith('## ')) {
          return <h3 key={index} className="text-lg font-semibold mt-4 mb-2">{line.substring(3)}</h3>;
        }
        if (line.startsWith('### ')) {
          return <h4 key={index} className="text-md font-medium mt-3 mb-1">{line.substring(4)}</h4>;
        }
        // Handle lists
        if (line.startsWith('- ')) {
          return <li key={index} className="ml-4 list-disc">{line.substring(2)}</li>;
        }
        if (line.startsWith('* ')) {
          return <li key={index} className="ml-4 list-disc">{line.substring(2)}</li>;
        }
        // Handle numbered lists
        if (/^\d+\.\s/.test(line)) {
          return <li key={index} className="ml-4 list-decimal">{line.replace(/^\d+\.\s/, '')}</li>;
        }
        // Regular paragraph
        if (line.trim() === '') {
          return <br key={index} />;
        }
        return <p key={index} className="mb-2">{line}</p>;
      });

    return (
      <div className="prose prose-sm dark:prose-invert max-w-none">
        {formattedContent}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader 
        className="cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {icon}
            <span>{title}</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            {!isEditing && isExpanded && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit();
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {isExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </div>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent>
          {renderContent()}
        </CardContent>
      )}
    </Card>
  );
};