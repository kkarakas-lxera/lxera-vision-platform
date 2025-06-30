import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from '@/hooks/useUser';
import { useEmployee } from '@/hooks/useEmployee';
import { CourseGenerationParams } from '@/services/courseGenerationService';
import { generateCourse } from '@/services/courseGenerationService';
import { useFileUpload } from '@/hooks/useFileUpload';
import { createCVProcessingService } from '@/services/cv/CVProcessingService';

interface CourseGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCourseGenerated: () => void;
}

const CourseGenerationModal: React.FC<CourseGenerationModalProps> = ({ isOpen, onClose, onCourseGenerated }) => {
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [learningObjectives, setLearningObjectives] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationSuccess, setGenerationSuccess] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvText, setCvText] = useState<string>('');
  const { toast } = useToast();
  const { user } = useUser();
  const { employee } = useEmployee();
  const { uploadFile } = useFileUpload();

  useEffect(() => {
    if (cvFile) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        setCvText(e.target.result);
      };
      reader.readAsText(cvFile);
    }
  }, [cvFile]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    setCvFile(file || null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!user || !employee) {
      toast({
        title: "Authentication Error",
        description: "User or employee data not found. Please ensure you are logged in.",
        variant: "destructive",
      });
      return;
    }

    if (!courseTitle || !courseDescription || !targetAudience || !learningObjectives || !estimatedDuration) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGenerationSuccess(false);
    setGenerationError(null);

    try {
      if (!cvFile) {
        toast({
          title: "CV Required",
          description: "Please upload a CV to personalize the course generation.",
          variant: "destructive",
        });
        setIsGenerating(false);
        return;
      }

      if (!user.company_id) {
        toast({
          title: "Company ID Missing",
          description: "Your user profile is missing the company ID. Contact support.",
          variant: "destructive",
        });
        setIsGenerating(false);
        return;
      }

      // Upload the CV file
      const filePath = `${user.company_id}/${employee.id}/${cvFile.name}`;
      const uploadResult = await uploadFile('employee-cvs', cvFile, filePath);

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Failed to upload CV');
      }

      // Call CV processing service
      if (!user.company_id) {
        toast({
          title: "Company ID Missing",
          description: "Your user profile is missing the company ID. Contact support.",
          variant: "destructive",
        });
        setIsGenerating(false);
        return;
      }

      try {
        const cvService = createCVProcessingService(user.company_id);
        const analysis = await cvService.processCV(
          cvText,
          employee.id,
          user.id,
        );
      } catch (cvError: any) {
        console.error("CV Processing Failed:", cvError);
        toast({
          title: "CV Processing Failed",
          description: "There was an error processing your CV. Please try again or contact support.",
          variant: "destructive",
        });
        setIsGenerating(false);
        return;
      }

      const courseParams: CourseGenerationParams = {
        courseTitle,
        courseDescription,
        targetAudience,
        learningObjectives,
        estimatedDuration,
        additionalNotes,
        employeeId: employee.id,
        companyId: user.company_id,
      };

      const result = await generateCourse(courseParams);

      if (result.success) {
        setGenerationSuccess(true);
        toast({
          title: "Course Generation Started!",
          description: "The course generation process has started. You'll receive a notification when it's complete.",
        });
        onCourseGenerated();
      } else {
        setGenerationError(result.error || 'An unexpected error occurred');
        toast({
          title: "Course Generation Failed",
          description: result.error || "There was an error generating the course. Please try again or contact support.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Course Generation Failed:", error);
      setGenerationError(error.message || 'An unexpected error occurred');
      toast({
        title: "Course Generation Failed",
        description: error.message || "There was an error generating the course. Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    if (!isGenerating) {
      onClose();
    }
  };

  const handleSuccessClose = () => {
    setGenerationSuccess(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-future-green/20">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-semibold text-business-black font-inter">
            {generationSuccess ? "Course Generation Started!" : "Generate New Course"}
          </DialogTitle>
          <DialogDescription className="text-business-black/70">
            {generationSuccess ? "The course generation process has started. You'll receive a notification when it's complete." : "Fill in the details below to start generating a new personalized course."}
          </DialogDescription>
        </DialogHeader>

        {generationSuccess ? (
          <div className="text-center py-8 space-y-4">
            <CheckCircle className="w-16 h-16 text-future-green mx-auto" />
            <Button
              onClick={handleSuccessClose}
              className="bg-future-green text-business-black hover:bg-future-green/90 font-medium px-8 py-2 rounded-xl"
            >
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="courseTitle" className="text-sm font-medium text-business-black">
                  Course Title
                </Label>
                <Input
                  type="text"
                  id="courseTitle"
                  placeholder="e.g., Advanced Python for Data Science"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-future-green/50 focus:border-future-green"
                  required
                />
              </div>

              <div>
                <Label htmlFor="estimatedDuration" className="text-sm font-medium text-business-black">
                  Estimated Duration
                </Label>
                <Input
                  type="text"
                  id="estimatedDuration"
                  placeholder="e.g., 4 weeks"
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-future-green/50 focus:border-future-green"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="courseDescription" className="text-sm font-medium text-business-black">
                Course Description
              </Label>
              <Textarea
                id="courseDescription"
                placeholder="Describe the course in detail..."
                value={courseDescription}
                onChange={(e) => setCourseDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-future-green/50 focus:border-future-green min-h-[80px] resize-none"
                required
              />
            </div>

            <div>
              <Label htmlFor="targetAudience" className="text-sm font-medium text-business-black">
                Target Audience
              </Label>
              <Input
                type="text"
                id="targetAudience"
                placeholder="e.g., Mid-level software engineers"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-future-green/50 focus:border-future-green"
                required
              />
            </div>

            <div>
              <Label htmlFor="learningObjectives" className="text-sm font-medium text-business-black">
                Learning Objectives
              </Label>
              <Textarea
                id="learningObjectives"
                placeholder="What should learners achieve?..."
                value={learningObjectives}
                onChange={(e) => setLearningObjectives(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-future-green/50 focus:border-future-green min-h-[80px] resize-none"
                required
              />
            </div>

            <div>
              <Label htmlFor="additionalNotes" className="text-sm font-medium text-business-black">
                Additional Notes
              </Label>
              <Textarea
                id="additionalNotes"
                placeholder="Any other specifications?..."
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-future-green/50 focus:border-future-green min-h-[80px] resize-none"
              />
            </div>

            <div>
              <Label htmlFor="cvFile" className="text-sm font-medium text-business-black">
                Upload CV
              </Label>
              <Input
                type="file"
                id="cvFile"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileChange}
                className="w-full"
              />
              {cvFile && (
                <div className="mt-2 text-sm text-business-black/70">
                  Selected file: {cvFile.name}
                </div>
              )}
            </div>

            {generationError && (
              <div className="text-red-500 text-sm flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                {generationError}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isGenerating}
                className="flex-1 border-2 border-gray-300 text-business-black hover:bg-gray-50 hover:text-business-black font-medium py-2 rounded-xl transition-colors"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isGenerating}
                className="flex-1 bg-future-green text-business-black hover:bg-future-green/90 font-medium py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Course"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CourseGenerationModal;
