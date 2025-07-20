import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Plus, Trash2 } from 'lucide-react';

interface WorkExperience {
  id?: string;
  title: string;
  company: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
}

interface WorkExperienceSectionProps {
  data: WorkExperience[] | any;
  onSave: (data: any, isComplete: boolean) => void;
  saving: boolean;
}

export default function WorkExperienceSection({ data, onSave, saving }: WorkExperienceSectionProps) {
  // Data from database comes directly as an array or null
  const initialExperiences = data || [];
    
  const [experiences, setExperiences] = useState<WorkExperience[]>(
    Array.isArray(initialExperiences) ? initialExperiences : []
  );
  const [showForm, setShowForm] = useState(experiences.length === 0);
  const [currentExperience, setCurrentExperience] = useState<WorkExperience>({
    title: '',
    company: '',
    startDate: '',
    endDate: '',
    current: false,
    description: ''
  });

  const handleAddExperience = () => {
    if (currentExperience.title && currentExperience.company && currentExperience.startDate) {
      setExperiences([...experiences, { ...currentExperience, id: Date.now().toString() }]);
      setCurrentExperience({
        title: '',
        company: '',
        startDate: '',
        endDate: '',
        current: false,
        description: ''
      });
      setShowForm(false);
    }
  };

  const handleRemoveExperience = (id: string) => {
    setExperiences(experiences.filter(exp => exp.id !== id));
  };

  const handleSave = () => {
    const isComplete = experiences.length > 0;
    onSave(experiences, isComplete);
  };

  return (
    <div className="space-y-6">
      {/* Existing experiences */}
      {experiences.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium">Your Experience</h3>
          {experiences.map((exp) => (
            <Card key={exp.id} className="p-4">
              <div className="flex justify-between">
                <div className="flex-1">
                  <h4 className="font-medium">{exp.title}</h4>
                  <p className="text-sm text-gray-600">{exp.company}</p>
                  <p className="text-sm text-gray-500">
                    {exp.startDate} - {exp.current ? 'Present' : (exp.endDate || 'Unknown')}
                  </p>
                  {exp.description && (
                    <p className="text-sm mt-2 whitespace-pre-line">{exp.description}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveExperience(exp.id!)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add new experience form */}
      {showForm ? (
        <Card className="p-4">
          <h3 className="font-medium mb-4">Add Experience</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                value={currentExperience.title}
                onChange={(e) => setCurrentExperience({ ...currentExperience, title: e.target.value })}
                placeholder="Software Engineer"
              />
            </div>

            <div>
              <Label htmlFor="company">Company *</Label>
              <Input
                id="company"
                value={currentExperience.company}
                onChange={(e) => setCurrentExperience({ ...currentExperience, company: e.target.value })}
                placeholder="TechCorp Inc."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="month"
                  value={currentExperience.startDate}
                  onChange={(e) => setCurrentExperience({ ...currentExperience, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="month"
                  value={currentExperience.endDate}
                  onChange={(e) => setCurrentExperience({ ...currentExperience, endDate: e.target.value })}
                  disabled={currentExperience.current}
                />
                <div className="mt-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={currentExperience.current}
                      onChange={(e) => setCurrentExperience({ 
                        ...currentExperience, 
                        current: e.target.checked,
                        endDate: e.target.checked ? '' : currentExperience.endDate
                      })}
                      className="rounded"
                    />
                    <span className="text-sm">I currently work here</span>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={currentExperience.description}
                onChange={(e) => setCurrentExperience({ ...currentExperience, description: e.target.value })}
                placeholder="Describe your responsibilities and achievements..."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddExperience}>
                Add Experience
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Button
          variant="outline"
          onClick={() => setShowForm(true)}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Work Experience
        </Button>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save & Continue
        </Button>
      </div>
    </div>
  );
}