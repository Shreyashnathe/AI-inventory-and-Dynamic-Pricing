import React, { useState } from 'react';
import { 
  RotateCw, 
  Monitor, 
  Tablet, 
  Smartphone,
  TrendingUp,
  Layers
} from 'lucide-react';

export default function AnalyticsSection({ onSync }) {
  const [syncing, setSyncing] = useState(false);

  const handleSyncClick = () => {
    setSyncing(true);
    if (onSync) onSync();
    setTimeout(() => setSyncing(false), 800);
  };

  // 12-month data matching the Devias Kit screenshot
  const monthlyData = [
    { month: 'Jan', valA: 85, valB: 50 },
    { month: 'Feb', valA: 72, valB: 58 },
    { month: 'Mar', valA: 25, valB: 20 },
    { month: 'Apr', valA: 40, valB: 30 },
    { month: 'May', valA: 15, valB: 10 },
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
      {/* 1. SALES DUAL-BAR CHART (Matches left wide card in Devias Kit) */}
      <div className="devias-chart-card sales-chart-card">
        <div className="chart-card-header">
          <div className="chart-title-wrap">
            <h4 className="chart-card-title">Sales</h4>
            <span className="chart-card-subtitle">Revenue volume &amp; dynamic pricing velocity</span>
          </div>
          <button 
            className="chart-sync-btn"
            onClick={handleSyncClick}
            disabled={syncing}
            title="Synchronize real-time sales signals"
          >
            <RotateCw size={14} className={`sync-icon ${syncing ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        </div>

        {/* Bar Chart Area */}
        <div className="bar-chart-body">
          {/* Y-axis labels */}
          <div className="y-axis-labels">
            <span>20K</span>
            <span>15K</span>
            <span>10K</span>
            <span>5K</span>
            <span>0</span>
          </div>

          {/* Chart Columns */}
          <div className="bar-chart-plot">
            {/* Grid lines */}
            <div className="grid-line" style={{ bottom: '100%' }}></div>
            <div className="grid-line" style={{ bottom: '75%' }}></div>
            <div className="grid-line" style={{ bottom: '50%' }}></div>
            <div className="grid-line" style={{ bottom: '25%' }}></div>
            <div className="grid-line" style={{ bottom: '0%' }}></div>

            {/* Monthly Columns */}
            <div className="bars-container">
              {monthlyData.map((item, idx) => (
                <div key={idx} className="month-column">
                  <div className="bars-pair">
                    {/* Primary Bar (Indigo) */}
                    <div 
                      className="chart-bar bar-primary" 
                      style={{ height: `${item.valA}%` }}
                      title={`${item.month} Dynamic Sales: $${(item.valA * 210).toLocaleString()}`}
                    ></div>
                    {/* Secondary Bar (Lavender) */}
                    <div 
                      className="chart-bar bar-secondary" 
                      style={{ height: `${item.valB}%` }}
                      title={`${item.month} Baseline Volume: $${(item.valB * 210).toLocaleString()}`}
                    ></div>
                  </div>
                  <span className="month-label">{item.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. TRAFFIC SOURCE DONUT CHART (Matches right square card in Devias Kit) */}
      <div className="devias-chart-card traffic-chart-card">
        <div className="chart-card-header">
          <div className="chart-title-wrap">
            <h4 className="chart-card-title">Traffic Source</h4>
            <span className="chart-card-subtitle">Channel attribution for orders</span>
          </div>
        </div>

        {/* Donut Chart SVG */}
        <div className="donut-chart-body">
          <div className="donut-svg-wrapper">
            <svg viewBox="0 0 160 160" className="donut-svg">
              {/* Desktop Segment - Indigo (63%) */}
              <circle
                cx="80"
                cy="80"
                r="60"
                fill="none"
                stroke="#6366F1"
                strokeWidth="24"
                strokeDasharray="237.5 377"
                strokeDashoffset="0"
                transform="rotate(-90 80 80)"
              />
              {/* Tablet Segment - Green (15%) */}
              <circle
                cx="80"
                cy="80"
                r="60"
                fill="none"
                stroke="#10B981"
                strokeWidth="24"
                strokeDasharray="56.5 377"
                strokeDashoffset="-237.5"
                transform="rotate(-90 80 80)"
              />
              {/* Phone Segment - Orange (22%) */}
              <circle
                cx="80"
                cy="80"
                r="60"
                fill="none"
                stroke="#F79009"
                strokeWidth="24"
                strokeDasharray="83 377"
                strokeDashoffset="-294"
                transform="rotate(-90 80 80)"
              />
              {/* Inner cutout hole */}
              <circle cx="80" cy="80" r="48" fill="#ffffff" />
            </svg>
          </div>

          {/* Donut Legend */}
          <div className="donut-legend-grid">
            <div className="legend-item">
              <Monitor size={18} className="legend-icon text-indigo" />
              <span className="legend-name">Desktop</span>
              <span className="legend-pct">63%</span>
            </div>
            <div className="legend-item">
              <Tablet size={18} className="legend-icon text-orange" />
              <span className="legend-name">Tablet</span>
              <span className="legend-pct">15%</span>
            </div>
            <div className="legend-item">
              <Smartphone size={18} className="legend-icon text-green" />
              <span className="legend-name">Phone</span>
              <span className="legend-pct">22%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
