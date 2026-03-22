import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

function Analysis() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('analyses')
        .select('*')
        .eq('id', id)
        .single();
      if (error) console.error(error);
      else setAnalysis(data);
      setLoading(false);
    }
    load();
  }, [id]);

  const section = { background: '#0f1117', border: '1px solid #1a1d2e', borderRadius: '16px', padding: '24px' };
  const sectionTitle = { fontSize: '11px', fontWeight: '700', color: '#555', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' };
  const verdictBadge = (verdict, goodValue) => ({
    display: 'inline-block', marginBottom: '8px', padding: '3px 10px',
    borderRadius: '6px', fontSize: '12px', fontWeight: '700',
    background: verdict === goodValue ? '#0a2a0a' : '#2a0a0a',
    color: verdict === goodValue ? '#4ade80' : '#ff4444',
  });

  if (loading) return (
    <div className="main">
      <p style={{ color: '#555' }}>Loading...</p>
    </div>
  );

  if (!analysis) return (
    <div className="main">
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: '14px', fontWeight: '600', padding: 0, marginBottom: '24px', display: 'block' }}>← Back</button>
      <p style={{ color: '#555' }}>Analysis not found.</p>
    </div>
  );

  return (
    <div className="main">
      <div style={{ marginBottom: '32px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: '14px', fontWeight: '600', padding: 0, marginBottom: '16px', display: 'block' }}
        >
          ← Back
        </button>
        <h1 style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '-1px', color: '#fff', marginBottom: '4px' }}>{analysis.session_name}</h1>
        <p style={{ color: '#555', fontSize: '14px' }}>{analysis.player_name} #{analysis.jersey_number} · {analysis.position}</p>
      </div>

      {/* Score header */}
      <div style={{ ...section, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div>
          <div style={sectionTitle}>Overall Score</div>
          <div style={{ fontSize: '56px', fontWeight: '900', color: '#ff6b00', letterSpacing: '-2px', lineHeight: 1 }}>{analysis.grade}</div>
          <div style={{ fontSize: '13px', color: '#555', marginTop: '6px' }}>{analysis.score}/100</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={sectionTitle}>Play Type</div>
          <div style={{ color: '#fff', fontWeight: '700', fontSize: '15px' }}>{analysis.play_type || analysis.position}</div>
          <div style={{ color: '#555', fontSize: '13px', marginTop: '4px' }}>
            {new Date(analysis.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Result grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div style={section}>
          <div style={sectionTitle}>Offense</div>
          <p style={{ color: '#ccc', fontSize: '14px', lineHeight: '1.7' }}>{analysis.summary?.positioning?.offense}</p>
        </div>

        <div style={section}>
          <div style={sectionTitle}>Defense</div>
          <p style={{ color: '#ccc', fontSize: '14px', lineHeight: '1.7' }}>{analysis.summary?.positioning?.defense}</p>
        </div>

        <div style={section}>
          <div style={sectionTitle}>Shot Quality</div>
          <div style={verdictBadge(analysis.summary?.shotQuality?.verdict, 'GOOD SHOT')}>
            {analysis.summary?.shotQuality?.verdict}
          </div>
          <p style={{ color: '#ccc', fontSize: '14px', lineHeight: '1.7' }}>{analysis.summary?.shotQuality?.reason}</p>
        </div>

        <div style={section}>
          <div style={sectionTitle}>Decision Making</div>
          <div style={verdictBadge(analysis.summary?.decisionMaking?.verdict, 'RIGHT DECISION')}>
            {analysis.summary?.decisionMaking?.verdict}
          </div>
          <p style={{ color: '#ccc', fontSize: '14px', lineHeight: '1.7' }}>{analysis.summary?.decisionMaking?.reason}</p>
        </div>

        <div style={section}>
          <div style={sectionTitle}>What To Do Instead</div>
          <p style={{ color: '#ccc', fontSize: '14px', lineHeight: '1.7' }}>{analysis.summary?.shotQuality?.whatToDoInstead}</p>
        </div>

        <div style={section}>
          <div style={sectionTitle}>Habit</div>
          <p style={{ color: '#ccc', fontSize: '14px', lineHeight: '1.7' }}>{analysis.summary?.decisionMaking?.habit}</p>
        </div>

        <div style={{ ...section, gridColumn: '1 / -1', borderLeft: '3px solid #ff6b00' }}>
          <div style={sectionTitle}>Coaching Tip</div>
          <p style={{ color: '#fff', fontSize: '15px', lineHeight: '1.7', fontWeight: '500' }}>{analysis.summary?.coachingTip}</p>
        </div>

        <div style={{ ...section, gridColumn: '1 / -1' }}>
          <div style={sectionTitle}>Drill</div>
          <p style={{ color: '#ccc', fontSize: '14px', lineHeight: '1.7' }}>{analysis.summary?.drill}</p>
        </div>
      </div>
    </div>
  );
}

export default Analysis;
