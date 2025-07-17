import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MysteryPreviewProps {
  spotsRemaining: number;
}

const MysteryPreview: React.FC<MysteryPreviewProps> = ({ spotsRemaining }) => {
  const [showPreview, setShowPreview] = useState(false);

  const mockGaps = [
    { skill: 'React Server Components', gap: 78 },
    { skill: 'Performance Optimization', gap: 65 },
    { skill: 'Advanced TypeScript', gap: 52 }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            See What We Found About Teams Like Yours
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Companies in your industry are missing these critical skills
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="relative overflow-hidden">
            <CardContent className="p-8">
              <div className={cn(
                "transition-all duration-500",
                !showPreview && "filter blur-md"
              )}>
                {/* Mock Dashboard Preview */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-slate-900">Critical Skills Gaps Identified</h3>
                    <Badge variant="destructive">78% Gap Rate</Badge>
                  </div>
                  
                  <div className="space-y-4">
                    {mockGaps.map((gap, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-slate-700">{gap.skill}</span>
                        <div className="flex items-center gap-3">
                          <Progress value={gap.gap} className="w-32" />
                          <span className="text-sm text-slate-600">{gap.gap}% gap</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Impact:</strong> 34 employees affected • $127K potential savings
                    </p>
                  </div>
                </div>
              </div>

              {/* Overlay */}
              {!showPreview && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10">
                  <div className="text-center">
                    <Button
                      onClick={() => setShowPreview(true)}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Eye className="mr-2 h-5 w-5" />
                      Unlock Your Team's Specific Gaps
                    </Button>
                    <p className="text-sm text-slate-600 mt-3">
                      ⚠️ This analysis is only available for {spotsRemaining} more companies this month
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default MysteryPreview;