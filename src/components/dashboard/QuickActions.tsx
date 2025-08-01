import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Send, BarChart3, BookOpen, Users, FileSpreadsheet } from 'lucide-react';

interface QuickActionsProps {
  context?: 'employees' | 'onboarding';
}

export function QuickActions({ context = 'employees' }: QuickActionsProps) {
  const navigate = useNavigate();

  const actions = [
    {
      icon: Upload,
      label: 'Import Employees',
      description: 'Add team members via CSV',
      onClick: () => {
        if (context === 'employees') {
          // Switch to import tab
          const importTab = document.querySelector('[data-tab="import"]') as HTMLElement;
          if (importTab) importTab.click();
        } else {
          navigate('/dashboard/onboarding/import');
        }
      },
      color: 'bg-blue-50 text-blue-600'
    },
    {
      icon: Send,
      label: 'Send Invitations',
      description: 'Invite employees to complete profiles',
      onClick: () => {
        if (context === 'employees') {
          // Switch to invitations tab
          const invitationsTab = document.querySelector('[data-tab="invitations"]') as HTMLElement;
          if (invitationsTab) invitationsTab.click();
        } else {
          navigate('/dashboard/onboarding/invite');
        }
      },
      color: 'bg-green-50 text-green-600'
    },
    {
      icon: BarChart3,
      label: 'View Analysis',
      description: 'See skills gap insights',
      onClick: () => {
        if (context === 'employees') {
          // Switch to analysis tab
          const analysisTab = document.querySelector('[data-tab="analysis"]') as HTMLElement;
          if (analysisTab) analysisTab.click();
        } else {
          navigate('/dashboard/onboarding/analysis');
        }
      },
      color: 'bg-purple-50 text-purple-600'
    },
    {
      icon: BookOpen,
      label: 'Generate Courses',
      description: 'Create personalized training',
      onClick: () => navigate('/dashboard/course-generation'),
      color: 'bg-orange-50 text-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action, index) => (
        <Card
          key={index}
          className="p-4 hover:shadow-lg transition-shadow cursor-pointer group"
          onClick={action.onClick}
        >
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${action.color} group-hover:scale-110 transition-transform`}>
              <action.icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm text-gray-900">{action.label}</h4>
              <p className="text-xs text-gray-500 mt-0.5">{action.description}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}