import React from 'react';

const Hero = () => {
    return (
        <section style={{
            textAlign: 'center',
            padding: '80px 0 40px',
            position: 'relative'
        }}>
            <div className="animate-fade-in">
                <h1 style={{
                    fontSize: '4rem',
                    fontWeight: 700,
                    marginBottom: '16px',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.1
                }}>
                    <span className="text-gradient">ParkG's</span><br />
                    Program Collection
                </h1>
                <p style={{
                    fontSize: '1.25rem',
                    color: 'var(--text-secondary)',
                    maxWidth: '600px',
                    margin: '0 auto'
                }}>
                    A central hub for running and managing my custom-built AI applications and tools.
                </p>
            </div>
        </section>
    );
};

export default Hero;
