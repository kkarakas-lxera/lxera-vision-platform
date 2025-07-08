
const Logo = () => {
  const handleLogoClick = () => {
    // If we're on the homepage, scroll to top
    if (window.location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // If we're on another page, navigate to homepage
      window.location.href = '/';
    }
  };

  return (
    <button
      onClick={handleLogoClick}
      className="flex items-center space-x-3 -ml-4 sm:-ml-8 md:-ml-12 lg:-ml-16 transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-future-green focus:ring-offset-2 rounded-lg"
      aria-label="Go to homepage"
    >
      {/* Logo Icon */}
      <img
        src="/lovable-uploads/ed8138a6-1489-4140-8b44-0003698e8154.png"
        alt="LXERA logo"
        className="h-4 md:h-6 object-contain rounded-none select-none bg-transparent"
        draggable={false}
        style={{ backgroundColor: 'transparent' }}
        width={80}
        height={24}
        loading="eager"
        decoding="sync"
      />
    </button>
  );
};

export default Logo;
