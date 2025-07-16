import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, CheckCircle, Upload, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { SkillsGapAnalysis } from '@/components/dashboard/EmployeeOnboarding/SkillsGapAnalysis';
import { useAuth } from '@/contexts/AuthContext';

export default function OnboardingAnalysis() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { stats, loading, employeeStatuses } = useOnboarding();

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Check if we have employees with CVs
  if (stats.withCV === 0 && stats.analyzed === 0) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard/onboarding')}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Overview
          </Button>
          <div className="h-5 w-px bg-gray-300" />
          <div>
            <h1 className="text-2xl font-bold">Skills Gap Analysis</h1>
            <p className="text-sm text-muted-foreground">
              Step 3 of 3 • Analyze skills and generate reports
            </p>
          </div>
        </div>

        <Alert>
          <Upload className="h-4 w-4" />
          <AlertDescription>
            You need employees to upload their CVs first before you can analyze skills gaps.
            <Button
              variant="link"
              className="p-0 h-auto ml-2"
              onClick={() => navigate('/dashboard/onboarding/invite')}
            >
              Send invitations now
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard/onboarding')}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Overview
          </Button>
          <div className="h-5 w-px bg-gray-300" />
          <div>
            <h1 className="text-2xl font-bold">Skills Gap Analysis</h1>
            <p className="text-sm text-muted-foreground">
              Step 3 of 3 • Review skills gaps and export reports
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="default">Step 3</Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard/course-generation')}
          >
            <Target className="h-4 w-4 mr-1" />
            Generate Courses
          </Button>
        </div>
      </div>

      {/* Progress Indicator */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <span className="font-medium text-green-600">Import</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <span className="font-medium text-green-600">Invite</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <span className="font-medium">Analysis</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium">{stats.total} employees</span>
              </div>
              <div className="flex items-center gap-1">
                <Upload className="h-4 w-4 text-blue-600" />
                <span className="font-medium">{stats.withCV} CVs uploaded</span>
              </div>
              <div className="flex items-center gap-1">
                <BarChart3 className="h-4 w-4 text-purple-600" />
                <span className="font-medium">{stats.analyzed} analyzed</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Skills Gap Analysis Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SkillsGapAnalysis
            companyId={userProfile?.company_id!}
            employeeStatuses={employeeStatuses}
          />
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <h3 className="text-lg font-semibold">Onboarding Complete!</h3>
            </div>
            <p className="text-muted-foreground">
              Your team has been successfully onboarded. You can now generate targeted training courses based on the skills gap analysis.
            </p>
            <div className="flex justify-center gap-3">
              <Button
                onClick={() => navigate('/dashboard/course-generation')}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                <Target className="h-4 w-4 mr-2" />
                Generate Training Courses
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard/employees')}
              >
                View All Employees
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <BarChart3 className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="space-y-2">
              <h3 className="font-medium text-blue-900">Understanding Your Skills Gap Report</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Red indicators show critical skill gaps that need immediate attention</li>
                <li>• Yellow indicators show moderate gaps that should be addressed</li>
                <li>• Green indicators show areas where your team is well-equipped</li>
                <li>• Use the export function to share reports with stakeholders</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-4">
        <Button
          variant="outline"
          onClick={() => navigate('/dashboard/onboarding/invite')}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Invitations
        </Button>
        
        <Button
          onClick={() => navigate('/dashboard/course-generation')}
          className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
        >
          <Target className="h-4 w-4 mr-2" />
          Generate Courses
        </Button>
      </div>
    </div>
  );
}