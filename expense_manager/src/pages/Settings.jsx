import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionContext';
import { useCategories } from '../context/CategoryContext';
import { CURRENCY_MAP } from '../utils/currencyFormatter';
import { exportToCSV, exportToJSON } from '../services/exportEngine';
import { User, Globe, Download, Check, ShieldCheck, Sparkles, FileSpreadsheet, FileJson, Tags, PlusCircle, Pencil, Trash2 } from 'lucide-react';
import { Modal } from '../components/Modal';

export const Settings = () => {
  const { currentUser } = useAuth();
  const { currency, setCurrency, transactions } = useTransactions();
  const { incomeCategories, expenseCategories, addCategory, updateCategory, deleteCategory } = useCategories();

  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [isSaved, setIsSaved] = useState(false);
  const [exportMessage, setExportMessage] = useState('');

  // Category Manager States
  const [activeCategoryType, setActiveCategoryType] = useState('expense');
  const [newCatName, setNewCatName] = useState('');
  const [isAddCatModalOpen, setIsAddCatModalOpen] = useState(false);
  const [isEditCatModalOpen, setIsEditCatModalOpen] = useState(false);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [renamedCategoryName, setRenamedCategoryName] = useState('');

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

  const handleCreateCategory = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory(newCatName.trim(), activeCategoryType);
    setNewCatName('');
    setIsAddCatModalOpen(false);
  };

  const handleOpenEditCat = (catName) => {
    setEditingCategoryName(catName);
    setRenamedCategoryName(catName);
    setIsEditCatModalOpen(true);
  };

  const handleSaveRenameCat = (e) => {
    e.preventDefault();
    if (!renamedCategoryName.trim() || !editingCategoryName) return;
    updateCategory(editingCategoryName, renamedCategoryName.trim(), activeCategoryType);
    setEditingCategoryName('');
    setRenamedCategoryName('');
    setIsEditCatModalOpen(false);
  };

  const handleDeleteCat = (catName) => {
    if (window.confirm(`Delete category "${catName}"?`)) {
      deleteCategory(catName, activeCategoryType);
    }
  };

  const currentCategoryList = activeCategoryType === 'income' ? incomeCategories : expenseCategories;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Settings & Preferences
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Manage user profiles, custom categories, currency display units, and ledger backups.
        </p>
      </div>

      {/* Category Manager Section */}
      <div className="glass-card glass-card-glow-purple">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Tags size={22} color="var(--accent-neon-purple)" />
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Category Management Hub
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Create, edit/rename, or delete Income and Expense transaction categories.
              </p>
            </div>
          </div>

          <button className="btn btn-primary" onClick={() => { setNewCatName(''); setIsAddCatModalOpen(true); }}>
            <PlusCircle size={18} />
            <span>Add Custom Category</span>
          </button>
        </div>

        {/* Category Type Switcher (Income vs Expense) */}
        <div style={{
          display: 'inline-flex',
          gap: '0.5rem',
          backgroundColor: 'var(--bg-secondary)',
          padding: '0.35rem',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '1.25rem'
        }}>
          <button
            type="button"
            className="btn"
            onClick={() => setActiveCategoryType('expense')}
            style={{
              backgroundColor: activeCategoryType === 'expense' ? 'var(--accent-neon-pink)' : 'transparent',
              color: activeCategoryType === 'expense' ? '#fff' : 'var(--text-secondary)',
              boxShadow: activeCategoryType === 'expense' ? '0 0 12px var(--accent-neon-pink-glow)' : 'none',
              padding: '0.4rem 1rem'
            }}
          >
            Expense Categories ({expenseCategories.length})
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => setActiveCategoryType('income')}
            style={{
              backgroundColor: activeCategoryType === 'income' ? 'var(--accent-neon-green)' : 'transparent',
              color: activeCategoryType === 'income' ? '#0b0e14' : 'var(--text-secondary)',
              boxShadow: activeCategoryType === 'income' ? '0 0 12px var(--accent-neon-green-glow)' : 'none',
              padding: '0.4rem 1rem'
            }}
          >
            Income Categories ({incomeCategories.length})
          </button>
        </div>

        {/* Category Chips Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.85rem' }}>
          {currentCategoryList.map((catName) => (
            <div
              key={catName}
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.65rem 0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.9rem',
                color: 'var(--text-primary)'
              }}
            >
              <span style={{ fontWeight: 600 }}>{catName}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <button
                  onClick={() => handleOpenEditCat(catName)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.2rem' }}
                  title="Rename Category"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => handleDeleteCat(catName)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.2rem' }}
                  title="Delete Category"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
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
              value={currentUser?.email || 'user@expensemanager.app'}
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

      {/* Add Custom Category Modal */}
      <Modal isOpen={isAddCatModalOpen} onClose={() => setIsAddCatModalOpen(false)} title={`Add ${activeCategoryType === 'income' ? 'Income' : 'Expense'} Category`}>
        <form onSubmit={handleCreateCategory}>
          <div className="form-group">
            <label className="form-label">Category Name</label>
            <input
              type="text"
              placeholder="e.g. Subscriptions, Gaming, Freelance Royalty..."
              className="form-input"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddCatModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Category
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Category Modal */}
      <Modal isOpen={isEditCatModalOpen} onClose={() => setIsEditCatModalOpen(false)} title="Rename Category">
        <form onSubmit={handleSaveRenameCat}>
          <div className="form-group">
            <label className="form-label">Category Name</label>
            <input
              type="text"
              className="form-input"
              value={renamedCategoryName}
              onChange={(e) => setRenamedCategoryName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsEditCatModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Category Name
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
