import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Star, 
  Lock, 
  Unlock,
  TrendingUp,
  DollarSign,
  Users,
  Briefcase,
  Target,
  Award,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PuzzleProgressProps {
  employeeId: string;
  skillName: string;
  skillId: string;
  currentLevel: number;
  requiredLevel: number;
  pointsEarned?: number;
  onClose?: () => void;
}

interface PuzzlePiece {
  id: number;
  unlocked: boolean;
  category: string;
  unlockedAt?: string;
}

interface PuzzleData {
  id: string;
  category: string;
  puzzle_size: number;
  pieces_unlocked: number;
  total_pieces: number;
  completed_at?: string;
}

const SKILL_THEMES = {
  technical: {
    icon: Briefcase,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    gradient: 'from-blue-400 to-cyan-500',
    symbol: '⚡',
    pieces: ['💻', '⚡', '🔧', '🚀', '💡', '🎯', '🔥', '⭐', '🏆']
  },
  soft: {
    icon: Users,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    gradient: 'from-purple-400 to-violet-500',
    symbol: '👥',
    pieces: ['👤', '🤝', '💼', '🎓', '⭐', '🏆', '💪', '🎊', '🎯']
  },
  domain: {
    icon: Target,
    color: 'text-green-600',
    bg: 'bg-green-50',
    gradient: 'from-green-400 to-emerald-500',
    symbol: '🎯',
    pieces: ['📊', '📈', '💹', '🏦', '💎', '🪙', '📱', '🌟', '🎪']
  },
  tool: {
    icon: DollarSign,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    gradient: 'from-orange-400 to-amber-500',
    symbol: '🛠️',
    pieces: ['🔧', '⚙️', '🏭', '📦', '🚛', '📋', '⚡', '🎯', '🔥']
  },
  language: {
    icon: TrendingUp,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    gradient: 'from-indigo-400 to-purple-500',
    symbol: '🗣️',
    pieces: ['🗣️', '🌍', '📝', '💬', '🎭', '🎪', '🌟', '⭐', '🏆']
  },
  general: {
    icon: Target,
    color: 'text-gray-600',
    bg: 'bg-gray-50',
    gradient: 'from-gray-400 to-slate-500',
    symbol: '🎯',
    pieces: ['📚', '💡', '🎯', '⭐', '🏆', '🎊', '🚀', '💎', '🎪']
  }
};

export default function PuzzleProgress({ employeeId, skillName, skillId, currentLevel, requiredLevel, pointsEarned = 0, onClose }: PuzzleProgressProps) {
  const { userProfile } = useAuth();
  const [puzzleData, setPuzzleData] = useState<PuzzleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [newPieceUnlocked, setNewPieceUnlocked] = useState(false);
  const [puzzleCompleted, setPuzzleCompleted] = useState(false);

  // Determine skill type for theming
  const skillType = skillName.toLowerCase().includes('javascript') || skillName.toLowerCase().includes('python') || skillName.toLowerCase().includes('aws') ? 'technical' :
                   skillName.toLowerCase().includes('communication') || skillName.toLowerCase().includes('leadership') ? 'soft' :
                   skillName.toLowerCase().includes('finance') || skillName.toLowerCase().includes('marketing') ? 'domain' : 'general';
  
  const theme = SKILL_THEMES[skillType as keyof typeof SKILL_THEMES] || SKILL_THEMES.general;
  const CategoryIcon = theme.icon;

  useEffect(() => {
    if (employeeId && skillId) {
      loadPuzzleProgress();
    }
  }, [employeeId, skillId]);

  const loadPuzzleProgress = async () => {
    try {
      setLoading(true);

      // Get current puzzle progress for this skill
      const { data: currentPuzzle } = await supabase
        .from('puzzle_progress')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('skill_id', skillId)
        .order('puzzle_size', { ascending: false })
        .limit(1)
        .single();

      if (currentPuzzle) {
        setPuzzleData(currentPuzzle);
        
        // Check if we should unlock a new piece
        if (pointsEarned > 0) {
          await unlockNewPiece(currentPuzzle);
        }
      } else {
        // Create initial 2x2 puzzle
        await createInitialPuzzle();
      }
    } catch (error) {
      console.error('Error loading puzzle progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const createInitialPuzzle = async () => {
    try {
      const initialPuzzle = {
        employee_id: employeeId,
        skill_id: skillId,
        skill_name: skillName,
        puzzle_size: 4, // 2x2
        pieces_unlocked: pointsEarned > 0 ? 1 : 0,
        total_pieces: 4,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('puzzle_progress')
        .insert(initialPuzzle)
        .select()
        .single();

      if (error) throw error;
      
      setPuzzleData(data);
      if (pointsEarned > 0) {
        setNewPieceUnlocked(true);
      }
    } catch (error) {
      console.error('Error creating initial puzzle:', error);
    }
  };

  const unlockNewPiece = async (currentPuzzle: PuzzleData) => {
    try {
      const newPiecesUnlocked = Math.min(
        currentPuzzle.total_pieces,
        currentPuzzle.pieces_unlocked + 1
      );

      const updates: any = {
        pieces_unlocked: newPiecesUnlocked,
        updated_at: new Date().toISOString()
      };

      // Check if puzzle is completed
      if (newPiecesUnlocked >= currentPuzzle.total_pieces) {
        updates.completed_at = new Date().toISOString();
        setPuzzleCompleted(true);
        
        // Create next level puzzle
        setTimeout(() => createNextLevelPuzzle(currentPuzzle.puzzle_size), 2000);
      }

      const { data, error } = await supabase
        .from('puzzle_progress')
        .update(updates)
        .eq('id', currentPuzzle.id)
        .select()
        .single();

      if (error) throw error;
      
      setPuzzleData(data);
      setNewPieceUnlocked(true);
    } catch (error) {
      console.error('Error unlocking puzzle piece:', error);
    }
  };

  const createNextLevelPuzzle = async (currentSize: number) => {
    try {
      const nextSize = getNextPuzzleSize(currentSize);
      
      const nextPuzzle = {
        employee_id: employeeId,
        skill_id: skillId,
        skill_name: skillName,
        puzzle_size: nextSize,
        pieces_unlocked: 0,
        total_pieces: nextSize,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('puzzle_progress')
        .insert(nextPuzzle)
        .select()
        .single();

      if (error) throw error;
      
      setPuzzleData(data);
      setPuzzleCompleted(false);
      setNewPieceUnlocked(false);
    } catch (error) {
      console.error('Error creating next level puzzle:', error);
    }
  };

  const getNextPuzzleSize = (currentSize: number): number => {
    // 2x2 (4) → 3x3 (9) → 4x4 (16) → 5x5 (25)
    switch (currentSize) {
      case 4: return 9;
      case 9: return 16;
      case 16: return 25;
      default: return currentSize + 9;
    }
  };

  const getPuzzleDimensions = (size: number): { rows: number; cols: number } => {
    const sqrt = Math.sqrt(size);
    return { rows: sqrt, cols: sqrt };
  };

  const renderPuzzleGrid = () => {
    if (!puzzleData) return null;

    const { rows, cols } = getPuzzleDimensions(puzzleData.total_pieces);
    const pieces = [];

    for (let i = 0; i < puzzleData.total_pieces; i++) {
      const isUnlocked = i < puzzleData.pieces_unlocked;
      const isNewPiece = newPieceUnlocked && i === puzzleData.pieces_unlocked - 1;
      const pieceEmoji = theme.pieces[i % theme.pieces.length];

      pieces.push(
        <div
          key={i}
          className={`
            aspect-square rounded-lg border-2 flex items-center justify-center text-lg font-bold transition-all duration-500
            ${isUnlocked 
              ? `bg-gradient-to-br ${theme.gradient} border-white shadow-lg text-white ${isNewPiece ? 'animate-pulse scale-110' : ''}` 
              : 'bg-gray-100 border-gray-300 text-gray-400'
            }
          `}
        >
          {isUnlocked ? (
            <span className={`text-xl ${isNewPiece ? 'animate-bounce' : ''}`}>
              {pieceEmoji}
            </span>
          ) : (
            <Lock className="h-4 w-4" />
          )}
        </div>
      );
    }

    return (
      <div 
        className={`grid gap-2 max-w-xs mx-auto`}
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {pieces}
      </div>
    );
  };

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  const progressPercentage = puzzleData 
    ? (puzzleData.pieces_unlocked / puzzleData.total_pieces) * 100 
    : 0;

  const { rows, cols } = puzzleData ? getPuzzleDimensions(puzzleData.total_pieces) : { rows: 2, cols: 2 };

  return (
    <Card className={`w-full max-w-md mx-auto ${theme.bg} border-2 border-primary/20`}>
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <CategoryIcon className={`h-6 w-6 ${theme.color}`} />
          <span className="text-2xl">{theme.symbol}</span>
        </div>
        <CardTitle className="text-xl">
          {skillName} Mastery
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Level {currentLevel} → {requiredLevel}
        </p>
        <div className="flex items-center justify-center gap-2">
          <Badge variant="outline">
            {rows}×{cols} Grid
          </Badge>
          <Badge className="bg-primary">
            {puzzleData?.pieces_unlocked}/{puzzleData?.total_pieces} pieces
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* New piece unlock celebration */}
        {newPieceUnlocked && !puzzleCompleted && (
          <div className="text-center bg-white/80 p-4 rounded-lg border-2 border-primary animate-pulse">
            <Sparkles className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
            <h3 className="font-semibold text-lg">🎉 New Piece Unlocked!</h3>
            <p className="text-sm text-muted-foreground">
              Great job! You earned {pointsEarned} points and unlocked a new puzzle piece!
            </p>
          </div>
        )}

        {/* Puzzle completion celebration */}
        {puzzleCompleted && (
          <div className="text-center bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border-2 border-yellow-300">
            <Trophy className="h-12 w-12 mx-auto mb-2 text-yellow-500" />
            <h3 className="font-semibold text-xl">🏆 Puzzle Complete!</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Amazing! You've completed the {rows}×{cols} {skillName} puzzle!
            </p>
            <Badge className="bg-yellow-500 text-white">
              🎯 Next Level: {Math.sqrt(getNextPuzzleSize(puzzleData?.total_pieces || 4))}×{Math.sqrt(getNextPuzzleSize(puzzleData?.total_pieces || 4))} Grid
            </Badge>
          </div>
        )}

        {/* Puzzle grid */}
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span className="font-medium">{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
          
          {renderPuzzleGrid()}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-white/60 p-3 rounded-lg">
            <div className="font-semibold text-lg">{puzzleData?.pieces_unlocked}</div>
            <div className="text-xs text-muted-foreground">Pieces Unlocked</div>
          </div>
          <div className="bg-white/60 p-3 rounded-lg">
            <div className="font-semibold text-lg">{progressPercentage.toFixed(0)}%</div>
            <div className="text-xs text-muted-foreground">Complete</div>
          </div>
        </div>

        {/* Action button */}
        {onClose && (
          <Button onClick={onClose} className="w-full">
            {puzzleCompleted ? '🎉 Continue to Next Level!' : '📖 Continue Learning'}
          </Button>
        )}

        {/* Next unlock hint */}
        {!puzzleCompleted && (
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              💡 Complete more {skillName} missions to unlock the next piece!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}