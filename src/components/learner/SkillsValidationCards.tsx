import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SkillCard {
  skill_name: string;
  skill_id: string | null;
  order: number;
  is_from_position: boolean;
  is_from_cv: boolean;
  description?: string;
  areas_of_use?: string[];
}

interface SkillsValidationCardsProps {
  employeeId: string;
  onComplete: () => void;
}

// Emoji map for different skill types
const getSkillEmoji = (skillName: string): string => {
  const name = skillName.toLowerCase();
  
  // Programming languages
  if (name.includes('python')) return '🐍';
  if (name.includes('javascript') || name.includes('js')) return '📜';
  if (name.includes('java') && !name.includes('script')) return '☕';
  if (name.includes('react')) return '⚛️';
  if (name.includes('node')) return '🟢';
  if (name.includes('docker')) return '🐳';
  if (name.includes('kubernetes') || name.includes('k8s')) return '☸️';
  if (name.includes('aws') || name.includes('azure') || name.includes('cloud')) return '☁️';
  if (name.includes('database') || name.includes('sql') || name.includes('postgres') || name.includes('mongo')) return '🗄️';
  if (name.includes('git')) return '🔀';
  
  // Soft skills
  if (name.includes('leadership') || name.includes('lead')) return '👥';
  if (name.includes('communication')) return '💬';
  if (name.includes('project') || name.includes('management')) return '📊';
  if (name.includes('agile') || name.includes('scrum')) return '🔄';
  
  // Tools
  if (name.includes('excel') || name.includes('sheets')) return '📊';
  if (name.includes('jira') || name.includes('confluence')) return '📝';
  if (name.includes('slack') || name.includes('teams')) return '💬';
  
  // Default
  return '🛠️';
};

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center min-h-[400px]">
    <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
    <p className="text-gray-600">Preparing your skills assessment...</p>
  </div>
);

const CompletionState = () => (
  <motion.div
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    className="flex flex-col items-center justify-center min-h-[400px]"
  >
    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
      <CheckCircle className="h-10 w-10 text-green-600" />
    </div>
    <h3 className="text-2xl font-bold mb-2">You did it! 🎊</h3>
    <p className="text-gray-600 mb-2">Thanks for sharing your expertise with us</p>
    <p className="text-sm text-gray-500">Moving to next step...</p>
  </motion.div>
);

export default function SkillsValidationCards({ employeeId, onComplete }: SkillsValidationCardsProps) {
  const [skills, setSkills] = useState<SkillCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [validations, setValidations] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  
  // Swipe handlers
  const handlers = useSwipeable({
    onSwipedLeft: () => handleValidation(0), // No experience
    onSwipedRight: () => handleValidation(2), // Good
    onSwipedDown: () => handleValidation(0), // No experience
    onSwipedUp: () => handleValidation(2), // Good
    preventScrollOnSwipe: true,
    trackMouse: true
  });
  
  // Load skills on mount
  useEffect(() => {
    loadSkills();
  }, [employeeId]);
  
  // Auto-save every 5 validations
  useEffect(() => {
    const validationCount = Object.keys(validations).length;
    if (validationCount > 0 && validationCount % 5 === 0 && !saving) {
      saveValidations();
    }
  }, [validations]);
  
  async function loadSkills() {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('prepare-employee-skills', {
        body: { employee_id: employeeId }
      });
      
      if (error) throw error;
      
      if (data?.skills) {
        setSkills(data.skills);
        console.log(`Loaded ${data.skills.length} skills for validation`);
      } else {
        toast.error('No skills found to validate');
        onComplete();
      }
    } catch (error) {
      console.error('Error loading skills:', error);
      toast.error('Failed to load skills');
      onComplete();
    } finally {
      setLoading(false);
    }
  }
  
  async function handleValidation(level: number) {
    const skill = skills[currentIndex];
    if (!skill) return;
    
    // If level is -1, it means skip
    if (level >= 0) {
      // Update local state
      setValidations(prev => ({
        ...prev,
        [skill.skill_name]: level
      }));
    }
    
    // Move to next
    if (currentIndex < skills.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // All done
      setSaving(true);
      await saveValidations();
      setShowCompletion(true);
      setTimeout(() => {
        onComplete();
      }, 2000);
    }
  }
  
  async function saveValidations() {
    if (Object.keys(validations).length === 0) return;
    
    try {
      const entries = Object.entries(validations).map(([skill_name, level], index) => {
        const skill = skills.find(s => s.skill_name === skill_name);
        return {
          employee_id: employeeId,
          skill_name,
          proficiency_level: level,
          skill_id: skill?.skill_id || null,
          validation_order: skill?.order || index,
          is_from_position: skill?.is_from_position || false,
          is_from_cv: skill?.is_from_cv || false
        };
      });
      
      const { error } = await supabase
        .from('employee_skills_validation')
        .upsert(entries, { 
          onConflict: 'employee_id,skill_name',
          ignoreDuplicates: false 
        });
        
      if (error) throw error;
      
      console.log(`Saved ${entries.length} skill validations`);
    } catch (error) {
      console.error('Error saving validations:', error);
      // Don't show error to user - we'll retry on next batch
    } finally {
      setSaving(false);
    }
  }
  
  if (loading) {
    return <LoadingState />;
  }
  
  if (showCompletion) {
    return <CompletionState />;
  }
  
  if (skills.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No skills to validate</p>
      </div>
    );
  }
  
  const currentSkill = skills[currentIndex];
  const progress = ((currentIndex + 1) / skills.length) * 100;
  
  // Milestone check
  const showMilestone = currentIndex > 0 && currentIndex % 5 === 0 && !validations[currentSkill?.skill_name];
  
  return (
    <div className="max-w-md mx-auto px-4">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Your expertise matters ✨</span>
          <span>{currentIndex + 1}/{skills.length}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      {/* Milestone celebration */}
      <AnimatePresence>
        {showMilestone && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center mb-6"
          >
            <p className="text-lg font-semibold text-blue-600">
              Nice pace! 🚀 {skills.length - currentIndex} to go
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Card Stack */}
      <div className="relative h-[500px]" {...handlers}>
        <AnimatePresence mode="wait">
          {currentSkill && (
            <motion.div
              key={currentSkill.skill_name}
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, x: -300 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <Card className="bg-white rounded-2xl shadow-lg p-6 h-full flex flex-col">
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="text-4xl mb-3">
                    {getSkillEmoji(currentSkill.skill_name)}
                  </div>
                  <h2 className="text-2xl font-semibold mb-2 text-center">
                    {currentSkill.skill_name}
                  </h2>
                  
                  {currentSkill.description && (
                    <p className="text-sm text-gray-600 text-center mb-3 px-4">
                      {currentSkill.description}
                    </p>
                  )}
                  
                  {currentSkill.areas_of_use && currentSkill.areas_of_use.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 text-center mb-2">Common areas:</p>
                      <div className="flex flex-wrap justify-center gap-1.5 px-4">
                        {currentSkill.areas_of_use.slice(0, 4).map((area, idx) => (
                          <span 
                            key={idx}
                            className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2 text-xs text-gray-500 mt-2">
                    {currentSkill.is_from_cv && (
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Found in CV
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Question and buttons section */}
                <div className="mt-auto pb-4">
                  <p className="text-gray-600 text-center mb-4 px-4">
                    {currentIndex < 5 
                      ? "How comfortable are you with this?"
                      : currentIndex < 10
                      ? "What's your level with this one?"
                      : currentIndex < 15
                      ? "Rate your experience here"
                      : currentIndex < 20
                      ? "How about this skill?"
                      : "Almost done! Your level with this?"
                    }
                  </p>
                  
                  {/* Action buttons */}
                  <div className="grid grid-cols-4 gap-2 px-4">
                    <Button
                      variant="outline"
                      onClick={() => handleValidation(0)}
                      className={cn(
                        "p-3 border-2 hover:border-red-500 transition-colors",
                        "flex flex-col items-center gap-1"
                      )}
                    >
                      <div className="text-xl">❌</div>
                      <div className="text-xs">None</div>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleValidation(1)}
                      className={cn(
                        "p-3 border-2 hover:border-yellow-500 transition-colors",
                        "flex flex-col items-center gap-1"
                      )}
                    >
                      <div className="text-xl">🟡</div>
                      <div className="text-xs">Learning</div>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleValidation(2)}
                      className={cn(
                        "p-3 border-2 hover:border-green-500 transition-colors",
                        "flex flex-col items-center gap-1"
                      )}
                    >
                      <div className="text-xl">🟢</div>
                      <div className="text-xs">Using</div>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleValidation(3)}
                      className={cn(
                        "p-3 border-2 hover:border-purple-500 transition-colors",
                        "flex flex-col items-center gap-1"
                      )}
                    >
                      <div className="text-xl">⭐</div>
                      <div className="text-xs">Expert</div>
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Next cards preview */}
        {skills[currentIndex + 1] && (
          <div className="absolute inset-0 -z-10 transform translate-y-4 scale-95">
            <div className="bg-gray-100 rounded-2xl h-full" />
          </div>
        )}
        {skills[currentIndex + 2] && (
          <div className="absolute inset-0 -z-20 transform translate-y-8 scale-90">
            <div className="bg-gray-200 rounded-2xl h-full" />
          </div>
        )}
      </div>
      
      {/* Navigation buttons */}
      <div className="flex justify-between items-center mt-6">
        <Button
          variant="ghost"
          onClick={() => {
            if (currentIndex > 0) {
              setCurrentIndex(currentIndex - 1);
            }
          }}
          disabled={currentIndex === 0}
          className="text-gray-600"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        
        <span className="text-sm text-gray-500">
          Swipe or tap to rate
        </span>
        
        <Button
          variant="ghost"
          onClick={() => handleValidation(-1)} // Skip skill
          className="text-gray-600"
        >
          Skip
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}