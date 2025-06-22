
import { Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const FeatureComparisonTable = () => {
  const comparisonData = [
    {
      feature: "Real-time engagement tracking",
      traditional: false,
      lxera: true
    },
    {
      feature: "Predictive analytics for at-risk learners",
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
      feature: "Automated intervention recommendations",
      traditional: false,
      lxera: true
    },
    {
      feature: "Skill gap analysis and mapping",
      traditional: false,
      lxera: true
    },
    {
      feature: "Learning path optimization",
      traditional: false,
      lxera: true
    },
    {
      feature: "Behavioral pattern analysis",
      traditional: false,
      lxera: true
    },
    {
      feature: "Time-to-completion tracking",
      traditional: true,
      lxera: true
    },
    {
      feature: "Performance trend predictions",
      traditional: false,
      lxera: true
    }
  ];

  return (
    <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden">
      <CardHeader className="text-center pb-6 bg-gradient-to-r from-gray-50 to-green-50 rounded-t-3xl">
        <CardTitle className="text-2xl font-semibold text-business-black">
          LXERA vs Traditional LMS Analytics
        </CardTitle>
        <p className="text-business-black/60 mt-2">
          See how LXERA's intelligent analytics stack up against standard reporting
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-hidden rounded-b-3xl">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-200 bg-gradient-to-r from-gray-100 to-green-100">
                <TableHead className="text-left font-semibold text-business-black w-1/2 rounded-tl-2xl py-6 px-6">
                  Analytics Capability
                </TableHead>
                <TableHead className="text-center font-semibold text-business-black w-1/4 py-6">
                  Traditional LMS
                </TableHead>
                <TableHead className="text-center font-semibold text-green-600 w-1/4 rounded-tr-2xl py-6">
                  LXERA Platform
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comparisonData.map((row, index) => (
                <TableRow 
                  key={index} 
                  className={`border-gray-100 hover:bg-gradient-to-r hover:from-gray-50 hover:to-green-50 transition-all duration-300 ${
                    index === comparisonData.length - 1 ? '' : 'border-b'
                  }`}
                >
                  <TableCell className="font-medium text-business-black/90 py-6 px-6 rounded-l-2xl">
                    {row.feature}
                  </TableCell>
                  <TableCell className="text-center py-6">
                    {row.traditional ? (
                      <div className="flex items-center justify-center">
                        <div className="bg-green-100 rounded-full p-2">
                          <Check className="w-5 h-5 text-green-600" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <div className="bg-red-100 rounded-full p-2">
                          <X className="w-5 h-5 text-red-500" />
                        </div>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-center py-6 rounded-r-2xl">
                    <div className="flex items-center justify-center">
                      <div className="bg-green-100 rounded-full p-2">
                        <Check className="w-5 h-5 text-green-600" />
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-0 mx-6 mb-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100">
          <p className="text-sm text-business-black/70 text-center">
            <strong className="text-green-600">LXERA Advantage:</strong> 8 out of 10 advanced analytics features not available in traditional LMS platforms
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeatureComparisonTable;
