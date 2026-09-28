import React, { useEffect, useState } from 'react';
import { X, Radio, CheckCircle, Terminal } from 'lucide-react';

export default function StreamModal({ product, onClose, onStreamComplete }) {
  const [logs, setLogs] = useState([]);
  const [streamedText, setStreamedText] = useState('');
  const [result, setResult] = useState(null);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (!product) return;

    setLogs([`Connecting to SSE Stream: /api/products/${product.id}/suggest-pricing/stream`]);
    setStreamedText('');
    setResult(null);
    setIsDone(false);

    const eventSource = new EventSource(`/api/products/${product.id}/suggest-pricing/stream`);

    eventSource.addEventListener('init', (e) => {
      setLogs((prev) => [...prev, `[INIT] ${e.data}`]);
    });

    eventSource.addEventListener('analysis', (e) => {
      setLogs((prev) => [...prev, `[ANALYSIS] ${e.data}`]);
    });

    eventSource.addEventListener('thought', (e) => {
      setLogs((prev) => [...prev, `[REASONING] ${e.data}`]);
    });

    eventSource.addEventListener('token', (e) => {
      setStreamedText((prev) => prev + e.data);
    });

    eventSource.addEventListener('result', (e) => {
      try {
        const parsed = JSON.parse(e.data);
        setResult(parsed);
      } catch (err) {
        console.error('Failed to parse result:', err);
      }
    });

    eventSource.addEventListener('complete', (e) => {
      setLogs((prev) => [...prev, `[COMPLETE] ${e.data}`]);
      setIsDone(true);
      eventSource.close();
      if (onStreamComplete) onStreamComplete();
    });

    eventSource.addEventListener('error', (e) => {
      setLogs((prev) => [...prev, `[STREAM ERROR] Session disconnected.`]);
      setIsDone(true);
      eventSource.close();
    });

    return () => {
      eventSource.close();
    };
  }, [product]);

  if (!product) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card animate-fade-in">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Radio size={20} color="var(--accent-cyan)" className={!isDone ? 'animate-spin' : ''} />
            <div>
              <h3 style={{ fontSize: '17px', color: '#fff' }}>
                AI Real-Time Reasoning Stream
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {product.name} ({product.sku})
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <div className="stream-terminal">
          {logs.map((log, idx) => (
            <div key={idx} style={{ marginBottom: '4px', opacity: 0.85 }}>
              {log}
            </div>
          ))}

          {streamedText && (
            <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed rgba(6, 182, 212, 0.3)' }}>
              <div style={{ color: 'var(--accent-emerald)', marginBottom: '4px', fontSize: '11px' }}>
                &gt; STREAMED TOKENS:
              </div>
              <div className="stream-token-text">{streamedText}</div>
            </div>
          )}
        </div>

        {result && (
          <div
            style={{
              marginTop: '18px',
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <div style={{ fontSize: '12px', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                PERSISTED TO APPROVAL QUEUE
              </div>
              <div style={{ fontSize: '14px', color: '#fff', marginTop: '2px' }}>
                Recommended Price: <strong>${result.recommendedPrice?.toFixed(2)}</strong> ({result.changeDirection})
              </div>
            </div>
            <CheckCircle size={22} color="var(--accent-emerald)" />
          </div>
        )}

        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            className="btn-secondary"
            onClick={onClose}
            style={{ padding: '8px 20px', background: 'var(--bg-card)' }}
          >
            Close Stream Window
          </button>
        </div>
      </div>
    </div>
  );
}
