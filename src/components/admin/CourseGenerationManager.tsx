
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useContentManager, ModuleSpec } from '@/lib/ContentManager';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  BookOpen, 
  Brain, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Loader2,
  Plus,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GenerationSession {
  content_id: string;
  module_name: string;
  employee_name: string;
  status: string;
  priority_level: string;
  created_at: string;
  total_word_count: number;
}

export const CourseGenerationManager = () => {
  const { userProfile } = useAuth();
  const contentManager = useContentManager();
  const { toast } = useToast();
  
  const [sessions, setSessions] = useState<GenerationSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  
  const [formData, setFormData] = useState<ModuleSpec>({
    module_name: '',
    employee_name: '',
    current_role: '',
    career_goal: '',
    key_tools: [],
    personalization_level: 'standard',
    priority_level: 'medium'
  });

  useEffect(() => {
    fetchSessions();
    
    // Set up real-time subscription for company modules
    const channel = supabase
      .channel('company-modules')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'cm_module_content',
        filter: `company_id=eq.${userProfile?.company_id}`
      }, () => {
        fetchSessions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userProfile?.company_id]);

  const fetchSessions = async () => {
    try {
      const modules = await contentManager.list_company_modules();
      setSessions(modules.map(module => ({
        content_id: module.content_id,
        module_name: module.module_name,
        employee_name: module.employee_name,
        status: module.status,
        priority_level: module.priority_level,
        created_at: module.created_at,
        total_word_count: module.total_word_count || 0
      })));
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      toast({
        title: "Error",
        description: "Failed to load course generation sessions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateModule = async () => {
    if (!formData.module_name || !formData.employee_name) {
      toast({
        title: "Validation Error",
        description: "Module name and employee name are required",
        variant: "destructive"
      });
      return;
    }

    setCreating(true);
    try {
      const session = await contentManager.create_module_content(formData);
      
      toast({
        title: "Course Generation Started",
        description: `Module "${formData.module_name}" is being generated`,
      });
      
      setShowCreateForm(false);
      setFormData({
        module_name: '',
        employee_name: '',
        current_role: '',
        career_goal: '',
        key_tools: [],
        personalization_level: 'standard',
        priority_level: 'medium'
      });
      
      fetchSessions();
    } catch (error) {
      console.error('Failed to create module:', error);
      toast({
        title: "Error",
        description: "Failed to start course generation",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'quality_check': return <Brain className="h-4 w-4 text-blue-500" />;
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Loader2 className="h-4 w-4 animate-spin" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'secondary' as const,
      quality_check: 'default' as const,
      approved: 'default' as const,
      failed: 'destructive' as const
    };
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading course generation sessions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Course Generation Management</h2>
          <p className="text-gray-600">Manage AI-powered course generation for your company</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} disabled={creating}>
          <Plus className="h-4 w-4 mr-2" />
          Generate New Course
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Generate New Course Module</CardTitle>
            <CardDescription>Create a personalized course module using AI</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="module_name">Module Name *</Label>
                <Input
                  id="module_name"
                  value={formData.module_name}
                  onChange={(e) => setFormData({...formData, module_name: e.target.value})}
                  placeholder="e.g., Financial Analysis Fundamentals"
                />
              </div>
              <div>
                <Label htmlFor="employee_name">Employee Name *</Label>
                <Input
                  id="employee_name"
                  value={formData.employee_name}
                  onChange={(e) => setFormData({...formData, employee_name: e.target.value})}
                  placeholder="e.g., John Smith"
                />
              </div>
              <div>
                <Label htmlFor="current_role">Current Role</Label>
                <Input
                  id="current_role"
                  value={formData.current_role}
                  onChange={(e) => setFormData({...formData, current_role: e.target.value})}
                  placeholder="e.g., Junior Analyst"
                />
              </div>
              <div>
                <Label htmlFor="career_goal">Career Goal</Label>
                <Input
                  id="career_goal"
                  value={formData.career_goal}
                  onChange={(e) => setFormData({...formData, career_goal: e.target.value})}
                  placeholder="e.g., Senior Financial Analyst"
                />
              </div>
              <div>
                <Label htmlFor="personalization_level">Personalization Level</Label>
                <Select value={formData.personalization_level} onValueChange={(value) => setFormData({...formData, personalization_level: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority_level">Priority Level</Label>
                <Select value={formData.priority_level} onValueChange={(value) => setFormData({...formData, priority_level: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="key_tools">Key Tools (comma-separated)</Label>
              <Input
                id="key_tools"
                value={formData.key_tools.join(', ')}
                onChange={(e) => setFormData({...formData, key_tools: e.target.value.split(',').map(t => t.trim()).filter(Boolean)})}
                placeholder="e.g., Excel, PowerBI, SAP"
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleCreateModule} disabled={creating}>
                {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Brain className="h-4 w-4 mr-2" />}
                {creating ? 'Generating...' : 'Generate Course'}
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Course Generation Sessions</CardTitle>
          <CardDescription>Track all course generation activities for your company</CardDescription>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No course generation sessions yet</p>
              <p className="text-sm">Start generating AI-powered courses for your team</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Module Name</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Word Count</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.content_id}>
                    <TableCell className="font-medium">{session.module_name}</TableCell>
                    <TableCell>{session.employee_name}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(session.status)}
                        {getStatusBadge(session.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={session.priority_level === 'critical' || session.priority_level === 'high' ? 'destructive' : 'secondary'}>
                        {session.priority_level.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{session.total_word_count.toLocaleString()}</TableCell>
                    <TableCell>{new Date(session.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
