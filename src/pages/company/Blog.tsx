
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, ArrowRight, TrendingUp, Lightbulb, Users } from "lucide-react";

const Blog = () => {
  const featuredPost = null;
  const blogPosts = [];
  const categories = [];

  return (
    <div className="min-h-screen bg-smart-beige">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl lg:text-6xl font-bold text-business-black mb-6">
            LXERA
            <span className="block bg-gradient-to-r from-future-green to-emerald bg-clip-text text-transparent">
              Insights
            </span>
          </h1>
          <p className="text-lg text-business-black/70 max-w-3xl mx-auto mb-8 leading-relaxed">
            We're preparing valuable insights and thought leadership content. Stay tuned!
          </p>
          <Button className="bg-future-green text-business-black hover:bg-emerald hover:text-white font-semibold px-8 py-3 rounded-xl text-lg transition-all duration-300">
            Subscribe to Updates
          </Button>
        </div>
      </section>


      {/* Empty State */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 lg:p-16 shadow-lg">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-future-green/20 rounded-full mb-6">
              <Calendar className="w-10 h-10 text-future-green" />
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-business-black mb-4">
              Blog Coming Soon
            </h2>
            <p className="text-lg text-business-black/70 max-w-2xl mx-auto mb-8">
              We're preparing insightful articles about learning innovation, AI in education, and workforce transformation. 
              Be the first to read our upcoming content!
            </p>
            <Button 
              onClick={() => window.open('https://www.linkedin.com/company/lxera', '_blank')}
              className="bg-future-green text-business-black hover:bg-emerald hover:text-white font-semibold px-8 py-3 rounded-xl text-lg transition-all duration-300"
            >
              Follow Us on LinkedIn
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>


      {/* Newsletter Signup */}
      <section className="py-20 px-6 lg:px-12 bg-gradient-to-br from-business-black to-business-black/90">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Stay in the Loop
          </h2>
          <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter for the latest insights on AI-powered learning and innovation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-future-green"
            />
            <Button className="bg-future-green text-business-black hover:bg-emerald hover:text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300">
              Subscribe
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
