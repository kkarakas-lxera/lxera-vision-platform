
import { Button } from "@/components/ui/button";
import { StepCard } from "@/components/StepCard";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { Timeline } from "@/components/Timeline";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { stepsData } from "@/data/howItWorksSteps";
import { useStepInView } from "@/hooks/useStepInView";
import { Play } from "lucide-react";
import VideoModal from "@/components/VideoModal";
import React, { useState } from "react";

const HowItWorksSection = () => {
  const { isVisible, currentStep, updateCurrentStep } = useScrollAnimation();
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; caption: string } | null>(null);

  // Detect reduced motion (prefers-reduced-motion)
  const [reducedMotion, setReducedMotion] = React.useState(false);
  React.useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    }
  }, []);

  // Mobile step tracker - no longer needed without the navigator, but kept if used for other features
  const stepInViewIdx = useStepInView(stepsData.length);

  const handleVideoClick = (videoUrl: string, videoCaption: string) => {
    setSelectedVideo({ url: videoUrl, caption: videoCaption });
  };

  return (
    <section id="how-it-works" className="w-full py-20 px-6 lg:px-12 bg-gradient-to-br from-smart-beige/50 via-future-green/5 to-smart-beige/70 relative overflow-hidden">
      <div className="max-w-6xl mx-auto text-center">
        {/* Section Header matching Built for Innovators */}
        <h2 className="text-4xl lg:text-5xl font-bold text-business-black mb-8 animate-fade-in-up">
          How LXERA Works
        </h2>
        <p className="text-xl text-business-black/80 mb-12 max-w-3xl mx-auto animate-fade-in-up animate-delay-200">
          From onboarding to innovation — in 4 steps that drive measurable results.
        </p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {stepsData.map((step, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-smart-beige/80 via-future-green/10 to-smart-beige/60 lxera-shadow text-center group hover:from-smart-beige/90 hover:via-future-green/15 hover:to-smart-beige/70 hover:shadow-xl transition-all duration-500 lxera-hover animate-fade-in-up rounded-2xl"
              style={{
                animationDelay: `${300 + index * 100}ms`,
              }}
            >
              <div className="p-6">
                <div className="mb-4 flex justify-center">
                  <div className="w-16 h-16 bg-business-black rounded-full shadow-lg flex items-center justify-center scale-105 border-4 border-white relative z-20 group-hover:scale-110 transition-all duration-300">
                    <span className="text-3xl font-extrabold text-white tracking-tight group-hover:animate-bounce transition-all duration-300">
                      {step.step}
                    </span>
                  </div>
                </div>
                <h3 className="text-business-black font-bold text-lg mb-1">{step.title}</h3>
                <p className="text-business-black/80 mb-4 text-sm">{step.subtitle}</p>
                
                {/* Video Thumbnail */}
                <div className="relative rounded-xl overflow-hidden shadow-lg group/video mb-4">
                  <img
                    src={step.videoThumb}
                    alt={`${step.title} preview`}
                    className="w-full h-32 object-cover rounded-xl border-2 border-future-green/30 group-hover/video:scale-102 transition-transform duration-300 bg-[#e6faf3]"
                    draggable={false}
                    loading="lazy"
                  />
                  <button
                    onClick={() => handleVideoClick(step.videoUrl, step.videoCaption)}
                    aria-label={`Play video: ${step.title}`}
                    className="absolute inset-0 flex items-center justify-center bg-black/15 hover:bg-black/25 transition group/video outline-none focus-visible:ring-2 focus-visible:ring-future-green"
                  >
                    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-future-green/90 shadow-lg border-4 border-white hover:scale-110 transition relative">
                      <Play className="w-6 h-6 text-business-black drop-shadow" />
                    </div>
                  </button>
                </div>
                
                <div className="text-xs text-business-black/70 text-center mb-3">
                  {step.videoCaption}
                </div>
                
                <div className="overflow-hidden transition-all duration-500 ease-out max-h-0 group-hover:max-h-20 opacity-0 group-hover:opacity-100">
                  <p className="text-sm text-business-black/60 italic border-t border-future-green/20 pt-3">
                    {step.metrics}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <p className="text-business-black/70 mb-6 text-lg animate-fade-in-up animate-delay-700">
          Every LXERA innovation capability shaped by real-world feedback for maximum impact.
        </p>
        
        <Button 
          className="bg-future-green text-business-black hover:bg-emerald hover:text-white text-lg px-8 py-4 rounded-full font-semibold lxera-hover animate-fade-in-up animate-delay-800 focus:ring-2 focus:ring-future-green/50 focus:ring-offset-2"
          aria-label="Start your LXERA journey"
        >
          Start Your Journey →
        </Button>
      </div>
      
      {/* Video Modal */}
      {selectedVideo && (
        <VideoModal
          isOpen={!!selectedVideo}
          setIsOpen={(open) => !open && setSelectedVideo(null)}
          videoUrl={selectedVideo.url}
          videoCaption={selectedVideo.caption}
        />
      )}
    </section>
  );
};

export default HowItWorksSection;
