import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ message = 'Loading financial ledger...', fullPage = false }) => {
  const content = (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
      padding: fullPage ? '3rem 2rem' : '2rem 1rem',
      textAlign: 'center'
    }}>
      <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 
          size={38} 
          style={{ 
            color: 'var(--accent-neon-green)',
            animation: 'spin 1s linear infinite'
          }} 
        />
        <div style={{
          position: 'absolute',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          border: '2px solid var(--accent-neon-green-glow)',
          boxShadow: '0 0 16px var(--accent-neon-green-glow)'
        }} />
      </div>
      <p style={{
        fontSize: '0.9rem',
        fontWeight: 600,
        color: 'var(--text-secondary)',
        letterSpacing: '-0.2px'
      }}>
        {message}
      </p>
    </div>
  );

  if (fullPage) {
    return (
      <div style={{
        minHeight: '60vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {content}
      </div>
    );
  }

  return content;
};
