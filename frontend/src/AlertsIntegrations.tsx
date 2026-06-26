import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Plus, RefreshCw, Trash2, Webhook, Globe, AlertTriangle, Hash, MessageSquare } from 'lucide-react';
import { API_URL } from './config';

interface WebhookRecord {
  id: string;
  url: string;
  is_active: boolean;
  trigger_safe: boolean;
  trigger_suspicious: boolean;
  trigger_malicious: boolean;
}

export function AlertsIntegrations() {
  const [webhooks, setWebhooks] = useState<WebhookRecord[]>([]);
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // New webhook state
  const [triggerSafe, setTriggerSafe] = useState(false);
  const [triggerSuspicious, setTriggerSuspicious] = useState(false);
  const [triggerMalicious, setTriggerMalicious] = useState(true);
  const [integrationType, setIntegrationType] = useState<'webhook' | 'slack' | 'discord'>('webhook');

  const loadWebhooks = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/webhooks`);
      if (!response.ok) throw new Error(`Could not load webhooks (${response.status})`);
      setWebhooks(await response.json());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load webhooks');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadWebhooks();
  }, [loadWebhooks]);

  const addWebhook = async (event: FormEvent) => {
    event.preventDefault();
    if (!url.trim()) return;
    
    if (!triggerSafe && !triggerSuspicious && !triggerMalicious) {
      setError("Please select at least one trigger condition (Safe, Suspicious, or Malicious).");
      return;
    }

    setError('');
    try {
      const response = await fetch(`${API_URL}/webhooks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url, 
          trigger_safe: triggerSafe,
          trigger_suspicious: triggerSuspicious,
          trigger_malicious: triggerMalicious
        }),
      });
      if (!response.ok) throw new Error(`Could not add webhook (${response.status})`);
      setUrl('');
      await loadWebhooks();
    } catch (addError) {
      setError(addError instanceof Error ? addError.message : 'Could not add webhook');
    }
  };

  const removeWebhook = async (id: string) => {
    setError('');
    try {
      const response = await fetch(`${API_URL}/webhooks/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error(`Could not remove webhook (${response.status})`);
      setWebhooks((current) => current.filter((webhook) => webhook.id !== id));
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'Could not remove webhook');
    }
  };

  const getIntegrationIcon = (whUrl: string) => {
    if (whUrl.includes('slack.com')) return <Hash size={16} />;
    if (whUrl.includes('discord.com')) return <MessageSquare size={16} />;
    return <Webhook size={16} />;
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Globe size={24} style={{ color: 'var(--accent-primary)' }} />
              Alerts &amp; Integrations
            </h2>
            <p>Configure outbound webhooks for detected security events</p>
          </div>
          <button 
            className="icon-btn" 
            onClick={() => void loadWebhooks()} 
            title="Refresh webhooks"
            style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', padding: '8px', borderRadius: '6px' }}
          >
            <RefreshCw size={18} className={isLoading ? 'spinning' : ''} style={{ color: 'var(--text-primary)' }} />
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        
        {/* ACTIVE WEBHOOKS */}
        <div className="panel-card">
          <div className="panel-header" style={{ color: 'var(--accent-primary)', padding: '16px 24px' }}>
            <div className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
              <Webhook size={18} /> Configured Webhooks
            </div>
          </div>
          
          <div style={{ flex: 1, padding: '0 0 16px 0' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Platform</th>
                  <th>Endpoint URL</th>
                  <th>Status</th>
                  <th>Triggers</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {!isLoading && webhooks.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                      No webhooks configured. Add one below.
                    </td>
                  </tr>
                )}
                {webhooks.map(wh => (
                  <tr key={wh.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)' }}>
                        {getIntegrationIcon(wh.url)}
                        <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'capitalize' }}>
                          {wh.url.includes('slack.com') ? 'Slack' : wh.url.includes('discord.com') ? 'Discord' : 'Custom'}
                        </span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--accent-primary)', fontSize: '13px', fontFamily: 'var(--font-tech)' }}>
                      {wh.url.length > 40 ? wh.url.substring(0, 40) + '...' : wh.url}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600 }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: wh.is_active ? 'var(--status-safe)' : 'var(--status-malicious)' }}></div> 
                        {wh.is_active ? 'Active' : 'Disabled'}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {wh.trigger_safe && <div className="badge" style={{ backgroundColor: 'var(--status-safe-bg)', color: 'var(--status-safe)', fontSize: '10px' }}>SAFE</div>}
                        {wh.trigger_suspicious && <div className="badge" style={{ backgroundColor: 'var(--status-suspicious-bg)', color: 'var(--status-suspicious)', fontSize: '10px' }}>SUSPICIOUS</div>}
                        {wh.trigger_malicious && <div className="badge" style={{ backgroundColor: 'var(--status-malicious-bg)', color: 'var(--status-malicious)', fontSize: '10px' }}>MALICIOUS</div>}
                        {!wh.trigger_safe && !wh.trigger_suspicious && !wh.trigger_malicious && <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>None</span>}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="btn-outline" 
                        onClick={() => void removeWebhook(wh.id)} 
                        title="Remove webhook"
                        style={{ padding: '4px 12px', fontSize: '11px', color: 'var(--status-malicious)', borderColor: 'var(--status-malicious-bg)' }}
                      >
                        <Trash2 size={14} style={{ marginRight: '4px' }} /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div style={{ padding: '0 24px 24px 24px' }}>
             <form onSubmit={addWebhook} style={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: 'var(--bg-main)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Add New Integration</div>
                
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Integration Type</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <div className={`theme-btn ${integrationType === 'webhook' ? 'active' : ''}`} onClick={() => setIntegrationType('webhook')} style={{ flex: 1, justifyContent: 'center' }}>
                        <Webhook size={16} /> <span style={{ fontSize: '12px', fontWeight: 600 }}>Webhook</span>
                      </div>
                      <div className={`theme-btn ${integrationType === 'slack' ? 'active' : ''}`} onClick={() => setIntegrationType('slack')} style={{ flex: 1, justifyContent: 'center' }}>
                        <Hash size={16} /> <span style={{ fontSize: '12px', fontWeight: 600 }}>Slack</span>
                      </div>
                      <div className={`theme-btn ${integrationType === 'discord' ? 'active' : ''}`} onClick={() => setIntegrationType('discord')} style={{ flex: 1, justifyContent: 'center' }}>
                        <MessageSquare size={16} /> <span style={{ fontSize: '12px', fontWeight: 600 }}>Discord</span>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 2 }}>
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Webhook URL</label>
                    <input
                      type="url"
                      placeholder={integrationType === 'slack' ? 'https://hooks.slack.com/services/...' : integrationType === 'discord' ? 'https://discord.com/api/webhooks/...' : 'https://api.example.com/webhook'}
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '13px', height: '42px' }}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '8px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Trigger Conditions</label>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div className={`custom-checkbox ${triggerSafe ? 'active safe' : ''}`} onClick={() => setTriggerSafe(!triggerSafe)}>
                        Safe Events
                      </div>
                      <div className={`custom-checkbox ${triggerSuspicious ? 'active suspicious' : ''}`} onClick={() => setTriggerSuspicious(!triggerSuspicious)}>
                        Suspicious Events
                      </div>
                      <div className={`custom-checkbox ${triggerMalicious ? 'active malicious' : ''}`} onClick={() => setTriggerMalicious(!triggerMalicious)}>
                        Malicious Events
                      </div>
                    </div>
                  </div>
                  
                  <button type="submit" className="btn-cyan" style={{ padding: '10px 24px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', height: '42px' }}>
                    <Plus size={16} /> Add Integration
                  </button>
                </div>

                {error && (
                  <div style={{ marginTop: '8px', padding: '10px', backgroundColor: 'var(--status-malicious-bg)', color: 'var(--status-malicious)', borderRadius: '6px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={14} /> {error}
                  </div>
                )}
              </form>
          </div>
        </div>

      </div>
    </div>
  );
}
