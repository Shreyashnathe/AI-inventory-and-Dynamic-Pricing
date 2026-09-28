import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Flame, 
  Sparkles, 
  SlidersHorizontal, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Clock,
  Layers,
  Search,
  Filter,
  ArrowUpRight,
  TrendingUp,
  Cpu,
  Shirt,
  Home as HomeIcon,
  Tag
} from 'lucide-react';

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
  const [tableSearch, setTableSearch] = useState('');

  // Extract raw products
  const rawList = products.map((item) => item.product || item);

  // Compute catalog summary counts
  const totalCount = products.length;
  const lowCount = products.filter(item => {
    const p = item.product || item;
    return (p.stockLevel || 0) > 0 && (p.stockLevel || 0) < (p.reorderThreshold || 0);
  }).length;
  const outCount = products.filter(item => {
    const p = item.product || item;
    return (p.stockLevel || 0) === 0;
  }).length;
  const pendingCount = products.filter(item => {
    const p = item.product || item;
    return p.status === 'PRICE_REVIEW_PENDING';
  }).length;
  const healthyCount = totalCount - lowCount - outCount;

  // Filter products
  const filteredProducts = products.filter((item) => {
    const p = item.product || item;
    const matchesCat = categoryFilter === 'ALL' || p.category === categoryFilter;
    
    let matchesStatus = true;
    if (statusFilter === 'LOW_STOCK') {
      matchesStatus = (p.stockLevel || 0) > 0 && (p.stockLevel || 0) < (p.reorderThreshold || 0);
    } else if (statusFilter === 'OUT_OF_STOCK') {
      matchesStatus = (p.stockLevel || 0) === 0;
    } else if (statusFilter === 'PENDING') {
      matchesStatus = p.status === 'PRICE_REVIEW_PENDING';
    } else if (statusFilter === 'ACTIVE') {
      matchesStatus = p.status === 'ACTIVE';
    }

    let matchesSearch = true;
    if (tableSearch.trim()) {
      const q = tableSearch.toLowerCase();
      matchesSearch = (
        p.name?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.id?.toLowerCase().includes(q)
      );
    }

    return matchesCat && matchesStatus && matchesSearch;
  });

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'ELECTRONICS':
        return <Cpu size={16} className="cat-icon elec" />;
      case 'APPAREL':
        return <Shirt size={16} className="cat-icon app" />;
      case 'HOME':
        return <HomeIcon size={16} className="cat-icon home" />;
      default:
        return <Tag size={16} className="cat-icon" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="status-pill active">
            <span className="pill-dot green"></span> Active
          </span>
        );
      case 'PRICE_REVIEW_PENDING':
        return (
          <span className="status-pill pending animate-pulse" title="AI recommendation queued in approval queue">
            <Clock size={12} /> Review Pending
          </span>
        );
      case 'OUT_OF_STOCK':
        return (
          <span className="status-pill out">
            <span className="pill-dot red"></span> Out of Stock
          </span>
        );
      default:
        return <span className="status-pill">{status}</span>;
    }
  };

  return (
    <div className="catalog-panel">
      {/* 1. Header with Catalog Summary KPI Badges */}
      <div className="catalog-header-top">
        <div className="catalog-title-block">
          <div className="title-with-pill">
            <h2 className="catalog-main-title">ShopStream Catalog &amp; Inventory Health</h2>
            <span className="benchmark-pill">Addendum A Seed · 8 SKUs</span>
          </div>
          <p className="catalog-sub-text">
            Autonomous monitoring of inventory levels, demand velocity, margin floors, and agentic triggers.
          </p>
        </div>

        {/* Quick Stock Health Summary Badges */}
        <div className="catalog-quick-stats">
          <div className="quick-stat-badge healthy" title="Stock at or above reorder threshold">
            <CheckCircle2 size={14} />
            <span>{healthyCount} Healthy</span>
          </div>
          <div className="quick-stat-badge low" title="Stock below reorder threshold (Triggers loop)">
            <AlertTriangle size={14} />
            <span>{lowCount} Low Stock Alert</span>
          </div>
          <div className="quick-stat-badge out" title="Zero units in stock">
            <XCircle size={14} />
            <span>{outCount} Out of Stock</span>
          </div>
          {pendingCount > 0 && (
            <div className="quick-stat-badge pending" title="AI pricing or reorder review pending">
              <Clock size={14} />
              <span>{pendingCount} Review Pending</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Filter & Search Toolbar */}
      <div className="catalog-toolbar">
        {/* Category Filter Pills */}
        <div className="filter-group">
          <span className="filter-label"><Filter size={13} /> Category:</span>
          {['ALL', 'ELECTRONICS', 'APPAREL', 'HOME'].map((cat) => (
            <button
              key={cat}
              className={`filter-pill ${categoryFilter === cat ? 'active' : ''}`}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat === 'ALL' ? 'All Categories' : cat.charAt(0) + cat.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Status Filter Pills */}
        <div className="filter-group">
          <span className="filter-label">Health:</span>
          {[
            { id: 'ALL', label: 'All' },
            { id: 'LOW_STOCK', label: 'Low Alert (< Thresh)' },
            { id: 'PENDING', label: 'Review Pending' },
            { id: 'OUT_OF_STOCK', label: 'Depleted' }
          ].map((st) => (
            <button
              key={st.id}
              className={`filter-pill ${statusFilter === st.id ? 'active' : ''}`}
              onClick={() => setStatusFilter(st.id)}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Quick Filter Search */}
        <div className="table-quick-search">
          <Search size={14} className="search-icon-sm" />
          <input 
            type="text"
            placeholder="Filter table rows..."
            value={tableSearch}
            onChange={(e) => setTableSearch(e.target.value)}
          />
        </div>
      </div>

      {/* 3. Catalog Data Table */}
      <div className="table-responsive-wrapper">
        <table className="catalog-table">
          <thead>
            <tr>
              <th>Product &amp; SKU</th>
              <th>Category</th>
              <th>Current Price &amp; Margin</th>
              <th>Stock Level &amp; Health</th>
              <th>Demand Velocity</th>
              <th>Lifecycle</th>
              <th style={{ textAlign: 'right' }}>Agentic Simulation &amp; AI Controls</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No products found matching the selected filters.
                </td>
              </tr>
            ) : (
              filteredProducts.map((item) => {
                const p = item.product || item;
                const isLow = (p.stockLevel || 0) < (p.reorderThreshold || 0) && (p.stockLevel || 0) > 0;
                const isOut = (p.stockLevel || 0) === 0;
                const isSurge = item.categoryAvgVelocity > 0 && (p.demandVelocity || 0) >= (item.categoryAvgVelocity * 3.0);

                let stockClass = 'healthy';
                if (isOut) stockClass = 'critical';
                else if (isLow) stockClass = 'low';

                const maxScale = Math.max(100, (p.reorderThreshold || 20) * 3);
                const barPercent = Math.min(100, Math.round(((p.stockLevel || 0) / maxScale) * 100));

                return (
                  <tr key={p.id} className={`table-row ${isLow ? 'row-low-alert' : ''}`}>
                    {/* 1. Product & SKU */}
                    <td>
                      <div className="product-cell-container">
                        <div className="category-icon-box">
                          {getCategoryIcon(p.category)}
                        </div>
                        <div className="product-names">
                          <span className="table-name">{p.name}</span>
                          <div className="sku-id-row">
                            <span className="table-sku">{p.sku}</span>
                            <span className="sku-sep">·</span>
                            <span className="table-id">{p.id}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 2. Category Badge */}
                    <td>
                      <span className={`table-category-tag ${p.category?.toLowerCase()}`}>
                        {p.category}
                      </span>
                    </td>

                    {/* 3. Price & Margin Floors (Sprint 2 Extension Seam) */}
                    <td>
                      <div className="price-margin-cell">
                        <span className="price-cell">${(p.currentPrice || 0).toFixed(2)}</span>
                        {p.costPrice ? (
                          <div className="margin-seam-info" title="Sprint 2 Margin Guardrail: Price cannot drop below floor">
                            <span>Cost: ${(p.costPrice || 0).toFixed(2)}</span>
                            <span className="floor-tag">Floor: ${(p.marginFloor || 0).toFixed(2)}</span>
                          </div>
                        ) : (
                          <span className="margin-seam-info empty">Margin Floor: Configured</span>
                        )}
                      </div>
                    </td>

                    {/* 4. Stock Level & Visual Meter */}
                    <td className="stock-meter-cell">
                      <div className="stock-label-row">
                        <span className={`stock-count ${isOut ? 'text-red' : isLow ? 'text-amber' : 'text-green'}`}>
                          {p.stockLevel} units
                        </span>
                        <span className="stock-threshold-label">
                          Threshold: {p.reorderThreshold}
                        </span>
                      </div>
                      <div className="stock-bar-wrap">
                        <div
                          className={`stock-bar ${stockClass}`}
                          style={{ width: `${barPercent}%` }}
                        ></div>
                      </div>
                      <div className="stock-health-text">
                        {isOut ? (
                          <span className="health-tag out"><XCircle size={10} /> Out of Stock</span>
                        ) : isLow ? (
                          <span className="health-tag low"><AlertTriangle size={10} /> Low Stock Alert</span>
                        ) : (
                          <span className="health-tag healthy"><CheckCircle2 size={10} /> In Stock</span>
                        )}
                      </div>
                    </td>

                    {/* 5. Demand Velocity */}
                    <td>
                      <div className="velocity-cell-wrap">
                        <div className={`velocity-badge ${isSurge ? 'surge' : ''}`}>
                          {isSurge && <Flame size={13} className="surge-icon" />}
                          <span>{p.demandVelocity || 0} orders</span>
                        </div>
                        <span className="cat-avg-text">
                          Cat Avg: {item.categoryAvgVelocity ? item.categoryAvgVelocity.toFixed(1) : '2.0'} /24h
                        </span>
                      </div>
                    </td>

                    {/* 6. Lifecycle Status */}
                    <td>
                      {getStatusBadge(p.status)}
                    </td>

                    {/* 7. Agentic Action Controls */}
                    <td style={{ textAlign: 'right' }}>
                      <div className="action-btn-row">
                        {/* Simulate Sale (-1 Stock, +1 Velocity) */}
                        <button
                          className="action-icon-btn primary-sale"
                          onClick={() => onSimulateSale(p.id)}
                          disabled={actionLoading === p.id}
                          title="Simulate 1 customer sale (decrements stock; fires agentic loop if stock < threshold)"
                        >
                          <ShoppingCart size={13} />
                          <span>Sale (-1)</span>
                        </button>

                        {/* Viral Surge (+20 Velocity) */}
                        <button
                          className="action-icon-btn surge-btn"
                          onClick={() => onSimulateSurge(p.id)}
                          disabled={actionLoading === p.id}
                          title="Simulate viral spike (surges velocity past 3x category average, triggers DEMAND_SPIKE)"
                        >
                          <Flame size={13} />
                          <span>Surge (+20)</span>
                        </button>

                        {/* Real-time SSE Token Stream (Bonus +5 pts) */}
                        <button
                          className="action-icon-btn stream-btn"
                          onClick={() => onOpenStreamModal(p)}
                          title="Stream live AI reasoning tokens in real-time via Server-Sent Events"
                        >
                          <Sparkles size={13} />
                          <span>⚡ Stream</span>
                        </button>

                        {/* Adjust Stock */}
                        <button
                          className="action-icon-btn adjust-btn"
                          onClick={() => onOpenStockModal(p)}
                          title="Manually adjust stock level"
                        >
                          <SlidersHorizontal size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 4. Table Footer with Pagination / Status metadata */}
      <div className="catalog-table-footer">
        <span className="footer-count">
          Showing <strong>{filteredProducts.length}</strong> of <strong>{totalCount}</strong> products in catalog
        </span>
        <span className="footer-legend">
          Click <strong>Sale (-1)</strong> to watch the autonomous agentic loop fire when stock breaches threshold
        </span>
      </div>
    </div>
  );
}
