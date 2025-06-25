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
import { AlertTriangle, Loader2 } from 'lucide-react';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  company_id?: string;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
  position?: string;
  department?: string;
  last_login?: string;
}

interface Company {
  id: string;
  name: string;
}

interface UserEditSheetProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdated: () => void;
}

export function UserEditSheet({ user, open, onOpenChange, onUserUpdated }: UserEditSheetProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [formData, setFormData] = useState({
    full_name: '',
    role: '',
    company_id: '',
    position: '',
    department: '',
    is_active: true,
    email_verified: true,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name,
        role: user.role,
        company_id: user.company_id || '',
        position: user.position || '',
        department: user.department || '',
        is_active: user.is_active,
        email_verified: user.email_verified,
      });
    }
    fetchCompanies();
  }, [user]);

  const fetchCompanies = async () => {
    const { data } = await supabase.from('companies').select('id, name').order('name');
    if (data) setCompanies(data);
  };

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: formData.full_name,
          role: formData.role,
          company_id: formData.company_id || null,
          position: formData.position,
          department: formData.department,
          is_active: formData.is_active,
          email_verified: formData.email_verified,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'User updated',
        description: 'User details have been successfully updated.',
      });
      
      onUserUpdated();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email);
      if (error) throw error;

      toast({
        title: 'Password reset email sent',
        description: `A password reset link has been sent to ${user.email}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Edit User</SheetTitle>
          <SheetDescription>
            Update user information and manage access
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-4">
          {/* User Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user.email} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="company_admin">Company Admin</SelectItem>
                  <SelectItem value="learner">Learner</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Select value={formData.company_id} onValueChange={(value) => setFormData({ ...formData, company_id: value })}>
                <SelectTrigger id="company">
                  <SelectValue placeholder="Select a company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Company</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="e.g. Software Engineer"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="e.g. Engineering"
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
                  User can access the platform
                </div>
              </div>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Verified</Label>
                <div className="text-sm text-muted-foreground">
                  User has verified their email
                </div>
              </div>
              <Switch
                checked={formData.email_verified}
                onCheckedChange={(checked) => setFormData({ ...formData, email_verified: checked })}
              />
            </div>
          </div>

          <Separator />

          {/* Metadata */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">User Information</h4>
            <div className="text-sm space-y-1 text-muted-foreground">
              <p>Created: {new Date(user.created_at).toLocaleDateString()}</p>
              {user.last_login && <p>Last Login: {new Date(user.last_login).toLocaleDateString()}</p>}
              <p>User ID: {user.id}</p>
            </div>
          </div>

          <Separator />

          {/* Danger Zone */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Danger Zone
            </h4>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleResetPassword}
              disabled={loading}
            >
              Send Password Reset Email
            </Button>
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