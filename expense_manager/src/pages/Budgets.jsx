import React, { useState } from 'react';
import { useBudgets } from '../context/BudgetContext';
import { useTransactions } from '../context/TransactionContext';
import { formatCurrency } from '../utils/currencyFormatter';
import { DEFAULT_CATEGORIES } from '../constants/categories';
import { Modal } from '../components/Modal';
import { CustomSelect } from '../components/CustomSelect';
import { preventNegativeKey, sanitizePositiveAmount } from '../utils/validators';
import { Target, AlertTriangle, CheckCircle, PlusCircle, Trash2, ShieldAlert } from 'lucide-react';

export const Budgets = () => {
  const { budgets, setBudgetCap, removeBudgetCap } = useBudgets();
  const { transactions, currency } = useTransactions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(DEFAULT_CATEGORIES.EXPENSE[0].name);
  const [capAmount, setCapAmount] = useState('');

  // Calculate current month's expenses per category
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyExpenseMap = {};
  transactions
    .filter((tx) => {
      if (tx.type !== 'expense' || tx.isTransfer || tx.category === 'Account Transfer') return false;
      const d = new Date(tx.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .forEach((tx) => {
      const cat = tx.category || 'Miscellaneous Outflow';
      monthlyExpenseMap[cat] = (monthlyExpenseMap[cat] || 0) + Number(tx.amount || 0);
    });

  const budgetCategoryKeys = Object.keys(budgets);
  const totalBudgetCap = budgetCategoryKeys.reduce((sum, key) => sum + (budgets[key] || 0), 0);
  const totalBudgetSpent = budgetCategoryKeys.reduce((sum, key) => sum + (monthlyExpenseMap[key] || 0), 0);
  const totalBudgetRemaining = totalBudgetCap - totalBudgetSpent;

  const handleSaveBudget = (e) => {
    e.preventDefault();
    const num = parseFloat(capAmount);
    if (isNaN(num) || num <= 0) return;
    setBudgetCap(selectedCategory, num);
    setCapAmount('');
    setIsModalOpen(false);
  };

  const categoryOptions = DEFAULT_CATEGORIES.EXPENSE.map(c => ({ value: c.name, label: c.name }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Smart Category Budgets
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Set monthly spending caps, track progress, and prevent overspending.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <PlusCircle size={18} />
          <span>Set Category Limit</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid-3">
        <div className="glass-card glass-card-glow-green">
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Monthly Cap</span>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-neon-green)' }}>
            {formatCurrency(totalBudgetCap, currency)}
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Target budget across {budgetCategoryKeys.length} categories
          </span>
        </div>

        <div className="glass-card">
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Spent This Month</span>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {formatCurrency(totalBudgetSpent, currency)}
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Actual spending against caps
          </span>
        </div>

        <div className="glass-card">
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Budget Available</span>
          <h3 style={{
            fontSize: '1.8rem',
            fontWeight: 800,
            color: totalBudgetRemaining >= 0 ? 'var(--accent-electric-blue)' : 'var(--accent-neon-pink)'
          }}>
            {formatCurrency(totalBudgetRemaining, currency)}
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Remaining allowance
          </span>
        </div>
      </div>

      {/* Category Budget Progress Cards Grid */}
      <div className="grid-2">
        {budgetCategoryKeys.map((catName) => {
          const cap = budgets[catName] || 0;
          const spent = monthlyExpenseMap[catName] || 0;
          const percentage = cap > 0 ? Math.min(Math.round((spent / cap) * 100), 200) : 0;
          const isOver = spent > cap;
          const isNear = percentage >= 80 && !isOver;

          let barColor = 'var(--accent-neon-green)';
          let statusBadge = (
            <span className="badge badge-income">
              <CheckCircle size={12} /> On Track ({percentage}%)
            </span>
          );

          if (isNear) {
            barColor = 'var(--color-warning)';
            statusBadge = (
              <span className="badge" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: 'var(--color-warning)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                <AlertTriangle size={12} /> Near Limit ({percentage}%)
              </span>
            );
          } else if (isOver) {
            barColor = 'var(--accent-neon-pink)';
            statusBadge = (
              <span className="badge badge-expense">
                <ShieldAlert size={12} /> Over Budget ({percentage}%)
              </span>
            );
          }

          return (
            <div key={catName} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Target size={20} color={barColor} />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {catName}
                  </h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {statusBadge}
                  <button
                    onClick={() => removeBudgetCap(catName)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.2rem' }}
                    title="Remove Budget Cap"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Amount Progress Summary */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>
                  Spent: <strong style={{ color: isOver ? 'var(--accent-neon-pink)' : 'var(--text-primary)' }}>{formatCurrency(spent, currency)}</strong>
                </span>
                <span style={{ color: 'var(--text-muted)' }}>
                  Limit: <strong>{formatCurrency(cap, currency)}</strong>
                </span>
              </div>

              {/* Visual Progress Bar */}
              <div style={{
                width: '100%',
                height: '10px',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '5px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(percentage, 100)}%`,
                  backgroundColor: barColor,
                  borderRadius: '5px',
                  boxShadow: `0 0 10px ${barColor}`,
                  transition: 'width 0.4s ease'
                }} />
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                {isOver ? (
                  <span style={{ color: 'var(--accent-neon-pink)', fontWeight: 600 }}>
                    Exceeded by {formatCurrency(spent - cap, currency)}
                  </span>
                ) : (
                  <span>{formatCurrency(cap - spent, currency)} remaining for this month</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Set Budget Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Set Category Budget Cap">
        <form onSubmit={handleSaveBudget}>
          <div className="form-group">
            <CustomSelect
              label="Select Expense Category"
              options={categoryOptions}
              value={selectedCategory}
              onChange={setSelectedCategory}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Monthly Limit ({currency})</label>
            <input
              type="number"
              min="1"
              step="1"
              placeholder="e.g. 10000"
              className="form-input"
              value={capAmount}
              onKeyDown={preventNegativeKey}
              onChange={(e) => setCapAmount(sanitizePositiveAmount(e.target.value))}
              required
              autoFocus
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Budget Limit
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
