import React, { useState } from 'react';

const GenInput = ({ onGenerate, isGenerating }) => {
    const [prompt, setPrompt] = useState('');

    const handleGenerate = () => {
        if (prompt.trim()) {
            onGenerate(prompt);
            setPrompt('');
        }
    };

    return (
        <div className="glass-card" style={{ padding: '24px', marginBottom: '32px' }}>
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the image you want to create..."
                style={{
                    width: '100%',
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '16px',
                    padding: '16px',
                    color: 'white',
                    fontSize: '1rem',
                    fontFamily: 'var(--font-main)',
                    minHeight: '100px',
                    marginBottom: '20px',
                    resize: 'none',
                    outline: 'none'
                }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', alignItems: 'center' }}>
                <select style={{
                    background: 'transparent',
                    border: '1px solid var(--glass-border)',
                    color: 'var(--text-secondary)',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    outline: 'none'
                }}>
                    <option>Aspect Ratio: 1:1</option>
                    <option>Aspect Ratio: 16:9</option>
                    <option>Aspect Ratio: 9:16</option>
                </select>
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim()}
                    style={{
                        background: isGenerating ? 'var(--text-secondary)' : 'var(--gradient-2)',
                        border: 'none',
                        padding: '12px 32px',
                        borderRadius: '12px',
                        color: 'white',
                        fontWeight: 600,
                        cursor: isGenerating ? 'not-allowed' : 'pointer',
                        opacity: isGenerating ? 0.7 : 1,
                        transition: 'transform 0.2s',
                    }}
                >
                    {isGenerating ? 'Generating...' : 'Generate'}
                </button>
            </div>
        </div>
    );
};

export default GenInput;
