
import { useState, useEffect } from "react";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "LXERA transformed our L&D approach. We saw immediate improvements in engagement and knowledge retention.",
    author: "Sarah Chen",
    role: "Chief Learning Officer",
    company: "TechCorp Industries",
    impact: "85% retention increase",
    image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=100&h=100&fit=crop&crop=faces"
  },
  {
    quote: "The AI-powered personalization is game-changing. Our teams are learning faster and more effectively than ever.",
    author: "Marcus Rodriguez",
    role: "VP of Human Resources", 
    company: "Global Solutions Inc",
    impact: "60% faster completion",
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=100&h=100&fit=crop&crop=faces"
  },
  {
    quote: "Implementation was seamless, and the ROI was evident within the first quarter. Highly recommended.",
    author: "Dr. Emily Watson",
    role: "Director of Training",
    company: "MedTech Alliance",
    impact: "3x engagement boost",
    image: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=100&h=100&fit=crop&crop=faces"
  }
];

const TestimonialCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mb-16 animate-fade-in-up animate-delay-800">
      <div className="max-w-4xl mx-auto relative">
        {/* Soft gradient blur "band" instead of strong box */}
        <div className="absolute -inset-3 sm:-inset-6 lg:-inset-10 bg-gradient-to-br from-future-green/15 via-smart-beige/40 to-white/60 rounded-3xl blur-lg"></div>
        
        <div className="relative z-10 p-8 lg:p-12">
          <div className="flex items-center justify-center mb-6">
            <Quote className="w-12 h-12 text-future-green opacity-60" />
          </div>
          <div className="text-center">
            <blockquote className="text-xl lg:text-2xl text-business-black/90 font-medium mb-6 leading-relaxed">
              "{testimonials[currentIndex].quote}"
            </blockquote>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {/* Human avatar */}
              <div className="flex items-center gap-4">
                <img 
                  src={testimonials[currentIndex].image}
                  alt={testimonials[currentIndex].author}
                  className="w-16 h-16 rounded-full object-cover border-2 border-future-green/20"
                />
                <div className="text-center sm:text-left">
                  <cite className="text-business-black font-semibold not-italic">
                    {testimonials[currentIndex].author}
                  </cite>
                  <p className="text-business-black/70 text-sm">
                    {testimonials[currentIndex].role}
                  </p>
                  <p className="text-business-black/60 text-sm">
                    {testimonials[currentIndex].company}
                  </p>
                </div>
              </div>
              <div className="bg-future-green/20 text-future-green px-4 py-2 rounded-full text-sm font-medium">
                {testimonials[currentIndex].impact}
              </div>
            </div>
          </div>
          {/* Carousel indicators */}
          <div className="flex justify-center mt-8 gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-future-green scale-125' 
                    : 'bg-future-green/30 hover:bg-future-green/50'
                }`}
                aria-label={`Show testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCarousel;
