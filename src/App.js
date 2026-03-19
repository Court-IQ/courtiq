import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import Dashboard from './pages/dashboard';
import Upload from './pages/upload';
import History from './pages/history';
import Auth from './Auth';
import { supabase } from './supabase';

function Sidebar({ onSignOut }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'none',
          position: 'fixed',
          top: '16px',
          left: '16px',
          zIndex: 1000,
          background: '#e85d24',
          border: 'none',
          borderRadius: '8px',
          padding: '10px 14px',
          color: 'white',
          fontSize: '20px',
          cursor: 'pointer'
        }}
        className="hamburger"
      >
        {open ? '✕' : '☰'}
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 998
          }}
        />
      )}

      <div className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="logo">
          <span className="logo-icon">🏀</span>
          <div>
            <div className="logo-title">CourtIQ</div>
            <div className="logo-sub">AI FILM ANALYSIS</div>
          </div>
        </div>
        <nav>
          <div className="nav-item" onClick={() => { navigate('/'); setOpen(false); }}>Dashboard</div>
          <div className="nav-item" onClick={() => { navigate('/upload'); setOpen(false); }}>Upload Film</div>
          <div className="nav-item" onClick={() => { navigate('/history'); setOpen(false); }}>History</div>
          <div className="nav-item" onClick={onSignOut} style={{ marginTop: 'auto', color: '#ff4444' }}>Sign Out</div>
        </nav>
      </div>
    </>
  );
}

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setSession(null);
  }

  if (loading) return <div style={{ color: 'white', padding: '20px' }}>Loading...</div>;

  if (!session) return <Auth />;

  return (
    <BrowserRouter>
      <div className="layout">
        <Sidebar onSignOut={handleSignOut} />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;