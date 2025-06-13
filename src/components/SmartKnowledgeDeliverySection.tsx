
import { Button } from "@/components/ui/button";
import { Network, Brain, Target, RefreshCw } from "lucide-react";

const SmartKnowledgeDeliverySection = () => {
  const features = [
    { icon: <Network className="w-6 h-6" />, title: "Knowledge Integration", desc: "Connect your internal docs, SOPs, wikis, and project archives." },
    { icon: <Brain className="w-6 h-6" />, title: "Live Scenario Generation", desc: "LXERA uses your data to generate realistic case studies, examples, and learning flows." },
    { icon: <Target className="w-6 h-6" />, title: "Behavior-Based Adaptation", desc: "Content evolves based on how each user engages, reflects, and performs." },
    { icon: <RefreshCw className="w-6 h-6" />, title: "Continuously Optimized", desc: "LXERA updates automatically as your organization changes and grows." }
  ];

  return (
    <section className="w-full py-20 px-6 lg:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl lg:text-5xl font-bold text-business-black mb-8">
              Smart Knowledge Delivery
            </h2>
            <p className="text-xl text-business-black/80 mb-8 leading-relaxed">
              Turn Your Internal Knowledge into Learning That Builds.
            </p>
            <p className="text-lg text-business-black/70 mb-8">
              LXERA doesn't just deliver content — it transforms your internal knowledge into real-time, context-rich learning journeys.
            </p>
            
            <div className="space-y-6">
              {features.map((item, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="text-future-green mt-1">{item.icon}</div>
                  <div>
                    <h4 className="font-semibold text-business-black mb-2">{item.title}</h4>
                    <p className="text-business-black/70">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <Button className="mt-8 bg-future-green text-business-black hover:bg-emerald hover:text-white font-semibold lxera-hover">
              See Smart Delivery in Action
            </Button>
          </div>
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=600&h=400&fit=crop" 
              alt="Smart knowledge delivery visualization"
              className="rounded-2xl lxera-shadow w-full h-96 object-cover"
            />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-future-green rounded-full animate-float opacity-80"></div>
            <div className="absolute -top-6 -right-6 w-16 h-16 bg-light-green rounded-full animate-float opacity-60" style={{animationDelay: '1s'}}></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SmartKnowledgeDeliverySection;
