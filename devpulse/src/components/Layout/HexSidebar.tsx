import { motion } from 'framer-motion';
import { useScrollProgress } from '../../hooks/useScrollProgress';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import './HexSidebar.css';

const sections = [
  { id: 'hero', address: '0x0000', label: 'INIT' },
  { id: 'weekly', address: '0x0010', label: 'WEEKLY' },
  { id: 'projects', address: '0x0020', label: 'REPOS' },
  { id: 'prs', address: '0x0030', label: 'PRS' },
  { id: 'timeline', address: '0x0040', label: 'LOG' }
];

interface HexSidebarProps {
  activeSection?: string;
}

export function HexSidebar({ activeSection = 'hero' }: HexSidebarProps) {
  const progress = useScrollProgress();
  const prefersReducedMotion = useReducedMotion();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    }
  };

  return (
    <aside className="hex-sidebar">
      <div className="hex-progress-track">
        <motion.div 
          className="hex-progress-fill"
          style={{ height: `${progress}%` }}
        />
      </div>
      
      <nav className="hex-nav">
        {sections.map((section, index) => (
          <motion.button
            key={section.id}
            className={`hex-nav-item ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => scrollToSection(section.id)}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { delay: index * 0.1, duration: 0.3 }}
            whileHover={prefersReducedMotion ? {} : { x: 4 }}
          >
            <span className="hex-address">{section.address}</span>
            <span className="hex-label">{section.label}</span>
          </motion.button>
        ))}
      </nav>
    </aside>
  );
}
