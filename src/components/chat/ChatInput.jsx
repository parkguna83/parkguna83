import React, { useState } from 'react';

const ChatInput = ({ onSend }) => {
    const [input, setInput] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim()) {
            onSend(input);
            setInput('');
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{
            position: 'relative',
            marginTop: 'auto',
            padding: '20px 0'
        }}>
            <div className="glass-card" style={{
                padding: '0',
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '24px',
                border: '1px solid var(--glass-border)',
                overflow: 'hidden'
            }}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask anything..."
                    style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        padding: '16px 24px',
                        color: 'white',
                        fontSize: '1rem',
                        outline: 'none',
                        fontFamily: 'var(--font-main)'
                    }}
                />
                <button type="submit" style={{
                    background: 'var(--gradient-1)',
                    border: 'none',
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    marginRight: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'opacity 0.2s'
                }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                </button>
            </div>
        </form>
    );
};

export default ChatInput;
