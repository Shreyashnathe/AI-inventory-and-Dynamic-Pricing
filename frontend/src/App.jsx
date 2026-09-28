import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import KpiSummary from './components/KpiSummary';
import ApprovalQueue from './components/ApprovalQueue';
import CatalogTable from './components/CatalogTable';
import StreamModal from './components/StreamModal';
import StockUpdateModal from './components/StockUpdateModal';
import './App.css';

export default function App() {
  const [products, setProducts] = useState([]);
  const [pricingSuggestions, setPricingSuggestions] = useState([]);
  const [reorderSuggestions, setReorderSuggestions] = useState([]);
  const [strategy, setStrategy] = useState(null);
  const [loading, setLoading] = useState(true);
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

      if (prodRes.ok) setProducts(await prodRes.json());
      if (priceRes.ok) setPricingSuggestions(await priceRes.json());
      if (reorderRes.ok) setReorderSuggestions(await reorderRes.json());
      if (stratRes.ok) setStrategy(await stratRes.json());
    } catch (err) {
      console.error('Failed to fetch data:', err);
      if (!isSilent) showToast('Could not connect to backend engine. Ensure Spring Boot is running on port 8080.', 'error');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Auto-poll every 3.5s to display async agentic recommendations live
    const interval = setInterval(() => {
      fetchData(true);
    }, 3500);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Switch strategy runtime
  const handleToggleStrategy = async () => {
    const nextMode = strategy?.mode === 'AI_POWERED' ? 'RULE_BASED' : 'AI_POWERED';
    try {
      const res = await fetch('/api/strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: nextMode })
      });
      if (res.ok) {
        const updated = await res.json();
        setStrategy(updated);
        showToast(`Commerce strategy switched to ${updated.mode} at runtime!`, 'success');
      }
    } catch (err) {
      showToast('Failed to switch strategy mode', 'error');
    }
  };

  // Reset benchmark data
  const handleResetData = async () => {
    try {
      const res = await fetch('/api/admin/reset-data', { method: 'POST' });
      if (res.ok) {
        showToast('Database reset to canonical Addendum A benchmark state!', 'success');
        fetchData();
      }
    } catch (err) {
      showToast('Failed to reset database', 'error');
    }
  };

  // Simulate Sale (-1 Stock, +1 Velocity)
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
        // Refresh shortly after to catch async event queue
        setTimeout(() => fetchData(true), 1200);
      }
    } catch (err) {
      showToast('Sale simulation failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Simulate Viral Surge (+5 Orders)
  const handleSimulateSurge = async (productId) => {
    setActionLoading(productId);
    try {
      const res = await fetch(`/api/products/${productId}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: 5 })
      });
      if (res.ok) {
        showToast('Viral surge (+5 orders) simulated! Demand spike trigger evaluated.', 'info');
        setTimeout(() => fetchData(true), 1200);
      }
    } catch (err) {
      showToast('Surge simulation failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Update Stock directly
  const handleUpdateStock = async (productId, newStock) => {
    setActionLoading(productId);
    try {
      const res = await fetch(`/api/products/${productId}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stockLevel: newStock })
      });
      if (res.ok) {
        showToast(`Stock updated to ${newStock} units. Signal event emitted.`, 'info');
        setStockModalProduct(null);
        setTimeout(() => fetchData(true), 1200);
      }
    } catch (err) {
      showToast('Failed to update stock', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // On-demand AI pricing
  const handleSuggestPricing = async (productId) => {
    setActionLoading(productId);
    try {
      const res = await fetch(`/api/products/${productId}/suggest-pricing`, { method: 'POST' });
      if (res.ok) {
        showToast('On-demand pricing analysis generated and queued.', 'success');
        fetchData(true);
      }
    } catch (err) {
      showToast('Pricing suggestion failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Action Pricing (ACCEPT / REJECT)
  const handleActionPricing = async (suggestionId, status) => {
    setActionLoading(suggestionId);
    try {
      const res = await fetch(`/api/pricing-suggestions/${suggestionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        showToast(`Pricing suggestion ${status}! Catalog updated.`, 'success');
        fetchData(true);
      }
    } catch (err) {
      showToast('Action failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Action Reorder (ACCEPT / REJECT)
  const handleActionReorder = async (suggestionId, status) => {
    setActionLoading(suggestionId);
    try {
      const res = await fetch(`/api/reorder-suggestions/${suggestionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        showToast(
          status === 'ACCEPTED'
            ? 'Reorder approved! Inbound replenishment added to stock.'
            : 'Reorder suggestion rejected.',
          'success'
        );
        fetchData(true);
      }
    } catch (err) {
      showToast('Action failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            padding: '12px 20px',
            borderRadius: 'var(--radius-md)',
            background: toast.type === 'error' ? 'var(--accent-rose)' : 'var(--bg-card)',
            color: '#fff',
            border: '1px solid var(--border-highlight)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            zIndex: 9999,
            fontSize: '13px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          className="animate-fade-in"
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <Header
        strategy={strategy}
        onToggleStrategy={handleToggleStrategy}
        onResetData={handleResetData}
        onRefresh={() => fetchData(false)}
        loading={loading}
      />

      {/* KPI Metrics Strip */}
      <KpiSummary
        products={products}
        pricingSuggestions={pricingSuggestions}
        reorderSuggestions={reorderSuggestions}
      />

      {/* Approval Queue (T-5 Floor requirement) */}
      <ApprovalQueue
        pricingSuggestions={pricingSuggestions}
        reorderSuggestions={reorderSuggestions}
        onActionPricing={handleActionPricing}
        onActionReorder={handleActionReorder}
        actionLoading={actionLoading}
      />

      {/* Product Catalog Matrix (T-5 Ceiling requirement) */}
      <CatalogTable
        products={products}
        onSimulateSale={handleSimulateSale}
        onSimulateSurge={handleSimulateSurge}
        onOpenStockModal={(prod) => setStockModalProduct(prod)}
        onSuggestPricing={handleSuggestPricing}
        onOpenStreamModal={(prod) => setStreamProduct(prod)}
        actionLoading={actionLoading}
      />

      {/* Stream AI Reasoning Modal (Bonus +5 pts) */}
      {streamProduct && (
        <StreamModal
          product={streamProduct}
          onClose={() => setStreamProduct(null)}
          onStreamComplete={() => fetchData(true)}
        />
      )}

      {/* Stock Update Dialog */}
      {stockModalProduct && (
        <StockUpdateModal
          product={stockModalProduct}
          onClose={() => setStockModalProduct(null)}
          onUpdateStock={handleUpdateStock}
          loading={actionLoading === stockModalProduct.id}
        />
      )}
    </div>
  );
}
