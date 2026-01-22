import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface ParticleProps {
  isActive: boolean;
  color?: string;
  count?: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
}

export function Particles({ isActive, color = 'var(--gold-primary)', count = 12 }: ParticleProps) {
  const prefersReducedMotion = useReducedMotion();
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (isActive && !prefersReducedMotion) {
      const newParticles = Array.from({ length: count }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100 - 50,
        y: Math.random() * -60 - 20,
        size: Math.random() * 4 + 2,
        delay: Math.random() * 0.3
      }));
      setParticles(newParticles);
    } else {
      setParticles([]);
    }
  }, [isActive, count, prefersReducedMotion]);

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{ 
              opacity: 1, 
              scale: 0,
              x: '50%',
              y: '50%'
            }}
            animate={{ 
              opacity: 0, 
              scale: 1,
              x: `calc(50% + ${particle.x}px)`,
              y: `calc(50% + ${particle.y}px)`
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 0.8, 
              delay: particle.delay,
              ease: [0.22, 1, 0.36, 1]
            }}
            style={{
              position: 'absolute',
              width: particle.size,
              height: particle.size,
              borderRadius: '50%',
              background: color
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
