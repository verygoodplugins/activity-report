import { useMemo } from 'react';
import type { ActivityData, DayActivity, RepoStats, PullRequest } from '../types';
import activityDataRaw from '../data/activity-data.json';

const activityData = activityDataRaw as unknown as ActivityData;

export function useActivityData() {
  const commits = activityData.commits || [];
  const prs = useMemo(() => {
    return (activityData.prs || []).map(pr => ({
      ...pr,
      additions: pr.additions ?? pr.stats?.added ?? 0,
      deletions: pr.deletions ?? pr.stats?.deleted ?? 0,
      changedFiles: pr.changedFiles ?? pr.stats?.files ?? 0
    })) as PullRequest[];
  }, []);

  const stats = useMemo(() => {
    const totalAdded = commits.reduce((sum, c) => sum + c.stats.added, 0);
    const totalDeleted = commits.reduce((sum, c) => sum + c.stats.deleted, 0);
    const uniqueRepos = new Set(commits.map(c => c.repo));
    
    return {
      totalCommits: commits.length,
      totalAdded,
      totalDeleted,
      totalRepos: uniqueRepos.size,
      totalPRs: prs.length,
      mergedPRs: prs.filter(p => p.state === 'merged').length,
      openPRs: prs.filter(p => p.state === 'open').length
    };
  }, [commits, prs]);

  const weeklyActivity = useMemo((): DayActivity[] => {
    const today = new Date();
    const days: DayActivity[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const dayCommits = commits.filter(c => {
        const commitDate = new Date(c.date);
        return commitDate >= date && commitDate < nextDay;
      });
      
      const repos = new Set(dayCommits.map(c => c.repo));
      const added = dayCommits.reduce((sum, c) => sum + c.stats.added, 0);
      const deleted = dayCommits.reduce((sum, c) => sum + c.stats.deleted, 0);
      
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      days.push({
        date,
        dayName: dayNames[date.getDay()],
        dayNum: date.getDate(),
        month: months[date.getMonth()],
        commits: dayCommits,
        added,
        deleted,
        repos,
        isToday: i === 0
      });
    }
    
    return days;
  }, [commits]);

  const repoStats = useMemo((): RepoStats[] => {
    const repoMap = new Map<string, RepoStats>();
    
    const mockData: Record<string, { description: string; stars: number; language: string; topics: string[]; forks: number }> = {
      'devpulse': { description: 'Developer activity dashboard with real-time commit tracking and beautiful visualizations', stars: 234, language: 'TypeScript', topics: ['react', 'dashboard', 'developer-tools'], forks: 18 },
      'automem': { description: 'Automated memory management and caching solution for high-performance applications', stars: 1847, language: 'Rust', topics: ['memory', 'performance', 'cache'], forks: 126 },
      'agent-core': { description: 'Core framework for building AI agents with modular architecture', stars: 892, language: 'Python', topics: ['ai', 'agents', 'ml'], forks: 67 },
      'web-toolkit': { description: 'Modern web development toolkit with batteries included', stars: 456, language: 'JavaScript', topics: ['web', 'toolkit', 'frontend'], forks: 34 },
    };
    
    commits.forEach(c => {
      const existing = repoMap.get(c.repo);
      if (existing) {
        existing.commits++;
        existing.added += c.stats.added;
        existing.deleted += c.stats.deleted;
      } else {
        const mock = mockData[c.repo] || {
          description: `Repository for ${c.repo} project`,
          stars: Math.floor(Math.random() * 500) + 10,
          language: ['TypeScript', 'JavaScript', 'Python', 'Go', 'Rust'][Math.floor(Math.random() * 5)],
          topics: ['open-source'],
          forks: Math.floor(Math.random() * 50)
        };
        
        repoMap.set(c.repo, {
          name: c.repo,
          commits: 1,
          added: c.stats.added,
          deleted: c.stats.deleted,
          url: c.remoteUrl,
          owner: c.owner,
          description: mock.description,
          stars: mock.stars,
          language: mock.language,
          topics: mock.topics,
          forks: mock.forks
        });
      }
    });
    
    return Array.from(repoMap.values()).sort((a, b) => b.commits - a.commits);
  }, [commits]);

  const maxDayActivity = useMemo(() => {
    return Math.max(...weeklyActivity.map(d => d.added + d.deleted), 1);
  }, [weeklyActivity]);

  return {
    commits,
    prs,
    stats,
    weeklyActivity,
    repoStats,
    maxDayActivity,
    generatedAt: activityData.generatedAt,
    periodStart: activityData.periodStart
  };
}
