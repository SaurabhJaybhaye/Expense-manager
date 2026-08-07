import React, { useState } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { formatCurrency } from '../utils/currencyFormatter';
import { formatDate } from '../utils/dateParser';
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, Trash2, FileSpreadsheet, ArrowRightLeft, PieChart as PieIcon, BarChart3, ListOrdered } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CategoryPieChart } from '../components/CategoryPieChart';
import { CategoryAmountsList } from '../components/CategoryAmountsList';
import { CashFlowChart } from '../components/CashFlowChart';
import { DateRangeFilter } from '../components/DateRangeFilter';
import { TransferModal } from '../components/TransferModal';
import { AiInsightsWidget } from '../components/AiInsightsWidget';

export const Dashboard = ({ onOpenAddTransaction }) => {
  const { transactions, deleteTransaction, currency } = useTransactions();
  const [isTransferOpen, setIsTransferOpen] = useState(false);

  // Date Range Filtering state
  const [activeRange, setActiveRange] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Filter transactions based on date range
  const filteredTransactions = transactions.filter((tx) => {
    if (activeRange === 'all') return true;
    if (!tx.date) return true;

    const txDate = new Date(tx.date);
    const now = new Date();

    if (activeRange === 'today') {
      return txDate.toDateString() === now.toDateString();
    }

    if (activeRange === 'week') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 86400000);
      return txDate >= oneWeekAgo && txDate <= now;
    }

    if (activeRange === 'month') {
      return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
    }

    if (activeRange === 'custom') {
      if (customStartDate && new Date(tx.date) < new Date(customStartDate)) return false;
      if (customEndDate && new Date(tx.date) > new Date(customEndDate + 'T23:59:59')) return false;
      return true;
    }

    return true;
  });

  // Dynamic totals for filtered date range
  const filteredIncome = filteredTransactions
    .filter((tx) => tx.type === 'income' && !tx.isTransfer && tx.category !== 'Account Transfer')
    .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

  const filteredExpenses = filteredTransactions
    .filter((tx) => tx.type === 'expense' && !tx.isTransfer && tx.category !== 'Account Transfer')
    .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

  const filteredNet = filteredIncome - filteredExpenses;
  const recentTransactions = filteredTransactions.slice(0, 6);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Greeting & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Financial Overview & Analytics
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Real-time liquidity, cash flow trends, and category distribution.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={() => setIsTransferOpen(true)}>
            <ArrowRightLeft size={18} />
            <span>Transfer Funds</span>
          </button>

          <Link to="/import" className="btn btn-secondary">
            <FileSpreadsheet size={18} />
            <span>Import CSV / JSON</span>
          </Link>
        </div>
      </div>

      {/* Date Range Filter Bar */}
      <DateRangeFilter
        activeRange={activeRange}
        onSelectRange={setActiveRange}
        customStartDate={customStartDate}
        customEndDate={customEndDate}
        onCustomDateChange={(start, end) => {
          setCustomStartDate(start);
          setCustomEndDate(end);
        }}
      />

      {/* Summary Cards Row */}
      <div className="grid-3">
        {/* Filtered Net Cash Flow Card */}
        <div className="glass-card glass-card-glow-green">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Net Period Cash Flow
            </span>
            <div style={{
              padding: '0.4rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--accent-neon-green-glow)',
              color: 'var(--accent-neon-green)'
            }}>
              <Wallet size={20} />
            </div>
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: filteredNet >= 0 ? 'var(--accent-neon-green)' : 'var(--accent-neon-pink)' }}>
            {formatCurrency(filteredNet, currency)}
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Net inflow minus outflow for selected range
          </span>
        </div>

        {/* Inflow Card */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Inflow (Income)
            </span>
            <div style={{
              padding: '0.4rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--color-success)'
            }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-success)' }}>
            {formatCurrency(filteredIncome, currency)}
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Gross positive revenue
          </span>
        </div>

        {/* Outflow Card */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Outflow (Expenses)
            </span>
            <div style={{
              padding: '0.4rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--accent-neon-pink-glow)',
              color: 'var(--accent-neon-pink)'
            }}>
              <TrendingDown size={20} />
            </div>
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-neon-pink)' }}>
            {formatCurrency(filteredExpenses, currency)}
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Gross category expenditures
          </span>
        </div>
      </div>

      {/* AI Financial Insights & Health Score Widget */}
      <AiInsightsWidget />

      {/* Interactive Analytics & Chart Grid */}
      <div className="grid-2">
        {/* Section 1: Category Distribution (Pie Chart) */}
        <div className="glass-card glass-card-glow-purple">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <PieIcon size={20} color="var(--accent-neon-purple)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Category Distribution (Pie Chart)
              </h3>
            </div>
            <Link to="/analytics" style={{ fontSize: '0.8rem', color: 'var(--accent-neon-purple)', fontWeight: 600, textDecoration: 'none' }}>
              Full Category Analysis →
            </Link>
          </div>
          <CategoryPieChart transactions={filteredTransactions} />
        </div>

        {/* Section 2: Category Amounts Section */}
        <div className="glass-card glass-card-glow-green">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <ListOrdered size={20} color="var(--accent-neon-green)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Category Amounts Breakdown
            </h3>
          </div>
          <CategoryAmountsList transactions={filteredTransactions} />
        </div>
      </div>

      {/* Cash Flow Line & Bar Chart */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
          <BarChart3 size={20} color="var(--accent-electric-blue)" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Cash Flow Trends
          </h3>
        </div>
        <CashFlowChart transactions={filteredTransactions} />
      </div>

      {/* Recent Activity Table */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Recent Ledger Activity
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Showing {recentTransactions.length} of {filteredTransactions.length} items in range
            </p>
          </div>
          <Link to="/transactions" style={{ fontSize: '0.85rem', color: 'var(--accent-electric-blue)', fontWeight: 600, textDecoration: 'none' }}>
            View Full Ledger ({transactions.length}) →
          </Link>
        </div>

        {recentTransactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
            No transactions found for the selected date range filter.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Type</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Description</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Account</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Date & Time</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Amount</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((tx) => (
                  <tr key={tx.id} style={{ borderBottom: '1px solid rgba(48, 54, 61, 0.5)' }}>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      {tx.category === 'Account Transfer' ? (
                        <span className="badge" style={{ backgroundColor: 'var(--accent-electric-blue-glow)', color: 'var(--accent-electric-blue)', border: '1px solid rgba(96, 165, 250, 0.3)' }}>
                          <ArrowRightLeft size={14} /> Transfer
                        </span>
                      ) : tx.type === 'income' ? (
                        <span className="badge badge-income">
                          <ArrowUpRight size={14} /> Inflow
                        </span>
                      ) : (
                        <span className="badge badge-expense">
                          <ArrowDownRight size={14} /> Outflow
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {tx.description}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                      {tx.category}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                      {tx.account}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>
                      {formatDate(tx.date)}
                    </td>
                    <td style={{
                      padding: '0.85rem 1rem',
                      textAlign: 'right',
                      fontWeight: 700,
                      color: tx.category === 'Account Transfer' ? 'var(--accent-electric-blue)' : (tx.type === 'income' ? 'var(--accent-neon-green)' : 'var(--accent-neon-pink)')
                    }}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                      <button
                        onClick={() => deleteTransaction(tx.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer'
                        }}
                        title="Delete Entry"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Account Transfer Modal */}
      <TransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
      />
    </div>
  );
};
