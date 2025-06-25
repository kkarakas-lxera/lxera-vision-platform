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
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, UserPlus, Mail } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Company {
  id: string;
  name: string;
}

interface UserCreateSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserCreated: () => void;
  preSelectedCompanyId?: string | null;
}

export function UserCreateSheet({ 
  open, 
  onOpenChange, 
  onUserCreated,
  preSelectedCompanyId 
}: UserCreateSheetProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    role: 'learner',
    company_id: preSelectedCompanyId || '',
    department: '',
    position: '',
    send_welcome_email: true,
  });

  useEffect(() => {
    if (open) {
      fetchCompanies();
      // Update company_id if preSelectedCompanyId changes
      if (preSelectedCompanyId) {
        setFormData(prev => ({ ...prev, company_id: preSelectedCompanyId }));
      }
    }
  }, [open, preSelectedCompanyId]);

  const fetchCompanies = async () => {
    try {
      const { data } = await supabase
        .from('companies')
        .select('id, name')
        .eq('is_active', true)
        .order('name');
      
      if (data) setCompanies(data);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      full_name: '',
      role: 'learner',
      company_id: preSelectedCompanyId || '',
      department: '',
      position: '',
      send_welcome_email: true,
    });
  };

  const generateTempPassword = () => {
    // Generate a secure temporary password
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleCreate = async () => {
    // Validation
    if (!formData.email || !formData.full_name || !formData.company_id) {
      toast({
        title: 'Validation Error',
        description: 'Email, full name, and company are required',
        variant: 'destructive',
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', formData.email.toLowerCase())
        .single();

      if (existingUser) {
        toast({
          title: 'User Already Exists',
          description: 'A user with this email already exists',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Generate temporary password
      const tempPassword = generateTempPassword();

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.toLowerCase(),
        password: tempPassword,
        options: {
          data: {
            full_name: formData.full_name,
          },
          emailRedirectTo: `${window.location.origin}/login`,
        }
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Failed to create user');
      }

      // Update the user record in the public.users table (created by trigger)
      const { error: updateError } = await supabase
        .from('users')
        .update({
          full_name: formData.full_name,
          role: formData.role,
          company_id: formData.company_id,
          department: formData.department || null,
          position: formData.position || null,
          is_active: true,
          email_verified: false,
        })
        .eq('id', authData.user.id);

      if (updateError) throw updateError;

      // If role is learner, create employee record
      if (formData.role === 'learner') {
        const { error: employeeError } = await supabase
          .from('employees')
          .insert({
            user_id: authData.user.id,
            company_id: formData.company_id,
            department: formData.department || null,
            position: formData.position || null,
            employee_role: formData.position || 'Employee',
            skill_level: 'beginner',
            is_active: true,
          });

        if (employeeError) {
          console.error('Error creating employee record:', employeeError);
        }
      }

      // Send password reset email for user to set their own password
      if (formData.send_welcome_email) {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(
          formData.email.toLowerCase(),
          {
            redirectTo: `${window.location.origin}/auth/reset-password`,
          }
        );

        if (resetError) {
          console.error('Error sending password reset email:', resetError);
        }
      }

      toast({
        title: 'User Created Successfully',
        description: formData.send_welcome_email 
          ? `User created. A password setup email has been sent to ${formData.email}`
          : `User created successfully`,
      });
      
      resetForm();
      onUserCreated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create user',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Create New User
          </SheetTitle>
          <SheetDescription>
            Add a new user to the platform. They will receive an email to set up their password.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-4">
          {/* Company Selection */}
          {preSelectedCompanyId ? (
            <Alert>
              <AlertDescription>
                Creating user for: <span className="font-medium">
                  {companies.find(c => c.id === preSelectedCompanyId)?.name || 'Selected Company'}
                </span>
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="company" className="text-foreground">
                Company <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={formData.company_id} 
                onValueChange={(value) => setFormData({ ...formData, company_id: value })}
              >
                <SelectTrigger id="company">
                  <SelectValue placeholder="Select a company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* User Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="user@example.com"
                className="text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-foreground">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="John Doe"
                className="text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-foreground">
                Role
              </Label>
              <Select 
                value={formData.role} 
                onValueChange={(value) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="company_admin">Company Admin</SelectItem>
                  <SelectItem value="learner">Learner</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Company admins can manage users and courses for their company
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department" className="text-foreground">
                  Department
                </Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="e.g. Engineering"
                  className="text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="position" className="text-foreground">
                  Position
                </Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="e.g. Software Engineer"
                  className="text-foreground"
                />
              </div>
            </div>
          </div>

          {/* Email Settings */}
          <div className="rounded-lg bg-muted p-3">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">Welcome Email</p>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              The user will receive an email with instructions to set up their password.
            </p>
          </div>
        </div>

        <SheetFooter>
          <Button 
            variant="outline" 
            onClick={() => {
              resetForm();
              onOpenChange(false);
            }} 
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create User
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}