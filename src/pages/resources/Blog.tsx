
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, ArrowRight, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

const Blog = () => {
  const featuredPost = {
    title: "The Future of AI-Powered Learning: Transforming Workforce Development",
    excerpt: "Discover how artificial intelligence is revolutionizing the way organizations approach learning and development, creating personalized experiences that adapt to individual needs.",
    image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    author: "Sarah Chen",
    date: "March 15, 2024",
    readTime: "8 min read",
    category: "AI & Innovation",
    tags: ["AI", "Learning", "Future of Work"]
  };

  const blogPosts = [
    {
      title: "Building Citizen Developer Programs: A Complete Guide",
      excerpt: "Learn how to empower your workforce with no-code/low-code capabilities and create a culture of innovation.",
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      author: "Michael Rodriguez",
      date: "March 12, 2024",
      readTime: "6 min read",
      category: "Innovation",
      tags: ["Citizen Development", "No-Code", "Innovation"]
    },
    {
      title: "Personalized Learning Paths: The Science Behind Adaptive Education",
      excerpt: "Explore the research and technology that makes personalized learning effective and engaging for modern learners.",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      author: "Dr. Emma Thompson",
      date: "March 10, 2024",
      readTime: "10 min read",
      category: "Learning Science",
      tags: ["Personalization", "EdTech", "Research"]
    },
    {
      title: "Measuring ROI in Learning & Development: Metrics That Matter",
      excerpt: "Discover the key performance indicators and methodologies for evaluating the success of your L&D initiatives.",
      image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      author: "James Park",
      date: "March 8, 2024",
      readTime: "7 min read",
      category: "Analytics",
      tags: ["ROI", "Analytics", "Measurement"]
    },
    {
      title: "The Rise of Microlearning: Small Steps, Big Impact",
      excerpt: "How bite-sized learning modules are transforming professional development and improving knowledge retention.",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      author: "Lisa Wang",
      date: "March 5, 2024",
      readTime: "5 min read",
      category: "Learning Trends",
      tags: ["Microlearning", "Engagement", "Retention"]
    }
  ];

  const categories = [
    "All Posts",
    "AI & Innovation",
    "Learning Science",
    "Innovation",
    "Analytics",
    "Learning Trends"
  ];

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
              Insights, trends, and innovations in learning and workforce development
            </p>
            
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto mb-12">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-business-black/40 w-5 h-5" />
                <Input 
                  placeholder="Search articles..." 
                  className="pl-10 bg-white/80 backdrop-blur-sm border-gray-200/50"
                />
              </div>
              <Button variant="outline" className="bg-white/80 backdrop-blur-sm border-gray-200/50">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((category, index) => (
              <Badge 
                key={index}
                variant={index === 0 ? "default" : "secondary"}
                className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                  index === 0 
                    ? "bg-business-black text-white" 
                    : "bg-white/80 text-business-black border-gray-200/50 hover:bg-business-black hover:text-white"
                }`}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="pb-16 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-business-black mb-4 font-inter">Featured Article</h2>
          </div>
          
          <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-102 border-0 bg-white/80 backdrop-blur-sm">
            <div className="grid lg:grid-cols-2 gap-0">
              <div className="relative h-64 lg:h-auto">
                <img 
                  src={featuredPost.image} 
                  alt={featuredPost.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-business-black text-white">
                    {featuredPost.category}
                  </Badge>
                </div>
              </div>
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-4 text-sm text-business-black/60 mb-4">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {featuredPost.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {featuredPost.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {featuredPost.readTime}
                  </div>
                </div>
                
                <h3 className="text-2xl lg:text-3xl font-bold text-business-black mb-4 font-inter">
                  {featuredPost.title}
                </h3>
                
                <p className="text-business-black/70 mb-6 font-inter text-lg leading-relaxed">
                  {featuredPost.excerpt}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {featuredPost.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="bg-business-black/10 text-business-black border-0">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <Button className="bg-business-black text-white hover:bg-business-black/90 w-fit">
                  Read Article
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Recent Posts Grid */}
      <section className="py-16 px-6 lg:px-12 bg-gradient-to-r from-smart-beige/30 to-business-black/5">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-business-black mb-4 font-inter">Recent Articles</h2>
            <p className="text-xl text-business-black/70 font-inter">
              Stay updated with the latest insights and trends
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {blogPosts.map((post, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-102 border-0 bg-white/80 backdrop-blur-sm">
                <div className="relative h-48">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-business-black text-white">
                      {post.category}
                    </Badge>
                  </div>
                </div>
                
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4 text-sm text-business-black/60 mb-2">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {post.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {post.date}
                    </div>
                  </div>
                  
                  <CardTitle className="text-xl font-semibold text-business-black font-inter mb-2 line-clamp-2">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <CardDescription className="text-business-black/70 font-inter text-base leading-relaxed mb-4 line-clamp-3">
                    {post.excerpt}
                  </CardDescription>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="secondary" className="bg-business-black/10 text-business-black border-0 text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-business-black/60">
                      <Clock className="w-4 h-4" />
                      {post.readTime}
                    </div>
                    <Button variant="ghost" className="text-business-black hover:bg-business-black hover:text-white p-2">
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button className="bg-business-black text-white hover:bg-business-black/90 px-8 py-3">
              Load More Articles
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
