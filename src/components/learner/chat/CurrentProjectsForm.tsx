import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CurrentProjectsFormProps {
  onComplete: (data: { projects: string[]; teamSize?: string; roleInTeam?: string }) => void;
  initialData?: { projects?: string[]; teamSize?: string; roleInTeam?: string };
}

export default function CurrentProjectsForm({ onComplete, initialData }: CurrentProjectsFormProps) {
  const [projects, setProjects] = useState<string[]>(
    initialData?.projects?.length ? initialData.projects : ['']
  );
  const [teamSize, setTeamSize] = useState(initialData?.teamSize || '');
  const [roleInTeam, setRoleInTeam] = useState(initialData?.roleInTeam || '');

  const updateProject = (index: number, value: string) => {
    const updated = [...projects];
    updated[index] = value;
    setProjects(updated);
  };

  const addProject = () => {
    setProjects([...projects, '']);
  };

  const removeProject = (index: number) => {
    if (projects.length > 1) {
      setProjects(projects.filter((_, i) => i !== index));
    }
  };

  const isValid = projects.some(p => p.trim().length > 0);

  // Auto-update parent when data changes
  useEffect(() => {
    const validProjects = projects.filter(p => p.trim().length > 0);
    onComplete({ projects: validProjects, teamSize, roleInTeam });
  }, [projects, teamSize, roleInTeam, onComplete]);

  return (
    <Card className="transition-all border-0 shadow-sm">
      <CardHeader className="py-3 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-1.5">
            <Folder className="h-3.5 w-3.5" />
            Current Projects
          </CardTitle>
          <span className="text-xs text-gray-500">
            Tell us what you're working on
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 px-4 pb-4">
        {projects.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Folder className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm mb-3">No projects added yet</p>
            <Button
              size="sm"
              variant="outline"
              onClick={addProject}
              className="text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Your First Project
            </Button>
          </div>
        ) : (
          <>
            <AnimatePresence mode="popLayout">
              {projects.map((project, index) => (
                <motion.div
                  key={index}
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="relative group"
                >
                  <div className="flex items-start gap-2">
                    <div className="mt-2 opacity-0 group-hover:opacity-30 transition-opacity cursor-move">
                      <GripVertical className="h-4 w-4 text-gray-400" />
                    </div>
                    <textarea
                      className="flex-1 min-h-[80px] p-3 border rounded-md resize-none text-sm"
                      placeholder="Describe a project or responsibility you're currently working on..."
                      value={project}
                      onChange={(e) => updateProject(index, e.target.value)}
                    />
                    {projects.length > 1 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeProject(index)}
                        className="mt-2 h-8 w-8 p-0"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-gray-400" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {projects.length < 5 && (
              <Button
                size="sm"
                variant="outline"
                onClick={addProject}
                className="w-full h-9 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Another Project
              </Button>
            )}

            {/* Team context fields */}
            <div className="mt-4 pt-4 border-t space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">
                  Team Size
                </label>
                <select
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  value={teamSize}
                  onChange={(e) => setTeamSize(e.target.value)}
                  title="Select team size"
                >
                  <option value="">Select team size</option>
                  <option value="Working alone">Working alone</option>
                  <option value="2-5 people">2-5 people</option>
                  <option value="6-10 people">6-10 people</option>
                  <option value="10+ people">10+ people</option>
                </select>
              </div>
              
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">
                  Your Role
                </label>
                <select
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  value={roleInTeam}
                  onChange={(e) => setRoleInTeam(e.target.value)}
                  title="Select your role"
                >
                  <option value="">Select your role</option>
                  <option value="Individual Contributor">Individual Contributor</option>
                  <option value="Team Lead">Team Lead</option>
                  <option value="Manager">Manager</option>
                </select>
              </div>
            </div>
          </>
        )}

      </CardContent>
    </Card>
  );
}