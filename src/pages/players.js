import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

function Players() {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('analyses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) console.error(error);
      else setAnalyses(data);
    }
    load();
  }, []);

  // Group by player
  const playerMap = analyses.reduce((acc, a) => {
    const key = `${a.player_name || 'Unknown'}__${a.jersey_number || '?'}`;
    if (!acc[key]) acc[key] = { name: a.player_name || 'Unknown', jersey: a.jersey_number || '?', position: a.position, analyses: [] };
    acc[key].analyses.push(a);
    return acc;
  }, {});

  const players = Object.values(playerMap);

  function getGradeColor(grade) {
    if (!grade) return '#555';
    if (grade.startsWith('A')) return '#4ade80';
    if (grade.startsWith('B')) return '#ff6b00';
    if (grade.startsWith('C')) return '#facc15';
    return '#ff4444';
  }

  function timeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }

  const section = { background: '#0f1117', border: '1px solid #1a1d2e', borderRadius: '16px', padding: '24px' };

  return (
    <div className="main">
      <div className="top-bar">
        <div>
          <h1>Players</h1>
          <p>Performance breakdown by player</p>
        </div>
      </div>

      {players.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 40px', background: '#0f1117', border: '1px solid #1a1d2e', borderRadius: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>👤</div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>No players yet</div>
          <div style={{ fontSize: '14px', color: '#555', marginBottom: '24px' }}>Upload film to start tracking players</div>
          <button className="upload-btn" onClick={() => navigate('/upload')}>Upload Film</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {players.map(player => {
            const avg = Math.round(player.analyses.reduce((s, a) => s + a.score, 0) / player.analyses.length);
            const best = player.analyses.reduce((b, a) => a.score > b.score ? a : b, player.analyses[0]);
            const isSelected = selected?.name === player.name && selected?.jersey === player.jersey;

            return (
              <div key={`${player.name}-${player.jersey}`} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div
                  style={{
                    ...section,
                    cursor: 'pointer', transition: 'all 0.2s',
                    borderColor: isSelected ? '#ff6b00' : '#1a1d2e',
                  }}
                  onClick={() => setSelected(isSelected ? null : player)}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = '#ff6b00'; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = '#1a1d2e'; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <div style={{ fontSize: '18px', fontWeight: '800', color: '#fff' }}>{player.name}</div>
                      <div style={{ fontSize: '13px', color: '#555', marginTop: '2px' }}>#{player.jersey} · {player.position}</div>
                    </div>
                    <div style={{ fontSize: '36px', fontWeight: '900', color: getGradeColor(best.grade), letterSpacing: '-1px' }}>{best.grade}</div>
                  </div>

                  <div style={{ display: 'flex', gap: '20px', marginBottom: '16px' }}>
                    {[['Sessions', player.analyses.length], ['Avg Score', avg], ['Best', best.score]].map(([label, val]) => (
                      <div key={label}>
                        <div style={{ fontSize: '10px', color: '#555', letterSpacing: '1px', fontWeight: '700', textTransform: 'uppercase' }}>{label}</div>
                        <div style={{ fontSize: '22px', fontWeight: '800', color: '#fff' }}>{val}</div>
                      </div>
                    ))}
                  </div>

                  {/* Score bar */}
                  <div style={{ background: '#1a1d2e', borderRadius: '4px', height: '4px' }}>
                    <div style={{ background: 'linear-gradient(90deg, #ff6b00, #e85d24)', height: '4px', borderRadius: '4px', width: `${avg}%` }} />
                  </div>
                  <div style={{ fontSize: '12px', color: '#444', marginTop: '6px' }}>{isSelected ? 'Click to collapse' : 'Click to see analyses'}</div>
                </div>

                {/* Expanded analyses */}
                {isSelected && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {player.analyses.map(a => (
                      <div
                        key={a.id}
                        onClick={() => navigate(`/analysis/${a.id}`)}
                        style={{ background: '#0a0c12', border: '1px solid #1a1d2e', borderRadius: '12px', padding: '16px', cursor: 'pointer', transition: 'border-color 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = '#ff6b00'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = '#1a1d2e'}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>{a.session_name}</div>
                            <div style={{ fontSize: '11px', color: '#444', marginTop: '2px' }}>{timeAgo(a.created_at)}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '20px', fontWeight: '900', color: getGradeColor(a.grade) }}>{a.grade}</div>
                            <div style={{ fontSize: '11px', color: '#555' }}>{a.score}/100</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Players;
