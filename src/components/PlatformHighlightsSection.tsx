
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
    <section id="features" className="w-full py-20 px-6 lg:px-12 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl lg:text-5xl font-bold text-business-black text-center mb-8">
          Platform Highlights
        </h2>
        <p className="text-xl text-business-black/80 text-center mb-16 max-w-3xl mx-auto">
          The full intelligence stack that powers LXERA's unique value.
        </p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-smart-beige border-0 lxera-shadow lxera-hover">
              <CardContent className="p-8">
                <div className="text-4xl mb-6">{feature.icon}</div>
                <h3 className="text-xl font-bold text-business-black mb-4">{feature.title}</h3>
                <p className="text-business-black/70">{feature.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlatformHighlightsSection;
