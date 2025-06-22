
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import DemoModal from "./DemoModal";
import { ArrowRight } from "lucide-react";

const StickyDemoButton = () => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Show sticky button after user scrolls past hero section
  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = window.innerHeight;
      setIsVisible(window.scrollY > heroHeight * 0.8);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
        <Button
          onClick={() => setIsDemoModalOpen(true)}
          className="bg-gradient-to-r from-future-green to-emerald text-business-black hover:from-emerald hover:to-future-green font-semibold px-6 py-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl focus:ring-2 focus:ring-future-green/50 focus:ring-offset-2 font-inter"
          size="lg"
        >
          Get Demo
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      <DemoModal 
        isOpen={isDemoModalOpen} 
        onClose={() => setIsDemoModalOpen(false)} 
      />
    </>
  );
};

export default StickyDemoButton;
