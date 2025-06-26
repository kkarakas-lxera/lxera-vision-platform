import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  BookOpen, 
  Edit, 
  Download, 
  Mail,
  History,
  UserCog
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

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={handleUpdateCV}
          >
            <FileText className="h-4 w-4 mr-2" />
            Update CV
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={handleAssignCourse}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Assign Course
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={handleChangePosition}
          >
            <UserCog className="h-4 w-4 mr-2" />
            Change Position
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={handleExportProfile}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Profile
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={handleSendMessage}
          >
            <Mail className="h-4 w-4 mr-2" />
            Send Message
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={handleViewHistory}
          >
            <History className="h-4 w-4 mr-2" />
            View History
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}