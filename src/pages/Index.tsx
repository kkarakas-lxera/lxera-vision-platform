
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, ArrowUp, Linkedin, Youtube, Play, Download, Users, Brain, Wrench, Rocket, Zap, Bot, MessageCircle, Headphones, Video, RefreshCw, Target, Network, CheckCircle, BarChart3, Heart, Lightbulb, Settings } from "lucide-react";
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
      <section className="hero w-full py-20 px-6 lg:px-12">
        <div className="container max-w-7xl mx-auto text-center animate-fade-in">
          <h1 className="headline text-5xl lg:text-7xl font-bold text-business-black mb-8 leading-tight">
            The First<br />
            <span style={{color:'#6FFFE9'}}>Learning & Innovation</span><br />
            Experience Platform (LXIP)
          </h1>

          <p className="subheadline text-xl lg:text-2xl text-business-black/80 mb-12 max-w-5xl mx-auto font-medium">
            Empower your teams to learn faster, build smarter, and innovate from the frontline—<br />
            in one intelligent, adaptive ecosystem.
          </p>

          <div className="cta-buttons flex flex-col sm:flex-row gap-6 justify-center items-center" style={{marginTop: '1.5rem'}}>
            <Button 
              size="lg" 
              className="btn btn-primary bg-future-green text-business-black hover:bg-emerald hover:text-white text-lg px-8 py-4 rounded-full font-semibold lxera-hover"
            >
              Book a Demo
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="btn btn-outline border-2 border-business-black text-business-black hover:bg-business-black hover:text-white text-lg px-8 py-4 rounded-full font-semibold lxera-hover"
            >
              <Play className="w-5 h-5 mr-2" />
              Watch 2-Min Intro
            </Button>
          </div>

          <p className="early-access-note" style={{marginTop:'1.2rem', fontSize:'0.95rem', color:'#666'}}>
            🚀 <strong>Early access now open</strong> for teams shaping the future of adaptive learning.<br />
            Join our innovation wave and help define what LXERA becomes.
          </p>

          <div className="stat-strip" style={{marginTop:'2rem', display:'flex', justifyContent:'center', gap:'2rem', fontWeight:'bold', fontSize:'0.9rem'}}>
            <span>📈 85% Retention Boost</span>
            <span>⚡ 60% Faster Learning</span>
            <span>💬 3× Engagement</span>
            <span>💡 72% Innovation Lift</span>
          </div>
          
          <div className="mt-16 animate-float">
            <ArrowDown className="w-8 h-8 text-business-black/60 mx-auto" />
          </div>
        </div>
      </section>

      {/* Why LXERA Section - Updated */}
      <section id="platform" className="w-full py-20 px-6 lg:px-12 bg-gradient-to-br from-white via-smart-beige/30 to-future-green/10 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-64 h-64 bg-future-green rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-48 h-48 bg-lxera-blue rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-business-black mb-6">
              🌟 Why LXERA
            </h2>
            <p className="text-2xl font-semibold text-business-black mb-6">
              Real Impact. Not Just Theory.
            </p>
            <p className="text-xl text-business-black/80 max-w-4xl mx-auto leading-relaxed">
              LXERA is built to deliver measurable transformation—for individuals, teams, and organizations. Each feature is strategically designed to drive tangible results across five core pillars.
            </p>
          </div>
          
          <div className="space-y-16">
            {/* Pillar 1 - Personalized Learning Journeys */}
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-future-green rounded-2xl flex items-center justify-center mr-6">
                  <Brain className="w-8 h-8 text-business-black" />
                </div>
                <Badge className="bg-future-green/20 text-business-black border-future-green text-lg px-4 py-2">
                  🚀 <span className="font-bold">60% faster</span> completion
                </Badge>
              </div>
              <h3 className="text-3xl font-bold text-business-black mb-4">
                Personalized Learning Journeys
              </h3>
              <p className="text-lg text-future-green font-semibold mb-6">
                Smarter paths. Faster mastery. Deeper learning.
              </p>
              <p className="text-business-black/80 mb-6">
                Our AI adapts to each learner's preferences, behavior, and feedback in real time.
              </p>
              <ul className="space-y-3 text-business-black/80 mb-6">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-future-green mr-3 mt-0.5 flex-shrink-0" />
                  Tailored learning paths that reflect unique cognitive styles
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-future-green mr-3 mt-0.5 flex-shrink-0" />
                  Content personalized through AI diagnostics and adaptive algorithms
                </li>
              </ul>
              <div className="bg-future-green/10 p-4 rounded-lg border-l-4 border-future-green">
                <p className="text-sm text-business-black font-medium">
                  Learners complete content 60% faster and retain up to 85% more using personalized experiences.
                </p>
              </div>
            </div>

            {/* Pillar 2 - Enhanced Engagement */}
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-lxera-red rounded-2xl flex items-center justify-center mr-6">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <Badge className="bg-lxera-red/20 text-business-black border-lxera-red text-lg px-4 py-2">
                  🚀 <span className="font-bold">3x higher</span> engagement
                </Badge>
              </div>
              <h3 className="text-3xl font-bold text-business-black mb-4">
                Enhanced Engagement and Motivation
              </h3>
              <p className="text-lg text-lxera-red font-semibold mb-6">
                Where emotion meets education.
              </p>
              <p className="text-business-black/80 mb-6">
                LXERA uses emotional intelligence and gamification to keep learners connected and inspired.
              </p>
              <ul className="space-y-3 text-business-black/80 mb-6">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-lxera-red mr-3 mt-0.5 flex-shrink-0" />
                  Real-time sentiment tracking for personalized emotional responses
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-lxera-red mr-3 mt-0.5 flex-shrink-0" />
                  Storytelling, avatars, and gamified elements to boost motivation
                </li>
              </ul>
              <div className="bg-lxera-red/10 p-4 rounded-lg border-l-4 border-lxera-red">
                <p className="text-sm text-business-black font-medium">
                  Engagement rates increase by 3x, while dropout rates decrease by 40% in emotionally optimized learning environments.
                </p>
              </div>
            </div>

            {/* Pillar 3 - Data-Driven Decision Making */}
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-lxera-blue rounded-2xl flex items-center justify-center mr-6">
                  <BarChart3 className="w-8 h-8 text-business-black" />
                </div>
                <Badge className="bg-lxera-blue/20 text-business-black border-lxera-blue text-lg px-4 py-2">
                  🚀 <span className="font-bold">50% faster</span> decisions
                </Badge>
              </div>
              <h3 className="text-3xl font-bold text-business-black mb-4">
                Data-Driven Decision-Making
              </h3>
              <p className="text-lg text-lxera-blue font-semibold mb-6">
                Every interaction becomes an insight.
              </p>
              <p className="text-business-black/80 mb-6">
                We transform behavioral data into performance breakthroughs.
              </p>
              <ul className="space-y-3 text-business-black/80 mb-6">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-lxera-blue mr-3 mt-0.5 flex-shrink-0" />
                  Actionable insights for learners, instructors, and managers
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-lxera-blue mr-3 mt-0.5 flex-shrink-0" />
                  Continuous feedback loops from engagement and outcome analytics
                </li>
              </ul>
              <div className="bg-lxera-blue/10 p-4 rounded-lg border-l-4 border-lxera-blue">
                <p className="text-sm text-business-black font-medium">
                  Learning leaders make training decisions 50% faster, with 30% better alignment to performance goals.
                </p>
              </div>
            </div>

            {/* Pillar 4 - Rapid Prototyping */}
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-light-green rounded-2xl flex items-center justify-center mr-6">
                  <Settings className="w-8 h-8 text-business-black" />
                </div>
                <Badge className="bg-light-green/40 text-business-black border-light-green text-lg px-4 py-2 font-bold">
                  🚀 <span className="font-bold">72% more likely</span> to innovate
                </Badge>
              </div>
              <h3 className="text-3xl font-bold text-business-black mb-4">
                Rapid Prototyping & Innovation Enablement
              </h3>
              <p className="text-lg text-business-black font-semibold mb-6">
                Fuel creativity from the ground up.
              </p>
              <p className="text-business-black/80 mb-6">
                LXERA turns employees into innovators through citizen development.
              </p>
              <ul className="space-y-3 text-business-black/80 mb-6">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-light-green mr-3 mt-0.5 flex-shrink-0" />
                  Tools for co-creation, experimentation, and rapid prototyping
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-light-green mr-3 mt-0.5 flex-shrink-0" />
                  Community learning spaces for bottom-up idea generation
                </li>
              </ul>
              <div className="bg-light-green/20 p-4 rounded-lg border-l-4 border-light-green">
                <p className="text-sm text-business-black font-medium">
                  Teams using LXERA are 72% more likely to create innovative solutions within their first 90 days.
                </p>
              </div>
            </div>

            {/* Pillar 5 - Organizational Capability Building */}
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-emerald rounded-2xl flex items-center justify-center mr-6">
                  <Network className="w-8 h-8 text-white" />
                </div>
                <Badge className="bg-emerald/20 text-business-black border-emerald text-lg px-4 py-2">
                  🚀 <span className="font-bold">40% cost reduction</span>
                </Badge>
              </div>
              <h3 className="text-3xl font-bold text-business-black mb-4">
                Organizational Capability Building
              </h3>
              <p className="text-lg text-emerald font-semibold mb-6">
                Upskill at scale, aligned with strategy.
              </p>
              <p className="text-business-black/80 mb-6">
                LXERA serves as your digital learning backbone, tailored to your business transformation.
              </p>
              <ul className="space-y-3 text-business-black/80 mb-6">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-emerald mr-3 mt-0.5 flex-shrink-0" />
                  Centralized platform for strategic upskilling and reskilling
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-emerald mr-3 mt-0.5 flex-shrink-0" />
                  Focus on digital, innovation, and leadership capabilities
                </li>
              </ul>
              <div className="bg-emerald/10 p-4 rounded-lg border-l-4 border-emerald">
                <p className="text-sm text-business-black font-medium">
                  Organizations cut L&D costs by up to 40%, while doubling ROI on training investments.
                </p>
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
