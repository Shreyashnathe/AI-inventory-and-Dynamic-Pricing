import React from 'react';
import { Check, X, ArrowRight, TrendingUp, TrendingDown, Minus, Clock, ShieldAlert, Sparkles } from 'lucide-react';

export default function ApprovalQueue({
  pricingSuggestions,
  reorderSuggestions,
  onActionPricing,
  onActionReorder,
  actionLoading
}) {
  const pendingPricing = pricingSuggestions.filter((s) => s.status === 'PENDING');
  const pendingReorder = reorderSuggestions.filter((s) => s.status === 'PENDING');
  const totalCount = pendingPricing.length + pendingReorder.length;

  const renderTriggerBadge = (reason) => {
    switch (reason) {
      case 'INVENTORY_LOW':
        return (
          <span className="trigger-badge low">
            <ShieldAlert size={12} /> Low Stock Trigger
          </span>
        );
      case 'DEMAND_SPIKE':
        return (
          <span className="trigger-badge spike">
            <TrendingUp size={12} /> Demand Spike Trigger
          </span>
        );
      case 'MANUAL':
        return (
          <span className="trigger-badge manual">
            <Sparkles size={12} /> On-Demand AI
          </span>
        );
      default:
        return <span className="trigger-badge manual">{reason}</span>;
    }
  };

  const getDirectionIcon = (dir) => {
    if (dir === 'INCREASE') return <TrendingUp size={16} color="var(--accent-emerald)" />;
    if (dir === 'DECREASE') return <TrendingDown size={16} color="var(--accent-rose)" />;
    return <Minus size={16} color="var(--text-muted)" />;
  };

  return (
    <div style={{ marginBottom: '36px' }}>
      <div className="section-header">
        <h2 className="section-title">
          <span>Commerce Advisor Approval Queue</span>
          <span className="counter-pill">{totalCount} Pending Reviews</span>
        </h2>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Human-in-the-Loop Checkpoint · Prices & Inbound POs require merchant sign-off
        </span>
      </div>

      {totalCount === 0 ? (
        <div className="empty-queue">
          <Check size={32} color="var(--accent-emerald)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '16px', color: 'var(--text-primary)', marginBottom: '4px' }}>
            Queue is Clear
          </h3>
          <p style={{ fontSize: '13px' }}>
            All inventory levels are balanced. Simulate a sale or viral surge below to watch the autonomous agentic loop fire!
          </p>
        </div>
      ) : (
        <div className="queue-grid">
          {/* Pricing Suggestions */}
          {pendingPricing.map((item) => {
            const priceDiff = (item.recommendedPrice - item.currentPrice).toFixed(2);
            const percentDiff = (
              ((item.recommendedPrice - item.currentPrice) / item.currentPrice) *
              100
            ).toFixed(1);

            return (
              <div key={`price-${item.id}`} className="suggestion-card pricing animate-fade-in">
                <div className="card-top-bar">
                  <div className="product-ref">
                    <span className="sku-badge">{item.product.sku} · {item.product.category}</span>
                    <span className="product-item-name">{item.product.name}</span>
                  </div>
                  {renderTriggerBadge(item.triggerReason)}
                </div>

                <div className="metric-delta-row">
                  <div className="delta-item">
                    <span className="delta-label">Current Price</span>
                    <span className="delta-val old">${item.currentPrice.toFixed(2)}</span>
                  </div>

                  <span className="delta-arrow">
                    <ArrowRight size={18} />
                  </span>

                  <div className="delta-item">
                    <span className="delta-label">Recommended Price</span>
                    <span className="delta-val target">
                      ${item.recommendedPrice.toFixed(2)}
                    </span>
                  </div>

                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {getDirectionIcon(item.changeDirection)}
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: item.changeDirection === 'INCREASE' ? 'var(--accent-emerald)' : 'var(--text-secondary)'
                      }}
                    >
                      {item.changeDirection === 'INCREASE' ? `+${percentDiff}%` : `${percentDiff}%`}
                    </span>
                  </div>
                </div>

                {/* Confidence meter */}
                <div className="confidence-section">
                  <span className="confidence-text">AI Confidence</span>
                  <div className="confidence-bar-bg">
                    <div
                      className="confidence-bar-fill"
                      style={{ width: `${Math.round(item.confidence * 100)}%` }}
                    ></div>
                  </div>
                  <span className="confidence-text">{Math.round(item.confidence * 100)}%</span>
                </div>

                {/* Reasoning Box */}
                <div className="reasoning-box">
                  <strong>Strategic Rationale:</strong> {item.reasoning}
                </div>

                {/* Action Buttons */}
                <div className="card-actions">
                  <button
                    className="btn-accept"
                    onClick={() => onActionPricing(item.id, 'ACCEPTED')}
                    disabled={actionLoading === item.id}
                  >
                    <Check size={16} /> Accept & Publish Price
                  </button>
                  <button
                    className="btn-reject"
                    onClick={() => onActionPricing(item.id, 'REJECTED')}
                    disabled={actionLoading === item.id}
                  >
                    <X size={16} /> Reject
                  </button>
                </div>
              </div>
            );
          })}

          {/* Reorder Suggestions */}
          {pendingReorder.map((item) => (
            <div key={`reorder-${item.id}`} className="suggestion-card reorder animate-fade-in">
              <div className="card-top-bar">
                <div className="product-ref">
                  <span className="sku-badge">{item.product.sku} · {item.product.category}</span>
                  <span className="product-item-name">{item.product.name}</span>
                </div>
                {renderTriggerBadge(item.triggerReason)}
              </div>

              <div className="metric-delta-row">
                <div className="delta-item">
                  <span className="delta-label">Current Stock</span>
                  <span className="delta-val" style={{ color: 'var(--accent-amber)' }}>
                    {item.currentStock} units
                  </span>
                </div>

                <span className="delta-arrow">
                  <ArrowRight size={18} />
                </span>

                <div className="delta-item">
                  <span className="delta-label">Recommended PO</span>
                  <span className="delta-val target">
                    +{item.recommendedQuantity} units
                  </span>
                </div>

                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
                  <Clock size={14} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                    {item.suggestedLeadTimeDays}d lead
                  </span>
                </div>
              </div>

              {/* Confidence meter */}
              <div className="confidence-section">
                <span className="confidence-text">Replenishment Confidence</span>
                <div className="confidence-bar-bg">
                  <div
                    className="confidence-bar-fill"
                    style={{ width: `${Math.round(item.confidence * 100)}%` }}
                  ></div>
                </div>
                <span className="confidence-text">{Math.round(item.confidence * 100)}%</span>
              </div>

              {/* Reasoning Box */}
              <div className="reasoning-box">
                <strong>Replenishment Rationale:</strong> {item.reasoning}
              </div>

              {/* Action Buttons */}
              <div className="card-actions">
                <button
                  className="btn-accept"
                  style={{ background: 'var(--accent-amber)', color: '#451a03' }}
                  onClick={() => onActionReorder(item.id, 'ACCEPTED')}
                  disabled={actionLoading === item.id}
                >
                  <Check size={16} /> Accept & Simulate Inbound
                </button>
                <button
                  className="btn-reject"
                  onClick={() => onActionReorder(item.id, 'REJECTED')}
                  disabled={actionLoading === item.id}
                >
                  <X size={16} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
