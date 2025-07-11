export interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  icon?: React.ReactNode;
  ctaText: string;
  ctaAction: 'email' | 'demo';
  billingNote?: string;
  subtitle?: string;
  hasFreeTrial?: boolean;
  showBillingToggle?: boolean;
}

export interface FeatureComparison {
  name: string;
  description?: string;
  core: boolean | string;
  enterprise: boolean | string;
  icon?: React.ReactNode;
}

export interface ComparisonCategory {
  name: string;
  icon?: React.ReactNode;
  features: FeatureComparison[];
}

export interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

export type BillingCycle = 'monthly' | 'annually';

export interface PricingPageProps {
  defaultBillingCycle?: BillingCycle;
  showPersonalization?: boolean;
  trackingSource?: string;
}