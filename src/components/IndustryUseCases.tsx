
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, GraduationCap, Stethoscope } from "lucide-react";

const IndustryUseCases = () => {
  const useCases = [
    {
      industry: "Financial Services",
      icon: Building2,
      challenge: "Compliance training engagement was at 45%",
      solution: "Used emotional analysis to identify confusing content sections",
      result: "Increased engagement to 89% and reduced compliance violations by 60%",
      metric: "89%",
      metricLabel: "engagement rate",
      improvement: "+44%",
      color: "from-blue-500 to-cyan-500"
    },
    {
      industry: "Healthcare",
      icon: Stethoscope,
      challenge: "New nurses struggling with complex procedures",
      solution: "Predictive insights flagged at-risk learners early",
      result: "Reduced onboarding time by 40% and improved patient safety scores",
      metric: "40%",
      metricLabel: "faster onboarding",
      improvement: "-40%",
      color: "from-green-500 to-emerald-500"
    },
    {
      industry: "Technology",
      icon: GraduationCap,
      challenge: "Technical training completion rates below 70%",
      solution: "Adaptive content delivery based on skill gaps",
      result: "95% completion rate and 25% faster skill acquisition",
      metric: "95%",
      metricLabel: "completion rate",
      improvement: "+25%",
      color: "from-purple-500 to-pink-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {useCases.map((useCase, index) => {
        const IconComponent = useCase.icon;
        return (
          <Card 
            key={index} 
            className={`
              group border-0 bg-gradient-to-br from-white via-white to-gray-50/30 
              backdrop-blur-sm shadow-lg hover:shadow-2xl 
              transition-all duration-500 rounded-3xl overflow-hidden
              hover:scale-105 hover:-translate-y-2
              animate-fade-in-up stagger-${index + 1}
            `}
          >
            <CardHeader className="text-center pb-6 relative">
              {/* Subtle background pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/50 to-transparent opacity-60"></div>
              
              <div className={`
                relative w-20 h-20 bg-gradient-to-br ${useCase.color} 
                rounded-3xl flex items-center justify-center mx-auto mb-6
                shadow-lg group-hover:shadow-xl transition-all duration-300
                group-hover:scale-110
              `}>
                <IconComponent className="w-10 h-10 text-white drop-shadow-sm" />
              </div>
              
              <CardTitle className="text-xl font-bold text-business-black mb-2">
                {useCase.industry}
              </CardTitle>
              
              {/* Prominent metric display */}
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="text-center">
                  <div className={`text-3xl font-bold bg-gradient-to-r ${useCase.color} bg-clip-text text-transparent`}>
                    {useCase.metric}
                  </div>
                  <div className="text-xs text-business-black/60 font-medium">
                    {useCase.metricLabel}
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 font-semibold">
                  {useCase.improvement}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6 px-6 pb-8">
              <div className="space-y-4">
                <div className="relative">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-bold text-red-600 mb-2">Challenge</p>
                      <p className="text-sm text-business-black/80 leading-relaxed">{useCase.challenge}</p>
                    </div>
                  </div>
                </div>
                
                <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                
                <div className="relative">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-bold text-blue-600 mb-2">Solution</p>
                      <p className="text-sm text-business-black/80 leading-relaxed">{useCase.solution}</p>
                    </div>
                  </div>
                </div>
                
                <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                
                <div className="relative">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-bold text-green-600 mb-2">Result</p>
                      <p className="text-sm text-business-black/80 leading-relaxed font-medium">{useCase.result}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default IndustryUseCases;
