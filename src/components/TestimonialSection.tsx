
import { Star, Quote } from "lucide-react";

const TestimonialSection = () => {
  return (
    <section className="w-full py-24 px-6 lg:px-12 bg-business-black relative overflow-hidden font-inter">
      <div className="max-w-5xl mx-auto relative z-10">
        {/* Minimal section header */}
        <div className="text-center mb-20 animate-fade-in-up">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-white mb-8 font-inter">
            Real People, Real Results
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto font-light font-inter">
            How teams are transforming learning into innovation
          </p>
        </div>

        {/* Human-centric testimonials */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* Testimonial 1 - More personal */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:bg-white/8 transition-all duration-500 animate-fade-in-up group" style={{animationDelay: '0.2s'}}>
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-future-green/20 rounded-full flex items-center justify-center mr-4">
                <span className="text-future-green font-medium text-lg">S</span>
              </div>
              <div>
                <p className="text-white font-medium">Sarah Chen</p>
                <p className="text-white/60 text-sm">Chief Learning Officer</p>
                <p className="text-white/40 text-xs">TechCorp Industries</p>
              </div>
            </div>
            <Quote className="w-6 h-6 text-future-green/60 mb-4" />
            <p className="text-white/90 mb-6 font-light leading-relaxed">
              "Our teams went from struggling with outdated training to becoming innovation catalysts. The transformation wasn't just professional—it was personal."
            </p>
            <div className="flex items-center justify-between">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-future-green fill-current" />
                ))}
              </div>
              <span className="text-future-green text-sm font-medium">40% faster growth</span>
            </div>
          </div>

          {/* Testimonial 2 - Focus on human impact */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:bg-white/8 transition-all duration-500 animate-fade-in-up group" style={{animationDelay: '0.4s'}}>
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-future-green/20 rounded-full flex items-center justify-center mr-4">
                <span className="text-future-green font-medium text-lg">M</span>
              </div>
              <div>
                <p className="text-white font-medium">Michael Rodriguez</p>
                <p className="text-white/60 text-sm">VP of Innovation</p>
                <p className="text-white/40 text-xs">Global Solutions Inc</p>
              </div>
            </div>
            <Quote className="w-6 h-6 text-future-green/60 mb-4" />
            <p className="text-white/90 mb-6 font-light leading-relaxed">
              "The AI doesn't replace human creativity—it amplifies it. Our people feel more confident, more capable, more human than ever."
            </p>
            <div className="flex items-center justify-between">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-future-green fill-current" />
                ))}
              </div>
              <span className="text-future-green text-sm font-medium">3× engagement</span>
            </div>
          </div>

          {/* Testimonial 3 - ROI with human touch */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:bg-white/8 transition-all duration-500 animate-fade-in-up md:col-span-2 lg:col-span-1 group" style={{animationDelay: '0.6s'}}>
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-future-green/20 rounded-full flex items-center justify-center mr-4">
                <span className="text-future-green font-medium text-lg">A</span>
              </div>
              <div>
                <p className="text-white font-medium">Alex Thompson</p>
                <p className="text-white/60 text-sm">Head of People & Innovation</p>
                <p className="text-white/40 text-xs">Future Labs</p>
              </div>
            </div>
            <Quote className="w-6 h-6 text-future-green/60 mb-4" />
            <p className="text-white/90 mb-6 font-light leading-relaxed">
              "The technology is sophisticated, but the experience feels deeply human. That's where the magic happens."
            </p>
            <div className="flex items-center justify-between">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-future-green fill-current" />
                ))}
              </div>
              <span className="text-future-green text-sm font-medium">60% ROI increase</span>
            </div>
          </div>
        </div>

        {/* Minimal stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 text-center animate-fade-in-up" style={{animationDelay: '0.8s'}}>
          <div className="group">
            <div className="text-4xl font-light text-white mb-2 group-hover:text-future-green transition-colors">92%</div>
            <div className="w-8 h-px bg-future-green/30 mx-auto mb-3 group-hover:bg-future-green transition-colors"></div>
            <p className="text-white/70 font-light">feel more confident learning</p>
          </div>
          <div className="group">
            <div className="text-4xl font-light text-white mb-2 group-hover:text-future-green transition-colors">3×</div>
            <div className="w-8 h-px bg-future-green/30 mx-auto mb-3 group-hover:bg-future-green transition-colors"></div>
            <p className="text-white/70 font-light">faster skill development</p>
          </div>
          <div className="group">
            <div className="text-4xl font-light text-white mb-2 group-hover:text-future-green transition-colors">60%</div>
            <div className="w-8 h-px bg-future-green/30 mx-auto mb-3 group-hover:bg-future-green transition-colors"></div>
            <p className="text-white/70 font-light">more innovation projects</p>
          </div>
        </div>
      </div>

      {/* Subtle tech elements */}
      <div className="absolute top-1/4 left-8 w-px h-16 bg-future-green/10"></div>
      <div className="absolute bottom-1/4 right-12 w-16 h-px bg-future-green/10"></div>
    </section>
  );
};

export default TestimonialSection;
