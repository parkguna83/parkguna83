import React from 'react';

const MessageBubble = ({ role, content }) => {
    const isUser = role === 'user';

    return (
        <div style={{
            display: 'flex',
            justifyContent: isUser ? 'flex-end' : 'flex-start',
            marginBottom: '24px',
            animation: 'fadeIn 0.3s ease'
        }}>
            {!isUser && (
                <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '12px',
                    flexShrink: 0
                }}>
                    🤖
                </div>
            )}

            <div style={{
                maxWidth: '70%',
                padding: '16px 20px',
                borderRadius: '20px',
                borderTopRightRadius: isUser ? '4px' : '20px',
                borderTopLeftRadius: !isUser ? '4px' : '20px',
                background: isUser ? 'var(--gradient-1)' : 'var(--glass-bg)',
                border: isUser ? 'none' : '1px solid var(--glass-border)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                color: 'var(--text-primary)',
                lineHeight: '1.5'
            }}>
                {content}
            </div>

            {isUser && (
                <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '12px',
                    background: 'var(--gradient-2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: '12px',
                    flexShrink: 0,
                    fontSize: '12px',
                    fontWeight: 'bold'
                }}>
                    ME
                </div>
            )}
        </div>
    );
};

export default MessageBubble;
