import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionContext';
import { formatCurrency } from '../utils/currencyFormatter';
import { PlusCircle, Wallet, LogOut, User } from 'lucide-react';

export const Navbar = ({ onOpenAddTransaction }) => {
  const { currentUser, logout } = useAuth();
  const { totalBalance } = useTransactions();

  return (
    <header style={{
      backgroundColor: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)',
      padding: '0.85rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 40
    }}>
      {/* Brand Logo & Tagline */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          width: '38px',
          height: '38px',
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
          <h1 style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
            <span className="gradient-text-green">EXPENSE</span>
            <span style={{ color: 'var(--text-primary)' }}>MANAGER</span>
          </h1>
        </div>
      </div>

      {/* Center Balance Summary & Quick Action */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          padding: '0.4rem 1rem',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
            Total Liquidity
          </span>
          <span style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: totalBalance >= 0 ? 'var(--accent-neon-green)' : 'var(--accent-neon-pink)'
          }}>
            {formatCurrency(totalBalance)}
          </span>
        </div>

        <button className="btn btn-primary" onClick={onOpenAddTransaction}>
          <PlusCircle size={18} />
          <span>New Transaction</span>
        </button>
      </div>

      {/* Right User Profile Info & Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {currentUser && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {currentUser.photoURL ? (
              <img 
                src={currentUser.photoURL} 
                alt={currentUser.displayName} 
                style={{ width: '34px', height: '34px', borderRadius: '50%', border: '1px solid var(--accent-neon-green)' }} 
              />
            ) : (
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <User size={18} color="var(--accent-electric-blue)" />
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {currentUser.displayName || currentUser.email?.split('@')[0]}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--accent-neon-green)' }}>INR (₹) Standard</span>
            </div>
          </div>
        )}

        <button 
          className="btn btn-secondary" 
          onClick={logout} 
          title="Sign Out"
          style={{ padding: '0.5rem 0.75rem' }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
};
