
import { Link } from "react-router-dom";
import { Facebook, Twitter, Linkedin, Youtube, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-business-black text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-future-green rounded-lg flex items-center justify-center">
                <span className="text-business-black font-bold text-lg">L</span>
              </div>
              <span className="text-2xl font-bold">LXERA</span>
            </div>
            <p className="text-white/70 leading-relaxed">
              Transforming workplace learning through AI-powered personalization, 
              innovation enablement, and scalable mentorship solutions.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-future-green hover:text-business-black transition-all duration-300">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-future-green hover:text-business-black transition-all duration-300">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-future-green hover:text-business-black transition-all duration-300">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-future-green hover:text-business-black transition-all duration-300">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Solutions */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Solutions</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/solutions/ai-personalized-learning" className="text-white/70 hover:text-future-green transition-colors duration-300">
                  AI-Personalized Learning
                </Link>
              </li>
              <li>
                <Link to="/solutions/workforce-reskilling-upskilling" className="text-white/70 hover:text-future-green transition-colors duration-300">
                  Workforce Reskilling
                </Link>
              </li>
              <li>
                <Link to="/solutions/citizen-developer-enablement" className="text-white/70 hover:text-future-green transition-colors duration-300">
                  Citizen Developer Enablement
                </Link>
              </li>
              <li>
                <Link to="/solutions/learning-analytics-insights" className="text-white/70 hover:text-future-green transition-colors duration-300">
                  Learning Analytics
                </Link>
              </li>
              <li>
                <Link to="/solutions/scalable-learning-support-mentorship" className="text-white/70 hover:text-future-green transition-colors duration-300">
                  Scalable Learning Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Platform</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/platform/how-it-works" className="text-white/70 hover:text-future-green transition-colors duration-300">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/platform/ai-engine" className="text-white/70 hover:text-future-green transition-colors duration-300">
                  AI Engine
                </Link>
              </li>
              <li>
                <Link to="/platform/engagement-insights" className="text-white/70 hover:text-future-green transition-colors duration-300">
                  Engagement Insights
                </Link>
              </li>
              <li>
                <Link to="/platform/innovation-hub" className="text-white/70 hover:text-future-green transition-colors duration-300">
                  Innovation Hub
                </Link>
              </li>
              <li>
                <Link to="/platform/mentorship-support" className="text-white/70 hover:text-future-green transition-colors duration-300">
                  Mentorship Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Company</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/company/about" className="text-white/70 hover:text-future-green transition-colors duration-300">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/company/careers" className="text-white/70 hover:text-future-green transition-colors duration-300">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/company/contact" className="text-white/70 hover:text-future-green transition-colors duration-300">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/company/blog" className="text-white/70 hover:text-future-green transition-colors duration-300">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/resources" className="text-white/70 hover:text-future-green transition-colors duration-300">
                  Resources
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="border-t border-white/10 mt-12 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-future-green/20 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-future-green" />
              </div>
              <div>
                <p className="text-white/50 text-sm">Email</p>
                <p className="text-white">hello@lxera.com</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-future-green/20 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-future-green" />
              </div>
              <div>
                <p className="text-white/50 text-sm">Phone</p>
                <p className="text-white">+1 (555) 123-4567</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-future-green/20 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-future-green" />
              </div>
              <div>
                <p className="text-white/50 text-sm">Location</p>
                <p className="text-white">San Francisco, CA</p>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/50 text-sm">
            © {currentYear} LXERA. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-white/50 hover:text-future-green text-sm transition-colors duration-300">
              Privacy Policy
            </a>
            <a href="#" className="text-white/50 hover:text-future-green text-sm transition-colors duration-300">
              Terms of Service
            </a>
            <a href="#" className="text-white/50 hover:text-future-green text-sm transition-colors duration-300">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
