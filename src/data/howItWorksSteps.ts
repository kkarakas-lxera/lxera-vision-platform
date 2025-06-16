

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
    title: "Intelligent Onboarding Process",
    subtitle: "Skip generic setup, LXERA adapts to your role, data, and learning needs from the first click.",
    bullets: [
      "Smart user assessment → custom learning path",
      "Role-based dashboards, adaptive skill matching"
    ],
    iconName: "Users",
    subIconName: "UserCheck",
    metrics: "✔ 95% completion rate",
    cta: "Try Assessment",
    videoThumb: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&q=80&fm=webp",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    videoCaption: "Watch how this works (15 sec demo)"
  },
  {
    step: "02",
    stepTitle: "Step 2",
    title: "Curated Learning Journey",
    subtitle: "Receive smart, adaptive learning flows tailored to your goals, skills, and engagement style.",
    bullets: [
      "AI-curated, context-aware microlearning",
      "Adaptive sequencing for faster mastery"
    ],
    iconName: "Brain",
    subIconName: "Cpu",
    metrics: "✔ 40% faster learning",
    cta: "View Content",
    videoThumb: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80&fm=webp",
    videoUrl: "https://www.w3schools.com/html/movie.mp4",
    videoCaption: "Watch how this works (18 sec demo)"
  },
  {
    step: "03",
    stepTitle: "Step 3",
    title: "Real-Time Feedback System",
    subtitle: "Track your learning behavior, receive nudges, and grow with AI-driven performance data.",
    bullets: [
      "Live analytics & performance nudges",
      "Personalized skill recommendations"
    ],
    iconName: "BarChart3",
    subIconName: "TrendingUp",
    metrics: "✔ 80% engagement boost",
    cta: "See Analytics",
    videoThumb: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80&fm=webp",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    videoCaption: "Watch how this works (12 sec demo)"
  },
  {
    step: "04",
    stepTitle: "Step 4",
    title: "Innovation Activation Engine",
    subtitle: "Turn learning into action using LXERA's sandbox, dashboards, and innovation tools.",
    bullets: [
      "Co-create ideas in real-world sandboxes",
      "Low-code prototyping to fast-track outcomes"
    ],
    iconName: "Lightbulb",
    subIconName: "Rocket",
    metrics: "✔ 3× innovation rate",
    cta: "Start Creating",
    videoThumb: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&q=80&fm=webp",
    videoUrl: "https://www.w3schools.com/html/movie.mp4",
    videoCaption: "Watch how this works (20 sec demo)"
  }
];

