import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  BookOpen, 
  Edit, 
  Download, 
  Mail,
  History,
  UserCog,
  ChevronUp,
  ChevronDown,
  User,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

interface ActionsBarProps {
  employee: {
    id: string;
    full_name: string;
    email: string;
    cv_file_path?: string;
  };
}

export function ActionsBar({ employee }: ActionsBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleUpdateCV = () => {
    toast.info('CV update feature coming soon');
  };

  const handleAssignCourse = () => {
    toast.info('Course assignment feature coming soon');
  };

  const handleChangePosition = () => {
    toast.info('Position change feature coming soon');
  };

  const handleExportProfile = () => {
    toast.info('Profile export feature coming soon');
  };

  const handleSendMessage = () => {
    window.location.href = `mailto:${employee.email}`;
  };

  const handleViewHistory = () => {
    toast.info('History view feature coming soon');
  };

  const quickActions = [
    { icon: FileText, label: 'Update CV', onClick: handleUpdateCV, primary: true },
    { icon: BookOpen, label: 'Assign Course', onClick: handleAssignCourse, primary: true },
    { icon: Mail, label: 'Send Message', onClick: handleSendMessage, primary: false }
  ];

  const allActions = [
    { icon: FileText, label: 'Update CV', onClick: handleUpdateCV },
    { icon: BookOpen, label: 'Assign Course', onClick: handleAssignCourse },
    { icon: UserCog, label: 'Change Position', onClick: handleChangePosition },
    { icon: Download, label: 'Export Profile', onClick: handleExportProfile },
    { icon: Mail, label: 'Send Message', onClick: handleSendMessage },
    { icon: History, label: 'View History', onClick: handleViewHistory }
  ];

  return (
    <div className="sticky top-4 z-50 mb-6">
      <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-md">
        <CardContent className="p-4">
          {/* Collapsed View */}
          {!isExpanded && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-sm">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm">{employee.full_name}</h3>
                  <p className="text-xs text-slate-600">Quick Actions</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Quick Action Buttons */}
                {quickActions.map((action, idx) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={idx}
                      size="sm"
                      variant={action.primary ? "default" : "outline"}
                      className={`h-8 px-3 ${action.primary ? 'bg-gradient-to-r from-blue-500 to-purple-600 border-0' : ''}`}
                      onClick={action.onClick}
                    >
                      <Icon className="h-3 w-3" />
                      <span className="ml-1.5 text-xs font-medium hidden sm:inline">{action.label}</span>
                    </Button>
                  );
                })}
                
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={() => setIsExpanded(true)}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Expanded View */}
          {isExpanded && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-sm">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{employee.full_name}</h3>
                    <p className="text-sm text-slate-600">Employee Actions</p>
                  </div>
                </div>
                
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={() => setIsExpanded(false)}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                {allActions.map((action, idx) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start h-9 text-xs font-medium hover:shadow-md transition-all duration-200"
                      onClick={action.onClick}
                    >
                      <Icon className="h-3 w-3 mr-2" />
                      {action.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}