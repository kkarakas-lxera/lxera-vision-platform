import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, X, Search, ArrowRight, ArrowLeft, CheckCircle, Lightbulb, Sparkles, ChevronLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AISkillSuggestions } from '@/components/dashboard/PositionManagement/AISkillSuggestions';
import { parseSkillsArray } from '@/utils/typeGuards';

interface SkillSelection {
  skill_id: string;
  skill_name: string;
  proficiency_level: number;
  description?: string;
  reason?: string;
  source?: 'database' | 'ai';
  category?: 'essential' | 'important';
  skill_group?: 'technical' | 'soft' | 'leadership' | 'tools' | 'industry';
}

interface PositionData {
  position_title: string;
  position_code: string;
  position_level: string;
  department: string;
  description: string;
  required_skills: SkillSelection[];
  ai_suggestions?: any[];
  admin_approved?: boolean;
  description_fully_read?: boolean;
}

export default function PositionCreate() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [skillSearchTerm, setSkillSearchTerm] = useState('');
  const [availableSkills, setAvailableSkills] = useState<any[]>([]);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<Record<number, 'pending' | 'processing' | 'completed' | 'error'>>({});
  const [expandedPositions, setExpandedPositions] = useState<Set<number>>(new Set([0]));
  const [loadingMessages, setLoadingMessages] = useState<{[key: number]: string}>({});
  const [expandedSkills, setExpandedSkills] = useState<{[key: string]: boolean}>({});
  const [groupedSkills, setGroupedSkills] = useState<{[key: number]: {[group: string]: any[]}}>({});
  const [processingProgress, setProcessingProgress] = useState<{[key: number]: number}>({});
  const [processingStartTime, setProcessingStartTime] = useState<{[key: number]: number}>({});
  const [expandedCategories, setExpandedCategories] = useState<{[key: string]: boolean}>({});
  const [collapsedPositions, setCollapsedPositions] = useState<Set<number>>(new Set());
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const descriptionEndRef = useRef<HTMLDivElement>(null);
  const [hasScrolledDescription, setHasScrolledDescription] = useState(false);

  const [positions, setPositions] = useState<PositionData[]>([{
    position_title: '',
    position_code: '',
    position_level: '',
    department: '',
    description: '',
    required_skills: [],
    ai_suggestions: [],
    admin_approved: false,
    description_fully_read: false
  }]);
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
  
  const positionData = positions[currentPositionIndex];
  const setPositionData = (data: PositionData | ((prev: PositionData) => PositionData)) => {
    setPositions(prev => {
      const newPositions = [...prev];
      if (typeof data === 'function') {
        newPositions[currentPositionIndex] = data(newPositions[currentPositionIndex]);
      } else {
        newPositions[currentPositionIndex] = data;
      }
      return newPositions;
    });
  };

  const steps = [
    { number: 1, title: 'Basic Information', description: 'Position details' },
    { number: 2, title: 'Add Required Skills', description: 'Define skill requirements' },
    { number: 3, title: 'Confirmation', description: 'Review and confirm' }
  ];

  const addNewPosition = () => {
    const newPosition: PositionData = {
      position_title: '',
      position_code: '',
      position_level: positionData.position_level || '',
      department: positionData.department || '',
      description: '',
      required_skills: [],
      ai_suggestions: [],
      admin_approved: false,
      description_fully_read: false
    };
    setPositions(prev => [...prev, newPosition]);
    setCurrentPositionIndex(positions.length);
    setCurrentStep(1);
  };

  const switchToPosition = (index: number) => {
    setCurrentPositionIndex(index);
  };

  const removePosition = (index: number) => {
    if (positions.length === 1) return;
    setPositions(prev => prev.filter((_, i) => i !== index));
    if (currentPositionIndex >= index && currentPositionIndex > 0) {
      setCurrentPositionIndex(currentPositionIndex - 1);
    }
  };

  const togglePositionExpanded = (index: number) => {
    setExpandedPositions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const generateSkillsForPosition = async (positionIndex: number) => {
    const position = positions[positionIndex];
    if (!position.position_title) return;

    // Collapse other positions during processing
    setCollapsedPositions(prev => {
      const newSet = new Set(prev);
      positions.forEach((_, index) => {
        if (index !== positionIndex) newSet.add(index);
      });
      return newSet;
    });

    setProcessingStatus(prev => ({ ...prev, [positionIndex]: 'processing' }));
    setProcessingStartTime(prev => ({ ...prev, [positionIndex]: Date.now() }));
    setProcessingProgress(prev => ({ ...prev, [positionIndex]: 0 }));
    
    // Real-time progress tracking
    const updateProgress = (progress: number, message: string) => {
      setProcessingProgress(prev => ({ ...prev, [positionIndex]: progress }));
      setLoadingMessages(prev => ({ ...prev, [positionIndex]: message }));
    };

    try {
      updateProgress(10, '🔍 Searching skills database...');
      
      // Simulate real API stages with actual timing
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          const current = prev[positionIndex] || 0;
          if (current < 75) {
            return { ...prev, [positionIndex]: current + 5 };
          }
          return prev;
        });
      }, 200);

      setTimeout(() => updateProgress(30, '🤖 AI analyzing position requirements...'), 500);
      setTimeout(() => updateProgress(50, '📊 Categorizing and scoring skills...'), 1200);
      setTimeout(() => updateProgress(75, '⚡ Finalizing recommendations...'), 2000);

      const { data, error } = await supabase.functions.invoke('suggest-position-skills-enhanced', {
        body: {
          position_title: position.position_title,
          position_description: position.description,
          position_level: position.position_level,
          department: position.department
        }
      });

      clearInterval(progressInterval);
      updateProgress(100, '✅ Complete!');

      if (error) throw error;

      if (data.skills) {
        const newSkills = data.skills.map((skill: any) => ({
          skill_id: skill.skill_id || `ai_${Date.now()}_${Math.random()}`,
          skill_name: skill.skill_name,
          proficiency_level: skill.proficiency_level === 'basic' ? 1 :
                            skill.proficiency_level === 'intermediate' ? 2 :
                            skill.proficiency_level === 'advanced' ? 3 : 4,
          description: skill.description,
          reason: skill.reason,
          source: skill.source,
          category: skill.category,
          skill_group: skill.skill_group || categorizeSkill(skill.skill_name)
        }));

        // Group skills by category
        const grouped = groupSkillsByCategory(newSkills);
        setGroupedSkills(prev => ({ ...prev, [positionIndex]: grouped }));

        setPositions(prev => {
          const newPositions = [...prev];
          newPositions[positionIndex] = {
            ...newPositions[positionIndex],
            required_skills: newSkills,
            ai_suggestions: data.skills
          };
          return newPositions;
        });

        setProcessingStatus(prev => ({ ...prev, [positionIndex]: 'completed' }));
        setLoadingMessages(prev => ({ ...prev, [positionIndex]: '' }));
      }
    } catch (error) {
      console.error('Error generating skills for position:', error);
      setProcessingStatus(prev => ({ ...prev, [positionIndex]: 'error' }));
      setLoadingMessages(prev => ({ ...prev, [positionIndex]: '' }));
    }
  };

  const categorizeSkill = (skillName: string): string => {
    const name = skillName.toLowerCase();
    
    if (name.includes('leadership') || name.includes('management') || name.includes('team') || name.includes('mentor')) {
      return 'leadership';
    }
    if (name.includes('communication') || name.includes('collaboration') || name.includes('problem') || name.includes('analytical')) {
      return 'soft';
    }
    if (name.includes('programming') || name.includes('development') || name.includes('coding') || name.includes('software')) {
      return 'technical';
    }
    if (name.includes('tool') || name.includes('platform') || name.includes('software') || name.includes('system')) {
      return 'tools';
    }
    
    return 'industry';
  };

  const groupSkillsByCategory = (skills: SkillSelection[]) => {
    const groups: {[key: string]: SkillSelection[]} = {};
    
    skills.forEach(skill => {
      const group = skill.skill_group || categorizeSkill(skill.skill_name);
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(skill);
    });
    
    return groups;
  };

  const getGroupIcon = (group: string) => {
    switch (group) {
      case 'technical': return '⚙️';
      case 'soft': return '🤝';
      case 'leadership': return '👑';
      case 'tools': return '🛠️';
      case 'industry': return '🏢';
      default: return '📝';
    }
  };

  const getGroupLabel = (group: string) => {
    switch (group) {
      case 'technical': return 'Technical Skills';
      case 'soft': return 'Soft Skills';
      case 'leadership': return 'Leadership Skills';
      case 'tools': return 'Tools & Platforms';
      case 'industry': return 'Industry Knowledge';
      default: return 'Other Skills';
    }
  };

  const toggleSkillExpanded = (skillId: string) => {
    setExpandedSkills(prev => ({
      ...prev,
      [skillId]: !prev[skillId]
    }));
  };

  const toggleCategoryExpanded = (positionIndex: number, category: string) => {
    const key = `${positionIndex}-${category}`;
    setExpandedCategories(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const isCategoryExpanded = (positionIndex: number, category: string) => {
    const key = `${positionIndex}-${category}`;
    return expandedCategories[key] ?? true; // Default to expanded
  };

  const togglePositionCollapsed = (positionIndex: number) => {
    setCollapsedPositions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(positionIndex)) {
        newSet.delete(positionIndex);
      } else {
        newSet.add(positionIndex);
      }
      return newSet;
    });
  };

  const getProcessingTime = (positionIndex: number) => {
    const startTime = processingStartTime[positionIndex];
    if (!startTime) return '';
    const elapsed = (Date.now() - startTime) / 1000;
    return `(${elapsed.toFixed(1)}s)`;
  };

  const startBatchProcessing = async () => {
    const positionsToProcess = positions
      .map((_, index) => index)
      .filter(index => positions[index].position_title && !positions[index].required_skills.length);

    for (const index of positionsToProcess) {
      await generateSkillsForPosition(index);
      // Small delay between requests to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  // Start batch processing when entering step 2
  useEffect(() => {
    if (currentStep === 2) {
      startBatchProcessing();
    }
  }, [currentStep]);

  // Helper functions for processing status
  const getProcessingStats = () => {
    const completed = Object.values(processingStatus).filter(status => status === 'completed').length;
    const processing = Object.values(processingStatus).filter(status => status === 'processing').length;
    const total = positions.filter(p => p.position_title).length;
    return { completed, processing, total };
  };

  const getPositionStatus = (index: number) => {
    const position = positions[index];
    if (!position.position_title) return 'empty';
    if (position.required_skills.length > 0) return 'completed';
    return processingStatus[index] || 'pending';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✓';
      case 'processing': return '🔄';
      case 'error': return '❌';
      case 'pending': return '⏸';
      case 'empty': return '○';
      default: return '○';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'processing': return 'text-orange-600';
      case 'error': return 'text-red-600';
      case 'pending': return 'text-gray-500';
      case 'empty': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  // Generate position code from title
  const generatePositionCode = (title: string) => {
    return title
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 20);
  };

  // Generate AI description
  const generateDescription = async () => {
    if (!positionData.position_title || isGeneratingDescription) return;

    setIsGeneratingDescription(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-position-description', {
        body: {
          position_title: positionData.position_title,
          position_level: positionData.position_level,
          department: positionData.department
        }
      });

      if (error) throw error;

      if (data.description) {
        setPositionData(prev => ({
          ...prev,
          description: data.description
        }));
        toast.success('Description generated successfully! You can edit it as needed.');
      }
    } catch (error) {
      console.error('Error generating description:', error);
      toast.error('Failed to generate description. Please try again.');
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  // Auto-generate description when title, level, and department are filled
  useEffect(() => {
    const timer = setTimeout(() => {
      if (positionData.position_title && 
          (positionData.position_level || positionData.department) && 
          !positionData.description && 
          !isGeneratingDescription) {
        generateDescription();
      }
    }, 2000); // 2 second delay

    return () => clearTimeout(timer);
  }, [positionData.position_title, positionData.position_level, positionData.department]);

  useEffect(() => {
    // When description changes, reset the fully read status
    setPositionData(prev => ({ ...prev, description_fully_read: false }));
    setHasScrolledDescription(false);
  }, [positionData.description]);

  const fetchSkills = async () => {
    setLoadingSkills(true);
    try {
      const { data, error } = await supabase
        .from('st_skills_taxonomy')
        .select('skill_id, skill_name, description')
        .order('skill_name');

      if (error) throw error;
      setAvailableSkills(data || []);
    } catch (error) {
      console.error('Error fetching skills:', error);
      toast.error('Failed to load skills database');
    } finally {
      setLoadingSkills(false);
    }
  };

  const handleDescriptionScroll = () => {
    if (descriptionRef.current && !hasScrolledDescription) {
      const { scrollTop, scrollHeight, clientHeight } = descriptionRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
      
      if (isAtBottom) {
        setHasScrolledDescription(true);
        setPositionData(prev => ({ ...prev, description_fully_read: true }));
      }
    }
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateBasicInfo()) {
      return;
    }
    if (currentStep === 2 && positionData.required_skills.length === 0) {
      toast.error('Please add at least one required skill');
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const validateBasicInfo = () => {
    if (!positionData.position_title) {
      toast.error('Please enter a position title');
      return false;
    }
    if (!positionData.position_code) {
      toast.error('Please enter a position code');
      return false;
    }
    if (!positionData.position_level) {
      toast.error('Please select a position level');
      return false;
    }
    if (!positionData.department) {
      toast.error('Please select a department');
      return false;
    }
    if (!positionData.description) {
      toast.error('Please enter a position description');
      return false;
    }
    if (!positionData.description_fully_read && positionData.description.length > 100) {
      toast.error('Please read through the entire position description');
      descriptionRef.current?.focus();
      return false;
    }
    return true;
  };

  const addSkill = (skill: any) => {
    if (positionData.required_skills.find(s => s.skill_id === skill.skill_id)) {
      toast.error('Skill already added');
      return;
    }

    const newSkill: SkillSelection = {
      skill_id: skill.skill_id,
      skill_name: skill.skill_name,
      proficiency_level: 3,
      description: skill.description
    };

    setPositionData({
      ...positionData,
      required_skills: [...positionData.required_skills, newSkill]
    });
    setSkillSearchTerm('');
  };

  const removeSkill = (skillId: string) => {
    setPositionData({
      ...positionData,
      required_skills: positionData.required_skills.filter(s => s.skill_id !== skillId)
    });
  };

  const updateSkillProficiency = (skillId: string, level: number) => {
    setPositionData({
      ...positionData,
      required_skills: positionData.required_skills.map(s => 
        s.skill_id === skillId ? { ...s, proficiency_level: level } : s
      )
    });
  };

  const handleSave = async () => {
    if (!userProfile?.company_id) {
      toast.error('Company ID not found');
      return;
    }

    setIsLoading(true);
    try {
      const positionsToInsert = positions.map(position => {
        const skillsData = position.required_skills.map(skill => ({
          skill_id: skill.skill_id,
          skill_name: skill.skill_name,
          proficiency_level: skill.proficiency_level,
          is_mandatory: true
        }));

        const aiSuggestionsData = position.ai_suggestions?.map(skill => ({
          skill_id: skill.skill_id,
          skill_name: skill.skill_name,
          proficiency_level: skill.proficiency_level || 3,
          is_mandatory: false
        })) || [];

        return {
          company_id: userProfile.company_id,
          position_code: position.position_code,
          position_title: position.position_title,
          position_level: position.position_level,
          department: position.department,
          description: position.description,
          required_skills: skillsData,
          nice_to_have_skills: [],
          ai_suggestions: aiSuggestionsData,
          is_template: false
        };
      });

      const { error } = await supabase
        .from('st_company_positions')
        .insert(positionsToInsert);

      if (error) throw error;

      toast.success(`${positions.length} position${positions.length > 1 ? 's' : ''} created successfully!`);
      navigate('/dashboard/positions');
    } catch (error) {
      console.error('Error creating positions:', error);
      toast.error('Failed to create positions');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSkills = availableSkills.filter(skill =>
    skill.skill_name.toLowerCase().includes(skillSearchTerm.toLowerCase())
  ).slice(0, 10);

  const handleAISuggestions = (suggestions: any[]) => {
    setPositionData({
      ...positionData,
      ai_suggestions: suggestions
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard/positions')}
          className="mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Positions
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Create Positions</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Position {currentPositionIndex + 1} of {positions.length}
            </p>
          </div>
          <Button onClick={addNewPosition} variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Position
          </Button>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    currentStep > step.number
                      ? 'bg-primary border-primary text-primary-foreground'
                      : currentStep === step.number
                      ? 'border-primary text-primary'
                      : 'border-gray-300 text-gray-400'
                  }`}
                >
                  {currentStep > step.number ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    step.number
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.number ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`mx-4 h-0.5 w-20 transition-colors ${
                    currentStep > step.number ? 'bg-primary' : 'bg-gray-300'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Position Navigation */}
      {positions.length > 1 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 overflow-x-auto">
            {positions.map((position, index) => (
              <div
                key={index}
                onClick={() => switchToPosition(index)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer min-w-0 ${
                  index === currentPositionIndex
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-sm font-medium">
                  {index + 1}.
                </span>
                <span 
                  className="text-sm truncate cursor-pointer hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    switchToPosition(index);
                    setCurrentStep(1);
                  }}
                >
                  {position.position_title || 'Untitled Position'}
                </span>
                {position.position_title && position.required_skills.length > 0 && (
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                )}
                {positions.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removePosition(index);
                    }}
                    className="h-4 w-4 p-0 hover:bg-red-100"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <Card>
        <CardContent className="p-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="position_title">Position Title*</Label>
                  <Input
                    id="position_title"
                    value={positionData.position_title}
                    onChange={(e) => {
                      const title = e.target.value;
                      setPositionData(prev => ({
                        ...prev,
                        position_title: title,
                        position_code: generatePositionCode(title)
                      }));
                    }}
                    placeholder="e.g., Senior Software Engineer"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position_code">Position Code*</Label>
                  <Input
                    id="position_code"
                    value={positionData.position_code}
                    onChange={(e) => setPositionData({ ...positionData, position_code: e.target.value })}
                    placeholder="e.g., ENG-SR-001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="position_level">Position Level*</Label>
                  <Select
                    value={positionData.position_level}
                    onValueChange={(value) => setPositionData({ ...positionData, position_level: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">Entry Level</SelectItem>
                      <SelectItem value="junior">Junior</SelectItem>
                      <SelectItem value="mid">Mid Level</SelectItem>
                      <SelectItem value="senior">Senior</SelectItem>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="director">Director</SelectItem>
                      <SelectItem value="executive">Executive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department*</Label>
                  <Select
                    value={positionData.department}
                    onValueChange={(value) => setPositionData({ ...positionData, department: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="product">Product</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="hr">Human Resources</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="operations">Operations</SelectItem>
                      <SelectItem value="legal">Legal</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="description">Position Description*</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={generateDescription}
                    disabled={!positionData.position_title || isGeneratingDescription}
                    className="text-xs"
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    {isGeneratingDescription ? 'Generating...' : 'Generate with AI'}
                  </Button>
                </div>
                <Textarea
                  ref={descriptionRef}
                  id="description"
                  value={positionData.description}
                  onChange={(e) => setPositionData({ ...positionData, description: e.target.value })}
                  onScroll={handleDescriptionScroll}
                  placeholder="Describe the role, responsibilities, and key objectives..."
                  rows={6}
                  className="resize-none"
                />
                {positionData.description.length > 100 && !positionData.description_fully_read && (
                  <p className="text-xs text-orange-600 mt-1">
                    Please scroll to read the entire description
                  </p>
                )}
                <div ref={descriptionEndRef} />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Top-Level Multi-Position Progress Bar */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium text-purple-900">⚡ AI Processing Status</h3>
                  {(() => {
                    const currentProcessing = positions.findIndex(
                      (_, i) => processingStatus[i] === 'processing'
                    );
                    return currentProcessing >= 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setProcessingStatus(prev => ({ ...prev, [currentProcessing]: 'pending' }))}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        Cancel
                      </Button>
                    );
                  })()}
                </div>
                
                <div className="space-y-2">
                  {positions.map((position, index) => {
                    const status = getPositionStatus(index);
                    const skillCount = position.required_skills.length;
                    const progress = processingProgress[index] || 0;
                    const timeElapsed = getProcessingTime(index);
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-lg">{getStatusIcon(status)}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                Position {index + 1}: {position.position_title}
                              </span>
                              {status === 'completed' && (
                                <span className="text-green-600 text-sm">({skillCount} skills)</span>
                              )}
                            </div>
                            {status === 'processing' && (
                              <div className="mt-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm text-purple-700">
                                    {loadingMessages[index]} {timeElapsed}
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-gray-500">{progress}% complete</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {(() => {
                  const stats = getProcessingStats();
                  if (stats.total > 0 && stats.completed === stats.total) {
                    return (
                      <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-center">
                        <span className="text-green-700 font-medium">
                          ✅ All {stats.total} positions processed successfully! 
                          Total: {positions.reduce((sum, p) => sum + p.required_skills.length, 0)} skills
                        </span>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>

              {/* Compact Position List with Expandable Categories */}
              <div className="space-y-4">
                {positions.map((position, index) => {
                  const status = getPositionStatus(index);
                  const skillCount = position.required_skills.length;
                  const isCollapsed = collapsedPositions.has(index);
                  
                  // Auto-expand current processing position, collapse others
                  const shouldShow = !isCollapsed || status === 'processing';

                  return (
                    <div key={index} className="border rounded-lg overflow-hidden">
                      {/* Position Header - Always Visible */}
                      <div 
                        className="p-3 cursor-pointer hover:bg-gray-50 transition-colors bg-gray-25"
                        onClick={() => togglePositionCollapsed(index)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">
                              {shouldShow ? '▼' : '▶'}
                            </span>
                            <span className="font-medium">
                              Position {index + 1}: {position.position_title}
                            </span>
                            <span className="text-sm text-gray-500">
                              ({skillCount} skills)
                            </span>
                          </div>
                          {!shouldShow && skillCount > 0 && (
                            <div className="flex gap-1 max-w-md overflow-hidden">
                              {position.required_skills.slice(0, 3).map(skill => (
                                <Badge key={skill.skill_id} variant="outline" className="text-xs">
                                  {skill.skill_name}
                                </Badge>
                              ))}
                              {skillCount > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{skillCount - 3} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Expanded Content */}
                      {shouldShow && (
                        <div className="border-t bg-white p-4">
                          {status === 'processing' && (
                            <div className="text-center py-4">
                              <div className="text-sm text-purple-700 mb-2">
                                Currently processing this position...
                              </div>
                            </div>
                          )}

                          {status === 'error' && (
                            <div className="text-center py-6">
                              <p className="text-red-600 mb-4">Failed to generate skills for this position</p>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => generateSkillsForPosition(index)}
                              >
                                Retry
                              </Button>
                            </div>
                          )}

                          {(status === 'completed' || skillCount > 0) && (
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-purple-700">
                                  🤖 AI + Database found {skillCount} skills
                                </span>
                                <div className="flex gap-2">
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => {
                                      toast.success(`Accepted ${skillCount} skills for ${position.position_title}`);
                                    }}
                                  >
                                    Accept All
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => generateSkillsForPosition(index)}
                                  >
                                    Regenerate
                                  </Button>
                                </div>
                              </div>

                              {/* Compact Grid Layout with Expandable Categories */}
                              {groupedSkills[index] && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {Object.entries(groupedSkills[index]).map(([group, skills]) => {
                                    const isExpanded = isCategoryExpanded(index, group);
                                    const displaySkills = isExpanded ? skills : skills.slice(0, 2);
                                    
                                    return (
                                      <div key={group} className="border rounded-lg p-3 bg-gray-50">
                                        <div 
                                          className="flex items-center justify-between cursor-pointer mb-2"
                                          onClick={() => toggleCategoryExpanded(index, group)}
                                        >
                                          <div className="flex items-center gap-2">
                                            <span>{getGroupIcon(group)}</span>
                                            <span className="font-medium text-sm">{getGroupLabel(group)}</span>
                                            <span className="text-xs text-gray-500">({skills.length})</span>
                                          </div>
                                          <span className="text-sm text-gray-400">
                                            {isExpanded ? '▲' : '▼'}
                                          </span>
                                        </div>
                                        
                                        <div className="space-y-2">
                                          {displaySkills.map(skill => (
                                            <div key={skill.skill_id} className="bg-white rounded p-2 border text-xs">
                                              <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                  <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-medium">{skill.skill_name}</span>
                                                    {skill.source && (
                                                      <span className="text-xs px-1 py-0.5 rounded bg-blue-100 text-blue-600">
                                                        {skill.source === 'database' ? 'DB' : 'AI'}
                                                      </span>
                                                    )}
                                                  </div>
                                                  <div className="flex items-center gap-2">
                                                    <div className="flex">
                                                      {[1, 2, 3, 4, 5].map(level => (
                                                        <div
                                                          key={level}
                                                          className={`w-1.5 h-1.5 rounded-full mr-0.5 ${
                                                            level <= skill.proficiency_level ? 'bg-purple-500' : 'bg-gray-200'
                                                          }`}
                                                        />
                                                      ))}
                                                    </div>
                                                    {skill.reason && (
                                                      <button
                                                        onClick={() => toggleSkillExpanded(skill.skill_id)}
                                                        className="text-blue-600 hover:text-blue-800"
                                                        title="Why this skill?"
                                                      >
                                                        ?
                                                      </button>
                                                    )}
                                                  </div>
                                                  {expandedSkills[skill.skill_id] && skill.reason && (
                                                    <div className="mt-1 p-1 bg-blue-50 rounded text-xs text-blue-800">
                                                      {skill.reason}
                                                    </div>
                                                  )}
                                                </div>
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() => {
                                                    setPositions(prev => {
                                                      const newPositions = [...prev];
                                                      newPositions[index] = {
                                                        ...newPositions[index],
                                                        required_skills: newPositions[index].required_skills.filter(s => s.skill_id !== skill.skill_id)
                                                      };
                                                      return newPositions;
                                                    });
                                                  }}
                                                  className="h-4 w-4 p-0 opacity-50 hover:opacity-100"
                                                >
                                                  <X className="h-3 w-3" />
                                                </Button>
                                              </div>
                                            </div>
                                          ))}
                                          
                                          {!isExpanded && skills.length > 2 && (
                                            <button
                                              onClick={() => toggleCategoryExpanded(index, group)}
                                              className="text-xs text-blue-600 hover:text-blue-800 w-full text-center py-1"
                                            >
                                              + {skills.length - 2} more skills...
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Manual Add Section */}
                              <div className="border-t pt-4">
                                <div className="flex gap-2">
                                  <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                      type="text"
                                      placeholder="Add more skills..."
                                      value={skillSearchTerm}
                                      onChange={(e) => setSkillSearchTerm(e.target.value)}
                                      className="pl-10"
                                    />
                                  </div>
                                </div>
                                
                                {skillSearchTerm && (
                                  <div className="mt-2 max-h-32 overflow-y-auto border rounded-md">
                                    {filteredSkills.slice(0, 3).map(skill => (
                                      <div
                                        key={skill.skill_id}
                                        className="p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 flex items-center justify-between"
                                        onClick={() => {
                                          const newSkill = {
                                            skill_id: skill.skill_id,
                                            skill_name: skill.skill_name,
                                            proficiency_level: 3,
                                            description: skill.description
                                          };
                                          setPositions(prev => {
                                            const newPositions = [...prev];
                                            if (!newPositions[index].required_skills.find(s => s.skill_id === skill.skill_id)) {
                                              newPositions[index] = {
                                                ...newPositions[index],
                                                required_skills: [...newPositions[index].required_skills, newSkill]
                                              };
                                            }
                                            return newPositions;
                                          });
                                          setSkillSearchTerm('');
                                        }}
                                      >
                                        <span className="text-sm">{skill.skill_name}</span>
                                        <Plus className="h-4 w-4 text-gray-400" />
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {status === 'pending' && skillCount === 0 && (
                            <div className="text-center py-6">
                              <p className="text-muted-foreground mb-4">Ready to generate skills...</p>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => generateSkillsForPosition(index)}
                              >
                                Generate Now
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Review All Positions ({positions.length})</h3>
                
                <div className="space-y-6">
                  {positions.map((position, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">Position {index + 1}: {position.position_title}</h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCurrentPositionIndex(index);
                            setCurrentStep(1);
                          }}
                        >
                          Edit
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Position Code</p>
                          <p className="font-medium">{position.position_code}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Level</p>
                          <p className="font-medium capitalize">{position.position_level}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Department</p>
                          <p className="font-medium capitalize">{position.department}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Required Skills</p>
                          <p className="font-medium">{position.required_skills.length} skills</p>
                        </div>
                      </div>
                      
                      {position.description && (
                        <div className="mb-4">
                          <p className="text-sm text-muted-foreground mb-2">Description</p>
                          <p className="text-sm line-clamp-3">{position.description}</p>
                        </div>
                      )}
                      
                      {position.required_skills.length > 0 && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Skills</p>
                          <div className="flex flex-wrap gap-1">
                            {position.required_skills.slice(0, 6).map(skill => (
                              <Badge key={skill.skill_id} variant="outline" className="text-xs">
                                {skill.skill_name}
                              </Badge>
                            ))}
                            {position.required_skills.length > 6 && (
                              <Badge variant="secondary" className="text-xs">
                                +{position.required_skills.length - 6} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <Alert className="mt-6 bg-white">
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p>By creating these positions, you confirm that:</p>
                      <div className="flex items-start gap-2">
                        <Checkbox
                          id="admin_approved"
                          checked={positions.every(p => p.admin_approved)}
                          onCheckedChange={(checked) => {
                            setPositions(prev => prev.map(p => ({ ...p, admin_approved: checked as boolean })));
                          }}
                        />
                        <Label htmlFor="admin_approved" className="text-sm cursor-pointer">
                          All position details and skill requirements have been reviewed and approved
                        </Label>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            {currentStep < 3 ? (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSave}
                disabled={isLoading || !positions.every(p => p.admin_approved)}
              >
                {isLoading 
                  ? 'Creating...' 
                  : `Create ${positions.length} Position${positions.length > 1 ? 's' : ''}`
                }
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}