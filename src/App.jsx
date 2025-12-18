import React from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import Hero from './components/Hero';
import AppGrid from './components/AppGrid';
// import RealEstate from './pages/RealEstate';
import CarAuction from './pages/CarAuction';
// import Chat from './pages/Chat';
// import ImageGen from './pages/ImageGen';
// import CodeStudio from './pages/CodeStudio';
// import Documents from './pages/Documents';

const Home = () => (
  <>
    <Hero />
    <AppGrid />
  </>
);

function App() {
  return (
    <HashRouter>
      <div className="container">
        <nav style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px 0'
        }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ fontWeight: 700, fontSize: '24px' }}>ParkG's Workspace</div>
          </Link>
          <div style={{ display: 'flex', gap: '24px', opacity: 0.7 }}>
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</Link>
            <span>Settings</span>
          </div>
        </nav>

        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            {/* <Route path="/real-estate" element={<RealEstate />} /> */}
            <Route path="/car-auction" element={<CarAuction />} />
          </Routes>
        </main>

        <footer style={{
          textAlign: 'center',
          padding: '60px 0',
          color: 'var(--text-secondary)',
          fontSize: '0.9rem'
        }}>
          © 2025 ParkG's Personal Workspace
        </footer>
      </div>
    </HashRouter>
  );
}

export default App;
