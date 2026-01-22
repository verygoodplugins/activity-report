import { motion } from 'framer-motion';
import { useScrollProgress } from '../../hooks/useScrollProgress';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import './ScrollProgressBar.css';

export function ScrollProgressBar() {
  const progress = useScrollProgress();
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div 
      className="scroll-progress-bar"
      style={{ 
        scaleX: progress / 100,
        transformOrigin: '0 0'
      }}
      initial={false}
      transition={prefersReducedMotion ? { duration: 0 } : { type: 'tween', duration: 0.2, ease: 'easeOut' }}
    />
  );
}
