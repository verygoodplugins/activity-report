import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useActivityData } from './hooks/useActivityData';
import { useTheme } from './hooks/useTheme';
import { useReducedMotion } from './hooks/useReducedMotion';
import { useConfig, applyConfigColors } from './hooks/useConfig';
import { HexSidebar, Header, ScrollProgressBar } from './components/Layout';
import { StatCard, DayCard, RepoCard, PRCard, DayDetailModal, MonthView } from './components/Cards';
import type { DayActivity } from './types';
import { JackPeek } from './components/Jack';
import './App.css';

function App() {
  const { commits, stats, weeklyActivity, repoStats, prs, maxDayActivity, generatedAt, periodStart } = useActivityData();
  const { theme } = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const config = useConfig();
  const [activeSection, setActiveSection] = useState('hero');
  const [showJack, setShowJack] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DayActivity | null>(null);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  
  const shouldAnimate = config.interactivity.animations && !prefersReducedMotion;

  useEffect(() => {
    applyConfigColors(config);
  }, [config]);

  useEffect(() => {
    if (shouldAnimate) {
      const timer = setTimeout(() => setShowJack(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [shouldAnimate]);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'weekly', 'projects', 'prs'];
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom > 200) {
            setActiveSection(id);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="app" data-theme={theme}>
      <ScrollProgressBar />
      <HexSidebar activeSection={activeSection} />
      
      <main className="main-content">
        <Header generatedAt={generatedAt} />
        
        {config.sections.hero.enabled && (
          <section id="hero" className="hero-section">
            <motion.div 
              className="hero-content"
              initial={shouldAnimate ? { opacity: 0, y: 30 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={shouldAnimate ? { duration: 0.6, ease: [0.22, 1, 0.36, 1] } : { duration: 0 }}
            >
              <div className="hero-text">
                <span className="section-label">:: DEV_PULSE</span>
                <h1 className="hero-title">
                  {config.sections.hero.title ? (
                    <>
                      {config.sections.hero.title.split(' ').map((word, i) => (
                        i === 1 ? <span key={i} className="gold">{word} </span> : word + ' '
                      ))}
                    </>
                  ) : (
                    <>The <span className="gold">Grind</span> Report</>
                  )}
                </h1>
                <p className="hero-subtitle">
                  {config.sections.hero.subtitle || 'Weekly developer activity transparency. Building in public.'}
                </p>
              </div>
              
              <div className="stats-grid">
                <StatCard label="Repos" value={stats.totalRepos} variant="repos" delay={shouldAnimate ? 0.1 : 0} />
                <StatCard label="Commits" value={stats.totalCommits} variant="commits" delay={shouldAnimate ? 0.15 : 0} />
                <StatCard label="Added" value={stats.totalAdded} prefix="+" variant="added" delay={shouldAnimate ? 0.2 : 0} />
                <StatCard label="Deleted" value={stats.totalDeleted} prefix="-" variant="deleted" delay={shouldAnimate ? 0.25 : 0} />
                {stats.totalPRs > 0 && (
                  <StatCard label="PRs" value={stats.totalPRs} variant="prs" delay={shouldAnimate ? 0.3 : 0} />
                )}
              </div>
            </motion.div>
          </section>
        )}

        {config.sections.weekly.enabled && (
          <section id="weekly" className="section">
            <div className="section-header">
              <div className="section-header-left">
                <span className="section-label">:: WEEKLY_RHYTHM</span>
                <h2 className="section-title">
                  {viewMode === 'week' 
                    ? (config.sections.weekly.title || "This Week's Activity") 
                    : "Monthly Activity"}
                </h2>
              </div>
              {config.interactivity.monthView && (
                <div className="view-toggle">
                  <button 
                    className={`view-toggle-btn ${viewMode === 'week' ? 'active' : ''}`}
                    onClick={() => setViewMode('week')}
                  >
                    Week
                  </button>
                  <button 
                    className={`view-toggle-btn ${viewMode === 'month' ? 'active' : ''}`}
                    onClick={() => setViewMode('month')}
                  >
                    Month
                  </button>
                </div>
              )}
            </div>
            
            <AnimatePresence mode="wait">
              {viewMode === 'week' ? (
                <motion.div 
                  key="week"
                  className="weekly-grid"
                  initial={shouldAnimate ? { opacity: 0, x: -20 } : false}
                  animate={{ opacity: 1, x: 0 }}
                  exit={shouldAnimate ? { opacity: 0, x: 20 } : { opacity: 0 }}
                  transition={shouldAnimate ? { duration: 0.3, ease: [0.22, 1, 0.36, 1] } : { duration: 0 }}
                >
                  {weeklyActivity.map((day, index) => (
                    <DayCard
                      key={day.date.toISOString()}
                      day={day}
                      maxActivity={maxDayActivity}
                      index={index}
                      onClick={config.interactivity.dayDetailModal ? () => setSelectedDay(day) : undefined}
                    />
                  ))}
                </motion.div>
              ) : (
                <MonthView
                  key="month"
                  commits={commits}
                  periodStart={periodStart}
                  onDayClick={config.interactivity.dayDetailModal ? setSelectedDay : undefined}
                />
              )}
            </AnimatePresence>
          </section>
        )}

        {config.sections.repos.enabled && (
          <section id="projects" className="section">
            <div className="section-header">
              <span className="section-label">:: REPO_ACTIVITY</span>
              <h2 className="section-title">{config.sections.repos.title || 'Projects'}</h2>
            </div>
            
            <div className="repos-list">
              {repoStats.slice(0, config.sections.repos.maxItems || 10).map((repo, index) => (
                <RepoCard
                  key={repo.name}
                  repo={repo}
                  index={index}
                  maxCommits={repoStats[0]?.commits || 1}
                />
              ))}
            </div>
          </section>
        )}

        {config.sections.prs.enabled && prs.length > 0 && (
          <section id="prs" className="section">
            <div className="section-header">
              <span className="section-label">:: PULL_REQUESTS</span>
              <h2 className="section-title">{config.sections.prs.title || 'Recent PRs'}</h2>
            </div>
            
            <div className="prs-list">
              {prs.slice(0, config.sections.prs.maxItems || 10).map((pr, index) => (
                <PRCard key={`${pr.repo}-${pr.number}`} pr={pr} index={index} />
              ))}
            </div>
          </section>
        )}

        <footer className="footer">
          <span className="footer-text">
            {config.branding.footer || 'Generated with love by'}{' '}
            <a href="https://automem.ai" className="footer-link">
              {config.branding.attribution || 'AutoMem'}
            </a>
          </span>
          <span className="footer-hex">0xFFFF</span>
        </footer>
      </main>

      <AnimatePresence>
        {shouldAnimate && showJack && <JackPeek isVisible={showJack} />}
      </AnimatePresence>

      {config.interactivity.dayDetailModal && (
        <DayDetailModal
          day={selectedDay}
          isOpen={selectedDay !== null}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </div>
  );
}

export default App;
