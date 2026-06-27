import { Bell, Moon, Sun, Monitor } from 'lucide-react';
import type { Theme } from '../types';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  apiOnline: boolean;
  wsConnected: boolean;
  theme: Theme;
  onToggleTheme: () => void;
  utcTime: string;
}

export function PageHeader({
  title,
  subtitle,
  apiOnline,
  wsConnected,
  theme,
  onToggleTheme,
  utcTime,
}: PageHeaderProps) {
  const themeLabel = theme === 'dark' ? 'DARK' : theme === 'light' ? 'LIGHT' : 'AUTO';
  const ThemeIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;

  return (
    <header className="page-header-bar">
      <div className="page-header-bar__left">
        <h1 className="page-header-bar__title">
          {title}
          <span className="live-badge">LIVE</span>
        </h1>
        <p className="page-header-bar__subtitle">{subtitle}</p>
      </div>
      <div className="page-header-bar__right">
        <div className={`status-pill status-pill--green ${apiOnline ? '' : 'status-pill--offline'}`}>
          <span className="status-pill__dot" />
          BACKEND {apiOnline ? 'Online' : 'Offline'}
        </div>
        <div className={`status-pill status-pill--cyan ${wsConnected ? '' : 'status-pill--offline'}`}>
          <span className="status-pill__icon">⬡</span>
          WS {wsConnected ? 'Connected' : 'Disconnected'}
        </div>
        <div className="utc-clock">{utcTime}</div>
        <button type="button" className="theme-pill" onClick={onToggleTheme} title="Toggle theme">
          <ThemeIcon size={14} />
          {themeLabel}
        </button>
        <button type="button" className="bell-btn" aria-label="Notifications">
          <Bell size={18} />
          <span className="bell-btn__dot" />
        </button>
      </div>
    </header>
  );
}
