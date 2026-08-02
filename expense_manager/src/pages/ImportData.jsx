import React, { useState } from 'react';
import { parseJSONFile, parseCSVFile, parseExcelFile } from '../services/importEngine';
import { useTransactions } from '../context/TransactionContext';
import { formatCurrency } from '../utils/currencyFormatter';
import { FileSpreadsheet, Upload, CheckCircle2, AlertCircle, FileText, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ImportData = () => {
  const { importTransactions } = useTransactions();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
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

      setParsedRows(results);
    } catch (err) {
      setError(err.message);
      setParsedRows([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCommitImport = async () => {
    const validRows = parsedRows.filter(r => r.isValid);
    if (validRows.length === 0) return;

    setLoading(true);
    const count = await importTransactions(parsedRows);
    setLoading(false);
    setSuccessMsg(`Successfully imported ${count} valid transactions into your ledger!`);
    setParsedRows([]);
    setFile(null);
  };

  const validCount = parsedRows.filter(r => r.isValid).length;
  const invalidCount = parsedRows.filter(r => !r.isValid).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Data Import Engine
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Batch import financial records from <strong>JSON</strong>, <strong>CSV</strong>, or <strong>Excel (.xlsx)</strong> files.
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

      {/* Upload Zone */}
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
          {loading && <span style={{ color: 'var(--accent-electric-blue)', fontWeight: 600 }}>Parsing file...</span>}
        </div>
      </div>

      {/* Validation Results Table */}
      {parsedRows.length > 0 && (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Import Validation Report
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Total Parsed: <strong>{parsedRows.length}</strong> | Valid Rows: <strong style={{ color: 'var(--accent-neon-green)' }}>{validCount}</strong> | Flagged Rows: <strong style={{ color: 'var(--color-danger)' }}>{invalidCount}</strong>
              </p>
            </div>

            <button
              className="btn btn-primary"
              disabled={validCount === 0 || loading}
              onClick={handleCommitImport}
            >
              <CheckCircle2 size={18} />
              <span>Commit {validCount} Valid Transactions</span>
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
                      backgroundColor: !row.isValid ? 'rgba(239, 68, 68, 0.08)' : 'transparent'
                    }}
                  >
                    <td style={{ padding: '0.75rem 1rem' }}>
                      {row.isValid ? (
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
                      {formatCurrency(row.amount)}
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
