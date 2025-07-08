import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Wifi, 
  WifiOff, 
  Play, 
  Pause, 
  CheckCircle, 
  XCircle, 
  Clock,
  HardDrive,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useSupabase } from '@/hooks/useSupabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface OfflineContent {
  id: string;
  course_id: string;
  lesson_id?: string;
  title: string;
  type: 'video' | 'document' | 'quiz' | 'course';
  size: number;
  status: 'downloading' | 'downloaded' | 'failed' | 'paused';
  progress: number;
  download_url?: string;
  local_path?: string;
  downloaded_at?: string;
  expires_at?: string;
  course?: {
    title: string;
    thumbnail_url?: string;
  };
}

export default function MobileOfflineMode() {
  const [offlineContent, setOfflineContent] = useState<OfflineContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [totalStorage, setTotalStorage] = useState(0);
  const [availableStorage, setAvailableStorage] = useState(0);
  const { supabase } = useSupabase();
  const { user } = useAuth();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (user) {
      fetchOfflineContent();
      checkStorageQuota();
    }
  }, [user]);

  const fetchOfflineContent = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('offline_content')
        .select(`
          *,
          course:courses(title, thumbnail_url)
        `)
        .eq('user_id', user?.id)
        .order('downloaded_at', { ascending: false });

      if (error) throw error;
      setOfflineContent(data || []);
    } catch (error) {
      console.error('Error fetching offline content:', error);
      toast.error('Failed to load offline content');
    } finally {
      setLoading(false);
    }
  };

  const checkStorageQuota = async () => {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const total = estimate.quota || 0;
        const used = estimate.usage || 0;
        setTotalStorage(total);
        setAvailableStorage(total - used);
      }
    } catch (error) {
      console.error('Error checking storage quota:', error);
    }
  };

  const downloadContent = async (contentId: string) => {
    try {
      // Start download
      const { error } = await supabase
        .from('offline_content')
        .update({ 
          status: 'downloading',
          progress: 0
        })
        .eq('id', contentId);

      if (error) throw error;

      // Update local state
      setOfflineContent(prev => 
        prev.map(content => 
          content.id === contentId 
            ? { ...content, status: 'downloading', progress: 0 }
            : content
        )
      );

      // Simulate download progress
      const progressInterval = setInterval(() => {
        setOfflineContent(prev => 
          prev.map(content => {
            if (content.id === contentId && content.status === 'downloading') {
              const newProgress = Math.min(content.progress + 10, 100);
              return { ...content, progress: newProgress };
            }
            return content;
          })
        );
      }, 500);

      // Complete download after 5 seconds (simulated)
      setTimeout(async () => {
        clearInterval(progressInterval);
        
        const { error: updateError } = await supabase
          .from('offline_content')
          .update({ 
            status: 'downloaded',
            progress: 100,
            downloaded_at: new Date().toISOString()
          })
          .eq('id', contentId);

        if (updateError) throw updateError;

        setOfflineContent(prev => 
          prev.map(content => 
            content.id === contentId 
              ? { 
                  ...content, 
                  status: 'downloaded', 
                  progress: 100,
                  downloaded_at: new Date().toISOString()
                }
              : content
          )
        );

        toast.success('Content downloaded successfully');
      }, 5000);

    } catch (error) {
      console.error('Error downloading content:', error);
      toast.error('Failed to download content');
      
      setOfflineContent(prev => 
        prev.map(content => 
          content.id === contentId 
            ? { ...content, status: 'failed', progress: 0 }
            : content
        )
      );
    }
  };

  const pauseDownload = async (contentId: string) => {
    try {
      const { error } = await supabase
        .from('offline_content')
        .update({ status: 'paused' })
        .eq('id', contentId);

      if (error) throw error;

      setOfflineContent(prev => 
        prev.map(content => 
          content.id === contentId 
            ? { ...content, status: 'paused' }
            : content
        )
      );
    } catch (error) {
      console.error('Error pausing download:', error);
      toast.error('Failed to pause download');
    }
  };

  const deleteContent = async (contentId: string) => {
    try {
      const { error } = await supabase
        .from('offline_content')
        .delete()
        .eq('id', contentId);

      if (error) throw error;

      setOfflineContent(prev => prev.filter(content => content.id !== contentId));
      toast.success('Content deleted');
      checkStorageQuota();
    } catch (error) {
      console.error('Error deleting content:', error);
      toast.error('Failed to delete content');
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'downloading':
        return <Download className="h-4 w-4 animate-pulse" />;
      case 'downloaded':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'downloading':
        return 'bg-blue-500';
      case 'downloaded':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'paused':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="mobile-offline w-full max-w-md mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Offline Content</h2>
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="h-5 w-5 text-green-500" />
          ) : (
            <WifiOff className="h-5 w-5 text-red-500" />
          )}
          <span className="text-sm text-muted-foreground">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Storage Info */}
      <div className="bg-card rounded-lg p-4 border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <HardDrive className="h-4 w-4" />
            <span className="text-sm font-medium">Storage</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={checkStorageQuota}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Available: {formatBytes(availableStorage)}</span>
            <span>Total: {formatBytes(totalStorage)}</span>
          </div>
          <Progress 
            value={((totalStorage - availableStorage) / totalStorage) * 100} 
            className="h-2"
          />
        </div>
      </div>

      {/* Content List */}
      <div className="space-y-3">
        {offlineContent.length === 0 ? (
          <div className="text-center py-12">
            <Download className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              No offline content yet. Download courses to access them offline!
            </p>
          </div>
        ) : (
          offlineContent.map((content) => (
            <div
              key={content.id}
              className="bg-card rounded-lg p-4 border shadow-sm"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{content.title}</h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    {content.course && (
                      <>
                        <span className="truncate">{content.course.title}</span>
                        <span>•</span>
                      </>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {content.type}
                    </Badge>
                    <span>•</span>
                    <span>{formatBytes(content.size)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {getStatusIcon(content.status)}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteContent(content.id)}
                    className="shrink-0 h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Progress Bar */}
              {content.status === 'downloading' && (
                <div className="mb-3">
                  <Progress value={content.progress} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{content.progress}%</span>
                    <span>Downloading...</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                {content.status === 'downloading' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => pauseDownload(content.id)}
                    className="flex-1"
                  >
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </Button>
                ) : content.status === 'paused' || content.status === 'failed' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadContent(content.id)}
                    className="flex-1"
                    disabled={!isOnline}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Resume
                  </Button>
                ) : content.status === 'downloaded' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Play Offline
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadContent(content.id)}
                    className="flex-1"
                    disabled={!isOnline}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                )}
              </div>

              {/* Download Info */}
              {content.downloaded_at && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Downloaded: {format(new Date(content.downloaded_at), 'MMM d, yyyy')}
                </div>
              )}
              {content.expires_at && (
                <div className="mt-1 text-xs text-yellow-600">
                  Expires: {format(new Date(content.expires_at), 'MMM d, yyyy')}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}