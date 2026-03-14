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
  return (
    <div className="sidebar">
      <div className="logo">
        <span className="logo-icon">🏀</span>
        <div>
          <div className="logo-title">CourtIQ</div>
          <div className="logo-sub">AI FILM ANALYSIS</div>
        </div>
      </div>
      <nav>
        <div className="nav-item" onClick={() => navigate('/')}>Dashboard</div>
        <div className="nav-item" onClick={() => navigate('/upload')}>Upload Film</div>
        <div className="nav-item" onClick={() => navigate('/history')}>History</div>
        <div className="nav-item" onClick={onSignOut} style={{ marginTop: 'auto', color: '#ff4444' }}>Sign Out</div>
      </nav>
    </div>
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