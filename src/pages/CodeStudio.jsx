import React from 'react';
import { Link } from 'react-router-dom';

const CodeStudio = () => {
    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 140px)', gap: '2px', paddingBottom: '20px', overflow: 'hidden' }}>
            {/* Activity Bar */}
            <div style={{ width: '50px', background: '#0f172a', borderRight: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '20px', gap: '20px' }}>
                <Link to="/" style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', textDecoration: 'none' }}>🏠</Link>
                <div style={{ width: '30px', height: '2px', background: 'var(--glass-border)' }}></div>
                <span style={{ fontSize: '1.5rem', opacity: 1, cursor: 'pointer' }}>📁</span>
                <span style={{ fontSize: '1.5rem', opacity: 0.5, cursor: 'pointer' }}>🔍</span>
                <span style={{ fontSize: '1.5rem', opacity: 0.5, cursor: 'pointer' }}>🌿</span>
            </div>

            {/* Sidebar */}
            <div className="glass-card" style={{ width: '240px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '0', borderRight: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '10px 20px', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>EXPLORER</div>
                <div style={{ padding: '10px 0' }}>
                    {['src', 'components', 'App.jsx', 'index.css', 'main.jsx'].map(file => (
                        <div key={file} style={{
                            padding: '6px 20px',
                            cursor: 'pointer',
                            color: file === 'App.jsx' ? 'var(--text-accent)' : 'var(--text-secondary)',
                            background: file === 'App.jsx' ? 'rgba(255,255,255,0.05)' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <span style={{ fontSize: '0.9rem' }}>{file.includes('.') ? '📄' : '📁'}</span>
                            {file}
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Editor */}
            <div style={{ flex: 1, background: '#0f172a', display: 'flex', flexDirection: 'column' }}>
                {/* Tabs */}
                <div style={{ display: 'flex', background: '#1e293b' }}>
                    <div style={{ padding: '10px 20px', background: '#0f172a', color: 'var(--text-accent)', borderTop: '2px solid var(--text-accent)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#61dafb' }}>⚛️</span> App.jsx
                    </div>
                    <div style={{ padding: '10px 20px', color: 'var(--text-secondary)', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#eab308' }}>JS</span> main.jsx
                    </div>
                </div>

                {/* Code Area */}
                <div style={{ flex: 1, padding: '20px', fontFamily: "'Fira Code', monospace", fontSize: '14px', lineHeight: '1.6', overflow: 'auto', color: '#d4d4d4' }}>
                    <div style={{ display: 'flex' }}>
                        <div style={{ width: '40px', color: '#6e7681', textAlign: 'right', paddingRight: '20px', userSelect: 'none' }}>
                            1<br />2<br />3<br />4<br />5<br />6<br />7<br />8<br />9<br />10
                        </div>
                        <div>
                            <span style={{ color: '#c586c0' }}>import</span> React <span style={{ color: '#c586c0' }}>from</span> <span style={{ color: '#ce9178' }}>'react'</span>;<br />
                            <br />
                            <span style={{ color: '#569cd6' }}>function</span> <span style={{ color: '#dcdcaa' }}>App</span>() {'{'}<br />
                            &nbsp;&nbsp;<span style={{ color: '#c586c0' }}>return</span> (<br />
                            &nbsp;&nbsp;&nbsp;&nbsp;&lt;<span style={{ color: '#4ec9b0' }}>div</span> <span style={{ color: '#9cdcfe' }}>className</span>=<span style={{ color: '#ce9178' }}>"container"</span>&gt;<br />
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;<span style={{ color: '#4ec9b0' }}>h1</span>&gt;Hello World&lt;/<span style={{ color: '#4ec9b0' }}>h1</span>&gt;<br />
                            &nbsp;&nbsp;&nbsp;&nbsp;&lt;/<span style={{ color: '#4ec9b0' }}>div</span>&gt;<br />
                            &nbsp;&nbsp;);<br />
                            {'}'}<br />
                            <br />
                            <span style={{ color: '#c586c0' }}>export</span> <span style={{ color: '#c586c0' }}>default</span> App;
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CodeStudio;
