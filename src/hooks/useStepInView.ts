
import { useEffect, useState } from "react";

/**
 * Returns the index (0-based) of the step that's most in view on mobile.
 * Attach `ref`s with id="step-[idx]" to your step boxes.
 */
export function useStepInView(stepCount: number) {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const stepEls = Array.from({ length: stepCount }, (_, idx) =>
      document.getElementById(`howitworks-step-${idx}`)
    ).filter(Boolean);

    if (stepEls.length === 0) return;

    let ticking = false;

    const calcInView = () => {
      const scrollY = window.scrollY;
      let bestIdx = 0;
      let minDiff = Infinity;
      stepEls.forEach((el, idx) => {
        const rect = el.getBoundingClientRect();
        const boxMidY = rect.top + rect.height / 2;
        // Distance from viewport top (avoid picking when off screen)
        const diff = Math.abs(boxMidY - 110); // 110px below top to account for sticky bar
        if (boxMidY > 0 && diff < minDiff) {
          minDiff = diff;
          bestIdx = idx;
        }
      });
      setCurrentIdx(bestIdx);
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(() => {
          calcInView();
          ticking = false;
        });
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // initialize

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [stepCount]);

  return currentIdx;
}
