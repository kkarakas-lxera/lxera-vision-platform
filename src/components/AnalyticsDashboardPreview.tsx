
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Users, Clock, AlertTriangle, CheckCircle } from "lucide-react";

const AnalyticsDashboardPreview = () => {
  const mockData = {
    engagementRate: 87,
    atRiskLearners: 12,
    completionRate: 94,
    avgTimeToComplete: "2.3 days"
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-green-200/50">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-business-black mb-2">Live Analytics Dashboard</h3>
        <p className="text-business-black/70 text-sm">Real-time view of learning engagement and performance</p>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border-0 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-business-black/70">Engagement</p>
                <p className="text-2xl font-bold text-green-600">{mockData.engagementRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-business-black/70">At Risk</p>
                <p className="text-2xl font-bold text-orange-600">{mockData.atRiskLearners}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-business-black/70">Completion</p>
                <p className="text-2xl font-bold text-blue-600">{mockData.completionRate}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-business-black/70">Avg Time</p>
                <p className="text-2xl font-bold text-purple-600">{mockData.avgTimeToComplete}</p>
              </div>
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-business-black">Next Action Recommended</p>
            <p className="text-xs text-business-black/70">Check in with Sarah M. - engagement dropped 15% this week</p>
          </div>
          <Badge className="bg-green-600 text-white">Priority</Badge>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboardPreview;
