import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PositionCreateWizard } from '@/components/dashboard/PositionManagement/PositionCreateWizard';
import { PositionEditSheet } from '@/components/dashboard/PositionManagement/PositionEditSheet';
import { toast } from 'sonner';

interface CompanyPosition {
  id: string;
  position_code: string;
  position_title: string;
  position_level?: string;
  department?: string;
  required_skills: any[];
  nice_to_have_skills: any[];
  is_template: boolean;
  created_at: string;
}

export default function PositionManagement() {
  const { userProfile } = useAuth();
  const [positions, setPositions] = useState<CompanyPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editPosition, setEditPosition] = useState<CompanyPosition | null>(null);

  const fetchPositions = async () => {
    if (!userProfile?.company_id) return;

    try {
      const { data, error } = await supabase
        .from('st_company_positions')
        .select('*')
        .eq('company_id', userProfile.company_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPositions(data || []);
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

  const getPositionLevelColor = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'junior':
        return 'bg-green-100 text-green-800';
      case 'mid':
      case 'middle':
        return 'bg-blue-100 text-blue-800';
      case 'senior':
        return 'bg-purple-100 text-purple-800';
      case 'lead':
      case 'principal':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
            Define job positions and their skill requirements for skills gap analysis
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Position
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Positions</p>
                <p className="text-2xl font-bold text-foreground">{positions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Templates</p>
                <p className="text-2xl font-bold text-foreground">
                  {positions.filter(p => p.is_template).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-semibold">Σ</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Skills</p>
                <p className="text-2xl font-bold text-foreground">
                  {positions.reduce((sum, p) => sum + p.required_skills.length + p.nice_to_have_skills.length, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Positions List */}
      <div className="space-y-4">
        {positions.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No positions defined yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first position template to start defining skill requirements for your team.
              </p>
              <Button onClick={() => setCreateOpen(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create First Position
              </Button>
            </CardContent>
          </Card>
        ) : (
          positions.map((position) => (
            <Card key={position.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-foreground">{position.position_title}</CardTitle>
                      {position.position_level && (
                        <Badge variant="secondary" className={getPositionLevelColor(position.position_level)}>
                          {position.position_level}
                        </Badge>
                      )}
                      {position.is_template && (
                        <Badge variant="outline" className="text-blue-600 border-blue-600">
                          Template
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Code: {position.position_code}</span>
                      {position.department && <span>Department: {position.department}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditPosition(position)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(position)}
                      className="flex items-center gap-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Required Skills */}
                  {position.required_skills.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        Required Skills ({position.required_skills.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {position.required_skills.slice(0, 5).map((skill: any, index: number) => (
                          <Badge key={index} variant="secondary" className="bg-red-50 text-red-700 border-red-200">
                            {skill.skill_name}
                            {skill.proficiency_level && ` (${skill.proficiency_level})`}
                          </Badge>
                        ))}
                        {position.required_skills.length > 5 && (
                          <Badge variant="outline">
                            +{position.required_skills.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Nice to Have Skills */}
                  {position.nice_to_have_skills.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Nice to Have Skills ({position.nice_to_have_skills.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {position.nice_to_have_skills.slice(0, 5).map((skill: any, index: number) => (
                          <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                            {skill.skill_name}
                            {skill.proficiency_level && ` (${skill.proficiency_level})`}
                          </Badge>
                        ))}
                        {position.nice_to_have_skills.length > 5 && (
                          <Badge variant="outline">
                            +{position.nice_to_have_skills.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {position.required_skills.length === 0 && position.nice_to_have_skills.length === 0 && (
                    <p className="text-muted-foreground text-sm">No skills defined yet. Click Edit to add skill requirements.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Position Sheet */}
      <PositionCreateWizard
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={() => {
          setCreateOpen(false);
          fetchPositions();
        }}
      />

      {/* Edit Position Sheet */}
      <PositionEditSheet
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