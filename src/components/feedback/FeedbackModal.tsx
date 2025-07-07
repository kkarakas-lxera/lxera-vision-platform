import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Bug, Lightbulb, MessageCircle, Send, X } from 'lucide-react';

export type FeedbackType = 'bug_report' | 'feature_request' | 'general_feedback';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: FeedbackType;
}

interface FeedbackFormData {
  type: FeedbackType;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  steps_to_reproduce?: string;
  expected_behavior?: string;
  actual_behavior?: string;
  browser_info?: string;
}

const feedbackTypes = [
  {
    value: 'bug_report' as const,
    label: 'Bug Report',
    icon: Bug,
    description: 'Report a problem or issue with the platform',
    color: 'bg-red-50 text-red-700 border-red-200',
  },
  {
    value: 'feature_request' as const,
    label: 'Feature Request',
    icon: Lightbulb,
    description: 'Suggest a new feature or improvement',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    value: 'general_feedback' as const,
    label: 'General Feedback',
    icon: MessageCircle,
    description: 'Share your thoughts or suggestions',
    color: 'bg-green-50 text-green-700 border-green-200',
  },
];

const categories = {
  bug_report: [
    'User Interface',
    'Data Processing',
    'Authentication',
    'Performance',
    'Integration',
    'Other',
  ],
  feature_request: [
    'Dashboard',
    'Employee Management',
    'Skills Analysis',
    'Course Management',
    'Reporting',
    'Integration',
    'Other',
  ],
  general_feedback: [
    'User Experience',
    'Performance',
    'Design',
    'Documentation',
    'Support',
    'Other',
  ],
};

export default function FeedbackModal({ isOpen, onClose, defaultType = 'general_feedback' }: FeedbackModalProps) {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formData, setFormData] = useState<FeedbackFormData>({
    type: defaultType,
    title: '',
    description: '',
    priority: 'medium',
    category: '',
    steps_to_reproduce: '',
    expected_behavior: '',
    actual_behavior: '',
    browser_info: typeof window !== 'undefined' ? navigator.userAgent : '',
  });

  const selectedType = feedbackTypes.find(t => t.value === formData.type);
  const selectedTypeIcon = selectedType?.icon || MessageCircle;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userProfile) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to submit feedback',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please provide both a title and description for your feedback',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Prepare metadata based on feedback type
      const metadata: Record<string, any> = {
        category: formData.category,
        priority: formData.priority,
        platform: 'web',
        user_agent: formData.browser_info,
        submitted_from: 'dashboard',
      };

      if (formData.type === 'bug_report') {
        metadata.steps_to_reproduce = formData.steps_to_reproduce;
        metadata.expected_behavior = formData.expected_behavior;
        metadata.actual_behavior = formData.actual_behavior;
      }

      // Create feedback ticket
      const { error } = await supabase
        .from('tickets')
        .insert({
          ticket_type: formData.type,
          first_name: userProfile.full_name.split(' ')[0] || 'User',
          last_name: userProfile.full_name.split(' ').slice(1).join(' ') || '',
          email: userProfile.email,
          company: userProfile.company_id || 'Unknown',
          job_title: userProfile.role || 'User',
          message: `${formData.title}\n\n${formData.description}`,
          priority: formData.priority,
          source: 'Platform Dashboard',
          status: 'new',
          metadata: metadata,
        });

      if (error) {
        throw error;
      }

      toast({
        title: 'Feedback Submitted Successfully',
        description: 'Thank you for your feedback! We\'ll review it and get back to you soon.',
      });

      // Reset form
      setFormData({
        type: defaultType,
        title: '',
        description: '',
        priority: 'medium',
        category: '',
        steps_to_reproduce: '',
        expected_behavior: '',
        actual_behavior: '',
        browser_info: typeof window !== 'undefined' ? navigator.userAgent : '',
      });
      setShowAdvanced(false);

      onClose();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: 'Submission Failed',
        description: 'There was an error submitting your feedback. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <selectedTypeIcon className="h-5 w-5" />
            Platform Feedback
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Feedback Type Selection - Compact */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Feedback Type</Label>
            <div className="flex gap-2">
              {feedbackTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: type.value, category: '' }))}
                    className={`flex-1 p-2 rounded-lg border text-center transition-colors ${
                      formData.type === type.value
                        ? type.color
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4 mx-auto mb-1" />
                    <div className="text-xs font-medium">{type.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Brief summary of your feedback"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Detailed description of your feedback"
              rows={3}
              required
            />
          </div>

          {/* Show More Options Button */}
          {!showAdvanced && (
            <button
              type="button"
              onClick={() => setShowAdvanced(true)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              + More options (category, priority)
            </button>
          )}

          {/* Advanced Options */}
          {showAdvanced && (
            <div className="space-y-4 p-3 bg-gray-50 rounded-lg border">
              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories[formData.type].map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label htmlFor="priority" className="text-sm">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: 'low' | 'medium' | 'high') => 
                    setFormData(prev => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Bug Report Specific Fields */}
          {formData.type === 'bug_report' && showAdvanced && (
            <div className="space-y-3 p-3 bg-red-50 rounded-lg border border-red-200">
              <h4 className="text-sm font-medium text-red-800">Bug Report Details (Optional)</h4>
              
              <div className="space-y-2">
                <Label htmlFor="steps" className="text-sm">Steps to Reproduce</Label>
                <Textarea
                  id="steps"
                  value={formData.steps_to_reproduce}
                  onChange={(e) => setFormData(prev => ({ ...prev, steps_to_reproduce: e.target.value }))}
                  placeholder="1. Go to...\n2. Click on...\n3. Expected result..."
                  rows={2}
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expected" className="text-sm">Expected Behavior</Label>
                <Textarea
                  id="expected"
                  value={formData.expected_behavior}
                  onChange={(e) => setFormData(prev => ({ ...prev, expected_behavior: e.target.value }))}
                  placeholder="What should have happened?"
                  rows={2}
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="actual" className="text-sm">Actual Behavior</Label>
                <Textarea
                  id="actual"
                  value={formData.actual_behavior}
                  onChange={(e) => setFormData(prev => ({ ...prev, actual_behavior: e.target.value }))}
                  placeholder="What actually happened?"
                  rows={2}
                  className="text-sm"
                />
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              <Send className="h-4 w-4 mr-2" />
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}