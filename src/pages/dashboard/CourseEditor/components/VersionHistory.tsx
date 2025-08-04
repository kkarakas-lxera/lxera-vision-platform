import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  History,
  RotateCcw,
  User,
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface Version {
  id: string;
  version_number: number;
  content_snapshot: any;
  edited_by: string;
  created_at: string;
  change_summary: string | null;
  is_published: boolean;
  editor_name?: string;
  editor_email?: string;
}

interface VersionHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentId: string;
  moduleId: string;
  planId: string;
  onRestore: (version: Version) => void;
}

const VersionHistory: React.FC<VersionHistoryProps> = ({
  open,
  onOpenChange,
  contentId,
  moduleId,
  planId,
  onRestore
}) => {
  const { toast } = useToast();
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    if (open && contentId) {
      fetchVersionHistory();
    }
  }, [open, contentId]);

  const fetchVersionHistory = async () => {
    try {
      setLoading(true);
      
      // Fetch version history with editor information
      const { data: versionsData, error } = await supabase
        .from('course_content_versions')
        .select(`
          *,
          editor:edited_by (
            id,
            full_name,
            email
          )
        `)
        .eq('content_id', contentId)
        .eq('module_id', moduleId)
        .eq('plan_id', planId)
        .order('version_number', { ascending: false });

      if (error) throw error;

      // Transform the data to include editor info
      const transformedVersions = versionsData?.map(v => ({
        ...v,
        editor_name: v.editor?.full_name || 'Unknown',
        editor_email: v.editor?.email
      })) || [];

      setVersions(transformedVersions);
    } catch (error) {
      console.error('Error fetching version history:', error);
      toast({
        title: 'Error',
        description: 'Failed to load version history',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!selectedVersion) return;

    setRestoring(true);
    try {
      // Call parent's onRestore to update the content
      await onRestore(selectedVersion);
      
      toast({
        title: 'Version restored',
        description: `Content restored to version ${selectedVersion.version_number}`,
      });
      
      setShowRestoreDialog(false);
      setSelectedVersion(null);
      onOpenChange(false);
    } catch (error) {
      console.error('Error restoring version:', error);
      toast({
        title: 'Error',
        description: 'Failed to restore version',
        variant: 'destructive'
      });
    } finally {
      setRestoring(false);
    }
  };

  const getVersionBadge = (version: Version) => {
    if (version.is_published) {
      return <Badge variant="default" className="bg-green-500">Published</Badge>;
    }
    return <Badge variant="outline">Draft</Badge>;
  };

  const getVersionIcon = (version: Version, index: number) => {
    if (index === 0) {
      return <Clock className="h-4 w-4 text-blue-500" />;
    }
    if (version.is_published) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <FileText className="h-4 w-4 text-gray-400" />;
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Version History
            </SheetTitle>
            <SheetDescription>
              View and restore previous versions of this module's content
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-140px)] mt-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : versions.length === 0 ? (
              <div className="text-center py-8">
                <History className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-muted-foreground">No version history available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {versions.map((version, index) => (
                  <Card
                    key={version.id}
                    className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                      index === 0 ? 'border-blue-200 bg-blue-50/50' : ''
                    }`}
                    onClick={() => setSelectedVersion(version)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {getVersionIcon(version, index)}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              Version {version.version_number}
                            </span>
                            {getVersionBadge(version)}
                            {index === 0 && (
                              <Badge variant="outline" className="bg-blue-50">
                                Current
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {version.editor_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        
                        {version.change_summary && (
                          <p className="text-sm text-gray-600 mt-2">
                            {version.change_summary}
                          </p>
                        )}
                        
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(version.created_at), 'PPp')}
                        </div>
                      </div>
                    </div>
                    
                    {index !== 0 && (
                      <div className="mt-3 flex justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedVersion(version);
                            setShowRestoreDialog(true);
                          }}
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Restore
                        </Button>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Restore Confirmation Dialog */}
      <AlertDialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Version {selectedVersion?.version_number}?</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-3">
                <p>
                  This will replace the current content with the version from{' '}
                  {selectedVersion && format(new Date(selectedVersion.created_at), 'PPp')}.
                </p>
                <div className="bg-orange-50 border border-orange-200 rounded-md p-3 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-orange-900">Important:</p>
                    <ul className="mt-1 space-y-1 text-orange-800">
                      <li>• Current unsaved changes will be lost</li>
                      <li>• A new version will be created for this restore</li>
                      <li>• You can always restore back if needed</li>
                    </ul>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRestore}
              disabled={restoring}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {restoring ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Restoring...
                </>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restore Version
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default VersionHistory;