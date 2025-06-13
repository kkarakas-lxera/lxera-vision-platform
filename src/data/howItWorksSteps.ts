
export interface StepData {
  step: string;
  stepTitle: string;
  title: string;
  desc: string;
  iconName: string;
  subIconName: string;
  metrics?: string;
  cta?: string;
}

export const stepsData: StepData[] = [
  {
    step: "01",
    stepTitle: "Step 1",
    title: "Intelligent Onboarding",
    desc: "Smart user assessment automatically maps your role, skills, and learning preferences. The platform configures **personalized dashboards** and learning paths tailored to your specific needs and organizational goals.",
    iconName: "Users",
    subIconName: "UserCheck",
    metrics: "95% completion rate",
    cta: "Try Assessment"
  },
  {
    step: "02", 
    stepTitle: "Step 2",
    title: "Curated Learning Journey",
    desc: "AI delivers bite-sized, relevant content when you need it most. **Adaptive sequencing** adjusts difficulty and pacing based on your progress, while integrated knowledge bases ensure learning is grounded in your actual work context.",
    iconName: "Brain",
    subIconName: "Cpu",
    metrics: "40% faster learning",
    cta: "View Content"
  },
  {
    step: "03",
    stepTitle: "Step 3",
    title: "Real-Time Feedback Loop", 
    desc: "Continuous progress tracking provides **actionable insights**. Smart nudges and personalized recommendations keep you engaged, while predictive analytics identify skill gaps before they impact performance.",
    iconName: "BarChart3",
    subIconName: "TrendingUp",
    metrics: "80% engagement boost",
    cta: "See Analytics"
  },
  {
    step: "04",
    stepTitle: "Step 4",
    title: "Innovation Activation",
    desc: "Submit ideas, co-create solutions, and turn insights into **measurable business outcomes**. Collaborative sandboxes and low-code prototyping tools enable your team to transform learning into tangible impact.",
    iconName: "Lightbulb",
    subIconName: "Rocket",
    metrics: "3x innovation rate",
    cta: "Start Creating"
  }
];
