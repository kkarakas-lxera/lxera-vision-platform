import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Send, BarChart3, BookOpen, Plus } from 'lucide-react';

interface QuickActionsProps {
  context?: 'employees' | 'onboarding';
  className?: string;
}

export function QuickActions({ context = 'employees', className = '' }: QuickActionsProps) {
  const navigate = useNavigate();

  const actions = [
    {
      icon: Plus,
      label: 'Import',
      mobileLabel: 'Import',
      onClick: () => {
        if (context === 'employees') {
          // Switch to import tab
          const importTab = document.querySelector('[data-tab="import"]') as HTMLElement;
          if (importTab) importTab.click();
        } else {
          navigate('/dashboard/onboarding/import');
        }
      },
      color: 'text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-200'
    },
    {
      icon: Send,
      label: 'Send Invitations',
      mobileLabel: 'Invite',
      onClick: () => {
        if (context === 'employees') {
          // Switch to invitations tab
          const invitationsTab = document.querySelector('[data-tab="invitations"]') as HTMLElement;
          if (invitationsTab) invitationsTab.click();
        } else {
          navigate('/dashboard/onboarding/invite');
        }
      },
      color: 'text-green-600 bg-green-50 hover:bg-green-100 border-green-200'
    },
    {
      icon: BarChart3,
      label: 'View Analysis',
      mobileLabel: 'Analyze',
      onClick: () => {
        if (context === 'employees') {
          // Switch to analysis tab
          const analysisTab = document.querySelector('[data-tab="analysis"]') as HTMLElement;
          if (analysisTab) analysisTab.click();
        } else {
          navigate('/dashboard/onboarding/analysis');
        }
      },
      color: 'text-purple-600 bg-purple-50 hover:bg-purple-100 border-purple-200'
    },
    {
      icon: BookOpen,
      label: 'Generate Courses',
      mobileLabel: 'Courses',
      onClick: () => navigate('/dashboard/course-generation'),
      color: 'text-orange-600 bg-orange-50 hover:bg-orange-100 border-orange-200'
    }
  ];

  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-lg p-3 ${className}`}>
      <div className="flex flex-wrap gap-2">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium
              transition-all duration-200 border
              ${action.color}
              hover:shadow-sm active:scale-95
            `}
          >
            <action.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{action.label}</span>
            <span className="sm:hidden">{action.mobileLabel}</span>
          </button>
        ))}
      </div>
    </div>
  );
}