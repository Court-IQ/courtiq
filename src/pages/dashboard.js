import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

function Dashboard() {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState([]);

  useEffect(() => {
    fetchAnalyses();
  }, []);

  async function fetchAnalyses() {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('analyses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
    if (error) console.error(error);
    else setAnalyses(data);
  }

  const avgScore = analyses.length
    ? Math.round(analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length)
    : 0;

  const bestGrade = analyses.length
    ? analyses.reduce((best, a) => a.score > best.score ? a : best, analyses[0]).grade
    : 'N/A';

  const chartData = analyses.slice(-10).map((a, i) => ({
    name: `#${i + 1}`,
    score: a.score,
    label: a.session_name
  }));

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
        <div style={{ background: '#1a1d27', border: '1px solid #333', borderRadius: '8px', padding: '10px' }}>
          <p style={{ color: '#e85d24', fontWeight: 'bold', margin: 0 }}>{payload[0].value}/100</p>
          <p style={{ color: '#888', fontSize: '12px', margin: 0 }}>{payload[0].payload.label}</p>
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
        <div className="stat-card">
          <div className="stat-label">TOTAL SESSIONS</div>
          <div className="stat-value">{analyses.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">COMPLETED</div>
          <div className="stat-value">{analyses.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">AVG SCORE</div>
          <div className="stat-value">{avgScore}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">BEST GRADE</div>
          <div className="stat-value">{bestGrade}</div>
        </div>
      </div>

      {analyses.length >= 2 && (
        <div style={{ background: '#1a1d27', borderRadius: '12px', padding: '24px', marginBottom: '32px' }}>
          <h2 style={{ marginBottom: '16px' }}>Progress Over Time</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" />
              <XAxis dataKey="name" stroke="#888" tick={{ fill: '#888', fontSize: 12 }} />
              <YAxis domain={[0, 100]} stroke="#888" tick={{ fill: '#888', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#e85d24"
                strokeWidth={2}
                dot={{ fill: '#e85d24', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <h2>Recent Analyses</h2>
      <div className="analyses-grid">
        {[...analyses].reverse().map((a) => (
          <div className="analysis-card" key={a.id}>
            <div className="analysis-title">{a.session_name}</div>
            <div className="analysis-meta">{timeAgo(a.created_at)} · {a.position} · #{a.jersey_number} {a.player_name}</div>
            <div className="grade">{a.grade}</div>
            <div className="score-bar">
              <div className="score-fill" style={{ width: `${a.score}%` }}></div>
            </div>
            <div className="score-label">{a.score}/100</div>
          </div>
        ))}
        {analyses.length === 0 && (
          <p style={{ color: '#888' }}>No analyses yet. Upload your first film!</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
