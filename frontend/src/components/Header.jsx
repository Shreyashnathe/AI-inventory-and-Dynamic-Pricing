import React from 'react';
import { Cpu, RefreshCw, RotateCcw, Zap, Sliders } from 'lucide-react';

export default function Header({ strategy, onToggleStrategy, onResetData, onRefresh, loading }) {
  const isAi = strategy?.mode === 'AI_POWERED';

  return (
    <header className="app-header">
      <div className="brand-section">
        <div className="brand-logo">
          <Zap size={24} color="#fff" />
        </div>
        <div>
          <div className="brand-title">
            StockPulse
            <span className="brand-badge">Agentic Engine</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Autonomous Inventory Signal & Dynamic Pricing Advisor
          </div>
        </div>
      </div>

      <div className="header-actions">
        {/* Runtime Strategy Switcher */}
        <div className="strategy-toggle-card">
          <Sliders size={18} color="var(--accent-cyan)" />
          <div className="strategy-info">
            <span className="strategy-label">Active Engine</span>
            <span className="strategy-name">
              {isAi ? '⚡ AI-Powered (Qwen-Cursor)' : '⚙️ Rule-Based (Deterministic)'}
            </span>
          </div>
          <button
            className="strategy-btn"
            onClick={onToggleStrategy}
            title="Switch commerce strategy at runtime without server restart"
          >
            Switch to {isAi ? 'Rule-Based' : 'AI Advisor'}
          </button>
        </div>

        {/* Reset Benchmark Button */}
        <button
          className="btn-secondary"
          onClick={onResetData}
          title="Reset database to Addendum A canonical seed data"
        >
          <RotateCcw size={15} />
          Reset Demo Data
        </button>

        {/* Refresh Button */}
        <button
          className="btn-secondary"
          onClick={onRefresh}
          disabled={loading}
          title="Refresh catalog and pending suggestions"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Sync
        </button>
      </div>
    </header>
  );
}
