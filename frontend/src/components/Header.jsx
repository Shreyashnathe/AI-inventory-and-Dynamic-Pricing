import React, { useState } from 'react';
import { 
  Search, 
  RotateCcw, 
  Sparkles, 
  ShieldCheck, 
  RefreshCw,
  Activity,
  User,
  Shield,
  LogOut,
  ChevronDown
} from 'lucide-react';

export default function Header({ 
  searchQuery, 
  setSearchQuery, 
  strategy, 
  onToggleStrategy, 
  onResetData, 
  onRefreshData,
  isBackendOnline = true,
  refreshing = false,
  pendingCount = 0 
}) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
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
            type="button"
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
        {/* Dynamic Backend Status Indicator */}
        <div 
          className={`connection-status-pill ${isBackendOnline ? 'online' : 'offline'}`}
          title={isBackendOnline ? "Connected to Spring Boot 3.3.4 (Port 8080)" : "Backend disconnected! Run .\\mvnw.cmd spring-boot:run"}
        >
          <span className={`connection-status-dot ${isBackendOnline ? 'dot-green' : 'dot-red animate-pulse'}`}></span>
          <span className="connection-status-text">
            {isBackendOnline ? 'Backend 8080 Active' : 'Backend Offline'}
          </span>
        </div>

        {/* Runtime Strategy Switcher (Zero-Downtime Hot Swap) */}
        <button 
          type="button"
          className={`strategy-toggle-pill ${isAi ? 'ai-active' : 'rules-active'}`}
          onClick={onToggleStrategy}
          title="Click to toggle between AI-Powered and Rule-Based engine without server restart"
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
          type="button"
          className="header-action-button"
          onClick={onRefreshData}
          disabled={refreshing}
          title="Refresh catalog and pending suggestions from backend"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>

        {/* Database Benchmark Reset */}
        <button 
          type="button"
          className="header-action-button reset-btn"
          onClick={onResetData}
          title="Reset database to canonical Addendum A benchmark state"
        >
          <RotateCcw size={14} />
          <span>Reset Benchmark</span>
        </button>

        {/* User Profile Menu (Devias Kit Style) */}
        <div className="user-profile-dropdown-wrapper">
          <button 
            type="button"
            className="user-profile-button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            title="Merchandiser Profile & Session"
          >
            <div className="avatar-wrapper">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80" 
                alt="Merchandiser" 
                className="user-avatar"
              />
              <span className="avatar-online-dot"></span>
            </div>
            <div className="user-text-meta">
              <span className="user-name">Shreyash Nathe</span>
              <span className="user-role">Merchandising Lead</span>
            </div>
            <ChevronDown size={14} className="profile-chevron" />
          </button>

          {/* Interactive Profile Popup Card */}
          {showProfileMenu && (
            <div className="profile-dropdown-popover animate-fade-in">
              <div className="popover-user-info">
                <span className="popover-name">Shreyash Nathe</span>
                <span className="popover-email">lead.merchandiser@shopstream.com</span>
                <span className="popover-badge">Role: Admin / Commerce Approver</span>
              </div>
              <div className="popover-divider"></div>
              <div className="popover-section">
                <div className="popover-item">
                  <Shield size={14} className="popover-icon" />
                  <span>Approval Authority: Full Price &amp; PO</span>
                </div>
                <div className="popover-item">
                  <Activity size={14} className="popover-icon" />
                  <span>Session: Active (Solo Hackathon)</span>
                </div>
              </div>
              <div className="popover-divider"></div>
              <button 
                type="button"
                className="popover-close-btn"
                onClick={() => setShowProfileMenu(false)}
              >
                Close Menu
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
