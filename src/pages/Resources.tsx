import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, FileText, Video, Headphones, Download, ExternalLink, Users, Lightbulb, TrendingUp, MessageCircle } from "lucide-react";

const Resources = () => {
  const resourceCategories = [];

  const communityResources = [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-smart-beige via-white to-future-green/10">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-8 sm:pb-16 px-4 sm:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-medium text-business-black mb-4 sm:mb-6 font-inter leading-tight px-2 sm:px-0">
            Learning <span className="text-future-green">Resources</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-business-black/70 mb-6 sm:mb-8 max-w-3xl mx-auto font-inter leading-relaxed px-2 sm:px-0">
            We're currently developing comprehensive resources to support your learning journey. Check back soon!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-2 sm:px-0">
            <Button className="bg-future-green hover:bg-future-green/90 text-white px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              Browse All Resources
            </Button>
            <Button variant="outline" className="border-business-black/20 text-business-black hover:bg-business-black hover:text-white px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl">
              Request Custom Content
            </Button>
          </div>
        </div>
      </section>

      {/* Empty State */}
      <section className="py-8 sm:py-16 px-4 sm:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 sm:p-12 md:p-16 shadow-lg">
            <BookOpen className="w-16 h-16 sm:w-20 sm:h-20 text-future-green/30 mx-auto mb-6" />
            <h2 className="text-xl sm:text-2xl md:text-3xl font-medium text-business-black mb-4">
              Resources Coming Soon
            </h2>
            <p className="text-base sm:text-lg text-business-black/70 max-w-2xl mx-auto mb-8">
              We're working on creating valuable resources including guides, templates, case studies, and best practices to support your learning transformation journey.
            </p>
            <Button 
              onClick={() => window.open('https://www.linkedin.com/company/lxera', '_blank')}
              className="bg-future-green hover:bg-future-green/90 text-white px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Follow Us for Updates
            </Button>
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-8 sm:py-16 px-4 sm:px-6 lg:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-business-black to-business-black/90 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 text-white">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium mb-3 sm:mb-4 font-inter leading-tight">
              Need Something Specific?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-white/80 mb-6 sm:mb-8 font-inter leading-relaxed px-2 sm:px-0">
              Our team can create custom resources tailored to your specific needs and industry requirements.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-2 sm:px-0">
              <Button className="bg-future-green hover:bg-future-green/90 text-white px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                Request Custom Resource
              </Button>
              <Button variant="outline" className="border-white/30 text-white hover:bg-white hover:text-business-black px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl">
                Schedule Consultation
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Resources;
