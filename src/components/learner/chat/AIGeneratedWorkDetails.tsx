import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, ChevronRight, ChevronDown, Check, Edit2, Save, X, Plus, Wrench, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface WorkExperience {
  title: string;
  company: string;
  duration: string;
  responsibilities?: string[];
  achievements?: string[];
  technologies?: string[];
}

interface AIGeneratedWorkDetailsProps {
  workData: WorkExperience[];
  onAccept: (data: WorkExperience[]) => void;
  onUpdate: (data: WorkExperience[]) => void;
  onRegenerate?: (workIndex: number, additionalContext: string) => void;
}

export default function AIGeneratedWorkDetails({ 
  workData: initialData, 
  onAccept,
  onUpdate,
  onRegenerate 
}: AIGeneratedWorkDetailsProps) {
  const [workData, setWorkData] = useState<WorkExperience[]>(initialData);
  
  // Update workData when initialData changes
  React.useEffect(() => {
    setWorkData(initialData);
    // Reset selected responsibilities when data changes
    setSelectedResponsibilities(
      new Map(initialData.map((work, index) => [
        index, 
        new Set(work.responsibilities?.map((_, i) => i) || [])
      ]))
    );
  }, [initialData]);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [editingWork, setEditingWork] = useState<number | null>(null);
  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null);
  const [regenerateContext, setRegenerateContext] = useState('');
  const [selectedResponsibilities, setSelectedResponsibilities] = useState<Map<number, Set<number>>>(
    new Map(workData.map((work, index) => [
      index, 
      new Set(work.responsibilities?.map((_, i) => i) || [])
    ]))
  );

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

  const toggleResponsibility = (workIndex: number, respIndex: number) => {
    setSelectedResponsibilities(prev => {
      const newMap = new Map(prev);
      const workSet = newMap.get(workIndex) || new Set();
      if (workSet.has(respIndex)) {
        workSet.delete(respIndex);
      } else {
        workSet.add(respIndex);
      }
      newMap.set(workIndex, workSet);
      return newMap;
    });
  };

  const handleWorkEdit = (index: number) => {
    setEditingWork(index);
    setExpandedItems(prev => new Set(prev).add(index));
  };

  const handleWorkSave = (index: number) => {
    setEditingWork(null);
    onUpdate(workData);
  };

  const handleWorkCancel = (index: number) => {
    setWorkData(initialData);
    setEditingWork(null);
  };

  const formatResponsibilities = (resp: string[]) => {
    if (!resp || resp.length === 0) return '';
    return resp.join('\n');
  };

  const parseResponsibilities = (text: string): string[] => {
    return text.split('\n').filter(line => line.trim()).map(line => line.trim());
  };

  const handleAcceptAll = () => {
    // Filter responsibilities based on selection
    const finalData = workData.map((work, workIndex) => {
      const selectedResp = selectedResponsibilities.get(workIndex) || new Set();
      return {
        ...work,
        responsibilities: work.responsibilities?.filter((_, i) => selectedResp.has(i)) || []
      };
    });
    onAccept(finalData);
  };

  return (
    <Card className="transition-all border-0 shadow-sm">
      <CardHeader className="py-3 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5" />
            Review AI-Generated Details
          </CardTitle>
          <Button size="sm" variant="default" onClick={handleAcceptAll} className="h-7 text-xs">
            <Check className="h-3 w-3 mr-1" />
            Accept & Continue
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 px-4 pb-4">
        <div className="text-xs text-gray-600 mb-3">
          Select the responsibilities that apply to your roles. You can edit or add more.
        </div>
        
        <AnimatePresence mode="popLayout">
          {workData.map((work, index) => (
            <motion.div
              key={index}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={cn(
                "p-3 border rounded-md bg-white",
                editingWork === index && "border-blue-300 bg-blue-50/50"
              )}
            >
              {editingWork === index ? (
                <div className="space-y-3">
                  <div className="text-sm font-medium mb-2">
                    {work.title} at {work.company}
                  </div>
                  <Textarea
                    placeholder="Responsibilities (one per line)"
                    value={formatResponsibilities(work.responsibilities || [])}
                    onChange={(e) => {
                      const updated = [...workData];
                      const items = parseResponsibilities(e.target.value);
                      updated[index] = { 
                        ...updated[index], 
                        responsibilities: items,
                        achievements: items
                      };
                      setWorkData(updated);
                    }}
                    rows={6}
                    className="text-sm"
                  />
                  <Input
                    placeholder="Technologies used (comma-separated)"
                    value={work.technologies?.join(', ') || ''}
                    onChange={(e) => {
                      const updated = [...workData];
                      updated[index] = { 
                        ...updated[index], 
                        technologies: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                      };
                      setWorkData(updated);
                    }}
                    className="text-sm"
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
                    <button
                      onClick={() => toggleExpanded(index)}
                      className="flex-1 text-left group"
                    >
                      <div className="flex items-start gap-2">
                        <div className="mt-1">
                          {expandedItems.has(index) ? (
                            <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{work.title}</p>
                          <p className="text-xs text-gray-600">{work.company} • {work.duration}</p>
                        </div>
                      </div>
                    </button>
                    <div className="flex gap-1">
                      {onRegenerate && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => setRegeneratingIndex(index)}
                          title="Regenerate with more context"
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleWorkEdit(index)}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    </div>
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
                        <div className="pl-6 space-y-2">
                          {work.responsibilities && work.responsibilities.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-gray-600 mb-2">
                                Select applicable responsibilities:
                              </p>
                              <div className="space-y-2">
                                {work.responsibilities.map((resp, respIndex) => (
                                  <label
                                    key={respIndex}
                                    className="flex items-start gap-3 p-2.5 rounded-md border border-transparent hover:border-gray-200 hover:bg-gray-50 cursor-pointer transition-all"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={selectedResponsibilities.get(index)?.has(respIndex) || false}
                                      onChange={() => toggleResponsibility(index, respIndex)}
                                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-xs text-gray-700 flex-1 leading-relaxed">{resp}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {work.technologies && work.technologies.length > 0 && (
                            <div className="flex items-center gap-1 flex-wrap pt-2">
                              <Wrench className="h-3 w-3 text-gray-500" />
                              {work.technologies.map((tech, idx) => (
                                <span key={idx} className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
              
              {/* Regenerate Dialog */}
              {regeneratingIndex === index && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 p-3 bg-blue-50 rounded-md border border-blue-200"
                >
                  <p className="text-xs text-gray-700 mb-2">
                    Tell me more about your role to generate better suggestions:
                  </p>
                  <Textarea
                    value={regenerateContext}
                    onChange={(e) => setRegenerateContext(e.target.value)}
                    placeholder="e.g., I led a team of 5 engineers and focused on building microservices..."
                    className="text-sm mb-2"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setRegeneratingIndex(null);
                        setRegenerateContext('');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        if (onRegenerate && regenerateContext.trim()) {
                          onRegenerate(index, regenerateContext);
                          setRegeneratingIndex(null);
                          setRegenerateContext('');
                        }
                      }}
                      disabled={!regenerateContext.trim()}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Regenerate
                    </Button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}