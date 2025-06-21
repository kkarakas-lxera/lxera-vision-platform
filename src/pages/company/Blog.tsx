
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, ArrowRight, TrendingUp, Lightbulb, Users } from "lucide-react";

const Blog = () => {
  const featuredPost = {
    title: "The Future of AI-Powered Learning: 5 Trends Shaping 2024",
    excerpt: "Discover how artificial intelligence is revolutionizing workplace learning and what it means for your organization's growth strategy.",
    author: "Dr. Sarah Chen",
    date: "March 15, 2024",
    readTime: "8 min read",
    category: "AI & Innovation",
    image: "/placeholder.svg"
  };

  const blogPosts = [
    {
      title: "Building a Culture of Continuous Learning",
      excerpt: "Learn how leading organizations foster environments where learning becomes second nature and drives innovation.",
      author: "Marcus Rodriguez",
      date: "March 12, 2024",
      readTime: "6 min read",
      category: "Culture",
      image: "/placeholder.svg"
    },
    {
      title: "Measuring ROI in Corporate Learning Programs",
      excerpt: "A comprehensive guide to tracking and demonstrating the business impact of your learning initiatives.",
      author: "Aisha Patel",
      date: "March 8, 2024",
      readTime: "10 min read",
      category: "Analytics",
      image: "/placeholder.svg"
    },
    {
      title: "Personalization at Scale: Making Learning Relevant",
      excerpt: "How AI-driven personalization can deliver relevant learning experiences to thousands of employees simultaneously.",
      author: "James Liu",
      date: "March 5, 2024",
      readTime: "7 min read",
      category: "Personalization",
      image: "/placeholder.svg"
    },
    {
      title: "The Rise of Peer-to-Peer Learning in Enterprise",
      excerpt: "Why collaborative learning models are becoming essential for organizational knowledge sharing and growth.",
      author: "Elena Vasquez",
      date: "March 1, 2024",
      readTime: "5 min read", 
      category: "Collaboration",
      image: "/placeholder.svg"
    },
    {
      title: "Innovation Labs: Turning Learning into Business Impact",
      excerpt: "How companies are using innovation labs to transform learning insights into tangible business outcomes.",
      author: "David Kim",
      date: "February 28, 2024",
      readTime: "9 min read",
      category: "Innovation",
      image: "/placeholder.svg"
    },
    {
      title: "Bridging the Skills Gap with AI-Powered Assessments",
      excerpt: "Modern approaches to identifying and closing skill gaps using intelligent assessment technologies.",
      author: "Sarah Chen",
      date: "February 25, 2024",
      readTime: "6 min read",
      category: "Skills Development",
      image: "/placeholder.svg"
    }
  ];

  const categories = [
    { name: "AI & Innovation", count: 12, icon: Lightbulb },
    { name: "Culture", count: 8, icon: Users },
    { name: "Analytics", count: 6, icon: TrendingUp },
    { name: "All Posts", count: 32, icon: null }
  ];

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
            Discover the latest trends, insights, and best practices in AI-powered learning, 
            innovation enablement, and organizational transformation.
          </p>
          <Button className="bg-future-green text-business-black hover:bg-emerald hover:text-white font-semibold px-8 py-3 rounded-xl text-lg transition-all duration-300">
            Subscribe to Updates
          </Button>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  className="rounded-full border-business-black/20 hover:bg-future-green hover:text-business-black hover:border-future-green transition-all duration-300"
                >
                  {IconComponent && <IconComponent className="w-4 h-4 mr-2" />}
                  {category.name} ({category.count})
                </Button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-12 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-0">
              <div className="bg-gradient-to-br from-future-green/20 to-emerald/20 flex items-center justify-center p-12">
                <div className="w-full h-48 bg-gradient-to-br from-future-green to-emerald rounded-2xl"></div>
              </div>
              <CardContent className="p-8 flex flex-col justify-center">
                <Badge className="bg-future-green text-business-black w-fit mb-4">
                  Featured Post
                </Badge>
                <h2 className="text-2xl font-bold text-business-black mb-4 leading-tight">
                  {featuredPost.title}
                </h2>
                <p className="text-business-black/70 mb-6 leading-relaxed">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center gap-4 text-sm text-business-black/60 mb-6">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {featuredPost.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {featuredPost.date}
                  </div>
                  <span>{featuredPost.readTime}</span>
                </div>
                <Button className="bg-business-black text-white hover:bg-future-green hover:text-business-black transition-all duration-300 rounded-xl w-fit">
                  Read Article <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </div>
          </Card>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-business-black mb-6">
              Latest Articles
            </h2>
            <p className="text-lg text-business-black/70">
              Stay updated with the latest insights and trends
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <Card key={index} className="border-0 bg-white/70 backdrop-blur-sm hover:shadow-lg transition-all duration-300 group overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-future-green/20 to-emerald/20 flex items-center justify-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-future-green to-emerald rounded-xl group-hover:scale-110 transition-transform duration-300"></div>
                </div>
                <CardContent className="p-6">
                  <Badge variant="secondary" className="bg-future-green/10 text-future-green mb-3">
                    {post.category}
                  </Badge>
                  <h3 className="text-lg font-bold text-business-black mb-3 group-hover:text-future-green transition-colors duration-300 leading-tight">
                    {post.title}
                  </h3>
                  <p className="text-business-black/70 text-sm mb-4 leading-relaxed">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-business-black/60 mb-4">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {post.author}
                    </div>
                    <span>{post.readTime}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-business-black/60">
                    <Calendar className="w-3 h-3" />
                    {post.date}
                  </div>
                </CardContent>
              </Card>
            ))}
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
