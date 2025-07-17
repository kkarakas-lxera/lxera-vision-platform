import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowRight, 
  Mail, 
  Zap, 
  CheckCircle, 
  Timer 
} from 'lucide-react';

interface HeroSectionProps {
  email: string;
  setEmail: (email: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  spotsRemaining: number;
  spotsProgress: number;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  email,
  setEmail,
  onSubmit,
  isLoading,
  spotsRemaining,
  spotsProgress
}) => {
  return (
    <section className="relative overflow-hidden py-12 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Social Proof Badge */}
          <div className="inline-flex items-center bg-gradient-to-r from-future-green/20 to-future-green/30 border border-future-green/40 rounded-full px-4 py-2 mb-8">
            <span className="text-sm font-medium text-business-black">
              🏆 500+ companies have saved $2.3M in wasted training costs this year
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-business-black mb-6 leading-tight">
            Discover What Your Competitors
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-future-green to-future-green/80">
              Already Know About Your Team
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl sm:text-2xl text-business-black/70 mb-8 max-w-4xl mx-auto">
            Our AI reveals the exact skills costing you money
            <br className="hidden sm:block" />
            <span className="text-future-green font-semibold">(in under 5 minutes)</span>
          </p>

          {/* Email Capture Form */}
          <form onSubmit={onSubmit} className="max-w-md mx-auto mb-8">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-business-black/40 h-5 w-5" />
                <Input
                  type="email"
                  placeholder="Enter work email to see your team's gaps"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 text-base border-2 border-business-black/20 focus:border-future-green focus:ring-0"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="h-12 px-8 bg-gradient-to-r from-future-green to-future-green/90 hover:from-future-green/90 hover:to-future-green text-business-black font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Analyzing...
                  </div>
                ) : (
                  <>
                    Reveal My Gaps
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Trust Indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-business-black/70 mb-8">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-future-green" />
              <span>Instant results</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-future-green" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-future-green" />
              <span>Limited spots available</span>
            </div>
          </div>

          {/* Scarcity Indicator */}
          <Card className="max-w-md mx-auto bg-gradient-to-r from-future-green/10 to-future-green/20 border-future-green/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-business-black">Analysis spots filling up</span>
                <Badge variant="destructive" className="bg-future-green text-business-black">
                  Limited spots
                </Badge>
              </div>
              <Progress value={spotsProgress} className="h-2" />
              <p className="text-xs text-business-black/70 mt-2">
                🔥 3 companies joined in the last hour
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;