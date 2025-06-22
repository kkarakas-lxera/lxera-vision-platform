
import AIInsightsChart from './AIInsightsChart';
import ProgressiveCard from './ProgressiveCard';

const AIVisualizationSection = () => {
  const progressiveData = [
    {
      title: "Personalized Learning Paths",
      preview: "AI analyzes your learning style and creates custom journeys",
      details: [
        "Individual skill gap analysis",
        "Adaptive content sequencing",
        "Real-time difficulty adjustment",
        "Multi-modal learning preferences"
      ],
      insight: "Users with AI-personalized paths show 65% better retention compared to standard approaches"
    },
    {
      title: "Predictive Performance Analytics",
      preview: "Advanced algorithms forecast learning outcomes and intervention needs",
      details: [
        "Early warning system for at-risk learners",
        "Success probability modeling",
        "Optimal timing for content delivery",
        "Engagement pattern recognition"
      ],
      insight: "Predictive models help prevent 80% of potential learning dropouts through timely interventions"
    },
    {
      title: "Intelligent Content Curation",
      preview: "Smart content recommendations based on role, goals, and progress",
      details: [
        "Context-aware content matching",
        "Peer learning insights integration",
        "Industry-specific knowledge graphs",
        "Dynamic curriculum updates"
      ],
      insight: "AI curation reduces time-to-competency by 40% while maintaining learning quality"
    }
  ];

  return (
    <>
      {/* Smooth transition overlay */}
      <div className="relative">
        <div className="h-8 bg-gradient-to-b from-smart-beige/80 via-white/60 to-smart-beige/40 transition-all duration-1000 ease-in-out"></div>
      </div>

      <section className="w-full py-20 px-6 lg:px-12 bg-gradient-to-br from-smart-beige/40 via-white/80 to-future-green/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-business-black mb-6">
              AI-Powered Insights
            </h2>
            <p className="text-lg sm:text-xl text-business-black/80 max-w-3xl mx-auto mb-8">
              See how artificial intelligence transforms learning data into actionable intelligence
            </p>
          </div>

          {/* Main Layout: Chart + Progressive Cards */}
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left: AI Insights Chart */}
            <div className="animate-fade-in-up animate-delay-200">
              <AIInsightsChart />
            </div>

            {/* Right: Progressive Disclosure Cards */}
            <div className="space-y-6">
              {progressiveData.map((item, index) => (
                <ProgressiveCard
                  key={index}
                  {...item}
                  delay={400 + index * 150}
                />
              ))}
            </div>
          </div>

          {/* Bottom Insight */}
          <div className="mt-16 text-center animate-fade-in-up animate-delay-800">
            <div className="inline-flex items-center gap-3 bg-white/90 px-6 py-4 rounded-full shadow-md border border-future-green/20">
              <div className="w-3 h-3 bg-future-green rounded-full animate-pulse"></div>
              <span className="text-business-black/80 font-medium">
                AI continuously learns from 10,000+ learning interactions daily
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AIVisualizationSection;
