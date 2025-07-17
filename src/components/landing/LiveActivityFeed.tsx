import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LiveActivityItem {
  id: string;
  company: string;
  location: string;
  action: string;
  timestamp: Date;
}

interface LiveActivityFeedProps {
  onCTAClick: () => void;
}

const LiveActivityFeed: React.FC<LiveActivityFeedProps> = ({ onCTAClick }) => {
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);

  const mockActivities: LiveActivityItem[] = [
    {
      id: '1',
      company: 'Tech company in Austin',
      location: 'Austin, TX',
      action: 'found 15 critical skill gaps',
      timestamp: new Date(Date.now() - 2 * 60 * 1000)
    },
    {
      id: '2',
      company: 'Manufacturing firm',
      location: 'Detroit, MI',
      action: 'saved $89K in training costs',
      timestamp: new Date(Date.now() - 8 * 60 * 1000)
    },
    {
      id: '3',
      company: 'SaaS startup',
      location: 'San Francisco, CA',
      action: 'identified critical React gaps',
      timestamp: new Date(Date.now() - 15 * 60 * 1000)
    },
    {
      id: '4',
      company: 'Healthcare organization',
      location: 'Boston, MA',
      action: 'found 23 skill mismatches',
      timestamp: new Date(Date.now() - 22 * 60 * 1000)
    },
    {
      id: '5',
      company: 'Financial services',
      location: 'New York, NY',
      action: 'cut training time by 60%',
      timestamp: new Date(Date.now() - 35 * 60 * 1000)
    }
  ];

  const formatTimeAgo = (timestamp: Date) => {
    const minutes = Math.floor((Date.now() - timestamp.getTime()) / 60000);
    if (minutes < 1) return 'just now';
    if (minutes === 1) return '1 minute ago';
    return `${minutes} minutes ago`;
  };

  // Simulate live activity updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentActivityIndex((prev) => (prev + 1) % mockActivities.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [mockActivities.length]);

  return (
    <section className="py-16 bg-gradient-to-br from-smart-beige via-future-green/10 to-smart-beige">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-business-black mb-4">
            Companies discovering gaps right now:
          </h2>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="bg-white/80 backdrop-blur-sm border-future-green/40">
            <CardContent className="p-6">
              <div className="space-y-4">
                {mockActivities.slice(0, 4).map((activity, index) => (
                  <div
                    key={activity.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg transition-all duration-300",
                      index === currentActivityIndex ? "bg-future-green/20 border border-future-green/40" : "bg-smart-beige/50"
                    )}
                  >
                    <div className={cn(
                      "w-3 h-3 rounded-full",
                      index === currentActivityIndex ? "bg-future-green animate-pulse" : "bg-business-black/40"
                    )} />
                    <div className="flex-1">
                      <p className="text-sm text-business-black/80">
                        <span className="font-medium">{activity.company}</span> just {activity.action}
                      </p>
                      <p className="text-xs text-business-black/60">
                        {formatTimeAgo(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="text-center mt-8">
            <p className="text-lg text-business-black/70 mb-6">
              This could be you in the next 5 minutes
            </p>
            <Button
              onClick={onCTAClick}
              className="bg-gradient-to-r from-future-green to-future-green/90 hover:from-future-green/90 hover:to-future-green text-business-black font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Start My Analysis Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveActivityFeed;