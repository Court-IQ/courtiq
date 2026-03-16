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
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const videoRef = useRef(null);

  function handleFileChange(e) {
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);
    setVideoURL(URL.createObjectURL(selected));
    setResult(null);
    setStartTime(null);
    setEndTime(null);
  }

  function markStart() {
    const time = videoRef.current.currentTime;
    setStartTime(time);
  }

  function markEnd() {
    const time = videoRef.current.currentTime;
    setEndTime(time);
  }

  function extractFrames(video, start, end, numFrames = 10) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      const frames = [];
      const duration = end - start;
      const interval = duration / numFrames;
      let captured = 0;

      function captureFrame(time) {
        video.currentTime = time;
      }

      video.addEventListener('seeked', function onSeeked() {
        ctx.drawImage(video, 0, 0);
        const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
        frames.push(base64);
        captured++;

        if (captured < numFrames) {
          captureFrame(start + interval * captured);
        } else {
          video.removeEventListener('seeked', onSeeked);
          resolve(frames);
        }
      });

      captureFrame(start);
    });
  }

  async function handleAnalyze() {
    if (!file || !sessionName) return alert('Please add a session name and video');
    if (startTime === null || endTime === null) return alert('Please mark the start and end of the play!');
    if (endTime <= startTime) return alert('End time must be after start time!');
    if (endTime - startTime > 15) return alert('Please keep the clip under 15 seconds for best results!');
    setLoading(true);

    try {
      const frames = await extractFrames(videoRef.current, startTime, endTime, 10);

      const response = await fetch('https://tranquil-nourishment-production-4ff8.up.railway.app/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frames,
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
            style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ddd', background: 'white', color: '#080a0f' }}
          />
          <input
            type="text"
            placeholder="Player name (e.g. Thomas Diew)"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ddd', background: 'white', color: '#080a0f' }}
          />
          <input
            type="text"
            placeholder="Jersey number (e.g. 11)"
            value={jerseyNumber}
            onChange={(e) => setJerseyNumber(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ddd', background: 'white', color: '#080a0f' }}
          />
          <select
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ddd', background: 'white', color: '#080a0f' }}
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
            style={{ width: '100%', padding: '10px', marginBottom: '20px', borderRadius: '8px', border: '1px solid #ddd', background: 'white', color: '#080a0f' }}
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
            <video
              ref={videoRef}
              src={videoURL}
              controls
              style={{ width: '100%', borderRadius: '12px', maxHeight: '400px' }}
            />

            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button
                onClick={markStart}
                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '2px solid #ff6b00', background: startTime !== null ? '#ff6b00' : 'white', color: startTime !== null ? 'white' : '#ff6b00', fontWeight: '700', cursor: 'pointer' }}
              >
                {startTime !== null ? `✅ Start: ${startTime.toFixed(1)}s` : '▶️ Mark Start'}
              </button>
              <button
                onClick={markEnd}
                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '2px solid #ff6b00', background: endTime !== null ? '#ff6b00' : 'white', color: endTime !== null ? 'white' : '#ff6b00', fontWeight: '700', cursor: 'pointer' }}
              >
                {endTime !== null ? `✅ End: ${endTime.toFixed(1)}s` : '⏹️ Mark End'}
              </button>
            </div>

            {startTime !== null && endTime !== null && endTime > startTime && (
              <p style={{ color: '#ff6b00', fontWeight: '600', marginTop: '8px', textAlign: 'center' }}>
                📽️ {(endTime - startTime).toFixed(1)} second clip selected — 10 frames will be analyzed
              </p>
            )}

            <button
              className="upload-btn"
              onClick={handleAnalyze}
              disabled={loading}
              style={{ marginTop: '15px', width: '100%', opacity: loading ? 0.6 : 1 }}
            >
              {loading ? '⏳ Analyzing 10 frames...' : '🏀 Analyze Play'}
            </button>
          </div>
        )}

        {result && (
          <div style={{ marginTop: '30px', background: '#f5f5f5', padding: '20px', borderRadius: '12px', color: '#080a0f' }}>
            <h2 style={{ color: '#080a0f' }}>Analysis Complete!</h2>
            <p style={{ color: '#ff6b00' }}>Player: {result.playerName} #{result.jerseyNumber} — {result.position}</p>
            <p style={{ color: '#888' }}>Play Type: {result.playType}</p>
            <p style={{ fontSize: '2rem', color: '#ff6b00', fontWeight: '900' }}>{result.grade} — {result.score}/100</p>

            <div style={{ marginTop: '15px', borderTop: '1px solid #ddd', paddingTop: '15px' }}>
              <p><strong>🏃 Offense:</strong> {result.summary?.positioning?.offense}</p>
              <p style={{ marginTop: '8px' }}><strong>🛡️ Defense:</strong> {result.summary?.positioning?.defense}</p>
              <p style={{ marginTop: '8px' }}><strong>🎯 Shot Quality:</strong> <span style={{ color: result.summary?.shotQuality?.verdict === 'GOOD SHOT' ? '#16a34a' : '#ff4444', fontWeight: '700' }}>{result.summary?.shotQuality?.verdict}</span> — {result.summary?.shotQuality?.reason}</p>
              <p style={{ marginTop: '8px' }}><strong>🔄 What To Do Instead:</strong> {result.summary?.shotQuality?.whatToDoInstead}</p>
              <p style={{ marginTop: '8px' }}><strong>🧠 Decision:</strong> <span style={{ color: result.summary?.decisionMaking?.verdict === 'RIGHT DECISION' ? '#16a34a' : '#ff4444', fontWeight: '700' }}>{result.summary?.decisionMaking?.verdict}</span> — {result.summary?.decisionMaking?.reason}</p>
              <p style={{ marginTop: '8px' }}><strong>📋 Habit:</strong> {result.summary?.decisionMaking?.habit}</p>
              <p style={{ marginTop: '8px' }}><strong>💡 Coaching Tip:</strong> {result.summary?.coachingTip}</p>
              <p style={{ marginTop: '8px' }}><strong>🏋️ Drill:</strong> {result.summary?.drill}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}