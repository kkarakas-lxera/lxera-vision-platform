import { Trophy, Zap, Upload, Clock } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const STEPS = [
  { id: 1, name: 'cv_upload', title: 'CV Upload' },
  { id: 2, name: 'work_experience', title: 'Work Experience' },
  { id: 3, name: 'education', title: 'Education' },
  { id: 4, name: 'skills', title: 'Skills Review' },
  { id: 5, name: 'current_work', title: 'Current Projects' },
  { id: 6, name: 'challenges', title: 'Challenges' },
  { id: 7, name: 'growth', title: 'Growth Areas' }
];

interface Achievement {
  name: string;
  points: number;
  icon: LucideIcon;
  iconClassName: string;
}

const ACHIEVEMENTS: Record<string, Achievement> = {
  QUICK_START: { name: "Quick Start", points: 50, icon: Zap, iconClassName: "h-6 w-6 text-yellow-600" },
  CV_UPLOADED: { name: "Document Master", points: 200, icon: Upload, iconClassName: "h-6 w-6 text-blue-600" },
  SPEED_DEMON: { name: "Speed Demon", points: 150, icon: Clock, iconClassName: "h-6 w-6 text-purple-600" },
  COMPLETIONIST: { name: "Profile Hero", points: 500, icon: Trophy, iconClassName: "h-6 w-6 text-gold-600" }
};

// Enable smart mode for natural language processing
const ENABLE_SMART_MODE = true;

export { STEPS, ACHIEVEMENTS, ENABLE_SMART_MODE };