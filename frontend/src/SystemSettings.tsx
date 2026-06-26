import { useState, useEffect } from 'react';
import { API_URL } from './config';
import { Theme } from './App';
import { Info, Sliders, Shield, Copy, RefreshCw, KeyRound } from 'lucide-react';

interface SystemSettingsProps {
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
  sessionToken: string | null;
  onRotateSession: () => Promise<string | void>;
}

export function SystemSettings({ theme, setTheme, sessionToken, onRotateSession }: SystemSettingsProps) {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');
  
  const [sensitivity, setSensitivity] = useState(30); // 100 - malicious_threshold

  const fetchSettings = () => {
    fetch(`${API_URL}/settings/thresholds`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch settings");
        return r.json();
      })
      .then((d) => {
        if (d && typeof d.malicious_threshold === 'number') {
          setSensitivity(100 - d.malicious_threshold);
        }
      })
      .catch((err) => console.error("Could not load thresholds:", err));
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSensitivityChange = (val: number) => {
    setSensitivity(val);
    const newMalicious = 100 - val;
    const newSuspicious = newMalicious * 0.4; // arbitrary scale for suspicious
    
    fetch(`${API_URL}/settings/thresholds`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        suspicious_threshold: newSuspicious,
        malicious_threshold: newMalicious
      }),
    }).catch(console.error);
  };



  const handleCopySessionToken = async () => {
    if (!sessionToken) {
      setCopyState('error');
      return;
    }

    try {
      await navigator.clipboard.writeText(sessionToken);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch (error) {
      console.error('Failed to copy session token:', error);
      setCopyState('error');
    }
  };

  const handleRotateSession = async () => {
    setCopyState('idle');
    await onRotateSession();
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Configuration</h1>
        <p className="page-subtitle">Adjust the kernel-level defense parameters and AI decision thresholds for the active guarding instance.</p>
      </div>

      <div className="settings-grid">
        
        {/* GENERAL CONFIG */}
        <div className="panel-card">
          <div className="panel-header" style={{ color: 'var(--accent-primary)', padding: '16px 24px' }}>
            <div className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
              <Sliders size={18} /> General
            </div>
          </div>
          <div style={{ padding: '24px' }}>
            
            <div className="form-group">
              <label className="form-label">THEME SELECTION</label>
              <div className="theme-selector">
                <div className={`theme-btn ${theme === 'dark' ? 'active' : ''}`} onClick={() => setTheme('dark')}>
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid currentColor' }}></div>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>Dark</span>
                </div>
                <div className={`theme-btn ${theme === 'light' ? 'active' : ''}`} onClick={() => setTheme('light')}>
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'currentColor' }}></div>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>Light</span>
                </div>
                <div className={`theme-btn ${theme === 'system' ? 'active' : ''}`} onClick={() => setTheme('system')}>
                  <div style={{ width: '16px', height: '16px', borderRadius: '4px', border: '2px solid currentColor' }}></div>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>System</span>
                </div>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>SESSION TOKEN</label>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  {sessionToken ? 'Active session' : 'No token'}
                </span>
              </div>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                padding: '16px',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0))',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                  <KeyRound size={16} color="var(--accent-primary)" />
                  <span>Use the same token on another machine or in Postman to join the same live session.</span>
                </div>

                <div style={{
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-main)',
                  border: '1px solid var(--border-color)',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  color: sessionToken ? 'var(--text-primary)' : 'var(--text-secondary)',
                  wordBreak: 'break-all',
                  minHeight: '48px',
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  {sessionToken || 'A token will appear here after the backend issues one.'}
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={handleCopySessionToken}
                    disabled={!sessionToken}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 14px' }}
                  >
                    <Copy size={14} />
                    {copyState === 'copied' ? 'Copied' : 'Copy Token'}
                  </button>

                  <button
                    type="button"
                    className="btn-outline"
                    onClick={handleRotateSession}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 14px' }}
                  >
                    <RefreshCw size={14} />
                    New Session
                  </button>
                </div>

                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Machine B should use a different token if you want a totally separate history. Click <b>New Session</b> to rotate the token and start clean.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AEGIX CONFIG */}
        <div className="panel-card">
          <div className="panel-header" style={{ color: 'var(--accent-primary)', padding: '16px 24px' }}>
            <div className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
              <Shield size={18} /> Aegix Config
            </div>
          </div>
          <div style={{ padding: '24px' }}>
            
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>AI SENSITIVITY SLIDER</label>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-primary)' }}>{sensitivity}%</span>
              </div>
              <input 
                type="range" 
                min="0" max="100" 
                value={sensitivity} 
                onChange={(e) => handleSensitivityChange(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-primary)', marginBottom: '8px' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                <span>Passive</span>
                <span>Aggressive</span>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>AUTO-KILL THRESHOLD</label>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--status-malicious)' }}>CRITICAL</span>
              </div>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                <div style={{ height: '6px', backgroundColor: 'var(--status-suspicious)', flex: 1, borderRadius: '3px' }}></div>
                <div style={{ height: '6px', backgroundColor: 'var(--status-malicious)', flex: 2, borderRadius: '3px' }}></div>
                <div style={{ height: '6px', backgroundColor: 'var(--border-color)', flex: 1, borderRadius: '3px' }}></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                <span>Suspicious</span>
                <span>Malicious Only</span>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px', display: 'flex', gap: '12px', marginTop: '32px' }}>
              <Info size={20} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
              <div>
                <h4 style={{ fontSize: '13px', marginBottom: '4px', fontWeight: 600 }}>Aegix Control Center</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '12px' }}>
                  The AI Sensitivity Slider controls the strictness of the heuristic engine. A higher sensitivity (Aggressive) lowers the required risk score, allowing the engine to block potential threats faster but increasing the risk of false positives. The recommended optimum level is <b>30%</b> for standard production environments, balancing robust security with normal system operations.
                </p>
                <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase' }}>
                  ● AI ENGINE: V4.2.0-STABLE
                </span>
              </div>
            </div>
          </div>
        </div>


      </div>

      <div className="settings-footer">
        <button className="btn-outline" style={{ padding: '12px 24px', fontSize: '14px' }}>Reset to Defaults</button>
        <button className="btn-cyan" style={{ padding: '12px 24px', fontSize: '14px' }}>Commit Changes</button>
      </div>

    </div>
  );
}
