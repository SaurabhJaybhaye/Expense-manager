import React from 'react';
import { Calendar } from 'lucide-react';

export const DateRangeFilter = ({ activeRange, onSelectRange, customStartDate, customEndDate, onCustomDateChange }) => {
  const options = [
    { id: 'all', label: 'All Time' },
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'custom', label: 'Custom Range' }
  ];

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      flexWrap: 'wrap',
      backgroundColor: 'var(--bg-secondary)',
      padding: '0.4rem 0.65rem',
      borderRadius: 'var(--radius-sm)',
      border: '1px solid var(--border-color)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
        <Calendar size={15} color="var(--accent-electric-blue)" />
        <span>Range:</span>
      </div>

      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
        {options.map((opt) => (
          <button
            key={opt.id}
            className="btn"
            onClick={() => onSelectRange(opt.id)}
            style={{
              fontSize: '0.78rem',
              padding: '0.3rem 0.65rem',
              backgroundColor: activeRange === opt.id ? 'var(--bg-card)' : 'transparent',
              color: activeRange === opt.id ? 'var(--accent-neon-green)' : 'var(--text-secondary)',
              border: activeRange === opt.id ? '1px solid rgba(0, 255, 135, 0.4)' : '1px solid transparent',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {activeRange === 'custom' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
          <input
            type="date"
            className="form-input"
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', width: 'auto' }}
            value={customStartDate || ''}
            onChange={(e) => onCustomDateChange(e.target.value, customEndDate)}
          />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>to</span>
          <input
            type="date"
            className="form-input"
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', width: 'auto' }}
            value={customEndDate || ''}
            onChange={(e) => onCustomDateChange(customStartDate, e.target.value)}
          />
        </div>
      )}
    </div>
  );
};
