import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';

function History() {
  const [analyses, setAnalyses] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
  fetchAnalyses();
}, []);

async function fetchAnalyses() {
  const { data, error } = await supabase
    .from('analyses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) console.error(error);
  else setAnalyses(data);
}

async function handleDelete(id) {
  if (!window.confirm('Delete this analysis?')) return;
  const { error } = await supabase.from('analyses').delete().eq('id', id);
  if (error) console.error(error);
  else {
    setAnalyses(analyses.filter(a => a.id !== id));
    if (selected?.id === id) setSelected(null);
  }
}
 

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
          <h1>History</h1>
          <p>All your past film analyses</p>
        </div>
      </div>

      {selected && (
        <div style={{ background: '#1a1a2e', padding: '20px', borderRadius: '12px', marginBottom: '30px', color: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>{selected.session_name}</h2>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: '1px solid #333', color: 'white', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer' }}>Close</button>
          </div>
          <p style={{ color: '#ff6b35' }}>Player: {selected.player_name} #{selected.jersey_number} — {selected.position}</p>
          <p style={{ fontSize: '2rem', color: '#ff6b35' }}>{selected.grade} — {selected.score}/100</p>

          <div style={{ marginTop: '15px', borderTop: '1px solid #333', paddingTop: '15px' }}>
            <p><strong>🏃 Offense:</strong> {selected.summary?.positioning?.offense}</p>
            <p><strong>🛡️ Defense:</strong> {selected.summary?.positioning?.defense}</p>
            <p><strong>🎯 Shot Quality:</strong> <span style={{ color: selected.summary?.shotQuality?.verdict === 'GOOD SHOT' ? '#00ff88' : '#ff4444' }}>{selected.summary?.shotQuality?.verdict}</span> — {selected.summary?.shotQuality?.reason}</p>
            <p><strong>🧠 Decision:</strong> <span style={{ color: selected.summary?.decisionMaking?.verdict === 'RIGHT DECISION' ? '#00ff88' : '#ff4444' }}>{selected.summary?.decisionMaking?.verdict}</span> — {selected.summary?.decisionMaking?.reason}</p>
            <p><strong>💡 Coaching Tip:</strong> {selected.summary?.coachingTip}</p>
            <p><strong>🔄 What To Do Instead:</strong> {selected.summary?.shotQuality?.whatToDoInstead}</p>
<p><strong>📋 Habit:</strong> {selected.summary?.decisionMaking?.habit}</p>
<p><strong>🏋️ Drill:</strong> {selected.summary?.drill}</p>
          </div>
        </div>
      )}

      <div className="analyses-grid">
        {analyses.map((a) => (
          <div
            className="analysis-card"
            key={a.id}
            onClick={() => setSelected(a)}
            style={{ cursor: 'pointer' }}
          >
            <div className="analysis-title">{a.session_name}</div>
            <div className="analysis-meta">{timeAgo(a.created_at)} · {a.position} · #{a.jersey_number} {a.player_name}</div>
            <div className="grade">{a.grade}</div>
            <div className="score-bar">
              <div className="score-fill" style={{ width: `${a.score}%` }}></div>
            </div>
            <div className="score-label">{a.score}/100</div>
           <p style={{ color: '#888', fontSize: '0.8rem', marginTop: '8px' }}>Click to see full analysis</p>
<button
  onClick={(e) => {
    e.stopPropagation();
    handleDelete(a.id);
  }}
  style={{ marginTop: '8px', background: 'none', border: '1px solid #ff4444', color: '#ff4444', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}
>
  🗑️ Delete
</button>
          </div>
        ))}

        {analyses.length === 0 && (
          <p style={{ color: '#888' }}>No analyses yet. Upload your first film!</p>
        )}
      </div>
    </div>
  );
}

export default History;