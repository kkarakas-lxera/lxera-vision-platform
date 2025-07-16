import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Send, Mail, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { InviteEmployees } from '@/components/dashboard/EmployeeOnboarding/InviteEmployees';

export default function OnboardingInvite() {
  const navigate = useNavigate();
  const { stats, loading, refreshData } = useOnboarding();

  const handleInvitationsSent = async () => {
    await refreshData();
    
    // Auto-navigate to analysis step if we have CVs
    if (stats.withCV > 0 || stats.analyzed > 0) {
      setTimeout(() => {
        navigate('/dashboard/onboarding/analysis');
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

  // Check if we have employees to invite
  if (stats.total === 0) {
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
            <h1 className="text-2xl font-bold">Invite Employees</h1>
            <p className="text-sm text-muted-foreground">
              Step 2 of 3 • Send invitations to employees
            </p>
          </div>
        </div>

        <Alert>
          <Mail className="h-4 w-4" />
          <AlertDescription>
            You need to import employees first before you can send invitations.
            <Button
              variant="link"
              className="p-0 h-auto ml-2"
              onClick={() => navigate('/dashboard/onboarding/import')}
            >
              Import employees now
            </Button>
          </AlertDescription>
        </Alert>
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
            <h1 className="text-2xl font-bold">Invite Employees</h1>
            <p className="text-sm text-muted-foreground">
              Step 2 of 3 • Send invitations for profile completion
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="default">Step 2</Badge>
          {(stats.withCV > 0 || stats.analyzed > 0) && (
            <Button
              size="sm"
              onClick={() => navigate('/dashboard/onboarding/analysis')}
            >
              Next: Skills Analysis
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
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <span className="font-medium text-green-600">Import</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <span className="font-medium">Invite</span>
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

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium">{stats.total} employees</span>
              </div>
              {stats.completed > 0 && (
                <div className="flex items-center gap-1">
                  <Send className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">{stats.completed} completed</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Profile Invitations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <InviteEmployees onInvitationsSent={handleInvitationsSent} />
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="space-y-2">
              <h3 className="font-medium text-blue-900">How Employee Invitations Work</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Employees receive a personalized email with a secure link</li>
                <li>• They can complete their profile and upload their CV</li>
                <li>• Progress updates automatically as employees respond</li>
                <li>• Reminder emails are sent to pending invitations</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-4">
        <Button
          variant="outline"
          onClick={() => navigate('/dashboard/onboarding/import')}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Import
        </Button>
        
        {(stats.withCV > 0 || stats.analyzed > 0) && (
          <Button
            onClick={() => navigate('/dashboard/onboarding/analysis')}
          >
            Continue to Analysis
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}