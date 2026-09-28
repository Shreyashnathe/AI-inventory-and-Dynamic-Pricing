import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import KpiSummary from './components/KpiSummary';
import AnalyticsSection from './components/AnalyticsSection';
import ApprovalQueue from './components/ApprovalQueue';
import CatalogTable from './components/CatalogTable';
import StreamModal from './components/StreamModal';
import StockUpdateModal from './components/StockUpdateModal';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [pricingSuggestions, setPricingSuggestions] = useState([]);
  const [reorderSuggestions, setReorderSuggestions] = useState([]);
  const [strategy, setStrategy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBackendOnline, setIsBackendOnline] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);

  const [streamProduct, setStreamProduct] = useState(null);
  const [stockModalProduct, setStockModalProduct] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const [prodRes, priceRes, reorderRes, stratRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/pricing-suggestions'),
        fetch('/api/reorder-suggestions'),
        fetch('/api/strategy')
      ]);

      if (prodRes.ok) {
        setProducts(await prodRes.json());
        setIsBackendOnline(true);
      } else {
        setIsBackendOnline(false);
      }
      if (priceRes.ok) setPricingSuggestions(await priceRes.json());
      if (reorderRes.ok) setReorderSuggestions(await reorderRes.json());
      if (stratRes.ok) setStrategy(await stratRes.json());
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setIsBackendOnline(false);
      if (!isSilent) showToast('Could not connect to Spring Boot backend on port 8080.', 'error');
    } finally {
      if (!isSilent) setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Auto-poll every 3 seconds to surface asynchronous agentic loop updates
    const interval = setInterval(() => {
      fetchData(true);
    }, 3000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Manual refresh trigger
  const handleRefreshData = () => {
    setRefreshing(true);
    fetchData(false);
    showToast('Refreshing catalog and suggestion data...', 'info');
  };

  // Switch strategy runtime
  const handleToggleStrategy = async () => {
    const currentMode = strategy?.mode || 'AI_POWERED';
    const nextMode = currentMode === 'AI_POWERED' ? 'RULE_BASED' : 'AI_POWERED';
    try {
      const res = await fetch('/api/strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: nextMode })
      });
      if (res.ok) {
        const updated = await res.json();
        setStrategy(updated);
        setIsBackendOnline(true);
        showToast(`Strategy switched to ${updated.mode} (Zero-downtime hot swap)!`, 'success');
      } else {
        showToast(`Server returned ${res.status} while switching strategy.`, 'error');
      }
    } catch (err) {
      setIsBackendOnline(false);
      showToast('Backend offline: Could not reach port 8080 to switch strategy.', 'error');
    }
  };

  // Reset benchmark data
  const handleResetData = async () => {
    try {
      const res = await fetch('/api/admin/reset-data', { method: 'POST' });
      if (res.ok) {
        setIsBackendOnline(true);
        showToast('Database reset to canonical Addendum A benchmark state!', 'success');
        fetchData(false);
      } else {
        showToast(`Failed to reset database (Status ${res.status})`, 'error');
      }
    } catch (err) {
      setIsBackendOnline(false);
      showToast('Backend offline: Could not connect to port 8080 to reset benchmark.', 'error');
    }
  };

  // Simulate Sale (-1 Stock, +1 Velocity) -> Triggers Agentic Loop
  const handleSimulateSale = async (productId) => {
    setActionLoading(productId);
    try {
      const res = await fetch(`/api/products/${productId}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: 1 })
      });
      if (res.ok) {
        showToast('Simulated sale recorded. Asynchronous agentic loop activated!', 'info');
        setTimeout(() => fetchData(true), 800);
      }
    } catch (err) {
      showToast('Failed to simulate order', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Simulate Viral Surge (+20 Velocity) -> Triggers Demand Spike
  const handleSimulateSurge = async (productId) => {
    setActionLoading(productId);
    try {
      const res = await fetch(`/api/products/${productId}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: 20 })
      });
      if (res.ok) {
        showToast('Demand Surge triggered! Agentic loop queuing DEMAND_SPIKE recommendations...', 'info');
        setTimeout(() => fetchData(true), 800);
      }
    } catch (err) {
      showToast('Failed to simulate surge', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Accept/Reject Pricing Suggestion
  const handleActionPricing = async (suggestionId, status) => {
    setActionLoading(`price-${suggestionId}`);
    try {
      const res = await fetch(`/api/pricing-suggestions/${suggestionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        showToast(`Pricing suggestion ${status.toLowerCase()}! Live catalog updated.`, 'success');
        fetchData(true);
      }
    } catch (err) {
      showToast(`Failed to ${status.toLowerCase()} pricing suggestion`, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Accept/Reject Reorder Suggestion
  const handleActionReorder = async (suggestionId, status) => {
    setActionLoading(`reorder-${suggestionId}`);
    try {
      const res = await fetch(`/api/reorder-suggestions/${suggestionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        showToast(`Reorder suggestion ${status.toLowerCase()}! Simulated inbound stock received.`, 'success');
        fetchData(true);
      }
    } catch (err) {
      showToast(`Failed to ${status.toLowerCase()} reorder suggestion`, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Manual On-demand Pricing trigger
  const handleSuggestPricing = async (productId) => {
    setActionLoading(`suggest-price-${productId}`);
    try {
      const res = await fetch(`/api/products/${productId}/suggest-pricing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ triggerReason: 'MANUAL' })
      });
      if (res.ok) {
        showToast('AI Pricing Recommendation generated and queued!', 'success');
        fetchData(true);
      }
    } catch (err) {
      showToast('Failed to generate pricing recommendation', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Manual On-demand Reorder trigger
  const handleSuggestReorder = async (productId) => {
    setActionLoading(`suggest-reorder-${productId}`);
    try {
      const res = await fetch(`/api/products/${productId}/suggest-reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ triggerReason: 'MANUAL' })
      });
      if (res.ok) {
        showToast('AI Replenishment Recommendation generated and queued!', 'success');
        fetchData(true);
      }
    } catch (err) {
      showToast('Failed to generate reorder recommendation', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Direct Stock Patch
  const handleStockUpdateSave = async (productId, newStock) => {
    try {
      const res = await fetch(`/api/products/${productId}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newStock })
      });
      if (res.ok) {
        showToast(`Stock level adjusted to ${newStock}. Inventory signals processed.`, 'success');
        setStockModalProduct(null);
        setTimeout(() => fetchData(true), 600);
      }
    } catch (err) {
      showToast('Failed to update stock', 'error');
    }
  };

  const pendingPricing = pricingSuggestions.filter((s) => s.status === 'PENDING');
  const pendingReorder = reorderSuggestions.filter((s) => s.status === 'PENDING');
  const pendingTotal = pendingPricing.length + pendingReorder.length;

  // Filter products by search query
  const rawProductList = products.map((item) => item.product || item);
  const filteredProducts = products.filter((item) => {
    const p = item.product || item;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="devias-app-layout">
      {/* 1. LEFT SIDEBAR */}
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCount={pendingTotal}
        strategyMode={strategy?.mode}
      />

      {/* 2. MAIN CONTAINER */}
      <div className="devias-main-container">
        {/* Top Header */}
        <Header 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          strategy={strategy}
          onToggleStrategy={handleToggleStrategy}
          onResetData={handleResetData}
          onRefreshData={handleRefreshData}
          isBackendOnline={isBackendOnline}
          refreshing={refreshing}
          pendingCount={pendingTotal}
        />

        {/* Backend Offline Warning Banner */}
        {!isBackendOnline && (
          <div className="backend-offline-banner animate-fade-in">
            <div className="offline-banner-content">
              <span className="offline-badge">⚠️ Backend Offline</span>
              <span>Spring Boot server is not responding on <strong>port 8080</strong>. Run <code>.\mvnw.cmd spring-boot:run</code> in the <code>backend</code> directory to connect.</span>
            </div>
            <button type="button" className="offline-retry-btn" onClick={handleRefreshData}>
              Retry Connection
            </button>
          </div>
        )}

        {/* Content Body */}
        <main className="devias-content-body">
          {/* Top 4 KPI Metric Cards (Always visible on Overview, Analytics) */}
          {(activeTab === 'overview' || activeTab === 'analytics') && (
            <KpiSummary 
              products={rawProductList} 
              pendingCount={pendingTotal} 
            />
          )}

          {/* Analytics Visualizations (Sales Bar Chart & Stock Health Donut) */}
          {(activeTab === 'overview' || activeTab === 'analytics') && (
            <AnalyticsSection 
              products={rawProductList}
              onSync={() => fetchData(true)} 
            />
          )}

          {/* Approval Queue (Action Center) */}
          {(activeTab === 'overview' || activeTab === 'approvals') && (
            <ApprovalQueue 
              pricingSuggestions={pricingSuggestions}
              reorderSuggestions={reorderSuggestions}
              onActionPricing={handleActionPricing}
              onActionReorder={handleActionReorder}
              actionLoading={actionLoading}
            />
          )}

          {/* Catalog Matrix */}
          {(activeTab === 'overview' || activeTab === 'catalog') && (
            <CatalogTable 
              products={filteredProducts}
              onSimulateSale={handleSimulateSale}
              onSimulateSurge={handleSimulateSurge}
              onOpenStockModal={(prod) => setStockModalProduct(prod)}
              onSuggestPricing={handleSuggestPricing}
              onSuggestReorder={handleSuggestReorder}
              onOpenStreamModal={(prod) => setStreamProduct(prod)}
              actionLoading={actionLoading}
            />
          )}

          {/* Strategy Engine Tab Details */}
          {activeTab === 'strategy' && (
            <div className="catalog-panel" style={{ padding: '32px' }}>
              <h2 className="section-main-title" style={{ marginBottom: '12px' }}>
                Pluggable Commerce Engine Settings
              </h2>
              <p style={{ color: 'var(--text-body)', fontSize: '14px', marginBottom: '24px' }}>
                Active Mode: <strong>{strategy?.mode}</strong> — Switchable dynamically at runtime without restarting the container.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ padding: '20px', background: '#f9fafb', borderRadius: '12px', border: '1px solid #eaecf0' }}>
                  <h4 style={{ fontWeight: 700, marginBottom: '8px' }}>Active Pricing Strategy</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-body)' }}>{strategy?.activePricingStrategy}</p>
                </div>
                <div style={{ padding: '20px', background: '#f9fafb', borderRadius: '12px', border: '1px solid #eaecf0' }}>
                  <h4 style={{ fontWeight: 700, marginBottom: '8px' }}>Active Replenishment Strategy</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-body)' }}>{strategy?.activeReorderStrategy}</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Interactive Modals */}
      {streamProduct && (
        <StreamModal 
          product={streamProduct} 
          onClose={() => setStreamProduct(null)} 
        />
      )}

      {stockModalProduct && (
        <StockUpdateModal 
          product={stockModalProduct} 
          onClose={() => setStockModalProduct(null)}
          onSave={handleStockUpdateSave}
        />
      )}

      {/* Toast Feedback */}
      {toast && (
        <div className={`devias-toast ${toast.type} animate-fade-in`}>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
