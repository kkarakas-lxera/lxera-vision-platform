
import { useEffect, useRef, useState } from "react";

interface AnimatedStatProps {
  value: string; // E.g., "60% faster", "+250% engagement", "3x boost"
  duration?: number; // ms, default 1500
  className?: string;
}

function parseNumber(stat: string): { prefix: string; number: number; suffix: string } {
  // Finds the first number (int or float), and splits prefix/suffix
  const match = stat.match(/([+-]?[\d.,]+)(.*)/);
  if (!match) {
    return { prefix: "", number: 0, suffix: stat };
  }
  const [_, numStr, after] = match;
  const prefixMatch = stat.match(/^([^0-9+\-.]*)/);
  return {
    prefix: prefixMatch ? prefixMatch[0] : "",
    number: parseFloat(numStr.replace(/,/g, "")),
    suffix: after
  };
}

const AnimatedStat = ({ value, duration = 1500, className }: AnimatedStatProps) => {
  const [current, setCurrent] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const statRef = useRef<HTMLSpanElement | null>(null);

  const { prefix, number, suffix } = parseNumber(value);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let observer: IntersectionObserver | undefined;
    const node = statRef.current;

    if (!node) return;

    const startAnimation = () => {
      if (hasAnimated) return;
      setHasAnimated(true);
      const start = 0;
      const end = number;
      const steps = 40;
      let currentStep = 0;

      const increment = () => {
        currentStep++;
        const progress = Math.min(currentStep / steps, 1);
        const nextValue = Math.floor(progress * (end - start) + start);
        setCurrent(nextValue);
        if (currentStep < steps) {
          timeout = setTimeout(increment, duration / steps);
        } else {
          setCurrent(end);
        }
      };
      increment();
    };

    observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          startAnimation();
          observer && observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(node);

    return () => {
      if (timeout) clearTimeout(timeout);
      observer && observer.disconnect();
    };
    // eslint-disable-next-line
  }, [statRef, number, duration, hasAnimated]);

  return (
    <span ref={statRef} className={className}>
      {prefix}
      <span className="text-future-green font-bold">
        {statRef.current && hasAnimated ? current : 0}
      </span>
      {suffix}
    </span>
  );
};

export default AnimatedStat;
