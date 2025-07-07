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
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🎮 Gamification Analytics</h1>
          <p className="text-muted-foreground">
            Track engagement, performance, and achievements
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue="7d">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <MetricsOverview />
      
      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="missions">Missions</TabsTrigger>
          <TabsTrigger value="players">Players</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <OverviewDashboard />
        </TabsContent>
        <TabsContent value="missions">
          <MissionAnalytics />
        </TabsContent>
        <TabsContent value="players">
          <PlayerAnalytics />
        </TabsContent>
        <TabsContent value="activity">
          <ActivityAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}