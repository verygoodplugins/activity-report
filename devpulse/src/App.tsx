import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useActivityData } from './hooks/useActivityData';
import { useTheme } from './hooks/useTheme';
import { useReducedMotion } from './hooks/useReducedMotion';
import { HexSidebar, Header, ScrollProgressBar } from './components/Layout';
import { StatCard, DayCard, RepoCard, PRCard } from './components/Cards';
import { JackPeek } from './components/Jack';
import './App.css';

function App() {
  const { stats, weeklyActivity, repoStats, prs, maxDayActivity, generatedAt } = useActivityData();
  const { theme } = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const [activeSection, setActiveSection] = useState('hero');
  const [showJack, setShowJack] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowJack(true), 2000);
    return () => clearTimeout(timer);
  }, []);

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
        
        <section id="hero" className="hero-section">
          <motion.div 
            className="hero-content"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="hero-text">
              <span className="section-label">:: DEV_PULSE</span>
              <h1 className="hero-title">
                The <span className="gold">Grind</span> Report
              </h1>
              <p className="hero-subtitle">
                Weekly developer activity transparency. Building in public.
              </p>
            </div>
            
            <div className="stats-grid">
              <StatCard label="Repos" value={stats.totalRepos} variant="repos" delay={0.1} />
              <StatCard label="Commits" value={stats.totalCommits} variant="commits" delay={0.15} />
              <StatCard label="Added" value={stats.totalAdded} prefix="+" variant="added" delay={0.2} />
              <StatCard label="Deleted" value={stats.totalDeleted} prefix="-" variant="deleted" delay={0.25} />
              {stats.totalPRs > 0 && (
                <StatCard label="PRs" value={stats.totalPRs} variant="prs" delay={0.3} />
              )}
            </div>
          </motion.div>
        </section>

        <section id="weekly" className="section">
          <div className="section-header">
            <span className="section-label">:: WEEKLY_RHYTHM</span>
            <h2 className="section-title">This Week's Activity</h2>
          </div>
          
          <div className="weekly-grid">
            {weeklyActivity.map((day, index) => (
              <DayCard
                key={day.date.toISOString()}
                day={day}
                maxActivity={maxDayActivity}
                index={index}
              />
            ))}
          </div>
        </section>

        <section id="projects" className="section">
          <div className="section-header">
            <span className="section-label">:: REPO_ACTIVITY</span>
            <h2 className="section-title">Projects</h2>
          </div>
          
          <div className="repos-list">
            {repoStats.slice(0, 10).map((repo, index) => (
              <RepoCard
                key={repo.name}
                repo={repo}
                index={index}
                maxCommits={repoStats[0]?.commits || 1}
              />
            ))}
          </div>
        </section>

        {prs.length > 0 && (
          <section id="prs" className="section">
            <div className="section-header">
              <span className="section-label">:: PULL_REQUESTS</span>
              <h2 className="section-title">Recent PRs</h2>
            </div>
            
            <div className="prs-list">
              {prs.slice(0, 10).map((pr, index) => (
                <PRCard key={`${pr.repo}-${pr.number}`} pr={pr} index={index} />
              ))}
            </div>
          </section>
        )}

        <footer className="footer">
          <span className="footer-text">
            Generated with love by <a href="https://automem.ai" className="footer-link">AutoMem</a>
          </span>
          <span className="footer-hex">0xFFFF</span>
        </footer>
      </main>

      <AnimatePresence>
        {showJack && <JackPeek isVisible={showJack} />}
      </AnimatePresence>
    </div>
  );
}

export default App;
