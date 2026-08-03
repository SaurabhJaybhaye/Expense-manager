import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { CustomSelect } from './CustomSelect';
import { CreatableSelect } from './CreatableSelect';
import { useTransactions } from '../context/TransactionContext';
import { useCategories } from '../context/CategoryContext';
import { getCurrentDateTimeISO } from '../utils/dateParser';
import { preventNegativeKey, sanitizePositiveAmount, validatePositiveAmount } from '../utils/validators';
import { predictCategory } from '../services/aiEngine';
import { Sparkles, ArrowRightLeft, FilePlus } from 'lucide-react';

export const TransactionModal = ({ isOpen, onClose }) => {
  const { addTransaction, addTransfer, accounts } = useTransactions();
  const { incomeCategories, expenseCategories, addCategory } = useCategories();

  // Primary Mode: 'manual' | 'transfer'
  const [entryMode, setEntryMode] = useState('manual');

  // Manual Transaction States
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getCurrentDateTimeISO());
  const [category, setCategory] = useState('');
  const [account, setAccount] = useState(accounts[0]?.name || 'Cash In Hand');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState(null);

  // Transfer States
  const [fromAccount, setFromAccount] = useState(accounts[0]?.name || 'Primary Bank Account');
  const [toAccount, setToAccount] = useState(accounts[1]?.name || accounts[0]?.name || 'Cash In Hand');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferDesc, setTransferDesc] = useState('Internal Account Transfer');

  const activeCategories = type === 'income' ? incomeCategories : expenseCategories;

  useEffect(() => {
    if (isOpen) {
      setDate(getCurrentDateTimeISO());
      const cats = type === 'income' ? incomeCategories : expenseCategories;
      setCategory(cats[0] || '');
      setAccount(accounts[0]?.name || 'Cash In Hand');
      setFromAccount(accounts[0]?.name || 'Primary Bank Account');
      setToAccount(accounts[1]?.name || accounts[0]?.name || 'Cash In Hand');
      setAmount('');
      setTransferAmount('');
      setDescription('');
      setTransferDesc('Internal Account Transfer');
      setError('');
      setAiSuggestion(null);
    }
  }, [isOpen, type, accounts]);

  const handleTypeSwitch = (newType) => {
    setType(newType);
    const cats = newType === 'income' ? incomeCategories : expenseCategories;
    setCategory(cats[0] || '');
  };

  const handleDescriptionChange = (e) => {
    const val = e.target.value;
    setDescription(val);

    // AI Category Auto-Prediction
    const pred = predictCategory(val);
    if (pred.category) {
      setAiSuggestion(pred);
      setCategory(pred.category);
      if (pred.recommendedType && pred.recommendedType !== type) {
        setType(pred.recommendedType);
      }
    } else {
      setAiSuggestion(null);
    }
  };

  const handleAmountChange = (e) => {
    const val = sanitizePositiveAmount(e.target.value);
    setAmount(val);
    if (error) setError('');
  };

  const handleTransferAmountChange = (e) => {
    const val = sanitizePositiveAmount(e.target.value);
    setTransferAmount(val);
    if (error) setError('');
  };

  const handleCreateNewCategory = (newCatName) => {
    addCategory(newCatName, type);
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validation = validatePositiveAmount(amount);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    if (!date) {
      setError('Please select a valid date and time.');
      return;
    }

    if (!category) {
      setError('Please select or create a category.');
      return;
    }

    await addTransaction({
      amount: validation.amount,
      type,
      date,
      category,
      account,
      description: description.trim() || (type === 'income' ? 'Income Entry' : 'Expense Outflow')
    });

    setAmount('');
    setDescription('');
    onClose();
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (fromAccount === toAccount) {
      setError('Source account and destination account must be different.');
      return;
    }

    const validation = validatePositiveAmount(transferAmount);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    await addTransfer({
      fromAccount,
      toAccount,
      amount: validation.amount,
      date,
      description: transferDesc.trim() || 'Internal Account Transfer'
    });

    setTransferAmount('');
    onClose();
  };

  const accountOptions = accounts.map(acc => ({ value: acc.name, label: `${acc.name} (${acc.type})` }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Transaction">
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

      {/* Entry Mode Switcher Header Tabs */}
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
          onClick={() => { setEntryMode('manual'); setError(''); }}
          style={{
            backgroundColor: entryMode === 'manual' ? 'var(--bg-card)' : 'transparent',
            color: entryMode === 'manual' ? 'var(--accent-neon-green)' : 'var(--text-secondary)',
            border: entryMode === 'manual' ? '1px solid var(--accent-neon-green)' : '1px solid transparent',
            fontWeight: 600
          }}
        >
          <FilePlus size={16} />
          <span>Record Manual Transaction</span>
        </button>

        <button
          type="button"
          className="btn"
          onClick={() => { setEntryMode('transfer'); setError(''); }}
          style={{
            backgroundColor: entryMode === 'transfer' ? 'var(--bg-card)' : 'transparent',
            color: entryMode === 'transfer' ? 'var(--accent-electric-blue)' : 'var(--text-secondary)',
            border: entryMode === 'transfer' ? '1px solid var(--accent-electric-blue)' : '1px solid transparent',
            fontWeight: 600
          }}
        >
          <ArrowRightLeft size={16} />
          <span>Account Transfer</span>
        </button>
      </div>

      {/* FORM 1: Record Manual Transaction */}
      {entryMode === 'manual' && (
        <form onSubmit={handleManualSubmit}>
          {/* Income / Expense Flow Toggle */}
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

          {/* 1. Description / Note Input */}
          <div className="form-group">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label className="form-label">Description / Note</label>
              {aiSuggestion && (
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-neon-green)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Sparkles size={12} /> Auto-suggested "{aiSuggestion.category}"
                </span>
              )}
            </div>
            <input
              type="text"
              placeholder="e.g. Swiggy dinner, Uber cab, Netflix, Salary..."
              className="form-input"
              value={description}
              onChange={handleDescriptionChange}
              autoFocus
            />
          </div>

          {/* 2. Category Field FIRST (Interchanged position with Amount) */}
          <div className="form-group">
            <CreatableSelect
              label="Category"
              options={activeCategories}
              value={category}
              onChange={setCategory}
              onCreateNew={handleCreateNewCategory}
              placeholder="Search or create category..."
            />
          </div>

          {/* 3. Amount Field SECOND (Interchanged position with Category) */}
          <div className="form-group">
            <label className="form-label">Amount (INR ₹)</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              className="form-input"
              value={amount}
              onKeyDown={preventNegativeKey}
              onChange={handleAmountChange}
              required
            />
          </div>

          {/* 4. Date & Time and Payment Account Grid */}
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
              <CustomSelect
                label="Payment Account"
                options={accountOptions}
                value={account}
                onChange={setAccount}
              />
            </div>
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
      )}

      {/* FORM 2: Account Transfer Mode */}
      {entryMode === 'transfer' && (
        <form onSubmit={handleTransferSubmit}>
          <div className="form-group">
            <label className="form-label">Transfer Amount (INR ₹)</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              className="form-input"
              value={transferAmount}
              onKeyDown={preventNegativeKey}
              onChange={handleTransferAmountChange}
              autoFocus
              required
            />
          </div>

          {/* From & To Accounts Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <CustomSelect
                label="From Account (Source)"
                options={accountOptions}
                value={fromAccount}
                onChange={setFromAccount}
              />
            </div>

            <div className="form-group">
              <CustomSelect
                label="To Account (Destination)"
                options={accountOptions}
                value={toAccount}
                onChange={setToAccount}
              />
            </div>
          </div>

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
            <label className="form-label">Description / Note</label>
            <input
              type="text"
              placeholder="e.g. ATM withdrawal, Bank to Cash transfer..."
              className="form-input"
              value={transferDesc}
              onChange={(e) => setTransferDesc(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ backgroundColor: 'var(--accent-electric-blue)', color: '#0b0e14' }}>
              Complete Transfer
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
