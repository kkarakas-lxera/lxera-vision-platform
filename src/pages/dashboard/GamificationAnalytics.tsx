import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download } from 'lucide-react';
import { MetricsOverview } from '@/components/dashboard/gamification/MetricsOverview';
import { OverviewDashboard } from '@/components/dashboard/gamification/OverviewDashboard';
import { MissionAnalytics } from '@/components/dashboard/gamification/MissionAnalytics';
import { PlayerAnalytics } from '@/components/dashboard/gamification/PlayerAnalytics';
import { ActivityAnalytics } from '@/components/dashboard/gamification/ActivityAnalytics';

export default function GamificationAnalytics() {
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
  );
}