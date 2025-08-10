import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Users, Target, Briefcase, ChevronRight, ChevronDown, AlertCircle, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PositionCreateWizard } from '@/components/dashboard/PositionManagement/PositionCreateWizard';
import { toast } from 'sonner';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import { useCustomOrder } from '@/hooks/useCustomOrder';
import { SortableItem } from '@/components/ui/sortable-item';
import { parseSkillsArray } from '@/utils/typeGuards';

import type { SkillData } from '@/types/common';

interface CompanyPosition {
  id: string;
  position_code: string;
  position_title: string;
  position_level?: string;
  department?: string;
  description?: string;
  required_skills: SkillData[];
  nice_to_have_skills: SkillData[];
  ai_suggestions?: SkillData[];
  is_template: boolean;
  created_at: string;
  employee_count?: number;
  avg_match_score?: number;
  skills_gap_percentage?: number;
  employees_with_gaps?: number;
  profiles_complete?: number;
  profiles_incomplete?: number;
  invitations_sent?: number;
  no_invitations?: number;
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
  const navigate = useNavigate();
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [openPositions, setOpenPositions] = useState<Set<string>>(new Set());
  const [hasDraft, setHasDraft] = useState(false);
  const [draftInfo, setDraftInfo] = useState<{ id: string; updated_at: string; positions_count: number } | null>(null);
  const [query, setQuery] = useState<string>('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchPositions = async () => {
    if (!userProfile?.company_id) return;

    try {
      // Fetch positions with employee and skills data
      const { data: positionsData, error: positionsError } = await supabase
        .from('st_company_positions')
        .select('*')
        .eq('company_id', userProfile.company_id)
        .order('created_at', { ascending: false });

      if (positionsError) throw positionsError;

      // Fetch all employees with their positions, profiles and skills data
      const { data: employees, error: employeesError } = await supabase
        .from('employees')
        .select(`
          id,
          current_position_id,
          profile_complete,
          user_id,
          cv_analysis_data,
          skills_last_analyzed,
          profile_invitations (
            sent_at,
            viewed_at,
            completed_at
          ),
          employee_skills (
            id,
            skill_name,
            proficiency
          )
        `)
        .eq('company_id', userProfile.company_id);

      if (employeesError) {
        console.error('Error fetching employees:', employeesError);
        throw employeesError;
      }


      // Calculate metrics for each position
      const positionMetrics = new Map();
      let totalEmployees = 0;
      let totalMatchScore = 0;
      let employeesWithScores = 0;

      if (employees) {
        totalEmployees = employees.length;

        for (const employee of employees) {
          if (employee.current_position_id) {
            if (!positionMetrics.has(employee.current_position_id)) {
              positionMetrics.set(employee.current_position_id, {
                employee_count: 0,
                total_score: 0,
                scored_employees: 0,
                employees_with_gaps: 0,
                profiles_complete: 0,
                profiles_incomplete: 0,
                invitations_sent: 0,
                no_invitations: 0
              });
            }

            const metrics = positionMetrics.get(employee.current_position_id);
            metrics.employee_count++;

            // Track profile completion status
            if (employee.profile_complete) {
              metrics.profiles_complete++;
            } else {
              metrics.profiles_incomplete++;
              
              // Check invitation status
              const invitation = Array.isArray(employee.profile_invitations)
                ? employee.profile_invitations?.[0]
                : employee.profile_invitations;
              
              if (invitation?.sent_at) {
                metrics.invitations_sent++;
              } else {
                metrics.no_invitations++;
              }
            }

            // Check if employee has skills - either from cv_analysis_data or employee_skills
            let skillsMatchScore = employee.cv_analysis_data?.skills_match_score;
            
            // If no cv_analysis_data score but has employee_skills, calculate a basic score
            if ((skillsMatchScore === null || skillsMatchScore === undefined) && 
                employee.employee_skills && employee.employee_skills.length > 0) {
              // Calculate a basic match score based on skills proficiency
              // Average proficiency (0-3 scale) converted to percentage
              const avgProficiency = employee.employee_skills.reduce((sum, skill) => 
                sum + (skill.proficiency || 0), 0) / employee.employee_skills.length;
              skillsMatchScore = Math.round((avgProficiency / 3) * 100);
            }
            
            if (skillsMatchScore !== null && skillsMatchScore !== undefined) {
              metrics.total_score += skillsMatchScore;
              metrics.scored_employees++;
              totalMatchScore += skillsMatchScore;
              employeesWithScores++;

              // Count as having gap if score is below 80%
              if (skillsMatchScore < 80) {
                metrics.employees_with_gaps++;
              }
            }
          }
        }
      }

      // Convert database result to typed positions with metrics
      const typedPositions: CompanyPosition[] = (positionsData || []).map(pos => {
        const metrics = positionMetrics.get(pos.id) || {
          employee_count: 0,
          total_score: 0,
          scored_employees: 0,
          employees_with_gaps: 0,
          profiles_complete: 0,
          profiles_incomplete: 0,
          invitations_sent: 0,
          no_invitations: 0
        };

        const avgScore = metrics.scored_employees > 0
          ? metrics.total_score / metrics.scored_employees
          : null;

        const gapPercentage = metrics.employee_count > 0 && avgScore !== null
          ? Math.max(0, 100 - avgScore)
          : null;

        return {
          id: pos.id,
          position_code: pos.position_code,
          position_title: pos.position_title,
          position_level: pos.position_level || undefined,
          department: pos.department || undefined,
          description: pos.description || undefined,
          required_skills: parseSkillsArray(pos.required_skills),
          nice_to_have_skills: parseSkillsArray(pos.nice_to_have_skills),
          ai_suggestions: parseSkillsArray(pos.ai_suggestions),
          is_template: pos.is_template || false,
          created_at: pos.created_at || new Date().toISOString(),
          employee_count: metrics.employee_count,
          avg_match_score: avgScore,
          skills_gap_percentage: gapPercentage,
          employees_with_gaps: metrics.employees_with_gaps,
          profiles_complete: metrics.profiles_complete,
          profiles_incomplete: metrics.profiles_incomplete,
          invitations_sent: metrics.invitations_sent,
          no_invitations: metrics.no_invitations
        };
      });

      setPositions(typedPositions);

      // Calculate overall stats
      const positionsWithGaps = typedPositions.filter(p => 
        p.avg_match_score !== null && p.avg_match_score < 80
      ).length;

      const overallAvgMatch = employeesWithScores > 0
        ? totalMatchScore / employeesWithScores
        : 0;


      const stats: PositionStats = {
        total_positions: typedPositions.length,
        total_employees: totalEmployees,
        positions_with_gaps: positionsWithGaps,
        avg_skill_match: Math.round(overallAvgMatch)
      };

      setStats(stats);
    } catch (error) {
      console.error('Error fetching positions:', error);
      toast.error('Failed to load positions');
    } finally {
      setLoading(false);
    }
  };

  const checkForDraft = async () => {
    if (!userProfile?.company_id) return;
    
    try {
      const { data: drafts, error } = await supabase
        .from('position_drafts')
        .select('id, updated_at, draft_data')
        .eq('company_id', userProfile.company_id)
        .eq('created_by', userProfile.id)
        .order('updated_at', { ascending: false })
        .limit(1);
        
      if (error) throw error;
      
      if (drafts && drafts.length > 0) {
        const draft = drafts[0];
        const draftData = draft.draft_data as any;
        const positionsCount = draftData.positions?.length || 0;
        
        setHasDraft(true);
        setDraftInfo({
          id: draft.id,
          updated_at: draft.updated_at,
          positions_count: positionsCount
        });
      }
    } catch (error) {
      console.error('Error checking for draft:', error);
    }
  };

  useEffect(() => {
    fetchPositions();
    checkForDraft();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile]);

  const handleDiscardDraft = async () => {
    if (!draftInfo) return;
    
    const confirmed = window.confirm(
      'Are you sure you want to discard this draft? This action cannot be undone.'
    );
    
    if (!confirmed) return;
    
    try {
      const { error } = await supabase
        .from('position_drafts')
        .delete()
        .eq('id', draftInfo.id);
        
      if (error) throw error;
      
      // Reset draft state
      setHasDraft(false);
      setDraftInfo(null);
      
      toast.success('Draft discarded successfully');
    } catch (error) {
      console.error('Error discarding draft:', error);
      toast.error('Failed to discard draft');
    }
  };

  const handleDelete = async (position: CompanyPosition) => {
    // First check if there are employees assigned to this position
    const { count: employeeCount } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('current_position_id', position.id);

    if (employeeCount && employeeCount > 0) {
      toast.error(
        `Cannot delete position "${position.position_title}" because ${employeeCount} employee${employeeCount > 1 ? 's are' : ' is'} assigned to it. Please reassign the employee${employeeCount > 1 ? 's' : ''} first.`,
        { duration: 5000 }
      );
      return;
    }

    if (!confirm(`Are you sure you want to delete the position "${position.position_title}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('st_company_positions')
        .delete()
        .eq('id', position.id);

      if (error) {
        // Handle specific error cases
        if (error.code === '23503') {
          toast.error(
            'Cannot delete this position because it has related data. Please remove all references to this position first.',
            { duration: 5000 }
          );
        } else {
          throw error;
        }
        return;
      }

      toast.success('Position deleted successfully');
      fetchPositions();
    } catch (error) {
      console.error('Error deleting position:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete position');
    }
  };

  const departments = Array.from(new Set(positions.map(p => p.department).filter(Boolean))) || [];
  const baseFilteredPositions = selectedDepartment === 'all'
    ? positions
    : positions.filter(p => p.department === selectedDepartment);

  // Apply search and filter criteria
  const normalizedQuery = query.trim().toLowerCase();
  const fullyFilteredPositions = baseFilteredPositions.filter((p) => {
    const matchesQuery =
      normalizedQuery.length === 0 ||
      p.position_title.toLowerCase().includes(normalizedQuery) ||
      p.position_code.toLowerCase().includes(normalizedQuery) ||
      (p.department ? p.department.toLowerCase().includes(normalizedQuery) : false);

    const matchesLevel = levelFilter === 'all' || (p.position_level ?? '').toLowerCase() === levelFilter.toLowerCase();

    let matchesStatus = true;
    if (statusFilter === 'has_analysis') {
      matchesStatus = p.avg_match_score !== null && p.avg_match_score !== undefined;
    } else if (statusFilter === 'no_analysis') {
      matchesStatus = p.avg_match_score === null || p.avg_match_score === undefined;
    } else if (statusFilter === 'has_pending') {
      matchesStatus = (p.profiles_incomplete || 0) > 0;
    }

    return matchesQuery && matchesLevel && matchesStatus;
  });

  // Use custom order hook for drag and drop
  const { orderedItems: filteredPositions, handleDragEnd } = useCustomOrder({
    items: fullyFilteredPositions,
    storageKey: `positions-order-${userProfile?.company_id}-${selectedDepartment}`,
    getItemId: (position) => position.id
  });

  if (!userProfile?.company_id) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
          <p className="font-medium">Company information is loading...</p>
          <p className="text-sm mt-1">Please wait while we load your company data.</p>
        </div>
      </div>
    );
  }

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Position Management</h1>
          <p className="text-gray-600 mt-1">Define and manage company positions and their skill requirements</p>
        </div>
        {positions.length > 0 && (
          <Button onClick={() => navigate('/dashboard/positions/new')} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Position
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Briefcase className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Positions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_positions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_employees}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Positions List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Positions</CardTitle>
                <CardDescription>Manage your company positions and requirements</CardDescription>
              </div>
              {departments.length > 0 && (
                <Tabs value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <TabsList>
                    <TabsTrigger value="all">All Departments</TabsTrigger>
                    {departments.map(dept => (
                      <TabsTrigger key={dept} value={dept || 'none'}>
                        {dept || 'No Department'}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title, code, or department"
              />
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {Array.from(new Set(positions.map(p => p.position_level).filter(Boolean))).map((lvl) => (
                    <SelectItem key={String(lvl)} value={String(lvl)}>{String(lvl)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="has_analysis">Has Analysis</SelectItem>
                  <SelectItem value="no_analysis">No Analysis</SelectItem>
                  <SelectItem value="has_pending">Has Pending Profiles</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading positions...</p>
            </div>
          ) : positions.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No positions defined</h3>
              <p className="text-gray-500 mb-4">
                {hasDraft ? 'Continue where you left off' : 'Create your first position to get started'}
              </p>
              {hasDraft && draftInfo ? (
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    Draft saved {new Date(draftInfo.updated_at).toLocaleDateString()} at {new Date(draftInfo.updated_at).toLocaleTimeString()}
                    {draftInfo.positions_count > 0 && ` • ${draftInfo.positions_count} position${draftInfo.positions_count > 1 ? 's' : ''}`}
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <Button onClick={() => navigate('/dashboard/positions/new')}>
                      Continue Draft
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => handleDiscardDraft()}
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                    >
                      Discard
                    </Button>
                  </div>
                </div>
              ) : (
                <Button onClick={() => navigate('/dashboard/positions/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Position
                </Button>
              )}
            </div>
          ) : filteredPositions.length > 0 ? (
            <div className="space-y-4">
              {filteredPositions.map((position) => {
                const isOpen = openPositions.has(position.id);
                const hasGap = position.avg_match_score !== null && position.avg_match_score < 80;
                const gapSeverity = position.avg_match_score !== null
                  ? position.avg_match_score >= 80 ? 'good'
                    : position.avg_match_score >= 60 ? 'warning'
                    : 'critical'
                  : 'unknown';

                return (
                  <Collapsible
                    key={position.id}
                    open={isOpen}
                    onOpenChange={(open) => {
                      const newOpenPositions = new Set(openPositions);
                      if (open) {
                        newOpenPositions.add(position.id);
                      } else {
                        newOpenPositions.delete(position.id);
                      }
                      setOpenPositions(newOpenPositions);
                    }}
                  >
                    <div className="border rounded-lg overflow-hidden">
                      <CollapsibleTrigger className="w-full">
                        <div className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1.5">
                                <ChevronRight className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                                <h3 className="font-semibold text-base md:text-lg tracking-[-0.01em]">{position.position_title}</h3>
                                <Badge variant="outline" className="text-xs">{position.position_code}</Badge>
                                {position.department && (
                                  <Badge variant="secondary" className="text-xs">{position.department}</Badge>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm text-gray-700">
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-gray-400" />
                                  <span className="font-medium">{position.employee_count || 0}</span>
                                  <span className="text-gray-500">employees</span>
                                  {position.profiles_incomplete > 0 && (
                                    <Badge variant="outline" className="ml-1 text-xs border-orange-200 text-orange-700 bg-orange-50">
                                      {position.profiles_incomplete} pending
                                    </Badge>
                                  )}
                                </div>
                                {/* Removed avg match and skills gap from compact view */}
                                
                                {position.avg_match_score === null && position.employee_count > 0 && (
                                  <span className="text-sm text-gray-500 italic">No skills analysis yet</span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/dashboard/positions/${position.id}/edit`)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(position)}
                                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent>
                        <div className="px-4 pb-4 pt-0 border-t">
                          {position.description && (
                            <p className="text-gray-600 text-sm my-3">{position.description}</p>
                          )}
                          
                          <div className="space-y-3">
                            {/* Employee Profile Status */}
                            {position.employee_count > 0 && (
                              <div className="bg-gray-50 rounded-lg p-3">
                                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                  <UserCheck className="h-4 w-4" />
                                  Employee Profile Status
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                  <div>
                                    <span className="text-gray-500">Complete:</span>
                                    <span className="ml-2 font-medium text-green-600">{position.profiles_complete || 0}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Incomplete:</span>
                                    <span className="ml-2 font-medium text-orange-600">{position.profiles_incomplete || 0}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Invited:</span>
                                    <span className="ml-2 font-medium text-blue-600">{position.invitations_sent || 0}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Not Invited:</span>
                                    <span className="ml-2 font-medium text-red-600">{position.no_invitations || 0}</span>
                                  </div>
                                </div>
                                {position.no_invitations > 0 && (
                                  <div className="mt-2 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-2 rounded">
                                    <AlertCircle className="h-3 w-3" />
                                    <span>{position.no_invitations} employee{position.no_invitations !== 1 ? 's' : ''} need to be invited to complete their profile</span>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Required Skills ({position.required_skills.length})</h4>
                              <div className="flex flex-wrap gap-2">
                                {position.required_skills.map((skill, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {skill.skill_name}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            
                            {/* Removed detailed skills coverage to keep list focused on positions */}
                          </div>
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No positions found</h3>
              <p className="text-gray-500 mb-4">No positions match the selected filter</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Position Dialog */}
      <Dialog open={false} onOpenChange={() => {}}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Position</DialogTitle>
          </DialogHeader>
          <PositionCreateWizard
            onComplete={() => {
              navigate('/dashboard/positions');
            }}
            onCancel={() => {}}
          />
        </DialogContent>
      </Dialog>

    </div>
  );
}
