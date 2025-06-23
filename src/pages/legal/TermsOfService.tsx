
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const TermsOfService = () => {
  return (
    <>
      <SEO 
        title="Terms of Service - LXERA"
        description="Read LXERA's terms of service to understand your rights and responsibilities when using our platform."
      />
      <div className="min-h-screen bg-smart-beige">
        <Navigation />
        
        <div className="pt-32 pb-24 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="lxera-headline mb-6">Terms of Service</h1>
              <p className="lxera-subheadline">
                These terms govern your use of LXERA's learning platform and services.
              </p>
              <p className="lxera-caption text-business-black/60 mt-4">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>

            <div className="lxera-card p-8 space-y-8">
              <section>
                <h2 className="lxera-section-title mb-4">Acceptance of Terms</h2>
                <p className="lxera-body-text">
                  By accessing and using LXERA's platform, you accept and agree to be bound by the terms 
                  and provision of this agreement. If you do not agree to these terms, you should not 
                  use our services.
                </p>
              </section>

              <section>
                <h2 className="lxera-section-title mb-4">Use of Services</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="lxera-card-title mb-2">Permitted Use</h3>
                    <p className="lxera-body-text">
                      You may use our platform for legitimate learning and business purposes in accordance 
                      with these terms and applicable laws.
                    </p>
                  </div>
                  <div>
                    <h3 className="lxera-card-title mb-2">Prohibited Activities</h3>
                    <ul className="space-y-2 mt-2">
                      <li className="lxera-body-text flex items-start">
                        <span className="w-2 h-2 bg-lxera-red rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Using the platform for illegal or unauthorized purposes
                      </li>
                      <li className="lxera-body-text flex items-start">
                        <span className="w-2 h-2 bg-lxera-red rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Attempting to gain unauthorized access to our systems
                      </li>
                      <li className="lxera-body-text flex items-start">
                        <span className="w-2 h-2 bg-lxera-red rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Sharing your account credentials with others
                      </li>
                      <li className="lxera-body-text flex items-start">
                        <span className="w-2 h-2 bg-lxera-red rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Interfering with or disrupting our services
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="lxera-section-title mb-4">User Accounts</h2>
                <p className="lxera-body-text mb-4">
                  You are responsible for maintaining the confidentiality of your account and password. 
                  You agree to accept responsibility for all activities that occur under your account.
                </p>
              </section>

              <section>
                <h2 className="lxera-section-title mb-4">Intellectual Property</h2>
                <p className="lxera-body-text mb-4">
                  The platform and its original content, features, and functionality are owned by LXERA 
                  and are protected by international copyright, trademark, and other intellectual property laws.
                </p>
              </section>

              <section>
                <h2 className="lxera-section-title mb-4">Limitation of Liability</h2>
                <p className="lxera-body-text mb-4">
                  LXERA shall not be liable for any indirect, incidental, special, consequential, or 
                  punitive damages resulting from your use of the platform.
                </p>
              </section>

              <section>
                <h2 className="lxera-section-title mb-4">Changes to Terms</h2>
                <p className="lxera-body-text mb-4">
                  We reserve the right to modify these terms at any time. We will notify users of any 
                  material changes via email or through our platform.
                </p>
              </section>

              <section>
                <h2 className="lxera-section-title mb-4">Contact Information</h2>
                <p className="lxera-body-text">
                  For questions about these Terms of Service, please contact us at legal@lxera.com 
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

export default TermsOfService;
