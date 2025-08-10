import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, FileText } from 'lucide-react';

interface MarketStripProps {
  marketCoveragePct: number; // 0-100
  industryAlignmentIndex: number; // 0-10
  topMissingSkills: Array<{ skill_name: string; severity: 'critical' | 'moderate' | 'minor' }>; 
  latestReport?: { id: string; generated_at: string; pdf_url?: string } | null;
  onViewReport: () => void;
}

const MarketStrip: React.FC<MarketStripProps> = ({
  marketCoveragePct,
  industryAlignmentIndex,
  topMissingSkills,
  latestReport,
  onViewReport,
}) => {
  return (
    <Card className="border border-neutral-200 bg-white transition-shadow hover:shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2 tracking-[-0.01em]">
            <TrendingUp className="h-4 w-4 text-neutral-700" />
            Market Alignment
          </CardTitle>
          <Badge variant="outline" className="text-[11px] sm:text-xs">
            Alignment {Math.max(0, Math.min(10, Math.round(industryAlignmentIndex)))}/10
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-6">
          <div>
            <div className="text-[11px] sm:text-xs text-muted-foreground">Market Coverage</div>
            <div className="text-lg sm:text-xl font-semibold tracking-[-0.01em]">{Math.max(0, Math.min(100, Math.round(marketCoveragePct)))}%</div>
          </div>
          <div className="hidden md:block h-8 w-px bg-muted" />
          <div>
            <div className="text-[11px] sm:text-xs text-muted-foreground mb-1">Top Missing Skills</div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {topMissingSkills.slice(0, 3).map((s, idx) => (
                <Badge key={`${s.skill_name}-${idx}`} variant={s.severity === 'critical' ? 'destructive' : 'outline'} className="text-[11px] sm:text-xs">
                  {s.skill_name}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <div className="shrink-0">
          <Button onClick={onViewReport} variant="outline" size="sm">
            <FileText className="h-3.5 w-3.5 mr-2" />
            {latestReport ? 'View Executive Report' : 'Generate Executive Report'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketStrip;


