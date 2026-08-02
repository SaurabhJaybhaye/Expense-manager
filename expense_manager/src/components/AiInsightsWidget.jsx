import React from 'react';
import { useTransactions } from '../context/TransactionContext';
import { useBudgets } from '../context/BudgetContext';
import { formatCurrency } from '../utils/currencyFormatter';
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, ShieldCheck } from 'lucide-react';

export const AiInsightsWidget = () => {
  const { transactions, totalIncome, totalExpenses, currency } = useTransactions();
  const { budgets } = useBudgets() || { budgets: {} };

  // Calculate Health Score (0 - 100)
  let healthScore = 75;
  if (totalIncome > 0) {
    const savingsRatio = (totalIncome - totalExpenses) / totalIncome;
    if (savingsRatio >= 0.4) healthScore = 95;
    else if (savingsRatio >= 0.2) healthScore = 85;
    else if (savingsRatio >= 0) healthScore = 70;
    else healthScore = 45;
  }

  // Generate automated insight cards
  const insights = [];

  // Insight 1: Net Cash Flow status
  if (totalIncome > totalExpenses && totalIncome > 0) {
    insights.push({
      id: 'ins_savings',
      title: 'Healthy Savings Rate',
      type: 'positive',
      icon: TrendingUp,
      color: '#00ff87',
      desc: `You are retaining ${Math.round(((totalIncome - totalExpenses) / totalIncome) * 100)}% of your gross income. Great financial momentum!`
    });
  } else if (totalExpenses > totalIncome && totalIncome > 0) {
    insights.push({
      id: 'ins_deficit',
      title: 'Cash Deficit Warning',
      type: 'warning',
      icon: AlertTriangle,
      color: '#ec4899',
      desc: `Expenses currently exceed total income by ${formatCurrency(totalExpenses - totalIncome, currency)}. Review category spending limits.`
    });
  }

  // Insight 2: Food & Dining Spending Spikes
  const foodSpending = transactions
    .filter(t => t.type === 'expense' && t.category === 'Food & Dining')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  if (foodSpending > 5000) {
    insights.push({
      id: 'ins_food',
      title: 'Food & Dining Analysis',
      type: 'tip',
      icon: Lightbulb,
      color: '#60a5fa',
      desc: `Food & Dining represents ${formatCurrency(foodSpending, currency)}. Setting a food budget cap could save ~15% monthly.`
    });
  }

  // Insight 3: Default AI tip
  insights.push({
    id: 'ins_smart',
    title: 'AI Smart Tip',
    type: 'tip',
    icon: Sparkles,
    color: '#a855f7',
    desc: 'Regularly reviewing budget caps keeps your financial trajectory on target for long-term wealth building.'
  });

  return (
    <div className="glass-card glass-card-glow-green" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            padding: '0.4rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--accent-neon-green-glow)',
            color: 'var(--accent-neon-green)'
          }}>
            <Sparkles size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              AI Financial Insights & Health Score
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Automated pattern analysis engine
            </span>
          </div>
        </div>

        {/* Health Score Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          backgroundColor: 'var(--bg-secondary)',
          padding: '0.4rem 0.85rem',
          borderRadius: '20px',
          border: '1px solid var(--border-color)'
        }}>
          <ShieldCheck size={16} color={healthScore >= 70 ? 'var(--accent-neon-green)' : 'var(--accent-neon-pink)'} />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Health Score:</span>
          <span style={{
            fontSize: '0.95rem',
            fontWeight: 800,
            color: healthScore >= 70 ? 'var(--accent-neon-green)' : 'var(--accent-neon-pink)'
          }}>
            {healthScore} / 100
          </span>
        </div>
      </div>

      {/* Insights Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
        {insights.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.85rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Icon size={16} color={item.color} />
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {item.title}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {item.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
