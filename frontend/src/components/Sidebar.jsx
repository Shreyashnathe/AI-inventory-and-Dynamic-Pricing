import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  CheckSquare, 
  Sliders, 
  Zap,
  TrendingUp,
  Cpu
} from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  pendingCount = 0,
  strategyMode = 'AI_POWERED'
}) {
  const navItems = [
    { id: 'overview', label: 'Overview & Console', icon: LayoutDashboard },
    { id: 'catalog', label: 'Catalog & Inventory Health', icon: Package },
    { id: 'approvals', label: 'Approval Queue', icon: CheckSquare, badge: pendingCount },
    { id: 'strategy', label: 'Commerce Engine', icon: Cpu },
  ];

  return (
    <aside className="devias-sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand-section">
        <div className="brand-logo-container">
          <div className="brand-icon-logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="24" height="24" rx="6" fill="#6366F1" />
              <path d="M7 16L12 8L17 16H7Z" fill="white" />
            </svg>
          </div>
          <div className="brand-text-block">
            <span className="brand-name">StockPulse</span>
            <span className="brand-sub">AI Commerce Advisor</span>
          </div>
        </div>

        {/* Store Context Pill */}
        <div className="workspace-pill">
          <div className="workspace-info">
            <span className="workspace-title">ShopStream Catalog</span>
            <span className="workspace-tier">Production · Addendum A</span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-group-label">MERCHANDISING CONSOLE</div>
        <ul className="nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <button
                  className={`nav-button ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <Icon size={18} className="nav-icon" />
                  <span className="nav-label">{item.label}</span>
                  {item.badge > 0 && (
                    <span className="nav-badge">{item.badge}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Reactive Loop Engine Status */}
      <div className="sidebar-footer">
        <div className="engine-status-card">
          <div className="engine-status-head">
            <span className="engine-status-dot"></span>
            <span className="engine-status-title">Agentic Loop Online</span>
          </div>
          <p className="engine-status-desc">
            Observes stock drops &amp; demand spikes. Auto-queues pricing &amp; reorders for approval.
          </p>
          <div className="engine-mode-tag">
            <Zap size={12} className="tag-icon" />
            <span>LLM: {strategyMode === 'AI_POWERED' ? 'Qwen-Cursor Active' : 'Rule-Based Active'}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
