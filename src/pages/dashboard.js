import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

function Dashboard() {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [usage, setUsage] = useState(null);

  useEffect(() => {
    fetchAnalyses();
    fetchUsage();
  }, []);

  async function fetchUsage() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    try {
      const res = await fetch('https://courtiq-n8wl.onrender.com/api/check-usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      setUsage(data);
    } catch (e) {
      console.error('Usage check failed:', e);
    }
  }

  async function fetchAnalyses() {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('analyses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
    if (error) console.error(error);
    else setAnalyses(data);
    setLoadingData(false);
  }

  const avgScore = analyses.length
    ? Math.round(analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length)
    : 0;

  const chartData = analyses.slice(-10).map((a, i) => ({
    name: `#${i + 1}`,
    score: a.score,
    label: a.session_name
  }));

  // Play type breakdown
  const playTypeStats = analyses.reduce((acc, a) => {
    const pt = a.play_type || 'unknown';
    if (!acc[pt]) acc[pt] = { total: 0, count: 0 };
    acc[pt].total += a.score;
    acc[pt].count += 1;
    return acc;
  }, {});

  const playTypeData = Object.entries(playTypeStats)
    .map(([type, stats]) => ({ type, avg: Math.round(stats.total / stats.count), count: stats.count }))
    .sort((a, b) => b.avg - a.avg);

  function timeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '12px 16px' }}>
          <p style={{ color: '#ff6b00', fontWeight: '800', margin: 0, fontSize: '16px' }}>{payload[0].value}/100</p>
          <p style={{ color: '#555', fontSize: '12px', margin: '4px 0 0' }}>{payload[0].payload.label}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="main">
      <div className="top-bar">
        <div>
          <h1>Dashboard</h1>
          <p>Your basketball performance at a glance</p>
        </div>
        <button className="upload-btn" onClick={() => navigate('/upload')}>Upload Film</button>
      </div>

      <div className="stats-row">
        {[
          ['Total Sessions', loadingData ? null : analyses.length],
          ['Avg Score', loadingData ? null : avgScore],
          ['This Month', loadingData ? null : (usage ? usage.used : '—')],
        ].map(([label, val]) => (
          <div className="stat-card" key={label}>
            <div className="stat-label">{label}</div>
            {val === null
              ? <div className="skeleton" style={{ height: '36px', width: '60px', marginTop: '4px' }} />
              : <div className="stat-value">{val}</div>
            }
          </div>
        ))}
      </div>

      {analyses.length >= 2 && (
        <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
          <h2 style={{ marginBottom: '20px' }}>Progress Over Time</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#333" tick={{ fill: '#555', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} stroke="#333" tick={{ fill: '#555', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="score" stroke="#ff6b00" strokeWidth={2.5}
                dot={{ fill: '#ff6b00', r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#ff6b00', strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Play type breakdown */}
      {playTypeData.length > 0 && (
        <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '24px', marginBottom: '32px' }}>
          <h2 style={{ marginBottom: '20px' }}>By Play Type</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {playTypeData.map(({ type, avg, count }) => (
              <div key={type}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151', textTransform: 'capitalize' }}>{type}</span>
                  <span style={{ fontSize: '13px', color: '#555' }}>{avg}/100 · {count} session{count !== 1 ? 's' : ''}</span>
                </div>
                <div style={{ background: '#e5e7eb', borderRadius: '4px', height: '6px' }}>
                  <div style={{
                    background: avg >= 80 ? '#4ade80' : avg >= 65 ? '#ff6b00' : '#ff4444',
                    height: '6px', borderRadius: '4px', width: `${avg}%`, transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2>Recent Analyses</h2>

      {analyses.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 40px', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏀</div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#111827', marginBottom: '8px' }}>No analyses yet</div>
          <div style={{ fontSize: '14px', color: '#555', marginBottom: '24px' }}>Upload your first game film to get started</div>
          <button className="upload-btn" onClick={() => navigate('/upload')}>Upload Film</button>
        </div>
      ) : (
        <div className="analyses-grid">
          {[...analyses].reverse().map((a) => (
            <div
              className="analysis-card"
              key={a.id}
              onClick={() => navigate(`/analysis/${a.id}`)}
            >
              <div className="analysis-title">{a.session_name}</div>
              <div className="analysis-meta">{timeAgo(a.created_at)} · {a.position} · #{a.jersey_number} {a.player_name}</div>
              <div className="grade">{a.grade}</div>
              <div className="score-bar">
                <div className="score-fill" style={{ width: `${a.score}%` }}></div>
              </div>
              <div className="score-label">{a.score}/100</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
