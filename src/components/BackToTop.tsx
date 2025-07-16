
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Button
      onClick={scrollToTop}
      className="fixed bottom-20 right-6 z-50 bg-future-green text-business-black hover:bg-future-green/90 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
      size="icon"
      aria-label="Back to top"
    >
      <ArrowUp className="w-5 h-5" />
    </Button>
  );
};

export default BackToTop;
