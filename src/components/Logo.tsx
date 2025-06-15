
const Logo = () => {
  return (
    <div className="flex items-center space-x-3">
      {/* Logo Icon */}
      <img
        src="/lovable-uploads/092c853a-e18c-48d4-8c3a-6446a75c47a6.png"
        alt="LXERA logo icon"
        className="w-8 h-8 md:w-10 md:h-10 object-contain rounded-none select-none"
        draggable={false}
      />
      {/* Logo Text */}
      <div className="text-2xl lg:text-3xl font-bold text-business-black hover:text-future-green transition-colors duration-300 cursor-pointer">
        LXERA
      </div>
    </div>
  );
};

export default Logo;

