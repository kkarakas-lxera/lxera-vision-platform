
const Logo = () => {
  return (
    <div className="flex items-center space-x-3 -ml-4 sm:-ml-8 md:-ml-12 lg:-ml-16">
      {/* Logo Icon */}
      <img
        src="/lovable-uploads/ed8138a6-1489-4140-8b44-0003698e8154.png"
        alt="LXERA logo"
        className="h-4 md:h-6 object-contain rounded-none select-none bg-transparent"
        draggable={false}
        style={{ backgroundColor: 'transparent' }}
      />
    </div>
  );
};

export default Logo;
