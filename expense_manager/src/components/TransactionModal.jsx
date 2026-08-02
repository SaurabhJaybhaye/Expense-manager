import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { useTransactions } from '../context/TransactionContext';
import { DEFAULT_CATEGORIES } from '../constants/categories';
import { getCurrentDateTimeISO } from '../utils/dateParser';

export const TransactionModal = ({ isOpen, onClose }) => {
  const { addTransaction, accounts } = useTransactions();
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getCurrentDateTimeISO());
  const [category, setCategory] = useState(DEFAULT_CATEGORIES.EXPENSE[0].name);
  const [account, setAccount] = useState(accounts[0]?.name || 'Cash');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setDate(getCurrentDateTimeISO());
    }
  }, [isOpen]);

  const handleTypeSwitch = (newType) => {
    setType(newType);
    const catList = newType === 'income' ? DEFAULT_CATEGORIES.INCOME : DEFAULT_CATEGORIES.EXPENSE;
    setCategory(catList[0].name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }
    if (!date) {
      setError('Please select a valid date and time.');
      return;
    }

    await addTransaction({
      amount: numAmount,
      type,
      date,
      category,
      account,
      description: description.trim() || (type === 'income' ? 'Income Entry' : 'Expense Outflow')
    });

    // Reset & Close
    setAmount('');
    setDescription('');
    onClose();
  };

  const activeCategories = type === 'income' ? DEFAULT_CATEGORIES.INCOME : DEFAULT_CATEGORIES.EXPENSE;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Manual Transaction">
      {error && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          color: 'var(--color-danger)',
          padding: '0.65rem 0.85rem',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.85rem',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Income / Expense Toggle */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.5rem',
          backgroundColor: 'var(--bg-secondary)',
          padding: '0.35rem',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '1.25rem'
        }}>
          <button
            type="button"
            className="btn"
            onClick={() => handleTypeSwitch('expense')}
            style={{
              backgroundColor: type === 'expense' ? 'var(--accent-neon-pink)' : 'transparent',
              color: type === 'expense' ? '#fff' : 'var(--text-secondary)',
              boxShadow: type === 'expense' ? '0 0 12px var(--accent-neon-pink-glow)' : 'none'
            }}
          >
            Outflow (Expense)
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => handleTypeSwitch('income')}
            style={{
              backgroundColor: type === 'income' ? 'var(--accent-neon-green)' : 'transparent',
              color: type === 'income' ? '#0b0e14' : 'var(--text-secondary)',
              boxShadow: type === 'income' ? '0 0 12px var(--accent-neon-green-glow)' : 'none'
            }}
          >
            Inflow (Income)
          </button>
        </div>

        {/* Amount Input */}
        <div className="form-group">
          <label className="form-label">Amount (INR ₹)</label>
          <input
            type="number"
            step="0.01"
            placeholder="0.00"
            className="form-input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            autoFocus
          />
        </div>

        {/* Date & Time and Category Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Date & Time</label>
            <input
              type="datetime-local"
              className="form-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {activeCategories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Account Selection */}
        <div className="form-group">
          <label className="form-label">Payment Account</label>
          <select
            className="form-select"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
          >
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.name}>
                {acc.name} ({acc.type})
              </option>
            ))}
          </select>
        </div>

        {/* Description / Note */}
        <div className="form-group">
          <label className="form-label">Description / Note</label>
          <input
            type="text"
            placeholder="e.g. Swiggy order, Client invoice..."
            className="form-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Save Transaction
          </button>
        </div>
      </form>
    </Modal>
  );
};
