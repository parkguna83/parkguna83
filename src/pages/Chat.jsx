import React, { useState } from 'react';
import ChatInput from '../components/chat/ChatInput';
import MessageBubble from '../components/chat/MessageBubble';
import { Link } from 'react-router-dom';

const Chat = () => {
    const [messages, setMessages] = useState([
        { id: 1, role: 'ai', content: 'Hello! I am your personal AI assistant. How can I help you today?' }
    ]);

    const [history] = useState([
        { id: 1, title: 'Project Planning', date: 'Today' },
        { id: 2, title: 'React Components', date: 'Yesterday' },
        { id: 3, title: 'Design System', date: 'Previous 7 Days' },
    ]);

    const handleSend = (text) => {
        // Add user message
        const newMessage = { id: Date.now(), role: 'user', content: text };
        setMessages(prev => [...prev, newMessage]);

        // Simulate AI response
        setTimeout(() => {
            const aiResponse = { id: Date.now() + 1, role: 'ai', content: `I received your message: "${text}". This is a simulated response.` };
            setMessages(prev => [...prev, aiResponse]);
        }, 1000);
    };

    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 140px)', gap: '24px', paddingBottom: '20px' }}>
            {/* Sidebar */}
            <div className="glass-card" style={{
                width: '260px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '24px'
            }}>
                <div style={{ marginBottom: '20px' }}>
                    <Link to="/" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                        <span style={{ fontSize: '1.2rem' }}>←</span> Back
                    </Link>
                    <button style={{
                        width: '100%',
                        padding: '12px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '12px',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        justifyContent: 'center',
                        transition: 'background 0.2s',
                        ':hover': { background: 'var(--glass-highlight)' }
                    }}>
                        <span>+</span> New Chat
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '12px', paddingLeft: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recent</div>
                    {history.map(item => (
                        <div key={item.id} style={{
                            padding: '10px 12px',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            color: 'var(--text-primary)',
                            marginBottom: '4px',
                            background: 'transparent',
                            display: 'flex',
                            flexDirection: 'column',
                            opacity: 0.8
                        }}>
                            <span style={{ fontWeight: 500 }}>{item.title}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.date}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="glass-card" style={{
                flex: 1,
                padding: '30px',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '24px',
                position: 'relative'
            }}>
                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '10px', display: 'flex', flexDirection: 'column' }}>
                    {messages.map(msg => (
                        <MessageBubble key={msg.id} role={msg.role} content={msg.content} />
                    ))}
                </div>
                <ChatInput onSend={handleSend} />
            </div>
        </div>
    );
};

export default Chat;
