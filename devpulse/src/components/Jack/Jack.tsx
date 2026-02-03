import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import './Jack.css';

type JackPose = 'wave' | 'thumbsUp' | 'sleeping' | 'celebrate' | 'peek' | 'lightswitch';

interface JackProps {
  pose?: JackPose;
  size?: number;
  className?: string;
  onHover?: () => void;
}

export function Jack({ pose = 'wave', size = 120, className = '', onHover }: JackProps) {
  const [isHovered, setIsHovered] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={`jack-container ${className}`}
      style={{ width: size, height: size }}
      onMouseEnter={() => { setIsHovered(true); onHover?.(); }}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
    >
      <svg viewBox="0 0 100 100" className="jack-svg">
        <defs>
          <linearGradient id="sweaterGold" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFE082" />
            <stop offset="50%" stopColor="#F9D857" />
            <stop offset="100%" stopColor="#D4A425" />
          </linearGradient>
          <linearGradient id="skinTone" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFE0C2" />
            <stop offset="100%" stopColor="#F5D0A9" />
          </linearGradient>
        </defs>

        <ellipse cx="50" cy="80" rx="25" ry="18" fill="url(#sweaterGold)" stroke="#B8922A" strokeWidth="2" />
        <rect x="35" y="62" width="30" height="20" rx="4" fill="url(#sweaterGold)" stroke="#B8922A" strokeWidth="1.5" />
        
        <circle cx="50" cy="40" r="22" fill="url(#skinTone)" stroke="#E8C49A" strokeWidth="1.5" />
        
        <g className="jack-hair">
          <path d="M30 35 Q35 20 50 18 Q65 20 70 35" fill="#5D4037" stroke="#4E342E" strokeWidth="1" />
          <path d="M32 32 Q38 22 50 20" stroke="#5D4037" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M68 32 Q62 22 50 20" stroke="#5D4037" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M45 18 Q48 12 55 15" stroke="#5D4037" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M40 20 Q42 14 48 16" stroke="#5D4037" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>

        <g className="jack-glasses">
          <circle cx="40" cy="40" r="8" fill="none" stroke="#2D2D2D" strokeWidth="2.5" />
          <circle cx="60" cy="40" r="8" fill="none" stroke="#2D2D2D" strokeWidth="2.5" />
          <path d="M48 40 L52 40" stroke="#2D2D2D" strokeWidth="2" />
          <path d="M32 40 L28 38" stroke="#2D2D2D" strokeWidth="2" strokeLinecap="round" />
          <path d="M68 40 L72 38" stroke="#2D2D2D" strokeWidth="2" strokeLinecap="round" />
          <circle cx="40" cy="40" r="6" fill="rgba(255,255,255,0.1)" />
          <circle cx="60" cy="40" r="6" fill="rgba(255,255,255,0.1)" />
        </g>

        <g className="jack-eyes">
          <circle cx="40" cy="40" r="2.5" fill="#2D2D2D" />
          <circle cx="60" cy="40" r="2.5" fill="#2D2D2D" />
          <circle cx="41" cy="39" r="1" fill="white" />
          <circle cx="61" cy="39" r="1" fill="white" />
        </g>

        {pose === 'sleeping' ? (
          <path d="M42 52 L46 50 L50 52 L54 50 L58 52" stroke="#E8A598" strokeWidth="2" fill="none" strokeLinecap="round" />
        ) : (
          <path d="M44 52 Q50 58 56 52" stroke="#E8A598" strokeWidth="2" fill="none" strokeLinecap="round" />
        )}

        <AnimatePresence>
          {(pose === 'wave' || isHovered) && (
            <motion.g
              initial={{ rotate: 0 }}
              animate={prefersReducedMotion ? { rotate: 0 } : { rotate: [0, 20, 0, 20, 0] }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.8, ease: "easeInOut" }}
              style={{ transformOrigin: '25px 70px' }}
            >
              <ellipse cx="22" cy="70" rx="6" ry="8" fill="url(#sweaterGold)" stroke="#B8922A" strokeWidth="1.5" />
              <circle cx="18" cy="62" r="5" fill="url(#skinTone)" stroke="#E8C49A" strokeWidth="1" />
            </motion.g>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {pose === 'thumbsUp' && (
            <motion.g
              initial={{ scale: 0, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0, y: 10 }}
              transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 300 }}
            >
              <ellipse cx="78" cy="65" rx="5" ry="7" fill="url(#sweaterGold)" stroke="#B8922A" strokeWidth="1.5" />
              <circle cx="82" cy="55" r="4" fill="url(#skinTone)" stroke="#E8C49A" strokeWidth="1" />
              <rect x="80" y="48" width="4" height="8" rx="2" fill="url(#skinTone)" stroke="#E8C49A" strokeWidth="1" />
            </motion.g>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {pose === 'sleeping' && !prefersReducedMotion && (
            <>
              <motion.text
                x="70"
                y="25"
                fontSize="12"
                fill="var(--text-secondary)"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: [0, 1, 0], y: [5, -5, -15] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              >
                z
              </motion.text>
              <motion.text
                x="78"
                y="18"
                fontSize="10"
                fill="var(--text-secondary)"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: [0, 1, 0], y: [5, -5, -15] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5, ease: "easeOut" }}
              >
                z
              </motion.text>
              <motion.text
                x="84"
                y="12"
                fontSize="8"
                fill="var(--text-secondary)"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: [0, 1, 0], y: [5, -5, -15] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1, ease: "easeOut" }}
              >
                z
              </motion.text>
            </>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {pose === 'celebrate' && !prefersReducedMotion && (
            <>
              {[...Array(8)].map((_, i) => (
                <motion.circle
                  key={i}
                  cx={50 + Math.cos(i * 0.785) * 35}
                  cy={50 + Math.sin(i * 0.785) * 35}
                  r="3"
                  fill={i % 2 === 0 ? "var(--gold-primary)" : "var(--pink-accent)"}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: [0, 1, 0], 
                    opacity: [0, 1, 0],
                    x: [0, Math.cos(i * 0.785) * 20],
                    y: [0, Math.sin(i * 0.785) * 20 - 10]
                  }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {pose === 'lightswitch' && (
            <>
              <motion.g
                initial={{ rotate: 0, y: 0 }}
                animate={prefersReducedMotion ? { rotate: 0 } : { rotate: [0, 15, 0] }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, ease: "easeInOut", repeat: Infinity, repeatDelay: 1.4 }}
                style={{ transformOrigin: '78px 65px' }}
              >
                <ellipse cx="78" cy="65" rx="5" ry="7" fill="url(#sweaterGold)" stroke="#B8922A" strokeWidth="1.5" />
                <circle cx="82" cy="55" r="4" fill="url(#skinTone)" stroke="#E8C49A" strokeWidth="1" />
                <rect x="80" y="48" width="4" height="8" rx="2" fill="url(#skinTone)" stroke="#E8C49A" strokeWidth="1" />
              </motion.g>
              <rect x="90" y="32" width="12" height="28" rx="2" fill="none" stroke="#B8922A" strokeWidth="1.5" />
              <motion.rect
                x="92"
                y="34"
                width="8"
                height="12"
                rx="1"
                fill="#D4A425"
                initial={{ y: 34 }}
                animate={prefersReducedMotion ? { y: 34 } : { y: [34, 46, 34] }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, ease: "easeInOut", repeat: Infinity, repeatDelay: 1.4 }}
              />
              <motion.circle
                cx="96"
                cy="36"
                r="2"
                fill="var(--gold-primary)"
                initial={{ opacity: 0 }}
                animate={prefersReducedMotion ? { opacity: 0 } : { opacity: [0, 1, 0] }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, ease: "easeInOut", repeat: Infinity, repeatDelay: 1.4 }}
              />
            </>
          )}
        </AnimatePresence>
      </svg>
    </motion.div>
  );
}

export function JackPeek({ isVisible = true }: { isVisible?: boolean }) {
  const prefersReducedMotion = useReducedMotion();
  
  const transition = useMemo(() => {
    if (prefersReducedMotion) {
      return { duration: 0.1, delay: 0 };
    }
    return { type: "spring" as const, stiffness: 200, damping: 20 };
  }, [prefersReducedMotion]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="jack-peek-container"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={transition}
        >
          <Jack pose="wave" size={80} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
