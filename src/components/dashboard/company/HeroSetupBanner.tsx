import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Building2, Users, CheckCircle2, Target } from 'lucide-react';

interface HeroSetupBannerProps {
  positionsCount: number;
  totalEmployees: number;
  analyzedCVs: number;
  executiveSummary?: string;
  onNavigate: (path: string) => void;
}

const HeroSetupBanner: React.FC<HeroSetupBannerProps> = ({
  positionsCount,
  totalEmployees,
  analyzedCVs,
  executiveSummary,
  onNavigate,
}) => {
  const hasPositions = positionsCount > 0;
  const hasEmployees = totalEmployees > 0;
  const coveragePct = hasEmployees ? Math.round((analyzedCVs / totalEmployees) * 100) : 0;

  let title = 'You are all set';
  let description = executiveSummary || 'Review your skills analytics and address top gaps.';
  let ctaLabel = 'View Skills Analytics';
  let ctaPath = '/dashboard/skills';
  let icon = <CheckCircle2 className="h-5 w-5" />;

  if (!hasPositions) {
    title = 'Create your first position';
    description = 'Define roles to start tracking skills gaps and readiness.';
    ctaLabel = 'Create Position';
    ctaPath = '/dashboard/positions';
    icon = <Building2 className="h-5 w-5" />;
  } else if (!hasEmployees) {
    title = 'Import your team';
    description = 'Add employees to analyze their skills and get a health snapshot.';
    ctaLabel = 'Import Employees';
    ctaPath = '/dashboard/onboarding';
    icon = <Users className="h-5 w-5" />;
  } else if (coveragePct < 50) {
    title = 'Increase analysis coverage';
    description = `Only ${coveragePct}% of employees analyzed. Upload CVs to unlock insights.`;
    ctaLabel = 'Analyze More CVs';
    ctaPath = '/dashboard/employees?tab=import';
    icon = <Target className="h-5 w-5" />;
  }

  return (
    <Card className="border border-neutral-200 bg-white/80 backdrop-blur transition-shadow hover:shadow-sm">
      <CardContent className="p-4 sm:p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
        <div className="flex items-start md:items-center gap-3 md:gap-4">
          <div className="p-2 rounded-md bg-white border border-neutral-200 text-neutral-800 shadow-sm">
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base md:text-lg font-semibold text-neutral-900 tracking-[-0.01em]">{title}</h2>
              {hasEmployees && (
                <Badge variant="outline" className="text-[11px] sm:text-xs">
                  Coverage {coveragePct}%
                </Badge>
              )}
            </div>
            <p className="text-[13px] sm:text-sm text-neutral-600 mt-1 md:mt-1.5 max-w-2xl line-clamp-2">{description}</p>
          </div>
        </div>
        <div className="shrink-0 w-full md:w-auto">
          <Button onClick={() => onNavigate(ctaPath)} className="w-full md:w-auto">
            {ctaLabel}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default HeroSetupBanner;


