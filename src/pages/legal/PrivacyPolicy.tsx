
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const PrivacyPolicy = () => {
  return (
    <>
      <SEO 
        title="Privacy Policy - LXERA"
        description="Learn how LXERA protects your privacy and handles your personal data with transparency and security."
      />
      <div className="min-h-screen bg-smart-beige">
        <Navigation />
        
        <div className="pt-32 pb-24 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-medium text-business-black mb-6">Privacy Policy</h1>
              <p className="lxera-subheadline">
                Your privacy is important to us. This policy explains how we collect, use, and protect your information.
              </p>
              <p className="lxera-caption text-business-black/60 mt-4">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>

            <div className="lxera-card p-8 space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-business-black mb-4">Information We Collect</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-business-black mb-2">Personal Information</h3>
                    <p className="lxera-body-text">
                      We collect information you provide directly to us, such as when you create an account, 
                      use our services, or contact us for support. This may include your name, email address, 
                      and other contact information.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-business-black mb-2">Usage Data</h3>
                    <p className="lxera-body-text">
                      We automatically collect certain information about your device and how you use our platform, 
                      including your IP address, browser type, and usage patterns to improve our services.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-business-black mb-4">How We Use Your Information</h2>
                <ul className="space-y-2">
                  <li className="lxera-body-text flex items-start">
                    <span className="w-2 h-2 bg-future-green rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    To provide, maintain, and improve our learning platform
                  </li>
                  <li className="lxera-body-text flex items-start">
                    <span className="w-2 h-2 bg-future-green rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    To personalize your learning experience using AI technology
                  </li>
                  <li className="lxera-body-text flex items-start">
                    <span className="w-2 h-2 bg-future-green rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    To communicate with you about our services and updates
                  </li>
                  <li className="lxera-body-text flex items-start">
                    <span className="w-2 h-2 bg-future-green rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    To ensure security and prevent fraud
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-business-black mb-4">Data Security</h2>
                <p className="lxera-body-text mb-4">
                  We implement appropriate security measures to protect your personal information against 
                  unauthorized access, alteration, disclosure, or destruction. This includes encryption, 
                  secure data transmission, and regular security assessments.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-business-black mb-4">Your Rights</h2>
                <p className="lxera-body-text mb-4">
                  You have the right to access, update, or delete your personal information. You may also 
                  opt out of certain communications from us. To exercise these rights, please contact us 
                  using the information provided below.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-business-black mb-4">Contact Us</h2>
                <p className="lxera-body-text">
                  If you have any questions about this Privacy Policy, please contact us at privacy@lxera.ai 
                  or through our contact page.
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

export default PrivacyPolicy;
