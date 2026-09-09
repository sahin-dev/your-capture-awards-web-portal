'use client';

import { cn } from '@/utils/cn';
import { useEffect, useRef, useState, type CSSProperties, type ElementType } from 'react';

type RevealDirection = 'up' | 'down' | 'left' | 'right' | 'fade' | 'scale' | 'blur';

const directionVars: Record<RevealDirection, CSSProperties> = {
  up: { '--reveal-y': '34px' } as CSSProperties,
  down: { '--reveal-y': '-34px' } as CSSProperties,
  left: { '--reveal-x': '40px', '--reveal-y': '0px' } as CSSProperties,
  right: { '--reveal-x': '-40px', '--reveal-y': '0px' } as CSSProperties,
  fade: { '--reveal-y': '0px' } as CSSProperties,
  scale: { '--reveal-y': '18px', '--reveal-scale': '0.94' } as CSSProperties,
  blur: { '--reveal-y': '18px', '--reveal-blur': '14px' } as CSSProperties,
};

type RevealProps<T extends ElementType> = {
  as?: T;
  /** Direction the element travels in from. */
  direction?: RevealDirection;
  /** Milliseconds to hold before this element animates — used to stagger siblings. */
  delay?: number;
  /** Fraction of the element that must be visible before it plays. */
  threshold?: number;
  /** Replay the animation every time the element re-enters the viewport. */
  once?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: React.ReactNode;
};

/**
 * Reveals its children as they scroll into view.
 *
 * The transition itself lives in globals.css under `[data-reveal]`; this only
 * decides when to flip `data-visible` and which custom properties to hand it.
 * A single IntersectionObserver per instance keeps scroll handlers off the
 * main thread, and `prefers-reduced-motion` is honoured by the stylesheet.
 */
const Reveal = <T extends ElementType = 'div'>({
  as,
  direction = 'up',
  delay = 0,
  threshold = 0.15,
  once = true,
  className,
  style,
  children,
  ...rest
}: RevealProps<T> & Omit<React.ComponentPropsWithoutRef<T>, keyof RevealProps<T>>) => {
  const Comp = (as ?? 'div') as ElementType;
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // No observer support (or a pre-paint bail-out) should never hide content.
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold, rootMargin: '0px 0px -10% 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [once, threshold]);

  return (
    <Comp
      ref={ref}
      data-reveal=""
      data-visible={visible ? 'true' : 'false'}
      className={cn(className)}
      style={
        { ...directionVars[direction], '--reveal-delay': `${delay}ms`, ...style } as CSSProperties
      }
      {...rest}
    >
      {children}
    </Comp>
  );
};

export default Reveal;
