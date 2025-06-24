
import { useState, useEffect } from 'react';
import { useContentManager } from '@/lib/ContentManager';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface CompanyContentStats {
  totalModules: number;
  modulesInProgress: number;
  modulesCompleted: number;
  averageQualityScore: number;
  enhancementSessions: number;
  researchSessions: number;
  lastUpdated: string;
}

export const useCompanyContent = () => {
  const { userProfile } = useAuth();
  const contentManager = useContentManager();
  const [stats, setStats] = useState<CompanyContentStats>({
    totalModules: 0,
    modulesInProgress: 0,
    modulesCompleted: 0,
    averageQualityScore: 0,
    enhancementSessions: 0,
    researchSessions: 0,
    lastUpdated: new Date().toISOString()
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    if (!userProfile?.company_id) return;

    try {
      setLoading(true);
      const analytics = await contentManager.get_company_analytics();
      
      const modulesInProgress = analytics.modules.filter(
        (m: any) => m.status === 'draft' || m.status === 'quality_check'
      ).length;
      
      const modulesCompleted = analytics.modules.filter(
        (m: any) => m.status === 'approved'
      ).length;

      const qualityScores = analytics.quality.map((q: any) => q.overall_score).filter(Boolean);
      const averageQualityScore = qualityScores.length > 0 
        ? qualityScores.reduce((sum: number, score: number) => sum + score, 0) / qualityScores.length 
        : 0;

      setStats({
        totalModules: analytics.modules.length,
        modulesInProgress,
        modulesCompleted,
        averageQualityScore: Math.round(averageQualityScore * 10) / 10,
        enhancementSessions: analytics.enhancements.length,
        researchSessions: 0, // Will be populated from research sessions
        lastUpdated: new Date().toISOString()
      });

      setError(null);
    } catch (err) {
      console.error('Failed to fetch company content stats:', err);
      setError('Failed to load content statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Set up real-time subscription for company content changes
    if (userProfile?.company_id) {
      const channel = supabase
        .channel('company-content-stats')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'cm_module_content',
          filter: `company_id=eq.${userProfile.company_id}`
        }, () => {
          fetchStats();
        })
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'cm_quality_assessments',
          filter: `company_id=eq.${userProfile.company_id}`
        }, () => {
          fetchStats();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [userProfile?.company_id]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
};
