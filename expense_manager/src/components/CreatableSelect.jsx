import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, PlusCircle, Search, Check } from 'lucide-react';

export const CreatableSelect = ({
  label,
  options = [],
  value,
  onChange,
  onCreateNew,
  placeholder = 'Select or type to create...'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const normalizedOptions = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const filteredOptions = normalizedOptions.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase().trim())
  );

  const isExactMatch = normalizedOptions.some(
    (opt) => opt.label.toLowerCase() === search.toLowerCase().trim()
  );

  const handleSelectOption = (optValue) => {
    onChange(optValue);
    setSearch('');
    setIsOpen(false);
  };

  const handleCreateOption = () => {
    const cleanText = search.trim();
    if (!cleanText) return;
    if (onCreateNew) {
      onCreateNew(cleanText);
    }
    onChange(cleanText);
    setSearch('');
    setIsOpen(false);
  };

  const selectedOptionLabel =
    normalizedOptions.find((opt) => opt.value === value)?.label || value || 'Select Category';

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', position: 'relative' }}>
      {label && <label className="form-label">{label}</label>}

      {/* Select Trigger Box */}
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.65rem 0.85rem',
          backgroundColor: 'var(--bg-secondary)',
          border: isOpen ? '1px solid var(--accent-neon-green)' : '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          fontSize: '0.9rem',
          boxShadow: isOpen ? '0 0 10px var(--accent-neon-green-glow)' : 'none',
          transition: 'all var(--transition-fast)'
        }}
      >
        <span style={{ fontWeight: 600 }}>{selectedOptionLabel}</span>
        <ChevronDown
          size={18}
          color="var(--text-secondary)"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}
        />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
            zIndex: 100,
            maxHeight: '260px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Search Bar Input inside Dropdown */}
          <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-primary)' }}>
            <Search size={14} color="var(--text-muted)" />
            <input
              type="text"
              placeholder={placeholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                fontSize: '0.85rem'
              }}
              autoFocus
            />
          </div>

          {/* Options List */}
          <div style={{ overflowY: 'auto', flex: 1, padding: '0.35rem 0' }}>
            {/* Render "+ Add New Category" when search doesn't match */}
            {search.trim() && !isExactMatch && (
              <div
                onClick={handleCreateOption}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.6rem 0.85rem',
                  cursor: 'pointer',
                  fontSize: '0.88rem',
                  color: 'var(--accent-neon-green)',
                  backgroundColor: 'var(--accent-neon-green-glow)',
                  fontWeight: 600
                }}
              >
                <PlusCircle size={16} />
                <span>Add "{search.trim()}"</span>
              </div>
            )}

            {filteredOptions.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <div
                  key={opt.value}
                  onClick={() => handleSelectOption(opt.value)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.55rem 0.85rem',
                    cursor: 'pointer',
                    fontSize: '0.88rem',
                    color: isSelected ? 'var(--accent-neon-green)' : 'var(--text-primary)',
                    backgroundColor: isSelected ? 'rgba(0, 255, 135, 0.08)' : 'transparent',
                    transition: 'background-color 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check size={16} color="var(--accent-neon-green)" />}
                </div>
              );
            })}

            {filteredOptions.length === 0 && !search.trim() && (
              <div style={{ padding: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                No categories found. Type above to create one!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
