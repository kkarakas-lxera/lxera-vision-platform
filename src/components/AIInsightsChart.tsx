
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useState, useEffect } from 'react';

const learningData = [
  { week: 'Week 1', traditional: 20, aiPowered: 45, engagement: 30 },
  { week: 'Week 2', traditional: 35, aiPowered: 70, engagement: 55 },
  { week: 'Week 3', traditional: 45, aiPowered: 85, engagement: 75 },
  { week: 'Week 4', traditional: 55, aiPowered: 95, engagement: 88 },
];

const AIInsightsChart = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeMetric, setActiveMetric] = useState<'retention' | 'speed' | 'engagement'>('retention');

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const metrics = {
    retention: { color: '#B1B973', label: 'Knowledge Retention', key: 'aiPowered' },
    speed: { color: '#000000', label: 'Learning Speed', key: 'traditional' },
    engagement: { color: '#10B981', label: 'Engagement Level', key: 'engagement' }
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-future-green/10">
      <div className="mb-6">
        <h3 className="text-2xl font-medium text-business-black mb-2">
          AI Learning Impact Analysis
        </h3>
        <p className="text-business-black/70 text-sm">
          Real-time insights from our AI engine
        </p>
      </div>

      {/* Metric Selector */}
      <div className="flex gap-2 mb-6">
        {Object.entries(metrics).map(([key, metric]) => (
          <button
            key={key}
            onClick={() => setActiveMetric(key as any)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              activeMetric === key
                ? 'bg-future-green text-business-black'
                : 'bg-gray-100 text-business-black/60 hover:bg-gray-200'
            }`}
          >
            {metric.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className={`h-64 transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={learningData}>
            <XAxis 
              dataKey="week" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#000000', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#000000', fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #B1B973',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
              }}
            />
            <Line
              type="monotone"
              dataKey={metrics[activeMetric].key}
              stroke={metrics[activeMetric].color}
              strokeWidth={3}
              dot={{ fill: metrics[activeMetric].color, strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8, stroke: metrics[activeMetric].color, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* AI Insight Badge */}
      <div className="mt-4 inline-flex items-center gap-2 bg-future-green/10 px-3 py-2 rounded-full">
        <div className="w-2 h-2 bg-future-green rounded-full animate-pulse"></div>
        <span className="text-sm text-business-black/80">
          AI predicts 40% improvement next week
        </span>
      </div>
    </div>
  );
};

export default AIInsightsChart;
