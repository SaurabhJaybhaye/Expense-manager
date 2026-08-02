import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionContext';
import { formatCurrency } from '../utils/currencyFormatter';
import { PlusCircle, Wallet, LogOut, User, Menu, X } from 'lucide-react';

export const Navbar = ({ onOpenAddTransaction, onToggleMobileSidebar, isMobileSidebarOpen }) => {
  const { currentUser, logout } = useAuth();
  const { totalBalance } = useTransactions();

  return (
    <header className="navbar-container">
      {/* Left: Mobile Toggle & Brand Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          className="mobile-menu-btn"
          onClick={onToggleMobileSidebar}
          aria-label="Toggle Navigation Menu"
        >
          {isMobileSidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--accent-neon-green), var(--accent-electric-blue))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 12px var(--accent-neon-green-glow)'
          }}>
            <Wallet size={20} color="#0b0e14" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
              <span className="gradient-text-green">EXPENSE</span>
              <span style={{ color: 'var(--text-primary)' }}>MANAGER</span>
            </h1>
          </div>
        </div>
      </div>

      {/* Center/Right Liquidity Summary & Action */}
      <div className="navbar-right-section">
        <div className="liquidity-badge">
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
            Liquidity
          </span>
          <span style={{
            fontSize: '0.95rem',
            fontWeight: 700,
            color: totalBalance >= 0 ? 'var(--accent-neon-green)' : 'var(--accent-neon-pink)'
          }}>
            {formatCurrency(totalBalance)}
          </span>
        </div>

        <button className="btn btn-primary btn-responsive" onClick={onOpenAddTransaction}>
          <PlusCircle size={18} />
          <span className="btn-label">+ New</span>
        </button>

        {currentUser && (
          <div className="user-profile-summary">
            {currentUser.photoURL ? (
              <img 
                src={currentUser.photoURL} 
                alt={currentUser.displayName} 
                style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--accent-neon-green)' }} 
              />
            ) : (
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <User size={16} color="var(--accent-electric-blue)" />
              </div>
            )}
            <span className="user-name">
              {currentUser.displayName || currentUser.email?.split('@')[0]}
            </span>
          </div>
        )}

        <button 
          className="btn btn-secondary" 
          onClick={logout} 
          title="Sign Out"
          style={{ padding: '0.45rem 0.65rem' }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
};
