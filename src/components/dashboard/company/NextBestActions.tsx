import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Target, FileText, UploadCloud } from 'lucide-react';

interface NextBestActionsProps {
  criticalGaps: number;
  analysisCoveragePct: number; // 0-100
  industryAlignmentIndex?: number; // 0-10
  onAssignLearning: () => void;
  onViewSkills: () => void;
  onImportCVs: () => void;
}

const NextBestActions: React.FC<NextBestActionsProps> = ({
  criticalGaps,
  analysisCoveragePct,
  industryAlignmentIndex,
  onAssignLearning,
  onViewSkills,
  onImportCVs,
}) => {
  const actions: Array<{ label: string; onClick: () => void; icon: React.ReactNode; variant?: 'default' | 'outline' }> = [];

  if (criticalGaps > 0) {
    actions.push({ label: 'Assign learning to impacted roles', onClick: onAssignLearning, icon: <Target className="h-4 w-4" /> });
  }

  if (analysisCoveragePct < 60) {
    actions.push({ label: 'Analyze more CVs', onClick: onImportCVs, icon: <UploadCloud className="h-4 w-4" />, variant: 'outline' });
  }

  if (industryAlignmentIndex !== undefined && industryAlignmentIndex < 7 && actions.length < 2) {
    actions.push({ label: 'View market benchmark', onClick: onViewSkills, icon: <FileText className="h-4 w-4" />, variant: 'outline' });
  }

  // Ensure at least one action is present; if not, offer to view skills
  if (actions.length === 0) {
    actions.push({ label: 'Review skills analytics', onClick: onViewSkills, icon: <ArrowRight className="h-4 w-4" />, variant: 'outline' });
  }

  // Limit to two actions for clarity
  const visible = actions.slice(0, 2);

  return (
    <Card className="border border-neutral-200 bg-white transition-shadow hover:shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold tracking-[-0.01em]">Next Best Actions</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 flex flex-col sm:flex-row gap-2 sm:gap-3">
        {visible.map((a, idx) => (
          <Button key={idx} onClick={a.onClick} variant={a.variant ?? 'default'} size="sm" className="justify-start sm:justify-center">
            <span className="mr-2">{a.icon}</span>
            {a.label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};

export default NextBestActions;


