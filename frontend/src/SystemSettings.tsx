import { useState, useEffect } from 'react';
import { API_URL } from './config';
import type { Theme } from './types';
import { Cpu, Shield, Database, Copy, RefreshCw, KeyRound, HardDrive } from 'lucide-react';

interface SystemSettingsProps {
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
  sessionToken: string | null;
  onRotateSession: () => Promise<string | void>;
  remediationEnabled: boolean;
  onRemediationChange: (enabled: boolean) => void;
  apiOnline: boolean;
  wsConnected: boolean;
}

export function SystemSettings({
  theme,
  setTheme,
  sessionToken,
  onRotateSession,
  remediationEnabled,
  onRemediationChange,
  apiOnline,
  wsConnected,
}: SystemSettingsProps) {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');
  const [sensitivity, setSensitivity] = useState(40);
  const [cacheSize, setCacheSize] = useState(() => {
    const saved = localStorage.getItem('aegix_cache_size');
    return saved ? parseInt(saved, 10) : 50000;
  });

  useEffect(() => {
    fetch(`${API_URL}/settings/thresholds`)
      .then((r) => r.json())
      .then((d) => {
        if (typeof d.malicious_threshold === 'number') {
          setSensitivity(100 - d.malicious_threshold);
        }
      })
      .catch(console.error);
  }, []);

  const handleSensitivityChange = (val: number) => {
    setSensitivity(val);
    const malicious = 100 - val;
    fetch(`${API_URL}/settings/thresholds`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ suspicious_threshold: malicious * 0.4, malicious_threshold: malicious }),
    }).catch(console.error);
  };

  const handleCacheChange = (val: number) => {
    setCacheSize(val);
    localStorage.setItem('aegix_cache_size', String(val));
  };

  const handleCopy = async () => {
    if (!sessionToken) { setCopyState('error'); return; }
    try {
      await navigator.clipboard.writeText(sessionToken);
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('error');
    }
  };

  const isLinux = typeof navigator !== 'undefined' && /Linux/i.test(navigator.userAgent);

  return (
    <div className="settings-page">
      <div className="settings-status-row">
        {[
          { icon: Cpu, label: 'Backend', value: apiOnline ? 'Online' : 'Offline', color: apiOnline ? 'green' : 'red' },
          { icon: Cpu, label: 'Websocket', value: wsConnected ? 'Connected' : 'Disconnected', color: wsConnected ? 'cyan' : 'red' },
          { icon: Cpu, label: 'Kernel', value: isLinux ? 'eBPF Native' : 'API-Only', color: 'orange' },
          { icon: Database, label: 'DB', value: 'events.db', color: 'cyan' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="settings-status-card">
            <Icon size={18} className={`settings-status-card__icon settings-status-card__icon--${color}`} />
            <div>
              <span>{label}</span>
              <strong className={`settings-status-card__val--${color}`}>{value}</strong>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card settings-section">
        <div className="settings-section__header">
          <Cpu size={18} style={{ color: 'var(--neon-cyan)' }} />
          <div>
            <strong>Kernel Mode</strong>
            <p>Switch the active kernel hook implementation for process surveillance.</p>
          </div>
        </div>
        <div className="grid-2">
          <div className={`kernel-mode-card ${isLinux ? 'active' : ''}`}>
            <div className="kernel-mode-card__top">
              <strong>Linux (eBPF Native)</strong>
              <span className="kernel-mode-card__power">⏻</span>
            </div>
            <p>Full execve interception via tracepoint hook with ring-buffer streaming.</p>
          </div>
          <div className={`kernel-mode-card ${!isLinux ? 'active' : ''}`}>
            <div className="kernel-mode-card__top">
              <strong>Windows / macOS (API-Only)</strong>
            </div>
            <p>Manual analysis and dashboard mode without kernel-level capture.</p>
          </div>
        </div>
      </div>

      <div className="glass-card settings-section settings-remediation">
        <Shield size={20} style={{ color: 'var(--neon-orange)' }} />
        <div className="settings-remediation__text">
          <strong>Automated Kill-on-Detect (Auto-Remediation)</strong>
          <p>When enabled, the kernel daemon will terminate flagged processes immediately upon malicious classification.</p>
        </div>
        <button
          type="button"
          className={`neon-toggle ${remediationEnabled ? 'active' : ''}`}
          onClick={() => onRemediationChange(!remediationEnabled)}
          aria-pressed={remediationEnabled}
        >
          <span className="neon-toggle__thumb" />
        </button>
      </div>

      <div className="glass-card settings-section">
        <div className="settings-section__header">
          <HardDrive size={18} style={{ color: 'var(--neon-yellow)' }} />
          <div>
            <strong>Cache &amp; Storage</strong>
          </div>
        </div>
        <div className="cache-slider-block">
          <div className="cache-slider-block__top">
            <span className="form-label">Event Cache Size</span>
            <strong className="cache-slider-block__value">{cacheSize.toLocaleString()} events</strong>
          </div>
          <input
            type="range"
            min={1000}
            max={200000}
            step={1000}
            value={cacheSize}
            onChange={(e) => handleCacheChange(Number(e.target.value))}
            className="cache-slider"
          />
          <div className="cache-slider-labels">
            <span>1K</span><span>100K</span><span>200K</span>
          </div>
        </div>
        <div className="form-group" style={{ marginTop: 20 }}>
          <label className="form-label">Database Path</label>
          <input className="form-input form-input--mono" readOnly value="data/events.db" />
        </div>
        <div className="cache-stats-row">
          {[
            ['SIZE', '~142 MB'],
            ['RECORDS', '—'],
            ['COMPACTION', 'AUTO'],
          ].map(([k, v]) => (
            <div key={k} className="cache-stat">
              <span>{k}</span>
              <strong>{v}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card settings-section">
        <div className="settings-section__header">
          <KeyRound size={18} style={{ color: 'var(--neon-cyan)' }} />
          <div>
            <strong>Session Token</strong>
            <p>Share across machines or Postman for the same live session.</p>
          </div>
        </div>
        <div className="form-input form-input--mono" style={{ padding: 12, wordBreak: 'break-all', minHeight: 48 }}>
          {sessionToken || 'Waiting for token…'}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
          <button type="button" className="btn-outline" onClick={handleCopy} disabled={!sessionToken}>
            <Copy size={14} /> {copyState === 'copied' ? 'Copied' : 'Copy Token'}
          </button>
          <button type="button" className="btn-outline" onClick={() => void onRotateSession()}>
            <RefreshCw size={14} /> New Session
          </button>
        </div>
      </div>

      <div className="glass-card settings-section">
        <div className="settings-section__header">
          <Cpu size={18} style={{ color: 'var(--neon-cyan)' }} />
          <div>
            <strong>AI Sensitivity Threshold</strong>
            <p>Adjust how aggressively the cascade classifies commands as malicious.</p>
          </div>
        </div>
        <div className="cache-slider-block">
          <div className="cache-slider-block__top">
            <span className="form-label">Sensitivity</span>
            <strong className="cache-slider-block__value" style={{ color: 'var(--neon-cyan)' }}>{sensitivity}%</strong>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={sensitivity}
            onChange={(e) => handleSensitivityChange(Number(e.target.value))}
            className="cache-slider cache-slider--cyan"
          />
          <div className="cache-slider-labels">
            <span>Passive</span><span>Aggressive</span>
          </div>
        </div>
        <div className="theme-selector" style={{ marginTop: 20 }}>
          {(['dark', 'light', 'system'] as Theme[]).map((t) => (
            <button
              key={t}
              type="button"
              className={`theme-btn ${theme === t ? 'active' : ''}`}
              onClick={() => setTheme(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
