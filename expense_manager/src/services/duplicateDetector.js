/**
 * Algorithmic Scanner to detect duplicate financial transactions.
 */

export const isDuplicateTransaction = (tx1, tx2) => {
  if (!tx1 || !tx2) return false;

  // Exact amount match
  const amt1 = Number(tx1.amount || 0);
  const amt2 = Number(tx2.amount || 0);
  if (amt1 !== amt2) return false;

  // Description similarity
  const desc1 = (tx1.description || '').toLowerCase().trim();
  const desc2 = (tx2.description || '').toLowerCase().trim();
  const descMatch = desc1 === desc2 || (desc1 && desc2 && (desc1.includes(desc2) || desc2.includes(desc1)));

  // Date proximity (within 24 hours = 86400000 ms)
  const d1 = new Date(tx1.date || 0).getTime();
  const d2 = new Date(tx2.date || 0).getTime();
  const timeDiff = Math.abs(d1 - d2);
  const dateMatch = timeDiff <= 86400000;

  return descMatch && dateMatch;
};

/**
 * Scans an array of incoming transactions against existing ledger items.
 * Marks `isDuplicate: true` and `duplicateReason` on flagged items.
 */
export const scanForDuplicates = (existingList = [], incomingList = []) => {
  return incomingList.map((item) => {
    const duplicateMatch = existingList.find((existing) => isDuplicateTransaction(existing, item));
    if (duplicateMatch) {
      return {
        ...item,
        isDuplicate: true,
        duplicateReason: `Matches existing entry on ${new Date(duplicateMatch.date).toLocaleDateString()}`
      };
    }
    return {
      ...item,
      isDuplicate: false
    };
  });
};
