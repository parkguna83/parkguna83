import React from 'react';

const Card = ({ title, icon, color, onClick, style }) => {
  return (
    <div className="glass-card card-content" onClick={onClick} style={{
      cursor: onClick ? 'pointer' : 'default',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px',
      ...style
    }}>
      <div className="icon-container" style={{
        width: '80px',
        height: '80px',
        borderRadius: '20px',
        background: 'rgba(255,255,255,0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: `0 0 40px ${color || 'rgba(99, 102, 241, 0.3)'}`
      }}>
        {icon ? <img src={icon} alt={title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span style={{ fontSize: '32px' }}>✨</span>}
      </div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{title}</h3>
    </div>
  );
};

export default Card;
