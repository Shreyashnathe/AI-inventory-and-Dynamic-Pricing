import React from 'react';
import { Package, AlertTriangle, FileCheck2, TrendingUp } from 'lucide-react';

export default function KpiSummary({ products, pricingSuggestions, reorderSuggestions }) {
  const totalSkus = products.length;
  const lowStockCount = products.filter(
    (p) => p.product.stockLevel < p.product.reorderThreshold
  ).length;

  const pendingPricing = pricingSuggestions.filter((s) => s.status === 'PENDING').length;
  const pendingReorder = reorderSuggestions.filter((s) => s.status === 'PENDING').length;
  const totalPending = pendingPricing + pendingReorder;

  const totalVelocity = products.reduce((acc, p) => acc + (p.product.demandVelocity || 0), 0);

  return (
    <div className="kpi-grid">
      <div className="kpi-card">
        <div className="kpi-content">
          <span className="kpi-label">Catalog SKUs</span>
          <span className="kpi-value">{totalSkus}</span>
          <span className="kpi-subtext">3 Active Categories</span>
        </div>
        <div className="kpi-icon-wrap" style={{ background: 'rgba(6, 182, 212, 0.12)', color: 'var(--accent-cyan)' }}>
          <Package size={22} />
        </div>
      </div>

      <div className="kpi-card">
        <div className="kpi-content">
          <span className="kpi-label">Low Stock Triggers</span>
          <span className="kpi-value" style={{ color: lowStockCount > 0 ? 'var(--accent-amber)' : 'inherit' }}>
            {lowStockCount}
          </span>
          <span className="kpi-subtext">Below Safety Threshold</span>
        </div>
        <div className="kpi-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.12)', color: 'var(--accent-amber)' }}>
          <AlertTriangle size={22} />
        </div>
      </div>

      <div className="kpi-card">
        <div className="kpi-content">
          <span className="kpi-label">Pending AI Approvals</span>
          <span className="kpi-value" style={{ color: totalPending > 0 ? 'var(--accent-emerald)' : 'inherit' }}>
            {totalPending}
          </span>
          <span className="kpi-subtext">
            {pendingPricing} Pricing · {pendingReorder} Reorders
          </span>
        </div>
        <div className="kpi-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--accent-emerald)' }}>
          <FileCheck2 size={22} />
        </div>
      </div>

      <div className="kpi-card">
        <div className="kpi-content">
          <span className="kpi-label">24h Demand Velocity</span>
          <span className="kpi-value">{totalVelocity}</span>
          <span className="kpi-subtext">Units Sold in Last 24h</span>
        </div>
        <div className="kpi-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.12)', color: 'var(--accent-indigo)' }}>
          <TrendingUp size={22} />
        </div>
      </div>
    </div>
  );
}
