import { motion } from 'framer-motion';
import { SpringNumber } from '../Effects';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import type { RepoStats } from '../../types';
import './RepoCard.css';

interface RepoCardProps {
  repo: RepoStats;
  index: number;
  maxCommits: number;
}

export function RepoCard({ repo, index, maxCommits }: RepoCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const activityPercent = maxCommits > 0 ? (repo.commits / maxCommits) * 100 : 0;

  return (
    <motion.a
      href={repo.url}
      target="_blank"
      rel="noopener noreferrer"
      className="repo-card"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={prefersReducedMotion ? { duration: 0 } : { delay: index * 0.05, duration: 0.3 }}
      whileHover={prefersReducedMotion ? {} : { x: 4, rotateY: 2 }}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div className="repo-dot" style={{ 
        background: `hsl(${(index * 47) % 360}, 60%, 60%)` 
      }} />
      
      <div className="repo-info">
        <motion.span 
          className="repo-name"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={prefersReducedMotion ? { duration: 0 } : { delay: index * 0.05 + 0.2 }}
        >
          {repo.name}
        </motion.span>
        <span className="repo-owner">{repo.owner}</span>
      </div>
      
      <div className="repo-activity-bar">
        <motion.div 
          className="repo-activity-fill"
          initial={{ width: 0 }}
          animate={{ width: `${activityPercent}%` }}
          transition={prefersReducedMotion ? { duration: 0 } : { delay: index * 0.05 + 0.3, duration: 0.6 }}
        />
      </div>
      
      <div className="repo-stats">
        <span className="repo-commits">
          <SpringNumber value={repo.commits} disableAnimation={prefersReducedMotion} /> commits
        </span>
        <span className="repo-added">+{repo.added.toLocaleString()}</span>
        <span className="repo-deleted">-{repo.deleted.toLocaleString()}</span>
      </div>
    </motion.a>
  );
}
