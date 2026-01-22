import { motion } from 'framer-motion';
import { useState } from 'react';
import { Jack } from '../Jack';
import { Particles } from '../Effects';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import type { DayActivity } from '../../types';
import './DayCard.css';

interface DayCardProps {
  day: DayActivity;
  maxActivity: number;
  index: number;
  onClick?: () => void;
}

export function DayCard({ day, maxActivity, index, onClick }: DayCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const totalActivity = day.added + day.deleted;
  const activityPercent = maxActivity > 0 ? (totalActivity / maxActivity) * 100 : 0;
  const addedPercent = totalActivity > 0 ? (day.added / totalActivity) * 100 : 50;
  
  const isHighActivity = activityPercent > 60;
  const hasNoActivity = day.commits.length === 0;

  return (
    <motion.div
      className={`day-card ${day.isToday ? 'today' : ''} ${hasNoActivity ? 'empty' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? { duration: 0 } : { delay: index * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={prefersReducedMotion ? {} : { y: -6, rotateX: 2, rotateY: isHovered ? 2 : -2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {day.isToday && (
        <motion.span 
          className="today-badge"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.5, type: "spring", stiffness: 400 }}
        >
          TODAY
        </motion.span>
      )}
      
      <div className="day-header">
        <span className="day-name">{day.dayName}</span>
        <span className="day-date">{day.month} {day.dayNum}</span>
      </div>
      
      <div className="day-activity-bar">
        <motion.div 
          className="activity-fill added"
          initial={{ width: 0 }}
          animate={{ width: `${addedPercent}%` }}
          transition={prefersReducedMotion ? { duration: 0 } : { delay: index * 0.08 + 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.div 
          className="activity-fill deleted"
          initial={{ width: 0 }}
          animate={{ width: `${100 - addedPercent}%` }}
          transition={prefersReducedMotion ? { duration: 0 } : { delay: index * 0.08 + 0.35, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      
      <motion.div 
        className="activity-height-bar"
        initial={{ height: 0 }}
        animate={{ height: `${activityPercent}%` }}
        transition={prefersReducedMotion ? { duration: 0 } : { delay: index * 0.08 + 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />
      
      <div className="day-stats">
        {hasNoActivity ? (
          <span className="no-activity">No activity</span>
        ) : (
          <>
            <span className="stat added">+{day.added.toLocaleString()}</span>
            <span className="stat deleted">-{day.deleted.toLocaleString()}</span>
          </>
        )}
      </div>
      
      <div className="day-repos-count">
        {day.repos.size > 0 && `${day.repos.size} repo${day.repos.size > 1 ? 's' : ''}`}
      </div>

      {isHovered && isHighActivity && (
        <motion.div 
          className="jack-popup"
          initial={{ scale: 0, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 400 }}
        >
          <Jack pose="thumbsUp" size={50} />
        </motion.div>
      )}
      
      {isHovered && hasNoActivity && (
        <motion.div 
          className="jack-popup"
          initial={{ scale: 0, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 400 }}
        >
          <Jack pose="sleeping" size={50} />
        </motion.div>
      )}

      <Particles isActive={!prefersReducedMotion && isHovered && isHighActivity} color="var(--gold-primary)" />
    </motion.div>
  );
}
