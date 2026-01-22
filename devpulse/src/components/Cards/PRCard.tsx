import { motion } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import type { PullRequest } from '../../types';
import './PRCard.css';

interface PRCardProps {
  pr: PullRequest;
  index: number;
}

export function PRCard({ pr, index }: PRCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const stateIcons: Record<string, string> = {
    open: '○',
    merged: '●',
    closed: '×'
  };

  return (
    <motion.a
      href={pr.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`pr-card pr-${pr.state}`}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={prefersReducedMotion ? { duration: 0 } : { delay: index * 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={prefersReducedMotion ? {} : { x: 4 }}
    >
      <div className={`pr-status pr-status-${pr.state}`}>
        {pr.state === 'merged' ? (
          <motion.svg 
            viewBox="0 0 24 24" 
            className="pr-check"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={prefersReducedMotion ? { duration: 0 } : { delay: index * 0.1 + 0.3, duration: 0.5 }}
          >
            <motion.path 
              d="M5 12l5 5L19 7" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={prefersReducedMotion ? { duration: 0 } : { delay: index * 0.1 + 0.3, duration: 0.5 }}
            />
          </motion.svg>
        ) : (
          <span>{stateIcons[pr.state]}</span>
        )}
      </div>
      
      <div className="pr-content">
        <span className="pr-title">{pr.title}</span>
        <div className="pr-meta">
          <span className="pr-repo">{pr.repo}</span>
          <span className="pr-branch">{pr.headBranch}</span>
          <span className="pr-number">#{pr.number}</span>
        </div>
      </div>
      
      <div className="pr-stats">
        <span className="pr-added">+{(pr.additions ?? 0).toLocaleString()}</span>
        <span className="pr-deleted">-{(pr.deletions ?? 0).toLocaleString()}</span>
        <span className="pr-files">{pr.changedFiles ?? 0} files</span>
      </div>
    </motion.a>
  );
}
