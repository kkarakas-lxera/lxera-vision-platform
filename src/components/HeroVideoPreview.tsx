
import HeroVideoPlayer from './HeroVideoPlayer';

const HeroVideoPreview = () => {
  // Video hosting options:
  // 1. Upload to Cloudflare Stream and use the HLS/DASH URL
  // 2. Upload to AWS S3/CloudFront and use direct URL
  // 3. Upload to Bunny.net and use their streaming URL
  // 4. Upload to Vercel Blob and use the blob URL
  
  // Vercel Blob hosted video
  const videoUrl = "https://finwsjdjo4tof45q.public.blob.vercel-storage.com/Lxera%20Demo%20v2.1-m5UjU6fNWgyk0NuT47B2TPgn5UMRz7.mp4";
  const posterUrl = ""; // Optional: Add a poster image if you have one
  
  // Define video chapters for navigation
  const chapters = [
    { title: "Introduction", time: 0 },
    { title: "Skills Gap Analysis", time: 30 },
    { title: "AI Course Generation", time: 60 },
    { title: "Learning Experience", time: 90 },
    { title: "Analytics Dashboard", time: 120 },
  ];

  return (
    <div className="relative w-full">
      <HeroVideoPlayer
        videoUrl={videoUrl}
        posterUrl={posterUrl}
        chapters={chapters}
        autoPlay={false}
        muted={true}
        className="w-full"
      />
      
      {/* Video Overlay Label - Hidden on mobile to avoid positioning issues */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-4 py-1 bg-white/75 text-business-black/75 text-xs font-semibold rounded-full shadow-sm border border-future-green/30 transition-all group-hover:bg-white group-hover:text-business-black/90 z-20 select-none hidden sm:block">
          Watch how LXERA works
        </span>
      </div>
    </div>
  );
};

export default HeroVideoPreview;
