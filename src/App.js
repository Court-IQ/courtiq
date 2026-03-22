import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import Dashboard from './pages/dashboard';
import History from './pages/history';
import Chat from './pages/chat';
import Admin from './pages/admin';
import Brain from './pages/brain';
import Analysis from './pages/analysis';
import Players from './pages/players';
import GameUpload from './pages/game-upload';
import Landing from './pages/landing';
import Auth from './Auth';
import { supabase } from './supabase';

function Sidebar({ onSignOut }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'Upload', path: '/upload' },
    { label: 'History', path: '/history' },
    { label: 'AI Coach', path: '/chat' },
  ];

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
          background: '#ff6b00',
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
            background: 'rgba(0,0,0,0.6)',
            zIndex: 998
          }}
        />
      )}

      <div className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="logo">
          <span style={{ fontSize: '24px' }}>🏀</span>
          <div>
            <div className="logo-title">CourtIQ</div>
            <div className="logo-sub">AI FILM ANALYSIS</div>
          </div>
        </div>
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map(item => (
            <div
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => { navigate(item.path); setOpen(false); }}
            >
              {item.label}
            </div>
          ))}
        </nav>
        <div
          className="nav-item"
          onClick={onSignOut}
          style={{ color: '#ff4444', marginTop: '8px' }}
        >
          Sign Out
        </div>
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

  if (loading) return (
    <div style={{ color: 'white', padding: '20px', background: '#080a0f', height: '100vh' }}>Loading...</div>
  );

  // Not logged in — use BrowserRouter so Landing/Auth can use useNavigate
  if (!session) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="*" element={<Landing />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <div className="layout">
        <Sidebar onSignOut={handleSignOut} />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/upload" element={<GameUpload />} />
          <Route path="/history" element={<History />} />
          <Route path="/players" element={<Players />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/brain" element={<Brain />} />
          <Route path="/analysis/:id" element={<Analysis />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
