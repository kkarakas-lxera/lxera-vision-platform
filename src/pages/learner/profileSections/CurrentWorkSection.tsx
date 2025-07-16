import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Plus, X, Briefcase, Users, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CurrentWork {
  id?: string;
  project_name: string;
  role_in_project: string;
  description: string;
  technologies: string[];
  start_date: string;
  expected_end_date?: string;
  team_size?: number;
  is_primary: boolean;
  status: 'active' | 'on_hold' | 'completed';
}

interface CurrentWorkSectionProps {
  data: any;
  onSave: (data: any, isComplete: boolean) => void;
  saving: boolean;
}

export default function CurrentWorkSection({ data, onSave, saving }: CurrentWorkSectionProps) {
  const [projects, setProjects] = useState<CurrentWork[]>([]);
  const [newTech, setNewTech] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    loadCurrentWork();
  }, [data]);

  const loadCurrentWork = async () => {
    if (data?.employeeId) {
      const { data: workData, error } = await supabase
        .from('employee_current_work')
        .select('*')
        .eq('employee_id', data.employeeId)
        .order('is_primary', { ascending: false })
        .order('start_date', { ascending: false });

      if (!error && workData) {
        setProjects(workData);
      }
    } else if (data?.projects) {
      setProjects(data.projects);
    }
  };

  const addProject = () => {
    const newProject: CurrentWork = {
      project_name: '',
      role_in_project: '',
      description: '',
      technologies: [],
      start_date: new Date().toISOString().split('T')[0],
      is_primary: projects.length === 0,
      status: 'active'
    };
    setProjects([...projects, newProject]);
    setEditingIndex(projects.length);
  };

  const updateProject = (index: number, field: keyof CurrentWork, value: any) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    
    // If setting as primary, unset others
    if (field === 'is_primary' && value === true) {
      updated.forEach((p, i) => {
        if (i !== index) p.is_primary = false;
      });
    }
    
    setProjects(updated);
  };

  const removeProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const addTechnology = (index: number) => {
    if (newTech.trim()) {
      const updated = [...projects];
      if (!updated[index].technologies) {
        updated[index].technologies = [];
      }
      if (!updated[index].technologies.includes(newTech.trim())) {
        updated[index].technologies.push(newTech.trim());
        setProjects(updated);
      }
      setNewTech('');
    }
  };

  const removeTechnology = (projectIndex: number, techIndex: number) => {
    const updated = [...projects];
    updated[projectIndex].technologies.splice(techIndex, 1);
    setProjects(updated);
  };

  const handleSave = async () => {
    // Validate required fields
    const isValid = projects.every(p => 
      p.project_name && 
      p.role_in_project && 
      p.description
    );

    if (!isValid) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Save to database if we have employee ID
    if (data?.employeeId) {
      for (const project of projects) {
        if (project.id) {
          // Update existing
          const { error } = await supabase
            .from('employee_current_work')
            .update({
              ...project,
              updated_at: new Date().toISOString()
            })
            .eq('id', project.id);
          
          if (error) {
            toast.error(`Failed to update project: ${error.message}`);
            return;
          }
        } else {
          // Insert new
          const { error } = await supabase
            .from('employee_current_work')
            .insert({
              ...project,
              employee_id: data.employeeId
            });
          
          if (error) {
            toast.error(`Failed to save project: ${error.message}`);
            return;
          }
        }
      }
    }

    onSave({ projects }, projects.length > 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Current Work & Projects</h3>
          <p className="text-sm text-muted-foreground">
            Tell us about your current projects and responsibilities
          </p>
        </div>
        <Button onClick={addProject} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center mb-4">
              No current projects added yet
            </p>
            <Button onClick={addProject}>Add Your First Project</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {projects.map((project, index) => (
            <Card key={index} className={project.is_primary ? 'border-blue-500' : ''}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <Input
                      placeholder="Project Name *"
                      value={project.project_name}
                      onChange={(e) => updateProject(index, 'project_name', e.target.value)}
                      className="font-medium text-lg mb-2"
                    />
                    <Input
                      placeholder="Your Role *"
                      value={project.role_in_project}
                      onChange={(e) => updateProject(index, 'role_in_project', e.target.value)}
                      className="mb-2"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeProject(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Description *</Label>
                  <Textarea
                    placeholder="Describe the project and your responsibilities..."
                    value={project.description}
                    onChange={(e) => updateProject(index, 'description', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !project.start_date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {project.start_date ? format(new Date(project.start_date), "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={project.start_date ? new Date(project.start_date) : undefined}
                          onSelect={(date) => updateProject(index, 'start_date', date?.toISOString().split('T')[0])}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label>Expected End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !project.expected_end_date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {project.expected_end_date ? format(new Date(project.expected_end_date), "PPP") : "Ongoing"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={project.expected_end_date ? new Date(project.expected_end_date) : undefined}
                          onSelect={(date) => updateProject(index, 'expected_end_date', date?.toISOString().split('T')[0])}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Status</Label>
                    <Select
                      value={project.status}
                      onValueChange={(value) => updateProject(index, 'status', value as 'active' | 'on_hold' | 'completed')}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="on_hold">On Hold</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Team Size</Label>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder="e.g., 5"
                        value={project.team_size || ''}
                        onChange={(e) => updateProject(index, 'team_size', parseInt(e.target.value) || undefined)}
                      />
                    </div>
                  </div>

                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={project.is_primary}
                        onChange={(e) => updateProject(index, 'is_primary', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm">Primary Project</span>
                    </label>
                  </div>
                </div>

                <div>
                  <Label>Technologies & Tools</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="Add technology..."
                      value={newTech}
                      onChange={(e) => setNewTech(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTechnology(index);
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      onClick={() => addTechnology(index)}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies?.map((tech, techIndex) => (
                      <Badge key={techIndex} variant="secondary">
                        {tech}
                        <button
                          onClick={() => removeTechnology(index, techIndex)}
                          className="ml-2 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-end gap-4">
        <Button
          onClick={handleSave}
          disabled={saving || projects.length === 0}
        >
          {saving ? 'Saving...' : 'Save Current Work'}
        </Button>
      </div>
    </div>
  );
}