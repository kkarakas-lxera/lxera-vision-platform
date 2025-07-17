import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, LinkedinIcon } from 'lucide-react';

interface TestimonialItem {
  id: string;
  name: string;
  title: string;
  company: string;
  content: string;
  savings?: string;
}

interface TestimonialsSectionProps {
  onCTAClick: () => void;
}

const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ onCTAClick }) => {
  const testimonials: TestimonialItem[] = [
    {
      id: '1',
      name: 'Sarah Chen',
      title: 'VP Engineering',
      company: 'TechCorp',
      content: 'We had no idea 73% of our developers were missing React Server Components skills. LXERA\'s AI found gaps that saved us $180K in productivity losses.',
      savings: '$180K'
    },
    {
      id: '2',
      name: 'Mike Johnson',
      title: 'Chief People Officer',
      company: 'ScaleUp Inc',
      content: 'The AI revealed skill gaps in 5 minutes that would have taken our HR team 3 months to identify manually.',
      savings: '$347K'
    },
    {
      id: '3',
      name: 'Lisa Wang',
      title: 'Director of Learning & Development',
      company: 'GrowthCo',
      content: 'Found 12 critical gaps across 200 employees in minutes. This would have been impossible manually.',
      savings: '$89K'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            What Companies Discovered in Their First Week
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-6">
                <p className="text-slate-700 mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{testimonial.name}</p>
                    <p className="text-sm text-slate-600">{testimonial.title}</p>
                    <p className="text-sm text-slate-500">{testimonial.company}</p>
                  </div>
                  <LinkedinIcon className="h-4 w-4 text-blue-600 ml-auto" />
                </div>
                {testimonial.savings && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm font-semibold text-green-800">
                      💰 Saved {testimonial.savings} in first year
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button
            onClick={onCTAClick}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            See What We'll Find in Your Team
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;