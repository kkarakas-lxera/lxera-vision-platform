
import { Card, CardContent } from "@/components/ui/card";

const PlatformHighlightsSection = () => {
  const features = [
    { title: "AI-Based Content Generation + SME Review", desc: "Generate hyper-personalized content, enhanced and validated through a subject-matter expert layer.", icon: "🔮" },
    { title: "RAG-Based Personalization Engine", desc: "Our Retrieval-Augmented Generation system adapts content dynamically based on learner behavior and context.", icon: "🔁" },
    { title: "Innovation Hub with CoE Coaching", desc: "Enable internal innovation with structured sprints, mentorship, and prototyping tools.", icon: "🛠" },
    { title: "Dynamic Gamification Engine", desc: "Each learner receives their own personalized game experience — no fixed tracks, no static badges.", icon: "🎮" },
    { title: "Avatar-Based Dynamic Video Learning", desc: "LXERA converts generated content into AI avatar-led videos — personalized, instant, and scalable.", icon: "🧑‍🏫" },
    { title: "Dynamic Audio Narration", desc: "Every module is voice-enabled via advanced AI narration — perfect for flexible and auditory learning.", icon: "🎧" },
    { title: "Org-Specific AI Chatbot", desc: "Each organization receives a dedicated chatbot trained on their data — offering real-time, contextual support to employees.", icon: "🤖" },
    { title: "Social Learning Spaces", desc: "Discussion boards, collaborative areas, and innovation threads keep learners engaged and connected.", icon: "💬" },
    { title: "On-Demand Mentorship", desc: "Live access to experienced mentors — available at key learning and innovation checkpoints.", icon: "👥" }
  ];

  return (
    <section id="features" className="w-full py-20 px-6 lg:px-12 bg-white relative overflow-hidden">
      {/* Enhanced animated background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-16 left-16 w-24 h-24 bg-future-green rounded-full animate-float"></div>
        <div className="absolute top-1/3 right-12 w-32 h-32 bg-light-green rounded-full animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-24 left-1/3 w-20 h-20 bg-emerald rounded-full animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-2/3 right-1/4 w-16 h-16 bg-future-green rounded-full animate-float" style={{animationDelay: '3s'}}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Enhanced header with staggered animations */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl lg:text-5xl font-bold text-business-black mb-8 animate-slide-in-left" style={{animationDelay: '0.2s'}}>
            Platform Highlights
          </h2>
          <p className="text-xl text-business-black/80 max-w-3xl mx-auto animate-slide-in-right" style={{animationDelay: '0.4s'}}>
            The full intelligence stack that powers LXERA's unique value.
          </p>
          
          {/* Animated separator */}
          <div className="mt-8 flex justify-center animate-fade-in-scale" style={{animationDelay: '0.6s'}}>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-future-green to-transparent animate-pulse-slow"></div>
          </div>
        </div>
        
        {/* Enhanced feature grid with staggered animations */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="bg-smart-beige border-0 lxera-shadow lxera-hover group animate-fade-in-up relative overflow-hidden"
              style={{animationDelay: `${0.8 + index * 0.1}s`}}
            >
              <CardContent className="p-8 relative z-10">
                {/* Enhanced icon with hover animations */}
                <div className="text-4xl mb-6 transition-all duration-500 group-hover:scale-125 group-hover:animate-bounce transform group-hover:rotate-12">
                  {feature.icon}
                </div>
                
                {/* Enhanced content with animations */}
                <h3 className="text-xl font-bold text-business-black mb-4 transition-all duration-300 group-hover:text-future-green">
                  {feature.title}
                </h3>
                <p className="text-business-black/70 transition-all duration-300 group-hover:text-business-black/90">
                  {feature.desc}
                </p>
                
                {/* Animated progress indicator */}
                <div className="mt-4 w-full h-0.5 bg-gradient-to-r from-future-green/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="h-full bg-future-green transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left"></div>
                </div>
              </CardContent>
              
              {/* Animated background effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-future-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Floating particles effect */}
              <div className="absolute top-4 right-4 w-2 h-2 bg-future-green/30 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-500"></div>
            </Card>
          ))}
        </div>
        
        {/* Enhanced bottom section with animations */}
        <div className="text-center mt-16 animate-fade-in-up" style={{animationDelay: '2s'}}>
          <div className="bg-gradient-to-r from-future-green/10 to-transparent p-6 rounded-xl hover:from-future-green/20 transition-all duration-500 relative overflow-hidden group">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-2 right-4 w-8 h-8 bg-future-green/40 rounded-full animate-float opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute bottom-2 left-6 w-6 h-6 bg-light-green/50 rounded-full animate-float opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{animationDelay: '1s'}}></div>
            </div>
            <p className="text-lg text-business-black/70 relative z-10 transition-colors duration-300 group-hover:text-business-black/90">
              Experience the complete platform that transforms learning into innovation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlatformHighlightsSection;
