import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export const CustomSelect = ({ options = [], value, onChange, placeholder = 'Select an option', label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Normalize options array into [{ value, label }] format
  const normalizedOptions = options.map(opt => {
    if (typeof opt === 'string') {
      return { value: opt, label: opt };
    }
    return opt;
  });

  const selectedOption = normalizedOptions.find(opt => opt.value === value) || { value, label: value || placeholder };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className="custom-select-container" ref={containerRef} style={{ position: 'relative', width: '100%', zIndex: isOpen ? 200 : 1 }}>
      {label && <label className="form-label">{label}</label>}

      {/* Select Input Trigger Button */}
      <button
        type="button"
        className="custom-select-trigger"
        onClick={() => setIsOpen(prev => !prev)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.7rem 1rem',
          backgroundColor: 'var(--bg-secondary)',
          border: isOpen ? '1px solid var(--accent-electric-blue)' : '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--text-primary)',
          fontFamily: 'inherit',
          fontSize: '0.95rem',
          cursor: 'pointer',
          boxShadow: isOpen ? '0 0 0 3px var(--accent-electric-blue-glow)' : 'none',
          transition: 'all var(--transition-fast)'
        }}
      >
        <span style={{ fontWeight: 500, color: selectedOption ? 'var(--text-primary)' : 'var(--text-muted)' }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown 
          size={18} 
          style={{ 
            color: isOpen ? 'var(--accent-neon-green)' : 'var(--accent-electric-blue)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform var(--transition-fast), color var(--transition-fast)'
          }} 
        />
      </button>

      {/* Dropdown Options Menu */}
      {isOpen && (
        <div 
          className="custom-select-menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.8), 0 0 16px var(--accent-electric-blue-glow)',
            zIndex: 9999,
            maxHeight: '240px',
            overflowY: 'auto',
            padding: '0.35rem 0'
          }}
        >
          {normalizedOptions.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <div
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 1rem',
                  fontSize: '0.9rem',
                  fontWeight: isSelected ? 600 : 400,
                  color: isSelected ? 'var(--accent-neon-green)' : 'var(--text-primary)',
                  backgroundColor: isSelected ? 'var(--accent-neon-green-glow)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
                className="custom-select-option"
              >
                <span>{opt.label}</span>
                {isSelected && <Check size={16} color="var(--accent-neon-green)" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
