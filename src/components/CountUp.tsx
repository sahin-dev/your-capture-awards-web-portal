'use client';

import { useEffect, useRef, useState } from 'react';

const formatter = new Intl.NumberFormat('en-US');

type CountUpProps = {
  value?: number;
  /** Animation length in milliseconds. */
  duration?: number;
  className?: string;
};

/**
 * Counts from zero up to `value` once the element is on screen, and re-runs
 * whenever the live figure changes so polled stats stay in sync.
 */
const CountUp = ({ value, duration = 1600, className }: CountUpProps) => {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setStarted(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started || value === undefined) return;

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced) {
      setDisplay(value);
      return;
    }

    let frame = 0;
    const start = performance.now();
    const from = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      // easeOutExpo, matching --ease-out-expo in the stylesheet.
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplay(Math.round(from + (value - from) * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [started, value, duration]);

  return (
    <span ref={ref} className={className}>
      {value === undefined ? '—' : formatter.format(display)}
    </span>
  );
};

export default CountUp;
