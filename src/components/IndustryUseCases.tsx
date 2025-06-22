
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, GraduationCap, Stethoscope } from "lucide-react";

const IndustryUseCases = () => {
  const useCases = [
    {
      industry: "Financial Services",
      icon: Building2,
      challenge: "Compliance training engagement was at 45%",
      solution: "Used emotional analysis to identify confusing content sections",
      result: "Increased engagement to 89% and reduced compliance violations by 60%",
      color: "from-blue-500 to-cyan-500"
    },
    {
      industry: "Healthcare",
      icon: Stethoscope,
      challenge: "New nurses struggling with complex procedures",
      solution: "Predictive insights flagged at-risk learners early",
      result: "Reduced onboarding time by 40% and improved patient safety scores",
      color: "from-green-500 to-emerald-500"
    },
    {
      industry: "Technology",
      icon: GraduationCap,
      challenge: "Technical training completion rates below 70%",
      solution: "Adaptive content delivery based on skill gaps",
      result: "95% completion rate and 25% faster skill acquisition",
      color: "from-purple-500 to-pink-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {useCases.map((useCase, index) => {
        const IconComponent = useCase.icon;
        return (
          <Card key={index} className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 rounded-3xl">
            <CardHeader className="text-center pb-4">
              <div className={`w-16 h-16 bg-gradient-to-br ${useCase.color} rounded-3xl flex items-center justify-center mx-auto mb-4`}>
                <IconComponent className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-lg font-semibold text-business-black">
                {useCase.industry}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-red-600 mb-1">Challenge:</p>
                <p className="text-sm text-business-black/70">{useCase.challenge}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">Solution:</p>
                <p className="text-sm text-business-black/70">{useCase.solution}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">Result:</p>
                <p className="text-sm text-business-black/70">{useCase.result}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default IndustryUseCases;
