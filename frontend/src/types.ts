export type Page = 'home' | 'monitor' | 'sandbox' | 'alerts' | 'analytics' | 'settings';
export type Theme = 'light' | 'dark' | 'system';

export const PAGE_META: Record<Page, { title: string; subtitle: string }> = {
  home: { title: 'Welcome to AEGIX', subtitle: 'Cascading AI security for the kernel' },
  monitor: { title: 'Threat Monitor', subtitle: 'Real-time kernel event stream' },
  sandbox: { title: 'Command Sandbox', subtitle: 'Cascading analysis simulator' },
  alerts: { title: 'Alerts & Integrations', subtitle: 'Outbound webhooks & dispatch log' },
  analytics: { title: 'Analytics & Metrics', subtitle: 'Telemetry command center' },
  settings: { title: 'System Settings', subtitle: 'Configuration & remediation' },
};
