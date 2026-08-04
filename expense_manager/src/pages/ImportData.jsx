import React, { useState } from 'react';
import { parseJSONFile, parseCSVFile, parseExcelFile, normalizeTransaction } from '../services/importEngine';
import { scanForDuplicates } from '../services/duplicateDetector';
import { useTransactions } from '../context/TransactionContext';
import { useCategories } from '../context/CategoryContext';
import { formatCurrency } from '../utils/currencyFormatter';
import { Upload, CheckCircle2, AlertCircle, ArrowRight, Copy, Code, FileUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ImportData = () => {
  const { importTransactions, transactions, accounts, addAccount, currency } = useTransactions();
  const { incomeCategories, expenseCategories, addCategory } = useCategories();
  const navigate = useNavigate();

  const [importMode, setImportMode] = useState('file'); // 'file' | 'json_text'
  const [file, setFile] = useState(null);
  const [jsonText, setJsonText] = useState('');
  const [parsedRows, setParsedRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError('');
    setSuccessMsg('');
    setLoading(true);

    const ext = selectedFile.name.split('.').pop().toLowerCase();

    try {
      let results = [];
      if (ext === 'json') {
        results = await parseJSONFile(selectedFile);
      } else if (ext === 'csv') {
        results = await parseCSVFile(selectedFile);
      } else if (ext === 'xlsx' || ext === 'xls') {
        results = await parseExcelFile(selectedFile);
      } else {
        throw new Error('Unsupported file extension. Please upload a .json, .csv, or .xlsx file.');
      }

      // Run duplicate detector scan against existing transactions ledger
      const scannedResults = scanForDuplicates(transactions, results);
      setParsedRows(scannedResults);
    } catch (err) {
      setError(err.message);
      setParsedRows([]);
    } finally {
      setLoading(false);
    }
  };

  const handleParseJsonText = () => {
    if (!jsonText.trim()) {
      setError('Please paste valid JSON text before parsing.');
      return;
    }

    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const parsed = JSON.parse(jsonText.trim());
      const rawArray = Array.isArray(parsed) ? parsed : parsed.transactions || [parsed];
      
      // Expand nested transfer objects { account: { from, to } }
      const expandedArray = [];
      rawArray.forEach((item) => {
        if (item && typeof item === 'object' && item.account && typeof item.account === 'object' && item.account.from && item.account.to) {
          // Outflow Transfer
          expandedArray.push({
            date: item.date,
            amount: item.amount,
            type: 'expense',
            category: 'Account Transfer',
            account: item.account.from,
            description: item.description || `Transfer (${item.account.from} → ${item.account.to})`
          });
          // Inflow Transfer
          expandedArray.push({
            date: item.date,
            amount: item.amount,
            type: 'income',
            category: 'Account Transfer',
            account: item.account.to,
            description: item.description || `Transfer (${item.account.from} → ${item.account.to})`
          });
        } else {
          expandedArray.push(item);
        }
      });

      const results = expandedArray.map((row, idx) => normalizeTransaction(row, idx));
      const scannedResults = scanForDuplicates(transactions, results);
      setParsedRows(scannedResults);
    } catch (err) {
      setError('Invalid JSON syntax: ' + err.message);
      setParsedRows([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCommitImport = async () => {
    const validRows = parsedRows.filter(r => r.isValid && !r.isDuplicate);
    if (validRows.length === 0) return;

    setLoading(true);

    // 1. Dynamic Category Auto-Creation for missing categories
    const existingIncomeSet = new Set(incomeCategories.map(c => c.toLowerCase()));
    const existingExpenseSet = new Set(expenseCategories.map(c => c.toLowerCase()));

    validRows.forEach((row) => {
      if (row.category && row.category !== 'Account Transfer') {
        const cleanCat = row.category.trim();
        const catLower = cleanCat.toLowerCase();
        const isIncome = row.type === 'income';

        if (isIncome && !existingIncomeSet.has(catLower)) {
          addCategory(cleanCat, 'income');
          existingIncomeSet.add(catLower);
        } else if (!isIncome && !existingExpenseSet.has(catLower)) {
          addCategory(cleanCat, 'expense');
          existingExpenseSet.add(catLower);
        }
      }
    });

    // 2. Dynamic Account Auto-Creation for missing payment accounts
    const existingAccountsSet = new Set(accounts.map(a => a.name.toLowerCase()));
    validRows.forEach((row) => {
      if (row.account) {
        const cleanAcc = row.account.trim();
        const accLower = cleanAcc.toLowerCase();
        if (!existingAccountsSet.has(accLower)) {
          addAccount({
            name: cleanAcc,
            type: 'bank',
            balance: 0,
            currency
          });
          existingAccountsSet.add(accLower);
        }
      }
    });

    // 3. Commit transactions to state & Cloud Firestore
    const count = await importTransactions(validRows);
    setLoading(false);
    setSuccessMsg(`Successfully imported ${count} valid transactions and auto-created all new categories & accounts!`);
    setParsedRows([]);
    setFile(null);
    setJsonText('');
  };

  const validCount = parsedRows.filter(r => r.isValid && !r.isDuplicate).length;
  const duplicateCount = parsedRows.filter(r => r.isDuplicate).length;
  const invalidCount = parsedRows.filter(r => !r.isValid).length;

  const jsonPlaceholder = `[\n  {\n    "date": "2026-08-03",\n    "amount": 5000,\n    "type": "expense",\n    "category": "Gaming & Esports",\n    "account": "Central Bank",\n    "description": "Steam Game Purchase"\n  },\n  {\n    "date": "2026-08-03",\n    "amount": 10000,\n    "type": "Transfer",\n    "category": "Account Transfer",\n    "account": { "from": "HDFC Bank", "to": "Central Bank" },\n    "description": "Internal Bank Transfer"\n  }\n]`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Data Import Engine
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Batch import financial records via file upload or direct JSON text pasting.
        </p>
      </div>

      {error && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          color: 'var(--color-danger)',
          padding: '1rem',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div style={{
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(0, 255, 135, 0.4)',
          color: 'var(--accent-neon-green)',
          padding: '1rem',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <CheckCircle2 size={20} />
          <div style={{ flex: 1 }}>{successMsg}</div>
          <button className="btn btn-primary" onClick={() => navigate('/transactions')}>
            View Transactions <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Mode Switcher Tabs */}
      <div style={{
        display: 'inline-flex',
        gap: '0.5rem',
        backgroundColor: 'var(--bg-secondary)',
        padding: '0.35rem',
        borderRadius: 'var(--radius-sm)',
        width: 'fit-content'
      }}>
        <button
          className="btn"
          onClick={() => { setImportMode('file'); setParsedRows([]); setError(''); }}
          style={{
            backgroundColor: importMode === 'file' ? 'var(--bg-card)' : 'transparent',
            color: importMode === 'file' ? 'var(--accent-neon-purple)' : 'var(--text-secondary)',
            border: importMode === 'file' ? '1px solid var(--accent-neon-purple)' : '1px solid transparent'
          }}
        >
          <FileUp size={16} />
          <span>Upload File (.csv, .xlsx, .json)</span>
        </button>

        <button
          className="btn"
          onClick={() => { setImportMode('json_text'); setParsedRows([]); setError(''); }}
          style={{
            backgroundColor: importMode === 'json_text' ? 'var(--bg-card)' : 'transparent',
            color: importMode === 'json_text' ? 'var(--accent-neon-green)' : 'var(--text-secondary)',
            border: importMode === 'json_text' ? '1px solid var(--accent-neon-green)' : '1px solid transparent'
          }}
        >
          <Code size={16} />
          <span>Paste Direct JSON Text</span>
        </button>
      </div>

      {/* Option 1: Drag & Drop File Upload Zone */}
      {importMode === 'file' && (
        <div 
          className="glass-card glass-card-glow-purple" 
          style={{
            border: '2px dashed var(--accent-neon-purple)',
            textAlign: 'center',
            padding: '3rem 1.5rem',
            cursor: 'pointer',
            position: 'relative'
          }}
        >
          <input
            type="file"
            accept=".json,.csv,.xlsx,.xls"
            onChange={handleFileChange}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: 0,
              cursor: 'pointer'
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              padding: '1rem',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-neon-purple-glow)',
              color: 'var(--accent-neon-purple)'
            }}>
              <Upload size={32} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {file ? file.name : 'Drag & Drop or Click to Select File'}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Supports .csv, .json, and .xlsx formats with headers like <code>Date, Amount, Category, Type, Account, Description</code>
              </p>
            </div>
            {loading && <span style={{ color: 'var(--accent-electric-blue)', fontWeight: 600 }}>Parsing & scanning duplicates...</span>}
          </div>
        </div>
      )}

      {/* Option 2: Direct JSON Textarea Input Zone */}
      {importMode === 'json_text' && (
        <div className="glass-card glass-card-glow-green" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Code size={18} color="var(--accent-neon-green)" />
              <span>Paste Raw JSON Data</span>
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Paste a JSON array or single transfer object directly into the box below:
            </p>
          </div>

          <textarea
            rows={10}
            className="form-input"
            style={{ fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: 1.4, resize: 'vertical' }}
            placeholder={jsonPlaceholder}
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              className="btn btn-secondary"
              onClick={() => setJsonText('')}
            >
              Clear Text
            </button>
            <button
              className="btn btn-primary"
              onClick={handleParseJsonText}
              disabled={loading || !jsonText.trim()}
            >
              <Code size={18} />
              <span>Parse & Scan JSON</span>
            </button>
          </div>
        </div>
      )}

      {/* Validation & Duplicate Scanning Results Table */}
      {parsedRows.length > 0 && (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Import Scan Report
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Parsed: <strong>{parsedRows.length}</strong> | Valid: <strong style={{ color: 'var(--accent-neon-green)' }}>{validCount}</strong> | Duplicates Flagged: <strong style={{ color: 'var(--color-warning)' }}>{duplicateCount}</strong> | Invalid: <strong style={{ color: 'var(--color-danger)' }}>{invalidCount}</strong>
              </p>
            </div>

            <button
              className="btn btn-primary"
              disabled={validCount === 0 || loading}
              onClick={handleCommitImport}
            >
              <CheckCircle2 size={18} />
              <span>Commit {validCount} Unique Transactions</span>
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Flow Type</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Account</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Description</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {parsedRows.map((row, idx) => (
                  <tr 
                    key={row.id || idx}
                    style={{
                      borderBottom: '1px solid rgba(48, 54, 61, 0.4)',
                      backgroundColor: row.isDuplicate ? 'rgba(245, 158, 11, 0.08)' : (!row.isValid ? 'rgba(239, 68, 68, 0.08)' : 'transparent')
                    }}
                  >
                    <td style={{ padding: '0.75rem 1rem' }}>
                      {row.isDuplicate ? (
                        <span className="badge" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: 'var(--color-warning)', border: '1px solid rgba(245, 158, 11, 0.3)' }} title={row.duplicateReason}>
                          <Copy size={12} /> Duplicate
                        </span>
                      ) : row.isValid ? (
                        <span className="badge badge-income">Valid</span>
                      ) : (
                        <span className="badge badge-expense" title={row.errors.join(', ')}>
                          Invalid Amount
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>
                      {row.date}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textTransform: 'capitalize', fontWeight: 600 }}>
                      {row.type}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>
                      {row.category}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>
                      {row.account}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-primary)' }}>
                      {row.description}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 700, color: row.isValid ? 'var(--accent-neon-green)' : 'var(--text-muted)' }}>
                      {formatCurrency(row.amount, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
