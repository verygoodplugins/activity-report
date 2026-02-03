import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import './Jack.css';

interface JackHeadProps {
  isVisible?: boolean;
  size?: number;
}

export function JackHead({ isVisible = true, size = 100 }: JackHeadProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="jack-head-container"
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={prefersReducedMotion ? { duration: 0.1 } : { type: "spring", stiffness: 200, damping: 20 }}
          style={{ width: size, height: size }}
        >
          <motion.svg 
            viewBox="0 0 100 100" 
            className="jack-head-svg"
            animate={prefersReducedMotion ? {} : { 
              rotate: [0, 3, 0, -3, 0],
              y: [0, -2, 0, -2, 0]
            }}
            transition={prefersReducedMotion ? { duration: 0 } : { 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut",
              repeatDelay: 1
            }}
          >
            <defs>
              <linearGradient id="headGold" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="50%" stopColor="#F9D857" />
                <stop offset="100%" stopColor="#DAA520" />
              </linearGradient>
              <linearGradient id="headSkin" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFE0C2" />
                <stop offset="100%" stopColor="#F5D0A9" />
              </linearGradient>
              <filter id="headGlow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            <ellipse cx="50" cy="92" rx="18" ry="8" fill="url(#headGold)" stroke="#B8922A" strokeWidth="2" />
            
            <circle cx="50" cy="50" r="38" fill="url(#headSkin)" stroke="#E8C49A" strokeWidth="2" />
            
            <g className="jack-head-hair">
              <path d="M15 45 Q22 15 50 10 Q78 15 85 45" fill="#5D4037" stroke="#4E342E" strokeWidth="1.5" />
              <path d="M18 40 Q28 18 50 12" stroke="#5D4037" strokeWidth="5" fill="none" strokeLinecap="round" />
              <path d="M82 40 Q72 18 50 12" stroke="#5D4037" strokeWidth="5" fill="none" strokeLinecap="round" />
              <path d="M42 10 Q48 2 58 8" stroke="#5D4037" strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d="M35 14 Q40 6 50 10" stroke="#5D4037" strokeWidth="3" fill="none" strokeLinecap="round" />
            </g>

            <g className="jack-head-glasses">
              <circle cx="35" cy="50" r="14" fill="none" stroke="#2D2D2D" strokeWidth="3.5" />
              <circle cx="65" cy="50" r="14" fill="none" stroke="#2D2D2D" strokeWidth="3.5" />
              <path d="M49 50 L51 50" stroke="#2D2D2D" strokeWidth="3" />
              <path d="M21 50 L14 47" stroke="#2D2D2D" strokeWidth="3" strokeLinecap="round" />
              <path d="M79 50 L86 47" stroke="#2D2D2D" strokeWidth="3" strokeLinecap="round" />
              <circle cx="35" cy="50" r="11" fill="rgba(255,255,255,0.15)" />
              <circle cx="65" cy="50" r="11" fill="rgba(255,255,255,0.15)" />
            </g>

            <motion.g 
              className="jack-head-eyes"
              animate={prefersReducedMotion ? {} : { scaleY: [1, 0.1, 1] }}
              transition={prefersReducedMotion ? { duration: 0 } : { 
                duration: 0.15, 
                repeat: Infinity, 
                repeatDelay: 4,
                ease: "easeInOut"
              }}
              style={{ transformOrigin: '50px 50px' }}
            >
              <circle cx="35" cy="50" r="4" fill="#2D2D2D" />
              <circle cx="65" cy="50" r="4" fill="#2D2D2D" />
              <circle cx="37" cy="48" r="1.5" fill="white" />
              <circle cx="67" cy="48" r="1.5" fill="white" />
            </motion.g>

            <motion.path 
              d="M38 72 Q50 82 62 72" 
              stroke="#E8A598" 
              strokeWidth="3.5" 
              fill="none" 
              strokeLinecap="round"
              animate={prefersReducedMotion ? {} : { d: ["M38 72 Q50 82 62 72", "M38 72 Q50 84 62 72", "M38 72 Q50 82 62 72"] }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />

            <circle cx="22" cy="60" r="6" fill="#FFB6C1" opacity="0.4" />
            <circle cx="78" cy="60" r="6" fill="#FFB6C1" opacity="0.4" />
          </motion.svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
