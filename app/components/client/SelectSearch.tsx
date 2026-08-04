'use client';

import { useState, useRef, useEffect } from 'react';

interface Option {
  value: string;
  label: string;
}

interface SelectSearchProps {
  options: Option[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  id?: string;
  required?: boolean;
}

export default function SelectSearch({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  id,
  required,
}: SelectSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);
  const filtered = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="select-search" ref={containerRef}>
      <div
        className="select-search-input"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedOption ? 'selected-text' : 'placeholder'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <i className={`fas fa-chevron-down ${isOpen ? 'open' : ''}`}></i>
      </div>

      {isOpen && (
        <div className="select-search-dropdown">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <ul className="options-list">
            {filtered.length === 0 ? (
              <li className="no-result">No results</li>
            ) : (
              filtered.map((opt) => (
                <li
                  key={opt.value}
                  className={opt.value === value ? 'active' : ''}
                  onClick={() => {
                    onChange?.(opt.value);
                    setSearch('');
                    setIsOpen(false);
                  }}
                >
                  {opt.label}
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      {/* hidden input untuk form submit tradisional */}
      <input
        type="hidden"
        id={id}
        name={id}
        value={value || ''}
        required={required}
      />
    </div>
  );
}