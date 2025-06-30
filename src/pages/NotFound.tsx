import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, Search, Sparkles, Compass } from "lucide-react";
import Navigation from "@/components/Navigation";

const NotFound = () => {
  const location = useLocation();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const suggestions = [
    { path: '/solutions', label: 'Explore Solutions', icon: Compass },
    { path: '/platform/how-it-works', label: 'How It Works', icon: Search },
    { path: '/pricing', label: 'View Pricing', icon: Sparkles }
  ];

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-smart-beige via-white to-smart-beige relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {/* Floating Orbs */}
          <div 
            className="absolute w-96 h-96 bg-future-green/10 rounded-full blur-3xl animate-float"
            style={{
              left: `${mousePosition.x * 0.3}%`,
              top: `${mousePosition.y * 0.3}%`,
              transform: 'translate(-50%, -50%)'
            }}
          />
          <div 
            className="absolute w-64 h-64 bg-lxera-blue/10 rounded-full blur-3xl animate-float"
            style={{
              right: `${100 - mousePosition.x * 0.2}%`,
              bottom: `${100 - mousePosition.y * 0.2}%`,
              animationDelay: '2s',
              transform: 'translate(50%, 50%)'
            }}
          />
          <div className="absolute w-80 h-80 bg-emerald/5 rounded-full blur-3xl animate-float top-1/4 left-1/3" 
               style={{ animationDelay: '4s' }} />
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23191919" fill-opacity="0.03"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-20">
          <div className="text-center max-w-3xl mx-auto animate-fade-in-up">
            {/* 404 Display */}
            <div className="relative mb-8">
              <h1 className="text-[12rem] sm:text-[16rem] font-bold leading-none text-transparent bg-clip-text bg-gradient-to-br from-future-green via-emerald to-lxera-blue animate-gradient">
                404
              </h1>
              <div className="absolute inset-0 text-[12rem] sm:text-[16rem] font-bold leading-none text-business-black/5 blur-3xl">
                404
              </div>
            </div>

            {/* Message */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium text-business-black mb-4 leading-tight">
              Oops! This page got lost in 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-future-green to-emerald"> the cloud</span>
            </h2>
            
            <p className="text-lg sm:text-xl text-business-black/70 mb-12 max-w-2xl mx-auto leading-relaxed">
              The page you're looking for seems to have wandered off on its own learning journey. 
              Let's get you back to familiar territory.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link to="/">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-future-green to-emerald text-business-black hover:opacity-90 transition-all duration-300 hover:scale-105 shadow-xl group"
                >
                  <Home className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                  Back to Home
                </Button>
              </Link>
              
              <Button 
                size="lg"
                variant="outline"
                onClick={() => window.history.back()}
                className="border-2 border-business-black/20 hover:border-future-green hover:bg-future-green/10 transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </div>

            {/* Suggestions */}
            <div className="space-y-4">
              <p className="text-sm text-business-black/60 uppercase tracking-wide">
                Popular destinations
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                {suggestions.map((suggestion) => (
                  <Link 
                    key={suggestion.path} 
                    to={suggestion.path}
                    className="group"
                  >
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-business-black/10 hover:border-future-green hover:bg-future-green/10 transition-all duration-300 hover:scale-105 shadow-sm">
                      <suggestion.icon className="w-4 h-4 text-business-black/60 group-hover:text-future-green transition-colors" />
                      <span className="text-sm text-business-black/80 group-hover:text-business-black transition-colors">
                        {suggestion.label}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute bottom-10 left-10 w-20 h-20 border-2 border-future-green/20 rounded-full animate-pulse" />
          <div className="absolute top-20 right-20 w-16 h-16 border-2 border-lxera-blue/20 rounded-full animate-pulse" 
               style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/3 left-20 w-12 h-12 bg-emerald/10 rounded-full animate-float" 
               style={{ animationDelay: '3s' }} />
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 6s ease infinite;
        }
      `}</style>
    </>
  );
};

export default NotFound;
