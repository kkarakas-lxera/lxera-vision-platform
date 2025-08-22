import React, { lazy, Suspense, memo } from 'react';
import { MapPin, Linkedin } from 'lucide-react';
import { Footer as UIFooter } from '@/components/ui/footer';
import { useDeviceType } from '../../components/marketing/waitlist/shared/useDeviceType';

// Desktop components (lazy loaded with preload hints)
const WaitingListHero = lazy(() => {
  // Preload critical dependencies
  import('simplex-noise');
  return import('../../components/marketing/waitlist/desktop').then(module => ({ default: module.WaitingListHero }));
});
const WaitingListFeatures = lazy(() => import('../../components/marketing/waitlist/desktop').then(module => ({ default: module.WaitingListFeatures })));
const WaitingListDifferentiators = lazy(() => import('../../components/marketing/waitlist/desktop').then(module => ({ default: module.WaitingListDifferentiators })));
const WaitingListProcessFlow = lazy(() => import('../../components/marketing/waitlist/desktop').then(module => ({ default: module.WaitingListProcessFlow })));
const WaitingListFAQ = lazy(() => import('../../components/marketing/waitlist/desktop').then(module => ({ default: module.WaitingListFAQ })));

// Mobile components (lazy loaded)
const WaitingListHeroMobile = lazy(() => import('../../components/marketing/waitlist/mobile').then(module => ({ default: module.WaitingListHeroMobile })));
const WaitingListFeaturesMobile = lazy(() => import('../../components/marketing/waitlist/mobile').then(module => ({ default: module.WaitingListFeaturesMobile })));
const WaitingListDifferentiatorsMobile = lazy(() => import('../../components/marketing/waitlist/mobile').then(module => ({ default: module.WaitingListDifferentiatorsMobile })));
const WaitingListProcessFlowMobile = lazy(() => import('../../components/marketing/waitlist/mobile').then(module => ({ default: module.WaitingListProcessFlowMobile })));
const WaitingListFAQMobile = lazy(() => import('../../components/marketing/waitlist/mobile').then(module => ({ default: module.WaitingListFAQMobile })));

const WaitingList: React.FC = memo(() => {
  const deviceType = useDeviceType();
  const isMobile = deviceType === 'mobile';
  
  // Optimized loading fallback with skeleton
  const LoadingFallback = memo(({ height = "h-96" }: { height?: string }) => (
    <div className={`${height} flex items-center justify-center bg-gray-50 animate-pulse`}>
      <div className="w-full max-w-4xl mx-auto px-4">
        <div className="space-y-4">
          <div className="h-12 bg-gray-200 rounded-md"></div>
          <div className="h-6 bg-gray-200 rounded-md w-3/4"></div>
          <div className="h-6 bg-gray-200 rounded-md w-1/2"></div>
        </div>
      </div>
    </div>
  ));

  return (
    <div className="min-h-screen bg-white">
      {/* Conditional rendering based on device type */}
      {/* Hero loads immediately (critical) */}
      <Suspense fallback={<LoadingFallback height="h-screen" />}>
        {isMobile ? <WaitingListHeroMobile /> : <WaitingListHero />}
      </Suspense>
      
      {/* Features load with intersection observer */}
      <Suspense fallback={<LoadingFallback />}>
        {isMobile ? <WaitingListFeaturesMobile /> : <WaitingListFeatures />}
      </Suspense>
      
      {/* Process Flow deferred */}
      <Suspense fallback={<LoadingFallback height="h-64" />}>
        {isMobile ? <WaitingListProcessFlowMobile /> : <WaitingListProcessFlow />}
      </Suspense>
      
      {/* Differentiators lazy */}
      <Suspense fallback={<LoadingFallback height="h-64" />}>
        {isMobile ? <WaitingListDifferentiatorsMobile /> : <WaitingListDifferentiators />}
      </Suspense>
      
      {/* FAQ lowest priority */}
      <Suspense fallback={<LoadingFallback height="h-64" />}>
        {isMobile ? <WaitingListFAQMobile /> : <WaitingListFAQ />}
      </Suspense>

      <UIFooter
        className="border-t"
        brand={{
          name: 'LXERA',
          description: 'Beyond Learning — AI-powered learning & innovation platform.',
          logo: '/lovable-uploads/ed8138a6-1489-4140-8b44-0003698e8154.png'
        }}
        socialLinks={[
          { name: 'LinkedIn', href: 'https://www.linkedin.com/company/lxera', icon: Linkedin },
        ]}
        columns={[
          {
            title: 'Offices',
            links: [
              {
                name: '🇬🇧 London — 71-75 Shelton Street, Covent Garden, WC2H 9JQ',
                Icon: MapPin,
                href: '#',
              },
              {
                name: '🇶🇦 Doha — 63 Airport Road, 1st Floor, PO Box 55743',
                Icon: MapPin,
                href: '#',
              },
            ],
          },
        ]}
        copyright={`© ${new Date().getFullYear()} LXERA`}
      />
    </div>
  );
});

WaitingList.displayName = 'WaitingList';

export default WaitingList;
