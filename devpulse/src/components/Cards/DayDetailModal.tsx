import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import type { DayActivity, Commit } from '../../types';
import './DayDetailModal.css';

interface DayDetailModalProps {
  day: DayActivity | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DayDetailModal({ day, isOpen, onClose }: DayDetailModalProps) {
  const prefersReducedMotion = useReducedMotion();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants = prefersReducedMotion
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 }
      }
    : {
        hidden: { opacity: 0, scale: 0.95, y: 20 },
        visible: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, y: 20 }
      };

  if (!day) return null;

  const repoList = Array.from(day.repos);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-backdrop"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
          onClick={handleBackdropClick}
        >
          <motion.div
            ref={modalRef}
            className="day-detail-modal"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <button className="modal-close" onClick={onClose} aria-label="Close modal">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <div className="modal-header">
              <span className="modal-day-name">{day.dayName}</span>
              <h2 id="modal-title" className="modal-date">{day.month} {day.dayNum}</h2>
              {day.isToday && <span className="modal-today-badge">TODAY</span>}
            </div>

            <div className="modal-stats">
              <div className="modal-stat">
                <span className="modal-stat-value">{day.commits.length}</span>
                <span className="modal-stat-label">Commits</span>
              </div>
              <div className="modal-stat added">
                <span className="modal-stat-value">+{day.added.toLocaleString()}</span>
                <span className="modal-stat-label">Lines Added</span>
              </div>
              <div className="modal-stat deleted">
                <span className="modal-stat-value">-{day.deleted.toLocaleString()}</span>
                <span className="modal-stat-label">Lines Deleted</span>
              </div>
            </div>

            {repoList.length > 0 && (
              <div className="modal-repos">
                <h3 className="modal-section-title">Repositories</h3>
                <div className="modal-repo-tags">
                  {repoList.map((repo) => (
                    <span key={repo} className="modal-repo-tag">{repo}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="modal-commits">
              <h3 className="modal-section-title">Commits</h3>
              {day.commits.length === 0 ? (
                <div className="modal-no-commits">No commits on this day</div>
              ) : (
                <div className="modal-commits-list">
                  {day.commits.map((commit: Commit) => (
                    <motion.div
                      key={commit.hash}
                      className="modal-commit"
                      initial={prefersReducedMotion ? false : { opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2 }}
                    >
                      <div className="commit-header">
                        <span className="commit-headline">{commit.headline}</span>
                        <span className="commit-time">{formatTime(commit.date)}</span>
                      </div>
                      
                      <div className="commit-meta">
                        <a
                          href={commit.remoteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="commit-repo-link"
                        >
                          {commit.repo}
                        </a>
                        <span className="commit-hash">{commit.shortHash}</span>
                      </div>

                      {commit.files.length > 0 && (
                        <div className="commit-files">
                          {commit.files.slice(0, 5).map((file, idx) => (
                            <div key={idx} className="commit-file">
                              <span className="file-name">{file.file}</span>
                              <span className="file-stats">
                                {file.added > 0 && <span className="file-added">+{file.added}</span>}
                                {file.deleted > 0 && <span className="file-deleted">-{file.deleted}</span>}
                              </span>
                            </div>
                          ))}
                          {commit.files.length > 5 && (
                            <div className="commit-files-more">
                              +{commit.files.length - 5} more files
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
