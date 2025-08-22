// Mock data for skills trends and dashboard
export interface HistoricalDataPoint {
  date: string;
  organization: number;
  departments: Record<string, number>;
  positions: Record<string, number>;
  critical_gaps: number;
  moderate_gaps: number;
}

export interface SkillMomentum {
  skill: string;
  currentAvg: number;
  previousAvg: number;
  change: number;
  changePercent: number;
  direction: 'up' | 'down' | 'stable';
  affectedEmployees: number;
}

// Generate historical data for the last 6 months
const generateHistoricalData = (): HistoricalDataPoint[] => {
  const data: HistoricalDataPoint[] = [];
  const now = new Date();
  
  // Generate 24 weekly data points (6 months)
  for (let i = 23; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - (i * 7));
    
    // Simulate gradual improvement over time
    const baseProgress = Math.max(45, 65 - (i * 0.8));
    const variance = Math.random() * 10 - 5; // ±5 points variance
    
    data.push({
      date: date.toISOString(),
      organization: Math.min(95, Math.max(40, baseProgress + variance)),
      departments: {
        'Engineering': Math.min(95, Math.max(40, baseProgress + variance + Math.random() * 10 - 5)),
        'Marketing': Math.min(95, Math.max(40, baseProgress + variance + Math.random() * 10 - 5)),
        'Sales': Math.min(95, Math.max(40, baseProgress + variance + Math.random() * 10 - 5)),
        'Operations': Math.min(95, Math.max(40, baseProgress + variance + Math.random() * 10 - 5)),
        'HR': Math.min(95, Math.max(40, baseProgress + variance + Math.random() * 10 - 5))
      },
      positions: {
        'Software Engineer': Math.min(95, Math.max(40, baseProgress + variance + Math.random() * 10 - 5)),
        'Product Manager': Math.min(95, Math.max(40, baseProgress + variance + Math.random() * 10 - 5)),
        'Marketing Specialist': Math.min(95, Math.max(40, baseProgress + variance + Math.random() * 10 - 5)),
        'Sales Representative': Math.min(95, Math.max(40, baseProgress + variance + Math.random() * 10 - 5)),
        'Operations Manager': Math.min(95, Math.max(40, baseProgress + variance + Math.random() * 10 - 5))
      },
      critical_gaps: Math.max(0, Math.round(20 - (23 - i) * 0.5 + Math.random() * 5)),
      moderate_gaps: Math.max(0, Math.round(35 - (23 - i) * 0.8 + Math.random() * 8))
    });
  }
  
  return data;
};

// Generate skills momentum data
export const mockSkillsMomentum: SkillMomentum[] = [
  // Improving skills
  {
    skill: 'React Development',
    currentAvg: 78,
    previousAvg: 65,
    change: 13,
    changePercent: 20,
    direction: 'up',
    affectedEmployees: 12
  },
  {
    skill: 'Data Analysis',
    currentAvg: 72,
    previousAvg: 63,
    change: 9,
    changePercent: 14.3,
    direction: 'up',
    affectedEmployees: 18
  },
  {
    skill: 'Digital Marketing',
    currentAvg: 68,
    previousAvg: 61,
    change: 7,
    changePercent: 11.5,
    direction: 'up',
    affectedEmployees: 8
  },
  {
    skill: 'Project Management',
    currentAvg: 75,
    previousAvg: 70,
    change: 5,
    changePercent: 7.1,
    direction: 'up',
    affectedEmployees: 15
  },
  {
    skill: 'Python Programming',
    currentAvg: 69,
    previousAvg: 65,
    change: 4,
    changePercent: 6.2,
    direction: 'up',
    affectedEmployees: 9
  },
  // Declining skills
  {
    skill: 'Legacy System Maintenance',
    currentAvg: 45,
    previousAvg: 52,
    change: -7,
    changePercent: -13.5,
    direction: 'down',
    affectedEmployees: 6
  },
  {
    skill: 'Manual Testing',
    currentAvg: 58,
    previousAvg: 63,
    change: -5,
    changePercent: -7.9,
    direction: 'down',
    affectedEmployees: 11
  },
  {
    skill: 'Spreadsheet Analysis',
    currentAvg: 66,
    previousAvg: 70,
    change: -4,
    changePercent: -5.7,
    direction: 'down',
    affectedEmployees: 14
  },
  {
    skill: 'Traditional Marketing',
    currentAvg: 62,
    previousAvg: 65,
    change: -3,
    changePercent: -4.6,
    direction: 'down',
    affectedEmployees: 7
  },
  // Stable skills
  {
    skill: 'Communication',
    currentAvg: 82,
    previousAvg: 81,
    change: 1,
    changePercent: 1.2,
    direction: 'stable',
    affectedEmployees: 25
  },
  {
    skill: 'Problem Solving',
    currentAvg: 76,
    previousAvg: 76,
    change: 0,
    changePercent: 0,
    direction: 'stable',
    affectedEmployees: 22
  }
];

// Export historical data
export const mockHistoricalData: HistoricalDataPoint[] = generateHistoricalData();

// Mock dashboard metrics to add more variety
export interface DashboardMockMetrics {
  totalEmployees: number;
  analyzedEmployees: number;
  avgSkillsScore: number;
  criticalGaps: number;
  moderateGaps: number;
  improvingSkills: number;
  decliningSkills: number;
  activeLearningPaths: number;
}

export const mockDashboardMetrics: DashboardMockMetrics = {
  totalEmployees: 47,
  analyzedEmployees: 42,
  avgSkillsScore: 73,
  criticalGaps: 8,
  moderateGaps: 15,
  improvingSkills: 12,
  decliningSkills: 6,
  activeLearningPaths: 18
};

// Department skill averages for additional context
export const mockDepartmentAverages = {
  'Engineering': 78,
  'Marketing': 71,
  'Sales': 69,
  'Operations': 74,
  'HR': 67
};

// Position-based gaps for more granular insights
export const mockPositionGaps = [
  { position: 'Junior Developer', requiredSkills: 8, currentAvg: 62, gap: 38 },
  { position: 'Marketing Specialist', requiredSkills: 12, currentAvg: 71, gap: 29 },
  { position: 'Sales Manager', requiredSkills: 10, currentAvg: 75, gap: 25 },
  { position: 'Operations Coordinator', requiredSkills: 9, currentAvg: 68, gap: 32 },
  { position: 'HR Generalist', requiredSkills: 11, currentAvg: 64, gap: 36 }
];