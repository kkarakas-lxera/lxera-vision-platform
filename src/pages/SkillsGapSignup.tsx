import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const SkillsGapSignup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    company: '',
    role: '',
    teamSize: '',
    primaryChallenge: '',
    currentProcess: '',
    source: 'skills-gap-landing'
  });

  // Pre-populate email from URL params
  useEffect(() => {
    const emailParam = searchParams.get('email');
    const sourceParam = searchParams.get('source');
    if (emailParam) {
      setFormData(prev => ({ ...prev, email: emailParam }));
    }
    if (sourceParam) {
      setFormData(prev => ({ ...prev, source: sourceParam }));
    }
  }, [searchParams]);

  const steps = [
    { id: 1, title: 'Contact Information', description: 'Your basic details' },
    { id: 2, title: 'Company Details', description: 'About your organization' },
    { id: 3, title: 'Current Challenges', description: 'What you\'re facing now' },
    { id: 4, title: 'Success!', description: 'Check your email' }
  ];

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('https://xwfweumeryrgbguwrocr.supabase.co/functions/v1/skills-gap-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3ZndldW1lcnlyZ2JndXdyb2NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3NjM0NDAsImV4cCI6MjA2NjMzOTQ0MH0.aDpFDImHTr13UhRHqQZHZ92e8I-tvcuUcDCtfRvfbzw`,
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          company: formData.company,
          role: formData.role,
          teamSize: formData.teamSize,
          primaryChallenge: formData.primaryChallenge,
          currentProcess: formData.currentProcess,
          source: formData.source
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCurrentStep(4);
        toast.success('Verification email sent! Check your inbox to complete setup.');
      } else {
        throw new Error(data.error || 'Failed to send verification email');
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBusinessEmail = (email: string) => {
    const personalDomains = [
      'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com',
      'icloud.com', 'protonmail.com', 'yandex.com', 'mail.com', 'zoho.com',
      'live.com', 'msn.com', 'comcast.net', 'verizon.net', 'att.net'
    ];
    const domain = email.split('@')[1]?.toLowerCase();
    return domain && !personalDomains.includes(domain);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.email && formData.name && formData.email.includes('@') && isBusinessEmail(formData.email);
      case 2:
        return formData.company && formData.role && formData.teamSize;
      case 3:
        return formData.primaryChallenge && formData.currentProcess;
      default:
        return true;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your full name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email">Work Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your work email"
                className="mt-1"
              />
              {formData.email && formData.email.includes('@') && !isBusinessEmail(formData.email) && (
                <p className="text-sm text-red-600 mt-1">
                  Please use your business email address
                </p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="company">Company Name</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Enter your company name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="role">Your Role</Label>
              <Input
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="e.g., HR Director, People Manager"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="teamSize">Team Size</Label>
              <Select value={formData.teamSize} onValueChange={(value) => setFormData({ ...formData, teamSize: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select team size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-10">1-10 employees</SelectItem>
                  <SelectItem value="11-50">11-50 employees</SelectItem>
                  <SelectItem value="51-200">51-200 employees</SelectItem>
                  <SelectItem value="201-1000">201-1000 employees</SelectItem>
                  <SelectItem value="1000+">1000+ employees</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="primaryChallenge">Primary Challenge</Label>
              <RadioGroup
                value={formData.primaryChallenge}
                onValueChange={(value) => setFormData({ ...formData, primaryChallenge: value })}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="skills-assessment" id="skills-assessment" />
                  <Label htmlFor="skills-assessment">Assessing current skills</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="training-gaps" id="training-gaps" />
                  <Label htmlFor="training-gaps">Identifying training gaps</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="career-development" id="career-development" />
                  <Label htmlFor="career-development">Career development planning</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="performance-improvement" id="performance-improvement" />
                  <Label htmlFor="performance-improvement">Performance improvement</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="compliance-training" id="compliance-training" />
                  <Label htmlFor="compliance-training">Compliance training</Label>
                </div>
              </RadioGroup>
            </div>
            <div>
              <Label htmlFor="currentProcess">Current Process</Label>
              <Textarea
                id="currentProcess"
                value={formData.currentProcess}
                onChange={(e) => setFormData({ ...formData, currentProcess: e.target.value })}
                placeholder="Briefly describe how you currently handle skills assessment and training..."
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="text-center space-y-4">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            <div>
              <h3 className="text-lg font-semibold">Check Your Email!</h3>
              <p className="text-gray-600 mt-2">
                We've sent a verification email to <strong>{formData.email}</strong>
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Click the link in the email to set your password and access your dashboard.
              </p>
            </div>
            <Button
              onClick={() => navigate('/admin-login')}
              variant="outline"
              className="mt-4"
            >
              Go to Login
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="https://www.lxera.ai/lovable-uploads/ed8138a6-1489-4140-8b44-0003698e8154.png" 
              alt="LXERA" 
              className="h-12"
            />
          </div>
          <CardTitle className="text-2xl">Skills Gap Analysis Setup</CardTitle>
          <CardDescription>
            Get started with your free skills gap analysis
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-4">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex-1 ${index < steps.length - 1 ? 'mr-2' : ''}`}
                >
                  <div
                    className={`h-2 rounded-full transition-colors duration-300 ${
                      step.id <= currentStep ? 'bg-blue-500' : 'bg-gray-200'
                    }`}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              {steps.map((step) => (
                <div key={step.id} className="text-center">
                  <div className="font-medium">{step.title}</div>
                  <div className="text-xs">{step.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          {renderStep()}

          {/* Navigation Buttons */}
          {currentStep < 4 && (
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="flex items-center"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={!isStepValid() || isSubmitting}
                className="flex items-center"
              >
                {isSubmitting ? (
                  'Sending...'
                ) : currentStep === 3 ? (
                  'Complete Setup'
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SkillsGapSignup;