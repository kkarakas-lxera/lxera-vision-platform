
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, ArrowRight, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

const Blog = () => {
  const featuredPost = null;
  const blogPosts = [];
  const categories = [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-smart-beige via-white to-business-black/5">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-6xl font-bold text-business-black mb-6 font-inter">
              LXERA <span className="text-business-black">Blog</span>
            </h1>
            <p className="text-xl text-business-black/70 mb-8 max-w-3xl mx-auto font-inter">
              We're preparing valuable insights and thought leadership content. Stay tuned!
            </p>
            
          </div>

        </div>
      </section>

      {/* Empty State */}
      <section className="py-16 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 lg:p-16 shadow-lg">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-business-black/10 rounded-full mb-6">
              <Calendar className="w-10 h-10 text-business-black/50" />
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-business-black mb-4 font-inter">
              Blog Coming Soon
            </h2>
            <p className="text-lg text-business-black/70 max-w-2xl mx-auto mb-8 font-inter">
              We're preparing insightful articles about learning innovation, AI in education, and workforce transformation. 
              Be the first to read our upcoming content!
            </p>
            <Button 
              onClick={() => window.open('https://www.linkedin.com/company/lxera', '_blank')}
              className="bg-business-black text-white hover:bg-business-black/90 px-8 py-3"
            >
              Follow Us on LinkedIn
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>


      {/* Newsletter Subscription */}
      <section className="py-16 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-business-black to-business-black/90 rounded-3xl p-8 lg:p-12 text-white">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 font-inter">
              Stay in the Loop
            </h2>
            <p className="text-xl text-white/80 mb-8 font-inter">
              Get the latest insights delivered to your inbox every week.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input 
                placeholder="Enter your email" 
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
              />
              <Button className="bg-white text-business-black hover:bg-gray-100 px-6">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
