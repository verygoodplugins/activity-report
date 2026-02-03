import { motion, useSpring, useTransform, useInView } from 'framer-motion';
import { useRef, useEffect } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface SpringNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  duration?: number;
  disableAnimation?: boolean;
}

export function SpringNumber({ value, prefix = '', suffix = '', className = '', duration = 1, disableAnimation = false }: SpringNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const prefersReducedMotion = useReducedMotion();
  const shouldDisable = disableAnimation || prefersReducedMotion;
  
  const spring = useSpring(0, { 
    stiffness: 50, 
    damping: 20,
    duration: duration * 1000
  });
  
  const display = useTransform(spring, (latest) => {
    const formatted = Math.floor(latest).toLocaleString();
    return `${prefix}${formatted}${suffix}`;
  });

  useEffect(() => {
    if (isInView) {
      if (shouldDisable) {
        spring.set(value);
      } else {
        spring.set(value);
      }
    }
  }, [isInView, value, spring, shouldDisable]);

  if (shouldDisable) {
    return (
      <span className={className}>
        {`${prefix}${value.toLocaleString()}${suffix}`}
      </span>
    );
  }

  return (
    <motion.span ref={ref} className={className}>
      {display}
    </motion.span>
  );
}
