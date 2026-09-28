import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  RotateCcw, 
  Sparkles, 
  ShieldCheck, 
  RefreshCw,
  Activity,
  Shield,
  User,
  Check,
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
  const profileRef = useRef(null);
  const isAi = strategy?.mode === 'AI_POWERED';

  // Reliable click-outside and Escape key listener to eliminate dropdown glitches
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setShowProfileMenu(false);
      }
    }

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showProfileMenu]);

  return (
    <header className="devias-header">
      {/* Search Input Bar */}
      <div className="header-search-wrap">
        <Search size={16} className="search-icon" />
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

        {/* User Profile Menu with Click-Outside Guard & Self-Contained Initials Avatar */}
        <div className="user-profile-dropdown-wrapper" ref={profileRef}>
          <button 
            type="button"
            className={`user-profile-button ${showProfileMenu ? 'active' : ''}`}
            onClick={() => setShowProfileMenu((prev) => !prev)}
            title="Merchandiser Profile & Session"
            aria-expanded={showProfileMenu}
          >
            <div className="avatar-initials-box">
              <span>SN</span>
              <span className="avatar-online-dot"></span>
            </div>
            <div className="user-text-meta">
              <span className="user-name">Shreyash Nathe</span>
              <span className="user-role">Merchandising Lead</span>
            </div>
            <ChevronDown size={14} className={`profile-chevron ${showProfileMenu ? 'rotate' : ''}`} />
          </button>

          {/* Interactive Profile Popup Card */}
          {showProfileMenu && (
            <div className="profile-dropdown-popover animate-fade-in" role="dialog">
              <div className="popover-user-info">
                <div className="popover-avatar-lg">
                  <span>SN</span>
                </div>
                <div className="popover-details">
                  <span className="popover-name">Shreyash Nathe</span>
                  <span className="popover-email">lead.merchandiser@shopstream.com</span>
                  <span className="popover-badge">
                    <Check size={10} /> Lead Merchandiser · Admin
                  </span>
                </div>
              </div>

              <div className="popover-divider"></div>

              <div className="popover-section">
                <div className="popover-item">
                  <Shield size={14} className="popover-icon" />
                  <div>
                    <span className="popover-item-title">Approval Authority</span>
                    <span className="popover-item-sub">Dynamic Pricing &amp; Inbound POs</span>
                  </div>
                </div>
                <div className="popover-item">
                  <Activity size={14} className="popover-icon" />
                  <div>
                    <span className="popover-item-title">Active Environment</span>
                    <span className="popover-item-sub">StockPulse Engine (Solo Evaluation)</span>
                  </div>
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
