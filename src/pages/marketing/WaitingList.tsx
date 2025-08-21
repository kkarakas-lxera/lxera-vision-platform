import React from 'react';
import { MapPin } from 'lucide-react';
import { Footer as UIFooter } from '@/components/ui/footer';
import {
  WaitingListHero,
  WaitingListFeatures,
  WaitingListDifferentiators,
  WaitingListProcessFlow,
  WaitingListFAQ
} from '../../components/marketing/waitlist';

const WaitingList: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with integrated form */}
      <WaitingListHero />
      
      {/* What You Can Do - Features Grid */}
      <WaitingListFeatures />
      
      {/* What's Next - Process Flow */}
      <WaitingListProcessFlow />
      
      {/* Why LXERA Is Different */}
      <WaitingListDifferentiators />
      
      {/* FAQ Section */}
      <WaitingListFAQ />

      <UIFooter
        className="border-t"
        brand={{
          name: 'LXERA',
          description: 'Beyond Learning — AI-powered learning & innovation platform.',
        }}
        socialLinks={[
          { name: 'LinkedIn', href: 'https://www.linkedin.com/company/lxera' },
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
