
export interface StepData {
  step: string;
  stepTitle: string;
  title: string;
  subtitle: string;
  bullets: string[];
  iconName: string;
  subIconName: string;
  metrics?: string;
  cta?: string;
  videoThumb: string;
  videoUrl: string;
  videoCaption: string;
}

export const stepsData: StepData[] = [
  {
    step: "01",
    stepTitle: "Step 1",
    title: "Intelligent Onboarding",
    subtitle: "Skip generic setup, get personalized instantly.",
    bullets: [
      "Smart user assessment → custom learning path",
      "Role-based dashboards, adaptive skill matching"
    ],
    iconName: "Users",
    subIconName: "UserCheck",
    metrics: "✓ 95% completion rate",
    cta: "Try Assessment",
    videoThumb: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&q=80&fm=webp",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    videoCaption: "See this in action (15 sec demo)"
  },
  {
    step: "02",
    stepTitle: "Step 2",
    title: "Curated Learning Journey",
    subtitle: "Relevant knowledge, delivered at your pace.",
    bullets: [
      "AI-curated, context-aware microlearning",
      "Adaptive sequencing for faster mastery"
    ],
    iconName: "Brain",
    subIconName: "Cpu",
    metrics: "✓ 40% faster learning",
    cta: "View Content",
    videoThumb: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80&fm=webp",
    videoUrl: "https://www.w3schools.com/html/movie.mp4",
    videoCaption: "See this in action (18 sec demo)"
  },
  {
    step: "03",
    stepTitle: "Step 3",
    title: "Real-Time Feedback Loop",
    subtitle: "Instant progress insights, actionable growth.",
    bullets: [
      "Live analytics & performance nudges",
      "Personalized skill recommendations"
    ],
    iconName: "BarChart3",
    subIconName: "TrendingUp",
    metrics: "✓ 80% engagement boost",
    cta: "See Analytics",
    videoThumb: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80&fm=webp",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    videoCaption: "See this in action (12 sec demo)"
  },
  {
    step: "04",
    stepTitle: "Step 4",
    title: "Innovation Activation",
    subtitle: "Turn learning into business impact.",
    bullets: [
      "Co-create ideas in real-world sandboxes",
      "Low-code prototyping to fast-track outcomes"
    ],
    iconName: "Lightbulb",
    subIconName: "Rocket",
    metrics: "✓ 3x innovation rate",
    cta: "Start Creating",
    videoThumb: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&q=80&fm=webp",
    videoUrl: "https://www.w3schools.com/html/movie.mp4",
    videoCaption: "See this in action (20 sec demo)"
  }
];
