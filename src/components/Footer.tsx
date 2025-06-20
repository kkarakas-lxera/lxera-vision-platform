
import { Linkedin, Youtube, Instagram, Github, Mail, Users, Briefcase, MessageSquare, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const Footer = () => {
  const [email, setEmail] = useState("");
  const currentYear = new Date().getFullYear();

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Newsletter signup:', email);
    setEmail("");
    // Handle newsletter signup
  };

  // Enhanced Company items with icons and descriptions
  const companyItems = [
    {
      name: "About",
      href: "#",
      icon: Users,
      description: "Our mission & story"
    },
    {
      name: "Careers",
      href: "#",
      icon: Briefcase,
      description: "Join our team"
    },
    {
      name: "Contact",
      href: "#",
      icon: MessageSquare,
      description: "Get in touch"
    },
    {
      name: "Blog",
      href: "#",
      icon: BookOpen,
      description: "Latest insights"
    }
  ];

  return (
    <footer className="w-full py-16 px-6 lg:px-12 bg-gradient-to-br from-business-black to-business-black/95">
      <div className="max-w-7xl mx-auto">
        {/* Newsletter Section */}
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 mb-12 border border-white/10">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-3">
              Stay ahead of the innovation curve
            </h3>
            <p className="text-white/70 mb-6 max-w-2xl mx-auto">
              Get insights on learning innovation, employee engagement, and the future of work delivered to your inbox.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/90 border-0 focus:bg-white flex-1 rounded-xl"
                required
              />
              <Button 
                type="submit"
                className="bg-future-green text-business-black hover:bg-future-green/90 hover:scale-105 font-semibold px-8 rounded-xl transition-all duration-300 hover:shadow-lg focus:ring-2 focus:ring-future-green/50 focus:ring-offset-2"
              >
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid md:grid-cols-5 gap-8 mb-12">
          {/* Company Info */}
          <div className="md:col-span-2">
            <div className="text-3xl font-bold text-white mb-4 bg-gradient-to-r from-future-green to-light-green bg-clip-text text-transparent">
              LXERA
            </div>
            <p className="text-white/70 mb-6 leading-relaxed">
              The world's first Learning & Innovation Experience Platform. 
              Empowering organizations to unleash employee potential through 
              AI-driven personalized learning and innovation management.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="text-white/70 hover:text-future-green transition-all duration-300 hover:scale-110"
                aria-label="Follow us on LinkedIn"
              >
                <Linkedin className="w-6 h-6" />
              </a>
              <a 
                href="#" 
                className="text-white/70 hover:text-future-green transition-all duration-300 hover:scale-110"
                aria-label="Follow us on Twitter"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="text-white/70 hover:text-future-green transition-all duration-300 hover:scale-110"
                aria-label="Follow us on YouTube"
              >
                <Youtube className="w-6 h-6" />
              </a>
              <a 
                href="#" 
                className="text-white/70 hover:text-future-green transition-all duration-300 hover:scale-110"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="w-6 h-6" />
              </a>
              <a 
                href="#" 
                className="text-white/70 hover:text-future-green transition-all duration-300 hover:scale-110"
                aria-label="View our GitHub"
              >
                <Github className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-semibold text-white mb-6 text-lg">Platform</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-white/70 hover:text-future-green transition-colors duration-300 relative group">
                  Features
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-future-green transition-all duration-300 group-hover:w-full"></span>
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-future-green transition-colors duration-300 relative group">
                  Pricing
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-future-green transition-all duration-300 group-hover:w-full"></span>
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-future-green transition-colors duration-300 relative group">
                  Security
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-future-green transition-all duration-300 group-hover:w-full"></span>
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-future-green transition-colors duration-300 relative group">
                  Integrations
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-future-green transition-all duration-300 group-hover:w-full"></span>
                </a>
              </li>
            </ul>
          </div>

          {/* Enhanced Company Section */}
          <div>
            <h4 className="font-semibold text-white mb-6 text-lg flex items-center gap-2">
              <div className="w-2 h-2 bg-future-green rounded-full"></div>
              Company
            </h4>
            <div className="space-y-4">
              {companyItems.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <a 
                    key={item.name}
                    href={item.href} 
                    className="group flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-all duration-300 hover:scale-102"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-future-green/20 to-emerald/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-4 h-4 text-future-green" />
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium text-sm group-hover:text-future-green transition-colors duration-300">
                        {item.name}
                      </div>
                      <div className="text-white/60 text-xs mt-1 group-hover:text-white/80 transition-colors duration-300">
                        {item.description}
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Support & Legal */}
          <div>
            <h4 className="font-semibold text-white mb-6 text-lg">Support & Legal</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-white/70 hover:text-future-green transition-colors duration-300 relative group">
                  Help Center
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-future-green transition-all duration-300 group-hover:w-full"></span>
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-future-green transition-colors duration-300 relative group">
                  Privacy Policy
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-future-green transition-all duration-300 group-hover:w-full"></span>
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-future-green transition-colors duration-300 relative group">
                  Terms of Service
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-future-green transition-all duration-300 group-hover:w-full"></span>
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-future-green transition-colors duration-300 relative group">
                  Cookie Policy
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-future-green transition-all duration-300 group-hover:w-full"></span>
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="border-t border-white/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-white/60 text-center md:text-left">
              © {currentYear} LXERA. All rights reserved. Built with ❤️ for the future of learning.
            </div>
            <div className="flex items-center gap-6 text-sm">
              <a href="#" className="text-white/60 hover:text-future-green transition-colors duration-300">
                Status
              </a>
              <a href="#" className="text-white/60 hover:text-future-green transition-colors duration-300">
                API Docs
              </a>
              <a href="mailto:hello@lxera.com" className="text-white/60 hover:text-future-green transition-colors duration-300 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                hello@lxera.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
