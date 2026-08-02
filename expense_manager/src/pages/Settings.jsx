import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionContext';
import { CURRENCY_MAP } from '../utils/currencyFormatter';
import { exportToCSV, exportToJSON } from '../services/exportEngine';
import { User, Globe, Download, Check, ShieldCheck, Sparkles, FileSpreadsheet, FileJson } from 'lucide-react';

export const Settings = () => {
  const { currentUser } = useAuth();
  const { currency, setCurrency, transactions } = useTransactions();
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [isSaved, setIsSaved] = useState(false);
  const [exportMessage, setExportMessage] = useState('');

  const handleProfileSave = (e) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleExportCSV = () => {
    const success = exportToCSV(transactions);
    if (success) {
      setExportMessage('CSV ledger file downloaded successfully!');
      setTimeout(() => setExportMessage(''), 3000);
    }
  };

  const handleExportJSON = () => {
    const success = exportToJSON(transactions);
    if (success) {
      setExportMessage('JSON ledger backup file downloaded successfully!');
      setTimeout(() => setExportMessage(''), 3000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Settings & Preferences
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Manage your user profile, currency display units, and ledger backups.
        </p>
      </div>

      {/* Profile Section */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <User size={22} color="var(--accent-neon-green)" />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            User Profile & Identity
          </h3>
        </div>

        <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '500px' }}>
          <div className="form-group">
            <label className="form-label">Display Name</label>
            <input
              type="text"
              className="form-input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Alex Rivers"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              value={currentUser?.email || 'demo@expensemanager.app'}
              disabled
              style={{ opacity: 0.6, cursor: 'not-allowed' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button type="submit" className="btn btn-primary">
              Save Profile
            </button>
            {isSaved && (
              <span style={{ fontSize: '0.85rem', color: 'var(--accent-neon-green)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Check size={16} /> Saved!
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Multi-Currency Switcher Section */}
      <div className="glass-card glass-card-glow-green">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <Globe size={22} color="var(--accent-electric-blue)" />
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Display Currency Switcher
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Select your default currency. All balances, charts, and metrics update instantly.
            </p>
          </div>
        </div>

        <div className="grid-3">
          {Object.keys(CURRENCY_MAP).map((code) => {
            const item = CURRENCY_MAP[code];
            const isSelected = currency === code;
            return (
              <div
                key={code}
                onClick={() => setCurrency(code)}
                style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isSelected ? 'var(--bg-card)' : 'var(--bg-secondary)',
                  border: isSelected ? '2px solid var(--accent-neon-green)' : '1px solid var(--border-color)',
                  boxShadow: isSelected ? '0 0 16px var(--accent-neon-green-glow)' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: isSelected ? 'var(--accent-neon-green)' : 'var(--text-primary)' }}>
                    {code} ({item.symbol})
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    {item.label}
                  </div>
                </div>
                {isSelected && (
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent-neon-green)',
                    color: '#0b0e14',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Check size={18} strokeWidth={3} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Ledger Data Export Section */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <Download size={22} color="var(--accent-neon-purple)" />
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Ledger Data Export Engine
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Download your complete financial records in CSV spreadsheet or JSON backup formats.
            </p>
          </div>
        </div>

        {exportMessage && (
          <div style={{
            backgroundColor: 'var(--accent-neon-green-glow)',
            border: '1px solid var(--accent-neon-green)',
            color: 'var(--accent-neon-green)',
            padding: '0.65rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Check size={16} /> {exportMessage}
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={handleExportCSV}>
            <FileSpreadsheet size={18} />
            <span>Export to CSV Spreadsheet</span>
          </button>

          <button className="btn btn-secondary" onClick={handleExportJSON}>
            <FileJson size={18} />
            <span>Export to JSON Backup</span>
          </button>
        </div>
      </div>

      {/* Version & Build Information Card */}
      <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ShieldCheck size={24} color="var(--accent-neon-green)" />
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>Expense Manager</span>
              <span className="badge" style={{ backgroundColor: 'var(--accent-neon-purple-glow)', color: 'var(--accent-neon-purple)', border: '1px solid rgba(168, 85, 247, 0.4)' }}>
                v1.2.0 Release
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Gen Z Dark Mode Design System • Full Widescreen Grid • Multi-Currency Engine
            </p>
          </div>
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'right' }}>
          <Sparkles size={14} color="var(--accent-neon-green)" style={{ marginRight: '0.35rem' }} />
          Owner Isolated & Secured
        </div>
      </div>
    </div>
  );
};
