import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Database, Building2, UserCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { EmployeeOverview } from './EmployeeOverview';
import SkillsInventory from './SkillsInventory';
import { TeamsView } from './TeamsView';
import IndividualProfiles from './IndividualProfiles';

export default function Employees() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['overview', 'skills', 'teams', 'profiles'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Users className="h-6 w-6" />
          Employees
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your workforce and track skills across your organization
        </p>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Skills Inventory
          </TabsTrigger>
          <TabsTrigger value="teams" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Teams
          </TabsTrigger>
          <TabsTrigger value="profiles" className="flex items-center gap-2">
            <UserCircle className="h-4 w-4" />
            Individual Profiles
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <EmployeeOverview />
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          <SkillsInventory />
        </TabsContent>

        <TabsContent value="teams" className="space-y-4">
          <TeamsView />
        </TabsContent>

        <TabsContent value="profiles" className="space-y-4">
          <IndividualProfiles />
        </TabsContent>
      </Tabs>
    </div>
  );
}