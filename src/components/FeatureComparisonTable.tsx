
import { Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FeatureComparisonTable = () => {
  const comparisonData = [
    {
      feature: "Real-time engagement tracking",
      traditional: false,
      lxera: true
    },
    {
      feature: "Predictive analytics",
      traditional: false,
      lxera: true
    },
    {
      feature: "Emotional state detection",
      traditional: false,
      lxera: true
    },
    {
      feature: "Basic completion rates",
      traditional: true,
      lxera: true
    },
    {
      feature: "Intervention recommendations",
      traditional: false,
      lxera: true
    },
    {
      feature: "Skill gap analysis",
      traditional: false,
      lxera: true
    }
  ];

  return (
    <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-semibold text-business-black">
          LXERA vs Traditional LMS Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-business-black">Feature</th>
                <th className="text-center py-3 px-4 font-medium text-business-black">Traditional LMS</th>
                <th className="text-center py-3 px-4 font-medium text-green-600">LXERA</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((row, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50/50">
                  <td className="py-3 px-4 text-business-black/80">{row.feature}</td>
                  <td className="py-3 px-4 text-center">
                    {row.traditional ? (
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-red-500 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {row.lxera ? (
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-red-500 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeatureComparisonTable;
