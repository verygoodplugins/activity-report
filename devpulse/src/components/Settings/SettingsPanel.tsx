import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useConfig, useConfigActions } from '../../hooks/useConfig';
import './SettingsPanel.css';

export function SettingsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const config = useConfig();
  const { setTheme, toggleSection, toggleInteractivity, availableThemes, currentTheme } = useConfigActions();

  const themeLabels: Record<string, string> = {
    'terminal-dark': 'Terminal Dark',
    'minimal-light': 'Cream Light',
    'neon-cyberpunk': 'Neon Cyber',
    'corporate-pro': 'Corporate Pro',
    'retro-arcade': 'Retro Arcade'
  };

  return (
    <>
      <button 
        className="settings-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle settings panel"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="settings-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              className="settings-panel"
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="settings-header">
                <h3>Settings</h3>
                <button className="settings-close" onClick={() => setIsOpen(false)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div className="settings-section">
                <h4>Theme</h4>
                <div className="theme-switcher">
                  {availableThemes.map(theme => (
                    <button
                      key={theme}
                      className={`theme-option ${currentTheme === theme ? 'active' : ''}`}
                      onClick={() => setTheme(theme)}
                    >
                      <span className={`theme-preview theme-preview--${theme}`} />
                      <span className="theme-label">{themeLabels[theme] || theme}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="settings-section">
                <h4>Sections</h4>
                <div className="toggle-list">
                  <label className="toggle-item">
                    <span>Hero Stats</span>
                    <input
                      type="checkbox"
                      checked={config.sections.hero.enabled}
                      onChange={() => toggleSection('hero')}
                    />
                    <span className="toggle-switch" />
                  </label>
                  <label className="toggle-item">
                    <span>Weekly Activity</span>
                    <input
                      type="checkbox"
                      checked={config.sections.weekly.enabled}
                      onChange={() => toggleSection('weekly')}
                    />
                    <span className="toggle-switch" />
                  </label>
                  <label className="toggle-item">
                    <span>Repositories</span>
                    <input
                      type="checkbox"
                      checked={config.sections.repos.enabled}
                      onChange={() => toggleSection('repos')}
                    />
                    <span className="toggle-switch" />
                  </label>
                  <label className="toggle-item">
                    <span>Pull Requests</span>
                    <input
                      type="checkbox"
                      checked={config.sections.prs.enabled}
                      onChange={() => toggleSection('prs')}
                    />
                    <span className="toggle-switch" />
                  </label>
                </div>
              </div>

              <div className="settings-section">
                <h4>Features</h4>
                <div className="toggle-list">
                  <label className="toggle-item">
                    <span>Animations</span>
                    <input
                      type="checkbox"
                      checked={config.interactivity.animations}
                      onChange={() => toggleInteractivity('animations')}
                    />
                    <span className="toggle-switch" />
                  </label>
                  <label className="toggle-item">
                    <span>Day Details Modal</span>
                    <input
                      type="checkbox"
                      checked={config.interactivity.dayDetailModal}
                      onChange={() => toggleInteractivity('dayDetailModal')}
                    />
                    <span className="toggle-switch" />
                  </label>
                  <label className="toggle-item">
                    <span>Month View</span>
                    <input
                      type="checkbox"
                      checked={config.interactivity.monthView}
                      onChange={() => toggleInteractivity('monthView')}
                    />
                    <span className="toggle-switch" />
                  </label>
                </div>
              </div>

              <div className="settings-footer">
                <p className="settings-hint">
                  Changes are live! Edit <code>config.json</code> to save permanently.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
