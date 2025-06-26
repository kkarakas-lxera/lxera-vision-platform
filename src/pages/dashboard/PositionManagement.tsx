import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Users, Target, Briefcase, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PositionCreateWizard } from '@/components/dashboard/PositionManagement/PositionCreateWizard';
import { PositionEditModal } from '@/components/dashboard/PositionManagement/PositionEditModal';
import { toast } from 'sonner';

interface CompanyPosition {
  id: string;
  position_code: string;
  position_title: string;
  position_level?: string;
  department?: string;
  description?: string;
  required_skills: any[];
  nice_to_have_skills: any[];
  is_template: boolean;
  created_at: string;
}

interface PositionStats {
  total_positions: number;
  total_employees: number;
  positions_with_gaps: number;
  avg_skill_match: number;
}

export default function PositionManagement() {
  const { userProfile } = useAuth();
  const [positions, setPositions] = useState<CompanyPosition[]>([]);
  const [stats, setStats] = useState<PositionStats>({
    total_positions: 0,
    total_employees: 0,
    positions_with_gaps: 0,
    avg_skill_match: 0
  });
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editPosition, setEditPosition] = useState<CompanyPosition | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  const fetchPositions = async () => {
    if (!userProfile?.company_id) return;

    try {
      // Fetch positions
      const { data: positionsData, error: positionsError } = await supabase
        .from('st_company_positions')
        .select('*')
        .eq('company_id', userProfile.company_id)
        .order('position_title');

      if (positionsError) throw positionsError;

      // Fetch employee count per position
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select('position, id')
        .eq('company_id', userProfile.company_id);

      if (employeeError) throw employeeError;

      // Calculate stats
      const positionEmployeeCount = employeeData?.reduce((acc, emp) => {
        acc[emp.position] = (acc[emp.position] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Fetch gap analysis data
      const { data: gapData, error: gapError } = await supabase
        .rpc('calculate_match_score', {
          p_company_id: userProfile.company_id
        });

      const avgMatch = gapData?.length > 0 
        ? gapData.reduce((sum: number, gap: any) => sum + (gap.match_percentage || 0), 0) / gapData.length
        : 0;

      const positionsWithGaps = new Set(gapData?.filter((gap: any) => gap.match_percentage < 80).map((gap: any) => gap.position_code)).size;

      setStats({
        total_positions: positionsData?.length || 0,
        total_employees: employeeData?.length || 0,
        positions_with_gaps: positionsWithGaps,
        avg_skill_match: Math.round(avgMatch)
      });

      setPositions(positionsData || []);
    } catch (error) {
      console.error('Error fetching positions:', error);
      toast.error('Failed to load positions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, [userProfile?.company_id]);

  const handleDelete = async (position: CompanyPosition) => {
    if (!confirm(`Are you sure you want to delete the position "${position.position_title}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('st_company_positions')
        .delete()
        .eq('id', position.id);

      if (error) throw error;

      toast.success('Position deleted successfully');
      fetchPositions();
    } catch (error) {
      console.error('Error deleting position:', error);
      toast.error('Failed to delete position');
    }
  };

  const departments = Array.from(new Set(positions.map(p => p.department).filter(Boolean)));
  const filteredPositions = selectedDepartment === 'all' 
    ? positions 
    : positions.filter(p => p.department === selectedDepartment);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Position Management</h1>
          <p className="text-muted-foreground mt-1">
            Define positions and skill requirements for your organization
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Position
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Positions</p>
                <p className="text-2xl font-bold text-foreground">{stats.total_positions}</p>
              </div>
              <Briefcase className="h-8 w-8 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold text-foreground">{stats.total_employees}</p>
              </div>
              <Users className="h-8 w-8 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Positions with Gaps</p>
                <p className="text-2xl font-bold text-foreground">{stats.positions_with_gaps}</p>
              </div>
              <Target className="h-8 w-8 text-orange-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Skill Match</p>
                <p className="text-2xl font-bold text-foreground">{stats.avg_skill_match}%</p>
              </div>
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-semibold text-sm">%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Tabs */}
      {departments.length > 0 && (
        <Tabs value={selectedDepartment} onValueChange={setSelectedDepartment}>
          <TabsList>
            <TabsTrigger value="all">All Departments</TabsTrigger>
            {departments.map(dept => (
              <TabsTrigger key={dept} value={dept || 'unknown'}>
                {dept || 'No Department'}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {/* Positions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredPositions.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-12 text-center">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No positions defined yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first position to start defining skill requirements.
              </p>
              <Button onClick={() => setCreateOpen(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create First Position
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredPositions.map((position) => (
            <Card key={position.id} className="hover:shadow-lg transition-all cursor-pointer group">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {position.position_title}
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {position.position_code}
                      </Badge>
                      {position.department && (
                        <Badge variant="secondary" className="text-xs">
                          {position.department}
                        </Badge>
                      )}
                      {position.position_level && (
                        <Badge className="text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                          {position.position_level}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditPosition(position);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(position);
                      }}
                      className="hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Skills Summary */}
                <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                  <p className="text-xs font-medium text-red-700 mb-1">Required Skills</p>
                  <p className="text-2xl font-bold text-red-600">{position.required_skills.length}</p>
                </div>

                {/* Top Skills Preview */}
                {position.required_skills.length > 0 && (
                  <div className="pt-2">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Top Required Skills:</p>
                    <div className="flex flex-wrap gap-1">
                      {position.required_skills.slice(0, 3).map((skill: any, index: number) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="text-xs bg-gray-100"
                        >
                          {skill.skill_name}
                        </Badge>
                      ))}
                      {position.required_skills.length > 3 && (
                        <Badge variant="ghost" className="text-xs">
                          +{position.required_skills.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Position Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Position</DialogTitle>
          </DialogHeader>
          <PositionCreateWizard
            onComplete={() => {
              setCreateOpen(false);
              fetchPositions();
            }}
            onCancel={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Position Modal */}
      <PositionEditModal
        position={editPosition}
        open={!!editPosition}
        onOpenChange={(open) => !open && setEditPosition(null)}
        onSuccess={() => {
          setEditPosition(null);
          fetchPositions();
        }}
      />
    </div>
  );
}