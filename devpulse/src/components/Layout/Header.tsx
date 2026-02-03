import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { Jack } from '../Jack';
import './Header.css';

interface HeaderProps {
  generatedAt: string;
}

export function Header({ generatedAt }: HeaderProps) {
  const { toggleTheme, isDark } = useTheme();
  const [isToggling, setIsToggling] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const formattedDate = new Date(generatedAt).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handleToggleClick = () => {
    setIsToggling(true);
    toggleTheme();
    setTimeout(() => setIsToggling(false), 1000);
  };

  return (
    <header className="header">
      <div className="header-left">
        <a href="https://automem.ai" className="back-link">
          <span className="back-arrow">←</span> automem.ai
        </a>
        <a href="https://drunk.support" className="back-link">
          <span className="back-arrow">←</span> drunk.support
        </a>
        <Link to="/setup" className="back-link setup-link">
          Setup Guide <span className="setup-arrow">→</span>
        </Link>
      </div>
      
      <div className="header-center">
        <span className="header-brand">~/devpulse</span>
      </div>
      
      <div className="header-right">
        <span className="header-date">{formattedDate}</span>
        <motion.button 
          className="theme-toggle"
          onClick={handleToggleClick}
          whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
          whileTap={prefersReducedMotion ? {} : { scale: 0.9 }}
          aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
          <div className="theme-toggle-inner">
            <Jack pose={isToggling ? 'lightswitch' : 'wave'} size={32} />
            <span className={`theme-icon ${isToggling ? 'toggling' : ''}`}>{isDark ? '☀' : '☾'}</span>
          </div>
        </motion.button>
      </div>
    </header>
  );
}
