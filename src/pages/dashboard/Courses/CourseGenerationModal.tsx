
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, FileText, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/hooks/useUser';
import { useEmployee } from '@/hooks/useEmployee';
import { generateCourse, CourseGenerationParams } from '@/services/courseGenerationService';
import { useFileUpload } from '@/hooks/useFileUpload';
import CourseGenerationTracker from '@/components/CourseGenerationTracker';

export interface CourseGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  preSelectedEmployees?: string[];
}

const CourseGenerationModal: React.FC<CourseGenerationModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  preSelectedEmployees = []
}) => {
  const { toast } = useToast();
  const { userProfile } = useAuth();
  const { user } = useUser();
  const { employee } = useEmployee();
  const { uploadFile, uploading } = useFileUpload();
  
  const [step, setStep] = useState<'setup' | 'generating' | 'completed'>('setup');
  const [jobId, setJobId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Get company_id from userProfile, with fallback to user
  const getCompanyId = () => {
    if (userProfile && 'company_id' in userProfile) {
      return userProfile.company_id;
    }
    if (user && 'company_id' in user) {
      return user.company_id;
    }
    return null;
  };

  const handleGenerateCourse = async () => {
    const companyId = getCompanyId();
    
    if (!companyId || !employee?.id) {
      toast({
        title: "Error",
        description: "Missing required information. Please refresh and try again.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      const params: CourseGenerationParams = {
        courseTitle: "Personalized Learning Course",
        courseDescription: "A personalized course based on skills analysis",
        targetAudience: "Professional Development",
        learningObjectives: "Improve skills and close gaps",
        estimatedDuration: "4 weeks",
        employeeId: employee.id,
        companyId: companyId
      };

      const result = await generateCourse(params);

      if (result.success && result.jobId) {
        setJobId(result.jobId);
        setStep('generating');
        toast({
          title: "Course Generation Started",
          description: "Your personalized course is being generated. This may take a few minutes."
        });
      } else {
        throw new Error(result.error || 'Failed to start course generation');
      }
    } catch (error: any) {
      console.error('Course generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate course. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerationComplete = () => {
    setStep('completed');
    toast({
      title: "Course Generated Successfully!",
      description: "Your personalized course is ready for review."
    });
  };

  const handleClose = () => {
    if (step === 'completed') {
      onComplete();
    }
    onClose();
    // Reset state
    setStep('setup');
    setJobId(null);
    setIsGenerating(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Personalized Course</DialogTitle>
          <DialogDescription>
            Create a personalized learning course based on skills analysis
          </DialogDescription>
        </DialogHeader>

        {step === 'setup' && (
          <div className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This will generate a personalized course based on the employee's CV analysis and skills gaps.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Course Generation
                </CardTitle>
                <CardDescription>
                  Generate a course tailored to specific learning needs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Personalized Learning Course</p>
                      <p className="text-sm text-muted-foreground">
                        Based on skills analysis and learning objectives
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">4 weeks</Badge>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleGenerateCourse}
                    disabled={isGenerating}
                    className="min-w-[120px]"
                  >
                    {isGenerating ? 'Generating...' : 'Generate Course'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 'generating' && jobId && (
          <div className="space-y-4">
            <CourseGenerationTracker 
              jobId={jobId}
              onComplete={handleGenerationComplete}
            />
          </div>
        )}

        {step === 'completed' && (
          <div className="space-y-6">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Course generation completed successfully! The course is now available for review.
              </AlertDescription>
            </Alert>

            <div className="flex justify-end gap-3">
              <Button onClick={handleClose}>
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CourseGenerationModal;
