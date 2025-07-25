import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface GameMetrics {
  activePlayers: number;
  averageLevel: number;
  totalPoints: number;
  completionRate: number;
  playerGrowth: number;
  levelGrowth: number;
  pointsGrowth: number;
  completionGrowth: number;
}

export interface MissionData {
  mission_title: string;
  category: string;
  difficulty_level: string;
  play_count: number;
  completion_rate: number;
  avg_accuracy: number;
  avg_time_minutes: number;
}

export interface CategoryStats {
  name: string;
  emoji: string;
  color: string;
  mission_count: number;
  completion_rate: number;
  avg_accuracy: number;
  avg_time: number;
}

export interface MissionAnalyticsData {
  missionData: MissionData[];
  categoryStats: CategoryStats[];
}

export interface PlayerSegment {
  count: number;
  percentage: number;
}

export interface PlayerData {
  employee_id: string;
  employee_name: string;
  current_level: number;
  total_points: number;
  current_streak: number;
  accuracy: number;
}

export interface PlayerAnalyticsData {
  segments: {
    high: PlayerSegment;
    regular: PlayerSegment;
    beginner: PlayerSegment;
  };
  levelDistribution: Array<{
    level_range: string;
    player_count: number;
  }>;
  topPerformers: PlayerData[];
}

export interface ActivityData {
  todaySessions: number;
  avgDuration: number;
  activeStreaks: number;
  todayAchievements: number;
  puzzleProgress: Array<{
    category: string;
    emoji: string;
    pieces_unlocked: number;
    total_pieces: number;
    completion_percentage: number;
  }>;
  recentActivity: Array<{
    type: 'achievement' | 'level_up' | 'mission_complete' | 'session_start';
    message: string;
    timestamp: string;
    points?: number;
  }>;
}

export const useGameMetrics = () => {
  const { userProfile } = useAuth();

  return useQuery({
    queryKey: ['game-metrics', userProfile?.company_id],
    queryFn: async (): Promise<GameMetrics> => {
      if (!userProfile?.company_id) {
        throw new Error('No company ID available');
      }

      // Get employees for this company first
      const { data: employees, error: employeesError } = await supabase
        .from('employees')
        .select('id')
        .eq('company_id', userProfile.company_id);

      if (employeesError) throw employeesError;
      
      const employeeIds = employees?.map(e => e.id) || [];
      
      if (employeeIds.length === 0) {
        return {
          activePlayers: 0,
          averageLevel: 0,
          totalPoints: 0,
          completionRate: 0,
          playerGrowth: 0,
          levelGrowth: 0,
          pointsGrowth: 0,
          completionGrowth: 0
        };
      }

      const { data: progressData, error } = await supabase
        .from('employee_game_progress')
        .select('*')
        .in('employee_id', employeeIds);
      
      if (error) throw error;
      
      const activePlayers = progressData.length;
      const averageLevel = progressData.length > 0 
        ? progressData.reduce((sum, p) => sum + (p.current_level || 1), 0) / progressData.length
        : 0;
      const totalPoints = progressData.reduce((sum, p) => sum + (p.total_points || 0), 0);
      
      // Get session data for completion rate
      const { data: sessionData } = await supabase
        .from('game_sessions')
        .select('session_status')
        .in('employee_id', employeeIds);
      
      const completionRate = sessionData && sessionData.length > 0
        ? (sessionData.filter(s => s.session_status === 'completed').length / sessionData.length) * 100
        : 0;
      
      // For now, use placeholder growth values (would need historical data for real calculations)
      return {
        activePlayers,
        averageLevel,
        totalPoints,
        completionRate,
        playerGrowth: 12, // Placeholder
        levelGrowth: 0.3, // Placeholder
        pointsGrowth: 8340, // Placeholder
        completionGrowth: 5 // Placeholder
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!userProfile?.company_id,
  });
};

export const useMissionAnalytics = () => {
  const { userProfile } = useAuth();

  return useQuery({
    queryKey: ['mission-analytics', userProfile?.company_id],
    queryFn: async (): Promise<MissionAnalyticsData> => {
      if (!userProfile?.company_id) {
        throw new Error('No company ID available');
      }

      // Get employees for this company first
      const { data: employees, error: employeesError } = await supabase
        .from('employees')
        .select('id')
        .eq('company_id', userProfile.company_id);

      if (employeesError) throw employeesError;
      
      const employeeIds = employees?.map(e => e.id) || [];

      if (employeeIds.length === 0) {
        return { missionData: [], categoryStats: [] };
      }

      // Fetch missions with their session data, filtered by company
      const { data: missions, error } = await supabase
        .from('game_missions')
        .select(`
          *,
          game_sessions (
            id,
            points_earned,
            accuracy_percentage,
            time_spent_seconds,
            session_status,
            questions_answered,
            correct_answers,
            employee_id
          )
        `)
        .eq('company_id', userProfile.company_id);
      
      if (error) throw error;
      
      const categoryEmojis: Record<string, { emoji: string; color: string }> = {
        finance: { emoji: '💰', color: 'bg-green-100' },
        hr: { emoji: '👥', color: 'bg-purple-100' },
        production: { emoji: '⚙️', color: 'bg-orange-100' },
        marketing: { emoji: '📈', color: 'bg-blue-100' },
        general: { emoji: '🎯', color: 'bg-gray-100' }
      };
      
      // Process mission data
      const missionData: MissionData[] = missions?.map(mission => {
        const sessions = mission.game_sessions?.filter(s => employeeIds.includes(s.employee_id)) || [];
        const completedSessions = sessions.filter(s => s.session_status === 'completed');
        
        const completion_rate = sessions.length > 0 
          ? (completedSessions.length / sessions.length) * 100 
          : 0;
        
        const avg_accuracy = completedSessions.length > 0
          ? completedSessions.reduce((sum, s) => sum + (s.accuracy_percentage || 0), 0) / completedSessions.length
          : 0;
        
        const avg_time_minutes = completedSessions.length > 0
          ? completedSessions.reduce((sum, s) => sum + (s.time_spent_seconds || 0), 0) / completedSessions.length / 60
          : 0;
        
        return {
          mission_title: mission.mission_title,
          category: mission.category || 'general',
          difficulty_level: mission.difficulty_level,
          play_count: sessions.length,
          completion_rate: Math.round(completion_rate),
          avg_accuracy: Math.round(avg_accuracy),
          avg_time_minutes: Math.round(avg_time_minutes * 10) / 10
        };
      }) || [];
      
      // Process category stats
      const categoryMap = new Map<string, {
        missions: MissionData[];
        name: string;
        emoji: string;
        color: string;
      }>();
      
      missionData.forEach(mission => {
        const category = mission.category;
        if (!categoryMap.has(category)) {
          categoryMap.set(category, {
            missions: [],
            name: category.charAt(0).toUpperCase() + category.slice(1),
            emoji: categoryEmojis[category]?.emoji || '🎯',
            color: categoryEmojis[category]?.color || 'bg-gray-100'
          });
        }
        categoryMap.get(category)!.missions.push(mission);
      });
      
      const categoryStats: CategoryStats[] = Array.from(categoryMap.values()).map(cat => {
        const missions = cat.missions;
        const totalPlays = missions.reduce((sum, m) => sum + m.play_count, 0);
        const avgCompletion = missions.length > 0
          ? missions.reduce((sum, m) => sum + m.completion_rate, 0) / missions.length
          : 0;
        const avgAccuracy = missions.length > 0
          ? missions.reduce((sum, m) => sum + m.avg_accuracy, 0) / missions.length
          : 0;
        const avgTime = missions.length > 0
          ? missions.reduce((sum, m) => sum + m.avg_time_minutes, 0) / missions.length
          : 0;
        
        return {
          name: cat.name,
          emoji: cat.emoji,
          color: cat.color,
          mission_count: missions.length,
          completion_rate: Math.round(avgCompletion),
          avg_accuracy: Math.round(avgAccuracy),
          avg_time: Math.round(avgTime * 10) / 10
        };
      });
      
      return {
        missionData,
        categoryStats
      };
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!userProfile?.company_id,
  });
};

export const usePlayerAnalytics = () => {
  const { userProfile } = useAuth();

  return useQuery({
    queryKey: ['player-analytics', userProfile?.company_id],
    queryFn: async (): Promise<PlayerAnalyticsData> => {
      if (!userProfile?.company_id) {
        throw new Error('No company ID available');
      }

      // Get employees for this company first
      const { data: employees, error: employeesError } = await supabase
        .from('employees')
        .select('id')
        .eq('company_id', userProfile.company_id);

      if (employeesError) throw employeesError;
      
      const employeeIds = employees?.map(e => e.id) || [];

      if (employeeIds.length === 0) {
        return {
          segments: { high: { count: 0, percentage: 0 }, regular: { count: 0, percentage: 0 }, beginner: { count: 0, percentage: 0 } },
          levelDistribution: [],
          topPerformers: []
        };
      }

      const { data: players, error } = await supabase
        .from('employee_game_progress')
        .select(`
          *,
          employees!inner (
            user_id,
            users (
              full_name
            )
          )
        `)
        .in('employee_id', employeeIds)
        .order('total_points', { ascending: false });
      
      if (error) throw error;
      
      const totalPlayers = players.length;
      
      // Calculate player segments based on performance
      let highPerformers = 0;
      let regularPlayers = 0;
      let beginners = 0;
      
      // Get session data to calculate weekly mission counts and accuracy
      const { data: sessions } = await supabase
        .from('game_sessions')
        .select('employee_id, accuracy_percentage, started_at')
        .gte('started_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
      
      const playerSessionMap = new Map<string, Array<{ accuracy: number }>>();
      sessions?.forEach(session => {
        if (!playerSessionMap.has(session.employee_id)) {
          playerSessionMap.set(session.employee_id, []);
        }
        playerSessionMap.get(session.employee_id)!.push({
          accuracy: session.accuracy_percentage || 0
        });
      });
      
      players.forEach(player => {
        const playerSessions = playerSessionMap.get(player.employee_id) || [];
        const weeklyMissions = playerSessions.length;
        const avgAccuracy = playerSessions.length > 0
          ? playerSessions.reduce((sum, s) => sum + s.accuracy, 0) / playerSessions.length
          : 0;
        
        if (avgAccuracy > 80 && weeklyMissions > 10) {
          highPerformers++;
        } else if (avgAccuracy >= 50 && weeklyMissions >= 5) {
          regularPlayers++;
        } else {
          beginners++;
        }
      });
      
      // Level distribution
      const levelRanges = [
        { range: '1-2', min: 1, max: 2 },
        { range: '3-4', min: 3, max: 4 },
        { range: '5-6', min: 5, max: 6 },
        { range: '7-9', min: 7, max: 9 },
        { range: '10+', min: 10, max: 999 }
      ];
      
      const levelDistribution = levelRanges.map(range => ({
        level_range: range.range,
        player_count: players.filter(p => 
          (p.current_level || 1) >= range.min && (p.current_level || 1) <= range.max
        ).length
      }));
      
      // Top performers (top 10)
      const topPerformers: PlayerData[] = players.slice(0, 10).map(player => {
        const playerSessions = playerSessionMap.get(player.employee_id) || [];
        const accuracy = playerSessions.length > 0
          ? playerSessions.reduce((sum, s) => sum + s.accuracy, 0) / playerSessions.length
          : 0;
        
        // Get employee name from the joined data
        const employeeName = player.employees?.users?.full_name || `Employee ${player.employee_id.slice(0, 8)}`;
        
        return {
          employee_id: player.employee_id,
          employee_name: employeeName,
          current_level: player.current_level || 1,
          total_points: player.total_points || 0,
          current_streak: player.current_streak || 0,
          accuracy: Math.round(accuracy)
        };
      });
      
      return {
        segments: {
          high: {
            count: highPerformers,
            percentage: totalPlayers > 0 ? Math.round((highPerformers / totalPlayers) * 100) : 0
          },
          regular: {
            count: regularPlayers,
            percentage: totalPlayers > 0 ? Math.round((regularPlayers / totalPlayers) * 100) : 0
          },
          beginner: {
            count: beginners,
            percentage: totalPlayers > 0 ? Math.round((beginners / totalPlayers) * 100) : 0
          }
        },
        levelDistribution,
        topPerformers
      };
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useActivityAnalytics = () => {
  const { userProfile } = useAuth();

  return useQuery({
    queryKey: ['activity-analytics', userProfile?.company_id],
    queryFn: async (): Promise<ActivityData> => {
      if (!userProfile?.company_id) {
        throw new Error('No company ID available');
      }

      // Get employees for this company first
      const { data: employees, error: employeesError } = await supabase
        .from('employees')
        .select('id')
        .eq('company_id', userProfile.company_id);

      if (employeesError) throw employeesError;
      
      const employeeIds = employees?.map(e => e.id) || [];

      if (employeeIds.length === 0) {
        return {
          todaySessions: 0,
          avgDuration: 0,
          activeStreaks: 0,
          todayAchievements: 0,
          puzzleProgress: [],
          recentActivity: []
        };
      }

      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      // Get today's sessions for company employees
      const { data: todaySessions } = await supabase
        .from('game_sessions')
        .select('*')
        .in('employee_id', employeeIds)
        .gte('started_at', todayStart.toISOString());
      
      // Calculate average duration
      const completedSessions = todaySessions?.filter(s => s.session_status === 'completed') || [];
      const avgDuration = completedSessions.length > 0
        ? completedSessions.reduce((sum, s) => sum + (s.time_spent_seconds || 0), 0) / completedSessions.length / 60
        : 0;
      
      // Get active streaks for company employees
      const { data: progressData } = await supabase
        .from('employee_game_progress')
        .select('current_streak')
        .in('employee_id', employeeIds);
      
      const activeStreaks = progressData?.filter(p => (p.current_streak || 0) > 0).length || 0;
      
      // Get puzzle progress for company employees
      const { data: puzzleData } = await supabase
        .from('puzzle_progress')
        .select('*')
        .in('employee_id', employeeIds);
      
      const categoryPuzzleMap = new Map<string, { unlocked: number; total: number }>();
      const categoryEmojis: Record<string, string> = {
        finance: '💰',
        hr: '👥',
        production: '⚙️',
        marketing: '📈'
      };
      
      puzzleData?.forEach(puzzle => {
        const category = puzzle.category.toLowerCase(); // Normalize category case
        if (!categoryPuzzleMap.has(category)) {
          categoryPuzzleMap.set(category, { unlocked: 0, total: 0 });
        }
        const current = categoryPuzzleMap.get(category)!;
        current.unlocked += puzzle.pieces_unlocked || 0;
        current.total += puzzle.total_pieces || 0;
      });
      
      const puzzleProgress = Array.from(categoryPuzzleMap.entries()).map(([category, data]) => ({
        category: category.charAt(0).toUpperCase() + category.slice(1),
        emoji: categoryEmojis[category.toLowerCase()] || '🧩',
        pieces_unlocked: data.unlocked,
        total_pieces: data.total,
        completion_percentage: data.total > 0 ? Math.round((data.unlocked / data.total) * 100) : 0
      }));
      
      // Get recent activity (simplified for now)
      const recentActivity = todaySessions?.slice(0, 5).map((session, index) => ({
        type: 'mission_complete' as const,
        message: `Mission completed with ${session.accuracy_percentage || 0}% accuracy`,
        timestamp: new Date(Date.now() - index * 60000).toISOString(),
        points: session.points_earned || 0
      })) || [];
      
      return {
        todaySessions: todaySessions?.length || 0,
        avgDuration: Math.round(avgDuration * 10) / 10,
        activeStreaks,
        todayAchievements: 5, // Placeholder - would need achievement tracking
        puzzleProgress,
        recentActivity
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes for activity data
    enabled: !!userProfile?.company_id,
  });
};