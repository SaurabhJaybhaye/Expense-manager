import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
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
        boxShadow: '0 4px 16px rgba(0,0,0,0.5)'
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
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Doughnut Chart Graphic */}
      <div style={{ width: '100%', height: 280, position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="45%"
              innerRadius={60}
              outerRadius={95}
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
            <Legend 
              verticalAlign="bottom" 
              height={44} 
              formatter={(value, entry) => {
                const amount = entry.payload?.value || 0;
                const pct = totalExpenseSum > 0 ? ((amount / totalExpenseSum) * 100).toFixed(1) : '0';
                return (
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginRight: '0.4rem' }}>
                    <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{value}:</strong>{' '}
                    <span style={{ color: entry.color, fontWeight: 700 }}>{formatCurrency(amount, currency)}</span>{' '}
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>({pct}%)</span>
                  </span>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Total Overlay */}
        <div style={{
          position: 'absolute',
          top: '45%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none'
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Outflow
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-neon-pink)' }}>
            {formatCurrency(totalExpenseSum, currency)}
          </div>
        </div>
      </div>

      {/* Detailed Breakdown List below chart */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        marginTop: '0.25rem',
        paddingTop: '1rem',
        borderTop: '1px solid var(--border-color)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.15rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Category Amounts Breakdown
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {chartData.length} {chartData.length === 1 ? 'Category' : 'Categories'}
          </span>
        </div>

        {chartData.map((item) => {
          const pct = totalExpenseSum > 0 ? ((item.value / totalExpenseSum) * 100).toFixed(1) : '0';
          return (
            <div key={item.name} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: item.color,
                    display: 'inline-block',
                    flexShrink: 0
                  }} />
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {item.name}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    {formatCurrency(item.value, currency)}
                  </span>
                  <span style={{
                    fontSize: '0.725rem',
                    fontWeight: 700,
                    padding: '0.1rem 0.4rem',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    color: item.color,
                    border: `1px solid ${item.color}40`
                  }}>
                    {pct}%
                  </span>
                </div>
              </div>
              
              {/* Mini Progress Bar */}
              <div style={{
                width: '100%',
                height: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '2px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${pct}%`,
                  height: '100%',
                  backgroundColor: item.color,
                  borderRadius: '2px',
                  transition: 'width 0.4s ease'
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

