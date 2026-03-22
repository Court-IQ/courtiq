import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';

function History() {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState([]);
  const [selected, setSelected] = useState(null);

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

  const section = {
    background: '#0f1117',
    border: '1px solid #1a1d2e',
    borderRadius: '16px',
    padding: '24px',
  };

  const sectionTitle = {
    fontSize: '11px',
    fontWeight: '700',
    color: '#555',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    marginBottom: '10px',
  };

  const verdictBadge = (verdict, goodValue) => ({
    display: 'inline-block',
    marginBottom: '8px',
    padding: '3px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '700',
    background: verdict === goodValue ? '#0a2a0a' : '#2a0a0a',
    color: verdict === goodValue ? '#4ade80' : '#ff4444',
  });

  return (
    <div className="main">
      <div className="top-bar">
        <div>
          <h1>History</h1>
          <p>All your past film analyses</p>
        </div>
      </div>

      {/* Detail View */}
      {selected && (
        <div style={{ marginBottom: '32px' }}>
          {/* Header */}
          <div style={{ ...section, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div>
              <div style={sectionTitle}>Analysis</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#fff', marginBottom: '4px' }}>{selected.session_name}</div>
              <div style={{ fontSize: '13px', color: '#555' }}>
                {selected.player_name} #{selected.jersey_number} · {selected.position}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '52px', fontWeight: '900', color: '#ff6b00', letterSpacing: '-2px', lineHeight: 1 }}>
                  {selected.grade}
                </div>
                <div style={{ fontSize: '13px', color: '#555', marginTop: '4px' }}>{selected.score}/100</div>
              </div>
              <button
                onClick={() => setSelected(null)}
                style={{
                  background: 'none', border: '1px solid #1a1d2e', color: '#555',
                  padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600'
                }}
              >
                Close
              </button>
            </div>
          </div>

          {/* Result boxes */}
          <div className="result-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={section}>
              <div style={sectionTitle}>Offense</div>
              <p style={{ color: '#ccc', fontSize: '14px', lineHeight: '1.6' }}>{selected.summary?.positioning?.offense}</p>
            </div>

            <div style={section}>
              <div style={sectionTitle}>Defense</div>
              <p style={{ color: '#ccc', fontSize: '14px', lineHeight: '1.6' }}>{selected.summary?.positioning?.defense}</p>
            </div>

            <div style={section}>
              <div style={sectionTitle}>Shot Quality</div>
              <div style={verdictBadge(selected.summary?.shotQuality?.verdict, 'GOOD SHOT')}>
                {selected.summary?.shotQuality?.verdict}
              </div>
              <p style={{ color: '#ccc', fontSize: '14px', lineHeight: '1.6' }}>{selected.summary?.shotQuality?.reason}</p>
            </div>

            <div style={section}>
              <div style={sectionTitle}>Decision Making</div>
              <div style={verdictBadge(selected.summary?.decisionMaking?.verdict, 'RIGHT DECISION')}>
                {selected.summary?.decisionMaking?.verdict}
              </div>
              <p style={{ color: '#ccc', fontSize: '14px', lineHeight: '1.6' }}>{selected.summary?.decisionMaking?.reason}</p>
            </div>

            <div style={section}>
              <div style={sectionTitle}>What To Do Instead</div>
              <p style={{ color: '#ccc', fontSize: '14px', lineHeight: '1.6' }}>{selected.summary?.shotQuality?.whatToDoInstead}</p>
            </div>

            <div style={section}>
              <div style={sectionTitle}>Habit</div>
              <p style={{ color: '#ccc', fontSize: '14px', lineHeight: '1.6' }}>{selected.summary?.decisionMaking?.habit}</p>
            </div>

            <div style={{ ...section, gridColumn: '1 / -1' }}>
              <div style={sectionTitle}>Coaching Tip</div>
              <p style={{ color: '#ccc', fontSize: '14px', lineHeight: '1.6' }}>{selected.summary?.coachingTip}</p>
            </div>

            <div style={{ ...section, gridColumn: '1 / -1' }}>
              <div style={sectionTitle}>Drill</div>
              <p style={{ color: '#ccc', fontSize: '14px', lineHeight: '1.6' }}>{selected.summary?.drill}</p>
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      {analyses.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '80px 40px', background: '#0f1117', border: '1px solid #1a1d2e',
          borderRadius: '16px', textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📽️</div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>No analyses yet</div>
          <div style={{ fontSize: '14px', color: '#555', marginBottom: '24px' }}>Upload your first game film to get started</div>
          <button className="upload-btn" onClick={() => navigate('/upload')}>Upload Film</button>
        </div>
      ) : (
        <div className="analyses-grid">
          {analyses.map((a) => (
            <div
              className="analysis-card"
              key={a.id}
              onClick={() => setSelected(a)}
            >
              <div className="analysis-title">{a.session_name}</div>
              <div className="analysis-meta">{timeAgo(a.created_at)} · {a.position} · #{a.jersey_number} {a.player_name}</div>
              <div className="grade">{a.grade}</div>
              <div className="score-bar">
                <div className="score-fill" style={{ width: `${a.score}%` }}></div>
              </div>
              <div className="score-label">{a.score}/100</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
                <span style={{ color: '#444', fontSize: '12px' }}>Click to expand</span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(a.id); }}
                  style={{
                    background: 'none', border: '1px solid #2a0a0a', color: '#ff4444',
                    padding: '3px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default History;
