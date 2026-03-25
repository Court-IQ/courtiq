import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

const ADMIN_ID = '4b1e31f7-6366-440b-896f-ef858d9fdec2';
const API_URL = 'https://tranquil-nourishment-production-4ff8.up.railway.app';

function Admin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [tab, setTab] = useState('overview'); // overview, users, analyses

  useEffect(() => {
    checkAdmin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function checkAdmin() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== ADMIN_ID) {
      navigate('/');
      return;
    }
    fetchStats(user.id);
  }

  async function fetchStats(userId) {
    try {
      const res = await fetch(`${API_URL}/api/admin/stats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error('Admin fetch failed:', e);
    }
    setLoading(false);
  }

  function timeAgo(date) {
    if (!date) return 'unknown';
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
  }

  if (loading) return <div className="main" style={{ color: '#555' }}>Loading...</div>;
  if (!stats) return <div className="main" style={{ color: '#555' }}>Failed to load admin data.</div>;

  const section = {
    background: '#0f1117',
    border: '1px solid #1a1d2e',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '16px',
  };

  return (
    <div className="main">
      <div className="top-bar">
        <div>
          <h1>Admin Dashboard</h1>
          <p>CourtIQ analytics and user data</p>
        </div>
        <button className="upload-btn" onClick={() => fetchStats(ADMIN_ID)} style={{ padding: '10px 20px' }}>
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="stats-row">
        {[
          ['Total Users', stats.totalUsers],
          ['Total Analyses', stats.totalAnalyses],
          ['Signups Today', stats.signupsToday],
          ['Analyses Today', stats.analysesToday],
        ].map(([label, val]) => (
          <div className="stat-card" key={label}>
            <div className="stat-label">{label}</div>
            <div className="stat-value">{val}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {['overview', 'users', 'analyses'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: tab === t ? 'none' : '1px solid #1a1d2e',
              background: tab === t ? '#ff6b00' : 'transparent',
              color: tab === t ? '#fff' : '#888',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
        <>
          <div style={section}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#555', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px' }}>
              Recent Users
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1a1d2e' }}>
                    {['Email', 'Name', 'Plan', 'Analyses', 'Signed Up'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: '11px', color: '#555', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats.users.slice(0, 10).map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #0a0c12' }}>
                      <td style={{ padding: '10px 12px', fontSize: '13px', color: '#ff6b00', fontWeight: '600' }}>{u.email}</td>
                      <td style={{ padding: '10px 12px', fontSize: '13px', color: '#ccc' }}>{u.full_name || '—'}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{
                          fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px',
                          background: u.plan === 'elite' ? '#2a1000' : u.plan === 'pro' ? '#1a1000' : '#1a1d2e',
                          color: u.plan === 'elite' ? '#ff6b00' : u.plan === 'pro' ? '#ff6b00' : '#555',
                          textTransform: 'uppercase', letterSpacing: '1px',
                        }}>{u.plan}</span>
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: '13px', color: '#ccc', fontWeight: '700' }}>{u.total_analyses}</td>
                      <td style={{ padding: '10px 12px', fontSize: '12px', color: '#555' }}>{timeAgo(u.signed_up)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={section}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#555', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px' }}>
              Recent Analyses
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1a1d2e' }}>
                    {['User', 'Session', 'Play Type', 'Score', 'Grade', 'When'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: '11px', color: '#555', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats.recentAnalyses.slice(0, 10).map((a, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #0a0c12' }}>
                      <td style={{ padding: '10px 12px', fontSize: '13px', color: '#ff6b00', fontWeight: '600' }}>{a.email}</td>
                      <td style={{ padding: '10px 12px', fontSize: '13px', color: '#ccc' }}>{a.session_name}</td>
                      <td style={{ padding: '10px 12px', fontSize: '12px', color: '#888', textTransform: 'capitalize' }}>{a.play_type || '—'}</td>
                      <td style={{ padding: '10px 12px', fontSize: '13px', color: '#ccc', fontWeight: '700' }}>{a.score}</td>
                      <td style={{ padding: '10px 12px', fontSize: '16px', fontWeight: '900', color: a.grade?.startsWith('A') ? '#4ade80' : a.grade?.startsWith('B') ? '#ff6b00' : '#ff4444' }}>{a.grade}</td>
                      <td style={{ padding: '10px 12px', fontSize: '12px', color: '#555' }}>{timeAgo(a.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Users Tab */}
      {tab === 'users' && (
        <div style={section}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#555', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px' }}>
            All Users ({stats.users.length})
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1a1d2e' }}>
                  {['Email', 'Name', 'Team', 'Position', 'Plan', 'Analyses', 'Signed Up'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: '11px', color: '#555', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.users.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #0a0c12' }}>
                    <td style={{ padding: '10px 12px', fontSize: '13px', color: '#ff6b00', fontWeight: '600' }}>{u.email}</td>
                    <td style={{ padding: '10px 12px', fontSize: '13px', color: '#ccc' }}>{u.full_name || '—'}</td>
                    <td style={{ padding: '10px 12px', fontSize: '13px', color: '#888' }}>{u.team_name || '—'}</td>
                    <td style={{ padding: '10px 12px', fontSize: '12px', color: '#888', textTransform: 'capitalize' }}>{u.position || '—'}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{
                        fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px',
                        background: u.plan === 'elite' ? '#2a1000' : u.plan === 'pro' ? '#1a1000' : '#1a1d2e',
                        color: u.plan === 'elite' ? '#ff6b00' : u.plan === 'pro' ? '#ff6b00' : '#555',
                        textTransform: 'uppercase', letterSpacing: '1px',
                      }}>{u.plan}</span>
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: '13px', color: '#ccc', fontWeight: '700' }}>{u.total_analyses}</td>
                    <td style={{ padding: '10px 12px', fontSize: '12px', color: '#555' }}>{timeAgo(u.signed_up)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Analyses Tab */}
      {tab === 'analyses' && (
        <div style={section}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#555', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px' }}>
            All Recent Analyses ({stats.recentAnalyses.length})
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1a1d2e' }}>
                  {['User', 'Session', 'Player', 'Play Type', 'Score', 'Grade', 'When'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: '11px', color: '#555', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.recentAnalyses.map((a, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #0a0c12' }}>
                    <td style={{ padding: '10px 12px', fontSize: '13px', color: '#ff6b00', fontWeight: '600' }}>{a.email}</td>
                    <td style={{ padding: '10px 12px', fontSize: '13px', color: '#ccc' }}>{a.session_name}</td>
                    <td style={{ padding: '10px 12px', fontSize: '13px', color: '#888' }}>{a.player_name || '—'}</td>
                    <td style={{ padding: '10px 12px', fontSize: '12px', color: '#888', textTransform: 'capitalize' }}>{a.play_type || '—'}</td>
                    <td style={{ padding: '10px 12px', fontSize: '13px', color: '#ccc', fontWeight: '700' }}>{a.score}</td>
                    <td style={{ padding: '10px 12px', fontSize: '16px', fontWeight: '900', color: a.grade?.startsWith('A') ? '#4ade80' : a.grade?.startsWith('B') ? '#ff6b00' : '#ff4444' }}>{a.grade}</td>
                    <td style={{ padding: '10px 12px', fontSize: '12px', color: '#555' }}>{timeAgo(a.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
