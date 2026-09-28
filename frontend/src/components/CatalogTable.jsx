import React, { useState } from 'react';
import { ShoppingCart, Flame, SlidersHorizontal, Sparkles, RefreshCw, Radio } from 'lucide-react';

export default function CatalogTable({
  products,
  onSimulateSale,
  onSimulateSurge,
  onOpenStockModal,
  onSuggestPricing,
  onSuggestReorder,
  onOpenStreamModal,
  actionLoading
}) {
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredProducts = products.filter((item) => {
    const p = item.product;
    const matchesCat = categoryFilter === 'ALL' || p.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesCat && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="status-badge active">Active</span>;
      case 'PRICE_REVIEW_PENDING':
        return <span className="status-badge pending">Review Pending</span>;
      case 'OUT_OF_STOCK':
        return <span className="status-badge outofstock">Out of Stock</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  return (
    <div className="catalog-panel">
      <div className="catalog-toolbar">
        <div>
          <h2 className="section-title">ShopStream Catalog & Inventory Health</h2>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Real-time stock velocity, category margins, and agentic simulation controls
          </span>
        </div>

        <div className="filter-group">
          {/* Category Filter */}
          <button
            className={`filter-pill ${categoryFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setCategoryFilter('ALL')}
          >
            All Categories
          </button>
          <button
            className={`filter-pill ${categoryFilter === 'ELECTRONICS' ? 'active' : ''}`}
            onClick={() => setCategoryFilter('ELECTRONICS')}
          >
            Electronics
          </button>
          <button
            className={`filter-pill ${categoryFilter === 'APPAREL' ? 'active' : ''}`}
            onClick={() => setCategoryFilter('APPAREL')}
          >
            Apparel
          </button>
          <button
            className={`filter-pill ${categoryFilter === 'HOME' ? 'active' : ''}`}
            onClick={() => setCategoryFilter('HOME')}
          >
            Home
          </button>

          <span style={{ color: 'var(--border-highlight)', margin: '0 4px' }}>|</span>

          {/* Status Filter */}
          <button
            className={`filter-pill ${statusFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setStatusFilter('ALL')}
          >
            All Status
          </button>
          <button
            className={`filter-pill ${statusFilter === 'PRICE_REVIEW_PENDING' ? 'active' : ''}`}
            onClick={() => setStatusFilter('PRICE_REVIEW_PENDING')}
          >
            Review Pending
          </button>
          <button
            className={`filter-pill ${statusFilter === 'OUT_OF_STOCK' ? 'active' : ''}`}
            onClick={() => setStatusFilter('OUT_OF_STOCK')}
          >
            Out of Stock
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Product / SKU</th>
              <th>Category</th>
              <th>Current Price</th>
              <th>Cost / Margin Floor</th>
              <th>Stock Depth</th>
              <th>24h Velocity</th>
              <th>Lifecycle</th>
              <th style={{ textAlign: 'right' }}>Agentic Simulation & Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((item) => {
              const p = item.product;
              const ratio = p.stockLevel / p.reorderThreshold;
              const isLow = p.stockLevel < p.reorderThreshold;
              const isOut = p.stockLevel === 0;
              const isSurge = item.categoryAvgVelocity > 0 && p.demandVelocity >= (item.categoryAvgVelocity * 3.0);

              let stockClass = 'healthy';
              if (isOut) stockClass = 'critical';
              else if (isLow) stockClass = 'low';

              const barPercent = Math.min(100, Math.round((p.stockLevel / (p.reorderThreshold * 2.5)) * 100));

              return (
                <tr key={p.id}>
                  <td>
                    <div className="table-name">{p.name}</div>
                    <div className="table-sku">{p.sku} · ID: {p.id}</div>
                  </td>

                  <td>
                    <span className="table-category-tag">{p.category}</span>
                  </td>

                  <td>
                    <span className="price-cell">${p.currentPrice.toFixed(2)}</span>
                  </td>

                  <td>
                    {p.costPrice ? (
                      <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Cost: ${p.costPrice.toFixed(2)}</span>
                        <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
                          Floor: ${p.marginFloor ? p.marginFloor.toFixed(2) : 'N/A'}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Sprint 2 Seam</span>
                    )}
                  </td>

                  <td className="stock-meter-cell">
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ fontWeight: 600, color: isOut ? 'var(--accent-rose)' : isLow ? 'var(--accent-amber)' : 'inherit' }}>
                        {p.stockLevel} units
                      </span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                        Thresh: {p.reorderThreshold}
                      </span>
                    </div>
                    <div className="stock-bar-wrap">
                      <div
                        className={`stock-bar ${stockClass}`}
                        style={{ width: `${barPercent}%` }}
                      ></div>
                    </div>
                  </td>

                  <td>
                    <div className={`velocity-badge ${isSurge ? 'surge' : ''}`}>
                      {isSurge ? <Flame size={14} color="var(--accent-purple)" /> : null}
                      {p.demandVelocity} orders
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      Cat Avg: {item.categoryAvgVelocity ? item.categoryAvgVelocity.toFixed(1) : '0.0'}
                    </div>
                  </td>

                  <td>
                    {getStatusBadge(p.status)}
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <div className="action-btn-row" style={{ justifyContent: 'flex-end' }}>
                      {/* Simulate Sale Button */}
                      <button
                        className="action-icon-btn primary"
                        onClick={() => onSimulateSale(p.id)}
                        disabled={actionLoading === p.id}
                        title="Simulate 1 order (decrements stock, bumps velocity; auto-fires loop if below threshold)"
                      >
                        <ShoppingCart size={13} />
                        Sale (-1)
                      </button>

                      {/* Viral Surge Button */}
                      <button
                        className="action-icon-btn"
                        style={{ color: 'var(--accent-purple)', borderColor: 'rgba(168, 85, 247, 0.3)' }}
                        onClick={() => onSimulateSurge(p.id)}
                        disabled={actionLoading === p.id}
                        title="Simulate 5 orders surge (demonstrates demand spike trigger)"
                      >
                        <Flame size={13} />
                        Surge (+5)
                      </button>

                      {/* Update Stock Button */}
                      <button
                        className="action-icon-btn"
                        onClick={() => onOpenStockModal(p)}
                        title="Manually adjust stock level"
                      >
                        <SlidersHorizontal size={13} />
                        Stock
                      </button>

                      {/* On-Demand AI Pricing */}
                      <button
                        className="action-icon-btn"
                        onClick={() => onSuggestPricing(p.id)}
                        disabled={actionLoading === p.id}
                        title="Run on-demand pricing analysis"
                      >
                        <Sparkles size={13} />
                        AI Price
                      </button>

                      {/* Stream AI Reasoning (Bonus SSE) */}
                      <button
                        className="action-icon-btn"
                        style={{ color: 'var(--accent-cyan)', borderColor: 'rgba(6, 182, 212, 0.3)' }}
                        onClick={() => onOpenStreamModal(p)}
                        title="Stream live AI reasoning tokens via SSE (+5 pts bonus feature)"
                      >
                        <Radio size={13} />
                        Stream
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
