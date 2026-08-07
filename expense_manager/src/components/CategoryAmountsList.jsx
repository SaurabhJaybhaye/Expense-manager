import React from 'react';
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

export const CategoryAmountsList = ({ transactions }) => {
  const { currency } = useTransactions();

  // Aggregate expenses by category
  const categoryTotals = {};
  const categoryTxCounts = {};

  transactions
    .filter((tx) => tx.type === 'expense' && !tx.isTransfer && tx.category !== 'Account Transfer')
    .forEach((tx) => {
      const cat = tx.category || 'Miscellaneous';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(tx.amount || 0);
      categoryTxCounts[cat] = (categoryTxCounts[cat] || 0) + 1;
    });

  const listData = Object.keys(categoryTotals)
    .map((cat, index) => ({
      name: cat,
      value: categoryTotals[cat],
      txCount: categoryTxCounts[cat] || 0,
      color: NEON_COLORS[index % NEON_COLORS.length]
    }))
    .sort((a, b) => b.value - a.value);

  const totalExpenseSum = listData.reduce((sum, item) => sum + item.value, 0);

  if (listData.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
        No category expenditure recorded for this date range.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Categories ({listData.length})
        </span>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-neon-pink)' }}>
          Total Outflow: {formatCurrency(totalExpenseSum, currency)}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {listData.map((item) => {
          const pct = totalExpenseSum > 0 ? ((item.value / totalExpenseSum) * 100).toFixed(1) : '0';
          return (
            <div
              key={item.name}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.85rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                transition: 'transform 0.2s ease, border-color 0.2s ease'
              }}
            >
              {/* Category Name & Amount */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: item.color,
                    boxShadow: `0 0 8px ${item.color}80`,
                    flexShrink: 0
                  }} />
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', display: 'block' }}>
                      {item.name}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {item.txCount} {item.txCount === 1 ? 'transaction' : 'transactions'}
                    </span>
                  </div>
                </div>

                {/* Amount & Percentage Tag */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                    {formatCurrency(item.value, currency)}
                  </span>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.55rem',
                    borderRadius: '12px',
                    backgroundColor: `${item.color}15`,
                    color: item.color,
                    border: `1px solid ${item.color}40`
                  }}>
                    {pct}%
                  </span>
                </div>
              </div>

              {/* Relative Progress Bar */}
              <div style={{
                width: '100%',
                height: '5px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '3px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${pct}%`,
                  height: '100%',
                  backgroundColor: item.color,
                  borderRadius: '3px',
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
