
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3 } from "lucide-react";
import ProgressiveDemoCapture from "@/components/forms/ProgressiveDemoCapture";
import { useState } from "react";

interface HeroSectionProps {
  openDemoModal?: (source: string) => void;
}

const HeroSection = ({ openDemoModal }: HeroSectionProps) => {

  const handleSeeHowItWorks = () => {
    // Could navigate to how it works section
    const element = document.getElementById('how-it-works');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <section className="pt-32 pb-20 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="mb-6 bg-future-green/20 text-business-black border-future-green/30 px-4 py-2 text-sm font-medium rounded-full font-inter">
            <BarChart3 className="w-4 h-4 mr-2" />
            Data-Driven Learning
          </Badge>
          
          {/* Updated hero title to match homepage style */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-medium text-business-black mb-6 leading-tight font-inter">
            <span className="block">
              Learning Analytics &
            </span>
            <span className="block" style={{ color: '#B1B973' }}>
              Actionable Insights
            </span>
          </h1>
          
          <p className="text-xl text-business-black/70 mb-12 max-w-3xl mx-auto leading-relaxed font-inter">
            Transform learning data into strategic decisions with real-time analytics, predictive outcomes, and intelligent insights that drive measurable results.
          </p>
          
          {/* Updated CTA buttons to match homepage design */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <ProgressiveDemoCapture
              source="analytics_hero_section"
              buttonText="Book Demo"
              onSuccess={() => {}}
              openDemoModal={openDemoModal}
            />
            <Button
              size="lg"
              onClick={handleSeeHowItWorks}
              className="bg-business-black text-white hover:bg-business-black/90 font-medium px-8 py-4 text-lg rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus:ring-2 focus:ring-business-black/50 focus:ring-offset-2 font-inter"
              aria-label="See how learning analytics works"
            >
              See How It Works
            </Button>
          </div>
        </div>
      </section>

    </>
  );
};

export default HeroSection;
