import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Edit2, Save, X, Briefcase, GraduationCap, User, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface WorkExperience {
  title: string;
  company: string;
  duration: string;
  description?: string;
}

interface Education {
  degree: string;
  institution: string;
  year: string;
  fieldOfStudy?: string;
}

interface PersonalInfo {
  name?: string;
  email?: string;
  phone?: string;
}

interface CVExtractedSectionsProps {
  personalInfo?: PersonalInfo;
  workExperience: WorkExperience[];
  education: Education[];
  onSectionAccept: (section: 'personal' | 'work' | 'education') => void;
  onSectionUpdate: (section: 'personal' | 'work' | 'education', data: any) => void;
  onComplete: () => void;
}

export default function CVExtractedSections({
  personalInfo,
  workExperience,
  education,
  onSectionAccept,
  onSectionUpdate,
  onComplete
}: CVExtractedSectionsProps) {
  const [editingWork, setEditingWork] = useState<number | null>(null);
  const [editingEducation, setEditingEducation] = useState<number | null>(null);
  const [editingPersonal, setEditingPersonal] = useState(false);
  
  const [workData, setWorkData] = useState(workExperience);
  const [educationData, setEducationData] = useState(education);
  const [personalData, setPersonalData] = useState(personalInfo || {});
  
  const [acceptedSections, setAcceptedSections] = useState({
    personal: false,
    work: false,
    education: false
  });

  const handleWorkEdit = (index: number) => {
    setEditingWork(index);
  };

  const handleWorkSave = (index: number) => {
    setEditingWork(null);
    onSectionUpdate('work', workData);
  };

  const handleWorkCancel = (index: number) => {
    setWorkData(workExperience);
    setEditingWork(null);
  };

  const handleEducationEdit = (index: number) => {
    setEditingEducation(index);
  };

  const handleEducationSave = (index: number) => {
    setEditingEducation(null);
    onSectionUpdate('education', educationData);
  };

  const handleEducationCancel = (index: number) => {
    setEducationData(education);
    setEditingEducation(null);
  };

  const handleAcceptSection = (section: 'personal' | 'work' | 'education') => {
    setAcceptedSections(prev => ({ ...prev, [section]: true }));
    onSectionAccept(section);
    
    // Check if all sections are accepted
    const newAccepted = { ...acceptedSections, [section]: true };
    if (newAccepted.personal && newAccepted.work && newAccepted.education) {
      setTimeout(() => onComplete(), 500);
    }
  };

  const allSectionsAccepted = acceptedSections.personal && acceptedSections.work && acceptedSections.education;

  return (
    <div className="space-y-4 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-sm text-gray-600 mb-4"
      >
        Review and edit your information below. You can edit individual entries or accept entire sections.
      </motion.div>

      {/* Personal Information */}
      {personalInfo && (
        <Card className={cn("transition-all", acceptedSections.personal && "border-green-500 bg-green-50/50")}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                Personal Information
              </CardTitle>
              {!acceptedSections.personal && (
                <div className="flex gap-2">
                  {!editingPersonal ? (
                    <>
                      <Button size="sm" variant="ghost" onClick={() => setEditingPersonal(true)}>
                        <Edit2 className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="default" onClick={() => handleAcceptSection('personal')}>
                        <Check className="h-3 w-3 mr-1" />
                        Accept
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" variant="ghost" onClick={() => {
                        setPersonalData(personalInfo);
                        setEditingPersonal(false);
                      }}>
                        <X className="h-3 w-3 mr-1" />
                        Cancel
                      </Button>
                      <Button size="sm" variant="default" onClick={() => {
                        setEditingPersonal(false);
                        onSectionUpdate('personal', personalData);
                      }}>
                        <Save className="h-3 w-3 mr-1" />
                        Save
                      </Button>
                    </>
                  )}
                </div>
              )}
              {acceptedSections.personal && (
                <span className="text-xs text-green-600 font-medium">✓ Accepted</span>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {editingPersonal ? (
              <>
                <Input
                  placeholder="Name"
                  value={personalData.name || ''}
                  onChange={(e) => setPersonalData(prev => ({ ...prev, name: e.target.value }))}
                />
                <Input
                  placeholder="Email"
                  value={personalData.email || ''}
                  onChange={(e) => setPersonalData(prev => ({ ...prev, email: e.target.value }))}
                />
                <Input
                  placeholder="Phone"
                  value={personalData.phone || ''}
                  onChange={(e) => setPersonalData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </>
            ) : (
              <div className="text-sm space-y-1">
                {personalData.name && <p><span className="text-gray-500">Name:</span> {personalData.name}</p>}
                {personalData.email && <p><span className="text-gray-500">Email:</span> {personalData.email}</p>}
                {personalData.phone && <p><span className="text-gray-500">Phone:</span> {personalData.phone}</p>}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Work Experience */}
      <Card className={cn("transition-all", acceptedSections.work && "border-green-500 bg-green-50/50")}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Work Experience ({workData.length})
            </CardTitle>
            {!acceptedSections.work && (
              <Button size="sm" variant="default" onClick={() => handleAcceptSection('work')}>
                <Check className="h-3 w-3 mr-1" />
                Accept All
              </Button>
            )}
            {acceptedSections.work && (
              <span className="text-xs text-green-600 font-medium">✓ Accepted</span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <AnimatePresence mode="popLayout">
            {workData.map((work, index) => (
              <motion.div
                key={index}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  "p-3 border rounded-lg bg-white",
                  editingWork === index && "border-blue-300 bg-blue-50/50"
                )}
              >
                {editingWork === index ? (
                  <div className="space-y-2">
                    <Input
                      placeholder="Job Title"
                      value={work.title}
                      onChange={(e) => {
                        const updated = [...workData];
                        updated[index] = { ...updated[index], title: e.target.value };
                        setWorkData(updated);
                      }}
                    />
                    <Input
                      placeholder="Company"
                      value={work.company}
                      onChange={(e) => {
                        const updated = [...workData];
                        updated[index] = { ...updated[index], company: e.target.value };
                        setWorkData(updated);
                      }}
                    />
                    <Input
                      placeholder="Duration"
                      value={work.duration}
                      onChange={(e) => {
                        const updated = [...workData];
                        updated[index] = { ...updated[index], duration: e.target.value };
                        setWorkData(updated);
                      }}
                    />
                    <div className="flex justify-end gap-2 pt-2">
                      <Button size="sm" variant="ghost" onClick={() => handleWorkCancel(index)}>
                        Cancel
                      </Button>
                      <Button size="sm" variant="default" onClick={() => handleWorkSave(index)}>
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{work.title}</p>
                      <p className="text-sm text-gray-600">{work.company}</p>
                      <p className="text-xs text-gray-500">{work.duration}</p>
                    </div>
                    {!acceptedSections.work && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleWorkEdit(index)}
                        className="ml-2"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {!acceptedSections.work && (
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => {
                const newWork = { title: '', company: '', duration: '' };
                setWorkData([...workData, newWork]);
                setEditingWork(workData.length);
              }}
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Position
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Education */}
      <Card className={cn("transition-all", acceptedSections.education && "border-green-500 bg-green-50/50")}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Education ({educationData.length})
            </CardTitle>
            {!acceptedSections.education && (
              <Button size="sm" variant="default" onClick={() => handleAcceptSection('education')}>
                <Check className="h-3 w-3 mr-1" />
                Accept All
              </Button>
            )}
            {acceptedSections.education && (
              <span className="text-xs text-green-600 font-medium">✓ Accepted</span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <AnimatePresence mode="popLayout">
            {educationData.map((edu, index) => (
              <motion.div
                key={index}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  "p-3 border rounded-lg bg-white",
                  editingEducation === index && "border-blue-300 bg-blue-50/50"
                )}
              >
                {editingEducation === index ? (
                  <div className="space-y-2">
                    <Input
                      placeholder="Degree"
                      value={edu.degree}
                      onChange={(e) => {
                        const updated = [...educationData];
                        updated[index] = { ...updated[index], degree: e.target.value };
                        setEducationData(updated);
                      }}
                    />
                    <Input
                      placeholder="Institution"
                      value={edu.institution}
                      onChange={(e) => {
                        const updated = [...educationData];
                        updated[index] = { ...updated[index], institution: e.target.value };
                        setEducationData(updated);
                      }}
                    />
                    <Input
                      placeholder="Year"
                      value={edu.year}
                      onChange={(e) => {
                        const updated = [...educationData];
                        updated[index] = { ...updated[index], year: e.target.value };
                        setEducationData(updated);
                      }}
                    />
                    <div className="flex justify-end gap-2 pt-2">
                      <Button size="sm" variant="ghost" onClick={() => handleEducationCancel(index)}>
                        Cancel
                      </Button>
                      <Button size="sm" variant="default" onClick={() => handleEducationSave(index)}>
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{edu.degree}</p>
                      <p className="text-sm text-gray-600">{edu.institution}</p>
                      <p className="text-xs text-gray-500">{edu.year}</p>
                    </div>
                    {!acceptedSections.education && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleEducationEdit(index)}
                        className="ml-2"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {!acceptedSections.education && (
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => {
                const newEdu = { degree: '', institution: '', year: '' };
                setEducationData([...educationData, newEdu]);
                setEditingEducation(educationData.length);
              }}
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Education
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Continue Button */}
      {allSectionsAccepted && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center pt-4"
        >
          <Button onClick={onComplete} size="lg" className="gap-2">
            Continue to Skills Review
            <Check className="h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}