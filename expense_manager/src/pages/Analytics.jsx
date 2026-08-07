import React, { useState } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { formatCurrency } from '../utils/currencyFormatter';
import { formatDate } from '../utils/dateParser';
import { CategoryPieChart } from '../components/CategoryPieChart';
import { CategoryAmountsList } from '../components/CategoryAmountsList';
import { CashFlowChart } from '../components/CashFlowChart';
import { DateRangeFilter } from '../components/DateRangeFilter';
import { PieChart as PieIcon, BarChart3, TrendingDown, Layers, DollarSign, Award, ArrowUpRight, ArrowDownRight, ArrowRightLeft, Search, ListOrdered } from 'lucide-react';
import { Link } from 'react-router-dom';

const NEON_COLORS = [
  '#00ff87', // Neon Green
  '#ec4899', // Neon Pink
  '#a855f7', // Neon Purple
  '#60a5fa', // Electric Blue
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#38bdf8', // Sky Blue
  '#10b981'  // Emerald
];

export const Analytics = () => {
  const { transactions, currency } = useTransactions();

  // Date Range Filtering state
  const [activeRange, setActiveRange] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');

  // Filter transactions based on date range
  const filteredTransactions = transactions.filter((tx) => {
    if (activeRange === 'all') return true;
    if (!tx.date) return true;

    const txDate = new Date(tx.date);
    const now = new Date();

    if (activeRange === 'today') {
      return txDate.toDateString() === now.toDateString();
    }

    if (activeRange === 'week') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 86400000);
      return txDate >= oneWeekAgo && txDate <= now;
    }

    if (activeRange === 'month') {
      return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
    }

    if (activeRange === 'custom') {
      if (customStartDate && new Date(tx.date) < new Date(customStartDate)) return false;
      if (customEndDate && new Date(tx.date) > new Date(customEndDate + 'T23:59:59')) return false;
      return true;
    }

    return true;
  });

  // Calculate expense aggregates per category
  const categoryStatsMap = {};
  let totalExpenseOutflow = 0;

  filteredTransactions
    .filter((tx) => tx.type === 'expense' && !tx.isTransfer && tx.category !== 'Account Transfer')
    .forEach((tx) => {
      const cat = tx.category || 'Miscellaneous';
      const amount = Number(tx.amount || 0);

      if (!categoryStatsMap[cat]) {
        categoryStatsMap[cat] = {
          name: cat,
          totalAmount: 0,
          txCount: 0,
          transactions: []
        };
      }

      categoryStatsMap[cat].totalAmount += amount;
      categoryStatsMap[cat].txCount += 1;
      categoryStatsMap[cat].transactions.push(tx);
      totalExpenseOutflow += amount;
    });

  // Convert map to sorted array (highest spending first)
  const categoryStatsList = Object.values(categoryStatsMap)
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .map((item, index) => ({
      ...item,
      color: NEON_COLORS[index % NEON_COLORS.length],
      percentage: totalExpenseOutflow > 0 ? ((item.totalAmount / totalExpenseOutflow) * 100) : 0,
      avgTxAmount: item.txCount > 0 ? item.totalAmount / item.txCount : 0
    }));

  const topCategory = categoryStatsList.length > 0 ? categoryStatsList[0] : null;
  const activeCategoryCount = categoryStatsList.length;
  const avgCategorySpending = activeCategoryCount > 0 ? totalExpenseOutflow / activeCategoryCount : 0;

  // Filter transactions table if a specific category is clicked/selected
  const categoryFilteredTx = selectedCategoryFilter === 'ALL'
    ? filteredTransactions
    : filteredTransactions.filter(tx => tx.category === selectedCategoryFilter);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Greeting & Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <PieIcon size={28} color="var(--accent-neon-purple)" />
            Category Analytics & Breakdown
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Dedicated deep-dive visual analysis of category distribution, amounts, and outflow metrics.
          </p>
        </div>

        <Link to="/transactions" className="btn btn-secondary">
          <Search size={18} />
          <span>View Full Ledger</span>
        </Link>
      </div>

      {/* Date Range Filter */}
      <DateRangeFilter
        activeRange={activeRange}
        onSelectRange={setActiveRange}
        customStartDate={customStartDate}
        customEndDate={customEndDate}
        onCustomDateChange={(start, end) => {
          setCustomStartDate(start);
          setCustomEndDate(end);
        }}
      />

      {/* Metric Cards Grid */}
      <div className="grid-4">
        {/* Total Outflow */}
        <div className="glass-card glass-card-glow-purple">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Total Outflow
            </span>
            <div style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--accent-neon-pink-glow)', color: 'var(--accent-neon-pink)' }}>
              <TrendingDown size={18} />
            </div>
          </div>
          <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-neon-pink)' }}>
            {formatCurrency(totalExpenseOutflow, currency)}
          </h3>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Expense total across all categories
          </span>
        </div>

        {/* Top Spending Category */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Top Spending Category
            </span>
            <div style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--accent-neon-green-glow)', color: 'var(--accent-neon-green)' }}>
              <Award size={18} />
            </div>
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: topCategory ? topCategory.color : 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {topCategory ? topCategory.name : 'N/A'}
          </h3>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            {topCategory ? `${formatCurrency(topCategory.totalAmount, currency)} (${topCategory.percentage.toFixed(1)}%)` : 'No expenses recorded'}
          </span>
        </div>

        {/* Active Categories */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Active Categories
            </span>
            <div style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(96, 165, 250, 0.15)', color: 'var(--accent-electric-blue)' }}>
              <Layers size={18} />
            </div>
          </div>
          <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-electric-blue)' }}>
            {activeCategoryCount}
          </h3>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Categories with recorded expenses
          </span>
        </div>

        {/* Avg Category Spend */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Avg. Per Category
            </span>
            <div style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f59e0b' }}>
            {formatCurrency(avgCategorySpending, currency)}
          </h3>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Average spending per active category
          </span>
        </div>
      </div>

      {/* Separate Sections Grid */}
      <div className="grid-2">
        {/* Section 1: Pure Category Pie Chart Card */}
        <div className="glass-card glass-card-glow-purple">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <PieIcon size={22} color="var(--accent-neon-purple)" />
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Category Distribution (Pie Chart)
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Visual doughnut chart displaying spending proportion by category
              </p>
            </div>
          </div>
          <CategoryPieChart transactions={filteredTransactions} />
        </div>

        {/* Section 2: Category Amounts Section */}
        <div className="glass-card glass-card-glow-green">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <ListOrdered size={22} color="var(--accent-neon-green)" />
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Category Amounts Breakdown
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Prominently visible expense amounts, percentage share, and progress bars
              </p>
            </div>
          </div>
          <CategoryAmountsList transactions={filteredTransactions} />
        </div>
      </div>

      {/* Cash Flow Trends Chart */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
          <BarChart3 size={22} color="var(--accent-electric-blue)" />
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Outflow & Cash Flow Trends
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Temporal trends for selected date range
            </p>
          </div>
        </div>
        <CashFlowChart transactions={filteredTransactions} />
      </div>

      {/* Comprehensive Category Amounts Analysis Table */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Category Amounts & Spending Rankings
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Ranked breakdown by total expenditure amount, percentage share, and transaction frequency.
            </p>
          </div>

          {selectedCategoryFilter !== 'ALL' && (
            <button
              onClick={() => setSelectedCategoryFilter('ALL')}
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
            >
              Reset Filter ({selectedCategoryFilter})
            </button>
          )}
        </div>

        {categoryStatsList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            No expense transactions found for the selected date range filter.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Rank</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Category Name</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Total Spent</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>% Outflow</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Tx Count</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Avg Tx Size</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Share Visualizer</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {categoryStatsList.map((cat, idx) => {
                  const isSelected = selectedCategoryFilter === cat.name;
                  return (
                    <tr
                      key={cat.name}
                      style={{
                        borderBottom: '1px solid rgba(48, 54, 61, 0.5)',
                        backgroundColor: isSelected ? 'rgba(168, 85, 247, 0.12)' : 'transparent',
                        transition: 'background-color 0.2s ease'
                      }}
                    >
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                        #{idx + 1}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <span style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            backgroundColor: cat.color,
                            boxShadow: `0 0 8px ${cat.color}80`
                          }} />
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                            {cat.name}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 800, color: 'var(--accent-neon-pink)' }}>
                        {formatCurrency(cat.totalAmount, currency)}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.55rem',
                          borderRadius: '12px',
                          backgroundColor: 'rgba(255, 255, 255, 0.06)',
                          color: cat.color,
                          border: `1px solid ${cat.color}50`
                        }}>
                          {cat.percentage.toFixed(1)}%
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {cat.txCount} {cat.txCount === 1 ? 'tx' : 'txs'}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {formatCurrency(cat.avgTxAmount, currency)}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', minWidth: '140px' }}>
                        <div style={{
                          width: '100%',
                          height: '6px',
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          borderRadius: '3px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${cat.percentage}%`,
                            height: '100%',
                            backgroundColor: cat.color,
                            borderRadius: '3px'
                          }} />
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                        <button
                          onClick={() => setSelectedCategoryFilter(isSelected ? 'ALL' : cat.name)}
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            padding: '0.25rem 0.6rem',
                            borderRadius: 'var(--radius-sm)',
                            border: `1px solid ${cat.color}60`,
                            backgroundColor: isSelected ? cat.color : 'transparent',
                            color: isSelected ? '#000' : cat.color,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {isSelected ? 'Selected' : 'Filter Ledger'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Filtered Category Transactions List if Category selected */}
      {selectedCategoryFilter !== 'ALL' && (
        <div className="glass-card glass-card-glow-purple">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Transactions for Category: <span style={{ color: 'var(--accent-neon-purple)' }}>{selectedCategoryFilter}</span>
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {categoryFilteredTx.length} items
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.65rem 0.85rem' }}>Date</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>Description</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>Account</th>
                  <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {categoryFilteredTx.map((tx) => (
                  <tr key={tx.id} style={{ borderBottom: '1px solid rgba(48, 54, 61, 0.5)' }}>
                    <td style={{ padding: '0.65rem 0.85rem', color: 'var(--text-muted)' }}>{formatDate(tx.date)}</td>
                    <td style={{ padding: '0.65rem 0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{tx.description}</td>
                    <td style={{ padding: '0.65rem 0.85rem', color: 'var(--text-secondary)' }}>{tx.account}</td>
                    <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right', fontWeight: 700, color: 'var(--accent-neon-pink)' }}>
                      -{formatCurrency(tx.amount, currency)}
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
