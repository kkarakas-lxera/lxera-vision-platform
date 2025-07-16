import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Trash2, Folder, Link as LinkIcon, Github } from 'lucide-react';

interface Project {
  id?: string;
  name: string;
  description: string;
  role: string;
  technologies: string[];
  projectUrl?: string;
  githubUrl?: string;
  startDate?: string;
  endDate?: string;
}

interface ProjectsSectionProps {
  data: Project[] | any;
  onSave: (data: any, isComplete: boolean) => void;
  saving: boolean;
}

export default function ProjectsSection({ data, onSave, saving }: ProjectsSectionProps) {
  const [projects, setProjects] = useState<Project[]>(
    Array.isArray(data) ? data : []
  );
  const [showForm, setShowForm] = useState(projects.length === 0);
  const [currentProject, setCurrentProject] = useState<Project>({
    name: '',
    description: '',
    role: '',
    technologies: [],
    projectUrl: '',
    githubUrl: '',
    startDate: '',
    endDate: ''
  });
  const [techInput, setTechInput] = useState('');

  const handleAddProject = () => {
    if (currentProject.name && currentProject.description && currentProject.role) {
      setProjects([...projects, { ...currentProject, id: Date.now().toString() }]);
      setCurrentProject({
        name: '',
        description: '',
        role: '',
        technologies: [],
        projectUrl: '',
        githubUrl: '',
        startDate: '',
        endDate: ''
      });
      setShowForm(false);
    }
  };

  const handleRemoveProject = (id: string) => {
    setProjects(projects.filter(proj => proj.id !== id));
  };

  const handleAddTechnology = () => {
    if (techInput && !currentProject.technologies.includes(techInput)) {
      setCurrentProject({
        ...currentProject,
        technologies: [...currentProject.technologies, techInput]
      });
      setTechInput('');
    }
  };

  const handleRemoveTechnology = (tech: string) => {
    setCurrentProject({
      ...currentProject,
      technologies: currentProject.technologies.filter(t => t !== tech)
    });
  };

  const handleSave = () => {
    onSave(projects, true); // Always complete if they save
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">
        Showcase projects that demonstrate your skills and experience
      </p>

      {/* Existing projects */}
      {projects.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium">Your Projects</h3>
          {projects.map((project) => (
            <Card key={project.id} className="p-4">
              <div className="flex justify-between">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <Folder className="h-5 w-5 text-blue-600 mt-1" />
                    <div className="flex-1">
                      <h4 className="font-medium">{project.name}</h4>
                      <p className="text-sm text-gray-600 mb-1">{project.role}</p>
                      <p className="text-sm text-gray-700 mb-2">{project.description}</p>
                      
                      {project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {project.technologies.map((tech) => (
                            <Badge key={tech} variant="secondary" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm">
                        {project.projectUrl && (
                          <a 
                            href={project.projectUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:underline"
                          >
                            <LinkIcon className="h-3 w-3" />
                            View Project
                          </a>
                        )}
                        {project.githubUrl && (
                          <a 
                            href={project.githubUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-gray-700 hover:underline"
                          >
                            <Github className="h-3 w-3" />
                            GitHub
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveProject(project.id!)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add new project form */}
      {showForm ? (
        <Card className="p-4">
          <h3 className="font-medium mb-4">Add Project</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="projectName">Project Name *</Label>
              <Input
                id="projectName"
                value={currentProject.name}
                onChange={(e) => setCurrentProject({ ...currentProject, name: e.target.value })}
                placeholder="E-commerce Platform"
              />
            </div>

            <div>
              <Label htmlFor="role">Your Role *</Label>
              <Input
                id="role"
                value={currentProject.role}
                onChange={(e) => setCurrentProject({ ...currentProject, role: e.target.value })}
                placeholder="Lead Developer"
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={currentProject.description}
                onChange={(e) => setCurrentProject({ ...currentProject, description: e.target.value })}
                placeholder="Built a scalable e-commerce platform serving 10k+ users..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="technologies">Technologies Used</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    id="technologies"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    placeholder="e.g., React, Node.js, AWS"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTechnology())}
                  />
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={handleAddTechnology}
                    disabled={!techInput}
                  >
                    Add
                  </Button>
                </div>
                {currentProject.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {currentProject.technologies.map((tech) => (
                      <Badge key={tech} variant="secondary" className="text-xs">
                        {tech}
                        <button
                          onClick={() => handleRemoveTechnology(tech)}
                          className="ml-1 text-gray-500 hover:text-gray-700"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="projectUrl">Project URL</Label>
                <Input
                  id="projectUrl"
                  type="url"
                  value={currentProject.projectUrl}
                  onChange={(e) => setCurrentProject({ ...currentProject, projectUrl: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <Label htmlFor="githubUrl">GitHub URL</Label>
                <Input
                  id="githubUrl"
                  type="url"
                  value={currentProject.githubUrl}
                  onChange={(e) => setCurrentProject({ ...currentProject, githubUrl: e.target.value })}
                  placeholder="https://github.com/username/repo"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddProject}>
                Add Project
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
          Add Project
        </Button>
      )}

      <div className="flex justify-end gap-2">
        {projects.length === 0 && (
          <Button 
            variant="outline" 
            onClick={() => onSave([], true)}
          >
            Skip This Section
          </Button>
        )}
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save & Continue
        </Button>
      </div>
    </div>
  );
}