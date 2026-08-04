import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionContext';
import { useCategories } from '../context/CategoryContext';
import { ConfirmModal } from '../components/ConfirmModal';
import { Modal } from '../components/Modal';
import { User, Mail, DollarSign, Download, Upload, Trash2, Tags, Plus, Pencil, ArrowUpRight, ArrowDownRight, AlertTriangle } from 'lucide-react';

export const Settings = () => {
  const { currentUser, logout } = useAuth();
  const { currency, setCurrency, transactions, importTransactions, deleteTransactionsByCategory } = useTransactions();
  const { incomeCategories, expenseCategories, customCategories, addCategory, updateCategory, deleteCategory } = useCategories();

  // Category Manager States
  const [activeCategoryType, setActiveCategoryType] = useState('expense'); // 'income' | 'expense'
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddCatModalOpen, setIsAddCatModalOpen] = useState(false);
  const [isEditCatModalOpen, setIsEditCatModalOpen] = useState(false);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [renamedCategoryName, setRenamedCategoryName] = useState('');

  // Delete Category Confirmation Modal State
  const [deleteCatTarget, setDeleteCatTarget] = useState(null); // { name, type, affectedCount }
  const [deletingCat, setDeletingCat] = useState(false);

  const currencies = [
    { code: 'INR', symbol: '₹', label: 'Indian Rupee (INR ₹)' },
    { code: 'USD', symbol: '$', label: 'US Dollar (USD $)' },
    { code: 'EUR', symbol: '€', label: 'Euro (EUR €)' },
    { code: 'GBP', symbol: '£', label: 'British Pound (GBP £)' }
  ];

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(transactions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `expense_ledger_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportBackup = (e) => {
    const fileReader = new FileReader();
    if (e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (Array.isArray(parsed)) {
            const valid = parsed.map((item, idx) => ({ ...item, isValid: true }));
            importTransactions(valid);
            alert(`Successfully restored ${valid.length} transactions from backup!`);
          }
        } catch (err) {
          alert("Invalid backup JSON file.");
        }
      };
    }
  };

  const handleAddCatSubmit = (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    addCategory(newCategoryName.trim(), activeCategoryType);
    setNewCategoryName('');
    setIsAddCatModalOpen(false);
  };

  const handleEditCatSubmit = (e) => {
    e.preventDefault();
    if (!renamedCategoryName.trim() || !editingCategoryName) return;
    updateCategory(editingCategoryName, renamedCategoryName.trim(), activeCategoryType);
    setEditingCategoryName('');
    setRenamedCategoryName('');
    setIsEditCatModalOpen(false);
  };

  const handleConfirmDeleteCat = async () => {
    if (!deleteCatTarget) return;
    setDeletingCat(true);
    
    // Cascade Delete: Delete all transactions belonging to this category!
    await deleteTransactionsByCategory(deleteCatTarget.name);
    // Delete Category from Category Settings
    deleteCategory(deleteCatTarget.name, deleteCatTarget.type);
    
    setDeletingCat(false);
    setDeleteCatTarget(null);
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
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Create, rename, or remove custom income & expense category tags.
              </p>
            </div>
          </div>

          <button className="btn btn-primary" onClick={() => { setNewCategoryName(''); setIsAddCatModalOpen(true); }}>
            <Plus size={16} />
            <span>Add Category</span>
          </button>
        </div>

        {/* Category Type Switcher Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'var(--bg-secondary)', padding: '0.35rem', borderRadius: 'var(--radius-sm)', width: 'fit-content', marginBottom: '1.25rem' }}>
          <button
            className="btn"
            onClick={() => setActiveCategoryType('expense')}
            style={{
              fontSize: '0.85rem',
              backgroundColor: activeCategoryType === 'expense' ? 'var(--bg-card)' : 'transparent',
              color: activeCategoryType === 'expense' ? 'var(--accent-neon-pink)' : 'var(--text-secondary)',
              border: activeCategoryType === 'expense' ? '1px solid var(--accent-neon-pink)' : '1px solid transparent'
            }}
          >
            <ArrowDownRight size={14} />
            <span>Expense Categories ({expenseCategories.length})</span>
          </button>

          <button
            className="btn"
            onClick={() => setActiveCategoryType('income')}
            style={{
              fontSize: '0.85rem',
              backgroundColor: activeCategoryType === 'income' ? 'var(--bg-card)' : 'transparent',
              color: activeCategoryType === 'income' ? 'var(--accent-neon-green)' : 'var(--text-secondary)',
              border: activeCategoryType === 'income' ? '1px solid var(--accent-neon-green)' : '1px solid transparent'
            }}
          >
            <ArrowUpRight size={14} />
            <span>Income Categories ({incomeCategories.length})</span>
          </button>
        </div>

        {/* Category Items Pills Grid */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
          {currentCategoryList.map((cat) => {
            const isCustom = (customCategories[activeCategoryType] || []).includes(cat);
            const affectedCount = transactions.filter(t => t.category?.toLowerCase() === cat.toLowerCase()).length;

            return (
              <div
                key={cat}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.85rem',
                  backgroundColor: 'var(--bg-secondary)',
                  border: isCustom ? '1px solid var(--accent-neon-purple)' : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  color: 'var(--text-primary)'
                }}
              >
                <span>{cat}</span>
                {affectedCount > 0 && (
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    backgroundColor: 'rgba(236, 72, 153, 0.15)',
                    color: 'var(--accent-neon-pink)',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '10px',
                    border: '1px solid rgba(236, 72, 153, 0.3)'
                  }}>
                    {affectedCount} {affectedCount === 1 ? 'record' : 'records'}
                  </span>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: '0.25rem' }}>
                  {isCustom && (
                    <button
                      onClick={() => {
                        setEditingCategoryName(cat);
                        setRenamedCategoryName(cat);
                        setIsEditCatModalOpen(true);
                      }}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.15rem' }}
                      title="Rename Category"
                    >
                      <Pencil size={13} />
                    </button>
                  )}
                  <button
                    onClick={() => setDeleteCatTarget({ name: cat, type: activeCategoryType, affectedCount })}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.15rem' }}
                    title="Delete Category Tag"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* User Profile Card */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <User size={22} color="var(--accent-electric-blue)" />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            User Account Profile
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Display Name</span>
            <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
              {currentUser?.displayName || 'Active Ledger User'}
            </p>
          </div>

          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Registered Email</span>
            <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={16} color="var(--accent-electric-blue)" />
              <span>{currentUser?.email || 'Guest User'}</span>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={logout}>
            Sign Out Session
          </button>
        </div>
      </div>

      {/* Currency Preferences & Ledger Data Backup */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Currency Display Settings */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <DollarSign size={22} color="var(--accent-neon-green)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Currency Display Unit
            </h3>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Select your preferred global currency symbol for financial summaries and cards.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {currencies.map((c) => (
              <label
                key={c.code}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  backgroundColor: 'var(--bg-secondary)',
                  border: currency === c.code ? '1px solid var(--accent-neon-green)' : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer'
                }}
              >
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{c.label}</span>
                <input
                  type="radio"
                  name="currency"
                  value={c.code}
                  checked={currency === c.code}
                  onChange={(e) => setCurrency(e.target.value)}
                  style={{ accentColor: 'var(--accent-neon-green)' }}
                />
              </label>
            ))}
          </div>
        </div>

        {/* Data Backup & Restore */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Download size={22} color="var(--accent-electric-blue)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Ledger Backup & Migration
            </h3>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Export your entire transaction ledger to JSON or restore historical data.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: 'auto' }}>
            <button className="btn btn-secondary" onClick={handleExportData} style={{ justifyContent: 'center' }}>
              <Download size={16} />
              <span>Export Ledger JSON Backup</span>
            </button>

            <label className="btn btn-secondary" style={{ justifyContent: 'center', cursor: 'pointer', margin: 0 }}>
              <Upload size={16} />
              <span>Restore Ledger Backup JSON</span>
              <input type="file" accept=".json" onChange={handleImportBackup} style={{ display: 'none' }} />
            </label>
          </div>
        </div>
      </div>

      {/* Modal: Add Category */}
      <Modal isOpen={isAddCatModalOpen} onClose={() => setIsAddCatModalOpen(false)} title={`Create ${activeCategoryType === 'income' ? 'Income Tag' : 'Expense Category'}`}>
        <form onSubmit={handleAddCatSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Category Name</label>
            <input
              type="text"
              placeholder="e.g. Crypto Investments, SaaS Subscriptions..."
              className="form-input"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddCatModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Tag
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Category Name */}
      <Modal isOpen={isEditCatModalOpen} onClose={() => setIsEditCatModalOpen(false)} title="Rename Custom Category">
        <form onSubmit={handleEditCatSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
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

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsEditCatModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Modal for Delete Category with Record Warning */}
      <ConfirmModal
        isOpen={Boolean(deleteCatTarget)}
        onClose={() => setDeleteCatTarget(null)}
        onConfirm={handleConfirmDeleteCat}
        title={`Delete Category "${deleteCatTarget?.name}"?`}
        message={
          deleteCatTarget?.affectedCount > 0 
            ? `Are you sure you want to delete category "${deleteCatTarget?.name}"? WARNING: This action will permanently delete ${deleteCatTarget?.affectedCount} associated ${deleteCatTarget?.affectedCount === 1 ? 'transaction record' : 'transaction records'} from your ledger and Cloud Firestore. This action cannot be undone.`
            : `Are you sure you want to delete category "${deleteCatTarget?.name}"? This action cannot be undone.`
        }
        confirmText={
          deleteCatTarget?.affectedCount > 0
            ? `Yes, Delete Tag & ${deleteCatTarget?.affectedCount} ${deleteCatTarget?.affectedCount === 1 ? 'Record' : 'Records'}`
            : 'Yes, Delete Category Tag'
        }
        loading={deletingCat}
      />
    </div>
  );
};
