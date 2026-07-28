'use client';

import { useState } from 'react';

const notifications = [
  {
    icon: 'fa-check-circle',
    message: 'Translation completed — Episode 12 is ready for review.',
    time: '2 minutes ago',
  },
  {
    icon: 'fa-exclamation-triangle',
    message: 'Processing stalled — Movie Night job needs attention.',
    time: '1 hour ago',
    color: 'var(--yellow)',
  },
  {
    icon: 'fa-user-plus',
    message: 'New user registered — Sarah Lee joined the platform.',
    time: '3 hours ago',
    color: 'var(--green)',
  },
  {
    icon: 'fa-credit-card',
    message: 'Payment received — Invoice #INV-2026-07-23 has been paid.',
    time: '5 hours ago',
  },
];

export default function NotifButtonAndModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Tombol bel */}
      <button
        className="notif-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Notifications"
      >
        <i className="fas fa-bell"></i>
        <span className="dot"></span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="notif-overlay open" onClick={() => setIsOpen(false)}>
          <div
            className="notif-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>
                <i className="fas fa-bell" style={{ marginRight: 8 }}></i>
                Notifications
              </h3>
              <button className="close-btn" onClick={() => setIsOpen(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            {notifications.map((item, idx) => (
              <div className="notif-item" key={idx}>
                <div className="notif-icon">
                  <i
                    className={`fas ${item.icon}`}
                    style={item.color ? { color: item.color } : undefined}
                  ></i>
                </div>
                <div className="notif-body">
                  <p>{item.message}</p>
                  <span className="time">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}