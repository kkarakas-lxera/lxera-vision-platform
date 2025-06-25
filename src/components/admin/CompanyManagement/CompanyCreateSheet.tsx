import React, { useState } from 'react';
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
import { Loader2, Building2 } from 'lucide-react';

interface CompanyCreateSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompanyCreated: () => void;
}

export function CompanyCreateSheet({ open, onOpenChange, onCompanyCreated }: CompanyCreateSheetProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    logo_url: '',
    plan_type: 'trial',
    max_employees: 10,
    max_courses: 5,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      domain: '',
      logo_url: '',
      plan_type: 'trial',
      max_employees: 10,
      max_courses: 5,
    });
  };

  const handleCreate = async () => {
    // Validation
    if (!formData.name || !formData.domain) {
      toast({
        title: 'Validation Error',
        description: 'Company name and domain are required',
        variant: 'destructive',
      });
      return;
    }

    // Domain format validation
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(formData.domain)) {
      toast({
        title: 'Invalid Domain',
        description: 'Please enter a valid domain (e.g., example.com)',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    try {
      // Check if domain already exists
      const { data: existingCompany } = await supabase
        .from('companies')
        .select('id')
        .eq('domain', formData.domain)
        .single();

      if (existingCompany) {
        toast({
          title: 'Domain Already Exists',
          description: 'A company with this domain already exists',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Create the company
      const { error } = await supabase
        .from('companies')
        .insert({
          name: formData.name,
          domain: formData.domain.toLowerCase(),
          logo_url: formData.logo_url || null,
          plan_type: formData.plan_type,
          max_employees: formData.max_employees,
          max_courses: formData.max_courses,
          is_active: true,
          settings: {}
        });

      if (error) throw error;

      toast({
        title: 'Company Created',
        description: `${formData.name} has been successfully created`,
      });
      
      resetForm();
      onCompanyCreated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating company:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create company',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Create New Company
          </SheetTitle>
          <SheetDescription>
            Add a new company to the platform. Set their subscription limits and details.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-4">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">
                Company Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Acme Corporation"
                className="text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="domain" className="text-foreground">
                Domain <span className="text-red-500">*</span>
              </Label>
              <Input
                id="domain"
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                placeholder="acme.com"
                className="text-foreground"
              />
              <p className="text-xs text-muted-foreground">
                Enter the company's primary domain (e.g., example.com)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo_url" className="text-foreground">
                Logo URL
              </Label>
              <Input
                id="logo_url"
                value={formData.logo_url}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                placeholder="https://example.com/logo.png"
                className="text-foreground"
              />
            </div>
          </div>

          {/* Subscription Settings */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">Subscription Settings</h4>
            
            <div className="space-y-2">
              <Label htmlFor="plan_type" className="text-foreground">
                Plan Type
              </Label>
              <Select value={formData.plan_type} onValueChange={(value) => setFormData({ ...formData, plan_type: value })}>
                <SelectTrigger id="plan_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trial">Trial (30 days)</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="max_employees" className="text-foreground">
                  Max Employees
                </Label>
                <Input
                  id="max_employees"
                  type="number"
                  min="1"
                  value={formData.max_employees}
                  onChange={(e) => setFormData({ ...formData, max_employees: parseInt(e.target.value) || 1 })}
                  className="text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_courses" className="text-foreground">
                  Max Courses
                </Label>
                <Input
                  id="max_courses"
                  type="number"
                  min="1"
                  value={formData.max_courses}
                  onChange={(e) => setFormData({ ...formData, max_courses: parseInt(e.target.value) || 1 })}
                  className="text-foreground"
                />
              </div>
            </div>

            <div className="rounded-lg bg-muted p-3">
              <p className="text-sm text-muted-foreground">
                Based on the selected plan:
              </p>
              <ul className="mt-2 text-sm space-y-1">
                <li>• Company can have up to <span className="font-medium">{formData.max_employees}</span> employees</li>
                <li>• Company can create up to <span className="font-medium">{formData.max_courses}</span> courses</li>
                <li>• Company will start with <span className="font-medium">{formData.plan_type}</span> plan features</li>
              </ul>
            </div>
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
            Create Company
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}