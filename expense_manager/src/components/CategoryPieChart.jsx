import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency } from '../utils/currencyFormatter';
import { useTransactions } from '../context/TransactionContext';

const NEON_COLORS = [
  '#00ff87', // Neon Green
  '#ec4899', // Neon Pink
  '#a855f7', // Neon Purple
  '#60a5fa', // Electric Blue
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#38bdf8', // Sky Blue
  '#10b981'  // Emerald
];

const CustomTooltip = ({ active, payload, currency, totalExpenseSum }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const amount = data.value || 0;
    const percentage = totalExpenseSum > 0 ? ((amount / totalExpenseSum) * 100).toFixed(1) : '0';
    return (
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        padding: '0.65rem 0.85rem',
        borderRadius: 'var(--radius-sm)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
        zIndex: 10
      }}>
        <div style={{ color: data.payload.color || data.color, fontWeight: 700, fontSize: '0.9rem' }}>
          {data.name}
        </div>
        <div style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '1rem', marginTop: '0.2rem' }}>
          {formatCurrency(amount, currency)} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>({percentage}%)</span>
        </div>
      </div>
    );
  }
  return null;
};

export const CategoryPieChart = ({ transactions }) => {
  const { currency } = useTransactions();

  // Aggregate expenses by category
  const categoryTotals = {};
  transactions
    .filter((tx) => tx.type === 'expense' && !tx.isTransfer && tx.category !== 'Account Transfer')
    .forEach((tx) => {
      const cat = tx.category || 'Miscellaneous';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(tx.amount || 0);
    });

  const chartData = Object.keys(categoryTotals)
    .map((cat, index) => ({
      name: cat,
      value: categoryTotals[cat],
      color: NEON_COLORS[index % NEON_COLORS.length]
    }))
    .sort((a, b) => b.value - a.value);

  const totalExpenseSum = chartData.reduce((sum, item) => sum + item.value, 0);

  if (chartData.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
        No expense data available for this date range to plot category breakdown.
      </div>
    );
  }

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Doughnut Chart Graphic container - perfectly sized with no empty whitespace */}
      <div style={{ width: '100%', height: 230, position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                  stroke="var(--bg-card)"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip currency={currency} totalExpenseSum={totalExpenseSum} />} />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Total Overlay */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none'
        }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>
            Outflow
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--accent-neon-pink)', whiteSpace: 'nowrap' }}>
            {formatCurrency(totalExpenseSum, currency)}
          </div>
        </div>
      </div>

      {/* Responsive Custom Legend Container - Fits desktop cleanly & wraps safely on mobile */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '0.4rem 0.6rem',
        paddingTop: '0.6rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)'
      }}>
        {chartData.map((item) => {
          const pct = totalExpenseSum > 0 ? ((item.value / totalExpenseSum) * 100).toFixed(1) : '0';
          return (
            <div
              key={item.name}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.25rem 0.55rem',
                fontSize: '0.78rem',
                maxWidth: '100%',
                boxSizing: 'border-box'
              }}
            >
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: item.color,
                flexShrink: 0
              }} />
              <span style={{ color: 'var(--text-primary)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '110px' }}>
                {item.name}
              </span>
              <span style={{ color: item.color, fontWeight: 700, whiteSpace: 'nowrap' }}>
                {formatCurrency(item.value, currency)}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
                ({pct}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};



