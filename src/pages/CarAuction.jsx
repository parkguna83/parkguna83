import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import GenInput from '../components/image-gen/GenInput'; // We can reuse this or rename it later

const CarAuction = () => {
    const [isSearching, setIsSearching] = useState(false);
    const [cars, setCars] = useState([
        { id: 1, title: '2023 Hyundai Grandeur', price: '₩42,000,000', location: 'Seoul', image: 'https://images.unsplash.com/photo-1621996537235-9683cc575510?w=600&auto=format&fit=crop&q=60' },
        { id: 2, title: '2021 Genesis G80', price: '₩55,000,000', location: 'Busan', image: 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=600&auto=format&fit=crop&q=60' },
        { id: 3, title: '2022 Kia K5', price: '₩28,500,000', location: 'Incheon', image: 'https://images.unsplash.com/photo-1599925232936-3a817d23d905?w=600&auto=format&fit=crop&q=60' },
    ]);

    const handleSearch = (query) => {
        setIsSearching(true);
        // Simulate search
        setTimeout(() => {
            // Just shuffling or adding a dummy result for demo
            setIsSearching(false);
            alert(`Searching for: ${query}`);
        }, 1500);
    };

    return (
        <div className="container" style={{ paddingBottom: '60px' }}>
            <div style={{ marginBottom: '32px', paddingTop: '20px' }}>
                <Link to="/" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.2rem' }}>←</span> Back
                </Link>
                <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginTop: '16px' }}>Car Auction Search</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Find the best deals on real estate auctions.</p>
            </div>

            {/* Reusing GenInput as SearchInput for now. Ideally should be renamed. */}
            <GenInput onGenerate={handleSearch} isGenerating={isSearching} />

            <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: 'var(--text-primary)' }}>Featured Listings</h2>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '24px'
            }}>
                {cars.map(car => (
                    <div key={car.id} className="glass-card" style={{
                        padding: '12px',
                        overflow: 'hidden',
                        transition: 'transform 0.3s',
                        cursor: 'pointer'
                    }}>
                        <div style={{
                            borderRadius: '16px',
                            overflow: 'hidden',
                            aspectRatio: '16/9',
                            marginBottom: '12px',
                            background: '#000'
                        }}>
                            <img src={car.image} alt={car.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ padding: '0 4px' }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{car.title}</h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-accent)' }}>
                                <span>{car.price}</span>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{car.location}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CarAuction;
