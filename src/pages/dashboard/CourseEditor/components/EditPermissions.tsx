import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Shield, 
  Users, 
  Search,
  AlertCircle,
  CheckCircle,
  Loader2,
  UserPlus,
  X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface EditPermission {
  id: string;
  user_id: string;
  can_edit_all_courses: boolean;
  specific_course_ids: string[];
  user_email?: string;
  user_name?: string;
}

interface EditPermissionsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  courseName: string;
  companyId: string;
}

const EditPermissions: React.FC<EditPermissionsProps> = ({
  open,
  onOpenChange,
  courseId,
  courseName,
  companyId
}) => {
  const { userProfile } = useAuth();
  const [permissions, setPermissions] = useState<EditPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');

  // Load existing permissions
  useEffect(() => {
    const loadPermissions = async () => {
      if (!open || !companyId) return;
      
      setLoading(true);
      try {
        // Get existing permissions
        const { data: perms, error: permsError } = await supabase
          .from('course_edit_permissions')
          .select(`
            *,
            user:users!course_edit_permissions_user_id_fkey(
              id,
              email,
              full_name
            )
          `)
          .eq('company_id', companyId);
          
        if (permsError) throw permsError;
        
        const formattedPerms = (perms || []).map(p => ({
          id: p.id,
          user_id: p.user_id,
          can_edit_all_courses: p.can_edit_all_courses,
          specific_course_ids: p.specific_course_ids || [],
          user_email: p.user?.email,
          user_name: p.user?.full_name
        }));
        
        setPermissions(formattedPerms);
        
        // Get available users (company admins and managers)
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('id, email, full_name')
          .eq('company_id', companyId)
          .in('role', ['company_admin', 'company_manager'])
          .not('id', 'in', `(${formattedPerms.map(p => p.user_id).join(',')})`);
          
        if (!usersError) {
          setAvailableUsers(users || []);
        }
        
      } catch (err) {
        console.error('Error loading permissions:', err);
        toast.error('Failed to load edit permissions');
      } finally {
        setLoading(false);
      }
    };
    
    loadPermissions();
  }, [open, companyId]);

  const toggleCoursePermission = (permissionId: string, hasAccess: boolean) => {
    setPermissions(prev => prev.map(p => {
      if (p.id === permissionId) {
        if (hasAccess) {
          // Remove course from specific_course_ids
          return {
            ...p,
            specific_course_ids: p.specific_course_ids.filter(id => id !== courseId)
          };
        } else {
          // Add course to specific_course_ids
          return {
            ...p,
            specific_course_ids: [...p.specific_course_ids, courseId]
          };
        }
      }
      return p;
    }));
  };

  const toggleAllCoursesPermission = (permissionId: string, value: boolean) => {
    setPermissions(prev => prev.map(p => 
      p.id === permissionId ? { ...p, can_edit_all_courses: value } : p
    ));
  };

  const addNewEditor = async () => {
    if (!selectedUserId) return;
    
    const user = availableUsers.find(u => u.id === selectedUserId);
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('course_edit_permissions')
        .insert({
          company_id: companyId,
          user_id: selectedUserId,
          can_edit_all_courses: false,
          specific_course_ids: [courseId],
          created_by: userProfile?.id
        })
        .select()
        .single();
        
      if (error) throw error;
      
      setPermissions(prev => [...prev, {
        id: data.id,
        user_id: data.user_id,
        can_edit_all_courses: false,
        specific_course_ids: [courseId],
        user_email: user.email,
        user_name: user.full_name
      }]);
      
      setAvailableUsers(prev => prev.filter(u => u.id !== selectedUserId));
      setSelectedUserId('');
      
      toast.success('Editor added successfully');
    } catch (err) {
      console.error('Error adding editor:', err);
      toast.error('Failed to add editor');
    }
  };

  const removeEditor = async (permissionId: string) => {
    try {
      const { error } = await supabase
        .from('course_edit_permissions')
        .delete()
        .eq('id', permissionId);
        
      if (error) throw error;
      
      const removedPerm = permissions.find(p => p.id === permissionId);
      if (removedPerm) {
        const user = {
          id: removedPerm.user_id,
          email: removedPerm.user_email,
          full_name: removedPerm.user_name
        };
        setAvailableUsers(prev => [...prev, user]);
      }
      
      setPermissions(prev => prev.filter(p => p.id !== permissionId));
      toast.success('Editor removed successfully');
    } catch (err) {
      console.error('Error removing editor:', err);
      toast.error('Failed to remove editor');
    }
  };

  const savePermissions = async () => {
    setSaving(true);
    try {
      // Update all permissions
      for (const perm of permissions) {
        const { error } = await supabase
          .from('course_edit_permissions')
          .update({
            can_edit_all_courses: perm.can_edit_all_courses,
            specific_course_ids: perm.specific_course_ids
          })
          .eq('id', perm.id);
          
        if (error) throw error;
      }
      
      toast.success('Permissions saved successfully');
      onOpenChange(false);
    } catch (err) {
      console.error('Error saving permissions:', err);
      toast.error('Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  const filteredPermissions = permissions.filter(p => 
    p.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.user_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-future-green" />
            Manage Course Edit Permissions
          </DialogTitle>
          <DialogDescription>
            Control who can edit <strong>{courseName}</strong>
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-future-green" />
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* Add New Editor */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Add Editor</label>
              <div className="flex gap-2">
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md"
                >
                  <option value="">Select a user...</option>
                  {availableUsers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.full_name || user.email}
                    </option>
                  ))}
                </select>
                <Button
                  onClick={addNewEditor}
                  disabled={!selectedUserId}
                  size="sm"
                >
                  <UserPlus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search editors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Permissions List */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {filteredPermissions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No editors found
                </div>
              ) : (
                filteredPermissions.map(perm => {
                  const hasAccessToThisCourse = perm.can_edit_all_courses || 
                    perm.specific_course_ids.includes(courseId);
                  
                  return (
                    <div
                      key={perm.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card"
                    >
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">{perm.user_name || perm.user_email}</p>
                          <p className="text-sm text-muted-foreground">{perm.user_email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {perm.can_edit_all_courses && (
                          <Badge variant="secondary" className="text-xs">
                            All Courses
                          </Badge>
                        )}
                        
                        <Switch
                          checked={hasAccessToThisCourse}
                          onCheckedChange={() => toggleCoursePermission(perm.id, hasAccessToThisCourse)}
                          disabled={perm.can_edit_all_courses}
                        />
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeEditor(perm.id)}
                          className="h-8 w-8"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Info Alert */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <div className="text-sm">
                <strong>Note:</strong> Only company admins and managers can be given edit permissions. 
                Users with "All Courses" permission can edit any course in the company.
              </div>
            </Alert>
          </div>
        )}
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={savePermissions}
            disabled={saving || loading}
            className="flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Save Permissions
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditPermissions;