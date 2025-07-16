import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Users, FileText, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { InlineAddEmployees } from '@/components/dashboard/EmployeeOnboarding/InlineAddEmployees';
import { OnboardingProgress } from '@/components/dashboard/EmployeeOnboarding/OnboardingProgress';

export default function OnboardingImport() {
  const navigate = useNavigate();
  const { importSessions, stats, loading, refreshData } = useOnboarding();

  const handleSessionCreated = async () => {
    await refreshData();
    
    // Auto-navigate to invite step if we have employees
    if (stats.total > 0) {
      setTimeout(() => {
        navigate('/dashboard/onboarding/invite');
      }, 1000);
    }
  };

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

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
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
            <h1 className="text-2xl font-bold">Import Team Members</h1>
            <p className="text-sm text-muted-foreground">
              Step 1 of 3 • Upload employee data to get started
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="default">Step 1</Badge>
          {stats.total > 0 && (
            <Button
              size="sm"
              onClick={() => navigate('/dashboard/onboarding/invite')}
            >
              Next: Invite Employees
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>

      {/* Progress Indicator */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <span className="font-medium">Import</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  stats.total > 0 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  2
                </div>
                <span className={stats.total > 0 ? 'text-blue-700' : 'text-gray-500'}>
                  Invite
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  stats.withCV > 0 || stats.analyzed > 0
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  3
                </div>
                <span className={stats.withCV > 0 || stats.analyzed > 0 ? 'text-blue-700' : 'text-gray-500'}>
                  Analysis
                </span>
              </div>
            </div>

            {stats.total > 0 && (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">
                  {stats.total} employees imported
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Add Your Team Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <InlineAddEmployees
            onSessionCreated={handleSessionCreated}
            existingSessions={importSessions}
          />
        </CardContent>
      </Card>

      {/* Import Progress */}
      {importSessions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Recent Import Sessions</h3>
          <div className="grid gap-4">
            {importSessions.slice(0, 3).map((session) => (
              <Card key={session.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">{session.total_employees} employees</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(session.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={session.status === 'completed' ? 'default' : 'secondary'}>
                      {session.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center pt-4">
        <Button
          variant="outline"
          onClick={() => navigate('/dashboard/onboarding')}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Overview
        </Button>
        
        {stats.total > 0 && (
          <Button
            onClick={() => navigate('/dashboard/onboarding/invite')}
          >
            Continue to Invitations
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}