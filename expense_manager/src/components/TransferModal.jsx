import React, { useState } from 'react';
import { Modal } from './Modal';
import { CustomSelect } from './CustomSelect';
import { useTransactions } from '../context/TransactionContext';
import { getCurrentDateTimeISO } from '../utils/dateParser';
import { preventNegativeKey, sanitizePositiveAmount, validatePositiveAmount } from '../utils/validators';
import { ArrowRightLeft } from 'lucide-react';

export const TransferModal = ({ isOpen, onClose }) => {
  const { accounts, addTransfer } = useTransactions();
  const [fromAccount, setFromAccount] = useState(accounts[0]?.name || '');
  const [toAccount, setToAccount] = useState(accounts[1]?.name || accounts[0]?.name || '');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getCurrentDateTimeISO());
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const accountOptions = accounts.map(acc => ({ value: acc.name, label: acc.name }));

  const handleAmountChange = (e) => {
    const val = sanitizePositiveAmount(e.target.value);
    setAmount(val);
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validation = validatePositiveAmount(amount);
    if (!validation.isValid) {
      setError('Transfer amount must be a positive number greater than ₹0.00');
      return;
    }

    if (fromAccount === toAccount) {
      setError('Source and Destination accounts must be different.');
      return;
    }

    await addTransfer({
      fromAccount,
      toAccount,
      amount: validation.amount,
      date,
      description: description.trim() || `Internal Transfer (${fromAccount} → ${toAccount})`
    });

    setAmount('');
    setDescription('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Account-to-Account Transfer">
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
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1.25rem'
        }}>
          <div style={{ margin: 0 }}>
            <CustomSelect
              label="From Account"
              options={accountOptions}
              value={fromAccount}
              onChange={setFromAccount}
            />
          </div>

          <div style={{
            padding: '0.5rem',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--accent-electric-blue)',
            marginTop: '1.25rem'
          }}>
            <ArrowRightLeft size={18} />
          </div>

          <div style={{ margin: 0 }}>
            <CustomSelect
              label="To Account"
              options={accountOptions}
              value={toAccount}
              onChange={setToAccount}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Transfer Amount (INR ₹)</label>
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
            autoFocus
          />
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
          <label className="form-label">Description / Memo</label>
          <input
            type="text"
            placeholder="e.g. ATM Cash Withdrawal, Savings Transfer..."
            className="form-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Confirm Transfer
          </button>
        </div>
      </form>
    </Modal>
  );
};
