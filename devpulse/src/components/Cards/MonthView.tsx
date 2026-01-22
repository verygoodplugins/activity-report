import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import type { DayActivity, Commit } from '../../types';
import './MonthView.css';

interface MonthViewProps {
  commits: Commit[];
  periodStart: string;
  onDayClick: (day: DayActivity) => void;
}

interface CalendarDay {
  date: Date;
  dayNum: number;
  dayName: string;
  month: string;
  isInPeriod: boolean;
  isToday: boolean;
  commits: Commit[];
  added: number;
  deleted: number;
  repos: Set<string>;
  activityLevel: number;
}

export function MonthView({ commits, periodStart, onDayClick }: MonthViewProps) {
  const prefersReducedMotion = useReducedMotion();

  const calendarData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const periodStartDate = new Date(periodStart);
    periodStartDate.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    const startDayOfWeek = firstDayOfMonth.getDay();
    const calendarStart = new Date(firstDayOfMonth);
    calendarStart.setDate(calendarStart.getDate() - startDayOfWeek);

    const endDayOfWeek = lastDayOfMonth.getDay();
    const calendarEnd = new Date(lastDayOfMonth);
    calendarEnd.setDate(calendarEnd.getDate() + (6 - endDayOfWeek));

    const days: CalendarDay[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    let maxActivity = 0;
    const tempDays: { date: Date; commits: Commit[]; added: number; deleted: number }[] = [];

    const currentDate = new Date(calendarStart);
    while (currentDate <= calendarEnd) {
      const nextDay = new Date(currentDate);
      nextDay.setDate(nextDay.getDate() + 1);

      const dayCommits = commits.filter(c => {
        const commitDate = new Date(c.date);
        commitDate.setHours(0, 0, 0, 0);
        return commitDate >= currentDate && commitDate < nextDay;
      });

      const added = dayCommits.reduce((sum, c) => sum + c.stats.added, 0);
      const deleted = dayCommits.reduce((sum, c) => sum + c.stats.deleted, 0);
      const totalActivity = added + deleted;

      if (totalActivity > maxActivity) {
        maxActivity = totalActivity;
      }

      tempDays.push({
        date: new Date(currentDate),
        commits: dayCommits,
        added,
        deleted
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    for (const td of tempDays) {
      const repos = new Set(td.commits.map(c => c.repo));
      const totalActivity = td.added + td.deleted;
      const activityLevel = maxActivity > 0 ? totalActivity / maxActivity : 0;

      const isInPeriod = td.date >= periodStartDate && td.date <= today;
      const isTodayDate = td.date.getTime() === today.getTime();

      days.push({
        date: td.date,
        dayNum: td.date.getDate(),
        dayName: dayNames[td.date.getDay()],
        month: months[td.date.getMonth()],
        isInPeriod,
        isToday: isTodayDate,
        commits: td.commits,
        added: td.added,
        deleted: td.deleted,
        repos,
        activityLevel
      });
    }

    return {
      days,
      monthName: months[today.getMonth()],
      year: today.getFullYear()
    };
  }, [commits, periodStart]);

  const handleDayClick = (day: CalendarDay) => {
    if (!day.isInPeriod) return;
    
    const dayActivity: DayActivity = {
      date: day.date,
      dayName: day.dayName,
      dayNum: day.dayNum,
      month: day.month,
      commits: day.commits,
      added: day.added,
      deleted: day.deleted,
      repos: day.repos,
      isToday: day.isToday
    };
    onDayClick(dayActivity);
  };

  const getActivityColor = (level: number): string => {
    if (level === 0) return 'var(--border-dark)';
    if (level < 0.25) return 'rgba(249, 216, 87, 0.2)';
    if (level < 0.5) return 'rgba(249, 216, 87, 0.4)';
    if (level < 0.75) return 'rgba(249, 216, 87, 0.6)';
    return 'rgba(249, 216, 87, 0.85)';
  };

  const weeks: CalendarDay[][] = [];
  for (let i = 0; i < calendarData.days.length; i += 7) {
    weeks.push(calendarData.days.slice(i, i + 7));
  }

  const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <motion.div
      className="month-view"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -20 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="month-header">
        <span className="month-title">{calendarData.monthName} {calendarData.year}</span>
      </div>

      <div className="calendar-grid">
        <div className="calendar-day-headers">
          {dayHeaders.map(day => (
            <div key={day} className="day-header-cell">{day}</div>
          ))}
        </div>

        <div className="calendar-weeks">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="calendar-week">
              {week.map((day, dayIndex) => {
                const globalIndex = weekIndex * 7 + dayIndex;
                const hasActivity = day.commits.length > 0;
                
                return (
                  <motion.div
                    key={day.date.toISOString()}
                    className={`calendar-cell ${day.isToday ? 'today' : ''} ${!day.isInPeriod ? 'outside-period' : ''} ${hasActivity ? 'has-activity' : ''}`}
                    initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={prefersReducedMotion ? { duration: 0 } : { 
                      delay: globalIndex * 0.015, 
                      duration: 0.3, 
                      ease: [0.22, 1, 0.36, 1] 
                    }}
                    whileHover={day.isInPeriod && !prefersReducedMotion ? { scale: 1.05, y: -2 } : {}}
                    onClick={() => handleDayClick(day)}
                    style={{
                      cursor: day.isInPeriod ? 'pointer' : 'default'
                    }}
                  >
                    <div className="cell-date">{day.dayNum}</div>
                    
                    <div 
                      className="activity-indicator"
                      style={{
                        background: day.isInPeriod ? getActivityColor(day.activityLevel) : 'transparent'
                      }}
                    />

                    {hasActivity && day.isInPeriod && (
                      <div className="mini-stats">
                        <motion.div 
                          className="mini-bar"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={prefersReducedMotion ? { duration: 0 } : { delay: globalIndex * 0.015 + 0.2, duration: 0.4 }}
                        >
                          <div 
                            className="mini-added" 
                            style={{ 
                              width: `${day.added > 0 ? (day.added / (day.added + day.deleted)) * 100 : 0}%` 
                            }} 
                          />
                          <div 
                            className="mini-deleted" 
                            style={{ 
                              width: `${day.deleted > 0 ? (day.deleted / (day.added + day.deleted)) * 100 : 0}%` 
                            }} 
                          />
                        </motion.div>
                        <span className="commit-count">{day.commits.length}</span>
                      </div>
                    )}

                    {day.isToday && <span className="today-dot" />}
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="month-legend">
        <span className="legend-label">Activity Level:</span>
        <div className="legend-scale">
          <div className="legend-item" style={{ background: 'var(--border-dark)' }} />
          <div className="legend-item" style={{ background: 'rgba(249, 216, 87, 0.2)' }} />
          <div className="legend-item" style={{ background: 'rgba(249, 216, 87, 0.4)' }} />
          <div className="legend-item" style={{ background: 'rgba(249, 216, 87, 0.6)' }} />
          <div className="legend-item" style={{ background: 'rgba(249, 216, 87, 0.85)' }} />
        </div>
        <span className="legend-label-end">High</span>
      </div>
    </motion.div>
  );
}
