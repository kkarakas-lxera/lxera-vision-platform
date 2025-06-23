
import { Button } from "@/components/ui/button";
import VideoModal from "@/components/VideoModal";
import React, { useState } from "react";
import { stepsData } from "@/data/howItWorksSteps";
import { Play } from "lucide-react";

const HowItWorksSection = () => {
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; caption: string } | null>(null);

  const handleVideoClick = (videoUrl: string, videoCaption: string) => {
    setSelectedVideo({ url: videoUrl, caption: videoCaption });
  };

  return (
    <>
      <section id="how-it-works" className="w-full py-24 px-6 lg:px-12 bg-gradient-to-br from-smart-beige/40 via-future-green/8 to-smart-beige/60 relative overflow-hidden transition-all duration-1000 ease-in-out">
        <div className="max-w-6xl mx-auto text-center">
          {/* Section Header matching other sections */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-business-black mb-8 animate-fade-in-up">
            How LXERA Works
          </h2>
          <p className="text-lg sm:text-xl lg:text-xl text-business-black/80 mb-12 max-w-3xl mx-auto animate-fade-in-up animate-delay-200">
            From onboarding to innovation — in 4 steps that drive measurable results.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {stepsData.map((step, index) => (
              <div
                key={index}
                className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 group animate-fade-in-up"
                style={{
                  animationDelay: `${300 + index * 100}ms`,
                }}
              >
                <div className="p-6">
                  <div className="mb-4 flex justify-center">
                    <div className="w-16 h-16 bg-business-black rounded-full shadow-lg flex items-center justify-center scale-105 border-4 border-white relative z-20 group-hover:scale-110 transition-all duration-300">
                      <span className="text-3xl font-extrabold text-white tracking-tight">
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
                  
                  <div className="text-sm text-business-black/60 italic text-center">
                    {step.metrics}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <p className="text-business-black/70 mb-6 text-base animate-fade-in-up animate-delay-700">
            Every LXERA innovation capability shaped by real-world feedback for maximum impact.
          </p>
          
          <Button 
            className="bg-future-green text-business-black font-semibold px-8 py-4 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus:ring-2 focus-ring-future-green/50 focus:ring-offset-2"
            aria-label="Request a demo"
          >
            Request a Demo →
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

      {/* Enhanced Section Separator */}
      <div className="relative">
        <div className="h-16 bg-gradient-to-b from-smart-beige/60 via-white/40 to-smart-beige/30 transition-all duration-1000 ease-in-out"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-future-green/5 to-transparent"></div>
      </div>
    </>
  );
};

export default HowItWorksSection;
