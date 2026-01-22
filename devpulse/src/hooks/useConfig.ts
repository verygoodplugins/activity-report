import { useMemo } from 'react';
import type { DashboardConfig, ActivityData } from '../types';
import configData from '../data/config.json';
import activityDataRaw from '../data/activity-data.json';

const activityData = activityDataRaw as unknown as ActivityData;

const defaultConfig: DashboardConfig = {
  theme: {
    name: 'terminal-dark',
    colors: {
      primary: '#F9D857',
      secondary: '#D4A425',
      background: '#0A0A0A',
      surface: '#1a1a1a',
      text: '#F5F5F5',
      accent: '#F472B6'
    }
  },
  sections: {
    hero: { enabled: true, title: 'The Grind Report', subtitle: 'Weekly developer activity transparency. Building in public.' },
    weekly: { enabled: true, title: "This Week's Activity" },
    repos: { enabled: true, title: 'Projects', maxItems: 10 },
    prs: { enabled: true, title: 'Recent PRs', maxItems: 10 }
  },
  branding: {
    footer: 'Generated with love by',
    attribution: 'AutoMem'
  },
  interactivity: {
    animations: true,
    dayDetailModal: true,
    monthView: true
  }
};

function mergeConfig(base: DashboardConfig, override?: Partial<DashboardConfig>): DashboardConfig {
  if (!override) return base;
  
  return {
    theme: {
      ...base.theme,
      ...override.theme,
      colors: {
        ...base.theme.colors,
        ...override.theme?.colors
      }
    },
    sections: {
      hero: { ...base.sections.hero, ...override.sections?.hero },
      weekly: { ...base.sections.weekly, ...override.sections?.weekly },
      repos: { ...base.sections.repos, ...override.sections?.repos },
      prs: { ...base.sections.prs, ...override.sections?.prs }
    },
    branding: {
      ...base.branding,
      ...override.branding
    },
    interactivity: {
      ...base.interactivity,
      ...override.interactivity
    }
  };
}

export function useConfig(): DashboardConfig {
  const config = useMemo(() => {
    const fileConfig = configData as unknown as DashboardConfig;
    const activityConfig = activityData.config;
    
    let merged = mergeConfig(defaultConfig, fileConfig);
    if (activityConfig) {
      merged = mergeConfig(merged, activityConfig);
    }
    
    return merged;
  }, []);
  
  return config;
}

export function applyConfigColors(config: DashboardConfig): void {
  const root = document.documentElement;
  const { colors } = config.theme;
  
  root.style.setProperty('--config-primary', colors.primary);
  root.style.setProperty('--config-secondary', colors.secondary);
  root.style.setProperty('--config-background', colors.background);
  root.style.setProperty('--config-surface', colors.surface);
  root.style.setProperty('--config-text', colors.text);
  root.style.setProperty('--config-accent', colors.accent);
}
