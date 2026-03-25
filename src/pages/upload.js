import React, { useState, useRef } from 'react';
import { supabase } from '../supabase';

export default function Upload() {
  const [file, setFile] = useState(null);
  const [videoURL, setVideoURL] = useState(null);
  const [sessionName, setSessionName] = useState('');
  const [position, setPosition] = useState('point guard');
  const [playerName, setPlayerName] = useState('');
  const [jerseyNumber, setJerseyNumber] = useState('');
  const [playType, setPlayType] = useState('post move');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const videoRef = useRef(null);

  function handleFileChange(e) {
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);
    setVideoURL(URL.createObjectURL(selected));
    setResult(null);
  }

  function extractFrames(video, numFrames = 5) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      const frames = [];
      const duration = video.duration;
      const interval = duration / numFrames;
      let captured = 0;

      function captureFrame(time) { video.currentTime = time; }

      video.addEventListener('seeked', function onSeeked() {
        ctx.drawImage(video, 0, 0);
        frames.push(canvas.toDataURL('image/jpeg', 0.8).split(',')[1]);
        captured++;
        if (captured < numFrames) {
          captureFrame(interval * captured);
        } else {
          video.removeEventListener('seeked', onSeeked);
          resolve(frames);
        }
      });

      captureFrame(0);
    });
  }

  async function handleAnalyze() {
    if (!file || !sessionName) return alert('Please add a session name and video');
    setLoading(true);

    try {
      const video = videoRef.current;
      if (video.duration > 30) return alert('Please upload a clip under 30 seconds for best results.');
      const frames = await extractFrames(video, 5);

      const response = await fetch('https://tranquil-nourishment-production-4ff8.up.railway.app/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frames, sessionName, position, playerName, jerseyNumber, playType, mode: 'pro' })
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      setResult(data.result);

      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('analyses').insert([{
        session_name: data.result.sessionName,
        player_name: data.result.playerName,
        jersey_number: data.result.jerseyNumber,
        position: data.result.position,
        play_type: data.result.playType,
        score: data.result.score,
        grade: data.result.grade,
        summary: data.result.summary,
        user_id: user.id,
      }]);
      if (error) console.error('Save error:', error);
    } catch (err) {
      alert('Analysis failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  const input = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    background: '#f5f6f8',
    color: '#111827',
    fontSize: '14px',
    fontFamily: 'Inter, sans-serif',
    outline: 'none',
  };

  const section = {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '16px',
  };

  const sectionTitle = {
    fontSize: '11px',
    fontWeight: '700',
    color: '#555',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    marginBottom: '16px',
  };

  const row = { display: 'flex', gap: '12px' };

  return (
    <div className="main">
      <div className="top-bar">
        <div>
          <h1>Upload Film</h1>
          <p>Upload your game film for AI analysis</p>
        </div>
      </div>

      <div style={{ maxWidth: '680px' }}>

        {/* Session Info */}
        <div style={section}>
          <div style={sectionTitle}>Session Info</div>
          <input
            type="text"
            placeholder="Session name (e.g. League Game vs Eagles)"
            value={sessionName}
            onChange={e => setSessionName(e.target.value)}
            style={input}
          />
        </div>

        {/* Player Info */}
        <div style={section}>
          <div style={sectionTitle}>Player Info</div>
          <div style={{ ...row, marginBottom: '12px' }}>
            <input
              type="text"
              placeholder="Player name"
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
              style={input}
            />
            <input
              type="text"
              placeholder="Jersey #"
              value={jerseyNumber}
              onChange={e => setJerseyNumber(e.target.value)}
              style={{ ...input, width: '120px', flexShrink: 0 }}
            />
          </div>
          <select value={position} onChange={e => setPosition(e.target.value)} style={input}>
            <option>point guard</option>
            <option>shooting guard</option>
            <option>small forward</option>
            <option>power forward</option>
            <option>center</option>
          </select>
        </div>

        {/* Play Details */}
        <div style={section}>
          <div style={sectionTitle}>Play Details</div>
          <select value={playType} onChange={e => setPlayType(e.target.value)} style={input}>
            <option>post move</option>
            <option>mid-range jumper</option>
            <option>3 pointer</option>
            <option>drive to basket</option>
            <option>floater</option>
            <option>pick and roll</option>
            <option>fast break</option>
            <option>catch and shoot</option>
            <option>pull up jumper</option>
            <option>defensive play</option>
          </select>

        </div>

        {/* Video Upload */}
        <div style={section}>
          <div style={sectionTitle}>Game Film</div>
          <label style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: '8px', padding: '32px',
            border: '2px dashed #e5e7eb', borderRadius: '12px', cursor: 'pointer',
            transition: 'border-color 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#ff6b00'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}
          >
            <span style={{ fontSize: '32px' }}>🎬</span>
            <span style={{ color: '#888', fontSize: '14px', fontWeight: '600' }}>
              {file ? file.name : 'Click to upload MP4, MOV, AVI'}
            </span>
            <span style={{ color: '#444', fontSize: '12px' }}>Upload a short clip of one play (under 30s)</span>
            <input type="file" accept="video/*" onChange={handleFileChange} style={{ display: 'none' }} />
          </label>

          {videoURL && (
            <div style={{ marginTop: '20px' }}>
              <video
                ref={videoRef}
                src={videoURL}
                controls
                style={{ width: '100%', borderRadius: '10px', maxHeight: '360px' }}
              />

              <button
                className="upload-btn"
                onClick={handleAnalyze}
                disabled={loading}
                style={{ marginTop: '14px', width: '100%', opacity: loading ? 0.6 : 1 }}
              >
                {loading ? 'Analyzing...' : 'Analyze Play'}
              </button>
            </div>
          )}
        </div>

        {/* Results */}
        {result && (
          <div style={{ marginTop: '8px' }}>
            {/* Header */}
            <div style={{ ...section, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={sectionTitle}>Analysis Complete</div>
                <div style={{ fontSize: '13px', color: '#888' }}>
                  {result.playerName} #{result.jerseyNumber} · {result.position} · {result.playType}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '48px', fontWeight: '900', color: '#ff6b00', letterSpacing: '-2px', lineHeight: 1 }}>
                  {result.grade}
                </div>
                <div style={{ fontSize: '13px', color: '#555', marginTop: '4px' }}>{result.score}/100</div>
              </div>
            </div>

            {/* Result boxes grid */}
            <div className="result-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>

              <div style={section}>
                <div style={sectionTitle}>Offense</div>
                <p style={{ color: '#374151', fontSize: '14px', lineHeight: '1.6' }}>{result.summary?.positioning?.offense}</p>
              </div>

              <div style={section}>
                <div style={sectionTitle}>Defense</div>
                <p style={{ color: '#374151', fontSize: '14px', lineHeight: '1.6' }}>{result.summary?.positioning?.defense}</p>
              </div>

              <div style={section}>
                <div style={sectionTitle}>Shot Quality</div>
                <div style={{
                  display: 'inline-block', marginBottom: '8px', padding: '3px 10px',
                  borderRadius: '6px', fontSize: '12px', fontWeight: '700',
                  background: result.summary?.shotQuality?.verdict === 'GOOD SHOT' ? '#ecfdf5' : '#fef2f2',
                  color: result.summary?.shotQuality?.verdict === 'GOOD SHOT' ? '#4ade80' : '#ff4444',
                }}>
                  {result.summary?.shotQuality?.verdict}
                </div>
                <p style={{ color: '#374151', fontSize: '14px', lineHeight: '1.6' }}>{result.summary?.shotQuality?.reason}</p>
              </div>

              <div style={section}>
                <div style={sectionTitle}>Decision Making</div>
                <div style={{
                  display: 'inline-block', marginBottom: '8px', padding: '3px 10px',
                  borderRadius: '6px', fontSize: '12px', fontWeight: '700',
                  background: result.summary?.decisionMaking?.verdict === 'RIGHT DECISION' ? '#ecfdf5' : '#fef2f2',
                  color: result.summary?.decisionMaking?.verdict === 'RIGHT DECISION' ? '#4ade80' : '#ff4444',
                }}>
                  {result.summary?.decisionMaking?.verdict}
                </div>
                <p style={{ color: '#374151', fontSize: '14px', lineHeight: '1.6' }}>{result.summary?.decisionMaking?.reason}</p>
              </div>

              <div style={section}>
                <div style={sectionTitle}>What To Do Instead</div>
                <p style={{ color: '#374151', fontSize: '14px', lineHeight: '1.6' }}>{result.summary?.shotQuality?.whatToDoInstead}</p>
              </div>

              <div style={section}>
                <div style={sectionTitle}>Habit</div>
                <p style={{ color: '#374151', fontSize: '14px', lineHeight: '1.6' }}>{result.summary?.decisionMaking?.habit}</p>
              </div>

              <div style={{ ...section, gridColumn: '1 / -1' }}>
                <div style={sectionTitle}>Coaching Tip</div>
                <p style={{ color: '#374151', fontSize: '14px', lineHeight: '1.6' }}>{result.summary?.coachingTip}</p>
              </div>

              <div style={{ ...section, gridColumn: '1 / -1' }}>
                <div style={sectionTitle}>Drill</div>
                <p style={{ color: '#374151', fontSize: '14px', lineHeight: '1.6' }}>{result.summary?.drill}</p>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
