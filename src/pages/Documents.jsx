import React from 'react';
import { Link } from 'react-router-dom';

const Documents = () => {
    const docs = [
        { title: 'Getting Started', category: 'General', views: '1.2k', date: '2 days ago' },
        { title: 'API Reference', category: 'Technical', views: '850', date: '1 week ago' },
        { title: 'Project Roadmap', category: 'Planning', views: '200', date: '3 days ago' },
        { title: 'Design System Guidelines', category: 'Design', views: '2.5k', date: '1 month ago' },
        { title: 'Deployment Guide', category: 'DevOps', views: '150', date: 'Yesterday' },
        { title: 'User Research 2024', category: 'Research', views: '300', date: '5 days ago' },
    ];

    return (
        <div className="container" style={{ paddingBottom: '60px' }}>
            <div style={{ marginBottom: '40px', paddingTop: '20px' }}>
                <Link to="/" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.2rem' }}>←</span> Back
                </Link>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '16px' }}>
                    <div>
                        <h1 className="text-gradient" style={{ fontSize: '2.5rem' }}>Documentation</h1>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Centralized knowledge base for all projects.</p>
                    </div>
                    <div className="glass-card" style={{ padding: '0', borderRadius: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', width: '300px' }}>
                        <span style={{ padding: '0 16px', opacity: 0.5 }}>🔍</span>
                        <input
                            type="text"
                            placeholder="Search docs..."
                            style={{
                                background: 'transparent',
                                border: 'none',
                                padding: '12px 0',
                                color: 'white',
                                outline: 'none',
                                width: '100%'
                            }}
                        />
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                {docs.map((doc, i) => (
                    <div key={i} className="glass-card" style={{ padding: '24px', cursor: 'pointer', transition: 'all 0.3s', ':hover': { transform: 'translateY(-4px)' } }}>
                        <div style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            background: 'rgba(56, 189, 248, 0.1)',
                            color: '#38bdf8',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            marginBottom: '16px'
                        }}>
                            {doc.category}
                        </div>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', lineHeight: 1.4 }}>{doc.title}</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '20px' }}>
                            <span>👀 {doc.views}</span>
                            <span>{doc.date}</span>
                        </div>
                    </div>
                ))}
                {/* Add New Card */}
                <div style={{
                    border: '2px dashed var(--glass-border)',
                    borderRadius: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    minHeight: '200px',
                    color: 'var(--text-secondary)',
                    transition: 'all 0.3s',
                    background: 'rgba(255,255,255,0.02)'
                }}>
                    <span style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.5 }}>+</span>
                    <span>Create New Doc</span>
                </div>
            </div>
        </div>
    );
};

export default Documents;
