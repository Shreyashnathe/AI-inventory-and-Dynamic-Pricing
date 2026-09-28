import React, { useState } from 'react';
import { 
  RotateCw, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  TrendingUp,
  Layers
} from 'lucide-react';

export default function AnalyticsSection({ products = [], onSync }) {
  const [syncing, setSyncing] = useState(false);

  const handleSyncClick = () => {
    setSyncing(true);
    if (onSync) onSync();
    setTimeout(() => setSyncing(false), 600);
  };

  // Compute real-time stock health distribution from actual products
  const total = products.length || 8;
  const outOfStock = products.filter(p => (p.stockLevel || 0) === 0).length;
  const lowStock = products.filter(p => (p.stockLevel || 0) > 0 && (p.stockLevel || 0) < (p.reorderThreshold || 0)).length;
  const healthy = total - outOfStock - lowStock;

  const healthyPct = Math.round((healthy / total) * 100);
  const lowPct = Math.round((lowStock / total) * 100);
  const outPct = 100 - healthyPct - lowPct;

  // 12-month benchmark sales & velocity data
  const monthlyData = [
    { month: 'Jan', valA: 85, valB: 50 },
    { month: 'Feb', valA: 72, valB: 58 },
    { month: 'Mar', valA: 35, valB: 25 },
    { month: 'Apr', valA: 45, valB: 32 },
    { month: 'May', valA: 20, valB: 15 },
    { month: 'Jun', valA: 65, valB: 42 },
    { month: 'Jul', valA: 65, valB: 35 },
    { month: 'Aug', valA: 74, valB: 55 },
    { month: 'Sep', valA: 80, valB: 48 },
    { month: 'Oct', valA: 88, valB: 62 },
    { month: 'Nov', valA: 84, valB: 52 },
    { month: 'Dec', valA: 92, valB: 60 }
  ];

  return (
    <div className="devias-analytics-grid">
      {/* 1. SALES & DEMAND VELOCITY DUAL-BAR CHART */}
      <div className="devias-chart-card sales-chart-card">
        <div className="chart-card-header">
          <div className="chart-title-wrap">
            <h4 className="chart-card-title">Sales &amp; Demand Velocity</h4>
            <span className="chart-card-subtitle">Dynamic pricing revenue vs baseline volume</span>
          </div>
          <button 
            className="chart-sync-btn"
            onClick={handleSyncClick}
            disabled={syncing}
            title="Synchronize signals with backend database"
          >
            <RotateCw size={13} className={`sync-icon ${syncing ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        </div>

        {/* Bar Chart Body */}
        <div className="bar-chart-body">
          <div className="y-axis-labels">
            <span>20K</span>
            <span>15K</span>
            <span>10K</span>
            <span>5K</span>
            <span>0</span>
          </div>

          <div className="bar-chart-plot">
            <div className="grid-line" style={{ bottom: '100%' }}></div>
            <div className="grid-line" style={{ bottom: '75%' }}></div>
            <div className="grid-line" style={{ bottom: '50%' }}></div>
            <div className="grid-line" style={{ bottom: '25%' }}></div>
            <div className="grid-line" style={{ bottom: '0%' }}></div>

            <div className="bars-container">
              {monthlyData.map((item, idx) => (
                <div key={idx} className="month-column">
                  <div className="bars-pair">
                    <div 
                      className="chart-bar bar-primary" 
                      style={{ height: `${item.valA}%` }}
                      title={`${item.month} Revenue: $${(item.valA * 220).toLocaleString()}`}
                    ></div>
                    <div 
                      className="chart-bar bar-secondary" 
                      style={{ height: `${item.valB}%` }}
                      title={`${item.month} Baseline: $${(item.valB * 220).toLocaleString()}`}
                    ></div>
                  </div>
                  <span className="month-label">{item.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. STOCK HEALTH COMPOSITION DONUT CHART */}
      <div className="devias-chart-card traffic-chart-card">
        <div className="chart-card-header">
          <div className="chart-title-wrap">
            <h4 className="chart-card-title">Stock Health Composition</h4>
            <span className="chart-card-subtitle">Real-time inventory levels vs thresholds</span>
          </div>
        </div>

        <div className="donut-chart-body">
          <div className="donut-svg-wrapper">
            <svg viewBox="0 0 160 160" className="donut-svg">
              {/* Healthy Segment - Green */}
              <circle
                cx="80"
                cy="80"
                r="60"
                fill="none"
                stroke="#10B981"
                strokeWidth="22"
                strokeDasharray={`${(healthyPct / 100) * 377} 377`}
                strokeDashoffset="0"
                transform="rotate(-90 80 80)"
              />
              {/* Low Stock Segment - Amber */}
              <circle
                cx="80"
                cy="80"
                r="60"
                fill="none"
                stroke="#F79009"
                strokeWidth="22"
                strokeDasharray={`${(lowPct / 100) * 377} 377`}
                strokeDashoffset={`-${(healthyPct / 100) * 377}`}
                transform="rotate(-90 80 80)"
              />
              {/* Out of Stock Segment - Red */}
              <circle
                cx="80"
                cy="80"
                r="60"
                fill="none"
                stroke="#F04438"
                strokeWidth="22"
                strokeDasharray={`${(outPct / 100) * 377} 377`}
                strokeDashoffset={`-${((healthyPct + lowPct) / 100) * 377}`}
                transform="rotate(-90 80 80)"
              />
              <circle cx="80" cy="80" r="48" fill="#ffffff" />
            </svg>
          </div>

          <div className="donut-legend-grid">
            <div className="legend-item">
              <CheckCircle2 size={16} className="legend-icon text-green" />
              <span className="legend-name">Healthy</span>
              <span className="legend-pct">{healthy} SKUs</span>
            </div>
            <div className="legend-item">
              <AlertTriangle size={16} className="legend-icon text-orange" />
              <span className="legend-name">Low Alert</span>
              <span className="legend-pct">{lowStock} SKU</span>
            </div>
            <div className="legend-item">
              <XCircle size={16} className="legend-icon text-red" />
              <span className="legend-name">Out of Stock</span>
              <span className="legend-pct">{outOfStock} SKU</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
