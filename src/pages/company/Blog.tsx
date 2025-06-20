
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, User, Search, TrendingUp, BookOpen, Lightbulb, Users, Brain } from "lucide-react";

const Blog = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", name: "All Posts", count: 24 },
    { id: "ai-learning", name: "AI & Learning", count: 8 },
    { id: "innovation", name: "Innovation", count: 6 },
    { id: "workplace", name: "Future of Work", count: 5 },
    { id: "case-studies", name: "Case Studies", count: 3 },
    { id: "product", name: "Product Updates", count: 2 }
  ];

  const featuredPost = {
    title: "The Future of Workplace Learning: How AI is Revolutionizing Employee Development",
    excerpt: "Discover how artificial intelligence is transforming the way organizations approach learning and development, creating personalized experiences that drive real business outcomes.",
    author: "Dr. Sarah Chen",
    date: "2024-06-15",
    readTime: "8 min read",
    category: "ai-learning",
    image: "/placeholder.svg",
    trending: true
  };

  const posts = [
    {
      title: "Building Innovation Culture: Lessons from 500+ Enterprises",
      excerpt: "Key insights from organizations that successfully transformed their innovation capabilities using LXERA's platform.",
      author: "Marcus Rodriguez",
      date: "2024-06-12",
      readTime: "6 min read",
      category: "innovation",
      image: "/placeholder.svg"
    },
    {
      title: "Personalized Learning Paths: The Science Behind Effective Skill Development",
      excerpt: "Understanding how AI-powered personalization creates more effective learning experiences for every individual.",
      author: "Dr. Aisha Patel",
      date: "2024-06-10",
      readTime: "5 min read",
      category: "ai-learning",
      image: "/placeholder.svg"
    },
    {
      title: "Remote Team Collaboration: Scaling Innovation Across Global Workforces",
      excerpt: "Best practices for maintaining innovation momentum with distributed teams and virtual collaboration.",
      author: "James Liu",
      date: "2024-06-08",
      readTime: "7 min read",
      category: "workplace",
      image: "/placeholder.svg"
    },
    {
      title: "ROI of Learning: Measuring the Business Impact of Employee Development",
      excerpt: "Data-driven approaches to quantifying the return on investment in learning and development initiatives.",
      author: "Lisa Chen",
      date: "2024-06-05",
      readTime: "9 min read",
      category: "case-studies",
      image: "/placeholder.svg"
    },
    {
      title: "LXERA 3.0: Introducing Advanced Analytics and Mentor AI",
      excerpt: "Explore the latest platform updates including enhanced learning analytics and our new AI-powered mentorship features.",
      author: "Product Team",
      date: "2024-06-03",
      readTime: "4 min read",
      category: "product",
      image: "/placeholder.svg"
    },
    {
      title: "Citizen Development Revolution: Empowering Non-Technical Teams",
      excerpt: "How low-code/no-code platforms are democratizing innovation and enabling every employee to become a creator.",
      author: "Alex Thompson",
      date: "2024-06-01",
      readTime: "6 min read",
      category: "innovation",
      image: "/placeholder.svg"
    }
  ];

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "ai-learning": return Brain;
      case "innovation": return Lightbulb;
      case "workplace": return Users;
      case "case-studies": return TrendingUp;
      case "product": return BookOpen;
      default: return BookOpen;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "ai-learning": return "bg-purple-100 text-purple-700";
      case "innovation": return "bg-amber-100 text-amber-700";
      case "workplace": return "bg-blue-100 text-blue-700";
      case "case-studies": return "bg-emerald-100 text-emerald-700";
      case "product": return "bg-rose-100 text-rose-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-smart-beige">
      {/* Hero Section */}
      <section className="relative py-24 px-6 lg:px-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-future-green/10 to-emerald/5"></div>
        <div className="max-w-6xl mx-auto relative text-center">
          <h1 className="text-5xl lg:text-7xl font-bold text-business-black mb-6">
            Insights for the
            <span className="block bg-gradient-to-r from-future-green to-emerald bg-clip-text text-transparent">
              future of learning
            </span>
          </h1>
          <p className="text-xl text-business-black/70 max-w-3xl mx-auto mb-8 leading-relaxed">
            Discover the latest trends, research, and best practices in workplace learning, 
            innovation management, and organizational transformation.
          </p>
          
          {/* Search */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-business-black/40 w-5 h-5" />
            <Input
              type="search"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 bg-white/90 border-0 rounded-xl text-lg py-6"
            />
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-4 justify-center">
            {categories.map((category) => (
              <Button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                variant={selectedCategory === category.id ? "default" : "outline"}
                className={`rounded-full px-6 py-2 transition-all duration-300 ${
                  selectedCategory === category.id 
                    ? "bg-business-black text-white hover:bg-business-black/90" 
                    : "border-business-black/30 text-business-black hover:bg-business-black hover:text-white"
                }`}
              >
                {category.name} ({category.count})
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-12 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-0">
              <div className="relative h-64 lg:h-auto bg-gradient-to-br from-future-green/20 to-emerald/20">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-future-green to-emerald rounded-full"></div>
                </div>
                {featuredPost.trending && (
                  <Badge className="absolute top-4 left-4 bg-future-green text-business-black border-0">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Trending
                  </Badge>
                )}
              </div>
              <div className="p-8 lg:p-12">
                <div className="flex items-center gap-2 mb-4">
                  <Badge className={getCategoryColor(featuredPost.category)}>
                    {categories.find(c => c.id === featuredPost.category)?.name}
                  </Badge>
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-business-black mb-4 group-hover:text-future-green transition-colors duration-300">
                  {featuredPost.title}
                </h2>
                <p className="text-business-black/70 text-lg mb-6 leading-relaxed">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-business-black/60">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span className="text-sm">{featuredPost.author}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">{featuredPost.date}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{featuredPost.readTime}</span>
                    </div>
                  </div>
                  <Button className="bg-future-green text-business-black hover:bg-emerald hover:text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105">
                    Read Article
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-12 px-6 lg:px-12 bg-white/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, index) => {
              const CategoryIcon = getCategoryIcon(post.category);
              return (
                <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm overflow-hidden">
                  <div className="relative h-48 bg-gradient-to-br from-future-green/20 to-emerald/20">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <CategoryIcon className="w-12 h-12 text-future-green" />
                    </div>
                  </div>
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getCategoryColor(post.category)}>
                        {categories.find(c => c.id === post.category)?.name}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl text-business-black group-hover:text-future-green transition-colors duration-300">
                      {post.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-business-black/70 mb-6 leading-relaxed">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-sm text-business-black/60 mb-4">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-business-black/60">{post.date}</span>
                      <Button size="sm" className="bg-future-green text-business-black hover:bg-emerald hover:text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105">
                        Read More
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-business-black/30 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-business-black mb-2">
                No articles found
              </h3>
              <p className="text-business-black/60">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-20 px-6 lg:px-12 bg-gradient-to-br from-business-black to-business-black/90">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Stay informed with our newsletter
          </h2>
          <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
            Get the latest insights on learning innovation, AI trends, and workplace transformation 
            delivered to your inbox every week.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              className="bg-white/90 border-0 flex-1 rounded-xl"
            />
            <Button className="bg-future-green text-business-black hover:bg-emerald hover:text-white font-semibold px-8 rounded-xl transition-all duration-300 hover:scale-105">
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Blog;
