
import { useState } from 'react';
import HeroVideoPlayer from './HeroVideoPlayer';
import ProgressiveDemoCapture from './forms/ProgressiveDemoCapture';

const HeroVideoPreview = () => {
  const [showDemoCapture, setShowDemoCapture] = useState(false);
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
    <>
      <div className="relative w-full">
        <HeroVideoPlayer
          videoUrl={videoUrl}
          posterUrl={posterUrl}
          chapters={chapters}
          autoPlay={false}
          muted={true}
          className="w-full"
          onVideoEnd={() => setShowDemoCapture(true)}
        />
        
      </div>
      
      {showDemoCapture && (
        <div className="fixed bottom-4 right-4 z-50">
          <ProgressiveDemoCapture
            source="video_end_cta"
            buttonText="Get a Demo"
            onSuccess={() => setShowDemoCapture(false)}
          />
        </div>
      )}
    </>
  );
};

export default HeroVideoPreview;
