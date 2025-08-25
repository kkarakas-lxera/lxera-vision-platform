import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, GamepadIcon, Users, TrendingUp, Target } from 'lucide-react';
import { MetricsOverview } from '@/components/dashboard/gamification/MetricsOverview';
import { OverviewDashboard } from '@/components/dashboard/gamification/OverviewDashboard';
import { MissionAnalytics } from '@/components/dashboard/gamification/MissionAnalytics';
import { PlayerAnalytics } from '@/components/dashboard/gamification/PlayerAnalytics';
import { ActivityAnalytics } from '@/components/dashboard/gamification/ActivityAnalytics';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import EmptyStateOverlay from '@/components/dashboard/EmptyStateOverlay';
import { cn } from '@/lib/utils';

export default function GamificationAnalytics() {
  const { userProfile } = useAuth();
  const [positionsCount, setPositionsCount] = useState(0);
  const [employeesCount, setEmployeesCount] = useState(0);
  const [analyzedEmployeesCount, setAnalyzedEmployeesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Game Engine System - LXERA';
  }, []);

  useEffect(() => {
    if (userProfile?.company_id) {
      fetchPositionsCount();
    }
  }, [userProfile?.company_id]);

  const fetchPositionsCount = async () => {
    if (!userProfile?.company_id) return;

    try {
      const { data: positionsData, error } = await supabase
        .from('st_company_positions')
        .select('id')
        .eq('company_id', userProfile.company_id);
      
      if (error) {
        console.error('Error fetching positions:', error);
        // Set to 0 to show blur effect if we can't fetch positions
        setPositionsCount(0);
      } else {
        const posCount = positionsData?.length || 0;
        setPositionsCount(posCount);
      }

      // Fetch employees count
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('id, skills_last_analyzed')
        .eq('company_id', userProfile.company_id);

      if (employeesError) {
        console.error('Error fetching employees:', employeesError);
        setEmployeesCount(0);
        setAnalyzedEmployeesCount(0);
      } else {
        const empCount = employeesData?.length || 0;
        const analyzedCount = employeesData?.filter(emp => emp.skills_last_analyzed).length || 0;
        setEmployeesCount(empCount);
        setAnalyzedEmployeesCount(analyzedCount);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setPositionsCount(0);
      setEmployeesCount(0);
      setAnalyzedEmployeesCount(0);
    } finally {
      setLoading(false);
    }
  };

  const getEmptyStateConfig = () => {
    if (positionsCount === 0) {
      return {
        icon: Target,
        title: "No Positions Created",
        description: "Create positions first to enable gamification features and track employee engagement.",
        ctaText: "Create Your First Position",
        ctaLink: "/dashboard/positions",
        shouldBlur: true
      };
    }
    
    if (employeesCount === 0) {
      return {
        icon: Users,
        title: "No Employees Imported",
        description: "Import employees to start tracking their learning progress and engagement.",
        ctaText: "Import Employees",
        ctaLink: "/dashboard/employees?tab=import",
        shouldBlur: true
      };
    }
    
    if (analyzedEmployeesCount === 0) {
      return {
        icon: TrendingUp,
        title: "No Skills Analyzed",
        description: "Analyze employee skills to unlock gamification features and track progress.",
        ctaText: "Analyze Skills",
        ctaLink: "/dashboard/employees?tab=import",
        shouldBlur: true
      };
    }
    
    return {
      shouldBlur: false
    };
  };

  if (loading) {
    return (
      <div className="space-y-8 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const emptyStateConfig = getEmptyStateConfig();

  return (
    <div className="space-y-8 p-6">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🎮 Gamification Analytics</h1>
          <p className="text-lg text-muted-foreground">
            Track engagement, performance, and achievements
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select defaultValue="7d">
            <SelectTrigger className="w-36 h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="default" className="h-10">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Main Content with Conditional Blur */}
      <div className="relative">
        <div className={cn(
          "space-y-6 transition-all duration-500",
          emptyStateConfig.shouldBlur && "blur-md pointer-events-none select-none"
        )}>
          {/* Metrics Overview */}
          <MetricsOverview />
          
          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 h-12">
              <TabsTrigger value="overview" className="text-base">Overview</TabsTrigger>
              <TabsTrigger value="missions" className="text-base">Missions</TabsTrigger>
              <TabsTrigger value="players" className="text-base">Players</TabsTrigger>
              <TabsTrigger value="activity" className="text-base">Activity</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <OverviewDashboard />
            </TabsContent>
            <TabsContent value="missions" className="space-y-6">
              <MissionAnalytics />
            </TabsContent>
            <TabsContent value="players" className="space-y-6">
              <PlayerAnalytics />
            </TabsContent>
            <TabsContent value="activity" className="space-y-6">
              <ActivityAnalytics />
            </TabsContent>
          </Tabs>
        </div>

        {/* Empty State Overlay */}
        {emptyStateConfig.shouldBlur && (
          <EmptyStateOverlay
            icon={emptyStateConfig.icon}
            title={emptyStateConfig.title}
            description={emptyStateConfig.description}
            ctaText={emptyStateConfig.ctaText}
            ctaLink={emptyStateConfig.ctaLink}
          />
        )}
      </div>
    </div>
  );
}