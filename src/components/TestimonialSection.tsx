
import { Star, Quote } from "lucide-react";

const TestimonialSection = () => {
  return (
    <section className="w-full py-20 px-6 lg:px-12 bg-business-black relative overflow-hidden font-inter">
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-white mb-6 font-inter">
            Trusted by Innovation Leaders
          </h2>
          <p className="text-lg sm:text-xl text-white/80 max-w-3xl mx-auto font-normal font-inter">
            Forward-thinking organizations are already transforming their workforce with LXERA
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {/* Testimonial 1 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <div className="flex items-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-future-green fill-current" />
              ))}
            </div>
            <Quote className="w-8 h-8 text-future-green mb-4" />
            <p className="text-white/90 mb-4 font-normal font-inter">
              "LXERA transformed how our teams learn and innovate. We've seen 40% faster skill development and unprecedented collaboration."
            </p>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-future-green/20 rounded-full flex items-center justify-center mr-3">
                <span className="text-future-green font-semibold">S</span>
              </div>
              <div>
                <p className="text-white font-semibold">Sarah Chen</p>
                <p className="text-white/70 text-sm">Chief Learning Officer</p>
              </div>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
            <div className="flex items-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-future-green fill-current" />
              ))}
            </div>
            <Quote className="w-8 h-8 text-future-green mb-4" />
            <p className="text-white/90 mb-4 font-normal font-inter">
              "The AI-powered personalization is game-changing. Every team member gets exactly what they need to grow."
            </p>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-future-green/20 rounded-full flex items-center justify-center mr-3">
                <span className="text-future-green font-semibold">M</span>
              </div>
              <div>
                <p className="text-white font-semibold">Michael Rodriguez</p>
                <p className="text-white/70 text-sm">VP of Innovation</p>
              </div>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 animate-fade-in-up md:col-span-2 lg:col-span-1" style={{animationDelay: '0.6s'}}>
            <div className="flex items-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-future-green fill-current" />
              ))}
            </div>
            <Quote className="w-8 h-8 text-future-green mb-4" />
            <p className="text-white/90 mb-4 font-normal font-inter">
              "ROI was immediate. Our innovation projects increased by 60% in just 3 months."
            </p>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-future-green/20 rounded-full flex items-center justify-center mr-3">
                <span className="text-future-green font-semibold">A</span>
              </div>
              <div>
                <p className="text-white font-semibold">Alex Thompson</p>
                <p className="text-white/70 text-sm">Head of Digital Transformation</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center animate-fade-in-up" style={{animationDelay: '0.8s'}}>
          <div>
            <div className="text-3xl sm:text-4xl font-bold text-future-green mb-2">92%</div>
            <p className="text-white/80 font-normal font-inter">Employee Engagement Increase</p>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-bold text-future-green mb-2">3x</div>
            <p className="text-white/80 font-normal font-inter">Faster Skill Development</p>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-bold text-future-green mb-2">60%</div>
            <p className="text-white/80 font-normal font-inter">More Innovation Projects</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
