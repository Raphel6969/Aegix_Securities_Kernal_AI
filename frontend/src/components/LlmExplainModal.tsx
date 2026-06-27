import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Brain, Loader2, Sparkles, X } from 'lucide-react';

export interface LlmExplainModalProps {
  open: boolean;
  onClose: () => void;
  command?: string;
  classification?: string;
  llmText: string | null;
  loading: boolean;
  error: string;
  cached: boolean;
  onGenerate: (regenerate: boolean) => void;
}

function renderMarkdownish(text: string) {
  return text.split('\n').map((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      return (
        <strong key={i} className="llm-modal__heading">
          {trimmed.slice(2, -2)}
        </strong>
      );
    }
    if (!trimmed) return <br key={i} />;
    return <p key={i}>{line}</p>;
  });
}

export function LlmExplainModal({
  open,
  onClose,
  command,
  classification,
  llmText,
  loading,
  error,
  cached,
  onGenerate,
}: LlmExplainModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="llm-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="llm-modal-title"
      onClick={onClose}
    >
      <div className="llm-modal glass-card" onClick={(e) => e.stopPropagation()}>
        <div className="llm-modal__header">
          <div className="llm-modal__title-row">
            <Brain size={22} style={{ color: 'var(--neon-cyan)' }} />
            <div>
              <h2 id="llm-modal-title" className="llm-modal__title">
                Tier C — Groq Analysis
              </h2>
              <p className="llm-modal__subtitle">
                Detailed SOC briefing powered by Groq
              </p>
            </div>
          </div>
          <div className="llm-modal__header-actions">
            {cached && llmText && (
              <span className="llm-modal__cached">cached</span>
            )}
            <button type="button" className="llm-modal__close" onClick={onClose} aria-label="Close">
              <X size={20} />
            </button>
          </div>
        </div>

        {command && (
          <div className="llm-modal__command-block">
            <span className="llm-modal__command-label">Command under review</span>
            <code className="llm-modal__command">$ {command}</code>
            {classification && (
              <span className={`llm-modal__verdict llm-modal__verdict--${classification}`}>
                {classification.toUpperCase()}
              </span>
            )}
          </div>
        )}

        <div className="llm-modal__body">
          {loading && !llmText && (
            <div className="llm-modal__loading">
              <Loader2 size={28} className="spinning" />
              <span>Analyzing command with Groq…</span>
            </div>
          )}

          {llmText ? (
            <div className="llm-modal__content">{renderMarkdownish(llmText)}</div>
          ) : !loading ? (
            <p className="llm-modal__placeholder">
              Generate a detailed briefing covering what this command does, its attack
              objective, the threat pattern it matches, and recommended SOC actions.
            </p>
          ) : null}

          {error && <div className="llm-modal__error">{error}</div>}
        </div>

        <div className="llm-modal__footer">
          <button type="button" className="btn-outline" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="btn-cta-gradient llm-modal__generate-btn"
            onClick={() => onGenerate(Boolean(llmText))}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="spinning" />
                GENERATING…
              </>
            ) : llmText ? (
              <>
                <Sparkles size={16} />
                REGENERATE ANALYSIS
              </>
            ) : (
              <>
                <Sparkles size={16} />
                GENERATE LLM ANALYSIS
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
