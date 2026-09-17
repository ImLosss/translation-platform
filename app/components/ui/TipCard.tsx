import React from 'react';

interface TipCardProps {
  title: string;
  children: React.ReactNode; 
  icon?: 'lightbulb' | 'info' | 'warning' | 'success'; 
}

export default function TipCard({ title, children, icon = 'lightbulb' }: TipCardProps) {
  
  const getIconClass = () => {
    switch (icon) {
      case 'info': return 'fas fa-info-circle';
      case 'warning': return 'fas fa-exclamation-triangle';
      case 'success': return 'fas fa-check-circle';
      case 'lightbulb':
      default: return 'fas fa-lightbulb';
    }
  };

  return (
    <section 
      className="card" 
      style={{ 
        padding: "20px", 
        display: "flex", 
        gap: "15px", 
        alignItems: "flex-start",
        borderLeft: "4px solid var(--accent)", 
        backgroundColor: "rgba(var(--accent-rgb, 52, 152, 219), 0.05)", 
        marginBottom: "20px" 
      }}
    >
      <div style={{ 
        width: "35px", 
        height: "35px", 
        borderRadius: "50%", 
        backgroundColor: "var(--accent)", 
        color: "white", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        flexShrink: 0
      }}>
        <i className={getIconClass()}></i>
      </div>
      
      <div>
        <h4 style={{ margin: "0 0 5px 0", color: "var(--text-primary)", fontSize: "1rem" }}>
          {title}
        </h4>
        <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: "1.6" }}>
          {children}
        </p>
      </div>
    </section>
  );
}