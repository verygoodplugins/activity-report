import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import type { DashboardConfig } from '../types';
import configData from '../data/config.json';
import activityDataRaw from '../data/activity-data.json';
import terminalDark from '../data/themes/terminal-dark.json';
import minimalLight from '../data/themes/minimal-light.json';
import neonCyberpunk from '../data/themes/neon-cyberpunk.json';

const activityData = activityDataRaw as unknown as { config?: DashboardConfig };

export const themes: Record<string, DashboardConfig> = {
  'terminal-dark': terminalDark as unknown as DashboardConfig,
  'minimal-light': minimalLight as unknown as DashboardConfig,
  'neon-cyberpunk': neonCyberpunk as unknown as DashboardConfig,
};

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

function getInitialConfig(): DashboardConfig {
  const fileConfig = configData as unknown as DashboardConfig;
  const activityConfig = activityData.config;
  
  let merged = mergeConfig(defaultConfig, fileConfig);
  if (activityConfig) {
    merged = mergeConfig(merged, activityConfig);
  }
  
  return merged;
}

interface ConfigContextType {
  config: DashboardConfig;
  setTheme: (themeName: string) => void;
  toggleSection: (section: keyof DashboardConfig['sections']) => void;
  toggleInteractivity: (key: keyof DashboardConfig['interactivity']) => void;
  availableThemes: string[];
}

const ConfigContext = createContext<ConfigContextType | null>(null);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<DashboardConfig>(getInitialConfig);

  const setTheme = useCallback((themeName: string) => {
    const themeConfig = themes[themeName];
    if (themeConfig) {
      setConfig(prev => ({
        ...prev,
        theme: themeConfig.theme
      }));
    }
  }, []);

  const toggleSection = useCallback((section: keyof DashboardConfig['sections']) => {
    setConfig(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [section]: {
          ...prev.sections[section],
          enabled: !prev.sections[section].enabled
        }
      }
    }));
  }, []);

  const toggleInteractivity = useCallback((key: keyof DashboardConfig['interactivity']) => {
    setConfig(prev => ({
      ...prev,
      interactivity: {
        ...prev.interactivity,
        [key]: !prev.interactivity[key]
      }
    }));
  }, []);

  const availableThemes = useMemo(() => Object.keys(themes), []);

  const value = useMemo(() => ({
    config,
    setTheme,
    toggleSection,
    toggleInteractivity,
    availableThemes
  }), [config, setTheme, toggleSection, toggleInteractivity, availableThemes]);

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig(): DashboardConfig {
  const context = useContext(ConfigContext);
  if (context) {
    return context.config;
  }
  return getInitialConfig();
}

export function useConfigActions() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfigActions must be used within ConfigProvider');
  }
  return {
    setTheme: context.setTheme,
    toggleSection: context.toggleSection,
    toggleInteractivity: context.toggleInteractivity,
    availableThemes: context.availableThemes,
    currentTheme: context.config.theme.name
  };
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
