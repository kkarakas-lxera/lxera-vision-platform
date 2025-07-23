import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, ChevronRight, ChevronDown, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Education {
  degree: string;
  fieldOfStudy: string;
  institution: string;
  year: string;
}

interface EducationFormProps {
  onComplete: (data: Education[]) => void;
}

export default function EducationForm({ onComplete }: EducationFormProps) {
  const [educationData, setEducationData] = useState<Education[]>([
    { degree: '', fieldOfStudy: '', institution: '', year: '' }
  ]);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set([0]));
  
  const toggleExpanded = (index: number) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const updated = [...educationData];
    updated[index] = { ...updated[index], [field]: value };
    setEducationData(updated);
  };

  const addEducation = () => {
    setEducationData([...educationData, { degree: '', fieldOfStudy: '', institution: '', year: '' }]);
    setExpandedItems(prev => new Set(prev).add(educationData.length));
  };

  const removeEducation = (index: number) => {
    setEducationData(educationData.filter((_, i) => i !== index));
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  };

  const isValid = educationData.some(edu => edu.degree && edu.institution);

  const handleContinue = () => {
    const validEducation = educationData.filter(edu => edu.degree && edu.institution);
    onComplete(validEducation);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  return (
    <Card className="transition-all border-0 shadow-sm">
      <CardHeader className="py-3 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-1.5">
            <GraduationCap className="h-3.5 w-3.5" />
            Education
          </CardTitle>
          <span className="text-xs text-gray-500">
            Add your degrees
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 px-4 pb-4">
        <AnimatePresence mode="popLayout">
          {educationData.map((edu, index) => (
            <motion.div
              key={index}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-3 border rounded-md bg-white"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <button
                    onClick={() => toggleExpanded(index)}
                    className="flex items-start gap-2 flex-1 text-left"
                    type="button"
                  >
                    <div className="mt-1">
                      {expandedItems.has(index) ? (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      {edu.degree || edu.institution ? (
                        <>
                          <p className="font-medium text-sm">
                            {edu.degree || 'Degree'} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}
                          </p>
                          <p className="text-xs text-gray-600">
                            {edu.institution || 'Institution'} {edu.year && `• ${edu.year}`}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-gray-500">Education {index + 1}</p>
                      )}
                    </div>
                  </button>
                  {educationData.length > 1 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeEducation(index)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-gray-400" />
                    </Button>
                  )}
                </div>

                <AnimatePresence>
                  {expandedItems.has(index) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-3 pt-2">
                        <select
                          className="w-full px-3 py-2 border rounded-md text-sm"
                          value={edu.degree}
                          onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                          title="Select degree"
                        >
                          <option value="">Select Degree</option>
                          <option value="High School">High School</option>
                          <option value="Associate">Associate Degree</option>
                          <option value="Bachelor">Bachelor's Degree</option>
                          <option value="Master">Master's Degree</option>
                          <option value="MBA">MBA</option>
                          <option value="PhD">PhD</option>
                          <option value="Certificate">Certificate</option>
                          <option value="Bootcamp">Bootcamp</option>
                        </select>
                        <Input
                          placeholder="Field of Study (e.g., Computer Science)"
                          value={edu.fieldOfStudy}
                          onChange={(e) => updateEducation(index, 'fieldOfStudy', e.target.value)}
                          className="text-sm"
                        />
                        <Input
                          placeholder="Institution Name"
                          value={edu.institution}
                          onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                          className="text-sm"
                        />
                        <select
                          className="w-full px-3 py-2 border rounded-md text-sm"
                          value={edu.year}
                          onChange={(e) => updateEducation(index, 'year', e.target.value)}
                          title="Select graduation year"
                        >
                          <option value="">Graduation Year</option>
                          <option value="Expected 2025">Expected 2025</option>
                          <option value="Expected 2026">Expected 2026</option>
                          {years.map(year => (
                            <option key={year} value={year.toString()}>{year}</option>
                          ))}
                        </select>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {educationData.length < 3 && (
          <Button
            size="sm"
            variant="outline"
            className="w-full h-9 text-xs"
            onClick={addEducation}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Another Degree
          </Button>
        )}

        <div className="pt-2">
          <Button
            className="w-full"
            onClick={handleContinue}
            disabled={!isValid}
          >
            Continue →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}