import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useReducedMotion } from '../hooks/useReducedMotion';
import './SetupPage.css';

const features = [
  { icon: '📊', title: 'Activity Tracking', description: 'Visualize your commits, PRs, and contributions' },
  { icon: '📅', title: 'Weekly & Monthly Views', description: 'See your coding rhythm across different timeframes' },
  { icon: '🎨', title: 'Customizable', description: 'Configure colors, sections, and branding to match your style' },
  { icon: '🌙', title: 'Dark & Light Themes', description: 'Toggle between themes with smooth transitions' },
  { icon: '⚡', title: 'Static Site', description: 'Fast, serverless deployment to Cloudflare Pages' },
  { icon: '🔄', title: 'Auto Updates', description: 'GitHub Actions refresh your data daily' },
];

const steps = [
  {
    number: '01',
    title: 'Fork the Repository',
    description: 'Fork the Dev Pulse repo to your GitHub account to get started.',
    code: 'github.com/autojack/devpulse → Fork',
  },
  {
    number: '02',
    title: 'Create a GitHub Token',
    description: 'Generate a Personal Access Token with repo read access for fetching your activity data.',
    code: 'Settings → Developer Settings → Personal Access Tokens',
  },
  {
    number: '03',
    title: 'Configure Your Dashboard',
    description: 'Edit config.json with your GitHub username, preferred colors, and section settings.',
    code: 'devpulse/src/data/config.json',
  },
  {
    number: '04',
    title: 'Deploy to Cloudflare Pages',
    description: 'Connect your forked repo to Cloudflare Pages for automatic deployments.',
    code: 'Build command: npm run build | Output: dist',
  },
  {
    number: '05',
    title: 'Set Up Daily Updates',
    description: 'Enable the included GitHub Action to automatically refresh your activity data.',
    code: '.github/workflows/update-data.yml',
  },
];

export function SetupPage() {
  const { theme } = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = !prefersReducedMotion;
  const mockupOpacities = useMemo(
    () => Array.from({ length: 7 }, () => 0.3 + Math.random() * 0.7),
    []
  );

  return (
    <div className="setup-page" data-theme={theme}>
      <header className="setup-header">
        <Link to="/" className="back-link">
          <span className="back-arrow">←</span> View Dashboard
        </Link>
        <span className="header-brand">~/devpulse/setup</span>
        <a href="https://automem.ai" className="external-link">
          automem.ai <span className="external-arrow">→</span>
        </a>
      </header>

      <main className="setup-content">
        <motion.section 
          className="setup-hero"
          initial={shouldAnimate ? { opacity: 0, y: 20 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldAnimate ? { duration: 0.5, ease: [0.22, 1, 0.36, 1] } : { duration: 0 }}
        >
          <span className="section-label">:: SETUP_GUIDE</span>
          <h1 className="setup-title">
            Dev <span className="gold">Pulse</span>
          </h1>
          <p className="setup-subtitle">
            Your personal developer activity dashboard
          </p>
          <p className="setup-attribution">
            made with 💛 by <a href="https://automem.ai" className="attribution-link">autojack</a> for the <span className="gold">$automem</span> community
          </p>
        </motion.section>

        <motion.section 
          className="preview-section"
          initial={shouldAnimate ? { opacity: 0, y: 20 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldAnimate ? { duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] } : { duration: 0 }}
        >
          <div className="preview-container">
            <div className="preview-header">
              <div className="preview-dots">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
              </div>
              <span className="preview-title">devpulse.pages.dev</span>
            </div>
            <div className="preview-content">
              <div className="preview-mockup">
                <div className="mockup-sidebar"></div>
                <div className="mockup-main">
                  <div className="mockup-header"></div>
                  <div className="mockup-stats">
                    <div className="mockup-stat"></div>
                    <div className="mockup-stat"></div>
                    <div className="mockup-stat"></div>
                    <div className="mockup-stat"></div>
                  </div>
                  <div className="mockup-grid">
                    {mockupOpacities.map((opacity, i) => (
                      <div key={i} className="mockup-day" style={{ opacity }}></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section 
          className="features-section"
          initial={shouldAnimate ? { opacity: 0, y: 20 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldAnimate ? { duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] } : { duration: 0 }}
        >
          <span className="section-label">:: FEATURES</span>
          <h2 className="section-title">What You Get</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="feature-card"
                initial={shouldAnimate ? { opacity: 0, y: 20 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={shouldAnimate ? { duration: 0.4, delay: 0.3 + index * 0.05, ease: [0.22, 1, 0.36, 1] } : { duration: 0 }}
              >
                <span className="feature-icon">{feature.icon}</span>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section 
          className="steps-section"
          initial={shouldAnimate ? { opacity: 0, y: 20 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldAnimate ? { duration: 0.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] } : { duration: 0 }}
        >
          <span className="section-label">:: DEPLOYMENT</span>
          <h2 className="section-title">Get Started in 5 Steps</h2>
          <div className="steps-list">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                className="step-card"
                initial={shouldAnimate ? { opacity: 0, x: -20 } : false}
                animate={{ opacity: 1, x: 0 }}
                transition={shouldAnimate ? { duration: 0.4, delay: 0.5 + index * 0.1, ease: [0.22, 1, 0.36, 1] } : { duration: 0 }}
              >
                <div className="step-number">{step.number}</div>
                <div className="step-content">
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-description">{step.description}</p>
                  <code className="step-code">{step.code}</code>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section 
          className="cta-section"
          initial={shouldAnimate ? { opacity: 0, y: 20 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldAnimate ? { duration: 0.5, delay: 0.8, ease: [0.22, 1, 0.36, 1] } : { duration: 0 }}
        >
          <a 
            href="https://github.com/autojack/devpulse" 
            className="cta-button primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="cta-icon">⑂</span>
            Fork on GitHub
          </a>
          <a 
            href="https://dash.cloudflare.com/?to=/:account/pages/new/provider/github" 
            className="cta-button secondary"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="cta-icon">☁</span>
            Deploy to Cloudflare
          </a>
        </motion.section>

        <footer className="setup-footer">
          <div className="footer-links">
            <a href="https://automem.ai" className="footer-link">AutoMem</a>
            <span className="footer-divider">•</span>
            <a href="https://drunk.support" className="footer-link">drunk.support</a>
            <span className="footer-divider">•</span>
            <a href="https://github.com/autojack/devpulse" className="footer-link">GitHub</a>
          </div>
          <span className="footer-hex">0xDEVPULSE</span>
        </footer>
      </main>
    </div>
  );
}
