import { Activity, ShieldCheck, ShieldQuestion, ShieldX, BarChart3, TrendingUp, List, ChevronRight, X, Cpu, Info } from 'lucide-react';
import { useState } from 'react';
import type { SecurityEvent } from './useWebSocket';

interface AnalyticsMetricsProps {
  events: SecurityEvent[];
}

export function AnalyticsMetrics({ events }: AnalyticsMetricsProps) {
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);

  const counts = events.reduce(
    (totals, event) => {
      totals.total += 1;
      if (event.classification === 'safe') totals.safe += 1;
      if (event.classification === 'suspicious') totals.suspicious += 1;
      if (event.classification === 'malicious') totals.malicious += 1;
      totals.risk += event.risk_score;
      return totals;
    },
    { total: 0, safe: 0, suspicious: 0, malicious: 0, risk: 0 },
  );
  const averageRisk = counts.total > 0 ? counts.risk / counts.total : 0;

  const metrics = [
    { label: 'Total Events', value: counts.total, icon: Activity, tone: 'var(--accent-primary)', bgTone: 'rgba(0, 240, 255, 0.1)' },
    { label: 'Safe Events', value: counts.safe, icon: ShieldCheck, tone: 'var(--status-safe)', bgTone: 'var(--status-safe-bg)' },
    { label: 'Suspicious', value: counts.suspicious, icon: ShieldQuestion, tone: 'var(--status-suspicious)', bgTone: 'var(--status-suspicious-bg)' },
    { label: 'Malicious', value: counts.malicious, icon: ShieldX, tone: 'var(--status-malicious)', bgTone: 'var(--status-malicious-bg)' },
  ];

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <BarChart3 size={24} style={{ color: 'var(--accent-primary)' }} />
          Analytics &amp; Metrics
        </h2>
        <p>Global statistics for the current monitoring session</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {metrics.map(({ label, value, icon: Icon, tone, bgTone }) => (
          <div key={label} className="panel-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: bgTone, color: tone }}>
                <Icon size={24} />
              </div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-tech)' }}>
                {value}
              </div>
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="panel-card">
          <div className="panel-header" style={{ padding: '16px 24px' }}>
            <div className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', color: 'var(--accent-primary)' }}>
              <TrendingUp size={18} /> Global Risk Assessment
            </div>
          </div>
          <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
             <div style={{ 
               width: '120px', height: '120px', borderRadius: '50%', 
               display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
               border: `4px solid ${averageRisk > 70 ? 'var(--status-malicious)' : averageRisk > 30 ? 'var(--status-suspicious)' : 'var(--status-safe)'}`,
               boxShadow: `0 0 20px ${averageRisk > 70 ? 'var(--status-malicious-bg)' : averageRisk > 30 ? 'var(--status-suspicious-bg)' : 'var(--status-safe-bg)'}`
             }}>
               <span style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-tech)' }}>{averageRisk.toFixed(1)}</span>
               <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Avg Score</span>
             </div>
             <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px', marginTop: '8px' }}>
               The overall threat severity computed across {counts.total} intercepted operations.
             </p>
          </div>
        </div>

        <div className="panel-card">
          <div className="panel-header" style={{ padding: '16px 24px' }}>
            <div className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', color: 'var(--accent-primary)' }}>
              <Activity size={18} /> Event Distribution
            </div>
          </div>
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[
              { label: 'Safe', count: counts.safe, color: 'var(--status-safe)' },
              { label: 'Suspicious', count: counts.suspicious, color: 'var(--status-suspicious)' },
              { label: 'Malicious', count: counts.malicious, color: 'var(--status-malicious)' }
            ].map((item) => (
              <div key={item.label} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600 }}>
                  <span style={{ color: item.color }}>{item.label}</span>
                  <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-tech)' }}>{counts.total ? Math.round((item.count / counts.total) * 100) : 0}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-main)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', 
                    backgroundColor: item.color, 
                    width: `${counts.total ? (item.count / counts.total) * 100 : 0}%`,
                    transition: 'width 0.5s ease-out'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel-card" style={{ marginTop: '24px' }}>
        <div className="panel-header" style={{ padding: '16px 24px' }}>
          <div className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', color: 'var(--accent-primary)' }}>
            <List size={18} /> Detailed Operations Log
          </div>
        </div>
        <div style={{ padding: '0 0 16px 0', overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>PID</th>
                <th>UID</th>
                <th>Command</th>
                <th>Classification</th>
                <th style={{ textAlign: 'right' }}>Risk Score</th>
                <th style={{ textAlign: 'center' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                    No operations intercepted in this session.
                  </td>
                </tr>
              )}
              {[...events].reverse().map((ev, i) => (
                <tr key={ev.id || i}>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                    {new Date(ev.timestamp * 1000).toLocaleTimeString()}
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '12px', fontFamily: 'var(--font-tech)' }}>
                    {ev.pid}
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '12px', fontFamily: 'var(--font-tech)' }}>
                    {ev.uid}
                  </td>
                  <td style={{ color: 'var(--accent-primary)', fontSize: '13px', fontFamily: 'var(--font-tech)' }}>
                    {ev.command} {ev.argv_str ? (ev.argv_str.length > 25 ? ev.argv_str.substring(0, 25) + '...' : ev.argv_str) : ''}
                  </td>
                  <td>
                    <div className="badge" style={{ 
                      backgroundColor: ev.classification === 'malicious' ? 'var(--status-malicious-bg)' : ev.classification === 'suspicious' ? 'var(--status-suspicious-bg)' : 'var(--status-safe-bg)', 
                      color: ev.classification === 'malicious' ? 'var(--status-malicious)' : ev.classification === 'suspicious' ? 'var(--status-suspicious)' : 'var(--status-safe)' 
                    }}>
                      {ev.classification.toUpperCase()}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'var(--font-tech)', color: 'var(--text-primary)' }}>
                    {ev.risk_score.toFixed(1)}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button 
                      className="btn-outline" 
                      onClick={() => setSelectedEvent(ev)} 
                      style={{ padding: '4px 12px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      View <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* EVENT DETAILS MODAL */}
      {selectedEvent && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100
        }}>
          <div className="panel-card" style={{ width: '600px', maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto' }}>
             <div className="panel-header" style={{ padding: '20px 24px' }}>
               <div className="panel-title" style={{ color: 'var(--accent-primary)' }}>Event Details</div>
               <button className="icon-btn" onClick={() => setSelectedEvent(null)}><X size={20}/></button>
             </div>
             <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                <div>
                   <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 700, letterSpacing: '1px' }}>Execution Context</div>
                   <div style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '16px', fontFamily: 'monospace', fontSize: '13px', color: 'var(--accent-primary)' }}>
                      <div style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                        <span>PID: <span style={{ color: 'var(--text-primary)' }}>{selectedEvent.pid}</span></span>
                        <span>PPID: <span style={{ color: 'var(--text-primary)' }}>{selectedEvent.ppid}</span></span>
                        <span>UID: <span style={{ color: 'var(--text-primary)' }}>{selectedEvent.uid}</span></span>
                        <span>GID: <span style={{ color: 'var(--text-primary)' }}>{selectedEvent.gid}</span></span>
                      </div>
                      <div style={{ color: '#00ff00', wordBreak: 'break-all', backgroundColor: '#0a0a0c', padding: '12px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                        $ {selectedEvent.command} {selectedEvent.argv_str}
                      </div>
                   </div>
                </div>
                
                <div style={{ display: 'flex', gap: '16px' }}>
                   <div style={{ flex: 1, backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '16px' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px' }}>Classification</div>
                      <div style={{ fontSize: '20px', fontWeight: 700, marginTop: '8px', textTransform: 'capitalize', color: selectedEvent.classification === 'malicious' ? 'var(--status-malicious)' : selectedEvent.classification === 'suspicious' ? 'var(--status-suspicious)' : 'var(--status-safe)' }}>
                        {selectedEvent.classification}
                      </div>
                   </div>
                   <div style={{ flex: 1, backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '16px' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px' }}>Risk Score</div>
                      <div style={{ fontSize: '20px', fontWeight: 700, marginTop: '8px', fontFamily: 'var(--font-tech)', color: 'var(--text-primary)' }}>
                        {selectedEvent.risk_score.toFixed(1)} <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>/ 100</span>
                      </div>
                   </div>
                </div>
                
                {selectedEvent.matched_rules && selectedEvent.matched_rules.length > 0 && (
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 700, letterSpacing: '1px' }}>Matched Heuristic Rules</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {selectedEvent.matched_rules.map(rule => (
                        <div key={rule} className="badge" style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '6px 10px' }}>
                           {rule}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedEvent.explanation && (
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 700, letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '6px' }}><Info size={14}/> Heuristic Explanation</div>
                    <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.5, color: 'var(--text-primary)', backgroundColor: 'var(--bg-main)', padding: '16px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                      {selectedEvent.explanation}
                    </p>
                  </div>
                )}

                <div>
                   <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 700, letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                     <Cpu size={14}/> Deep AI Analysis (LLM)
                   </div>
                   <div style={{ backgroundColor: 'rgba(0, 240, 255, 0.05)', border: '1px dashed var(--accent-primary)', borderRadius: '6px', padding: '24px', textAlign: 'center' }}>
                      <p style={{ color: 'var(--accent-primary)', fontSize: '14px', margin: 0, fontWeight: 700, letterSpacing: '0.5px' }}>[LLM Analysis Pending Implementation]</p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '8px 0 0 0', lineHeight: 1.5 }}>This feature will query our fine-tuned LLM model to provide an execution-tree sandbox breakdown and exact CVE references.</p>
                      <button className="btn-cyan" style={{ margin: '16px auto 0 auto', opacity: 0.5, cursor: 'not-allowed' }}>Generate Detailed Report</button>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
