import React from 'react';
import { useTransactions } from '../context/TransactionContext';
import { formatCurrency } from '../utils/currencyFormatter';
import { formatDate } from '../utils/dateParser';
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, Trash2, FileSpreadsheet } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard = ({ onOpenAddTransaction }) => {
  const { transactions, totalIncome, totalExpenses, totalBalance, deleteTransaction } = useTransactions();

  const recentTransactions = transactions.slice(0, 6);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Greeting */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Financial Overview
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Real-time liquidity, cash flow, and recent activity monitoring.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/import" className="btn btn-secondary">
            <FileSpreadsheet size={18} />
            <span>Import CSV / JSON</span>
          </Link>
        </div>
      </div>

      {/* Summary Cards Row */}
      <div className="grid-3">
        {/* Total Net Liquidity Card */}
        <div className="glass-card glass-card-glow-green">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Net Liquidity
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
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: totalBalance >= 0 ? 'var(--accent-neon-green)' : 'var(--accent-neon-pink)' }}>
            {formatCurrency(totalBalance)}
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Combined balance across all active accounts
          </span>
        </div>

        {/* Total Inflow Card */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Total Inflow (Income)
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
            {formatCurrency(totalIncome)}
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Total positive cash inflow
          </span>
        </div>

        {/* Total Outflow Card */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Total Outflow (Expense)
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
            {formatCurrency(totalExpenses)}
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Total expense deductions
          </span>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Recent Transactions
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Latest entries across all linked accounts
            </p>
          </div>
          <Link to="/transactions" style={{ fontSize: '0.85rem', color: 'var(--accent-electric-blue)', fontWeight: 600, textDecoration: 'none' }}>
            View All ({transactions.length}) →
          </Link>
        </div>

        {recentTransactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
            No transactions logged yet. Click <strong>"New Transaction"</strong> to start tracking.
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
                  <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Amount</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((tx) => (
                  <tr key={tx.id} style={{ borderBottom: '1px solid rgba(48, 54, 61, 0.5)' }}>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      {tx.type === 'income' ? (
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
                      color: tx.type === 'income' ? 'var(--accent-neon-green)' : 'var(--accent-neon-pink)'
                    }}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
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
    </div>
  );
};
