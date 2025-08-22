import React, { lazy, Suspense } from 'react';
import { MapPin } from 'lucide-react';
import { Footer as UIFooter } from '@/components/ui/footer';
import { WaitingListHero } from '../../components/marketing/waitlist';

// Lazy load non-critical components for better performance
const WaitingListFeatures = lazy(() => import('../../components/marketing/waitlist/WaitingListFeatures').then(module => ({ default: module.WaitingListFeatures })));
const WaitingListDifferentiators = lazy(() => import('../../components/marketing/waitlist/WaitingListDifferentiators').then(module => ({ default: module.WaitingListDifferentiators })));
const WaitingListProcessFlow = lazy(() => import('../../components/marketing/waitlist/WaitingListProcessFlow').then(module => ({ default: module.WaitingListProcessFlow })));
const WaitingListFAQ = lazy(() => import('../../components/marketing/waitlist/WaitingListFAQ').then(module => ({ default: module.WaitingListFAQ })));

const WaitingList: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with integrated form */}
      <WaitingListHero />
      
      {/* Lazy loaded sections with loading fallbacks */}
      <Suspense fallback={<div className="h-96 flex items-center justify-center"><div className="animate-spin h-8 w-8 border-2 border-[#7AE5C6] border-t-transparent rounded-full"></div></div>}>
        {/* What You Can Do - Features Grid */}
        <WaitingListFeatures />
      </Suspense>
      
      <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="animate-spin h-8 w-8 border-2 border-[#7AE5C6] border-t-transparent rounded-full"></div></div>}>
        {/* What's Next - Process Flow */}
        <WaitingListProcessFlow />
      </Suspense>
      
      <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="animate-spin h-8 w-8 border-2 border-[#7AE5C6] border-t-transparent rounded-full"></div></div>}>
        {/* Why LXERA Is Different */}
        <WaitingListDifferentiators />
      </Suspense>
      
      <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="animate-spin h-8 w-8 border-2 border-[#7AE5C6] border-t-transparent rounded-full"></div></div>}>
        {/* FAQ Section */}
        <WaitingListFAQ />
      </Suspense>

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
