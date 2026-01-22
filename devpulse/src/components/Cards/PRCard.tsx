import { motion } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import type { PullRequest } from '../../types';
import './PRCard.css';

interface PRCardProps {
  pr: PullRequest;
  index: number;
}

const reviewStatusConfig: Record<string, { icon: string; label: string }> = {
  approved: { icon: '✓', label: 'Approved' },
  changes_requested: { icon: '✗', label: 'Changes Requested' },
  pending: { icon: '◔', label: 'Pending Review' },
  review_required: { icon: '◔', label: 'Review Required' }
};

const ciStatusConfig: Record<string, { color: string; label: string }> = {
  success: { color: 'var(--green)', label: 'CI Passed' },
  failure: { color: 'var(--red)', label: 'CI Failed' },
  pending: { color: 'var(--gold-primary)', label: 'CI Running' },
  none: { color: 'var(--text-muted)', label: 'No CI' }
};

const labelColors = [
  'var(--purple)',
  'var(--cyan)',
  'var(--pink-accent)',
  'var(--green)',
  'var(--gold-primary)'
];

function getLabelColor(label: string): string {
  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = label.charCodeAt(i) + ((hash << 5) - hash);
  }
  return labelColors[Math.abs(hash) % labelColors.length];
}

function truncateDescription(body: string | undefined, maxLength: number = 150): string {
  if (!body) return '';
  const cleaned = body.replace(/\r?\n/g, ' ').trim();
  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.slice(0, maxLength);
}

export function PRCard({ pr, index }: PRCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const stateIcons: Record<string, string> = {
    open: '○',
    merged: '●',
    closed: '×'
  };

  const description = truncateDescription(pr.body);
  const reviewConfig = pr.reviewStatus ? reviewStatusConfig[pr.reviewStatus] : null;
  const ciConfig = pr.ciStatus ? ciStatusConfig[pr.ciStatus] : null;

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
        
        {description && (
          <div className="pr-description">
            <span className="pr-description-text">{description}</span>
            {pr.body && pr.body.length > 150 && <span className="pr-description-fade" />}
          </div>
        )}
        
        <div className="pr-meta">
          <span className="pr-repo">{pr.repo}</span>
          <span className="pr-branch">{pr.headBranch}</span>
          <span className="pr-number">#{pr.number}</span>
        </div>

        <div className="pr-badges">
          {reviewConfig && (
            <span className={`pr-review-badge pr-review-${pr.reviewStatus}`} title={reviewConfig.label}>
              <span className="pr-review-icon">{reviewConfig.icon}</span>
              <span className="pr-review-label">{reviewConfig.label}</span>
            </span>
          )}
          
          {ciConfig && pr.ciStatus !== 'none' && (
            <span className={`pr-ci-badge pr-ci-${pr.ciStatus}`} title={ciConfig.label}>
              <span className="pr-ci-dot" style={{ backgroundColor: ciConfig.color }} />
              <span className="pr-ci-label">CI</span>
            </span>
          )}
          
          {typeof pr.commentsCount === 'number' && pr.commentsCount > 0 && (
            <span className="pr-comments" title={`${pr.commentsCount} comments`}>
              <svg className="pr-comments-icon" viewBox="0 0 16 16" fill="currentColor">
                <path d="M2.5 3.25c0-.966.784-1.75 1.75-1.75h7.5c.966 0 1.75.784 1.75 1.75v5.5a1.75 1.75 0 01-1.75 1.75H9.5L6 13.25V10.5H4.25A1.75 1.75 0 012.5 8.75v-5.5z"/>
              </svg>
              <span>{pr.commentsCount}</span>
            </span>
          )}
          
          {pr.labels && pr.labels.length > 0 && (
            <div className="pr-labels">
              {pr.labels.slice(0, 3).map((label) => (
                <span 
                  key={label} 
                  className="pr-label-pill"
                  style={{ backgroundColor: getLabelColor(label) }}
                >
                  {label}
                </span>
              ))}
              {pr.labels.length > 3 && (
                <span className="pr-label-more">+{pr.labels.length - 3}</span>
              )}
            </div>
          )}
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
