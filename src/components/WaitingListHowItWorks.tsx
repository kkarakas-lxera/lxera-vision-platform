import { Upload, Brain, Target } from "lucide-react";

const WaitingListHowItWorks = () => {
  const steps = [
    {
      icon: <Upload className="w-8 h-8" />,
      title: "Upload & Parse",
      description: "Drop CVs, job descriptions, or employee data. Our AI instantly extracts and categorizes every skill, certification, and experience.",
      detail: "Supports 50+ file formats with 99.7% accuracy"
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Analyze & Match",
      description: "Advanced algorithms identify skill gaps, role compatibility, and learning opportunities across your entire workforce.",
      detail: "Real-time analysis of 10,000+ skill categories"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Optimize & Grow",
      description: "Get actionable insights, strategic recommendations, and automated learning paths to maximize your team's potential.",
      detail: "Increase productivity by up to 40%"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            How it works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transform your workforce analysis in three simple steps. 
            From chaos to clarity in minutes, not months.
          </p>
        </div>

        <div className="relative">
          {/* Connection lines for desktop */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-green-200 transform -translate-y-1/2 z-0"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8 relative z-10">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                {/* Step Number */}
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full text-2xl font-bold mb-6 shadow-lg">
                  {index + 1}
                </div>
                
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 ${
                  index === 0 ? 'bg-blue-100 text-blue-600' :
                  index === 1 ? 'bg-purple-100 text-purple-600' :
                  'bg-green-100 text-green-600'
                }`}>
                  {step.icon}
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-lg mb-4 leading-relaxed">
                  {step.description}
                </p>
                <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                  index === 0 ? 'bg-blue-50 text-blue-700' :
                  index === 1 ? 'bg-purple-50 text-purple-700' :
                  'bg-green-50 text-green-700'
                }`}>
                  {step.detail}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to see it in action?
            </h3>
            <p className="text-gray-600 text-lg mb-6">
              Join the waitlist and be among the first to experience the future of workforce analytics.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Free for early users</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Setup in under 5 minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>No technical knowledge required</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WaitingListHowItWorks;
