import React from 'react';
import { 
  BarChart3, 
  Package, 
  CheckSquare, 
  TrendingUp, 
  Settings, 
  ChevronDown, 
  Sparkles, 
  ShieldCheck,
  Zap,
  Layers
} from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  pendingCount = 0,
  strategyMode = 'AI_POWERED'
}) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'catalog', label: 'Catalog & Stock', icon: Package },
    { id: 'approvals', label: 'Pending Approvals', icon: CheckSquare, badge: pendingCount },
    { id: 'analytics', label: 'Sales & Trends', icon: TrendingUp },
    { id: 'strategy', label: 'Strategy Engine', icon: Settings },
  ];

  return (
    <aside className="devias-sidebar">
      {/* Brand & Workspace Switcher */}
      <div className="sidebar-brand-section">
        <div className="brand-logo-container">
          <div className="brand-icon-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="24" height="24" rx="6" fill="#6366F1" />
              <path d="M7 16L12 8L17 16H7Z" fill="white" />
            </svg>
          </div>
          <div className="brand-text-block">
            <span className="brand-name">Devias Kit</span>
            <span className="brand-sub">StockPulse Engine</span>
          </div>
        </div>

        {/* Workspace selector widget from Devias Kit */}
        <div className="workspace-pill">
          <div className="workspace-info">
            <span className="workspace-title">ShopStream</span>
            <span className="workspace-tier">Production</span>
          </div>
          <ChevronDown size={16} className="workspace-chevron" />
        </div>
      </div>

      {/* Navigation List */}
      <nav className="sidebar-nav">
        <div className="nav-group-label">OPERATIONS</div>
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

      {/* Engine Status Card */}
      <div className="sidebar-footer">
        <div className="engine-status-card">
          <div className="engine-status-head">
            <span className="engine-status-dot"></span>
            <span className="engine-status-title">Agentic Loop Active</span>
          </div>
          <p className="engine-status-desc">
            Autonomous reactivity listening on inventory signals &amp; sales velocity.
          </p>
          <div className="engine-mode-tag">
            <Zap size={12} className="tag-icon" />
            <span>Mode: {strategyMode === 'AI_POWERED' ? 'Qwen-Cursor AI' : 'Deterministic Rules'}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
