import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { CustomSelect } from './CustomSelect';
import { CreatableSelect } from './CreatableSelect';
import { useTransactions } from '../context/TransactionContext';
import { useCategories } from '../context/CategoryContext';
import { getCurrentDateTimeISO } from '../utils/dateParser';
import { preventNegativeKey, sanitizePositiveAmount, validatePositiveAmount } from '../utils/validators';
import { predictCategory } from '../services/aiEngine';
import { Sparkles } from 'lucide-react';

export const TransactionModal = ({ isOpen, onClose }) => {
  const { addTransaction, accounts } = useTransactions();
  const { incomeCategories, expenseCategories, addCategory } = useCategories();

  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getCurrentDateTimeISO());
  const [category, setCategory] = useState('');
  const [account, setAccount] = useState(accounts[0]?.name || 'Cash');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState(null);

  const activeCategories = type === 'income' ? incomeCategories : expenseCategories;

  useEffect(() => {
    if (isOpen) {
      setDate(getCurrentDateTimeISO());
      const cats = type === 'income' ? incomeCategories : expenseCategories;
      setCategory(cats[0] || '');
      setAccount(accounts[0]?.name || 'Cash');
      setAmount('');
      setDescription('');
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

  const handleCreateNewCategory = (newCatName) => {
    addCategory(newCatName, type);
  };

  const handleSubmit = async (e) => {
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

  const accountOptions = accounts.map(acc => ({ value: acc.name, label: `${acc.name} (${acc.type})` }));

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

        {/* Description / Note Input FIRST for AI auto-categorization */}
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

        {/* Amount Input */}
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

        {/* Date & Time and Creatable Category Grid */}
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
            <CreatableSelect
              label="Category"
              options={activeCategories}
              value={category}
              onChange={setCategory}
              onCreateNew={handleCreateNewCategory}
              placeholder="Search or create category..."
            />
          </div>
        </div>

        {/* Account Selection */}
        <div className="form-group">
          <CustomSelect
            label="Payment Account"
            options={accountOptions}
            value={account}
            onChange={setAccount}
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
