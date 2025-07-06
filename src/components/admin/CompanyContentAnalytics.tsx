
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useContentManager } from '@/lib/ContentManager';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Zap, 
  FileText, 
  Brain,
  Loader2
} from 'lucide-react';

interface CompanyAnalytics {
  totalModules: number;
  modulesByStatus: Record<string, number>;
  averageQualityScore: number;
  qualityTrend: 'up' | 'down' | 'stable';
  enhancementSuccess: number;
  wordCountStats: {
    total: number;
    average: number;
  };
}

export const CompanyContentAnalytics = () => {
  const { userProfile } = useAuth();
  const contentManager = useContentManager();
  const [analytics, setAnalytics] = useState<CompanyAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [userProfile?.company_id]);

  const fetchAnalytics = async () => {
    try {
      const data = await contentManager.get_company_analytics();
      
      interface Module {
        status: string;
        total_word_count?: number;
      }
      
      const modulesByStatus = data.modules.reduce((acc: Record<string, number>, module: Module) => {
        acc[module.status] = (acc[module.status] || 0) + 1;
        return acc;
      }, {});

      const totalWordCount = data.modules.reduce((sum: number, module: Module) => sum + (module.total_word_count || 0), 0);
      const averageWordCount = data.modules.length > 0 ? Math.round(totalWordCount / data.modules.length) : 0;

      interface QualityEntry {
        overall_score?: number;
      }
      
      const qualityScores = data.quality.map((q: QualityEntry) => q.overall_score).filter(Boolean);
      const averageQualityScore = qualityScores.length > 0 
        ? qualityScores.reduce((sum: number, score: number) => sum + score, 0) / qualityScores.length 
        : 0;

      interface Enhancement {
        success: boolean;
      }
      
      const successfulEnhancements = data.enhancements.filter((e: Enhancement) => e.success).length;
      const enhancementSuccess = data.enhancements.length > 0 
        ? (successfulEnhancements / data.enhancements.length) * 100 
        : 0;

      setAnalytics({
        totalModules: data.modules.length,
        modulesByStatus,
        averageQualityScore: Math.round(averageQualityScore * 10) / 10,
        qualityTrend: 'stable', // Could be calculated from historical data
        enhancementSuccess: Math.round(enhancementSuccess),
        wordCountStats: {
          total: totalWordCount,
          average: averageWordCount
        }
      });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading analytics...</span>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Modules</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.totalModules}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Draft: {analytics.modulesByStatus.draft || 0} | 
            Approved: {analytics.modulesByStatus.approved || 0}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.averageQualityScore}/10</div>
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
            Average across all modules
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Enhancement Success</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.enhancementSuccess}%</div>
          <div className="text-xs text-muted-foreground mt-1">
            AI enhancement success rate
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Content Volume</CardTitle>
          <Brain className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.wordCountStats.total.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Total words generated
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Length</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.wordCountStats.average.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Words per module
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          <Brain className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(analytics.modulesByStatus.draft || 0) + (analytics.modulesByStatus.quality_check || 0)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Modules being processed
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
