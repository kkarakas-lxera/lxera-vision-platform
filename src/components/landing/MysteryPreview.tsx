import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MysteryPreviewProps {
  spotsRemaining: number;
  selectedIndustry: string;
  onIndustrySelect: (industry: string) => void;
}

const MysteryPreview: React.FC<MysteryPreviewProps> = ({ spotsRemaining, selectedIndustry, onIndustrySelect }) => {
  const [showPreview, setShowPreview] = useState(false);

  const getIndustrySpecificData = (industry: string) => {
    const industryData = {
      'Technology': {
        gaps: [
          { skill: 'React Server Components', gap: 78 },
          { skill: 'Performance Optimization', gap: 65 },
          { skill: 'Advanced TypeScript', gap: 52 }
        ],
        impact: { employees: 34, savings: '$127K' }
      },
      'Healthcare': {
        gaps: [
          { skill: 'HIPAA Compliance', gap: 82 },
          { skill: 'Data Security', gap: 71 },
          { skill: 'Healthcare Analytics', gap: 58 }
        ],
        impact: { employees: 28, savings: '$165K' }
      },
      'Finance': {
        gaps: [
          { skill: 'Risk Management', gap: 75 },
          { skill: 'Regulatory Compliance', gap: 68 },
          { skill: 'Financial Analytics', gap: 63 }
        ],
        impact: { employees: 42, savings: '$198K' }
      },
      'Manufacturing': {
        gaps: [
          { skill: 'Lean Manufacturing', gap: 71 },
          { skill: 'Quality Control', gap: 66 },
          { skill: 'Supply Chain Management', gap: 59 }
        ],
        impact: { employees: 56, savings: '$234K' }
      },
      'Education': {
        gaps: [
          { skill: 'Digital Learning', gap: 73 },
          { skill: 'Student Analytics', gap: 67 },
          { skill: 'Educational Technology', gap: 61 }
        ],
        impact: { employees: 23, savings: '$89K' }
      },
      'Retail': {
        gaps: [
          { skill: 'Customer Experience', gap: 77 },
          { skill: 'E-commerce', gap: 69 },
          { skill: 'Inventory Management', gap: 56 }
        ],
        impact: { employees: 38, savings: '$156K' }
      }
    };
    return industryData[industry] || industryData['Technology'];
  };

  const currentData = getIndustrySpecificData(selectedIndustry);
  const industries = ['Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Education', 'Retail'];

  return (
    <section className="py-16 bg-gradient-to-br from-white via-future-green/5 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-business-black mb-6">
            See What We Found About{' '}
            <span className="text-future-green">{selectedIndustry}</span> Teams
          </h2>
          <p className="text-xl text-business-black/70 max-w-3xl mx-auto mb-6">
            {selectedIndustry} companies are missing these critical skills
          </p>
          
          {/* Inline Industry Selector */}
          <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
            {industries.map((industry) => (
              <Button
                key={industry}
                onClick={() => onIndustrySelect(industry)}
                variant="outline"
                size="sm"
                className={`text-sm transition-all duration-200 ${
                  selectedIndustry === industry
                    ? 'bg-future-green text-business-black border-future-green hover:bg-future-green/90'
                    : 'bg-white text-business-black/70 border-business-black/20 hover:bg-future-green/10 hover:text-business-black hover:border-future-green'
                }`}
              >
                {industry}
              </Button>
            ))}
          </div>
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
                    <h3 className="text-xl font-semibold text-business-black">Critical Skills Gaps Identified</h3>
                    <Badge variant="destructive" className="bg-future-green text-business-black">78% Gap Rate</Badge>
                  </div>
                  
                  <div className="space-y-4">
                    {currentData.gaps.map((gap, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-business-black/80">{gap.skill}</span>
                        <div className="flex items-center gap-3">
                          <Progress value={gap.gap} className="w-32" />
                          <span className="text-sm text-business-black/70">{gap.gap}% gap</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-future-green/10 p-4 rounded-lg">
                    <p className="text-sm text-business-black">
                      <strong>Impact:</strong> {currentData.impact.employees} employees affected • {currentData.impact.savings} potential savings
                    </p>
                  </div>
                </div>
              </div>

              {/* Overlay */}
              {!showPreview && (
                <div className="absolute inset-0 flex items-center justify-center bg-business-black/10">
                  <div className="text-center">
                    <Button
                      onClick={() => setShowPreview(true)}
                      className="bg-gradient-to-r from-future-green to-future-green/90 hover:from-future-green/90 hover:to-future-green text-business-black font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Eye className="mr-2 h-5 w-5" />
                      Unlock Your Team's Specific Gaps
                    </Button>
                    <p className="text-sm text-business-black/70 mt-3">
                      ⚠️ This analysis has limited availability
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