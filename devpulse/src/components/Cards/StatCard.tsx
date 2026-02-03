import { motion } from 'framer-motion';
import { SpringNumber } from '../Effects';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import './StatCard.css';

interface StatCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  variant?: 'default' | 'added' | 'deleted' | 'repos' | 'commits' | 'prs';
  delay?: number;
}

export function StatCard({ label, value, prefix = '', suffix = '', variant = 'default', delay = 0 }: StatCardProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div 
      className={`stat-card stat-${variant}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? { duration: 0 } : { delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={prefersReducedMotion ? {} : { y: -4, boxShadow: 'var(--shadow-lg)' }}
    >
      <div className="stat-value">
        <SpringNumber value={value} prefix={prefix} suffix={suffix} disableAnimation={prefersReducedMotion} />
      </div>
      <div className="stat-label">{label}</div>
    </motion.div>
  );
}
