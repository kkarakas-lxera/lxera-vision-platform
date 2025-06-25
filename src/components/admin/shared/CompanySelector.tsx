import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Company {
  id: string;
  name: string;
  domain: string;
  plan_type: string;
  is_active: boolean;
  max_employees: number;
  max_courses: number;
}

interface CompanyStats {
  employeeCount: number;
  activeEmployees: number;
  courseCount: number;
  completedCourses: number;
}

interface CompanySelectorProps {
  selectedCompanyId: string | null;
  onCompanyChange: (companyId: string) => void;
  showStats?: boolean;
}

export const CompanySelector: React.FC<CompanySelectorProps> = ({
  selectedCompanyId,
  onCompanyChange,
  showStats = true
}) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CompanyStats | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompanyId && companies.length > 0) {
      const company = companies.find(c => c.id === selectedCompanyId);
      setSelectedCompany(company || null);
      if (company && showStats) {
        fetchCompanyStats(selectedCompanyId);
      }
    }
  }, [selectedCompanyId, companies, showStats]);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyStats = async (companyId: string) => {
    try {
      // Fetch employee stats
      const { data: employees } = await supabase
        .from('employees')
        .select('id, is_active')
        .eq('company_id', companyId);

      const employeeCount = employees?.length || 0;
      const activeEmployees = employees?.filter(e => e.is_active).length || 0;

      // Fetch course stats
      const { data: courses } = await supabase
        .from('cm_module_content')
        .select('content_id, status')
        .eq('company_id', companyId);

      const courseCount = courses?.length || 0;
      const completedCourses = courses?.filter(c => c.status === 'approved').length || 0;

      setStats({
        employeeCount,
        activeEmployees,
        courseCount,
        completedCourses
      });
    } catch (error) {
      console.error('Error fetching company stats:', error);
    }
  };

  if (loading) {
    return <div>Loading companies...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Building2 className="h-5 w-5 text-muted-foreground" />
        <Select value={selectedCompanyId || ''} onValueChange={onCompanyChange}>
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Select a company to view data" />
          </SelectTrigger>
          <SelectContent>
            {companies.map((company) => (
              <SelectItem key={company.id} value={company.id}>
                <div className="flex items-center justify-between w-full">
                  <span>{company.name}</span>
                  <Badge variant="outline" className="ml-2 text-xs">
                    {company.plan_type}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {showStats && selectedCompany && stats && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">{selectedCompany.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedCompany.domain}</p>
            </div>
            <div className="flex space-x-6">
              <div className="text-center">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-2xl font-bold">{stats.employeeCount}</p>
                    <p className="text-xs text-muted-foreground">
                      {stats.activeEmployees} active / {selectedCompany.max_employees} max
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-2xl font-bold">{stats.courseCount}</p>
                    <p className="text-xs text-muted-foreground">
                      {stats.completedCourses} completed / {selectedCompany.max_courses} max
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};