

const Logo = () => {
  return (
    <div className="flex items-center space-x-3">
      {/* Logo Icon */}
      <img
        src="/lovable-uploads/5596ea22-3035-4641-9ec6-204cc19cf148.png"
        alt="LXERA logo"
        className="h-8 md:h-10 object-contain rounded-none select-none bg-transparent"
        draggable={false}
        style={{ backgroundColor: 'transparent' }}
      />
    </div>
  );
};

export default Logo;

