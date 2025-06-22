
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { useState } from "react";
import { Search, BookOpen, Brain, Users, Target, Zap } from "lucide-react";

const Glossary = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const glossaryTerms = [
    {
      term: "AI-Personalized Learning",
      definition: "A learning approach that uses artificial intelligence to adapt content, pace, and methodology to individual learner preferences, skills, and goals.",
      category: "AI & Technology",
      icon: Brain,
      color: "text-pink-600"
    },
    {
      term: "Adaptive Learning Path",
      definition: "A dynamically adjusted sequence of learning activities that changes based on learner progress, performance, and preferences.",
      category: "Learning Design",
      icon: Target,
      color: "text-blue-600"
    },
    {
      term: "Citizen Developer",
      definition: "A business user who creates applications and automation without traditional programming skills, using low-code or no-code platforms.",
      category: "Development",
      icon: Users,
      color: "text-emerald-600"
    },
    {
      term: "Engagement Analytics",
      definition: "Data-driven insights that measure learner interaction, participation, and behavioral patterns within learning platforms.",
      category: "Analytics",
      icon: Zap,
      color: "text-amber-600"
    },
    {
      term: "Gamification",
      definition: "The application of game-design elements and principles in non-game contexts to increase engagement and motivation.",
      category: "Learning Design",
      icon: Target,
      color: "text-purple-600"
    },
    {
      term: "Knowledge Graph",
      definition: "A structured representation of knowledge that shows relationships between concepts, skills, and learning objectives.",
      category: "AI & Technology",
      icon: Brain,
      color: "text-indigo-600"
    },
    {
      term: "LXIP (Learning Experience Innovation Platform)",
      definition: "LXERA's proprietary framework that combines personalized learning, real-time support, and innovation enablement to empower individuals and organizations to grow through continuous, intelligent development.",
      category: "Platforms",
      icon: BookOpen,
      color: "text-teal-600"
    },
    {
      term: "Microlearning",
      definition: "A learning approach that delivers content in small, focused chunks that can be consumed quickly and easily retained.",
      category: "Learning Design",
      icon: Target,
      color: "text-orange-600"
    },
    {
      term: "Reskilling",
      definition: "The process of learning new skills to perform a different job or adapt to changing job requirements within an organization.",
      category: "Workforce Development",
      icon: Users,
      color: "text-rose-600"
    },
    {
      term: "Skills Gap Analysis",
      definition: "The process of identifying the difference between current workforce capabilities and the skills needed to meet business objectives.",
      category: "Analytics",
      icon: Zap,
      color: "text-cyan-600"
    },
    {
      term: "Upskilling",
      definition: "The process of teaching employees new skills or enhancing existing skills to improve their performance in their current role.",
      category: "Workforce Development",
      icon: Users,
      color: "text-green-600"
    },
    {
      term: "Workflow Learning",
      definition: "Learning that happens within the context of work processes, providing just-in-time knowledge and skills when needed.",
      category: "Learning Design",
      icon: Target,
      color: "text-violet-600"
    }
  ];

  const categories = [...new Set(glossaryTerms.map(term => term.category))];

  const filteredTerms = glossaryTerms.filter(term =>
    term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
    term.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
    term.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedTerms = categories.reduce((acc, category) => {
    acc[category] = filteredTerms.filter(term => term.category === category);
    return acc;
  }, {} as Record<string, typeof glossaryTerms>);

  return (
    <>
      <SEO 
        title="Learning Technology Glossary - LXERA"
        description="Comprehensive glossary of learning technology terms, AI concepts, and workplace learning definitions. Stay informed with LXERA's educational resource."
      />
      <div className="min-h-screen bg-smart-beige">
        <Navigation />
        
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="lxera-headline mb-6">
              Learning Technology Glossary
            </h1>
            <p className="lxera-subheadline mb-8">
              Your comprehensive guide to learning technology terms, AI concepts, 
              and workplace learning definitions. Stay informed and speak the language 
              of modern learning.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-md mx-auto mb-8">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-business-black/40 w-5 h-5" />
              <input
                type="text"
                placeholder="Search terms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-future-green focus:border-future-green outline-none bg-white"
              />
            </div>

            <p className="lxera-body text-business-black/60">
              {filteredTerms.length} term{filteredTerms.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </section>

        {/* Glossary Content */}
        <section className="pb-20 px-6">
          <div className="max-w-4xl mx-auto">
            {Object.entries(groupedTerms).map(([category, terms]) => (
              terms.length > 0 && (
                <div key={category} className="mb-12">
                  <h2 className="lxera-section-title text-2xl mb-6 pb-2 border-b border-future-green/30">
                    {category}
                  </h2>
                  <div className="space-y-6">
                    {terms
                      .sort((a, b) => a.term.localeCompare(b.term))
                      .map((item, index) => {
                        const IconComponent = item.icon;
                        return (
                          <div key={index} className="lxera-card p-6">
                            <div className="flex items-start space-x-4">
                              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-smart-beige to-future-green/20 flex items-center justify-center flex-shrink-0">
                                <IconComponent className={`w-6 h-6 ${item.color}`} />
                              </div>
                              <div className="flex-1">
                                <h3 className="lxera-card-title mb-2">
                                  {item.term}
                                </h3>
                                <p className="lxera-card-description leading-relaxed mb-3">
                                  {item.definition}
                                </p>
                                <span className="lxera-caption bg-smart-beige px-2 py-1 rounded-full">
                                  {item.category}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )
            ))}

            {filteredTerms.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-business-black/30 mx-auto mb-4" />
                <h3 className="lxera-card-title mb-2">No terms found</h3>
                <p className="lxera-body text-business-black/60">
                  Try adjusting your search or browse all categories above.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6 bg-gradient-to-r from-future-green/10 to-emerald/10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="lxera-section-title mb-4">
              Can't Find What You're Looking For?
            </h2>
            <p className="lxera-section-subtitle mb-8">
              Our team is here to help you understand any learning technology concept or LXERA feature.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="lxera-btn-secondary px-8 py-4">
                Contact Support
              </button>
              <button className="border border-business-black/30 text-business-black hover:bg-business-black hover:text-white px-8 py-4 rounded-full transition-all duration-300">
                Suggest a Term
              </button>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Glossary;
