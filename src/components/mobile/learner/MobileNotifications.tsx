import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  BellRing, 
  Settings, 
  Check, 
  X, 
  Clock, 
  Trophy,
  BookOpen,
  Calendar,
  Zap,
  Target,
  Users,
  Star,
  AlertCircle,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useSupabase } from '@/hooks/useSupabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  user_id: string;
  type: 'course_reminder' | 'achievement' | 'deadline' | 'update' | 'social' | 'system';
  title: string;
  message: string;
  data?: any;
  is_read: boolean;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  scheduled_for?: string;
  action_url?: string;
}

interface NotificationSettings {
  course_reminders: boolean;
  achievement_alerts: boolean;
  deadline_warnings: boolean;
  system_updates: boolean;
  social_notifications: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  reminder_frequency: 'daily' | 'weekly' | 'off';
}

export default function MobileNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    course_reminders: true,
    achievement_alerts: true,
    deadline_warnings: true,
    system_updates: true,
    social_notifications: false,
    email_notifications: false,
    push_notifications: true,
    quiet_hours_start: '22:00',
    quiet_hours_end: '08:00',
    reminder_frequency: 'daily'
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { supabase } = useSupabase();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchSettings();
      requestNotificationPermission();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching notification settings:', error);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast.success('Notifications enabled');
      }
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user?.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      
      const { error } = await supabase
        .from('notification_settings')
        .upsert({
          user_id: user?.id,
          ...updatedSettings
        });

      if (error) throw error;

      setSettings(updatedSettings);
      toast.success('Settings updated');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    }
  };

  const scheduleReminder = async (courseId: string, reminderTime: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: user?.id,
          type: 'course_reminder',
          title: 'Course Reminder',
          message: 'Time to continue your learning!',
          data: { course_id: courseId },
          scheduled_for: reminderTime,
          priority: 'medium'
        });

      if (error) throw error;
      toast.success('Reminder scheduled');
    } catch (error) {
      console.error('Error scheduling reminder:', error);
      toast.error('Failed to schedule reminder');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'course_reminder':
        return <BookOpen className="h-4 w-4" />;
      case 'achievement':
        return <Trophy className="h-4 w-4" />;
      case 'deadline':
        return <Clock className="h-4 w-4" />;
      case 'update':
        return <Info className="h-4 w-4" />;
      case 'social':
        return <Users className="h-4 w-4" />;
      case 'system':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'high') return 'text-red-600 bg-red-50';
    
    switch (type) {
      case 'course_reminder':
        return 'text-blue-600 bg-blue-50';
      case 'achievement':
        return 'text-yellow-600 bg-yellow-50';
      case 'deadline':
        return 'text-orange-600 bg-orange-50';
      case 'update':
        return 'text-purple-600 bg-purple-50';
      case 'social':
        return 'text-green-600 bg-green-50';
      case 'system':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.is_read;
    if (filter === 'read') return notification.is_read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="mobile-notifications w-full max-w-md mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">Notifications</h2>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="rounded-full">
              {unreadCount}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              <Check className="h-4 w-4 mr-1" />
              Mark All Read
            </Button>
          )}
          <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Notification Settings</SheetTitle>
              </SheetHeader>
              <div className="space-y-6 mt-6">
                <div>
                  <h3 className="font-medium mb-3">Notification Types</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Course Reminders</span>
                      <Switch
                        checked={settings.course_reminders}
                        onCheckedChange={(checked) => updateSettings({ course_reminders: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Achievement Alerts</span>
                      <Switch
                        checked={settings.achievement_alerts}
                        onCheckedChange={(checked) => updateSettings({ achievement_alerts: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Deadline Warnings</span>
                      <Switch
                        checked={settings.deadline_warnings}
                        onCheckedChange={(checked) => updateSettings({ deadline_warnings: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">System Updates</span>
                      <Switch
                        checked={settings.system_updates}
                        onCheckedChange={(checked) => updateSettings({ system_updates: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Social Notifications</span>
                      <Switch
                        checked={settings.social_notifications}
                        onCheckedChange={(checked) => updateSettings({ social_notifications: checked })}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Delivery Methods</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Push Notifications</span>
                      <Switch
                        checked={settings.push_notifications}
                        onCheckedChange={(checked) => updateSettings({ push_notifications: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Email Notifications</span>
                      <Switch
                        checked={settings.email_notifications}
                        onCheckedChange={(checked) => updateSettings({ email_notifications: checked })}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Reminder Frequency</h3>
                  <Select 
                    value={settings.reminder_frequency} 
                    onValueChange={(value) => updateSettings({ reminder_frequency: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="off">Off</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-muted rounded-lg p-1">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
            filter === 'all' 
              ? 'bg-background text-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
            filter === 'unread' 
              ? 'bg-background text-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setFilter('read')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
            filter === 'read' 
              ? 'bg-background text-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Read ({notifications.length - unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              {filter === 'all' 
                ? 'No notifications yet'
                : `No ${filter} notifications`}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`${!notification.is_read ? 'border-l-4 border-l-primary' : ''} cursor-pointer hover:shadow-md transition-shadow`}
              onClick={() => !notification.is_read && markAsRead(notification.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${getNotificationColor(notification.type, notification.priority)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h3 className={`font-medium text-sm ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {notification.title}
                      </h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className={`text-sm mt-1 ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </span>
                      {notification.priority === 'high' && (
                        <Badge variant="destructive" className="text-xs">
                          High Priority
                        </Badge>
                      )}
                      {!notification.is_read && (
                        <Badge variant="outline" className="text-xs">
                          New
                        </Badge>
                      )}
                    </div>
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