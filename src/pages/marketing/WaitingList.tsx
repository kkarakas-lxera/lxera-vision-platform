import React, { memo } from 'react';
import { MapPin, Linkedin } from 'lucide-react';
import { Footer as UIFooter } from '@/components/ui/footer';
import { useDeviceType } from '../../components/marketing/waitlist/shared/useDeviceType';
import { getContentForVariant, WaitlistVariant } from '../../components/marketing/waitlist/shared/contentSelector';

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

interface WaitingListProps {
  variant?: WaitlistVariant;
}

const WaitingList: React.FC<WaitingListProps> = memo(({ variant = 'enterprise' }) => {
  const deviceType = useDeviceType();
  const isMobile = deviceType === 'mobile';
  const content = getContentForVariant(variant);

  return (
    <div className="min-h-screen bg-white">
      {/* All components load immediately without progressive loading */}
      {isMobile ? <WaitingListHeroMobile content={content} variant={variant} /> : <WaitingListHero content={content} variant={variant} />}
      {isMobile ? <WaitingListFeaturesMobile content={content} variant={variant} /> : <WaitingListFeatures content={content} variant={variant} />}
      {isMobile ? <WaitingListProcessFlowMobile content={content} variant={variant} /> : <WaitingListProcessFlow content={content} variant={variant} />}
      {isMobile ? <WaitingListDifferentiatorsMobile content={content} variant={variant} /> : <WaitingListDifferentiators content={content} variant={variant} />}
      {isMobile ? <WaitingListFAQMobile content={content} variant={variant} /> : <WaitingListFAQ content={content} variant={variant} />}

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
