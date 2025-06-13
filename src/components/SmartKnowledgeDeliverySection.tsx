
import { Button } from "@/components/ui/button";
import { Network, Brain, Target, RefreshCw, Sparkles } from "lucide-react";

const SmartKnowledgeDeliverySection = () => {
  const features = [
    { icon: <Network className="w-6 h-6" />, title: "Knowledge Integration", desc: "Connect your internal docs, SOPs, wikis, and project archives." },
    { icon: <Brain className="w-6 h-6" />, title: "Live Scenario Generation", desc: "LXERA uses your data to generate realistic case studies, examples, and learning flows." },
    { icon: <Target className="w-6 h-6" />, title: "Behavior-Based Adaptation", desc: "Content evolves based on how each user engages, reflects, and performs." },
    { icon: <RefreshCw className="w-6 h-6" />, title: "Continuously Optimized", desc: "LXERA updates automatically as your organization changes and grows." }
  ];

  return (
    <section className="w-full py-20 px-6 lg:px-12 relative overflow-hidden">
      {/* Enhanced animated background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-16 w-28 h-28 bg-future-green rounded-full animate-float"></div>
        <div className="absolute bottom-32 right-20 w-20 h-20 bg-light-green rounded-full animate-float" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-emerald rounded-full animate-float" style={{animationDelay: '3s'}}></div>
        <div className="absolute top-16 right-1/3 w-24 h-24 bg-future-green/60 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Enhanced content section */}
          <div className="animate-fade-in-up">
            {/* Enhanced introduction with animations */}
            <div className="mb-6 animate-slide-in-left" style={{animationDelay: '0.2s'}}>
              <div className="inline-flex items-center gap-2 text-lg text-business-black/70 mb-2">
                <Sparkles className="w-5 h-5 text-future-green animate-pulse" />
                <span>Now let's explore the engine that powers this transformation:</span>
              </div>
            </div>

            <h2 className="text-4xl lg:text-5xl font-bold text-business-black mb-8 animate-slide-in-right" style={{animationDelay: '0.4s'}}>
              Smart Knowledge Delivery
            </h2>
            <p className="text-xl text-business-black/80 mb-8 leading-relaxed animate-fade-in-up" style={{animationDelay: '0.6s'}}>
              Turn Your Internal Knowledge into Learning That Actually Builds Capability.
            </p>
            <p className="text-lg text-business-black/70 mb-8 animate-fade-in-up" style={{animationDelay: '0.8s'}}>
              LXERA doesn't just deliver content — it transforms your organizational knowledge into real-time, context-rich learning journeys that drive immediate application.
            </p>
            
            {/* Enhanced features list with staggered animations */}
            <div className="space-y-6">
              {features.map((item, index) => (
                <div 
                  key={index} 
                  className="flex items-start space-x-4 group animate-fade-in-up hover:bg-future-green/5 p-4 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  style={{animationDelay: `${1 + index * 0.2}s`}}
                >
                  <div className="text-future-green mt-1 transition-all duration-300 group-hover:scale-125 group-hover:text-emerald group-hover:animate-pulse">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-business-black mb-2 transition-colors duration-300 group-hover:text-future-green">
                      {item.title}
                    </h4>
                    <p className="text-business-black/70 transition-colors duration-300 group-hover:text-business-black/90">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Enhanced CTA button */}
            <div className="animate-fade-in-up" style={{animationDelay: '1.8s'}}>
              <Button className="mt-8 bg-future-green text-business-black hover:bg-emerald hover:text-white font-semibold lxera-hover relative overflow-hidden group">
                <span className="relative z-10">See Smart Delivery in Action</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </Button>
            </div>
          </div>

          {/* Enhanced image section with animations */}
          <div className="relative animate-fade-in-scale" style={{animationDelay: '0.6s'}}>
            <div className="relative group">
              <img 
                src="https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=600&h=400&fit=crop" 
                alt="Smart knowledge delivery visualization"
                className="rounded-2xl lxera-shadow w-full h-96 object-cover transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl"
              />
              
              {/* Enhanced floating elements with better animations */}
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-future-green rounded-full animate-float opacity-80 transition-all duration-500 group-hover:scale-110 group-hover:opacity-100"></div>
              <div className="absolute -top-6 -right-6 w-16 h-16 bg-light-green rounded-full animate-float opacity-60 transition-all duration-500 group-hover:scale-110 group-hover:opacity-80" style={{animationDelay: '1s'}}></div>
              <div className="absolute top-1/2 -left-4 w-12 h-12 bg-emerald/70 rounded-full animate-float opacity-50 transition-all duration-500 group-hover:scale-110 group-hover:opacity-70" style={{animationDelay: '2s'}}></div>
              
              {/* New animated overlay effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-future-green/10 via-transparent to-emerald/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
              
              {/* Pulsing dots */}
              <div className="absolute top-4 right-4 w-3 h-3 bg-future-green rounded-full animate-ping opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute bottom-4 left-4 w-2 h-2 bg-emerald rounded-full animate-ping opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{animationDelay: '0.5s'}}></div>
            </div>
            
            {/* Additional floating animation elements */}
            <div className="absolute top-1/4 right-1/4 w-6 h-6 bg-future-green/30 rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute bottom-1/3 left-1/3 w-4 h-4 bg-light-green/40 rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{animationDelay: '1s'}}></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SmartKnowledgeDeliverySection;
