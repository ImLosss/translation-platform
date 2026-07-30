// components/client/EllipsisDropdown.tsx
'use client';

import { useState, useRef, useEffect } from 'react';

export default function EllipsisDropdown({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Tutup saat klik di luar
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        ref={triggerRef}
        className="btn btn-outline btn-xs"
        onClick={() => setOpen(!open)}
        style={{ cursor: 'pointer' }}
      >
        <i className="fas fa-ellipsis-v"></i>
      </button>
      {open && (
        <div
          ref={menuRef}
          className="dropdown-menu-fixed"
          style={{
            position: 'fixed',
            top: triggerRef.current
              ? triggerRef.current.getBoundingClientRect().bottom + 4
              : 0,
            right: triggerRef.current
              ? window.innerWidth - triggerRef.current.getBoundingClientRect().right
              : 0,
            zIndex: 9999,
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            minWidth: '160px',
            padding: '4px 0',
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}