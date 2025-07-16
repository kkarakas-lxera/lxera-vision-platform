import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Plus, X, Wrench, Code, Database, Cloud, Layers, GitBranch, Palette, FolderKanban } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Tool {
  id?: string;
  tool_name: string;
  category: string;
  proficiency: string;
  years_experience: number;
  last_used?: string;
  frequency: string;
}

interface ToolsSectionProps {
  data: any;
  onSave: (data: any, isComplete: boolean) => void;
  saving: boolean;
}

const CATEGORIES = [
  { value: 'ide', label: 'IDE/Editor', icon: Code },
  { value: 'database', label: 'Database', icon: Database },
  { value: 'cloud', label: 'Cloud Platform', icon: Cloud },
  { value: 'framework', label: 'Framework', icon: Layers },
  { value: 'language', label: 'Programming Language', icon: Code },
  { value: 'devops', label: 'DevOps', icon: GitBranch },
  { value: 'design', label: 'Design Tool', icon: Palette },
  { value: 'project_management', label: 'Project Management', icon: FolderKanban },
  { value: 'other', label: 'Other', icon: Wrench }
];

const PROFICIENCY_LEVELS = [
  { value: 'beginner', label: 'Beginner', description: 'Basic understanding' },
  { value: 'intermediate', label: 'Intermediate', description: 'Can work independently' },
  { value: 'advanced', label: 'Advanced', description: 'Deep expertise' },
  { value: 'expert', label: 'Expert', description: 'Can teach others' }
];

const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'occasionally', label: 'Occasionally' }
];

export default function ToolsSection({ data, onSave, saving }: ToolsSectionProps) {
  const [tools, setTools] = useState<Tool[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTool, setNewTool] = useState<Tool>({
    tool_name: '',
    category: 'other',
    proficiency: 'intermediate',
    years_experience: 1,
    frequency: 'daily'
  });

  useEffect(() => {
    loadTools();
  }, [data]);

  const loadTools = async () => {
    if (data?.employeeId) {
      const { data: toolsData, error } = await supabase
        .from('employee_tools')
        .select('*')
        .eq('employee_id', data.employeeId)
        .order('category', { ascending: true })
        .order('tool_name', { ascending: true });

      if (!error && toolsData) {
        setTools(toolsData);
      }
    } else if (data?.tools) {
      setTools(data.tools);
    }
  };

  const addTool = async () => {
    if (!newTool.tool_name.trim()) {
      toast.error('Tool name is required');
      return;
    }

    // Check for duplicates
    if (tools.some(t => t.tool_name.toLowerCase() === newTool.tool_name.toLowerCase())) {
      toast.error('This tool is already in your list');
      return;
    }

    const toolToAdd = {
      ...newTool,
      last_used: new Date().toISOString().split('T')[0]
    };

    setTools([...tools, toolToAdd]);
    setNewTool({
      tool_name: '',
      category: 'other',
      proficiency: 'intermediate',
      years_experience: 1,
      frequency: 'daily'
    });
    setShowAddForm(false);
  };

  const updateTool = (index: number, updates: Partial<Tool>) => {
    const updated = [...tools];
    updated[index] = { ...updated[index], ...updates };
    setTools(updated);
  };

  const removeTool = (index: number) => {
    setTools(tools.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (tools.length === 0) {
      toast.error('Please add at least one tool or technology');
      return;
    }

    // Save to database if we have employee ID
    if (data?.employeeId) {
      // Delete existing tools first
      await supabase
        .from('employee_tools')
        .delete()
        .eq('employee_id', data.employeeId);

      // Insert all tools
      const { error } = await supabase
        .from('employee_tools')
        .insert(
          tools.map(tool => ({
            ...tool,
            employee_id: data.employeeId,
            id: undefined // Remove id for insert
          }))
        );

      if (error) {
        toast.error(`Failed to save tools: ${error.message}`);
        return;
      }
    }

    onSave({ tools }, tools.length >= 3); // Consider complete if at least 3 tools
  };

  const getCategoryIcon = (category: string) => {
    const cat = CATEGORIES.find(c => c.value === category);
    const Icon = cat?.icon || Wrench;
    return <Icon className="h-4 w-4" />;
  };

  const groupedTools = tools.reduce((acc, tool) => {
    if (!acc[tool.category]) acc[tool.category] = [];
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<string, Tool[]>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Tools & Technologies</h3>
          <p className="text-sm text-muted-foreground">
            List the tools and technologies you work with
          </p>
        </div>
        <Button 
          onClick={() => setShowAddForm(true)} 
          variant="outline" 
          size="sm"
          disabled={showAddForm}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Tool
        </Button>
      </div>

      {showAddForm && (
        <Card className="border-blue-500">
          <CardHeader>
            <CardTitle className="text-base">Add New Tool</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tool/Technology Name *</Label>
                <Input
                  placeholder="e.g., React, VS Code, AWS..."
                  value={newTool.tool_name}
                  onChange={(e) => setNewTool({ ...newTool, tool_name: e.target.value })}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={newTool.category}
                  onValueChange={(value) => setNewTool({ ...newTool, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(cat.value)}
                          {cat.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Proficiency Level</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {PROFICIENCY_LEVELS.map(level => (
                  <Button
                    key={level.value}
                    variant={newTool.proficiency === level.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setNewTool({ ...newTool, proficiency: level.value })}
                    className="flex-col h-auto py-2"
                  >
                    <span className="font-medium">{level.label}</span>
                    <span className="text-xs opacity-70">{level.description}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Years of Experience: {newTool.years_experience}</Label>
                <Slider
                  value={[newTool.years_experience]}
                  onValueChange={([value]) => setNewTool({ ...newTool, years_experience: value })}
                  min={0}
                  max={20}
                  step={0.5}
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0</span>
                  <span>20+ years</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Usage Frequency</Label>
                <Select
                  value={newTool.frequency}
                  onValueChange={(value) => setNewTool({ ...newTool, frequency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FREQUENCY_OPTIONS.map(freq => (
                      <SelectItem key={freq.value} value={freq.value}>
                        {freq.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button onClick={addTool}>
                Add Tool
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {tools.length === 0 && !showAddForm ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Wrench className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center mb-4">
              No tools or technologies added yet
            </p>
            <Button onClick={() => setShowAddForm(true)}>Add Your First Tool</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedTools).map(([category, categoryTools]) => {
            const categoryInfo = CATEGORIES.find(c => c.value === category);
            return (
              <Card key={category}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    {getCategoryIcon(category)}
                    {categoryInfo?.label || 'Other'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {categoryTools.map((tool, index) => {
                      const toolIndex = tools.findIndex(t => t === tool);
                      return (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <span className="font-medium">{tool.tool_name}</span>
                              <Badge variant="secondary">{tool.proficiency}</Badge>
                              <Badge variant="outline">{tool.years_experience} years</Badge>
                              <Badge variant="outline">{tool.frequency}</Badge>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTool(toolIndex)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {tools.length} tool{tools.length !== 1 ? 's' : ''} added
        </p>
        <Button
          onClick={handleSave}
          disabled={saving || tools.length === 0}
        >
          {saving ? 'Saving...' : 'Save Tools & Technologies'}
        </Button>
      </div>
    </div>
  );
}