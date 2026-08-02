import React, { useState } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { formatCurrency } from '../utils/currencyFormatter';
import { formatDate } from '../utils/dateParser';
import { Search, PlusCircle, ArrowUpRight, ArrowDownRight, Trash2, ArrowRightLeft } from 'lucide-react';

export const Transactions = ({ onOpenAddTransaction }) => {
  const { transactions, deleteTransaction } = useTransactions();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = 
      tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.account?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = 
      filterType === 'all' || 
      (filterType === 'transfer' ? tx.category === 'Account Transfer' : tx.type === filterType);

    return matchesSearch && matchesType;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Transaction History
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Manage, filter, and search your personal ledger entries.
          </p>
        </div>
        <button className="btn btn-primary" onClick={onOpenAddTransaction}>
          <PlusCircle size={18} />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-card" style={{ padding: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Search input */}
        <div style={{ flex: '1 1 300px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by note, category, or account..."
            className="form-input"
            style={{ paddingLeft: '2.5rem' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Type Filter Buttons */}
        <div style={{ display: 'flex', gap: '0.35rem', backgroundColor: 'var(--bg-secondary)', padding: '0.25rem', borderRadius: 'var(--radius-sm)', flexWrap: 'wrap' }}>
          {['all', 'income', 'expense', 'transfer'].map((t) => (
            <button
              key={t}
              className="btn"
              onClick={() => setFilterType(t)}
              style={{
                fontSize: '0.8rem',
                padding: '0.4rem 0.85rem',
                backgroundColor: filterType === t ? 'var(--bg-card)' : 'transparent',
                color: filterType === t ? 'var(--accent-electric-blue)' : 'var(--text-secondary)',
                border: filterType === t ? '1px solid var(--accent-electric-blue)' : '1px solid transparent',
                textTransform: 'capitalize'
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Main Transactions Table */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        {filteredTransactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            No matching transactions found.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '1rem', whiteSpace: 'nowrap' }}>Flow Type</th>
                  <th style={{ padding: '1rem' }}>Description</th>
                  <th style={{ padding: '1rem' }}>Category</th>
                  <th style={{ padding: '1rem' }}>Payment Account</th>
                  <th style={{ padding: '1rem', whiteSpace: 'nowrap' }}>Date & Time</th>
                  <th style={{ padding: '1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>Amount</th>
                  <th style={{ padding: '1rem', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} style={{ borderBottom: '1px solid rgba(48, 54, 61, 0.4)' }}>
                    <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
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
                    <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {tx.description}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                      {tx.category}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                      {tx.account}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {formatDate(tx.date)}
                    </td>
                    <td style={{
                      padding: '1rem',
                      textAlign: 'right',
                      whiteSpace: 'nowrap',
                      fontWeight: 700,
                      color: tx.category === 'Account Transfer' ? 'var(--accent-electric-blue)' : (tx.type === 'income' ? 'var(--accent-neon-green)' : 'var(--accent-neon-pink)')
                    }}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <button
                        onClick={() => deleteTransaction(tx.id)}
                        className="btn btn-danger"
                        style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}
                        title="Delete Transaction"
                      >
                        <Trash2 size={14} />
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
