
import { Users, Brain, BarChart3, Lightbulb, UserCheck, Cpu, TrendingUp, Rocket } from "lucide-react";

export interface StepData {
  step: string;
  stepTitle: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  subIcon: React.ReactNode;
  metrics?: string;
  cta?: string;
}

export const stepsData: StepData[] = [
  {
    step: "01",
    stepTitle: "Step 1",
    title: "Intelligent Onboarding",
    desc: "Smart user assessment automatically maps your role, skills, and learning preferences. The platform configures **personalized dashboards** and learning paths tailored to your specific needs and organizational goals.",
    icon: <Users className="w-8 h-8" />,
    subIcon: <UserCheck className="w-4 h-4" />,
    metrics: "95% completion rate",
    cta: "Try Assessment"
  },
  {
    step: "02", 
    stepTitle: "Step 2",
    title: "Curated Learning Journey",
    desc: "AI delivers bite-sized, relevant content when you need it most. **Adaptive sequencing** adjusts difficulty and pacing based on your progress, while integrated knowledge bases ensure learning is grounded in your actual work context.",
    icon: <Brain className="w-8 h-8" />,
    subIcon: <Cpu className="w-4 h-4" />,
    metrics: "40% faster learning",
    cta: "View Content"
  },
  {
    step: "03",
    stepTitle: "Step 3",
    title: "Real-Time Feedback Loop", 
    desc: "Continuous progress tracking provides **actionable insights**. Smart nudges and personalized recommendations keep you engaged, while predictive analytics identify skill gaps before they impact performance.",
    icon: <BarChart3 className="w-8 h-8" />,
    subIcon: <TrendingUp className="w-4 h-4" />,
    metrics: "80% engagement boost",
    cta: "See Analytics"
  },
  {
    step: "04",
    stepTitle: "Step 4",
    title: "Innovation Activation",
    desc: "Submit ideas, co-create solutions, and turn insights into **measurable business outcomes**. Collaborative sandboxes and low-code prototyping tools enable your team to transform learning into tangible impact.",
    icon: <Lightbulb className="w-8 h-8" />,
    subIcon: <Rocket className="w-4 h-4" />,
    metrics: "3x innovation rate",
    cta: "Start Creating"
  }
];
