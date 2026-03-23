import React, { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '../supabase';

export default function GameUpload() {
  const [phase, setPhase] = useState(1); // 1=setup, 2=tagging, 3=analyzing
  const [file, setFile] = useState(null);
  const [videoURL, setVideoURL] = useState(null);
  const [sessionName, setSessionName] = useState('');
  const [position, setPosition] = useState('point guard');
  const [playerName, setPlayerName] = useState('');
  const [jerseyNumber, setJerseyNumber] = useState('');
  const [segments, setSegments] = useState([]);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [gameResult, setGameResult] = useState(null);
  const [usage, setUsage] = useState(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const videoRef = useRef(null);
  const tagVideoRef = useRef(null);

  const API_URL_BASE = 'https://tranquil-nourishment-production-4ff8.up.railway.app';

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check usage
      try {
        const res = await fetch(`${API_URL_BASE}/api/check-usage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id }),
        });
        const data = await res.json();
        setUsage(data);
      } catch (e) {
        console.error('Usage check failed:', e);
      }

      // Pre-fill from profile
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (profile) {
        if (profile.full_name) setPlayerName(profile.full_name);
        if (profile.jersey_number) setJerseyNumber(profile.jersey_number);
        if (profile.position) setPosition(profile.position);
      }
    }
    init();
  }, []);

  const SEGMENT_LENGTH = 12;
  const API_URL = API_URL_BASE;

  const playTypes = [
    'skip', 'post move', 'mid-range jumper', '3 pointer', 'drive to basket',
    'floater', 'pick and roll', 'fast break', 'catch and shoot', 'pull up jumper', 'defensive play'
  ];

  function handleFileChange(e) {
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);
    setVideoURL(URL.createObjectURL(selected));
  }

  function handleVideoLoaded() {
    const video = videoRef.current;
    const duration = video.duration;
    const segs = [];
    let start = 0;
    let idx = 0;
    while (start < duration) {
      const end = Math.min(start + SEGMENT_LENGTH, duration);
      if (end - start > 2) {
        segs.push({
          index: idx,
          startTime: start,
          endTime: end,
          playType: 'skip',
          thumbnail: null,
          status: 'pending',
          result: null,
        });
        idx++;
      }
      start = end;
    }
    setSegments(segs);
    generateThumbnails(video, segs);
  }

  async function generateThumbnails(video, segs) {
    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 90;
    const ctx = canvas.getContext('2d');
    const updated = [...segs];

    for (let i = 0; i < segs.length; i++) {
      await new Promise((resolve) => {
        function onSeeked() {
          video.removeEventListener('seeked', onSeeked);
          ctx.drawImage(video, 0, 0, 160, 90);
          updated[i] = { ...updated[i], thumbnail: canvas.toDataURL('image/jpeg', 0.5) };
          setSegments([...updated]);
          resolve();
        }
        video.addEventListener('seeked', onSeeked);
        video.currentTime = segs[i].startTime + 1;
      });
    }
  }

  function extractFrames(video, startTime, endTime, numFrames = 5) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        video.removeEventListener('seeked', onSeeked);
        if (frames.length > 0) resolve(frames);
        else reject(new Error('Frame extraction timed out'));
      }, 15000);

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 360;
      const ctx = canvas.getContext('2d');
      const frames = [];
      const duration = endTime - startTime;
      const interval = duration / numFrames;
      let captured = 0;

      function onSeeked() {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        frames.push(canvas.toDataURL('image/jpeg', 0.7).split(',')[1]);
        captured++;
        if (captured < numFrames) {
          video.currentTime = startTime + interval * captured;
        } else {
          clearTimeout(timeout);
          video.removeEventListener('seeked', onSeeked);
          resolve(frames);
        }
      }

      video.addEventListener('seeked', onSeeked);
      video.currentTime = startTime;
    });
  }

  function updateSegmentPlayType(index, playType) {
    setSegments(prev => prev.map(s => s.index === index ? { ...s, playType } : s));
  }

  function seekToSegment(startTime) {
    if (tagVideoRef.current) {
      tagVideoRef.current.currentTime = startTime;
      tagVideoRef.current.play();
    }
  }

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  const taggedCount = segments.filter(s => s.playType !== 'skip').length;

  const startAnalysis = useCallback(async () => {
    const tagged = segments.filter(s => s.playType !== 'skip');
    if (tagged.length === 0) return alert('Tag at least one segment with a play type');

    // Check usage limits
    if (usage && !usage.canAnalyze) {
      setShowUpgrade(true);
      return;
    }

    // Create a dedicated video element for frame extraction so it survives phase changes
    const extractionVideo = document.createElement('video');
    extractionVideo.src = videoURL;
    extractionVideo.crossOrigin = 'anonymous';
    extractionVideo.preload = 'auto';
    extractionVideo.muted = true;
    await new Promise((resolve) => {
      extractionVideo.onloadeddata = resolve;
      extractionVideo.onerror = resolve;
      setTimeout(resolve, 5000);
    });

    setPhase(3);
    setProgress({ current: 0, total: tagged.length });

    const video = extractionVideo;
    const results = [];

    for (let i = 0; i < tagged.length; i++) {
      const seg = tagged[i];
      setProgress({ current: i + 1, total: tagged.length });

      // Update segment status to analyzing
      setSegments(prev => prev.map(s => s.index === seg.index ? { ...s, status: 'analyzing' } : s));

      try {
        const frames = await extractFrames(video, seg.startTime, seg.endTime, 5);

        const response = await fetch(`${API_URL}/api/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            frames,
            sessionName: `${sessionName} (${formatTime(seg.startTime)}-${formatTime(seg.endTime)})`,
            position,
            playerName,
            jerseyNumber,
            playType: seg.playType,
            mode: 'pro',
          })
        });

        const data = await response.json();

        if (data.success) {
          const result = data.result;
          setSegments(prev => prev.map(s => s.index === seg.index ? {
            ...s, status: 'complete', result,
            score: result.score, grade: result.grade
          } : s));
          results.push({ ...seg, result });

          // Save individual analysis to Supabase & increment usage
          const { data: { user } } = await supabase.auth.getUser();
          await supabase.from('analyses').insert([{
            session_name: `${sessionName} (${formatTime(seg.startTime)}-${formatTime(seg.endTime)})`,
            player_name: playerName,
            jersey_number: jerseyNumber,
            position,
            play_type: seg.playType,
            score: result.score,
            grade: result.grade,
            summary: result.summary,
            user_id: user.id,
          }]);
          await fetch(`${API_URL_BASE}/api/increment-usage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id }),
          });
        } else {
          setSegments(prev => prev.map(s => s.index === seg.index ? { ...s, status: 'error' } : s));
        }
      } catch (err) {
        console.error(`Segment ${seg.index} failed:`, err);
        setSegments(prev => prev.map(s => s.index === seg.index ? { ...s, status: 'error' } : s));
      }

      // Delay between calls to respect rate limits
      if (i < tagged.length - 1) {
        await new Promise(r => setTimeout(r, 1500));
      }
    }

    // Generate game summary
    try {
      const summaryResponse = await fetch(`${API_URL}/api/game-summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionName,
          playerName,
          position,
          segments: results.map(r => ({
            playType: r.playType,
            timeRange: `${formatTime(r.startTime)}-${formatTime(r.endTime)}`,
            score: r.result.score,
            grade: r.result.grade,
            summary: r.result.summary,
          }))
        })
      });
      const summaryData = await summaryResponse.json();
      if (summaryData.success) {
        setGameResult(summaryData.result);
      }
    } catch (err) {
      console.error('Game summary failed:', err);
    }

    // Clean up extraction video
    extractionVideo.src = '';
    extractionVideo.remove();
  }, [segments, sessionName, position, playerName, jerseyNumber, videoURL]);

  const section = {
    background: '#0f1117',
    border: '1px solid #1a1d2e',
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
    border: '1px solid #1a1d2e',
    background: '#080a0f',
    color: '#ffffff',
    fontSize: '14px',
    fontFamily: 'Inter, sans-serif',
    outline: 'none',
  };

  function getGradeColor(grade) {
    if (!grade) return '#555';
    if (grade.startsWith('A')) return '#4ade80';
    if (grade.startsWith('B')) return '#ff6b00';
    if (grade.startsWith('C')) return '#facc15';
    return '#ff4444';
  }

  // ─── UPGRADE MODAL ────────────────────────────────────────────────
  const UpgradeModal = () => (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: '#0f1117', border: '1px solid #1a1d2e', borderRadius: '20px', padding: '40px', maxWidth: '480px', width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏀</div>
        <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#fff', marginBottom: '8px', textTransform: 'none' }}>You've used all your free analyses</h2>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '28px', lineHeight: '1.6' }}>
          Free accounts get 2 analyses per month. Upgrade to keep improving.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          <button
            onClick={async () => {
              const { data: { user } } = await supabase.auth.getUser();
              const res = await fetch(`${API_URL_BASE}/api/create-checkout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, plan: 'pro' }),
              });
              const data = await res.json();
              if (data.url) window.location.href = data.url;
            }}
            style={{ background: '#ff6b00', color: '#fff', border: 'none', padding: '14px', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}
          >
            Go Pro — $9.99/mo (15 analyses)
          </button>
          <button
            onClick={async () => {
              const { data: { user } } = await supabase.auth.getUser();
              const res = await fetch(`${API_URL_BASE}/api/create-checkout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, plan: 'elite' }),
              });
              const data = await res.json();
              if (data.url) window.location.href = data.url;
            }}
            style={{ background: 'transparent', color: '#ff6b00', border: '1px solid #ff6b00', padding: '14px', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}
          >
            Go Elite — $19.99/mo (Unlimited)
          </button>
        </div>
        <button
          onClick={() => setShowUpgrade(false)}
          style={{ background: 'none', border: 'none', color: '#555', fontSize: '13px', cursor: 'pointer' }}
        >
          Maybe later
        </button>
      </div>
    </div>
  );

  // ─── PHASE 1: SETUP ──────────────────────────────────────────────
  if (phase === 1) {
    return (
      <div className="main">
        {showUpgrade && <UpgradeModal />}
        <div className="top-bar">
          <div>
            <h1>Full Game Analysis</h1>
            <p>Upload a full game or quarter for possession-by-possession breakdown</p>
          </div>
          {usage && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '13px', color: '#888' }}>
                <span style={{ color: '#ff6b00', fontWeight: '700' }}>{usage.used}</span> / {usage.limit} analyses used
              </div>
              <div style={{ fontSize: '11px', color: '#555', textTransform: 'uppercase', letterSpacing: '1px' }}>{usage.plan} plan</div>
            </div>
          )}
        </div>

        <div style={{ maxWidth: '680px' }}>
          <div style={section}>
            <div style={sectionTitle}>Session Info</div>
            <input type="text" placeholder="Game name (e.g. League Game vs Eagles)" value={sessionName} onChange={e => setSessionName(e.target.value)} style={input} />
          </div>

          <div style={section}>
            <div style={sectionTitle}>Player Info</div>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
              <input type="text" placeholder="Player name" value={playerName} onChange={e => setPlayerName(e.target.value)} style={input} />
              <input type="text" placeholder="Jersey #" value={jerseyNumber} onChange={e => setJerseyNumber(e.target.value)} style={{ ...input, width: '120px', flexShrink: 0 }} />
            </div>
            <select value={position} onChange={e => setPosition(e.target.value)} style={input}>
              <option>point guard</option>
              <option>shooting guard</option>
              <option>small forward</option>
              <option>power forward</option>
              <option>center</option>
            </select>
          </div>

          <div style={section}>
            <div style={sectionTitle}>Game Film</div>
            <label style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: '8px', padding: '32px',
              border: '2px dashed #1a1d2e', borderRadius: '12px', cursor: 'pointer',
              transition: 'border-color 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#ff6b00'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#1a1d2e'}
            >
              <span style={{ fontSize: '32px' }}>🎬</span>
              <span style={{ color: '#888', fontSize: '14px', fontWeight: '600' }}>
                {file ? file.name : 'Click to upload MP4, MOV, AVI'}
              </span>
              <span style={{ color: '#444', fontSize: '12px' }}>Full game, quarter, or multi-minute clip</span>
              <input type="file" accept="video/*" onChange={handleFileChange} style={{ display: 'none' }} />
            </label>

            {videoURL && (
              <div style={{ marginTop: '20px' }}>
                <video
                  ref={videoRef}
                  src={videoURL}
                  onLoadedMetadata={handleVideoLoaded}
                  style={{ width: '100%', borderRadius: '10px', maxHeight: '360px' }}
                  controls
                />
                {segments.length > 0 && (
                  <div style={{ marginTop: '16px', textAlign: 'center' }}>
                    <p style={{ color: '#888', fontSize: '14px', marginBottom: '12px' }}>
                      {segments.length} segments detected ({formatTime(videoRef.current?.duration || 0)} total)
                    </p>
                    <button
                      className="upload-btn"
                      onClick={() => {
                        if (!sessionName) return alert('Please enter a game name');
                        setPhase(2);
                      }}
                      style={{ width: '100%' }}
                    >
                      Continue to Tag Plays
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── PHASE 2: TAGGING ─────────────────────────────────────────────
  if (phase === 2) {
    return (
      <div className="main">
        {showUpgrade && <UpgradeModal />}
        <div className="top-bar">
          <div>
            <h1>Tag Plays</h1>
            <p>Click a segment to preview, then select the play type. Skip segments with no action.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ color: '#888', fontSize: '14px' }}>{taggedCount} of {segments.length} tagged</span>
            <button
              className="upload-btn"
              onClick={startAnalysis}
              style={{ opacity: taggedCount === 0 ? 0.4 : 1 }}
              disabled={taggedCount === 0}
            >
              Analyze {taggedCount} Plays
            </button>
          </div>
        </div>

        <div className="game-tag-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Video player */}
          <div className="game-tag-video" style={{ position: 'sticky', top: '24px', alignSelf: 'start' }}>
            <video
              ref={tagVideoRef}
              src={videoURL}
              controls
              style={{ width: '100%', borderRadius: '12px', border: '1px solid #1a1d2e' }}
            />
            <div style={{ marginTop: '12px', padding: '16px', background: '#0f1117', borderRadius: '12px', border: '1px solid #1a1d2e' }}>
              <div style={{ fontSize: '12px', color: '#555', marginBottom: '8px' }}>QUICK TAG</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                <button
                  onClick={() => setSegments(prev => prev.map(s => ({ ...s, playType: 'skip' })))}
                  style={{
                    padding: '6px 12px', borderRadius: '6px', border: '1px solid #1a1d2e',
                    background: 'transparent', color: '#888', fontSize: '11px', cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>

          {/* Segment list */}
          <div className="game-segment-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '80vh', overflowY: 'auto' }}>
            {segments.map(seg => (
              <div
                key={seg.index}
                className="game-segment-card"
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '10px 14px', background: '#0f1117',
                  border: `1px solid ${seg.playType !== 'skip' ? '#ff6b00' : '#1a1d2e'}`,
                  borderRadius: '12px', cursor: 'pointer', transition: 'border-color 0.2s',
                }}
              >
                {/* Thumbnail */}
                <div
                  onClick={() => seekToSegment(seg.startTime)}
                  style={{
                    width: '80px', height: '45px', borderRadius: '6px', overflow: 'hidden',
                    background: '#1a1d2e', flexShrink: 0,
                  }}
                >
                  {seg.thumbnail && (
                    <img src={seg.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </div>

                {/* Time range */}
                <div style={{ flex: '0 0 auto', minWidth: '90px' }} onClick={() => seekToSegment(seg.startTime)}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>
                    {formatTime(seg.startTime)} - {formatTime(seg.endTime)}
                  </div>
                  <div style={{ fontSize: '11px', color: '#444' }}>Segment {seg.index + 1}</div>
                </div>

                {/* Play type selector */}
                <select
                  value={seg.playType}
                  onChange={e => updateSegmentPlayType(seg.index, e.target.value)}
                  style={{
                    flex: 1, padding: '8px 10px', borderRadius: '6px',
                    border: '1px solid #1a1d2e', background: '#080a0f',
                    color: seg.playType === 'skip' ? '#555' : '#ff6b00',
                    fontSize: '12px', fontFamily: 'Inter, sans-serif', outline: 'none',
                    fontWeight: '600', textTransform: 'capitalize',
                  }}
                >
                  {playTypes.map(pt => (
                    <option key={pt} value={pt}>{pt === 'skip' ? '-- Skip --' : pt}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── PHASE 3: ANALYZING + RESULTS ─────────────────────────────────
  const completedSegments = segments.filter(s => s.status === 'complete');
  const analyzingDone = progress.current === progress.total && progress.total > 0;

  return (
    <div className="main">
      <div className="top-bar">
        <div>
          <h1>{analyzingDone ? 'Game Report' : 'Analyzing...'}</h1>
          <p>{analyzingDone
            ? `${sessionName} — ${playerName} #${jerseyNumber}`
            : `Processing segment ${progress.current} of ${progress.total}`
          }</p>
        </div>
      </div>

      {/* Progress bar */}
      {!analyzingDone && (
        <div style={{ ...section }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: '#888', fontSize: '14px' }}>Analyzing plays...</span>
            <span style={{ color: '#ff6b00', fontSize: '14px', fontWeight: '700' }}>
              {progress.current}/{progress.total}
            </span>
          </div>
          <div style={{ background: '#1a1d2e', borderRadius: '6px', height: '8px' }}>
            <div style={{
              background: 'linear-gradient(90deg, #ff6b00, #e85d24)',
              height: '8px', borderRadius: '6px',
              width: `${(progress.current / progress.total) * 100}%`,
              transition: 'width 0.5s ease',
            }} />
          </div>
        </div>
      )}

      {/* Game Summary */}
      {gameResult && (
        <div style={{ ...section, borderColor: '#ff6b00' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={sectionTitle}>Game Summary</div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '48px', fontWeight: '900', color: '#ff6b00', lineHeight: 1 }}>
                {gameResult.overallGrade}
              </div>
              <div style={{ fontSize: '13px', color: '#555' }}>{gameResult.overallScore}/100</div>
            </div>
          </div>

          <p style={{ color: '#ccc', fontSize: '15px', lineHeight: '1.7', marginBottom: '20px' }}>
            {gameResult.gameNarrative}
          </p>

          <div className="result-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#4ade80', letterSpacing: '1px', marginBottom: '8px' }}>STRENGTHS</div>
              {(gameResult.strengths || []).map((s, i) => (
                <p key={i} style={{ color: '#aaa', fontSize: '13px', lineHeight: '1.6', marginBottom: '4px' }}>+ {s}</p>
              ))}
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#ff4444', letterSpacing: '1px', marginBottom: '8px' }}>WEAKNESSES</div>
              {(gameResult.weaknesses || []).map((w, i) => (
                <p key={i} style={{ color: '#aaa', fontSize: '13px', lineHeight: '1.6', marginBottom: '4px' }}>- {w}</p>
              ))}
            </div>
          </div>

          {gameResult.keyCoachingPoints && gameResult.keyCoachingPoints.length > 0 && (
            <div style={{ marginTop: '20px', padding: '16px', background: '#080a0f', borderRadius: '10px', borderLeft: '3px solid #ff6b00' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#ff6b00', letterSpacing: '1px', marginBottom: '8px' }}>KEY COACHING POINTS</div>
              {gameResult.keyCoachingPoints.map((tip, i) => (
                <p key={i} style={{ color: '#ccc', fontSize: '13px', lineHeight: '1.6', marginBottom: '4px' }}>{i + 1}. {tip}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stats row */}
      {completedSegments.length > 0 && (
        <div className="stats-row" style={{ marginBottom: '24px' }}>
          {[
            ['Plays Analyzed', completedSegments.length],
            ['Avg Score', Math.round(completedSegments.reduce((s, seg) => s + (seg.score || 0), 0) / completedSegments.length)],
            ['Best', Math.max(...completedSegments.map(s => s.score || 0))],
            ['Worst', Math.min(...completedSegments.map(s => s.score || 0))],
          ].map(([label, val]) => (
            <div className="stat-card" key={label}>
              <div className="stat-label">{label}</div>
              <div className="stat-value">{val}</div>
            </div>
          ))}
        </div>
      )}

      {/* Segment results */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {segments.filter(s => s.playType !== 'skip').map(seg => (
          <SegmentCard key={seg.index} seg={seg} section={section} sectionTitle={sectionTitle} getGradeColor={getGradeColor} formatTime={formatTime} />
        ))}
      </div>
    </div>
  );
}

function SegmentCard({ seg, section, sectionTitle, getGradeColor, formatTime }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{
      background: '#0f1117', border: '1px solid #1a1d2e', borderRadius: '12px',
      overflow: 'hidden', transition: 'border-color 0.2s',
    }}>
      {/* Header */}
      <div
        onClick={() => seg.status === 'complete' && setExpanded(!expanded)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px', cursor: seg.status === 'complete' ? 'pointer' : 'default',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {seg.thumbnail && (
            <img src={seg.thumbnail} alt="" style={{ width: '60px', height: '34px', borderRadius: '4px', objectFit: 'cover' }} />
          )}
          <div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>
              {formatTime(seg.startTime)} - {formatTime(seg.endTime)}
            </div>
            <div style={{ fontSize: '12px', color: '#888', textTransform: 'capitalize' }}>{seg.playType}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {seg.status === 'analyzing' && (
            <span style={{ color: '#ff6b00', fontSize: '13px', fontWeight: '600' }}>Analyzing...</span>
          )}
          {seg.status === 'error' && (
            <span style={{ color: '#ff4444', fontSize: '13px', fontWeight: '600' }}>Failed</span>
          )}
          {seg.status === 'pending' && (
            <span style={{ color: '#555', fontSize: '13px' }}>Pending</span>
          )}
          {seg.status === 'complete' && (
            <>
              <span style={{ fontSize: '13px', color: '#555' }}>{seg.score}/100</span>
              <span style={{ fontSize: '24px', fontWeight: '900', color: getGradeColor(seg.grade) }}>{seg.grade}</span>
            </>
          )}
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && seg.result && (
        <div style={{ padding: '0 18px 18px', borderTop: '1px solid #1a1d2e' }}>
          <div className="result-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
            <div style={{ background: '#080a0f', borderRadius: '10px', padding: '16px' }}>
              <div style={sectionTitle}>Offense</div>
              <p style={{ color: '#ccc', fontSize: '13px', lineHeight: '1.6' }}>{seg.result.summary?.positioning?.offense}</p>
            </div>
            <div style={{ background: '#080a0f', borderRadius: '10px', padding: '16px' }}>
              <div style={sectionTitle}>Defense</div>
              <p style={{ color: '#ccc', fontSize: '13px', lineHeight: '1.6' }}>{seg.result.summary?.positioning?.defense}</p>
            </div>
            <div style={{ background: '#080a0f', borderRadius: '10px', padding: '16px' }}>
              <div style={sectionTitle}>Shot Quality</div>
              <div style={{
                display: 'inline-block', marginBottom: '6px', padding: '2px 8px',
                borderRadius: '4px', fontSize: '11px', fontWeight: '700',
                background: seg.result.summary?.shotQuality?.verdict === 'GOOD SHOT' ? '#0a2a0a' : '#2a0a0a',
                color: seg.result.summary?.shotQuality?.verdict === 'GOOD SHOT' ? '#4ade80' : '#ff4444',
              }}>
                {seg.result.summary?.shotQuality?.verdict}
              </div>
              <p style={{ color: '#ccc', fontSize: '13px', lineHeight: '1.6' }}>{seg.result.summary?.shotQuality?.reason}</p>
            </div>
            <div style={{ background: '#080a0f', borderRadius: '10px', padding: '16px' }}>
              <div style={sectionTitle}>Decision Making</div>
              <div style={{
                display: 'inline-block', marginBottom: '6px', padding: '2px 8px',
                borderRadius: '4px', fontSize: '11px', fontWeight: '700',
                background: seg.result.summary?.decisionMaking?.verdict === 'RIGHT DECISION' ? '#0a2a0a' : '#2a0a0a',
                color: seg.result.summary?.decisionMaking?.verdict === 'RIGHT DECISION' ? '#4ade80' : '#ff4444',
              }}>
                {seg.result.summary?.decisionMaking?.verdict}
              </div>
              <p style={{ color: '#ccc', fontSize: '13px', lineHeight: '1.6' }}>{seg.result.summary?.decisionMaking?.reason}</p>
            </div>
            <div style={{ background: '#080a0f', borderRadius: '10px', padding: '16px', gridColumn: '1 / -1', borderLeft: '3px solid #ff6b00' }}>
              <div style={sectionTitle}>Coaching Tip</div>
              <p style={{ color: '#ccc', fontSize: '13px', lineHeight: '1.6' }}>{seg.result.summary?.coachingTip}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
