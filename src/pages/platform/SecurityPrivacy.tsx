
import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Eye, Globe, ArrowRight, CheckCircle, Zap, Award } from "lucide-react";
import { Link } from "react-router-dom";
import DemoModal from "@/components/DemoModal";
import ContactSalesModal from "@/components/ContactSalesModal";

const SecurityPrivacy = () => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isContactSalesModalOpen, setIsContactSalesModalOpen] = useState(false);
  const securityFeatures = [
    {
      title: "Enterprise-Grade Security",
      description: "Military-level encryption and security protocols protecting all data and communications",
      icon: Shield,
      features: ["AES-256 encryption", "Zero-trust architecture", "Multi-factor authentication", "Security monitoring"]
    },
    {
      title: "Data Hosting & Storage",
      description: "Secure, compliant data centers with geographic redundancy and backup systems",
      icon: Globe,
      features: ["Regional data residency", "99.9% uptime SLA", "Automated backups", "Disaster recovery"]
    },
    {
      title: "AI Transparency",
      description: "Clear explanations of AI decision-making processes and data usage policies",
      icon: Eye,
      features: ["Explainable AI", "Decision tracking", "Bias monitoring", "Algorithm auditing"]
    },
    {
      title: "Privacy Controls",
      description: "Comprehensive privacy management with user control over personal data",
      icon: Lock,
      features: ["Data portability", "Right to deletion", "Consent management", "Privacy dashboards"]
    }
  ];

  const compliance = [
    {
      standard: "GDPR",
      description: "Full compliance with European data protection regulations",
      region: "Europe"
    },
    {
      standard: "CCPA",
      description: "California Consumer Privacy Act compliant data handling",
      region: "California, USA"
    },
    {
      standard: "SOC 2 Type II",
      description: "Audited security, availability, and confidentiality controls",
      region: "Global"
    },
    {
      standard: "ISO 27001",
      description: "International standard for information security management",
      region: "Global"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-smart-beige via-white to-future-green/5">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center bg-future-green/20 px-4 py-2 rounded-full text-business-black font-medium text-sm mb-6">
            <Shield className="w-4 h-4 mr-2" />
            Enterprise Trust
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-medium text-business-black mb-8 leading-tight font-inter">
            Security &
            <span className="text-business-black block mt-2"> Data Privacy</span>
          </h1>
          <p className="text-lg sm:text-xl text-business-black/70 max-w-4xl mx-auto mb-12 leading-relaxed font-normal font-inter">
            Built with enterprise-grade security and privacy-first design. Your data, 
            your learners, and your organization are protected by industry-leading standards.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-business-black text-white rounded-xl px-8 py-4 text-base font-medium transition-all duration-300 hover:scale-105 font-inter"
              onClick={() => setIsDemoModalOpen(true)}
            >
              Request a Demo
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="rounded-xl px-8 py-4 text-base transition-all duration-300 hover:scale-105 font-inter font-normal"
              onClick={() => setIsContactSalesModalOpen(true)}
            >
              Talk to Our Experts
            </Button>
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-business-black mb-6 font-inter">
              Comprehensive Security Framework
            </h2>
            <p className="text-lg sm:text-xl text-business-black/70 max-w-3xl mx-auto leading-relaxed font-normal font-inter">
              Every aspect of LXERA is designed with security and privacy as foundational principles
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {securityFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-future-green/20 to-future-green/20 rounded-2xl flex items-center justify-center">
                        <IconComponent className="w-7 h-7 text-business-black" />
                      </div>
                      <Zap className="w-5 h-5 text-business-black/60" />
                    </div>
                    <CardTitle className="text-xl text-business-black group-hover:text-business-black transition-colors">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-business-black/60 mb-4">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {feature.features.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-center text-sm text-business-black/70">
                          <CheckCircle className="w-4 h-4 text-future-green mr-3 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Compliance Standards */}
      <section className="py-20 px-6 bg-gradient-to-r from-smart-beige/20 to-future-green/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-business-black mb-6 font-inter">
              Global Compliance Standards
            </h2>
            <p className="text-lg sm:text-xl text-business-black/70 max-w-3xl mx-auto leading-relaxed font-normal font-inter">
              Certified and audited against the world's most stringent data protection standards
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {compliance.map((standard, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-lg text-business-black flex items-center">
                      <Award className="w-5 h-5 text-future-green mr-2" />
                      {standard.standard}
                    </CardTitle>
                    <div className="bg-future-green/20 px-3 py-1 rounded-full">
                      <span className="text-sm font-medium text-business-black">
                        {standard.region}
                      </span>
                    </div>
                  </div>
                  <CardDescription className="text-business-black/60">
                    {standard.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Metrics */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-business-black to-business-black/90 text-white overflow-hidden">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-3xl sm:text-4xl font-medium mb-4 font-inter">
                Trust Through Transparency
              </CardTitle>
              <CardDescription className="text-white/70 text-lg sm:text-xl font-inter">
                Our commitment to security and privacy by the numbers
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-future-green mb-2">Zero</div>
                <div className="text-sm text-white/70">Data Breaches</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-future-green mb-2">99.9%</div>
                <div className="text-sm text-white/70">Uptime SLA</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-future-green mb-2">24/7</div>
                <div className="text-sm text-white/70">Security Monitoring</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-business-black mb-6 font-inter">
            Security You Can Trust
          </h2>
          <p className="text-lg sm:text-xl text-business-black/70 mb-8 leading-relaxed font-normal font-inter">
            Learn more about our comprehensive approach to protecting your most valuable asset: data
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-business-black text-white rounded-xl px-8 py-4 text-base font-medium transition-all duration-300 hover:scale-105 font-inter"
              onClick={() => setIsDemoModalOpen(true)}
            >
              Request a Demo
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="rounded-xl px-8 py-4 text-base transition-all duration-300 hover:scale-105 font-inter font-normal"
              onClick={() => setIsContactSalesModalOpen(true)}
            >
              Talk to Our Experts
            </Button>
          </div>
        </div>
      </section>

      <Footer />
      
      {/* Modals */}
      <DemoModal 
        isOpen={isDemoModalOpen} 
        onClose={() => setIsDemoModalOpen(false)}
        source="Security & Privacy Page"
      />
      <ContactSalesModal 
        isOpen={isContactSalesModalOpen} 
        onClose={() => setIsContactSalesModalOpen(false)}
      />
    </div>
  );
};

export default SecurityPrivacy;
