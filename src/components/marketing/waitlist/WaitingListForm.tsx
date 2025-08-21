import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { CheckCircle, Mail, Users, Building2 } from 'lucide-react';
import { useToast } from '../../ui/use-toast';

interface FormData {
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  role: string;
  teamSize: string;
  interests: string[];
}

export const WaitingListForm: React.FC = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    firstName: '',
    lastName: '',
    company: '',
    role: '',
    teamSize: '',
    interests: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Integrate with Supabase edge function
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      setIsSubmitted(true);
      toast({
        title: "Welcome to the waiting list!",
        description: "We'll notify you as soon as early access is available.",
      });
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <section id="waiting-list-form" className="py-24 bg-white">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-4" />
                <h3 className="text-2xl font-bold text-green-900 mb-2">You're on the list!</h3>
                <p className="text-green-700 mb-6">
                  Thank you for joining our waiting list. We'll send you updates about early access and launch news.
                </p>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Position: #2,501 in queue
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section id="waiting-list-form" className="py-24 bg-white">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
            Get Early Access
          </h2>
          <p className="text-lg text-gray-600">
            Join thousands of forward-thinking teams already on our waiting list
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              Reserve Your Spot
            </CardTitle>
            <CardDescription>
              Fill out the form below and we'll notify you when early access opens up.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email">Work Email *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="you@company.com"
                />
              </div>

              {/* Company */}
              <div>
                <Label htmlFor="company">Company *</Label>
                <Input
                  id="company"
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  placeholder="Your company name"
                />
              </div>

              {/* Role */}
              <div>
                <Label htmlFor="role">Your Role *</Label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hr-director">HR Director</SelectItem>
                    <SelectItem value="learning-development">Learning & Development</SelectItem>
                    <SelectItem value="team-lead">Team Lead</SelectItem>
                    <SelectItem value="ceo-founder">CEO/Founder</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Team Size */}
              <div>
                <Label htmlFor="teamSize">Team Size *</Label>
                <Select value={formData.teamSize} onValueChange={(value) => handleInputChange('teamSize', value)}>
                  <SelectTrigger>
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

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
              >
                {isSubmitting ? 'Joining...' : 'Join the Waiting List'}
              </Button>

              {/* Privacy Notice */}
              <p className="text-sm text-gray-500 text-center">
                By joining, you agree to receive updates about our product. 
                We respect your privacy and won't spam you.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
