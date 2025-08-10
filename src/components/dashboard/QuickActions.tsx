import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Send, BarChart3, BookOpen, Plus, MoreVertical, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface QuickActionsProps {
  context?: 'employees' | 'onboarding';
  className?: string;
}

export function QuickActions({ context = 'employees', className = '' }: QuickActionsProps) {
  const navigate = useNavigate();

  const primaryAction = {
    icon: Plus,
    label: 'Import Employees',
    onClick: () => {
      if (context === 'employees') {
        // Switch to import tab
        const importTab = document.querySelector('[data-tab="import"]') as HTMLElement;
        if (importTab) importTab.click();
      } else {
        navigate('/dashboard/employees?tab=import');
      }
    }
  };

  const secondaryActions = [
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
          navigate('/dashboard/employees?tab=invitations');
        }
      }
    },
    {
      icon: BarChart3,
      label: 'View Analysis',
      description: 'Review skills gap insights',
      onClick: () => {
        if (context === 'employees') {
          // Switch to analysis tab
          const analysisTab = document.querySelector('[data-tab="analysis"]') as HTMLElement;
          if (analysisTab) analysisTab.click();
        } else {
          navigate('/dashboard/employees?tab=analysis');
        }
      }
    },
    {
      icon: BookOpen,
      label: 'Generate Courses',
      description: 'Create personalized training',
      onClick: () => navigate('/dashboard/courses')
    }
  ];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Primary CTA */}
      <Button 
        onClick={primaryAction.onClick}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        <primaryAction.icon className="h-4 w-4 mr-2" />
        {primaryAction.label}
      </Button>

      {/* Secondary Actions Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="px-3">
            <span className="hidden sm:inline mr-2">More Actions</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {secondaryActions.map((action, index) => (
            <DropdownMenuItem
              key={index}
              onClick={action.onClick}
              className="cursor-pointer"
            >
              <action.icon className="h-4 w-4 mr-3 text-gray-500" />
              <div className="flex-1">
                <div className="font-medium text-sm">{action.label}</div>
                <div className="text-xs text-gray-500">{action.description}</div>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}