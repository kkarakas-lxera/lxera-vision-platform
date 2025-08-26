import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { RadarChart, TrendingSkill } from '@/components/ui/RadarChart';
import { Building2, Users, Briefcase, BarChart3 } from 'lucide-react';

interface MarketData {
  keyMetrics: {
    jobsAnalyzed: number;
    skillsIdentified: number;
    experienceLevels: number;
    timeRange: string;
    regions: string[];
  };
  skillDemand: Array<{
    skill: string;
    percentage: number;
    jobs: number;
    color: string;
  }>;
  experienceBreakdown: Array<{
    level: string;
    percentage: number;
    jobs: number;
  }>;
  recentReports: Array<{
    position: string;
    region: string;
    date: string;
    jobs: number;
    skills: number;
    status: string;
  }>;
  insights: Array<{
    type: 'opportunity' | 'trend' | 'gap';
    title: string;
    description: string;
    impact: string;
  }>;
}

interface MarketIntelligenceSectionProps {
  trendingSkills: TrendingSkill[];
  marketData: MarketData;
}

const MarketIntelligenceSection: React.FC<MarketIntelligenceSectionProps> = ({
  trendingSkills,
  marketData
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'trends' | 'reports'>('overview');

  return (
    <div className="rounded-3xl border bg-card text-card-foreground shadow-lg overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Left side - Content and Controls */}
        <div className="lg:col-span-3 p-4 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-800/50 border-r">
          <div className="space-y-3">
            <div>
              <h3 className="text-lg font-semibold mb-1">Market Intelligence</h3>
              <p className="text-xs text-muted-foreground">
                Industry insights and trending skills analysis
              </p>
            </div>

            {/* Compact Analysis Selector */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-700 dark:text-gray-300">Analysis Focus</div>
              <div className="grid grid-cols-1 gap-1">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`flex items-center justify-start px-2 py-1.5 rounded-md text-xs transition-colors ${
                    activeTab === 'overview'
                      ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-gray-200'
                  }`}
                >
                  <Building2 className="h-3 w-3 mr-1" />
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('skills')}
                  className={`flex items-center justify-start px-2 py-1.5 rounded-md text-xs transition-colors ${
                    activeTab === 'skills'
                      ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-gray-200'
                  }`}
                >
                  <Users className="h-3 w-3 mr-1" />
                  Skills
                </button>
                <button
                  onClick={() => setActiveTab('trends')}
                  className={`flex items-center justify-start px-2 py-1.5 rounded-md text-xs transition-colors ${
                    activeTab === 'trends'
                      ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-gray-200'
                  }`}
                >
                  <BarChart3 className="h-3 w-3 mr-1" />
                  Trends
                </button>
                <button
                  onClick={() => setActiveTab('reports')}
                  className={`flex items-center justify-start px-2 py-1.5 rounded-md text-xs transition-colors ${
                    activeTab === 'reports'
                      ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-gray-200'
                  }`}
                >
                  <Briefcase className="h-3 w-3 mr-1" />
                  Reports
                </button>
              </div>
            </div>

            {/* Compact Stats */}
            <div className="pt-2 space-y-1 border-t border-gray-200/50 dark:border-gray-700/50 mt-2">
              <div className="text-xs font-medium text-gray-700 dark:text-gray-300">Current Period</div>
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {marketData.keyMetrics.jobsAnalyzed} jobs
              </div>
              <div className="text-xs text-muted-foreground">
                {marketData.keyMetrics.skillsIdentified} skills, {marketData.keyMetrics.regions.length} regions
              </div>
            </div>

            <div className="pt-2 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600 dark:text-gray-400">Top</span>
                <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                  {trendingSkills[0].skill} ({trendingSkills[0].trendingScore}%)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600 dark:text-gray-400">Coverage</span>
                <span className="text-xs font-medium">{trendingSkills.length} skills</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600 dark:text-gray-400">Updated</span>
                <span className="text-xs font-medium">Real-time</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Dynamic Content */}
        <div className="lg:col-span-9 p-4">
          <div className="h-[300px]">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-4 h-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
                  {/* Radar Chart with Gray Background */}
                  <div className="flex items-center justify-center">
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                      <RadarChart
                        width={380}
                        height={280}
                        data={trendingSkills}
                      />
                    </div>
                  </div>

                  {/* Compact Insights */}
                  <div className="space-y-2">
                    <div className="border border-gray-200 dark:border-gray-700 p-3 rounded-lg bg-gray-50/50 dark:bg-gray-800/20">
                      <div className="flex items-start gap-2">
                        <div className="flex-shrink-0 w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 text-xs mb-1">Key Market Insight</h4>
                          <p className="text-gray-700 dark:text-gray-300 text-xs leading-relaxed">
                            AI-related skills dominate with Generative AI leading at 95% market demand.
                          </p>
                        </div>
                      </div>
                    </div>

                    {marketData.insights.slice(0, 2).map((insight, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-700 p-2 rounded-lg bg-gray-50/30 dark:bg-gray-800/10">
                        <div className="flex items-start gap-2">
                          <div className={`flex-shrink-0 w-1.5 h-1.5 rounded-full mt-1.5 ${
                            insight.type === 'opportunity' ? 'bg-green-500' :
                            insight.type === 'trend' ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}></div>
                          <div>
                            <h5 className="font-medium text-gray-900 dark:text-gray-100 text-xs mb-0.5">{insight.title}</h5>
                            <p className="text-gray-700 dark:text-gray-300 text-xs leading-relaxed">{insight.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Skills Demand Tab */}
            {activeTab === 'skills' && (
              <div className="h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={marketData.skillDemand}>
                    <XAxis dataKey="skill" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value, name) => [`${value}%`, 'Demand']}
                      labelFormatter={(label) => `${label}: ${marketData.skillDemand.find(s => s.skill === label)?.jobs} jobs`}
                    />
                    <Bar dataKey="percentage" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Market Trends Tab */}
            {activeTab === 'trends' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                {/* Experience Level Distribution */}
                <div>
                  <h4 className="text-lg font-semibold mb-4">Experience Requirements</h4>
                  <div className="space-y-3">
                    {marketData.experienceBreakdown.map((exp, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{exp.level}</span>
                          <span>{exp.percentage}% ({exp.jobs} jobs)</span>
                        </div>
                        <Progress value={exp.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Technical vs Soft Skills */}
                <div>
                  <h4 className="text-lg font-semibold mb-4">Skills Distribution</h4>
                  <div className="h-48 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Technical Skills', value: 73, color: '#10b981' },
                            { name: 'Soft Skills', value: 27, color: '#3b82f6' }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={30}
                          outerRadius={60}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          <Cell fill="#10b981" />
                          <Cell fill="#3b82f6" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Analysis Tab - Compact */}
            {activeTab === 'reports' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-full overflow-y-auto">
                {marketData.recentReports.map((report, index) => (
                  <div key={index} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors h-fit">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900 dark:text-gray-100 text-sm">{report.position}</h5>
                      <Badge 
                        variant={report.status === 'completed' ? 'default' : 'secondary'} 
                        className="text-xs px-2 py-0"
                      >
                        {report.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5">
                      <div className="flex justify-between">
                        <span>Region:</span>
                        <span>{report.region}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Jobs:</span>
                        <span>{report.jobs}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Skills:</span>
                        <span>{report.skills}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Date:</span>
                        <span>{report.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketIntelligenceSection;