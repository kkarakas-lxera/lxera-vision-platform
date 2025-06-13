import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, ArrowUp, Linkedin, Youtube, Play, Download, Users, Brain, Wrench, Rocket, Zap, Bot, MessageCircle, Headphones, Video, RefreshCw, Target, Network, CheckCircle, BarChart3, Heart } from "lucide-react";
import { useState } from "react";

const Index = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    role: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Demo request submitted:', formData);
    // Handle form submission
  };

  return (
    <div className="min-h-screen bg-smart-beige">
      {/* Navigation */}
      <nav className="w-full py-6 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold text-business-black">
            LXERA
          </div>
          <div className="hidden md:flex space-x-8">
            <a href="#platform" className="text-business-black hover:text-future-green transition-colors">Platform</a>
            <a href="#how-it-works" className="text-business-black hover:text-future-green transition-colors">How It Works</a>
            <a href="#features" className="text-business-black hover:text-future-green transition-colors">Features</a>
            <a href="#contact" className="text-business-black hover:text-future-green transition-colors">Contact</a>
          </div>
          <Button variant="outline" className="border-business-black text-business-black hover:bg-business-black hover:text-white">
            Sign In
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="w-full py-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto text-center animate-fade-in">
          <h1 className="text-5xl lg:text-7xl font-bold text-business-black mb-8 leading-tight">
            The First<br />
            <span className="text-future-green">Learning & Innovation</span><br />
            Experience Platform (LXIP)
          </h1>
          <p className="text-xl lg:text-2xl text-business-black/80 mb-12 max-w-5xl mx-auto font-medium">
            Empower your teams to learn faster, build smarter, and innovate from the frontline — in one intelligent, adaptive ecosystem.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-future-green text-business-black hover:bg-emerald hover:text-white text-lg px-8 py-4 rounded-full font-semibold lxera-hover"
            >
              Book a Demo
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-business-black text-business-black hover:bg-business-black hover:text-white text-lg px-8 py-4 rounded-full font-semibold lxera-hover"
            >
              <Play className="w-5 h-5 mr-2" />
              Watch 2-Min Intro
            </Button>
          </div>
          <div className="mt-16 animate-float">
            <ArrowDown className="w-8 h-8 text-business-black/60 mx-auto" />
          </div>
        </div>
      </section>

      {/* Why LXERA Section - Redesigned */}
      <section id="platform" className="w-full py-20 px-6 lg:px-12 bg-gradient-to-br from-white via-smart-beige/30 to-future-green/10 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-64 h-64 bg-future-green rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-48 h-48 bg-lxera-blue rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-business-black mb-6">
              🌟 Why LXERA – Real Impact. Not Just Theory.
            </h2>
            <p className="text-xl text-business-black/80 max-w-3xl mx-auto leading-relaxed">
              Five strategic pillars that transform how your teams learn, build, and innovate together.
            </p>
          </div>
          
          <div className="space-y-16">
            {/* Pillar 1 - Left aligned */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-future-green rounded-2xl flex items-center justify-center mr-6">
                    <Brain className="w-8 h-8 text-business-black" />
                  </div>
                  <Badge className="bg-future-green/20 text-business-black border-future-green">
                    <span className="font-bold">60% faster</span> completion
                  </Badge>
                </div>
                <h3 className="text-3xl font-bold text-business-black mb-4">
                  Personalized Learning Journeys
                </h3>
                <p className="text-lg text-future-green font-semibold mb-6">
                  AI adapts to each learner's pace, style, and goals in real-time.
                </p>
                <ul className="space-y-3 text-business-black/80">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-future-green mr-3 mt-0.5 flex-shrink-0" />
                    Dynamic content paths based on individual behavior and performance
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-future-green mr-3 mt-0.5 flex-shrink-0" />
                    Multi-modal learning with video, audio, and interactive simulations
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-future-green mr-3 mt-0.5 flex-shrink-0" />
                    Continuous assessment and adaptive difficulty adjustment
                  </li>
                </ul>
              </div>
              <div className="order-1 lg:order-2">
                <Card className="bg-white/80 backdrop-blur-sm border-0 lxera-shadow">
                  <CardContent className="p-8">
                    <img 
                      src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=300&fit=crop" 
                      alt="AI-powered learning interface"
                      className="rounded-lg w-full h-64 object-cover"
                    />
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Pillar 2 - Right aligned */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-1">
                <Card className="bg-white/80 backdrop-blur-sm border-0 lxera-shadow">
                  <CardContent className="p-8">
                    <img 
                      src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&h=300&fit=crop" 
                      alt="Data analytics dashboard"
                      className="rounded-lg w-full h-64 object-cover"
                    />
                  </CardContent>
                </Card>
              </div>
              <div className="order-2">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-lxera-blue rounded-2xl flex items-center justify-center mr-6">
                    <BarChart3 className="w-8 h-8 text-business-black" />
                  </div>
                  <Badge className="bg-lxera-blue/20 text-business-black border-lxera-blue">
                    <span className="font-bold">3x higher</span> engagement
                  </Badge>
                </div>
                <h3 className="text-3xl font-bold text-business-black mb-4">
                  Smart Analytics & Insights
                </h3>
                <p className="text-lg text-lxera-blue font-semibold mb-6">
                  Real-time visibility into learning progress and skill development.
                </p>
                <ul className="space-y-3 text-business-black/80">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-lxera-blue mr-3 mt-0.5 flex-shrink-0" />
                    Predictive analytics for skill gap identification
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-lxera-blue mr-3 mt-0.5 flex-shrink-0" />
                    Team performance dashboards with actionable insights
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-lxera-blue mr-3 mt-0.5 flex-shrink-0" />
                    ROI tracking for learning initiatives and outcomes
                  </li>
                </ul>
              </div>
            </div>

            {/* Pillar 3 - Left aligned */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-emerald rounded-2xl flex items-center justify-center mr-6">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <Badge className="bg-emerald/20 text-business-black border-emerald">
                    <span className="font-bold">85% satisfaction</span> rate
                  </Badge>
                </div>
                <h3 className="text-3xl font-bold text-business-black mb-4">
                  Emotional Learning Engine
                </h3>
                <p className="text-lg text-emerald font-semibold mb-6">
                  Psychology-driven design that keeps learners motivated and engaged.
                </p>
                <ul className="space-y-3 text-business-black/80">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-emerald mr-3 mt-0.5 flex-shrink-0" />
                    Emotional state recognition and adaptive responses
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-emerald mr-3 mt-0.5 flex-shrink-0" />
                    Personalized motivation triggers and reward systems
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-emerald mr-3 mt-0.5 flex-shrink-0" />
                    Stress-free learning environment with mental health support
                  </li>
                </ul>
              </div>
              <div className="order-1 lg:order-2">
                <Card className="bg-white/80 backdrop-blur-sm border-0 lxera-shadow">
                  <CardContent className="p-8">
                    <img 
                      src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500&h=300&fit=crop" 
                      alt="Collaborative learning environment"
                      className="rounded-lg w-full h-64 object-cover"
                    />
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Pillar 4 - Right aligned */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-1">
                <Card className="bg-white/80 backdrop-blur-sm border-0 lxera-shadow">
                  <CardContent className="p-8">
                    <img 
                      src="https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=500&h=300&fit=crop" 
                      alt="Innovation workshop"
                      className="rounded-lg w-full h-64 object-cover"
                    />
                  </CardContent>
                </Card>
              </div>
              <div className="order-2">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-light-green rounded-2xl flex items-center justify-center mr-6">
                    <Wrench className="w-8 h-8 text-business-black" />
                  </div>
                  <Badge className="bg-light-green/40 text-business-black border-light-green">
                    <span className="font-bold">200+ prototypes</span> built
                  </Badge>
                </div>
                <h3 className="text-3xl font-bold text-business-black mb-4">
                  Innovation Sandbox
                </h3>
                <p className="text-lg text-business-black font-semibold mb-6">
                  Low-code tools that turn learning into real, actionable solutions.
                </p>
                <ul className="space-y-3 text-business-black/80">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-light-green mr-3 mt-0.5 flex-shrink-0" />
                    Drag-and-drop interface for rapid prototyping
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-light-green mr-3 mt-0.5 flex-shrink-0" />
                    Integration with popular business tools and APIs
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-light-green mr-3 mt-0.5 flex-shrink-0" />
                    Collaborative workspace for team innovation projects
                  </li>
                </ul>
              </div>
            </div>

            {/* Pillar 5 - Left aligned */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-lxera-red rounded-2xl flex items-center justify-center mr-6">
                    <Network className="w-8 h-8 text-white" />
                  </div>
                  <Badge className="bg-lxera-red/20 text-business-black border-lxera-red">
                    <span className="font-bold">500+ connections</span> made
                  </Badge>
                </div>
                <h3 className="text-3xl font-bold text-business-black mb-4">
                  Connected Learning Ecosystem
                </h3>
                <p className="text-lg text-lxera-red font-semibold mb-6">
                  Seamless integration across your entire organization's learning stack.
                </p>
                <ul className="space-y-3 text-business-black/80">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-lxera-red mr-3 mt-0.5 flex-shrink-0" />
                    Native integrations with 50+ enterprise platforms
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-lxera-red mr-3 mt-0.5 flex-shrink-0" />
                    Single sign-on and unified user experience
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-lxera-red mr-3 mt-0.5 flex-shrink-0" />
                    Cross-platform data synchronization and analytics
                  </li>
                </ul>
              </div>
              <div className="order-1 lg:order-2">
                <Card className="bg-white/80 backdrop-blur-sm border-0 lxera-shadow">
                  <CardContent className="p-8">
                    <img 
                      src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=500&h=300&fit=crop" 
                      alt="Connected network visualization"
                      className="rounded-lg w-full h-64 object-cover"
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="w-full py-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-bold text-business-black text-center mb-8">
            How It Works
          </h2>
          <p className="text-xl text-business-black/80 text-center mb-16 max-w-3xl mx-auto">
            A Seamless, Dynamic Experience
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Connect Your Team", desc: "Upload or sync with your HR system to onboard users.", icon: <Users className="w-8 h-8" /> },
              { step: "02", title: "Feed in Your Knowledge Base", desc: "Integrate internal documents, SOPs, wikis, and project data — so LXERA generates content grounded in your actual operations.", icon: <Bot className="w-8 h-8" /> },
              { step: "03", title: "Map Skills and Gaps", desc: "AI analyzes team roles, skills, and goals to define learning and innovation paths.", icon: <Target className="w-8 h-8" /> },
              { step: "04", title: "Deliver Personalized Learning", desc: "Every learner receives content and simulations tailored by role, behavior, and live performance — powered by RAG.", icon: <Brain className="w-8 h-8" /> },
              { step: "05", title: "Prototype in the Sandbox", desc: "Low-code tools let learners create real solutions and apply what they learn immediately.", icon: <Wrench className="w-8 h-8" /> },
              { step: "06", title: "Track & Support Innovation", desc: "Your CoE can monitor progress, provide mentorship, and drive project-based transformation.", icon: <Rocket className="w-8 h-8" /> }
            ].map((item, index) => (
              <Card key={index} className="bg-white border-0 lxera-shadow lxera-hover">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-future-green rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-business-black font-bold text-xl">{item.step}</span>
                  </div>
                  <div className="text-future-green mb-4 flex justify-center">{item.icon}</div>
                  <h3 className="text-xl font-bold text-business-black mb-4">{item.title}</h3>
                  <p className="text-business-black/70">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Highlights */}
      <section id="features" className="w-full py-20 px-6 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-bold text-business-black text-center mb-8">
            Platform Highlights
          </h2>
          <p className="text-xl text-business-black/80 text-center mb-16 max-w-3xl mx-auto">
            The full intelligence stack that powers LXERA's unique value.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "AI-Based Content Generation + SME Review", desc: "Generate hyper-personalized content, enhanced and validated through a subject-matter expert layer.", icon: "🔮" },
              { title: "RAG-Based Personalization Engine", desc: "Our Retrieval-Augmented Generation system adapts content dynamically based on learner behavior and context.", icon: "🔁" },
              { title: "Innovation Hub with CoE Coaching", desc: "Enable internal innovation with structured sprints, mentorship, and prototyping tools.", icon: "🛠" },
              { title: "Dynamic Gamification Engine", desc: "Each learner receives their own personalized game experience — no fixed tracks, no static badges.", icon: "🎮" },
              { title: "Avatar-Based Dynamic Video Learning", desc: "LXERA converts generated content into AI avatar-led videos — personalized, instant, and scalable.", icon: "🧑‍🏫" },
              { title: "Dynamic Audio Narration", desc: "Every module is voice-enabled via advanced AI narration — perfect for flexible and auditory learning.", icon: "🎧" },
              { title: "Org-Specific AI Chatbot", desc: "Each organization receives a dedicated chatbot trained on their data — offering real-time, contextual support to employees.", icon: "🤖" },
              { title: "Social Learning Spaces", desc: "Discussion boards, collaborative areas, and innovation threads keep learners engaged and connected.", icon: "💬" },
              { title: "On-Demand Mentorship", desc: "Live access to experienced mentors — available at key learning and innovation checkpoints.", icon: "👥" }
            ].map((feature, index) => (
              <Card key={index} className="bg-smart-beige border-0 lxera-shadow lxera-hover">
                <CardContent className="p-8">
                  <div className="text-4xl mb-6">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-business-black mb-4">{feature.title}</h3>
                  <p className="text-business-black/70">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Smart Knowledge Delivery Section */}
      <section className="w-full py-20 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold text-business-black mb-8">
                Smart Knowledge Delivery
              </h2>
              <p className="text-xl text-business-black/80 mb-8 leading-relaxed">
                Turn Your Internal Knowledge into Learning That Builds.
              </p>
              <p className="text-lg text-business-black/70 mb-8">
                LXERA doesn't just deliver content — it transforms your internal knowledge into real-time, context-rich learning journeys.
              </p>
              
              <div className="space-y-6">
                {[
                  { icon: <Network className="w-6 h-6" />, title: "Knowledge Integration", desc: "Connect your internal docs, SOPs, wikis, and project archives." },
                  { icon: <Brain className="w-6 h-6" />, title: "Live Scenario Generation", desc: "LXERA uses your data to generate realistic case studies, examples, and learning flows." },
                  { icon: <Target className="w-6 h-6" />, title: "Behavior-Based Adaptation", desc: "Content evolves based on how each user engages, reflects, and performs." },
                  { icon: <RefreshCw className="w-6 h-6" />, title: "Continuously Optimized", desc: "LXERA updates automatically as your organization changes and grows." }
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="text-future-green mt-1">{item.icon}</div>
                    <div>
                      <h4 className="font-semibold text-business-black mb-2">{item.title}</h4>
                      <p className="text-business-black/70">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button className="mt-8 bg-future-green text-business-black hover:bg-emerald hover:text-white font-semibold lxera-hover">
                See Smart Delivery in Action
              </Button>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=600&h=400&fit=crop" 
                alt="Smart knowledge delivery visualization"
                className="rounded-2xl lxera-shadow w-full h-96 object-cover"
              />
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-future-green rounded-full animate-float opacity-80"></div>
              <div className="absolute -top-6 -right-6 w-16 h-16 bg-light-green rounded-full animate-float opacity-60" style={{animationDelay: '1s'}}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Built for Innovators Section */}
      <section className="w-full py-20 px-6 lg:px-12 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-business-black mb-8">
            Built for Innovators. Designed for Impact.
          </h2>
          <p className="text-xl text-business-black/80 mb-12 max-w-3xl mx-auto">
            LXERA is made for the teams shaping the future — not maintaining the past.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {[
              { icon: "🚀", text: "Designed for innovation-driven enterprises and startup ecosystems" },
              { icon: "🧠", text: "Built to empower frontline employees, not just top-down trainers" },
              { icon: "🔁", text: "Co-created with early partners solving real transformation challenges" },
              { icon: "🌐", text: "Scalable for Enterprise & Government implementations" }
            ].map((item, index) => (
              <Card key={index} className="bg-smart-beige border-0 lxera-shadow text-center">
                <CardContent className="p-6">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <p className="text-business-black/80">{item.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Button className="bg-future-green text-business-black hover:bg-emerald hover:text-white text-lg px-8 py-4 rounded-full font-semibold lxera-hover">
            Become an Innovation Partner
          </Button>
        </div>
      </section>

      {/* Join the Movement Section */}
      <section className="w-full py-20 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-business-black mb-8">
            Join the Movement
          </h2>
          <p className="text-xl text-business-black/80 mb-12 max-w-4xl mx-auto">
            LXERA is more than software — it's a new foundation for how organizations grow through learning and action.
          </p>
          
          <div className="bg-future-green/20 rounded-2xl p-8 mb-12">
            <h3 className="text-2xl font-bold text-business-black mb-8">As an early partner, you'll:</h3>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: <Wrench className="w-8 h-8" />, title: "Get early access to exclusive features" },
                { icon: <MessageCircle className="w-8 h-8" />, title: "Shape our roadmap through feedback" },
                { icon: <Network className="w-8 h-8" />, title: "Join a private community of innovation leaders" }
              ].map((benefit, index) => (
                <div key={index} className="flex flex-col items-center text-center">
                  <div className="text-business-black mb-4">{benefit.icon}</div>
                  <p className="text-business-black font-semibold">{benefit.title}</p>
                </div>
              ))}
            </div>
          </div>
          
          <Button className="bg-business-black text-white hover:bg-business-black/90 text-lg px-8 py-4 rounded-full font-semibold lxera-hover">
            Join the Early Access Program
          </Button>
        </div>
      </section>

      {/* Why We're Building Section */}
      <section className="w-full py-20 px-6 lg:px-12 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-business-black mb-12">
            Why We're Building LXERA
          </h2>
          
          <div className="space-y-8 mb-12">
            <p className="text-2xl text-business-black/80 font-medium">Most platforms stop at knowledge.</p>
            <p className="text-2xl text-business-black/80 font-medium">Innovation tools ignore how people learn.</p>
            <p className="text-2xl text-future-green font-semibold">LXERA connects both — creating a system where learning leads to doing, and doing leads to growth.</p>
          </div>
          
          <Card className="bg-future-green/20 border-future-green border-2 max-w-3xl mx-auto">
            <CardContent className="p-8">
              <p className="text-xl text-business-black mb-6 italic">
                "We're building LXERA to empower people to think, build, and transform — not just check boxes."
              </p>
              <div className="font-semibold text-business-black">— Shadi Ashi, Co-Founder & CEO</div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Sticky CTA Section */}
      <section id="contact" className="w-full py-20 px-6 lg:px-12 bg-business-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-8">
            Let us show you how LXERA transforms your workforce.
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
            <Button 
              size="lg" 
              className="bg-future-green text-business-black hover:bg-emerald hover:text-white text-lg px-8 py-4 rounded-full font-semibold lxera-hover"
            >
              Book a Demo
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-white text-white hover:bg-white hover:text-business-black text-lg px-8 py-4 rounded-full font-semibold lxera-hover"
            >
              Contact Sales
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-white text-white hover:bg-white hover:text-business-black text-lg px-8 py-4 rounded-full font-semibold lxera-hover"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Brochure
            </Button>
          </div>
          
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <Input
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleInputChange}
                className="border-2 border-gray-200 focus:border-future-green"
                required
              />
              <Input
                name="email"
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                className="border-2 border-gray-200 focus:border-future-green"
                required
              />
              <Input
                name="organization"
                placeholder="Organization"
                value={formData.organization}
                onChange={handleInputChange}
                className="border-2 border-gray-200 focus:border-future-green"
                required
              />
              <Input
                name="role"
                placeholder="Role/Title"
                value={formData.role}
                onChange={handleInputChange}
                className="border-2 border-gray-200 focus:border-future-green"
                required
              />
            </div>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-12 px-6 lg:px-12 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-2xl font-bold text-business-black mb-4">LXERA</div>
              <p className="text-business-black/70">The world's first Learning & Innovation Experience Platform.</p>
            </div>
            <div>
              <h4 className="font-semibold text-business-black mb-4">Platform</h4>
              <ul className="space-y-2 text-business-black/70">
                <li><a href="#" className="hover:text-future-green transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-future-green transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-future-green transition-colors">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-business-black mb-4">Company</h4>
              <ul className="space-y-2 text-business-black/70">
                <li><a href="#" className="hover:text-future-green transition-colors">About</a></li>
                <li><a href="#" className="hover:text-future-green transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-future-green transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-business-black mb-4">Legal</h4>
              <ul className="space-y-2 text-business-black/70">
                <li><a href="#" className="hover:text-future-green transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-future-green transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-future-green transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-business-black/70 mb-4 md:mb-0">
              © 2024 LXERA. All rights reserved.
            </div>
            <div className="flex space-x-4">
              <a href="#" className="text-business-black hover:text-future-green transition-colors">
                <Linkedin className="w-6 h-6" />
              </a>
              <a href="#" className="text-business-black hover:text-future-green transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="#" className="text-business-black hover:text-future-green transition-colors">
                <Youtube className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
