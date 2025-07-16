import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Clock, 
  Code, 
  Users, 
  FileText, 
  Search, 
  TestTube, 
  Lightbulb, 
  GraduationCap,
  BarChart3,
  AlertCircle,
  Plus,
  X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DailyTask {
  id?: string;
  task_category: string;
  description: string;
  percentage_of_time: number;
  tools_used: string[];
}

interface DailyTasksSectionProps {
  data: any;
  onSave: (data: any, isComplete: boolean) => void;
  saving: boolean;
}

const TASK_CATEGORIES = [
  { value: 'coding', label: 'Coding/Development', icon: Code, color: 'blue' },
  { value: 'meetings', label: 'Meetings & Collaboration', icon: Users, color: 'green' },
  { value: 'documentation', label: 'Documentation', icon: FileText, color: 'purple' },
  { value: 'code_review', label: 'Code Review', icon: Search, color: 'orange' },
  { value: 'testing', label: 'Testing & QA', icon: TestTube, color: 'red' },
  { value: 'design', label: 'Design & Architecture', icon: Lightbulb, color: 'yellow' },
  { value: 'research', label: 'Research & Learning', icon: GraduationCap, color: 'indigo' },
  { value: 'mentoring', label: 'Mentoring & Support', icon: Users, color: 'pink' },
  { value: 'planning', label: 'Planning & Strategy', icon: BarChart3, color: 'cyan' },
  { value: 'other', label: 'Other Tasks', icon: Clock, color: 'gray' }
];

export default function DailyTasksSection({ data, onSave, saving }: DailyTasksSectionProps) {
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [newTool, setNewTool] = useState('');
  const [editingTaskIndex, setEditingTaskIndex] = useState<number | null>(null);

  useEffect(() => {
    loadTasks();
  }, [data]);

  const loadTasks = async () => {
    if (data?.employeeId) {
      const { data: tasksData, error } = await supabase
        .from('employee_daily_tasks')
        .select('*')
        .eq('employee_id', data.employeeId)
        .order('percentage_of_time', { ascending: false });

      if (!error && tasksData) {
        setTasks(tasksData);
      }
    } else if (data?.tasks) {
      setTasks(data.tasks);
    } else {
      // Initialize with common tasks
      setTasks([
        { task_category: 'coding', description: '', percentage_of_time: 40, tools_used: [] },
        { task_category: 'meetings', description: '', percentage_of_time: 20, tools_used: [] },
        { task_category: 'code_review', description: '', percentage_of_time: 15, tools_used: [] },
        { task_category: 'documentation', description: '', percentage_of_time: 10, tools_used: [] },
        { task_category: 'research', description: '', percentage_of_time: 10, tools_used: [] },
        { task_category: 'other', description: '', percentage_of_time: 5, tools_used: [] }
      ]);
    }
  };

  const getTotalPercentage = () => {
    return tasks.reduce((sum, task) => sum + task.percentage_of_time, 0);
  };

  const updateTask = (index: number, updates: Partial<DailyTask>) => {
    const updated = [...tasks];
    updated[index] = { ...updated[index], ...updates };
    
    // Validate total doesn't exceed 100%
    const newTotal = updated.reduce((sum, task) => sum + task.percentage_of_time, 0);
    if (newTotal > 100) {
      toast.error('Total time cannot exceed 100%');
      return;
    }
    
    setTasks(updated);
  };

  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const addTask = () => {
    const remainingPercentage = 100 - getTotalPercentage();
    if (remainingPercentage <= 0) {
      toast.error('Total time allocation is already at 100%');
      return;
    }

    const unusedCategories = TASK_CATEGORIES
      .filter(cat => !tasks.some(task => task.task_category === cat.value))
      .map(cat => cat.value);

    if (unusedCategories.length === 0) {
      toast.error('All task categories are already in use');
      return;
    }

    setTasks([...tasks, {
      task_category: unusedCategories[0],
      description: '',
      percentage_of_time: Math.min(remainingPercentage, 10),
      tools_used: []
    }]);
  };

  const addToolToTask = (taskIndex: number) => {
    if (newTool.trim() && !tasks[taskIndex].tools_used.includes(newTool.trim())) {
      const updated = [...tasks];
      updated[taskIndex].tools_used.push(newTool.trim());
      setTasks(updated);
      setNewTool('');
    }
  };

  const removeToolFromTask = (taskIndex: number, toolIndex: number) => {
    const updated = [...tasks];
    updated[taskIndex].tools_used.splice(toolIndex, 1);
    setTasks(updated);
  };

  const handleSave = async () => {
    const total = getTotalPercentage();
    if (total !== 100) {
      toast.error(`Time allocation must equal 100% (currently ${total}%)`);
      return;
    }

    // Save to database if we have employee ID
    if (data?.employeeId) {
      // Delete existing tasks first
      await supabase
        .from('employee_daily_tasks')
        .delete()
        .eq('employee_id', data.employeeId);

      // Insert all tasks
      const { error } = await supabase
        .from('employee_daily_tasks')
        .insert(
          tasks.map(task => ({
            ...task,
            employee_id: data.employeeId,
            id: undefined // Remove id for insert
          }))
        );

      if (error) {
        toast.error(`Failed to save tasks: ${error.message}`);
        return;
      }
    }

    onSave({ tasks }, true);
  };

  const getCategoryInfo = (category: string) => {
    return TASK_CATEGORIES.find(c => c.value === category) || TASK_CATEGORIES[TASK_CATEGORIES.length - 1];
  };

  const totalPercentage = getTotalPercentage();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Daily Task Allocation</h3>
          <p className="text-sm text-muted-foreground">
            How do you typically spend your time at work?
          </p>
        </div>
        <Button 
          onClick={addTask} 
          variant="outline" 
          size="sm"
          disabled={totalPercentage >= 100}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Total Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Total Time Allocated</span>
              <span className={totalPercentage === 100 ? 'text-green-600' : 'text-orange-600'}>
                {totalPercentage}%
              </span>
            </div>
            <Progress 
              value={totalPercentage} 
              className={totalPercentage === 100 ? '' : 'bg-orange-100'}
            />
            {totalPercentage !== 100 && (
              <Alert className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {totalPercentage < 100 
                    ? `You have ${100 - totalPercentage}% unallocated time` 
                    : `You've exceeded 100% by ${totalPercentage - 100}%`}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Task List */}
      <div className="space-y-4">
        {tasks.map((task, index) => {
          const categoryInfo = getCategoryInfo(task.task_category);
          const Icon = categoryInfo.icon;
          
          return (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-${categoryInfo.color}-100`}>
                      <Icon className={`h-5 w-5 text-${categoryInfo.color}-600`} />
                    </div>
                    <div>
                      <CardTitle className="text-base">{categoryInfo.label}</CardTitle>
                      <CardDescription>{task.percentage_of_time}% of time</CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTask(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Time Allocation: {task.percentage_of_time}%</Label>
                  <Slider
                    value={[task.percentage_of_time]}
                    onValueChange={([value]) => updateTask(index, { percentage_of_time: value })}
                    min={0}
                    max={100}
                    step={5}
                    className="py-4"
                  />
                </div>

                <div>
                  <Label>Description (Optional)</Label>
                  <Textarea
                    placeholder="Describe typical activities in this category..."
                    value={task.description}
                    onChange={(e) => updateTask(index, { description: e.target.value })}
                    rows={2}
                  />
                </div>

                <div>
                  <Label>Tools Used</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="Add tools used for this task..."
                      value={editingTaskIndex === index ? newTool : ''}
                      onChange={(e) => {
                        setNewTool(e.target.value);
                        setEditingTaskIndex(index);
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addToolToTask(index);
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingTaskIndex(index);
                        addToolToTask(index);
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {task.tools_used.map((tool, toolIndex) => (
                      <Badge key={toolIndex} variant="secondary">
                        {tool}
                        <button
                          onClick={() => removeToolFromTask(index, toolIndex)}
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
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving || totalPercentage !== 100}
        >
          {saving ? 'Saving...' : 'Save Task Allocation'}
        </Button>
      </div>
    </div>
  );
}