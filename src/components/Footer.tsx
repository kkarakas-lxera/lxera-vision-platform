
import { Link } from "react-router-dom";
import { Facebook, Twitter, Linkedin, Youtube, Mail } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-business-black text-white">
      <div className="max-w-6xl mx-auto px-6 lg:px-12 py-20">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Company Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-future-green rounded-lg flex items-center justify-center">
                <span className="text-business-black font-bold text-lg">L</span>
              </div>
              <span className="text-2xl font-bold">LXERA</span>
            </div>
            <p className="text-white/70 text-lg leading-relaxed max-w-md">
              Transforming workplace learning through AI-powered innovation and scalable solutions.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-future-green hover:text-business-black transition-all duration-300">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-future-green hover:text-business-black transition-all duration-300">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-future-green hover:text-business-black transition-all duration-300">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-future-green hover:text-business-black transition-all duration-300">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Solutions */}
          <div>
            <h3 className="text-white font-semibold mb-6 text-sm uppercase tracking-wider">Solutions</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/solutions/ai-personalized-learning" className="text-white/70 hover:text-white transition-colors duration-300 text-sm">
                  AI Learning
                </Link>
              </li>
              <li>
                <Link to="/solutions/workforce-reskilling-upskilling" className="text-white/70 hover:text-white transition-colors duration-300 text-sm">
                  Workforce Reskilling
                </Link>
              </li>
              <li>
                <Link to="/solutions/citizen-developer-enablement" className="text-white/70 hover:text-white transition-colors duration-300 text-sm">
                  Developer Enablement
                </Link>
              </li>
              <li>
                <Link to="/solutions/learning-analytics-insights" className="text-white/70 hover:text-white transition-colors duration-300 text-sm">
                  Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-6 text-sm uppercase tracking-wider">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/company/about" className="text-white/70 hover:text-white transition-colors duration-300 text-sm">
                  About
                </Link>
              </li>
              <li>
                <Link to="/company/careers" className="text-white/70 hover:text-white transition-colors duration-300 text-sm">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/company/contact" className="text-white/70 hover:text-white transition-colors duration-300 text-sm">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/resources" className="text-white/70 hover:text-white transition-colors duration-300 text-sm">
                  Resources
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact */}
        <div className="border-t border-white/10 pt-8 mb-8">
          <div className="flex justify-center">
            <a href="mailto:hello@lxera.com" className="flex items-center space-x-3 hover:text-future-green transition-colors duration-300">
              <Mail className="w-5 h-5 text-future-green" />
              <span className="text-white text-lg">hello@lxera.com</span>
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/50 text-sm">
            © {currentYear} LXERA. All rights reserved.
          </p>
          <div className="flex space-x-8 mt-4 md:mt-0">
            <a href="#" className="text-white/50 hover:text-white text-sm transition-colors duration-300">
              Privacy
            </a>
            <a href="#" className="text-white/50 hover:text-white text-sm transition-colors duration-300">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
