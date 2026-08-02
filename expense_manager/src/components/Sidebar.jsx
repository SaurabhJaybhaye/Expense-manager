import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, Landmark, FileSpreadsheet, ShieldCheck } from 'lucide-react';

export const Sidebar = () => {
  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Transactions', path: '/transactions', icon: Receipt },
    { label: 'Accounts', path: '/accounts', icon: Landmark },
    { label: 'Import Data', path: '/import', icon: FileSpreadsheet }
  ];

  return (
    <aside style={{
      width: '240px',
      backgroundColor: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-color)',
      padding: '1.5rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <div style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          padding: '0.5rem 0.75rem 0.25rem'
        }}>
          Menu Overview
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                textDecoration: 'none',
                fontWeight: 500,
                fontSize: '0.9rem',
                color: isActive ? 'var(--accent-neon-green)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--accent-neon-green-glow)' : 'transparent',
                border: isActive ? '1px solid rgba(0, 255, 135, 0.3)' : '1px solid transparent',
                transition: 'all var(--transition-fast)'
              })}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Version & Security Guard Indicator */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-sm)',
        padding: '0.85rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.4rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={16} color="var(--accent-neon-green)" />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>Owner Guarded</span>
        </div>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          Firestore User-ID Rules Active. Version v1.0.0 (MVP Core).
        </p>
      </div>
    </aside>
  );
};
