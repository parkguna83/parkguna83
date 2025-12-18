import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import GenInput from '../components/image-gen/GenInput';
import iconImage from '../assets/icon-image.png';

const ImageGen = () => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [images, setImages] = useState([
        { id: 1, prompt: 'Cyberpunk city street at night, neon lights, rain', url: 'https://images.unsplash.com/photo-1605218427306-6354db696bea?w=600&auto=format&fit=crop&q=60' },
        { id: 2, prompt: 'Minimalist abstract 3d shapes, pastel colors', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=60' },
        { id: 3, prompt: 'Portrait of a robot with human emotions', url: 'https://images.unsplash.com/photo-1546776310-5112afc53ce2?w=600&auto=format&fit=crop&q=60' },
    ]);

    const handleGenerate = (prompt) => {
        setIsGenerating(true);
        // Simulate generation
        setTimeout(() => {
            const newImage = {
                id: Date.now(),
                prompt: prompt,
                url: iconImage // Using the icon as a placeholder for "newly generated" image for now
            };
            setImages([newImage, ...images]);
            setIsGenerating(false);
        }, 2000);
    };

    return (
        <div className="container" style={{ paddingBottom: '60px' }}>
            <div style={{ marginBottom: '32px', paddingTop: '20px' }}>
                <Link to="/" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.2rem' }}>←</span> Back
                </Link>
                <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginTop: '16px' }}>Image Studio</h1>
            </div>

            <GenInput onGenerate={handleGenerate} isGenerating={isGenerating} />

            <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: 'var(--text-primary)' }}>Your Gallery</h2>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '24px'
            }}>
                {images.map(img => (
                    <div key={img.id} className="glass-card" style={{
                        padding: '12px',
                        overflow: 'hidden',
                        transition: 'transform 0.3s'
                    }}>
                        <div style={{
                            borderRadius: '16px',
                            overflow: 'hidden',
                            aspectRatio: '1',
                            marginBottom: '12px',
                            background: '#000'
                        }}>
                            <img src={img.url} alt={img.prompt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <p style={{
                            color: 'var(--text-secondary)',
                            fontSize: '0.9rem',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            padding: '0 4px'
                        }}>
                            {img.prompt}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ImageGen;
