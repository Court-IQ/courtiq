import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Brain() {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [category, setCategory] = useState('general');
  const [playType, setPlayType] = useState('');
  const [verdict, setVerdict] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [entries, setEntries] = useState([]);

  async function handleSave() {
    if (!text.trim()) return alert('Please write something first!');
    setLoading(true);
    setSuccess(false);
    setError('');

    try {
      const response = await fetch('https://tranquil-nourishment-production-4ff8.up.railway.app/api/brain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, category, playType, verdict })
      });

      const data = await response.json();
      if (data.success) {
        setSuccess(true);
        setEntries(prev => [...prev, { text, category, playType, verdict }]);
        setText('');
        setPlayType('');
        setVerdict('');
      } else {
        setError(data.error || 'Save failed. Check your Pinecone/OpenAI keys.');
      }
    } catch (err) {
      setError('Could not reach the server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #1a1d2e',
    background: '#080a0f',
    color: 'white',
    fontSize: '14px',
    fontFamily: 'Inter, sans-serif',
    outline: 'none',
  };

  const labelStyle = {
    color: '#555',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    display: 'block',
    marginBottom: '6px',
  };

  return (
    <div className="main">
      <div className="top-bar">
        <div>
          <h1>Basketball Brain</h1>
          <p>Add your basketball knowledge to train the AI</p>
        </div>
        <button className="upload-btn" onClick={() => navigate('/')}>Back to Dashboard</button>
      </div>

      <div style={{ background: '#0f1117', border: '1px solid #1a1d2e', borderRadius: '16px', padding: '28px', marginBottom: '24px' }}>
        <h2 style={{ marginBottom: '20px' }}>Add New Knowledge</h2>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Category</label>
          <select value={category} onChange={e => setCategory(e.target.value)} style={inputStyle}>
            <option value="general">General</option>
            <option value="shot_quality">Shot Quality</option>
            <option value="decision_making">Decision Making</option>
            <option value="positioning">Positioning</option>
            <option value="drill">Drill</option>
            <option value="habit">Habit</option>
          </select>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Play Type (optional)</label>
          <input
            type="text"
            placeholder="e.g. pull up jumper, drive to basket, pick and roll"
            value={playType}
            onChange={e => setPlayType(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Verdict (optional)</label>
          <select value={verdict} onChange={e => setVerdict(e.target.value)} style={inputStyle}>
            <option value="">None</option>
            <option value="GOOD SHOT">GOOD SHOT</option>
            <option value="BAD SHOT">BAD SHOT</option>
            <option value="RIGHT DECISION">RIGHT DECISION</option>
            <option value="WRONG DECISION">WRONG DECISION</option>
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Your Basketball Knowledge</label>
          <textarea
            placeholder="Write your basketball knowledge here. Be specific and detailed. Example: When a point guard drives left and the help defender rotates from the weak side, the best play is to either finish strong or hit the corner shooter..."
            value={text}
            onChange={e => setText(e.target.value)}
            rows={6}
            style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.6' }}
          />
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="upload-btn"
          style={{ width: '100%', opacity: loading ? 0.6 : 1 }}
        >
          {loading ? 'Saving to Brain...' : 'Add to Basketball Brain'}
        </button>

        {success && (
          <p style={{ color: '#4ade80', marginTop: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>
            ✅ Added to the basketball brain successfully!
          </p>
        )}
        {error && (
          <div style={{ background: '#2a0a0a', border: '1px solid #ff4444', borderRadius: '8px', padding: '10px 14px', color: '#ff4444', fontSize: '13px', fontWeight: '500', marginTop: '12px' }}>
            {error}
          </div>
        )}
      </div>

      {entries.length > 0 && (
        <div style={{ background: '#0f1117', border: '1px solid #1a1d2e', borderRadius: '16px', padding: '28px' }}>
          <h2 style={{ marginBottom: '16px' }}>Added This Session</h2>
          {entries.map((e, i) => (
            <div key={i} style={{ background: '#080a0f', border: '1px solid #1a1d2e', borderRadius: '10px', padding: '16px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                <span style={{ background: '#ff6b00', color: 'white', fontSize: '11px', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>{e.category}</span>
                {e.playType && <span style={{ background: '#1a1d2e', color: '#888', fontSize: '11px', padding: '2px 8px', borderRadius: '4px' }}>{e.playType}</span>}
                {e.verdict && <span style={{ background: '#0a2a0a', color: '#4ade80', fontSize: '11px', padding: '2px 8px', borderRadius: '4px' }}>{e.verdict}</span>}
              </div>
              <p style={{ color: '#ccc', fontSize: '14px', lineHeight: '1.6' }}>{e.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Brain;
