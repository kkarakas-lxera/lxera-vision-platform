
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowDown, ArrowUp, Linkedin, Youtube } from "lucide-react";
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
            LXERA is the first<br />
            <span className="text-future-green">Learning & Innovation</span><br />
            Experience Platform
          </h1>
          <p className="text-xl lg:text-2xl text-business-black/80 mb-12 max-w-4xl mx-auto font-medium">
            Empower employee-led innovation and personalize learning through AI and behavioral science.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-future-green text-business-black hover:bg-emerald hover:text-white text-lg px-8 py-4 rounded-full font-semibold lxera-hover"
            >
              Request a Demo
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-business-black text-business-black hover:bg-business-black hover:text-white text-lg px-8 py-4 rounded-full font-semibold lxera-hover"
            >
              LXERA for Business
            </Button>
          </div>
          <div className="mt-16 animate-float">
            <ArrowDown className="w-8 h-8 text-business-black/60 mx-auto" />
          </div>
        </div>
      </section>

      {/* Why LXERA Section */}
      <section id="platform" className="w-full py-20 px-6 lg:px-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold text-business-black mb-8">
                Why LXERA?
              </h2>
              <p className="text-lg text-business-black/80 mb-8 leading-relaxed">
                Traditional learning platforms force learners to adapt to rigid systems. LXERA flips this paradigm, creating emotionally intelligent experiences that evolve with each individual's behavioral patterns and learning preferences.
              </p>
              <div className="bg-future-green/20 p-8 rounded-2xl border-l-4 border-future-green">
                <blockquote className="text-2xl font-semibold text-business-black italic">
                  "LXERA adapts to learners — not the other way around."
                </blockquote>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop" 
                alt="Woman using laptop for learning"
                className="rounded-2xl lxera-shadow w-full h-96 object-cover"
              />
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-future-green rounded-full animate-float opacity-80"></div>
              <div className="absolute -top-6 -right-6 w-16 h-16 bg-light-green rounded-full animate-float opacity-60" style={{animationDelay: '1s'}}></div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="w-full py-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-bold text-business-black text-center mb-16">
            How It Works
          </h2>
          <div className="grid md:grid-cols-5 gap-8">
            {[
              { step: "01", title: "Behavioral Mapping", desc: "AI analyzes learning patterns and emotional responses" },
              { step: "02", title: "AI Personalization", desc: "Custom pathways created for each individual learner" },
              { step: "03", title: "Emotion Feedback", desc: "Real-time sentiment analysis guides content delivery" },
              { step: "04", title: "Peer + Mentor Circles", desc: "Connect with relevant communities and experts" },
              { step: "05", title: "Outcome Dashboard", desc: "Track progress and measure innovation impact" }
            ].map((item, index) => (
              <Card key={index} className="bg-white border-0 lxera-shadow lxera-hover">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-future-green rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-business-black font-bold text-xl">{item.step}</span>
                  </div>
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
          <h2 className="text-4xl lg:text-5xl font-bold text-business-black text-center mb-16">
            Platform Highlights
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Personalized Journeys", desc: "AI-crafted learning paths that adapt to individual needs and goals", icon: "🎯" },
              { title: "AI Insights", desc: "Deep behavioral analytics reveal learning patterns and optimization opportunities", icon: "🧠" },
              { title: "Community Learning", desc: "Peer-to-peer knowledge sharing in curated expert circles", icon: "👥" },
              { title: "Case Simulations", desc: "Real-world scenario training with immersive problem-solving", icon: "🎮" },
              { title: "Micro-Assessments", desc: "Bite-sized evaluations that provide instant feedback and growth metrics", icon: "📊" },
              { title: "LMS/API Integration", desc: "Seamless connection with existing learning management systems", icon: "🔗" }
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

      {/* Trusted By Section */}
      <section className="w-full py-20 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-business-black mb-12">Trusted by Industry Leaders</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 items-center opacity-60">
            <div className="text-2xl font-bold text-business-black">LinkedIn</div>
            <div className="text-2xl font-bold text-business-black">Samsung</div>
            <div className="text-2xl font-bold text-business-black">Amazon</div>
            <div className="text-2xl font-bold text-business-black">Microsoft</div>
          </div>
          
          <div className="mt-16 grid md:grid-cols-2 gap-8">
            <Card className="bg-future-green/20 border-future-green border-2">
              <CardContent className="p-8">
                <p className="text-lg text-business-black mb-4 italic">
                  "LXERA transformed how our teams approach innovation. The emotional intelligence features are groundbreaking."
                </p>
                <div className="font-semibold text-business-black">— Sarah Chen, Head of L&D at TechCorp</div>
              </CardContent>
            </Card>
            <Card className="bg-future-green/20 border-future-green border-2">
              <CardContent className="p-8">
                <p className="text-lg text-business-black mb-4 italic">
                  "The AI personalization has increased our learning engagement by 300%. Remarkable platform."
                </p>
                <div className="font-semibold text-business-black">— Marcus Rodriguez, Innovation Director</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="w-full py-20 px-6 lg:px-12 bg-business-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-8">
            Join the next era of learning.
          </h2>
          <p className="text-xl text-white/80 mb-12">
            Experience the future of personalized learning and innovation today.
          </p>
          
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 mb-8">
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
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                type="submit"
                size="lg" 
                className="bg-future-green text-business-black hover:bg-emerald hover:text-white text-lg px-8 py-4 rounded-full font-semibold lxera-hover"
              >
                Book a Demo
              </Button>
              <Button 
                type="button"
                size="lg" 
                variant="outline" 
                className="border-2 border-business-black text-business-black hover:bg-business-black hover:text-white text-lg px-8 py-4 rounded-full font-semibold lxera-hover"
              >
                Partner with Us
              </Button>
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
                <li><a href="#" className="hover:text-future-green transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-business-black mb-4">Company</h4>
              <ul className="space-y-2 text-business-black/70">
                <li><a href="#" className="hover:text-future-green transition-colors">About</a></li>
                <li><a href="#" className="hover:text-future-green transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-future-green transition-colors">News</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-business-black mb-4">Legal</h4>
              <ul className="space-y-2 text-business-black/70">
                <li><a href="#" className="hover:text-future-green transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-future-green transition-colors">Terms</a></li>
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
