import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import FormProfileBuilder from '@/components/learner/FormProfileBuilder';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, User, Mail, Building2, Briefcase, Calendar, Target, CheckCircle, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function LearnerProfile() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const profileCompletion = useProfileCompletion();
  const [employeeData, setEmployeeData] = useState<any>(null);
  const [profileSections, setProfileSections] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (userProfile?.employee?.id) {
      fetchEmployeeData();
    }
  }, [userProfile]);

  const fetchEmployeeData = async () => {
    if (!userProfile?.employee?.id) return;

    try {
      // Fetch full employee data including profile sections
      const { data: employee, error } = await supabase
        .from('employees')
        .select(`
          *,
          st_company_positions!employees_current_position_id_fkey (
            position_title,
            department
          )
        `)
        .eq('id', userProfile.employee.id)
        .single();

      if (error) throw error;
      setEmployeeData(employee);

      // Fetch profile sections data
      const { data: sections, error: sectionsError } = await supabase
        .from('employee_profile_sections')
        .select('*')
        .eq('employee_id', userProfile.employee.id)
        .single();

      if (!sectionsError && sections) {
        setProfileSections(sections);
      }
    } catch (error) {
      console.error('Error fetching employee data:', error);
    }
  };

  const handleProfileComplete = () => {
    // Refresh auth context to update profile status
    window.location.reload();
  };

  if (profileCompletion.isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If no employee record exists, show a message
  if (!profileCompletion.employeeId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Profile Setup Required</CardTitle>
            <CardDescription>
              Your employee profile has not been created yet. Please contact your administrator to set up your profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              If you believe this is an error, please reach out to your HR department or system administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if profile is already complete
  const isProfileComplete = userProfile?.employee?.profile_complete && userProfile?.employee?.skills_validation_completed;

  // If profile is not complete or in edit mode, show the builder
  if (!isProfileComplete || isEditMode) {
    return (
      <FormProfileBuilder
        employeeId={profileCompletion.employeeId}
        onComplete={handleProfileComplete}
      />
    );
  }

  // Show completed profile view
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground mt-2">View and manage your professional profile</p>
        </div>
        <Button onClick={() => setIsEditMode(true)} variant="outline">
          <Edit className="mr-2 h-4 w-4" />
          Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Information Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Full Name</p>
              <p className="font-medium">{userProfile?.full_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {userProfile?.email}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Company</p>
              <p className="font-medium flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                {userProfile?.companies?.name || 'Not specified'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Position</p>
              <p className="font-medium flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                {employeeData?.st_company_positions?.position_title || employeeData?.position || 'Not specified'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Department</p>
              <p className="font-medium">
                {employeeData?.st_company_positions?.department || employeeData?.department || 'Not specified'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Profile Completion Status */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Profile Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Profile Complete</span>
                <Badge variant="success">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Completed
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Skills Validation</span>
                <Badge variant="success">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Validated
                </Badge>
              </div>
              {employeeData?.profile_completion_date && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Completed On</span>
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(employeeData.profile_completion_date).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {/* Profile Sections Summary */}
            {profileSections && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold mb-4">Profile Sections</h3>
                <div className="space-y-3">
                  {profileSections.work_experience && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Work Experience Added</span>
                    </div>
                  )}
                  {profileSections.education && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Education Added</span>
                    </div>
                  )}
                  {profileSections.skills && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Skills Validated</span>
                    </div>
                  )}
                  {profileSections.current_projects && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Current Projects Added</span>
                    </div>
                  )}
                  {profileSections.challenges && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Professional Challenges Identified</span>
                    </div>
                  )}
                  {profileSections.growth_areas && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Growth Opportunities Set</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={() => navigate('/learner/courses')}>
                  <Briefcase className="mr-2 h-4 w-4" />
                  My Courses
                </Button>
                <Button variant="outline" onClick={() => navigate('/learner')}>
                  <Target className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}