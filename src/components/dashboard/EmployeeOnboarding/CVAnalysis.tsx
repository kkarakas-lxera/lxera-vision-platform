import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, Plus, Trash2, Upload, FileText } from 'lucide-react';
import { CVUpload } from '@/components/admin/FileUpload/CVUpload';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface CVAnalysisProps {
  employeeId: string;
  companyId: string;
  currentPosition?: string;
  targetPosition?: string;
  onAnalysisComplete?: (profileId: string) => void;
}

interface AnalysisResult {
  id: string;
  cv_summary: string;
  extracted_skills: Array<{
    skill_id: string | null;
    skill_name: string;
    confidence: number;
    evidence: string;
    years_experience?: number;
    proficiency_level: number;
    skill_path?: string;
    is_custom?: boolean;
  }>;
  skills_match_score?: number;
  career_readiness_score?: number;
  analyzed_at: string;
}

export function CVAnalysis({
  employeeId,
  companyId,
  currentPosition,
  targetPosition,
  onAnalysisComplete
}: CVAnalysisProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [cvUploaded, setCvUploaded] = useState(false);

  // Check for existing analysis
  useEffect(() => {
    checkExistingAnalysis();
  }, [employeeId]);

  const checkExistingAnalysis = async () => {
    try {
      const { data, error } = await supabase
        .from('st_employee_skills_profile')
        .select('*')
        .eq('employee_id', employeeId)
        .single();

      if (data && !error) {
        setAnalysisResult(data);
        setCvUploaded(true);
      }
    } catch (err) {
      console.log('No existing analysis found');
    }
  };

  const handleCVUpload = async (result: any) => {
    if (result.success) {
      setCvUploaded(true);
      // Automatically start processing
      await processCVAnalysis(result.filePath, result.fileName || 'cv.pdf');
    }
  };

  const processCVAnalysis = async (filePath: string, fileName: string) => {
    setIsProcessing(true);
    setProcessingStatus('Starting CV analysis...');

    try {
      // Call Edge Function for CV processing
      const { data, error } = await supabase.functions.invoke('cv-process', {
        body: {
          employeeId,
          companyId,
          filePath,
          fileName,
          currentPosition,
          targetPosition
        }
      });

      if (error) throw error;

      if (data.success) {
        setProcessingStatus('Analysis complete!');
        toast({
          title: 'CV Analysis Complete',
          description: `Found ${data.skillsCount} skills. ${data.experienceYears} years of experience.`
        });

        // Fetch the full analysis result
        await fetchAnalysisResult(data.profileId);
        onAnalysisComplete?.(data.profileId);
      }
    } catch (error: any) {
      console.error('CV processing error:', error);
      setProcessingStatus('Analysis failed');
      toast({
        title: 'Analysis Failed',
        description: error.message || 'An error occurred during CV analysis',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const fetchAnalysisResult = async (profileId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('cv-analyze', {
        body: { profileId, action: 'get' }
      });

      if (error) throw error;

      if (data.success) {
        setAnalysisResult(data.profile);
      }
    } catch (error) {
      console.error('Error fetching analysis:', error);
    }
  };

  const handleAddSkill = async () => {
    // Implementation for adding custom skills
    toast({
      title: 'Add Skill',
      description: 'Feature coming soon!'
    });
  };

  const handleRemoveSkill = async (skillName: string) => {
    if (!analysisResult) return;

    try {
      const { data, error } = await supabase.functions.invoke('cv-analyze', {
        body: {
          profileId: analysisResult.id,
          action: 'remove-skill',
          skillData: { skill_name: skillName }
        }
      });

      if (error) throw error;

      if (data.success) {
        setAnalysisResult(data.profile);
        toast({
          title: 'Skill Removed',
          description: `Removed ${skillName} from profile`
        });
      }
    } catch (error) {
      console.error('Error removing skill:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove skill',
        variant: 'destructive'
      });
    }
  };

  const getProficiencyLabel = (level: number) => {
    const labels = ['None', 'Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert'];
    return labels[level] || 'Unknown';
  };

  const getProficiencyColor = (level: number) => {
    if (level >= 4) return 'bg-green-500';
    if (level >= 3) return 'bg-blue-500';
    if (level >= 2) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      {!cvUploaded && (
        <CVUpload
          employeeId={employeeId}
          companyId={companyId}
          onUploadComplete={handleCVUpload}
        />
      )}

      {/* Processing Status */}
      {isProcessing && (
        <Card>
          <CardContent className="py-8">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-lg font-medium">{processingStatus}</p>
              <Progress value={33} className="w-full max-w-xs" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      {analysisResult && !isProcessing && (
        <div className="space-y-6">
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>CV Analysis Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {analysisResult.cv_summary}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{analysisResult.extracted_skills.length}</p>
                  <p className="text-sm text-muted-foreground">Total Skills</p>
                </div>
                {analysisResult.skills_match_score && (
                  <div className="text-center">
                    <p className="text-2xl font-bold">{analysisResult.skills_match_score}%</p>
                    <p className="text-sm text-muted-foreground">Current Role Match</p>
                  </div>
                )}
                {analysisResult.career_readiness_score && (
                  <div className="text-center">
                    <p className="text-2xl font-bold">{analysisResult.career_readiness_score}%</p>
                    <p className="text-sm text-muted-foreground">Target Role Ready</p>
                  </div>
                )}
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {new Date(analysisResult.analyzed_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Analysis Date</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills Tabs */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Extracted Skills</CardTitle>
                <Button size="sm" onClick={handleAddSkill}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Skill
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="technical">Technical</TabsTrigger>
                  <TabsTrigger value="soft">Soft Skills</TabsTrigger>
                  <TabsTrigger value="custom">Custom</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-2 mt-4">
                  {analysisResult.extracted_skills.map((skill, index) => (
                    <SkillItem
                      key={index}
                      skill={skill}
                      onRemove={() => handleRemoveSkill(skill.skill_name)}
                    />
                  ))}
                </TabsContent>

                <TabsContent value="technical" className="space-y-2 mt-4">
                  {analysisResult.extracted_skills
                    .filter(s => !s.is_custom && s.skill_path?.includes('Technical'))
                    .map((skill, index) => (
                      <SkillItem
                        key={index}
                        skill={skill}
                        onRemove={() => handleRemoveSkill(skill.skill_name)}
                      />
                    ))}
                </TabsContent>

                <TabsContent value="soft" className="space-y-2 mt-4">
                  {analysisResult.extracted_skills
                    .filter(s => !s.is_custom && s.skill_path?.includes('communication'))
                    .map((skill, index) => (
                      <SkillItem
                        key={index}
                        skill={skill}
                        onRemove={() => handleRemoveSkill(skill.skill_name)}
                      />
                    ))}
                </TabsContent>

                <TabsContent value="custom" className="space-y-2 mt-4">
                  {analysisResult.extracted_skills
                    .filter(s => s.is_custom)
                    .map((skill, index) => (
                      <SkillItem
                        key={index}
                        skill={skill}
                        onRemove={() => handleRemoveSkill(skill.skill_name)}
                      />
                    ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Skill Item Component
interface SkillItemProps {
  skill: any;
  onRemove: () => void;
}

function SkillItem({ skill, onRemove }: SkillItemProps) {
  const getProficiencyColor = (level: number) => {
    if (level >= 4) return 'bg-green-500';
    if (level >= 3) return 'bg-blue-500';
    if (level >= 2) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{skill.skill_name}</span>
          {skill.is_custom && (
            <Badge variant="secondary" className="text-xs">Custom</Badge>
          )}
          <Badge variant="outline" className="text-xs">
            {Math.round(skill.confidence * 100)}% confident
          </Badge>
        </div>
        {skill.skill_path && (
          <p className="text-xs text-muted-foreground mt-1">{skill.skill_path}</p>
        )}
        {skill.evidence && (
          <p className="text-xs text-muted-foreground mt-1 italic">"{skill.evidence}"</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${getProficiencyColor(skill.proficiency_level)}`} />
          <span className="text-sm">{skill.years_experience || 0}y</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}