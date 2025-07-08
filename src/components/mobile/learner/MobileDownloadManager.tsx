import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Pause, 
  Play, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  HardDrive,
  Wifi,
  WifiOff,
  FolderDown,
  FileText,
  Video,
  Image,
  Music,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSupabase } from '@/hooks/useSupabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface DownloadItem {
  id: string;
  user_id: string;
  course_id: string;
  lesson_id?: string;
  file_type: 'video' | 'document' | 'audio' | 'image' | 'zip';
  file_name: string;
  file_size: number;
  download_url: string;
  local_path?: string;
  status: 'pending' | 'downloading' | 'paused' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  download_speed?: number;
  estimated_time_remaining?: number;
  downloaded_bytes: number;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  course?: {
    title: string;
    thumbnail_url?: string;
  };
  lesson?: {
    title: string;
    duration?: number;
  };
}

interface StorageInfo {
  total: number;
  used: number;
  available: number;
  downloads: number;
}

export default function MobileDownloadManager() {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [storageInfo, setStorageInfo] = useState<StorageInfo>({
    total: 0,
    used: 0,
    available: 0,
    downloads: 0
  });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [filter, setFilter] = useState<'all' | 'downloading' | 'completed' | 'failed'>('all');
  const [downloadQueue, setDownloadQueue] = useState<string[]>([]);
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
      fetchDownloads();
      checkStorageQuota();
      startDownloadWorker();
    }
  }, [user]);

  const fetchDownloads = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('downloads')
        .select(`
          *,
          course:courses(title, thumbnail_url),
          lesson:lessons(title, duration)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDownloads(data || []);
    } catch (error) {
      console.error('Error fetching downloads:', error);
      toast.error('Failed to load downloads');
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
        const available = total - used;
        
        // Calculate download storage usage
        const downloadUsage = downloads
          .filter(d => d.status === 'completed')
          .reduce((sum, d) => sum + d.file_size, 0);

        setStorageInfo({
          total,
          used,
          available,
          downloads: downloadUsage
        });
      }
    } catch (error) {
      console.error('Error checking storage quota:', error);
    }
  };

  const startDownloadWorker = () => {
    // Simulate download worker that processes queue
    const interval = setInterval(() => {
      const activeDownloads = downloads.filter(d => d.status === 'downloading');
      const pendingDownloads = downloads.filter(d => d.status === 'pending');
      
      // Process downloads if online and under limit
      if (isOnline && activeDownloads.length < 3 && pendingDownloads.length > 0) {
        const nextDownload = pendingDownloads[0];
        startDownload(nextDownload.id);
      }
    }, 1000);

    return () => clearInterval(interval);
  };

  const startDownload = async (downloadId: string) => {
    try {
      const download = downloads.find(d => d.id === downloadId);
      if (!download) return;

      // Update status to downloading
      await updateDownloadStatus(downloadId, 'downloading', {
        started_at: new Date().toISOString()
      });

      // Simulate download progress
      simulateDownload(downloadId);
    } catch (error) {
      console.error('Error starting download:', error);
      await updateDownloadStatus(downloadId, 'failed', {
        error_message: 'Failed to start download'
      });
    }
  };

  const simulateDownload = (downloadId: string) => {
    const download = downloads.find(d => d.id === downloadId);
    if (!download) return;

    const progressInterval = setInterval(async () => {
      const currentDownload = downloads.find(d => d.id === downloadId);
      if (!currentDownload || currentDownload.status !== 'downloading') {
        clearInterval(progressInterval);
        return;
      }

      const newProgress = Math.min(currentDownload.progress + Math.random() * 10, 100);
      const downloadedBytes = Math.floor((newProgress / 100) * currentDownload.file_size);
      const remainingBytes = currentDownload.file_size - downloadedBytes;
      const speed = Math.random() * 1000000 + 500000; // 0.5-1.5 MB/s
      const estimatedTime = remainingBytes / speed;

      await updateDownloadProgress(downloadId, newProgress, downloadedBytes, speed, estimatedTime);

      if (newProgress >= 100) {
        clearInterval(progressInterval);
        await updateDownloadStatus(downloadId, 'completed', {
          completed_at: new Date().toISOString(),
          local_path: `/downloads/${currentDownload.file_name}`
        });
        toast.success(`Download completed: ${currentDownload.file_name}`);
      }
    }, 1000);
  };

  const updateDownloadStatus = async (downloadId: string, status: string, additionalData: any = {}) => {
    try {
      const { error } = await supabase
        .from('downloads')
        .update({ status, ...additionalData })
        .eq('id', downloadId);

      if (error) throw error;

      setDownloads(prev => 
        prev.map(d => 
          d.id === downloadId 
            ? { ...d, status: status as any, ...additionalData }
            : d
        )
      );
    } catch (error) {
      console.error('Error updating download status:', error);
    }
  };

  const updateDownloadProgress = async (
    downloadId: string, 
    progress: number, 
    downloadedBytes: number,
    speed?: number,
    estimatedTime?: number
  ) => {
    try {
      const updateData: any = { progress, downloaded_bytes: downloadedBytes };
      if (speed) updateData.download_speed = speed;
      if (estimatedTime) updateData.estimated_time_remaining = estimatedTime;

      const { error } = await supabase
        .from('downloads')
        .update(updateData)
        .eq('id', downloadId);

      if (error) throw error;

      setDownloads(prev => 
        prev.map(d => 
          d.id === downloadId 
            ? { ...d, ...updateData }
            : d
        )
      );
    } catch (error) {
      console.error('Error updating download progress:', error);
    }
  };

  const pauseDownload = async (downloadId: string) => {
    await updateDownloadStatus(downloadId, 'paused');
    toast.info('Download paused');
  };

  const resumeDownload = async (downloadId: string) => {
    if (!isOnline) {
      toast.error('Cannot resume download while offline');
      return;
    }
    await updateDownloadStatus(downloadId, 'downloading');
    simulateDownload(downloadId);
    toast.info('Download resumed');
  };

  const cancelDownload = async (downloadId: string) => {
    await updateDownloadStatus(downloadId, 'cancelled');
    toast.info('Download cancelled');
  };

  const retryDownload = async (downloadId: string) => {
    if (!isOnline) {
      toast.error('Cannot retry download while offline');
      return;
    }
    await updateDownloadStatus(downloadId, 'pending', {
      progress: 0,
      downloaded_bytes: 0,
      error_message: null
    });
    toast.info('Download added to queue');
  };

  const deleteDownload = async (downloadId: string) => {
    try {
      const { error } = await supabase
        .from('downloads')
        .delete()
        .eq('id', downloadId);

      if (error) throw error;

      setDownloads(prev => prev.filter(d => d.id !== downloadId));
      toast.success('Download removed');
      checkStorageQuota();
    } catch (error) {
      console.error('Error deleting download:', error);
      toast.error('Failed to delete download');
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatSpeed = (bytesPerSecond: number) => {
    return formatBytes(bytesPerSecond) + '/s';
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      case 'audio': return <Music className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      default: return <Download className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'downloading': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'paused': return 'bg-yellow-500';
      case 'cancelled': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const filteredDownloads = downloads.filter(download => {
    if (filter === 'all') return true;
    if (filter === 'downloading') return ['downloading', 'pending'].includes(download.status);
    return download.status === filter;
  });

  const activeDownloads = downloads.filter(d => d.status === 'downloading').length;
  const completedDownloads = downloads.filter(d => d.status === 'completed').length;
  const failedDownloads = downloads.filter(d => d.status === 'failed').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="mobile-download-manager w-full max-w-md mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Downloads</h2>
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="h-5 w-5 text-green-500" />
          ) : (
            <WifiOff className="h-5 w-5 text-red-500" />
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={checkStorageQuota}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Storage Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Storage Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Downloads: {formatBytes(storageInfo.downloads)}</span>
              <span>Available: {formatBytes(storageInfo.available)}</span>
            </div>
            <Progress 
              value={((storageInfo.total - storageInfo.available) / storageInfo.total) * 100} 
              className="h-2"
            />
            <div className="text-xs text-muted-foreground">
              {formatBytes(storageInfo.used)} used of {formatBytes(storageInfo.total)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-blue-600">{activeDownloads}</div>
            <div className="text-xs text-muted-foreground">Active</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-green-600">{completedDownloads}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-red-600">{failedDownloads}</div>
            <div className="text-xs text-muted-foreground">Failed</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Select value={filter} onValueChange={setFilter}>
        <SelectTrigger>
          <SelectValue placeholder="Filter downloads" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Downloads</SelectItem>
          <SelectItem value="downloading">Active</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="failed">Failed</SelectItem>
        </SelectContent>
      </Select>

      {/* Downloads List */}
      <div className="space-y-3">
        {filteredDownloads.length === 0 ? (
          <div className="text-center py-12">
            <FolderDown className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              {filter === 'all' ? 'No downloads yet' : `No ${filter} downloads`}
            </p>
          </div>
        ) : (
          filteredDownloads.map((download) => (
            <Card key={download.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {getFileIcon(download.file_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">
                      {download.file_name}
                    </h3>
                    {download.course && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {download.course.title}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2 mt-2">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getStatusColor(download.status)} text-white border-transparent`}
                      >
                        {download.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatBytes(download.file_size)}
                      </span>
                    </div>

                    {/* Progress bar for active downloads */}
                    {['downloading', 'paused'].includes(download.status) && (
                      <div className="mt-3 space-y-2">
                        <Progress value={download.progress} className="h-2" />
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <span>{download.progress.toFixed(1)}%</span>
                          <div className="flex items-center gap-2">
                            {download.download_speed && (
                              <span>{formatSpeed(download.download_speed)}</span>
                            )}
                            {download.estimated_time_remaining && (
                              <span>• {formatTime(download.estimated_time_remaining)} left</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Error message */}
                    {download.status === 'failed' && download.error_message && (
                      <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700 flex items-start gap-2">
                        <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{download.error_message}</span>
                      </div>
                    )}

                    {/* Completion info */}
                    {download.status === 'completed' && download.completed_at && (
                      <div className="text-xs text-muted-foreground mt-2">
                        Completed {format(new Date(download.completed_at), 'MMM d, yyyy')}
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col gap-1">
                    {download.status === 'downloading' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => pauseDownload(download.id)}
                        className="h-8 w-8"
                      >
                        <Pause className="h-3 w-3" />
                      </Button>
                    )}
                    {download.status === 'paused' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => resumeDownload(download.id)}
                        className="h-8 w-8"
                        disabled={!isOnline}
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                    )}
                    {download.status === 'failed' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => retryDownload(download.id)}
                        className="h-8 w-8"
                        disabled={!isOnline}
                      >
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteDownload(download.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}