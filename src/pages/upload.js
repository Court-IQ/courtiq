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

  function captureCurrentFrame() {
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
  }

  async function handleAnalyze() {
    if (!file || !sessionName) return alert('Please add a session name and video');
    if (!videoRef.current) return alert('Please wait for video to load');
    setLoading(true);

    try {
      const frame = captureCurrentFrame();

      const response = await fetch('https://tranquil-nourishment-production-4ff8.up.railway.app/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frames: [frame],
          sessionName,
          position,
          playerName,
          jerseyNumber,
          playType
        })
      });

      const data = await response.json();
      setResult(data.result);

      const { data: { user } } = await supabase.auth.getUser();

const { error } = await supabase.from('analyses').insert([{
  session_name: data.result.sessionName,
  player_name: data.result.playerName,
  jersey_number: data.result.jerseyNumber,
  position: data.result.position,
  score: data.result.score,
  grade: data.result.grade,
  summary: data.result.summary,
  user_id: user.id,
}]);

      if (error) console.error('Save error:', error);
      else console.log('Saved!');
    } catch (err) {
      alert('Analysis failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="main">
      <div className="top-bar">
        <div>
          <h1>Upload Film</h1>
          <p>Upload your game film for AI analysis</p>
        </div>
      </div>

      <div className="upload-area">
        <div className="upload-box">
          <input
            type="text"
            placeholder="Session name (e.g. League Game vs Eagles)"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #333', background: '#1a1a2e', color: 'white' }}
          />
          <input
            type="text"
            placeholder="Player name (e.g. Thomas Diew)"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #333', background: '#1a1a2e', color: 'white' }}
          />
          <input
            type="text"
            placeholder="Jersey number (e.g. 11)"
            value={jerseyNumber}
            onChange={(e) => setJerseyNumber(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #333', background: '#1a1a2e', color: 'white' }}
          />
          <select
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #333', background: '#1a1a2e', color: 'white' }}
          >
            <option>point guard</option>
            <option>shooting guard</option>
            <option>small forward</option>
            <option>power forward</option>
            <option>center</option>
          </select>
          <select
            value={playType}
            onChange={(e) => setPlayType(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '20px', borderRadius: '8px', border: '1px solid #333', background: '#1a1a2e', color: 'white' }}
          >
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

          <div className="upload-icon">🎬</div>
          <h2>Upload your game film</h2>
          <p>Supports MP4, MOV, AVI files</p>
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            style={{ marginTop: '10px' }}
          />
        </div>

        {videoURL && (
          <div style={{ marginTop: '20px' }}>
            <p style={{ color: '#ff6b35', marginBottom: '8px' }}>⏸️ Pause the video on the exact moment you want analyzed, then click Analyze</p>
            <video
              ref={videoRef}
              src={videoURL}
              controls
              style={{ width: '100%', borderRadius: '12px', maxHeight: '400px' }}
            />
            <button
              className="upload-btn"
              onClick={handleAnalyze}
              disabled={loading}
              style={{ marginTop: '15px', width: '100%', opacity: loading ? 0.6 : 1 }}
            >
              {loading ? '⏳ Analyzing...' : '🏀 Analyze This Moment'}
            </button>
          </div>
        )}

        {result && (
          <div style={{ marginTop: '30px', background: '#1a1a2e', padding: '20px', borderRadius: '12px', color: 'white' }}>
            <h2>Analysis Complete!</h2>
            <p style={{ color: '#ff6b35' }}>Player: {result.playerName} #{result.jerseyNumber} — {result.position}</p>
            <p style={{ color: '#888' }}>Play Type: {result.playType}</p>
            <p style={{ fontSize: '2rem', color: '#ff6b35' }}>{result.grade} — {result.score}/100</p>

            <div style={{ marginTop: '15px', borderTop: '1px solid #333', paddingTop: '15px' }}>
              <p><strong>🏃 Offense:</strong> {result.summary?.positioning?.offense}</p>
              <p><strong>🛡️ Defense:</strong> {result.summary?.positioning?.defense}</p>
              <p><strong>🎯 Shot Quality:</strong> <span style={{ color: result.summary?.shotQuality?.verdict === 'GOOD SHOT' ? '#00ff88' : '#ff4444' }}>{result.summary?.shotQuality?.verdict}</span> — {result.summary?.shotQuality?.reason}</p>
              <p><strong>🔄 What To Do Instead:</strong> {result.summary?.shotQuality?.whatToDoInstead}</p>
              <p><strong>🧠 Decision:</strong> <span style={{ color: result.summary?.decisionMaking?.verdict === 'RIGHT DECISION' ? '#00ff88' : '#ff4444' }}>{result.summary?.decisionMaking?.verdict}</span> — {result.summary?.decisionMaking?.reason}</p>
              <p><strong>📋 Habit:</strong> {result.summary?.decisionMaking?.habit}</p>
              <p><strong>💡 Coaching Tip:</strong> {result.summary?.coachingTip}</p>
              <p><strong>🏋️ Drill:</strong> {result.summary?.drill}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}