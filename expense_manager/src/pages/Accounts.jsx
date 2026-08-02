import React, { useState } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { formatCurrency } from '../utils/currencyFormatter';
import { Landmark, Banknote, CreditCard, PiggyBank, PlusCircle } from 'lucide-react';
import { Modal } from '../components/Modal';
import { CustomSelect } from '../components/CustomSelect';
import { preventNegativeKey, sanitizePositiveAmount } from '../utils/validators';

export const Accounts = () => {
  const { accounts, addAccount, transactions, currency } = useTransactions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('bank');
  const [balance, setBalance] = useState('');

  const accountTypeOptions = [
    { value: 'bank', label: 'Bank Account' },
    { value: 'cash', label: 'Cash in Hand' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'savings', label: 'Savings Vault' }
  ];

  const getAccountIcon = (accType) => {
    switch (accType) {
      case 'cash': return <Banknote size={22} color="#00ff87" />;
      case 'credit_card': return <CreditCard size={22} color="#ec4899" />;
      case 'savings': return <PiggyBank size={22} color="#a855f7" />;
      default: return <Landmark size={22} color="#60a5fa" />;
    }
  };

  const handleAddAccount = (e) => {
    e.preventDefault();
    if (!name || balance === '') return;
    addAccount({
      name,
      type,
      balance: parseFloat(balance) || 0,
      currency
    });
    setName('');
    setBalance('');
    setIsModalOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Account & Multi-Asset Hub
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Monitor balances across Cash, Bank Accounts, and Credit Cards.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <PlusCircle size={18} />
          <span>Add Account</span>
        </button>
      </div>

      <div className="grid-3">
        {accounts.map((acc) => {
          // Calculate live total activity on this account
          const accTx = transactions.filter(t => t.account?.toLowerCase() === acc.name.toLowerCase());
          const txInflow = accTx.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount || 0), 0);
          const txOutflow = accTx.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount || 0), 0);
          const computedBalance = (acc.balance || 0) + txInflow - txOutflow;

          return (
            <div key={acc.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)'
                  }}>
                    {getAccountIcon(acc.type)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {acc.name}
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                      {acc.type.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <span className="badge" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--accent-electric-blue)' }}>
                  {currency}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Current Balance</span>
                <h4 style={{
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  color: computedBalance >= 0 ? 'var(--accent-neon-green)' : 'var(--accent-neon-pink)'
                }}>
                  {formatCurrency(computedBalance, currency)}
                </h4>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.8rem',
                borderTop: '1px solid var(--border-color)',
                paddingTop: '0.75rem',
                color: 'var(--text-muted)'
              }}>
                <span>Logged Transactions: <strong>{accTx.length}</strong></span>
                <span>Type: <strong>{acc.type}</strong></span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Account Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Asset Account">
        <form onSubmit={handleAddAccount}>
          <div className="form-group">
            <label className="form-label">Account Name</label>
            <input
              type="text"
              placeholder="e.g. Axis Salary Bank, Paytm Wallet..."
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <CustomSelect
              label="Account Type"
              options={accountTypeOptions}
              value={type}
              onChange={setType}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Opening Balance ({currency})</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              className="form-input"
              value={balance}
              onKeyDown={preventNegativeKey}
              onChange={(e) => setBalance(sanitizePositiveAmount(e.target.value))}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Account
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
