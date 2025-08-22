import React, { memo } from 'react';
import { MapPin, Linkedin } from 'lucide-react';
import { Footer as UIFooter } from '@/components/ui/footer';
import { useDeviceType } from '../../components/marketing/waitlist/shared/useDeviceType';

// Desktop components (direct imports for immediate loading)
import {
  WaitingListHero,
  WaitingListFeatures,
  WaitingListDifferentiators,
  WaitingListProcessFlow,
  WaitingListFAQ
} from '../../components/marketing/waitlist/desktop';

// Mobile components (direct imports for immediate loading)
import {
  WaitingListHeroMobile,
  WaitingListFeaturesMobile,
  WaitingListDifferentiatorsMobile,
  WaitingListProcessFlowMobile,
  WaitingListFAQMobile
} from '../../components/marketing/waitlist/mobile';

const WaitingList: React.FC = memo(() => {
  const deviceType = useDeviceType();
  const isMobile = deviceType === 'mobile';

  return (
    <div className="min-h-screen bg-white">
      {/* All components load immediately without progressive loading */}
      {isMobile ? <WaitingListHeroMobile /> : <WaitingListHero />}
      {isMobile ? <WaitingListFeaturesMobile /> : <WaitingListFeatures />}
      {isMobile ? <WaitingListProcessFlowMobile /> : <WaitingListProcessFlow />}
      {isMobile ? <WaitingListDifferentiatorsMobile /> : <WaitingListDifferentiators />}
      {isMobile ? <WaitingListFAQMobile /> : <WaitingListFAQ />}

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
