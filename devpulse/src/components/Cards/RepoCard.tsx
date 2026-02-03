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

const languageColors: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f7df1e',
  Python: '#3572A5',
  PHP: '#4F5D95',
  Ruby: '#CC342D',
  Go: '#00ADD8',
  Rust: '#dea584',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
};

export function RepoCard({ repo, index, maxCommits }: RepoCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const activityPercent = maxCommits > 0 ? (repo.commits / maxCommits) * 100 : 0;
  const languageColor = repo.language ? languageColors[repo.language] || '#888' : null;

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
      <div className="repo-card-header">
        <div className="repo-dot" style={{ 
          background: `hsl(${(index * 47) % 360}, 60%, 60%)` 
        }} />
        
        <div className="repo-info">
          <div className="repo-name-row">
            <motion.span 
              className="repo-name"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={prefersReducedMotion ? { duration: 0 } : { delay: index * 0.05 + 0.2 }}
            >
              {repo.name}
            </motion.span>
            {repo.stars !== undefined && (
              <span className="repo-stars">
                <svg className="star-icon" viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
                  <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
                </svg>
                {repo.stars.toLocaleString()}
              </span>
            )}
          </div>
          <span className="repo-owner">{repo.owner}</span>
        </div>
      </div>

      {repo.description && (
        <div className="repo-description">
          <p>{repo.description}</p>
        </div>
      )}

      <div className="repo-meta">
        {repo.language && languageColor && (
          <span className="repo-language">
            <span className="language-dot" style={{ background: languageColor }} />
            {repo.language}
          </span>
        )}
        
        {repo.topics && repo.topics.length > 0 && (
          <div className="repo-topics">
            {repo.topics.slice(0, 4).map((topic) => (
              <span key={topic} className="topic-pill">{topic}</span>
            ))}
          </div>
        )}
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
