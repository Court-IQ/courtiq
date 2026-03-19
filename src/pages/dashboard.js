import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

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
      .order('created_at', { ascending: false });
    if (error) console.error(error);
    else setAnalyses(data);
  }

  const avgScore = analyses.length
    ? Math.round(analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length)
    : 0;

  const bestGrade = analyses.length
    ? analyses.reduce((best, a) => a.score > best.score ? a : best, analyses[0]).grade
    : 'N/A';

  function timeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  }

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
      <h2>Recent Analyses</h2>
      <div className="analyses-grid">
        {analyses.map((a) => (
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