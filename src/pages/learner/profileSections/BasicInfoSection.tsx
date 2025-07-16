import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface BasicInfoSectionProps {
  data: {
    firstName?: string;
    lastName?: string;
    headline?: string;
    summary?: string;
    phone?: string;
    location?: string;
  };
  onSave: (data: any, isComplete: boolean) => void;
  saving: boolean;
}

export default function BasicInfoSection({ data, onSave, saving }: BasicInfoSectionProps) {
  const [formData, setFormData] = useState({
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    headline: data.headline || '',
    summary: data.summary || '',
    phone: data.phone || '',
    location: data.location || ''
  });

  const isComplete = () => {
    return formData.firstName && formData.lastName && formData.headline;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData, isComplete());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            placeholder="John"
            required
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            placeholder="Doe"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="headline">Professional Headline *</Label>
        <Input
          id="headline"
          value={formData.headline}
          onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
          placeholder="Senior Software Engineer at TechCorp"
          required
        />
        <p className="text-sm text-gray-500 mt-1">
          A brief description of your current role
        </p>
      </div>

      <div>
        <Label htmlFor="summary">Professional Summary</Label>
        <Textarea
          id="summary"
          value={formData.summary}
          onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
          placeholder="Experienced software engineer with 5+ years..."
          rows={4}
        />
        <p className="text-sm text-gray-500 mt-1">
          Tell us about your professional background and expertise
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+1 (555) 123-4567"
          />
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="San Francisco, CA"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save & Continue
        </Button>
      </div>
    </form>
  );
}