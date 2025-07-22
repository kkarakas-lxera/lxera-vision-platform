import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Edit2, Save, X, Briefcase, GraduationCap, Plus, ChevronRight, Award, Globe, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface WorkExperience {
  title: string;
  company: string;
  duration: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
  responsibilities?: string[];
  achievements?: string[];
  technologies?: string[];
}

interface Education {
  degree: string;
  institution: string;
  year: string;
  fieldOfStudy?: string;
  gpa?: string;
  achievements?: string[];
}

interface Certification {
  name: string;
  issuer: string;
  year: string;
  credentialId?: string;
}

interface Language {
  language: string;
  proficiency: string;
}

interface ExtractedData {
  work_experience?: WorkExperience[];
  education?: Education[];
  certifications?: Certification[];
  languages?: Language[];
  skills?: any[];
}

interface CVExtractedSectionsProps {
  extractedData: ExtractedData;
  onSectionAccept: (section: 'work' | 'education' | 'certifications' | 'languages') => void;
  onSectionUpdate: (section: 'work' | 'education' | 'certifications' | 'languages', data: any) => void;
  onComplete: () => void;
}

export default function CVExtractedSections({
  extractedData,
  onSectionAccept,
  onSectionUpdate,
  onComplete
}: CVExtractedSectionsProps) {
  const [editingWork, setEditingWork] = useState<number | null>(null);
  const [editingEducation, setEditingEducation] = useState<number | null>(null);
  const [editingCert, setEditingCert] = useState<number | null>(null);
  const [editingLang, setEditingLang] = useState<number | null>(null);
  
  // Transform work experience data to handle both formats
  const transformWorkData = (workExp: any[]): WorkExperience[] => {
    return workExp.map(exp => ({
      title: exp.title || exp.position || '',
      company: exp.company || '',
      duration: exp.duration || exp.dates || '',
      startDate: exp.startDate,
      endDate: exp.endDate,
      current: exp.current,
      description: exp.description || '',
      responsibilities: exp.responsibilities || [],
      achievements: exp.achievements || exp.key_achievements || [],
      technologies: exp.technologies || []
    }));
  };

  const [workData, setWorkData] = useState(transformWorkData(extractedData.work_experience || []));
  const [educationData, setEducationData] = useState(extractedData.education || []);
  const [certData, setCertData] = useState(extractedData.certifications || []);
  const [langData, setLangData] = useState(extractedData.languages || []);
  
  const [currentSection, setCurrentSection] = useState<'work' | 'education' | 'certifications' | 'languages' | 'complete'>('work');
  const [acceptedSections, setAcceptedSections] = useState({
    work: false,
    education: false,
    certifications: false,
    languages: false
  });

  const handleWorkEdit = (index: number) => {
    setEditingWork(index);
  };

  const handleWorkSave = (index: number) => {
    setEditingWork(null);
    onSectionUpdate('work', workData);
  };

  const handleWorkCancel = (index: number) => {
    setWorkData(transformWorkData(extractedData.work_experience || []));
    setEditingWork(null);
  };

  const handleAcceptSection = (section: 'work' | 'education' | 'certifications' | 'languages') => {
    setAcceptedSections(prev => ({ ...prev, [section]: true }));
    onSectionAccept(section);
    
    // Move to next section
    if (section === 'work') {
      setCurrentSection('education');
    } else if (section === 'education') {
      if (certData.length > 0) {
        setCurrentSection('certifications');
      } else if (langData.length > 0) {
        setCurrentSection('languages');
      } else {
        setCurrentSection('complete');
        setTimeout(() => onComplete(), 500);
      }
    } else if (section === 'certifications') {
      if (langData.length > 0) {
        setCurrentSection('languages');
      } else {
        setCurrentSection('complete');
        setTimeout(() => onComplete(), 500);
      }
    } else if (section === 'languages') {
      setCurrentSection('complete');
      setTimeout(() => onComplete(), 500);
    }
  };

  const formatResponsibilities = (resp: string[]) => {
    if (!resp || resp.length === 0) return '';
    return resp.join('\n');
  };

  const parseResponsibilities = (text: string): string[] => {
    return text.split('\n').filter(line => line.trim()).map(line => line.trim());
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-sm text-gray-600 mb-4"
      >
        Let's review your information step by step. You can edit individual entries or accept the entire section.
      </motion.div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center space-x-2 mb-6">
        <div className={cn("flex items-center", currentSection !== 'work' && "opacity-50")}>
          <Briefcase className="h-4 w-4 mr-1" />
          <span className="text-xs">Work</span>
        </div>
        <ChevronRight className="h-4 w-4 text-gray-400" />
        <div className={cn("flex items-center", currentSection !== 'education' && "opacity-50")}>
          <GraduationCap className="h-4 w-4 mr-1" />
          <span className="text-xs">Education</span>
        </div>
        {certData.length > 0 && (
          <>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <div className={cn("flex items-center", currentSection !== 'certifications' && "opacity-50")}>
              <Award className="h-4 w-4 mr-1" />
              <span className="text-xs">Certifications</span>
            </div>
          </>
        )}
        {langData.length > 0 && (
          <>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <div className={cn("flex items-center", currentSection !== 'languages' && "opacity-50")}>
              <Globe className="h-4 w-4 mr-1" />
              <span className="text-xs">Languages</span>
            </div>
          </>
        )}
      </div>

      {/* Work Experience Section */}
      {currentSection === 'work' && (
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
                  Accept All & Continue
                </Button>
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
                    "p-4 border rounded-lg bg-white",
                    editingWork === index && "border-blue-300 bg-blue-50/50"
                  )}
                >
                  {editingWork === index ? (
                    <div className="space-y-3">
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
                        placeholder="Duration (e.g., 2020-2023)"
                        value={work.duration}
                        onChange={(e) => {
                          const updated = [...workData];
                          updated[index] = { ...updated[index], duration: e.target.value };
                          setWorkData(updated);
                        }}
                      />
                      <Textarea
                        placeholder="Description"
                        value={work.description || ''}
                        onChange={(e) => {
                          const updated = [...workData];
                          updated[index] = { ...updated[index], description: e.target.value };
                          setWorkData(updated);
                        }}
                        rows={3}
                      />
                      <Textarea
                        placeholder="Responsibilities (one per line)"
                        value={formatResponsibilities(work.responsibilities || work.achievements || [])}
                        onChange={(e) => {
                          const updated = [...workData];
                          const items = parseResponsibilities(e.target.value);
                          updated[index] = { 
                            ...updated[index], 
                            responsibilities: items,
                            achievements: items // Keep both in sync
                          };
                          setWorkData(updated);
                        }}
                        rows={4}
                      />
                      <Input
                        placeholder="Technologies (comma-separated)"
                        value={work.technologies?.join(', ') || ''}
                        onChange={(e) => {
                          const updated = [...workData];
                          updated[index] = { 
                            ...updated[index], 
                            technologies: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                          };
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
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{work.title}</p>
                          <p className="text-sm text-gray-600">{work.company}</p>
                          <p className="text-xs text-gray-500">{work.duration}</p>
                        </div>
                        {!acceptedSections.work && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleWorkEdit(index)}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      
                      {work.description && (
                        <p className="text-sm text-gray-700 mt-2">{work.description}</p>
                      )}
                      
                      {((work.responsibilities && work.responsibilities.length > 0) || 
                        (work.achievements && work.achievements.length > 0)) && (
                        <div className="mt-2">
                          <p className="text-xs font-medium text-gray-600 mb-1">
                            {work.responsibilities && work.responsibilities.length > 0 ? 'Responsibilities:' : 'Key Achievements:'}
                          </p>
                          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                            {(work.responsibilities && work.responsibilities.length > 0 
                              ? work.responsibilities 
                              : work.achievements
                            ).map((item, idx) => (
                              <li key={idx} className="text-xs">{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {work.technologies && work.technologies.length > 0 && (
                        <div className="mt-2 flex items-center gap-1 flex-wrap">
                          <Wrench className="h-3 w-3 text-gray-500" />
                          {work.technologies.map((tech, idx) => (
                            <span key={idx} className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                              {tech}
                            </span>
                          ))}
                        </div>
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
                  const newWork: WorkExperience = { 
                    title: '', 
                    company: '', 
                    duration: '',
                    responsibilities: [],
                    technologies: []
                  };
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
      )}

      {/* Education Section */}
      {currentSection === 'education' && (
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
                  Accept All & Continue
                </Button>
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
                        placeholder="Field of Study"
                        value={edu.fieldOfStudy || ''}
                        onChange={(e) => {
                          const updated = [...educationData];
                          updated[index] = { ...updated[index], fieldOfStudy: e.target.value };
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
                        <Button size="sm" variant="ghost" onClick={() => {
                          setEducationData(extractedData.education || []);
                          setEditingEducation(null);
                        }}>
                          Cancel
                        </Button>
                        <Button size="sm" variant="default" onClick={() => {
                          setEditingEducation(null);
                          onSectionUpdate('education', educationData);
                        }}>
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="font-medium text-sm">{edu.degree}</p>
                        {edu.fieldOfStudy && (
                          <p className="text-sm text-gray-600">{edu.fieldOfStudy}</p>
                        )}
                        <p className="text-sm text-gray-600">{edu.institution}</p>
                        <p className="text-xs text-gray-500">{edu.year}</p>
                      </div>
                      {!acceptedSections.education && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => setEditingEducation(index)}
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
      )}

      {/* Certifications Section */}
      {currentSection === 'certifications' && certData.length > 0 && (
        <Card className={cn("transition-all", acceptedSections.certifications && "border-green-500 bg-green-50/50")}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="h-4 w-4" />
                Certifications ({certData.length})
              </CardTitle>
              {!acceptedSections.certifications && (
                <Button size="sm" variant="default" onClick={() => handleAcceptSection('certifications')}>
                  <Check className="h-3 w-3 mr-1" />
                  Accept All & Continue
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {certData.map((cert, index) => (
              <motion.div
                key={index}
                layout
                className="p-3 border rounded-lg bg-white"
              >
                <div className="space-y-1">
                  <p className="font-medium text-sm">{cert.name}</p>
                  <p className="text-sm text-gray-600">{cert.issuer}</p>
                  <p className="text-xs text-gray-500">{cert.year}</p>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Languages Section */}
      {currentSection === 'languages' && langData.length > 0 && (
        <Card className={cn("transition-all", acceptedSections.languages && "border-green-500 bg-green-50/50")}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Languages ({langData.length})
              </CardTitle>
              {!acceptedSections.languages && (
                <Button size="sm" variant="default" onClick={() => handleAcceptSection('languages')}>
                  <Check className="h-3 w-3 mr-1" />
                  Accept All & Continue
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {langData.map((lang, index) => (
              <motion.div
                key={index}
                layout
                className="p-3 border rounded-lg bg-white flex justify-between items-center"
              >
                <span className="font-medium text-sm">{lang.language}</span>
                <span className="text-sm text-gray-600">{lang.proficiency}</span>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Completion State */}
      {currentSection === 'complete' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8"
        >
          <div className="mb-4">
            <Check className="h-12 w-12 text-green-500 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            All sections verified!
          </h3>
          <p className="text-sm text-gray-600">
            Your professional information has been saved. Let's continue to skills review...
          </p>
        </motion.div>
      )}
    </div>
  );
}