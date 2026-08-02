import Papa from 'papaparse';

/**
 * Triggers browser download of data string.
 */
const triggerDownload = (content, filename, contentType) => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export transactions array to CSV file download.
 */
export const exportToCSV = (transactions) => {
  if (!transactions || transactions.length === 0) return false;

  const exportData = transactions.map((tx) => ({
    Date: tx.date,
    Type: tx.type,
    Amount: tx.amount,
    Category: tx.category,
    Account: tx.account,
    Description: tx.description
  }));

  const csvString = Papa.unparse(exportData);
  const timestamp = new Date().toISOString().substring(0, 10);
  triggerDownload(csvString, `expense_ledger_${timestamp}.csv`, 'text/csv;charset=utf-8;');
  return true;
};

/**
 * Export transactions array to JSON file download.
 */
export const exportToJSON = (transactions) => {
  if (!transactions || transactions.length === 0) return false;

  const jsonString = JSON.stringify(transactions, null, 2);
  const timestamp = new Date().toISOString().substring(0, 10);
  triggerDownload(jsonString, `expense_ledger_${timestamp}.json`, 'application/json;');
  return true;
};
