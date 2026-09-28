import React, { useState } from 'react';
import { X, SlidersHorizontal, AlertCircle } from 'lucide-react';

export default function StockUpdateModal({ product, onClose, onUpdateStock, loading }) {
  const [stock, setStock] = useState(product?.stockLevel ?? 0);

  if (!product) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateStock(product.id, parseInt(stock, 10));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card animate-fade-in" style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <SlidersHorizontal size={20} color="var(--accent-amber)" />
            <div>
              <h3 style={{ fontSize: '17px', color: '#fff' }}>Adjust Inventory Level</h3>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {product.name} ({product.sku})
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Current Stock Units (Safety Threshold: {product.reorderThreshold})
            </label>
            <input
              type="number"
              min="0"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                color: '#fff',
                fontSize: '16px',
                fontFamily: 'var(--font-mono)'
              }}
              required
            />
          </div>

          {parseInt(stock, 10) < product.reorderThreshold && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 12px',
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--accent-amber)',
                fontSize: '12px',
                marginBottom: '18px'
              }}
            >
              <AlertCircle size={16} />
              <span>
                Setting stock below {product.reorderThreshold} will immediately trigger the autonomous recommendation loop!
              </span>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-accept"
              style={{ flex: 'none', padding: '10px 20px' }}
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Save Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
