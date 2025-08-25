import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, ChevronRight, ChevronDown, Plus, Trash2, Save, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WorkExperience {
  title: string;
  company: string;
  duration: string;
  description?: string;
}

interface WorkExperienceFormProps {
  onComplete: (data: WorkExperience[]) => void;
  initialData?: any[];
  editIndex?: number;
  onSaveAll?: (data: WorkExperience[]) => void;
  onMarkCurrent?: (item: WorkExperience) => void;
}

export default function WorkExperienceForm({ onComplete, initialData, editIndex, onSaveAll, onMarkCurrent }: WorkExperienceFormProps) {
  const [workData, setWorkData] = useState<WorkExperience[]>(() => {
    if (initialData && initialData.length > 0) {
      return initialData.map(item => ({
        title: item.title || '',
        company: item.company || '',
        duration: item.duration || '',
        description: item.description || ''
      }));
    }
    return [];
  });
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set([0]));
  const fromCV = initialData && initialData.length > 0;
  
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

  const updateWork = (index: number, field: keyof WorkExperience, value: string) => {
    const updated = [...workData];
    updated[index] = { ...updated[index], [field]: value };
    setWorkData(updated);
  };

  const addWork = () => {
    setWorkData([...workData, { title: '', company: '', duration: '', description: '' }]);
    setExpandedItems(prev => new Set(prev).add(workData.length));
  };

  const removeWork = (index: number) => {
    setWorkData(workData.filter((_, i) => i !== index));
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  };

  const isValid = workData.some(work => work.title && work.company);

  // Auto-update parent when data changes
  useEffect(() => {
    const validWork = workData.filter(work => work.title && work.company);
    onComplete(validWork);
  }, [workData, onComplete]);

  return (
    <Card className="transition-all border-0 shadow-sm">
      <CardHeader className="py-3 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5" />
            Work Experience
          </CardTitle>
          <span className="text-xs text-gray-500">
            {fromCV ? 'AI-filled from CV' : 'Add your last 3 positions'}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 px-4 pb-4">
        {workData.length === 0 ? (
          <div className="text-center py-8">
            <Briefcase className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm text-gray-500 mb-3">No work experiences added yet</p>
            <Button
              size="sm"
              variant="outline"
              onClick={addWork}
              className="text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add First Work Experience
            </Button>
          </div>
        ) : (
          <>
            <AnimatePresence mode="popLayout">
              {workData.map((work, index) => (
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
                          {work.title || work.company ? (
                            <>
                              <p className="font-medium text-sm">{work.title || 'Position'}</p>
                              <p className="text-xs text-gray-600">
                                {work.company || 'Company'} {work.duration && `• ${work.duration}`}
                              </p>
                            </>
                          ) : (
                            <p className="text-sm text-gray-500">Position {index + 1}</p>
                          )}
                        </div>
                      </button>
                      {workData.length > 1 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeWork(index)}
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
                            <div>
                              <label className="text-xs font-medium text-gray-700 mb-1 block">Job Title</label>
                              <Input
                                placeholder="e.g., Senior Software Engineer"
                                value={work.title}
                                onChange={(e) => updateWork(index, 'title', e.target.value)}
                                className="text-sm"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-700 mb-1 block">Company Name</label>
                              <Input
                                placeholder="e.g., Google, Microsoft"
                                value={work.company}
                                onChange={(e) => updateWork(index, 'company', e.target.value)}
                                className="text-sm"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-700 mb-1 block">Duration</label>
                              <select
                                className="w-full px-3 py-2 border rounded-md text-sm"
                                value={work.duration}
                                onChange={(e) => updateWork(index, 'duration', e.target.value)}
                                title="Select duration"
                              >
                                <option value="">Select Duration</option>
                                <option value="Current">Current Position</option>
                                <option value="< 1 year">Less than 1 year</option>
                                <option value="1-2 years">1-2 years</option>
                                <option value="2-3 years">2-3 years</option>
                                <option value="3-5 years">3-5 years</option>
                                <option value="5-10 years">5-10 years</option>
                                <option value="10+ years">10+ years</option>
                              </select>
                              {work.duration && !['Current', '< 1 year', '1-2 years', '2-3 years', '3-5 years', '5-10 years', '10+ years'].includes(work.duration) && (
                                <p className="text-xs text-amber-600 mt-1">Original: {work.duration}</p>
                              )}
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-700 mb-1 block">Description</label>
                              <textarea
                                placeholder="Describe your responsibilities and achievements..."
                                value={work.description || ''}
                                onChange={(e) => updateWork(index, 'description', e.target.value)}
                                className="w-full px-3 py-2 border rounded-md text-sm resize-none"
                                rows={3}
                              />
                            </div>
                            <div className="flex items-center gap-2 pt-1">
                              <Button size="sm" variant="outline" onClick={() => onSaveAll?.(workData)}>
                                <Save className="h-3.5 w-3.5 mr-2" /> Save this job
                              </Button>
                              <Button size="sm" variant="secondary" onClick={() => onMarkCurrent?.(work)}>
                                <Star className="h-3.5 w-3.5 mr-2" /> Set as current position
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {workData.length < 5 && (
              <Button
                size="sm"
                variant="outline"
                className="w-full h-9 text-xs"
                onClick={addWork}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Another Position
              </Button>
            )}
          </>
        )}

      </CardContent>
    </Card>
  );
}