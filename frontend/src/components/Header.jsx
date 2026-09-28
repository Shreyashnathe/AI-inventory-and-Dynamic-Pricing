import React from 'react';
import { 
  Search, 
  Users, 
  Bell, 
  RotateCcw, 
  Zap, 
  ShieldCheck, 
  Sparkles,
  SlidersHorizontal
} from 'lucide-react';

export default function Header({ 
  searchQuery, 
  setSearchQuery, 
  strategy, 
  onToggleStrategy, 
  onResetData, 
  pendingCount = 0 
}) {
  const isAi = strategy?.mode === 'AI_POWERED';

  return (
    <header className="devias-header">
      {/* Search Input Bar */}
      <div className="header-search-wrap">
        <Search size={18} className="search-icon" />
        <input 
          type="text"
          className="search-input"
          placeholder="Search products, SKUs, categories, or triggers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Right Header Actions */}
      <div className="header-actions">
        {/* Strategy Switcher Button (Live Runtime Switching) */}
        <button 
          className={`strategy-toggle-pill ${isAi ? 'ai-active' : 'rules-active'}`}
          onClick={onToggleStrategy}
          title="Click to toggle between AI-Powered and Rule-Based engine without restart"
        >
          {isAi ? (
            <>
              <Sparkles size={14} className="strategy-icon animate-pulse" />
              <span className="strategy-text">AI Powered (Qwen)</span>
            </>
          ) : (
            <>
              <ShieldCheck size={14} className="strategy-icon" />
              <span className="strategy-text">Rule-Based Fallback</span>
            </>
          )}
          <span className="switch-hint">Switch</span>
        </button>

        {/* Database Benchmark Reset */}
        <button 
          className="header-icon-button"
          onClick={onResetData}
          title="Reset database to Addendum A benchmark state"
        >
          <RotateCcw size={18} />
        </button>

        {/* Collaborators / Team Icon from Devias Kit */}
        <button className="header-icon-button" title="Merchandising Team Active (Solo Mode)">
          <Users size={18} />
        </button>

        {/* Notification Bell with Badge */}
        <div className="notification-bell-container">
          <button className="header-icon-button" title="Pending Recommendations">
            <Bell size={18} />
            {pendingCount > 0 && (
              <span className="bell-badge">{pendingCount}</span>
            )}
          </button>
        </div>

        {/* User Profile Avatar with Online Dot from Devias Kit */}
        <div className="user-profile-menu">
          <div className="avatar-wrapper">
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80" 
              alt="Merchandising Manager" 
              className="user-avatar"
            />
            <span className="avatar-online-dot"></span>
          </div>
        </div>
      </div>
    </header>
  );
}
