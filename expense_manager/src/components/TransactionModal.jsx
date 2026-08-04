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

export const TransactionModal = ({ isOpen, onClose, editingTransaction = null }) => {
  const { addTransaction, updateTransaction, addTransfer, accounts } = useTransactions();
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
      if (editingTransaction) {
        // Edit Mode Pre-population with robust Date formatting
        const isTxTransfer = editingTransaction.isTransfer || editingTransaction.category === 'Account Transfer';
        const initialSection = isTxTransfer ? 'transfer' : (editingTransaction.type === 'income' ? 'income' : 'expense');
        
        setSection(initialSection);
        setAmount(String(editingTransaction.amount || ''));

        let formattedDate = getCurrentDateTimeISO();
        if (editingTransaction.date) {
          const raw = String(editingTransaction.date).trim();
          if (raw.includes('T')) {
            formattedDate = raw.substring(0, 16);
          } else if (raw.length === 10) {
            formattedDate = `${raw}T12:00`;
          }
        }
        setDate(formattedDate);

        setCategory(editingTransaction.category || '');
        setAccount(editingTransaction.account || accounts[0]?.name || 'Cash In Hand');
        setFromAccount(editingTransaction.account || accounts[0]?.name || 'Primary Bank Account');
        setToAccount(accounts[1]?.name || accounts[0]?.name || 'Cash In Hand');
        setDescription(editingTransaction.description || '');
        setError('');
        setAiSuggestion(null);
      } else {
        // Create Mode Initialization
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
    }
  }, [isOpen, editingTransaction, accounts]);

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
      if (pred && pred.confidence > 0.5) {
        setAiSuggestion(pred.category);
      } else {
        setAiSuggestion(null);
      }
    }
  };

  const handleApplyAiSuggestion = () => {
    if (aiSuggestion) {
      setCategory(aiSuggestion);
      addCategory(aiSuggestion, section === 'income' ? 'income' : 'expense');
      setAiSuggestion(null);
    }
  };

  const handleCategoryChange = (selectedVal) => {
    setCategory(selectedVal);
    if (section !== 'transfer') {
      addCategory(selectedVal, section === 'income' ? 'income' : 'expense');
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

    const targetDate = date || (editingTransaction ? editingTransaction.date : getCurrentDateTimeISO());

    if (editingTransaction) {
      // Execute Edit Transaction Update
      await updateTransaction({
        id: editingTransaction.id,
        amount: validation.amount,
        type: section === 'transfer' ? (editingTransaction.type || 'expense') : section,
        date: targetDate,
        category: section === 'transfer' ? 'Account Transfer' : category,
        account,
        description: description.trim() || (section === 'income' ? 'Income Entry' : 'Expense Outflow')
      });
      onClose();
      return;
    }

    // Handle New Transfer Section Creation
    if (section === 'transfer') {
      if (fromAccount === toAccount) {
        setError('Source account (From) and Destination account (To) must be different.');
        return;
      }

      await addTransfer({
        fromAccount,
        toAccount,
        amount: validation.amount,
        date: targetDate,
        description: description.trim() || 'Internal Account Transfer'
      });
    } else {
      // Handle New Outflow (Expense) or Inflow (Income) Section Creation
      if (!category) {
        setError('Please select or create a category.');
        return;
      }

      await addTransaction({
        amount: validation.amount,
        type: section,
        date: targetDate,
        category,
        account,
        description: description.trim() || (section === 'income' ? 'Income Entry' : 'Expense Outflow')
      });
    }

    onClose();
  };

  const accountOptions = accounts.map(acc => ({
    value: acc.name,
    label: `${acc.name} (${acc.type.replace('_', ' ')})`
  }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingTransaction ? 'Edit Transaction Entry' : 'Record Manual Transaction'}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: 'var(--color-danger)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem'
          }}>
            {error}
          </div>
        )}

        {/* 3 Flow Section Pills: Outflow | Inflow | Transfer */}
        {!editingTransaction && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label className="form-label">Flow Section</label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.5rem',
              backgroundColor: 'var(--bg-secondary)',
              padding: '0.35rem',
              borderRadius: 'var(--radius-sm)'
            }}>
              <button
                type="button"
                className="btn"
                onClick={() => handleSectionSwitch('expense')}
                style={{
                  fontSize: '0.85rem',
                  padding: '0.5rem',
                  backgroundColor: section === 'expense' ? 'var(--bg-card)' : 'transparent',
                  color: section === 'expense' ? 'var(--accent-neon-pink)' : 'var(--text-secondary)',
                  border: section === 'expense' ? '1px solid var(--accent-neon-pink)' : '1px solid transparent'
                }}
              >
                <ArrowDownRight size={15} />
                <span>Outflow</span>
              </button>

              <button
                type="button"
                className="btn"
                onClick={() => handleSectionSwitch('income')}
                style={{
                  fontSize: '0.85rem',
                  padding: '0.5rem',
                  backgroundColor: section === 'income' ? 'var(--bg-card)' : 'transparent',
                  color: section === 'income' ? 'var(--accent-neon-green)' : 'var(--text-secondary)',
                  border: section === 'income' ? '1px solid var(--accent-neon-green)' : '1px solid transparent'
                }}
              >
                <ArrowUpRight size={15} />
                <span>Inflow</span>
              </button>

              <button
                type="button"
                className="btn"
                onClick={() => handleSectionSwitch('transfer')}
                style={{
                  fontSize: '0.85rem',
                  padding: '0.5rem',
                  backgroundColor: section === 'transfer' ? 'var(--bg-card)' : 'transparent',
                  color: section === 'transfer' ? 'var(--accent-electric-blue)' : 'var(--text-secondary)',
                  border: section === 'transfer' ? '1px solid var(--accent-electric-blue)' : '1px solid transparent'
                }}
              >
                <ArrowRightLeft size={15} />
                <span>Transfer</span>
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Fields for Outflow or Inflow Sections */}
        {section !== 'transfer' && (
          <>
            {/* POSITION 1: Category Field with Creatable Select */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <CreatableSelect
                label={`Category (${section === 'income' ? 'Income Tag' : 'Expense Category'})`}
                options={activeCategories}
                value={category}
                onChange={handleCategoryChange}
                placeholder="Select or type new category..."
              />
            </div>

            {/* AI Category Auto-Suggestion Banner */}
            {aiSuggestion && aiSuggestion !== category && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'var(--accent-neon-purple-glow)',
                border: '1px solid var(--accent-neon-purple)',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                color: 'var(--accent-neon-purple)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Sparkles size={14} />
                  <span>AI Suggested Category: <strong>{aiSuggestion}</strong></span>
                </div>
                <button
                  type="button"
                  onClick={handleApplyAiSuggestion}
                  style={{
                    background: 'var(--accent-neon-purple)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '0.2rem 0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Apply Tag
                </button>
              </div>
            )}

            {/* POSITION 2: Amount Field */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Amount (INR ₹)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                className="form-input"
                value={amount}
                onKeyDown={preventNegativeKey}
                onChange={(e) => setAmount(sanitizePositiveAmount(e.target.value))}
                required
              />
            </div>

            {/* Payment Account */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <CustomSelect
                label="Payment Account"
                options={accountOptions}
                value={account}
                onChange={setAccount}
              />
            </div>
          </>
        )}

        {/* Dynamic Fields for Transfer Section */}
        {section === 'transfer' && (
          <>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <CustomSelect
                label="From Account (Source Outflow)"
                options={accountOptions}
                value={fromAccount}
                onChange={setFromAccount}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <CustomSelect
                label="To Account (Destination Inflow)"
                options={accountOptions}
                value={toAccount}
                onChange={setToAccount}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Transfer Amount (INR ₹)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                className="form-input"
                value={amount}
                onKeyDown={preventNegativeKey}
                onChange={(e) => setAmount(sanitizePositiveAmount(e.target.value))}
                required
              />
            </div>
          </>
        )}

        {/* Date & Time Picker */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Date & Time</label>
          <input
            type="datetime-local"
            className="form-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        {/* Note / Description */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Description / Note (Optional)</label>
          <input
            type="text"
            placeholder={section === 'transfer' ? 'Internal Account Transfer' : 'e.g. Starbucks Coffee, Amazon Order...'}
            className="form-input"
            value={description}
            onChange={handleDescriptionChange}
          />
        </div>

        {/* Form Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {editingTransaction ? 'Save Changes' : (section === 'transfer' ? 'Execute Transfer' : 'Record Transaction')}
          </button>
        </div>
      </form>
    </Modal>
  );
};
