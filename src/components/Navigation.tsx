
import { Button } from "@/components/ui/button";

const Navigation = () => {
  return (
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
  );
};

export default Navigation;
