import React, { lazy, Suspense } from 'react';
import { MapPin, Linkedin } from 'lucide-react';
import { Footer as UIFooter } from '@/components/ui/footer';
import { useDeviceType } from '../../components/marketing/waitlist/shared/useDeviceType';

// Desktop components (lazy loaded)
const WaitingListHero = lazy(() => import('../../components/marketing/waitlist/desktop').then(module => ({ default: module.WaitingListHero })));
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

const WaitingList: React.FC = () => {
  const deviceType = useDeviceType();
  const isMobile = deviceType === 'mobile';
  
  // Loading fallback component
  const LoadingFallback = ({ height = "h-96" }: { height?: string }) => (
    <div className={`${height} flex items-center justify-center`}>
      <div className="animate-spin h-8 w-8 border-2 border-[#7AE5C6] border-t-transparent rounded-full"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Conditional rendering based on device type */}
      <Suspense fallback={<LoadingFallback height="h-screen" />}>
        {/* Hero Section */}
        {isMobile ? <WaitingListHeroMobile /> : <WaitingListHero />}
      </Suspense>
      
      <Suspense fallback={<LoadingFallback />}>
        {/* Features Section */}
        {isMobile ? <WaitingListFeaturesMobile /> : <WaitingListFeatures />}
      </Suspense>
      
      <Suspense fallback={<LoadingFallback height="h-64" />}>
        {/* Process Flow Section */}
        {isMobile ? <WaitingListProcessFlowMobile /> : <WaitingListProcessFlow />}
      </Suspense>
      
      <Suspense fallback={<LoadingFallback height="h-64" />}>
        {/* Differentiators Section */}
        {isMobile ? <WaitingListDifferentiatorsMobile /> : <WaitingListDifferentiators />}
      </Suspense>
      
      <Suspense fallback={<LoadingFallback height="h-64" />}>
        {/* FAQ Section */}
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
};

export default WaitingList;
