import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

const API_URL = 'https://courtiq-n8wl.onrender.com';

export default function AutoUpload() {
  const [phase, setPhase] = useState(1); // 1=setup, 2=processing, 3=results
  const [sessionName, setSessionName] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [jerseyNumber, setJerseyNumber] = useState('');
  const [jerseyColor, setJerseyColor] = useState('white');
  const [position, setPosition] = useState('point guard');
  const [inputMode, setInputMode] = useState('url'); // 'url' | 'file'
  const [videoUrl, setVideoUrl] = useState('');
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [focusAreas, setFocusAreas] = useState([]);
  const [customFocus, setCustomFocus] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [statusMsg, setStatusMsg] = useState('Uploading video...');
  const [progress, setProgress] = useState(0);

  const FOCUS_OPTIONS = [
    { id: 'shot_selection', label: 'Shot Selection' },
    { id: 'decision_making', label: 'Decision Making' },
    { id: 'off_ball', label: 'Off-Ball Movement' },
    { id: 'ball_handling', label: 'Ball Handling' },
    { id: 'defense', label: 'Defense' },
    { id: 'pick_and_roll', label: 'Pick & Roll' },
    { id: 'finishing', label: 'Finishing at the Rim' },
    { id: 'passing', label: 'Passing & Vision' },
    { id: 'transition', label: 'Transition Play' },
    { id: 'footwork', label: 'Footwork' },
  ];

  function toggleFocus(id) {
    setFocusAreas(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  }

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (profile) {
        if (profile.full_name) setPlayerName(profile.full_name);
        if (profile.jersey_number) setJerseyNumber(profile.jersey_number);
        if (profile.position) setPosition(profile.position);
      }
    }
    init();
  }, []);

  // Simulated progress + status messages while waiting
  useEffect(() => {
    if (phase !== 2) return;

    const messages = [
      { time: 0,      msg: 'Uploading video to Gemini...' },
      { time: 10000,  msg: 'Gemini is processing your film...' },
      { time: 25000,  msg: `Finding every possession where #${jerseyNumber} touches the ball...` },
      { time: 70000,  msg: 'Grading each play...' },
      { time: 140000, msg: 'Writing your coaching report...' },
    ];

    const timers = messages.map(m => setTimeout(() => setStatusMsg(m.msg), m.time));

    // Animate progress bar slowly to 92%, never hits 100 until done
    let prog = 0;
    const interval = setInterval(() => {
      prog = Math.min(prog + 0.3, 92);
      setProgress(prog);
    }, 1000);

    return () => {
      timers.forEach(t => clearTimeout(t));
      clearInterval(interval);
    };
  }, [phase, jerseyNumber]);

  async function handleAnalyze() {
    if (inputMode === 'url' && !videoUrl.trim()) return alert('Please enter a video URL');
    if (inputMode === 'file' && !file) return alert('Please select a video file');
    if (!sessionName) return alert('Please enter a game name');
    if (!jerseyNumber) return alert('Please enter a jersey number');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setError(null);
    setPhase(2);

    try {
      if (inputMode === 'url') {
        // URL mode: Railway fetches the video from the URL and pipes it to Gemini
        setStatusMsg('Sending URL to server...');
        const focusLabel = focusAreas.map(id => FOCUS_OPTIONS.find(o => o.id === id)?.label).filter(Boolean);
        const res = await fetch(`${API_URL}/api/auto-analyze/from-url`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoUrl: videoUrl.trim(), sessionName, playerName, jerseyNumber, jerseyColor, position, userId: user.id, focusAreas: focusLabel, customFocus: customFocus.trim() }),
        });
        const text = await res.text();
        let data;
        try { data = JSON.parse(text); }
        catch (e) { throw new Error(`Server error: ${text.slice(0, 120)}`); }
        if (!data.success) throw new Error(data.error || 'Failed to start analysis');
        setStatusMsg('Gemini is watching your film...');
        setProgress(20);
      } else {
        // File mode (for smaller files)
        const CHUNK_SIZE = 5 * 1024 * 1024;
        const mimeType = file.type || 'video/mp4';
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

        setStatusMsg('Preparing upload...');
        const initRes = await fetch(`${API_URL}/api/chunk/init`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileSize: file.size, mimeType, sessionName, playerName, jerseyNumber, jerseyColor, position, userId: user.id }),
        });
        const initText = await initRes.text();
        let initData;
        try { initData = JSON.parse(initText); }
        catch (e) { throw new Error(`Server error: ${initText.slice(0, 120)}`); }
        if (!initData.success) throw new Error(initData.error || 'Failed to start upload');

        for (let i = 0; i < totalChunks; i++) {
          const start = i * CHUNK_SIZE;
          const end = Math.min(start + CHUNK_SIZE, file.size);
          const chunk = file.slice(start, end);
          const isLast = i === totalChunks - 1;
          const pct = Math.round(((i + 1) / totalChunks) * 100);

          setStatusMsg(`Uploading... ${pct}%`);
          setProgress((i / totalChunks) * 70);

          const uploadRes = await fetch(
            `${API_URL}/api/chunk/upload?sessionId=${initData.sessionId}&isLast=${isLast}`,
            { method: 'POST', body: chunk, headers: { 'Content-Type': mimeType } }
          );
          const uploadText = await uploadRes.text();
          let uploadData;
          try { uploadData = JSON.parse(uploadText); }
          catch (e) { throw new Error(`Upload error: ${uploadText.slice(0, 120)}`); }
          if (!uploadData.success) throw new Error(uploadData.error || 'Chunk upload failed');

          if (isLast) {
            setStatusMsg('Upload complete! Gemini is watching your film...');
            setProgress(75);
          }
        }
      }

      // Poll Supabase until the game summary appears
      let attempts = 0;
      const maxAttempts = 420; // 35 minutes at 5s intervals
      const poll = setInterval(async () => {
        attempts++;

        const { data: record } = await supabase
          .from('analyses')
          .select('*')
          .eq('user_id', user.id)
          .eq('play_type', 'game summary')
          .eq('session_name', sessionName)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (record) {
          // Show live status updates from server while processing
          if (record.summary?.status && !record.summary?.plays) {
            setStatusMsg(record.summary.status);
            return;
          }
          clearInterval(poll);
          if (record.summary?.error) {
            setError(record.summary.error);
            setPhase(1);
            return;
          }
          setProgress(100);
          setResult(record.summary);
          setPhase(3);
        }

        if (attempts >= maxAttempts) {
          clearInterval(poll);
          setError('Analysis timed out after 20 minutes. Try a shorter clip or check your URL is accessible.');
          setPhase(1);
        }
      }, 5000);

    } catch (err) {
      setError(err.message);
      setPhase(1);
    }
  }

  function getGradeColor(grade) {
    if (!grade) return '#555';
    if (grade.startsWith('A')) return '#4ade80';
    if (grade.startsWith('B')) return '#ff6b00';
    if (grade.startsWith('C')) return '#facc15';
    return '#ff4444';
  }

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
    boxSizing: 'border-box',
  };

  // ─── PHASE 1: SETUP ──────────────────────────────────────────────
  if (phase === 1) {
    return (
      <div className="main">
        <div className="top-bar">
          <div>
            <h1>Auto Game Analysis</h1>
            <p>Upload your film — Gemini AI watches it and grades every possession automatically</p>
          </div>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px',
            padding: '14px 18px', marginBottom: '16px', color: '#dc2626', fontSize: '14px',
          }}>
            {error}
          </div>
        )}

        <div style={{ maxWidth: '680px' }}>
          <div style={section}>
            <div style={sectionTitle}>Session Info</div>
            <input
              type="text"
              placeholder="Game name (e.g. Varsity vs Lincoln)"
              value={sessionName}
              onChange={e => setSessionName(e.target.value)}
              style={input}
            />
          </div>

          <div style={section}>
            <div style={sectionTitle}>Player to Track</div>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
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
                style={{ ...input, width: '100px', flexShrink: 0 }}
              />
              <select
                value={jerseyColor}
                onChange={e => setJerseyColor(e.target.value)}
                style={{ ...input, width: '130px', flexShrink: 0 }}
              >
                <option value="white">White</option>
                <option value="black">Black</option>
                <option value="red">Red</option>
                <option value="blue">Blue</option>
                <option value="navy">Navy</option>
                <option value="green">Green</option>
                <option value="yellow">Yellow</option>
                <option value="orange">Orange</option>
                <option value="purple">Purple</option>
                <option value="gray">Gray</option>
              </select>
            </div>
            <select value={position} onChange={e => setPosition(e.target.value)} style={input}>
              <option>point guard</option>
              <option>shooting guard</option>
              <option>small forward</option>
              <option>power forward</option>
              <option>center</option>
            </select>
            <p style={{ color: '#888', fontSize: '12px', marginTop: '10px', marginBottom: 0 }}>
              Gemini will track the player in the <strong>{jerseyColor} #{jerseyNumber || '?'}</strong> jersey throughout the entire video.
            </p>
          </div>

          <div style={section}>
            <div style={sectionTitle}>Game Film</div>

            {/* Tab switcher */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              {['url', 'file'].map(mode => (
                <button key={mode} onClick={() => setInputMode(mode)} style={{
                  padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '700',
                  border: inputMode === mode ? 'none' : '1px solid #e5e7eb',
                  background: inputMode === mode ? '#ff6b00' : '#f5f6f8',
                  color: inputMode === mode ? '#fff' : '#555',
                }}>
                  {mode === 'url' ? 'Paste URL' : 'Upload File'}
                </button>
              ))}
            </div>

            {inputMode === 'url' ? (
              <div>
                <input
                  type="text"
                  placeholder="Paste Google Drive or Dropbox link..."
                  value={videoUrl}
                  onChange={e => setVideoUrl(e.target.value)}
                  style={input}
                />
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: '12px', color: '#888', background: '#f5f6f8', borderRadius: '6px', padding: '5px 10px' }}>
                    Google Drive → Share → "Anyone with the link"
                  </div>
                  <div style={{ fontSize: '12px', color: '#888', background: '#f5f6f8', borderRadius: '6px', padding: '5px 10px' }}>
                    Dropbox → Share → Copy link
                  </div>
                </div>
              </div>
            ) : (
              <label
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', gap: '10px', padding: '48px 24px',
                  border: `2px dashed ${dragOver ? '#ff6b00' : file ? '#ff6b00' : '#d1d5db'}`,
                  borderRadius: '14px', cursor: 'pointer', transition: 'all 0.2s',
                  background: dragOver ? '#fff5eb' : file ? '#fff5eb' : '#fafafa',
                }}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) setFile(f); }}
              >
                {file ? (
                  <>
                    <div style={{ fontSize: '40px' }}>✅</div>
                    <div style={{ fontWeight: '700', color: '#111827', fontSize: '14px' }}>{file.name}</div>
                    <div style={{ color: '#888', fontSize: '12px' }}>{(file.size / 1024 / 1024).toFixed(1)} MB · Click to change</div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: '40px' }}>🎬</div>
                    <div style={{ fontWeight: '700', color: '#374151', fontSize: '15px' }}>Drop your game film here</div>
                    <div style={{ color: '#9ca3af', fontSize: '13px' }}>or click to browse · MP4, MOV, AVI</div>
                    <div style={{
                      marginTop: '4px', padding: '6px 14px', borderRadius: '8px',
                      background: '#ff6b00', color: '#fff', fontSize: '13px', fontWeight: '700',
                    }}>Choose File</div>
                  </>
                )}
                <input type="file" accept="video/*" onChange={e => setFile(e.target.files[0])} style={{ display: 'none' }} />
              </label>
            )}
          </div>

          <div style={section}>
            <div style={sectionTitle}>What should the AI focus on? <span style={{ color: '#aaa', fontWeight: '400', textTransform: 'none', letterSpacing: '0' }}>(optional)</span></div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
              {FOCUS_OPTIONS.map(opt => {
                const selected = focusAreas.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    onClick={() => toggleFocus(opt.id)}
                    style={{
                      padding: '7px 14px', borderRadius: '20px', cursor: 'pointer',
                      fontSize: '13px', fontWeight: '600', transition: 'all 0.15s',
                      border: selected ? 'none' : '1px solid #e5e7eb',
                      background: selected ? '#ff6b00' : '#f5f6f8',
                      color: selected ? '#fff' : '#555',
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <input
              type="text"
              placeholder="Anything else? e.g. 'I tend to dribble too much on the wing'"
              value={customFocus}
              onChange={e => setCustomFocus(e.target.value)}
              style={input}
            />
          </div>

          <div style={{ background: '#fff5eb', border: '1px solid #fed7aa', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#ff6b00', marginBottom: '6px', letterSpacing: '1px' }}>HOW IT WORKS</div>
            <div style={{ fontSize: '13px', color: '#374151', lineHeight: '1.7' }}>
              Gemini 2.5 Flash watches your entire video, finds every possession where #{jerseyNumber || '?'} touches the ball, and grades each play — no tagging required. Analysis takes <strong>2–5 minutes</strong> depending on video length.
            </div>
          </div>

          <button
            className="upload-btn"
            onClick={handleAnalyze}
            style={{ width: '100%', opacity: (!(inputMode === 'url' ? videoUrl.trim() : file) || !sessionName || !jerseyNumber) ? 0.4 : 1 }}
            disabled={!(inputMode === 'url' ? videoUrl.trim() : file) || !sessionName || !jerseyNumber}
          >
            Analyze Full Game with Gemini
          </button>
        </div>
      </div>
    );
  }

  // ─── PHASE 2: PROCESSING ─────────────────────────────────────────
  if (phase === 2) {
    return (
      <div className="main">
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '80px 40px', textAlign: 'center',
        }}>
          <div style={{ fontSize: '56px', marginBottom: '24px' }}>🏀</div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', marginBottom: '8px' }}>
            Gemini is watching your film
          </h2>
          <p style={{ color: '#374151', fontSize: '15px', marginBottom: '6px' }}>
            {statusMsg}
          </p>
          <p style={{ color: '#888', fontSize: '13px', marginBottom: '40px' }}>
            This takes 2–5 minutes. Don't close this page.
          </p>

          {/* Progress bar */}
          <div style={{ width: '100%', maxWidth: '480px', background: '#e5e7eb', borderRadius: '8px', height: '8px', marginBottom: '40px' }}>
            <div style={{
              background: 'linear-gradient(90deg, #ff6b00, #e85d24)',
              height: '8px', borderRadius: '8px',
              width: `${progress}%`,
              transition: 'width 1s ease',
            }} />
          </div>

          <div style={{
            background: '#f5f6f8', border: '1px solid #e5e7eb', borderRadius: '12px',
            padding: '20px 28px', maxWidth: '400px',
          }}>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '12px', letterSpacing: '1px', fontWeight: '600' }}>ANALYZING</div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#111827' }}>{sessionName}</div>
            <div style={{ fontSize: '13px', color: '#555', marginTop: '4px' }}>
              {playerName} #{jerseyNumber} · {position}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── PHASE 3: RESULTS ─────────────────────────────────────────────
  const plays = result?.plays || [];
  const overallGrade = result?.overallGrade;
  const overallScore = result?.overallScore;

  return (
    <div className="main">
      <div className="top-bar">
        <div>
          <h1>Game Report</h1>
          <p>{sessionName} — {playerName} #{jerseyNumber} · {plays.length} plays found</p>
        </div>
        <button
          onClick={() => { setPhase(1); setFile(null); setResult(null); setProgress(0); }}
          style={{
            background: 'none', border: '1px solid #e5e7eb', color: '#555',
            padding: '10px 18px', borderRadius: '8px', cursor: 'pointer',
            fontSize: '13px', fontWeight: '600',
          }}
        >
          New Analysis
        </button>
      </div>

      {/* Game Summary */}
      {result && (
        <div style={{ ...section, borderColor: '#ff6b00', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={sectionTitle}>Game Summary</div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '52px', fontWeight: '900', color: '#ff6b00', lineHeight: 1 }}>
                {overallGrade}
              </div>
              <div style={{ fontSize: '13px', color: '#555' }}>{overallScore}/100</div>
            </div>
          </div>

          <p style={{ color: '#374151', fontSize: '15px', lineHeight: '1.7', marginBottom: '20px' }}>
            {result.gameNarrative}
          </p>

          <div className="result-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#4ade80', letterSpacing: '1px', marginBottom: '8px' }}>STRENGTHS</div>
              {(result.strengths || []).map((s, i) => (
                <p key={i} style={{ color: '#374151', fontSize: '13px', lineHeight: '1.6', marginBottom: '4px' }}>+ {s}</p>
              ))}
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#ff4444', letterSpacing: '1px', marginBottom: '8px' }}>WEAKNESSES</div>
              {(result.weaknesses || []).map((w, i) => (
                <p key={i} style={{ color: '#374151', fontSize: '13px', lineHeight: '1.6', marginBottom: '4px' }}>- {w}</p>
              ))}
            </div>
          </div>

          {result.keyCoachingPoints?.length > 0 && (
            <div style={{ marginTop: '20px', padding: '16px', background: '#f5f6f8', borderRadius: '10px', borderLeft: '3px solid #ff6b00' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#ff6b00', letterSpacing: '1px', marginBottom: '8px' }}>KEY COACHING POINTS</div>
              {result.keyCoachingPoints.map((tip, i) => (
                <p key={i} style={{ color: '#374151', fontSize: '13px', lineHeight: '1.6', marginBottom: '4px' }}>{i + 1}. {tip}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stats row */}
      {plays.length > 0 && (
        <div className="stats-row" style={{ marginBottom: '24px' }}>
          {[
            ['Plays Found', plays.length],
            ['Avg Score', Math.round(plays.reduce((s, p) => s + (p.score || 0), 0) / plays.length)],
            ['Best', Math.max(...plays.map(p => p.score || 0))],
            ['Worst', Math.min(...plays.map(p => p.score || 0))],
          ].map(([label, val]) => (
            <div className="stat-card" key={label}>
              <div className="stat-label">{label}</div>
              <div className="stat-value">{val}</div>
            </div>
          ))}
        </div>
      )}

      {/* Individual plays */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {plays.map((play, i) => (
          <PlayCard key={i} play={play} sectionTitle={sectionTitle} getGradeColor={getGradeColor} />
        ))}
      </div>

      {plays.length === 0 && (
        <div style={{ ...section, textAlign: 'center', padding: '48px' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔍</div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>No possessions found</div>
          <div style={{ color: '#888', fontSize: '14px' }}>
            Gemini couldn't clearly identify #{jerseyNumber} in the video. Try a higher-quality video or a closer camera angle.
          </div>
        </div>
      )}
    </div>
  );
}

function PlayCard({ play, sectionTitle, getGradeColor }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{
      background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px',
      overflow: 'hidden',
    }}>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px', cursor: 'pointer',
        }}
      >
        <div>
          <div style={{ fontSize: '14px', fontWeight: '700', color: '#111827' }}>
            {play.startTime} – {play.endTime}
          </div>
          <div style={{ fontSize: '12px', color: '#888', textTransform: 'capitalize' }}>{play.playType}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', color: '#555' }}>{play.score}/100</span>
          <span style={{ fontSize: '24px', fontWeight: '900', color: getGradeColor(play.grade) }}>{play.grade}</span>
          <span style={{ color: '#aaa', fontSize: '12px' }}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && play.summary && (
        <div style={{ padding: '0 18px 18px', borderTop: '1px solid #e5e7eb' }}>
          <div className="result-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
            <div style={{ background: '#f5f6f8', borderRadius: '10px', padding: '16px' }}>
              <div style={sectionTitle}>Offense</div>
              <p style={{ color: '#374151', fontSize: '13px', lineHeight: '1.6' }}>{play.summary?.positioning?.offense}</p>
            </div>
            <div style={{ background: '#f5f6f8', borderRadius: '10px', padding: '16px' }}>
              <div style={sectionTitle}>Defense</div>
              <p style={{ color: '#374151', fontSize: '13px', lineHeight: '1.6' }}>{play.summary?.positioning?.defense}</p>
            </div>
            <div style={{ background: '#f5f6f8', borderRadius: '10px', padding: '16px' }}>
              <div style={sectionTitle}>Shot Quality</div>
              <div style={{
                display: 'inline-block', marginBottom: '6px', padding: '2px 8px',
                borderRadius: '4px', fontSize: '11px', fontWeight: '700',
                background: play.summary?.shotQuality?.verdict === 'GOOD SHOT' ? '#ecfdf5' : '#fef2f2',
                color: play.summary?.shotQuality?.verdict === 'GOOD SHOT' ? '#4ade80' : '#ff4444',
              }}>
                {play.summary?.shotQuality?.verdict}
              </div>
              <p style={{ color: '#374151', fontSize: '13px', lineHeight: '1.6' }}>{play.summary?.shotQuality?.reason}</p>
            </div>
            <div style={{ background: '#f5f6f8', borderRadius: '10px', padding: '16px' }}>
              <div style={sectionTitle}>Decision Making</div>
              <div style={{
                display: 'inline-block', marginBottom: '6px', padding: '2px 8px',
                borderRadius: '4px', fontSize: '11px', fontWeight: '700',
                background: play.summary?.decisionMaking?.verdict === 'RIGHT DECISION' ? '#ecfdf5' : '#fef2f2',
                color: play.summary?.decisionMaking?.verdict === 'RIGHT DECISION' ? '#4ade80' : '#ff4444',
              }}>
                {play.summary?.decisionMaking?.verdict}
              </div>
              <p style={{ color: '#374151', fontSize: '13px', lineHeight: '1.6' }}>{play.summary?.decisionMaking?.reason}</p>
            </div>
            <div style={{ background: '#f5f6f8', borderRadius: '10px', padding: '16px', gridColumn: '1 / -1', borderLeft: '3px solid #ff6b00' }}>
              <div style={sectionTitle}>Coaching Tip</div>
              <p style={{ color: '#374151', fontSize: '13px', lineHeight: '1.6' }}>{play.summary?.coachingTip}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
