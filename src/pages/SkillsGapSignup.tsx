import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

const SkillsGapSignup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
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

  const handleSubmit = async (e) => {
    e.preventDefault();
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
          source: formData.source
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setShowSuccess(true);
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

  const isFormValid = () => {
    return formData.email && formData.name && formData.email.includes('@') && isBusinessEmail(formData.email);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Check Your Email!
            </h2>
            <p className="text-gray-600 mb-2">
              We've sent a verification email to <strong>{formData.email}</strong>
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Click the link in the email to complete your setup and access your dashboard.
            </p>
            <Button
              onClick={() => navigate('/login')}
              variant="outline"
              className="w-full"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="https://www.lxera.ai/lovable-uploads/ed8138a6-1489-4140-8b44-0003698e8154.png" 
              alt="LXERA" 
              className="h-12"
            />
          </div>
          <CardTitle className="text-2xl">Get Free Skills Gap Analysis</CardTitle>
          <CardDescription>
            Join companies transforming their L&D with AI-powered insights
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your full name"
                className="mt-1"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="email">Work Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your@company.com"
                className="mt-1"
                required
              />
              {formData.email && formData.email.includes('@') && !isBusinessEmail(formData.email) && (
                <Alert className="mt-2 border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">
                    Please use your business email address
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <Button
              type="submit"
              disabled={!isFormValid() || isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              {isSubmitting ? 'Sending...' : 'Get Started'}
            </Button>
          </form>

          <p className="text-xs text-gray-500 mt-4 text-center">
            Free analysis for your team • No credit card required
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SkillsGapSignup;