
import { useState } from 'react';
import HeroVideoPlayer from './HeroVideoPlayer';
import ProgressiveDemoCapture from './forms/ProgressiveDemoCapture';

interface HeroVideoPreviewProps {
  openDemoModal?: (source: string) => void;
}

const HeroVideoPreview = ({ openDemoModal }: HeroVideoPreviewProps) => {
  // Video hosting options:
  // 1. Upload to Cloudflare Stream and use the HLS/DASH URL
  // 2. Upload to AWS S3/CloudFront and use direct URL
  // 3. Upload to Bunny.net and use their streaming URL
  // 4. Upload to Vercel Blob and use the blob URL
  
  // Vercel Blob hosted video
  const videoUrl = "https://finwsjdjo4tof45q.public.blob.vercel-storage.com/Lxera-Demo.mp4";
  const posterUrl = ""; // Optional: Add a poster image if you have one

  return (
    <div className="relative w-full">
      <HeroVideoPlayer
        videoUrl={videoUrl}
        posterUrl={posterUrl}
        autoPlay={false}
        muted={true}
        className="w-full"
      />
    </div>
  );
};

export default HeroVideoPreview;
