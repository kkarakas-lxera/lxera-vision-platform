
import { Linkedin, Youtube } from "lucide-react";

const Footer = () => {
  return (
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
  );
};

export default Footer;
