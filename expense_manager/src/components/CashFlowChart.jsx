import React, { useState } from 'react';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { formatCurrency, formatCompactNumber } from '../utils/currencyFormatter';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        padding: '0.75rem 1rem',
        borderRadius: 'var(--radius-sm)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
      }}>
        <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.4rem' }}>
          Period: {label}
        </div>
        {payload.map((entry) => (
          <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', marginTop: '0.2rem' }}>
            <span style={{ color: entry.color, fontWeight: 600 }}>{entry.name}:</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
              {formatCurrency(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const CashFlowChart = ({ transactions }) => {
  const [timeGranularity, setTimeGranularity] = useState('daily'); // 'daily' | 'monthly'

  // Group transactions by date/month (excluding internal transfers)
  const dataMap = {};

  transactions
    .filter((tx) => !tx.isTransfer && tx.category !== 'Account Transfer')
    .forEach((tx) => {
      if (!tx.date) return;
      const d = new Date(tx.date);
      if (isNaN(d.getTime())) return;

      let periodKey = tx.date.substring(0, 10);
      if (timeGranularity === 'monthly') {
        periodKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!dataMap[periodKey]) {
        dataMap[periodKey] = { period: periodKey, income: 0, expense: 0 };
      }

      const amt = Number(tx.amount || 0);
      if (tx.type === 'income') {
        dataMap[periodKey].income += amt;
      } else if (tx.type === 'expense') {
        dataMap[periodKey].expense += amt;
      }
    });

  const chartData = Object.keys(dataMap)
    .sort()
    .map((key) => {
      const item = dataMap[key];
      return {
        ...item,
        net: item.income - item.expense
      };
    });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      {/* Time Granularity Toggle */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
        <button
          className="btn"
          onClick={() => setTimeGranularity('daily')}
          style={{
            fontSize: '0.78rem',
            padding: '0.35rem 0.75rem',
            backgroundColor: timeGranularity === 'daily' ? 'var(--bg-card)' : 'var(--bg-secondary)',
            color: timeGranularity === 'daily' ? 'var(--accent-electric-blue)' : 'var(--text-secondary)',
            border: timeGranularity === 'daily' ? '1px solid var(--accent-electric-blue)' : '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)'
          }}
        >
          Daily View
        </button>
        <button
          className="btn"
          onClick={() => setTimeGranularity('monthly')}
          style={{
            fontSize: '0.78rem',
            padding: '0.35rem 0.75rem',
            backgroundColor: timeGranularity === 'monthly' ? 'var(--bg-card)' : 'var(--bg-secondary)',
            color: timeGranularity === 'monthly' ? 'var(--accent-electric-blue)' : 'var(--text-secondary)',
            border: timeGranularity === 'monthly' ? '1px solid var(--accent-electric-blue)' : '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)'
          }}
        >
          Monthly View
        </button>
      </div>

      {chartData.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
          No cash flow records found for this period.
        </div>
      ) : (
        <div style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
              <XAxis 
                dataKey="period" 
                stroke="var(--text-muted)" 
                fontSize={11} 
                tickLine={false} 
              />
              <YAxis 
                stroke="var(--text-muted)" 
                fontSize={11} 
                tickLine={false} 
                tickFormatter={(val) => formatCompactNumber(val)} 
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top" 
                height={36} 
                formatter={(val) => <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{val}</span>} 
              />
              <Bar dataKey="income" name="Inflow" fill="#00ff87" radius={[4, 4, 0, 0]} maxBarSize={36} />
              <Bar dataKey="expense" name="Outflow" fill="#ec4899" radius={[4, 4, 0, 0]} maxBarSize={36} />
              <Line type="monotone" dataKey="net" name="Net Cash Flow" stroke="#60a5fa" strokeWidth={3} dot={{ r: 4, fill: '#60a5fa' }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
