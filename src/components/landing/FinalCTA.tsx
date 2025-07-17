import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowRight, 
  Mail, 
  Timer, 
  Target, 
  CheckCircle 
} from 'lucide-react';

interface FinalCTAProps {
  email: string;
  setEmail: (email: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  spotsRemaining: number;
  spotsProgress: number;
}

const FinalCTA: React.FC<FinalCTAProps> = ({
  email,
  setEmail,
  onSubmit,
  isLoading,
  spotsRemaining,
  spotsProgress
}) => {
  return (
    <section className="py-16 bg-gradient-to-br from-slate-900 to-indigo-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Your Competitors Are Already Ahead
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            While you're reading this, <span className="text-blue-400 font-semibold">23 companies</span> just discovered their skills gaps with LXERA
          </p>

          {/* Final Email Form */}
          <form id="email-form" onSubmit={onSubmit} className="max-w-md mx-auto mb-8">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                <Input
                  type="email"
                  placeholder="Enter work email to join them"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 text-base bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-blue-400 focus:ring-0"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="h-12 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Analyzing...
                  </div>
                ) : (
                  <>
                    Get My Analysis
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Trust Indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-slate-300 mb-8">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-orange-400" />
              <span>Only {spotsRemaining} spots left this month</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-400" />
              <span>Results in 4 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span>Completely free (no strings attached)</span>
            </div>
          </div>

          {/* Final Scarcity */}
          <Card className="max-w-md mx-auto bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-400/30">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-orange-300 mb-2">
                🔥 LAST CHANCE FOR JANUARY
              </h3>
              <p className="text-sm text-slate-300 mb-4">
                Analysis spots are filling up fast
              </p>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-300">{spotsRemaining} companies left</span>
                <Badge variant="destructive" className="bg-red-500">
                  {spotsRemaining} spots
                </Badge>
              </div>
              <Progress value={spotsProgress} className="h-2" />
              <p className="text-xs text-slate-400 mt-2">
                ⚡ 3 companies joined in the last hour
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;