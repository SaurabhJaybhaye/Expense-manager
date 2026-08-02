import Papa from 'papaparse';
import * as XLSX from 'xlsx';

/**
 * Normalizes and validates incoming transaction object
 */
export const normalizeTransaction = (rawRow, index) => {
  const getField = (...possibleKeys) => {
    for (const key of possibleKeys) {
      const foundKey = Object.keys(rawRow).find(
        (k) => k.trim().toLowerCase() === key.toLowerCase()
      );
      if (foundKey && rawRow[foundKey] !== undefined && rawRow[foundKey] !== null) {
        return String(rawRow[foundKey]).trim();
      }
    }
    return '';
  };

  const amountStr = getField('amount', 'val', 'value', 'price', 'sum');
  const amount = Math.abs(parseFloat(amountStr));

  const typeStr = getField('type', 'transaction_type', 'flow').toLowerCase();
  let type = 'expense';
  if (typeStr.includes('in') || typeStr.includes('credit') || typeStr.includes('income')) {
    type = 'income';
  } else if (typeStr.includes('out') || typeStr.includes('debit') || typeStr.includes('expense')) {
    type = 'expense';
  } else if (parseFloat(amountStr) > 0) {
    type = 'income';
  }

  const rawDate = getField('date', 'time', 'timestamp', 'transaction_date');
  let date = new Date().toISOString().split('T')[0];
  if (rawDate) {
    const parsedDate = new Date(rawDate);
    if (!isNaN(parsedDate.getTime())) {
      date = parsedDate.toISOString().split('T')[0];
    }
  }

  const category = getField('category', 'cat', 'tag') || 'Miscellaneous Outflow';
  const account = getField('account', 'payment_method', 'account_name', 'bank') || 'Cash';
  const description = getField('description', 'desc', 'memo', 'note', 'title') || 'Imported Transaction';

  const errors = [];
  if (isNaN(amount) || amount <= 0) {
    errors.push(`Row ${index + 1}: Invalid or missing amount (${amountStr || 'empty'})`);
  }

  return {
    id: `import_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 4)}`,
    date,
    amount: amount || 0,
    type,
    category,
    account,
    description,
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Parse JSON File
 */
export const parseJSONFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        const dataArray = Array.isArray(json) ? json : json.transactions || [json];
        const results = dataArray.map((row, idx) => normalizeTransaction(row, idx));
        resolve(results);
      } catch (err) {
        reject(new Error('Invalid JSON format: ' + err.message));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read JSON file'));
    reader.readAsText(file);
  });
};

/**
 * Parse CSV File using PapaParse
 */
export const parseCSVFile = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          return reject(new Error('CSV file is empty or missing header row'));
        }
        const parsed = results.data.map((row, idx) => normalizeTransaction(row, idx));
        resolve(parsed);
      },
      error: (err) => reject(new Error('CSV parse error: ' + err.message))
    });
  });
};

/**
 * Parse Excel (.xlsx, .xls) File using SheetJS (xlsx)
 */
export const parseExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonRows = XLSX.utils.sheet_to_json(worksheet);
        
        if (!jsonRows || jsonRows.length === 0) {
          return reject(new Error('Excel worksheet is empty'));
        }
        const parsed = jsonRows.map((row, idx) => normalizeTransaction(row, idx));
        resolve(parsed);
      } catch (err) {
        reject(new Error('Failed to parse Excel file: ' + err.message));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read Excel file'));
    reader.readAsArrayBuffer(file);
  });
};
