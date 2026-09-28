import React from 'react';
import { 
  Search, 
  RotateCcw, 
  Sparkles, 
  ShieldCheck, 
  RefreshCw,
  Activity
} from 'lucide-react';

export default function Header({ 
  searchQuery, 
  setSearchQuery, 
  strategy, 
  onToggleStrategy, 
  onResetData, 
  onRefreshData,
  pendingCount = 0 
}) {
  const isAi = strategy?.mode === 'AI_POWERED';

  return (
    <header className="devias-header">
      {/* Search Input Bar */}
      <div className="header-search-wrap">
        <Search size={17} className="search-icon" />
        <input 
          type="text"
          className="search-input"
          placeholder="Search products by SKU, name, or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button 
            className="search-clear-btn"
            onClick={() => setSearchQuery('')}
            title="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {/* Right Header Domain Controls */}
      <div className="header-actions">
        {/* Backend Connectivity Status Pill */}
        <div className="connection-status-pill" title="Connected to Spring Boot 3.3.4 on port 8080">
          <span className="connection-status-dot"></span>
          <span className="connection-status-text">Backend 8080 Active</span>
        </div>

        {/* Runtime Strategy Switcher (Zero-Downtime Hot Swap) */}
        <button 
          className={`strategy-toggle-pill ${isAi ? 'ai-active' : 'rules-active'}`}
          onClick={onToggleStrategy}
          title="Click to toggle between AI-Powered and Rule-Based engine dynamically without restart"
        >
          {isAi ? (
            <>
              <Sparkles size={14} className="strategy-icon animate-pulse" />
              <span className="strategy-text">Mode: Qwen-Cursor AI</span>
            </>
          ) : (
            <>
              <ShieldCheck size={14} className="strategy-icon" />
              <span className="strategy-text">Mode: Rule-Based Fallback</span>
            </>
          )}
          <span className="switch-hint">Switch</span>
        </button>

        {/* Refresh Live Data */}
        <button 
          className="header-action-button"
          onClick={onRefreshData}
          title="Refresh catalog and pending suggestions from database"
        >
          <RefreshCw size={15} />
          <span>Refresh</span>
        </button>

        {/* Database Benchmark Reset */}
        <button 
          className="header-action-button reset-btn"
          onClick={onResetData}
          title="Reset database to canonical Addendum A benchmark state"
        >
          <RotateCcw size={15} />
          <span>Reset Benchmark</span>
        </button>
      </div>
    </header>
  );
}
