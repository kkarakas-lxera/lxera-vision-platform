import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  AlertTriangle, 
  Loader2, 
  Building2, 
  Users, 
  BookOpen,
  Calendar,
  DollarSign
} from 'lucide-react';

interface Company {
  id: string;
  name: string;
  domain: string;
  logo_url?: string;
  plan_type: string;
  max_employees: number;
  max_courses: number;
  is_active: boolean;
  created_at: string;
  settings?: Record<string, unknown>;
}

interface CompanyStats {
  totalEmployees: number;
  activeEmployees: number;
  totalCourses: number;
  completedCourses: number;
  averageCompletionRate: number;
}

interface CompanyEditSheetProps {
  company: Company | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompanyUpdated: () => void;
}

export function CompanyEditSheet({ company, open, onOpenChange, onCompanyUpdated }: CompanyEditSheetProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<CompanyStats | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    logo_url: '',
    plan_type: 'basic',
    max_employees: 10,
    max_courses: 5,
    is_active: true,
  });

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name,
        domain: company.domain,
        logo_url: company.logo_url || '',
        plan_type: company.plan_type,
        max_employees: company.max_employees,
        max_courses: company.max_courses,
        is_active: company.is_active,
      });
      fetchCompanyStats();
    }
  }, [company]);

  const fetchCompanyStats = async () => {
    if (!company) return;
    
    try {
      // Fetch employee stats
      const { data: employees } = await supabase
        .from('employees')
        .select('id, is_active')
        .eq('company_id', company.id);

      const totalEmployees = employees?.length || 0;
      const activeEmployees = employees?.filter(e => e.is_active).length || 0;

      // Fetch course stats
      const { data: modules } = await supabase
        .from('cm_module_content')
        .select('content_id, status')
        .eq('company_id', company.id);

      const totalCourses = modules?.length || 0;
      const completedCourses = modules?.filter(m => m.status === 'approved').length || 0;

      // Fetch assignment completion stats
      const { data: assignments } = await supabase
        .from('course_assignments')
        .select('id, status, progress_percentage')
        .eq('company_id', company.id);

      const completedAssignments = assignments?.filter(a => a.status === 'completed').length || 0;
      const totalAssignments = assignments?.length || 0;
      const averageCompletionRate = totalAssignments > 0 
        ? Math.round((completedAssignments / totalAssignments) * 100)
        : 0;

      setStats({
        totalEmployees,
        activeEmployees,
        totalCourses,
        completedCourses,
        averageCompletionRate,
      });
    } catch (error) {
      console.error('Error fetching company stats:', error);
    }
  };

  const handleSave = async () => {
    if (!company) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('companies')
        .update({
          name: formData.name,
          domain: formData.domain,
          logo_url: formData.logo_url || null,
          plan_type: formData.plan_type,
          max_employees: formData.max_employees,
          max_courses: formData.max_courses,
          is_active: formData.is_active,
        })
        .eq('id', company.id);

      if (error) throw error;

      toast({
        title: 'Company updated',
        description: 'Company details have been successfully updated.',
      });
      
      onCompanyUpdated();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!company) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Company</SheetTitle>
          <SheetDescription>
            Update company information and manage subscription
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-4">
          {/* Company Stats */}
          {stats && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <div className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Employees</p>
                      <p className="text-2xl font-bold">{stats.totalEmployees}</p>
                      <p className="text-xs text-muted-foreground">{stats.activeEmployees} active</p>
                    </div>
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                </Card>

                <Card>
                  <div className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Courses</p>
                      <p className="text-2xl font-bold">{stats.totalCourses}</p>
                      <p className="text-xs text-muted-foreground">{stats.completedCourses} completed</p>
                    </div>
                    <BookOpen className="h-8 w-8 text-muted-foreground" />
                  </div>
                </Card>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Average Completion Rate</span>
                  <span className="text-sm font-bold">{stats.averageCompletionRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${stats.averageCompletionRate}%` }}
                  />
                </div>
              </div>

              <Separator />
            </>
          )}

          {/* Company Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="domain">Domain</Label>
              <Input
                id="domain"
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                placeholder="example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo_url">Logo URL</Label>
              <Input
                id="logo_url"
                value={formData.logo_url}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                placeholder="https://example.com/logo.png"
              />
            </div>
          </div>

          <Separator />

          {/* Subscription Settings */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Subscription Settings</h4>
            
            <div className="space-y-2">
              <Label htmlFor="plan_type">Plan Type</Label>
              <Select value={formData.plan_type} onValueChange={(value) => setFormData({ ...formData, plan_type: value })}>
                <SelectTrigger id="plan_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="max_employees">Max Employees</Label>
                <Input
                  id="max_employees"
                  type="number"
                  value={formData.max_employees}
                  onChange={(e) => setFormData({ ...formData, max_employees: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_courses">Max Courses</Label>
                <Input
                  id="max_courses"
                  type="number"
                  value={formData.max_courses}
                  onChange={(e) => setFormData({ ...formData, max_courses: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Status & Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Active Status</Label>
                <div className="text-sm text-muted-foreground">
                  Company can access the platform
                </div>
              </div>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>

          <Separator />

          {/* Metadata */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Company Information</h4>
            <div className="text-sm space-y-1 text-muted-foreground">
              <p>Created: {new Date(company.created_at).toLocaleDateString()}</p>
              <p>Company ID: {company.id}</p>
              {stats && (
                <>
                  <p>Employee Utilization: {stats.totalEmployees}/{formData.max_employees} ({Math.round((stats.totalEmployees / formData.max_employees) * 100)}%)</p>
                  <p>Course Utilization: {stats.totalCourses}/{formData.max_courses} ({Math.round((stats.totalCourses / formData.max_courses) * 100)}%)</p>
                </>
              )}
            </div>
          </div>
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// Simple Card component for stats
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>
      {children}
    </div>
  );
}