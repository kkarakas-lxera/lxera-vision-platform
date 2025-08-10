import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface RiskItem {
  position: string;
  coverage: number; // 0-100
  employeesInPosition: number;
}

interface TopRisksProps {
  positions: RiskItem[];
  maxItems: number;
  onViewAll: () => void;
  isTrial?: boolean;
}

const TopRisks: React.FC<TopRisksProps> = ({ positions, maxItems, onViewAll, isTrial }) => {
  const top = [...positions]
    .sort((a, b) => (a.coverage ?? 0) - (b.coverage ?? 0))
    .slice(0, Math.max(0, maxItems));

  return (
    <Card className={cn('border border-neutral-200 bg-white transition-shadow hover:shadow-sm', isTrial && 'bg-white/60 backdrop-blur-sm border-indigo-100')}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2 tracking-[-0.01em]">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            Top Risks
          </CardTitle>
          <Button size="sm" variant="ghost" onClick={onViewAll} className="text-muted-foreground">View all</Button>
        </div>
      </CardHeader>
      <CardContent>
        {top.length === 0 ? (
          <div className="text-sm text-muted-foreground">No risks identified yet.</div>
        ) : (
          <div className="space-y-3">
            {top.map((item, idx) => {
              const severity: 'critical' | 'moderate' | 'ok' = item.coverage < 60 ? 'critical' : item.coverage < 80 ? 'moderate' : 'ok';
              return (
                <div key={`${item.position}-${idx}`} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-neutral-900">{item.position}</span>
                      <Badge variant={severity === 'critical' ? 'destructive' : 'outline'} className={cn(severity === 'moderate' && 'border-orange-300 text-orange-700')}>
                        {severity === 'critical' ? 'Critical' : severity === 'moderate' ? 'Needs Work' : 'OK'}
                      </Badge>
                    </div>
                    <span className={cn('font-medium tracking-[-0.01em]', severity === 'critical' ? 'text-red-600' : severity === 'moderate' ? 'text-orange-600' : 'text-green-700')}>
                      {Math.round(item.coverage)}%
                    </span>
                  </div>
                  <Progress value={item.coverage} className={cn('h-1.5', item.coverage < 60 && '[&>div]:bg-red-500', item.coverage >= 60 && item.coverage < 80 && '[&>div]:bg-orange-500')} />
                  <div className="text-xs text-muted-foreground">{item.employeesInPosition} employees in role</div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TopRisks;


