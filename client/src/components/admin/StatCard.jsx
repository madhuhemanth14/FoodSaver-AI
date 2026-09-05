import React from 'react';
import './StatCard.css';

export default function StatCard({ title, value, icon, trend, description }) {
  const isPositive = trend?.startsWith('+');
  
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <h3 className="stat-card-title">{title}</h3>
        <div className="stat-card-icon">{icon}</div>
      </div>
      <div className="stat-card-body">
        <div className="stat-card-value">{value}</div>
        {trend && (
          <div className={`stat-card-trend ${isPositive ? 'positive' : 'negative'}`}>
            {trend}
          </div>
        )}
      </div>
      {description && <p className="stat-card-desc">{description}</p>}
    </div>
  );
}
