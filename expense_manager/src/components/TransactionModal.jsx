import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { CustomSelect } from './CustomSelect';
import { CreatableSelect } from './CreatableSelect';
import { useTransactions } from '../context/TransactionContext';
import { useCategories } from '../context/CategoryContext';
import { getCurrentDateTimeISO } from '../utils/dateParser';
import { preventNegativeKey, sanitizePositiveAmount, validatePositiveAmount } from '../utils/validators';
import { predictCategory } from '../services/aiEngine';
import { Sparkles, ArrowDownRight, ArrowUpRight, ArrowRightLeft } from 'lucide-react';

export const TransactionModal = ({ isOpen, onClose }) => {
  const { addTransaction, addTransfer, accounts } = useTransactions();
  const { incomeCategories, expenseCategories, addCategory } = useCategories();

  // 3 Flow Sections: 'expense' (Outflow) | 'income' (Inflow) | 'transfer' (Account Transfer)
  const [section, setSection] = useState('expense');

  // Form Field States
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getCurrentDateTimeISO());
  const [category, setCategory] = useState('');
  const [account, setAccount] = useState(accounts[0]?.name || 'Cash In Hand');
  const [fromAccount, setFromAccount] = useState(accounts[0]?.name || 'Primary Bank Account');
  const [toAccount, setToAccount] = useState(accounts[1]?.name || accounts[0]?.name || 'Cash In Hand');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState(null);

  const activeCategories = section === 'income' ? incomeCategories : expenseCategories;

  useEffect(() => {
    if (isOpen) {
      setDate(getCurrentDateTimeISO());
      const cats = section === 'income' ? incomeCategories : expenseCategories;
      setCategory(section === 'transfer' ? 'Account Transfer' : cats[0] || '');
      setAccount(accounts[0]?.name || 'Cash In Hand');
      setFromAccount(accounts[0]?.name || 'Primary Bank Account');
      setToAccount(accounts[1]?.name || accounts[0]?.name || 'Cash In Hand');
      setAmount('');
      setDescription('');
      setError('');
      setAiSuggestion(null);
    }
  }, [isOpen, section, accounts]);

  const handleSectionSwitch = (newSection) => {
    setSection(newSection);
    setError('');
    if (newSection === 'transfer') {
      setCategory('Account Transfer');
      if (!description || description === 'Income Entry' || description === 'Expense Outflow') {
        setDescription('Internal Account Transfer');
      }
    } else {
      const cats = newSection === 'income' ? incomeCategories : expenseCategories;
      setCategory(cats[0] || '');
      if (description === 'Internal Account Transfer') {
        setDescription('');
      }
    }
  };

  const handleDescriptionChange = (e) => {
    const val = e.target.value;
    setDescription(val);

    if (section !== 'transfer') {
      // AI Category Auto-Prediction
      const pred = predictCategory(val);
      if (pred.category) {
        setAiSuggestion(pred);
        setCategory(pred.category);
        if (pred.recommendedType && pred.recommendedType !== section) {
          setSection(pred.recommendedType);
        }
      } else {
        setAiSuggestion(null);
      }
    }
  };

  const handleAmountChange = (e) => {
    const val = sanitizePositiveAmount(e.target.value);
    setAmount(val);
    if (error) setError('');
  };

  const handleCreateNewCategory = (newCatName) => {
    if (section !== 'transfer') {
      addCategory(newCatName, section);
    }
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

    // Handle Transfer Section
    if (section === 'transfer') {
      if (fromAccount === toAccount) {
        setError('Source account (From) and Destination account (To) must be different.');
        return;
      }

      await addTransfer({
        fromAccount,
        toAccount,
        amount: validation.amount,
        date,
        description: description.trim() || 'Internal Account Transfer'
      });
    } else {
      // Handle Outflow (Expense) or Inflow (Income) Sections
      if (!category) {
        setError('Please select or create a category.');
        return;
      }

      await addTransaction({
        amount: validation.amount,
        type: section,
        date,
        category,
        account,
        description: description.trim() || (section === 'income' ? 'Income Entry' : 'Expense Outflow')
      });
    }

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
        {/* 3 Section Flow Switcher: Outflow | Inflow | Transfer */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.35rem',
          backgroundColor: 'var(--bg-secondary)',
          padding: '0.35rem',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '1.25rem'
        }}>
          {/* Section 1: Outflow (Expense) */}
          <button
            type="button"
            className="btn"
            onClick={() => handleSectionSwitch('expense')}
            style={{
              fontSize: '0.8rem',
              padding: '0.5rem 0.35rem',
              backgroundColor: section === 'expense' ? 'var(--accent-neon-pink)' : 'transparent',
              color: section === 'expense' ? '#fff' : 'var(--text-secondary)',
              boxShadow: section === 'expense' ? '0 0 12px var(--accent-neon-pink-glow)' : 'none',
              justifyContent: 'center'
            }}
          >
            <ArrowDownRight size={14} />
            <span>Outflow</span>
          </button>

          {/* Section 2: Inflow (Income) */}
          <button
            type="button"
            className="btn"
            onClick={() => handleSectionSwitch('income')}
            style={{
              fontSize: '0.8rem',
              padding: '0.5rem 0.35rem',
              backgroundColor: section === 'income' ? 'var(--accent-neon-green)' : 'transparent',
              color: section === 'income' ? '#0b0e14' : 'var(--text-secondary)',
              boxShadow: section === 'income' ? '0 0 12px var(--accent-neon-green-glow)' : 'none',
              justifyContent: 'center'
            }}
          >
            <ArrowUpRight size={14} />
            <span>Inflow</span>
          </button>

          {/* Section 3: Transfer (Account Transfer) */}
          <button
            type="button"
            className="btn"
            onClick={() => handleSectionSwitch('transfer')}
            style={{
              fontSize: '0.8rem',
              padding: '0.5rem 0.35rem',
              backgroundColor: section === 'transfer' ? 'var(--accent-electric-blue)' : 'transparent',
              color: section === 'transfer' ? '#0b0e14' : 'var(--text-secondary)',
              boxShadow: section === 'transfer' ? '0 0 12px var(--accent-electric-blue-glow)' : 'none',
              justifyContent: 'center'
            }}
          >
            <ArrowRightLeft size={14} />
            <span>Transfer</span>
          </button>
        </div>

        {/* 1. Description / Note Input */}
        <div className="form-group">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label className="form-label">Description / Note</label>
            {aiSuggestion && section !== 'transfer' && (
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-neon-green)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Sparkles size={12} /> Auto-suggested "{aiSuggestion.category}"
              </span>
            )}
          </div>
          <input
            type="text"
            placeholder={section === 'transfer' ? 'e.g. ATM cash withdrawal, Bank to Cash...' : 'e.g. Swiggy dinner, Uber cab, Netflix, Salary...'}
            className="form-input"
            value={description}
            onChange={handleDescriptionChange}
            autoFocus
          />
        </div>

        {/* 2. Category Field FIRST (Interchanged position with Amount) */}
        <div className="form-group">
          {section === 'transfer' ? (
            <div>
              <label className="form-label">Category</label>
              <input
                type="text"
                className="form-input"
                value="Account Transfer"
                disabled
                style={{ opacity: 0.75, cursor: 'not-allowed' }}
              />
            </div>
          ) : (
            <CreatableSelect
              label="Category"
              options={activeCategories}
              value={category}
              onChange={setCategory}
              onCreateNew={handleCreateNewCategory}
              placeholder="Search or create category..."
            />
          )}
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

        {/* 4. Account & Date Grid (For Transfer vs Normal Outflow/Inflow) */}
        {section === 'transfer' ? (
          <>
            {/* From (Source) & To (Destination) Account Grid for Transfer Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <CustomSelect
                  label="From Account (Source)"
                  options={accountOptions}
                  value={fromAccount}
                  onChange={setFromAccount}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
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
          </>
        ) : (
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
        )}

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            style={{
              backgroundColor: section === 'transfer' ? 'var(--accent-electric-blue)' : (section === 'income' ? 'var(--accent-neon-green)' : 'var(--accent-neon-pink)'),
              color: section === 'expense' ? '#ffffff' : '#0b0e14'
            }}
          >
            {section === 'transfer' ? 'Complete Transfer' : 'Save Transaction'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
