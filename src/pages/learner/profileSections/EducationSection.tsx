import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, Trash2 } from 'lucide-react';

interface Education {
  id?: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
}

interface EducationSectionProps {
  data: Education[] | any;
  onSave: (data: any, isComplete: boolean) => void;
  saving: boolean;
}

const DEGREE_TYPES = [
  'High School Diploma',
  'Associate Degree',
  'Bachelor\'s Degree',
  'Master\'s Degree',
  'Doctorate',
  'Professional Degree',
  'Certificate',
  'Bootcamp',
  'Other'
];

export default function EducationSection({ data, onSave, saving }: EducationSectionProps) {
  const [educations, setEducations] = useState<Education[]>(
    Array.isArray(data) ? data : []
  );
  const [showForm, setShowForm] = useState(educations.length === 0);
  const [currentEducation, setCurrentEducation] = useState<Education>({
    school: '',
    degree: '',
    field: '',
    startDate: '',
    endDate: '',
    current: false,
    description: ''
  });

  const handleAddEducation = () => {
    if (currentEducation.school && currentEducation.degree && currentEducation.field) {
      setEducations([...educations, { ...currentEducation, id: Date.now().toString() }]);
      setCurrentEducation({
        school: '',
        degree: '',
        field: '',
        startDate: '',
        endDate: '',
        current: false,
        description: ''
      });
      setShowForm(false);
    }
  };

  const handleRemoveEducation = (id: string) => {
    setEducations(educations.filter(edu => edu.id !== id));
  };

  const handleSave = () => {
    const isComplete = educations.length > 0;
    onSave(educations, isComplete);
  };

  return (
    <div className="space-y-6">
      {/* Existing education */}
      {educations.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium">Your Education</h3>
          {educations.map((edu) => (
            <Card key={edu.id} className="p-4">
              <div className="flex justify-between">
                <div className="flex-1">
                  <h4 className="font-medium">{edu.degree}</h4>
                  <p className="text-sm text-gray-600">{edu.school}</p>
                  <p className="text-sm text-gray-500">{edu.field}</p>
                  <p className="text-sm text-gray-500">
                    {edu.startDate} - {edu.current ? 'Present' : edu.endDate}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveEducation(edu.id!)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add new education form */}
      {showForm ? (
        <Card className="p-4">
          <h3 className="font-medium mb-4">Add Education</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="school">School/Institution *</Label>
              <Input
                id="school"
                value={currentEducation.school}
                onChange={(e) => setCurrentEducation({ ...currentEducation, school: e.target.value })}
                placeholder="Stanford University"
              />
            </div>

            <div>
              <Label htmlFor="degree">Degree Type *</Label>
              <Select
                value={currentEducation.degree}
                onValueChange={(value) => setCurrentEducation({ ...currentEducation, degree: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select degree type" />
                </SelectTrigger>
                <SelectContent>
                  {DEGREE_TYPES.map(degree => (
                    <SelectItem key={degree} value={degree}>
                      {degree}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="field">Field of Study *</Label>
              <Input
                id="field"
                value={currentEducation.field}
                onChange={(e) => setCurrentEducation({ ...currentEducation, field: e.target.value })}
                placeholder="Computer Science"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="month"
                  value={currentEducation.startDate}
                  onChange={(e) => setCurrentEducation({ ...currentEducation, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="month"
                  value={currentEducation.endDate}
                  onChange={(e) => setCurrentEducation({ ...currentEducation, endDate: e.target.value })}
                  disabled={currentEducation.current}
                />
                <div className="mt-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={currentEducation.current}
                      onChange={(e) => setCurrentEducation({ 
                        ...currentEducation, 
                        current: e.target.checked,
                        endDate: e.target.checked ? '' : currentEducation.endDate
                      })}
                      className="rounded"
                    />
                    <span className="text-sm">Currently attending</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddEducation}>
                Add Education
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
          Add Education
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