import React, { useState } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { formatCurrency } from '../utils/currencyFormatter';
import { formatDate } from '../utils/dateParser';
import { CustomSelect } from '../components/CustomSelect';
import { ConfirmModal } from '../components/ConfirmModal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { TransactionModal } from '../components/TransactionModal';
import { Search, PlusCircle, ArrowUpRight, ArrowDownRight, Trash2, Pencil, ArrowRightLeft, ArrowUpDown, ArrowUp, ArrowDown, RotateCcw } from 'lucide-react';
import { DEFAULT_CATEGORIES } from '../constants/categories';

export const Transactions = ({ onOpenAddTransaction }) => {
  const { transactions, accounts, deleteTransaction, loading, currency } = useTransactions();
  
  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterAccount, setFilterAccount] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // Sorting States: 'date' | 'amount'
  const [sortKey, setSortKey] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc'); // 'desc' | 'asc'

  // Edit Transaction Modal State
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Delete Confirmation Modal State
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, description }
  const [deleting, setDeleting] = useState(false);

  // Extract unique category names
  const allCategoryNames = Array.from(new Set([
    ...DEFAULT_CATEGORIES.INCOME.map(c => c.name),
    ...DEFAULT_CATEGORIES.EXPENSE.map(c => c.name),
    ...transactions.map(t => t.category).filter(Boolean)
  ]));

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...allCategoryNames.map(cat => ({ value: cat, label: cat }))
  ];

  // Extract unique account names
  const allAccountNames = Array.from(new Set([
    ...accounts.map(a => a.name),
    ...transactions.map(t => t.account).filter(Boolean)
  ]));

  const accountOptions = [
    { value: 'all', label: 'All Accounts' },
    ...allAccountNames.map(acc => ({ value: acc, label: acc }))
  ];

  const sortOptions = [
    { value: 'date-desc', label: 'Date: Newest First' },
    { value: 'date-asc', label: 'Date: Oldest First' },
    { value: 'amount-desc', label: 'Amount: High to Low' },
    { value: 'amount-asc', label: 'Amount: Low to High' }
  ];

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = 
      tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.account?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = 
      filterType === 'all' || 
      (filterType === 'transfer' ? tx.category === 'Account Transfer' : tx.type === filterType);

    const matchesAccount = 
      filterAccount === 'all' || 
      tx.account?.toLowerCase() === filterAccount.toLowerCase();

    const matchesCategory = 
      filterCategory === 'all' || 
      tx.category?.toLowerCase() === filterCategory.toLowerCase();

    return matchesSearch && matchesType && matchesAccount && matchesCategory;
  });

  // Sort transactions
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortKey === 'amount') {
      const amtA = Number(a.amount || 0);
      const amtB = Number(b.amount || 0);
      return sortDirection === 'desc' ? amtB - amtA : amtA - amtB;
    } else {
      // Sort by Date
      const dateA = new Date(a.date || 0).getTime();
      const dateB = new Date(b.date || 0).getTime();
      return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
    }
  });

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setFilterAccount('all');
    setFilterCategory('all');
    setSortKey('date');
    setSortDirection('desc');
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await deleteTransaction(deleteTarget.id);
    setDeleting(false);
    setDeleteTarget(null);
  };

  const isFilterActive = searchTerm || filterType !== 'all' || filterAccount !== 'all' || filterCategory !== 'all';

  if (loading) {
    return <LoadingSpinner fullPage message="Fetching transaction ledger from Cloud Firestore..." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header & Primary Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Transaction History
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Manage, edit, sort, and filter your personal ledger entries.
          </p>
        </div>
        <button className="btn btn-primary" onClick={onOpenAddTransaction}>
          <PlusCircle size={18} />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* Filter & Sort Control Panel */}
      <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', zIndex: 20 }}>
        {/* Top Row: Search & Flow Type Pills */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search bar */}
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

          {/* Flow Type Pills */}
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

        {/* Bottom Row: Field-Specific Filters & Sort Controls */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--border-color)',
          alignItems: 'center'
        }}>
          {/* Filter by Account */}
          <CustomSelect
            label="Filter Account"
            options={accountOptions}
            value={filterAccount}
            onChange={setFilterAccount}
          />

          {/* Filter by Category */}
          <CustomSelect
            label="Filter Category"
            options={categoryOptions}
            value={filterCategory}
            onChange={setFilterCategory}
          />

          {/* Sort By Dropdown */}
          <CustomSelect
            label="Sort By"
            options={sortOptions}
            value={`${sortKey}-${sortDirection}`}
            onChange={(val) => {
              const [key, dir] = val.split('-');
              setSortKey(key);
              setSortDirection(dir);
            }}
          />

          {/* Reset Filters Trigger */}
          {isFilterActive && (
            <div style={{ display: 'flex', alignItems: 'flex-end', height: '100%', marginTop: '1.25rem' }}>
              <button
                className="btn btn-secondary"
                onClick={handleResetFilters}
                style={{ fontSize: '0.8rem', padding: '0.7rem', width: '100%', justifyContent: 'center' }}
              >
                <RotateCcw size={14} />
                <span>Reset Filters</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Transactions Table */}
      <div className="glass-card" style={{ padding: 0, overflow: 'visible', position: 'relative', zIndex: 1 }}>
        {sortedTransactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            No matching transactions found for the applied filters.
          </div>
        ) : (
          <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '1rem', whiteSpace: 'nowrap' }}>Flow Type</th>
                  <th style={{ padding: '1rem' }}>Description</th>
                  <th style={{ padding: '1rem' }}>Category</th>
                  <th style={{ padding: '1rem' }}>Payment Account</th>
                  <th 
                    style={{ padding: '1rem', whiteSpace: 'nowrap', cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => toggleSort('date')}
                    title="Click to sort by Date"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span>Date & Time</span>
                      {sortKey === 'date' ? (
                        sortDirection === 'desc' ? <ArrowDown size={14} color="var(--accent-neon-green)" /> : <ArrowUp size={14} color="var(--accent-neon-green)" />
                      ) : (
                        <ArrowUpDown size={14} color="var(--text-muted)" />
                      )}
                    </div>
                  </th>
                  <th 
                    style={{ padding: '1rem', textAlign: 'right', whiteSpace: 'nowrap', cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => toggleSort('amount')}
                    title="Click to sort by Amount"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                      <span>Amount</span>
                      {sortKey === 'amount' ? (
                        sortDirection === 'desc' ? <ArrowDown size={14} color="var(--accent-neon-green)" /> : <ArrowUp size={14} color="var(--accent-neon-green)" />
                      ) : (
                        <ArrowUpDown size={14} color="var(--text-muted)" />
                      )}
                    </div>
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedTransactions.map((tx) => (
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
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                        {/* Edit Transaction Button */}
                        <button
                          onClick={() => setEditingTransaction(tx)}
                          className="btn btn-secondary"
                          style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}
                          title="Edit Transaction"
                        >
                          <Pencil size={14} />
                        </button>

                        {/* Delete Transaction Button */}
                        <button
                          onClick={() => setDeleteTarget({ id: tx.id, description: tx.description })}
                          className="btn btn-danger"
                          style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}
                          title="Delete Transaction"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Transaction Modal */}
      <TransactionModal
        isOpen={Boolean(editingTransaction)}
        onClose={() => setEditingTransaction(null)}
        editingTransaction={editingTransaction}
      />

      {/* Confirmation Modal for Transaction Delete */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Transaction?"
        message={`Are you sure you want to delete transaction "${deleteTarget?.description || 'Selected Transaction'}"? This action cannot be undone.`}
        confirmText="Yes, Delete Transaction"
        loading={deleting}
      />
    </div>
  );
};
