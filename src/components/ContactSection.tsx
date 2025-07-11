import ProgressiveDemoCapture from "./forms/ProgressiveDemoCapture";

const ContactSection = () => {

  return (
    <section id="contact" className="w-full py-20 sm:py-24 px-6 lg:px-12 bg-business-black" role="region" aria-labelledby="contact-heading">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 id="contact-heading" className="text-3xl sm:text-4xl lg:text-5xl font-medium text-white mb-6 animate-fade-in-up">
            Let us show you how LXERA transforms your workforce.
          </h2>
          
          <p className="text-lg sm:text-xl lg:text-xl text-white/80 mb-8 max-w-2xl mx-auto animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            Join forward-thinking organizations already revolutionizing their learning and development approach.
          </p>
          
          <div className="flex justify-center mb-12 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
            <ProgressiveDemoCapture
              source="contact_section_book_demo"
              buttonText="Book Demo"
              variant="default"
            />
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 animate-fade-in-up" style={{animationDelay: '0.6s'}}>
          <div className="text-center mb-6">
            <h3 className="text-xl font-normal text-white mb-2">
              Get Started Today
            </h3>
            <p className="text-white/70">
              Ready to transform your workforce? Book a personalized demo with our team.
            </p>
          </div>
          
          <div className="text-center">
            <ProgressiveDemoCapture
              source="contact_section_form"
              buttonText="Book Demo"
              variant="default"
            />
            
            <p className="text-xs text-white/60 mt-4">
              By booking a demo, you agree to receive communications from LXERA. 
              We respect your privacy and never share your information.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
