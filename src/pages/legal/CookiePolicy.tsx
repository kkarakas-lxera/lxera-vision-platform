
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const CookiePolicy = () => {
  return (
    <>
      <SEO 
        title="Cookie Policy - LXERA"
        description="Learn about how LXERA uses cookies to improve your experience on our platform."
      />
      <div className="min-h-screen bg-smart-beige">
        <Navigation />
        
        <div className="pt-32 pb-24 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-medium text-business-black mb-6">Cookie Policy</h1>
              <p className="lxera-subheadline">
                This policy explains how we use cookies and similar technologies on our platform.
              </p>
              <p className="lxera-caption text-business-black/60 mt-4">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>

            <div className="lxera-card p-8 space-y-8">
              <section>
                <h2 className="lxera-section-title mb-4">What Are Cookies</h2>
                <p className="lxera-body-text">
                  Cookies are small text files that are stored on your device when you visit our website. 
                  They help us provide you with a better experience by remembering your preferences and 
                  understanding how you use our platform.
                </p>
              </section>

              <section>
                <h2 className="lxera-section-title mb-4">Types of Cookies We Use</h2>
                <div className="space-y-6">
                  <div className="bg-white/50 rounded-2xl p-6">
                    <h3 className="lxera-card-title mb-2">Essential Cookies</h3>
                    <p className="lxera-body-text">
                      These cookies are necessary for the platform to function properly. They enable basic 
                      features like page navigation and access to secure areas.
                    </p>
                  </div>
                  
                  <div className="bg-white/50 rounded-2xl p-6">
                    <h3 className="lxera-card-title mb-2">Performance Cookies</h3>
                    <p className="lxera-body-text">
                      These cookies help us understand how visitors interact with our platform by collecting 
                      and reporting information anonymously.
                    </p>
                  </div>
                  
                  <div className="bg-white/50 rounded-2xl p-6">
                    <h3 className="lxera-card-title mb-2">Functionality Cookies</h3>
                    <p className="lxera-body-text">
                      These cookies allow the platform to remember choices you make and provide enhanced, 
                      personalized features.
                    </p>
                  </div>
                  
                  <div className="bg-white/50 rounded-2xl p-6">
                    <h3 className="lxera-card-title mb-2">Analytics Cookies</h3>
                    <p className="lxera-body-text">
                      We use analytics cookies to understand how our platform is being used and to improve 
                      our services based on user behavior patterns.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="lxera-section-title mb-4">Managing Cookies</h2>
                <p className="lxera-body-text mb-4">
                  You can control and manage cookies in your browser settings. However, please note that 
                  disabling certain cookies may affect the functionality of our platform.
                </p>
                
                <div className="bg-blue-50/50 rounded-2xl p-6">
                  <h3 className="lxera-card-title mb-2">Browser Settings</h3>
                  <p className="lxera-body-text">
                    Most web browsers allow you to control cookies through their settings preferences. 
                    You can usually find these options in the "Tools" or "Preferences" menu of your browser.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="lxera-section-title mb-4">Third-Party Cookies</h2>
                <p className="lxera-body-text mb-4">
                  We may use third-party services that set their own cookies. These services help us 
                  provide better functionality and understand how our platform is used.
                </p>
              </section>

              <section>
                <h2 className="lxera-section-title mb-4">Updates to This Policy</h2>
                <p className="lxera-body-text mb-4">
                  We may update this Cookie Policy from time to time to reflect changes in our practices 
                  or for other operational, legal, or regulatory reasons.
                </p>
              </section>

              <section>
                <h2 className="lxera-section-title mb-4">Contact Us</h2>
                <p className="lxera-body-text">
                  If you have any questions about our use of cookies, please contact us at 
                  cookies@lxera.ai or through our contact page.
                </p>
              </section>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default CookiePolicy;
