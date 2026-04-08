import { useNavigate } from 'react-router-dom';

function Landing() {
  const navigate = useNavigate();

  const steps = [
    { num: '01', title: 'Upload Your Film', desc: 'Drop in your game film or paste a Google Drive link. Full games, quarters, or single plays.' },
    { num: '02', title: 'Tell the AI What to Focus On', desc: 'Pick your areas — shot selection, defense, pick & roll reads, decision making — or write a custom note.' },
    { num: '03', title: 'Get Your Coaching Report', desc: 'Timestamped breakdowns of every possession. Scores, grades, drills, and a personalized plan to improve.' },
  ];

  const features = [
    { icon: '🤖', title: 'Auto Game Analysis', desc: 'Upload a full game and Gemini 2.5 Flash watches the entire film, finds every possession you touch the ball, and grades each one automatically.' },
    { icon: '🧠', title: 'Basketball Brain', desc: 'Powered by expert knowledge on gap theory, pick & roll reads, spacing, transition offense, court vision, and more — built in by real coaches.' },
    { icon: '⏱️', title: 'Timestamped Plays', desc: 'Every play comes with exact timestamps so you can jump directly to the moment in your film and see exactly what the AI is talking about.' },
    { icon: '📊', title: 'Graded Breakdowns', desc: 'Each possession gets a score out of 100, a letter grade, and specific feedback on positioning, shot quality, and decision making.' },
    { icon: '🎯', title: 'Focus Areas', desc: 'Tell the AI what you want it to pay attention to. It will call out those specific things on every play, good or bad.' },
    { icon: '📈', title: 'Track Improvement', desc: 'See your scores over time. Know exactly what you are getting better at and what still needs work.' },
  ];

  return (
    <div className="landing-page">

      {/* Nav */}
      <nav className="landing-nav">
        <div className="landing-nav-logo" onClick={() => window.scrollTo(0, 0)} style={{ cursor: 'pointer' }}>
          <img src="/logo192.png" alt="CourtIQ" style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
          <span style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '-0.5px', color: '#0f1117' }}>
            COURT<span style={{ color: '#ff6b00' }}>IQ</span>
          </span>
        </div>
        <div className="landing-nav-links">
          <a href="#how-it-works" className="landing-nav-link">How It Works</a>
          <a href="#features" className="landing-nav-link">Features</a>
        </div>
        <div className="landing-nav-buttons">
          <button onClick={() => navigate('/auth')} className="landing-btn-ghost">Sign In</button>
          <button onClick={() => navigate('/auth?signup=true')} className="upload-btn landing-btn-cta">Get Started Free</button>
        </div>
      </nav>

      {/* Hero */}
      <div className="landing-hero">
        <div className="landing-hero-glow" />
        <div className="landing-badge">🏀 Powered by Gemini 2.5 Flash</div>
        <h1 className="landing-hero-title">
          Stop guessing.<br />
          <span style={{ color: '#ff6b00' }}>Watch your film.</span>
        </h1>
        <p className="landing-hero-sub">
          Upload your game film and get a detailed coaching breakdown of every possession — timestamped, graded, and actionable.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/auth?signup=true')}
            className="upload-btn"
            style={{ fontSize: '15px', padding: '16px 36px' }}
          >
            Start Analyzing Free
          </button>
          <button
            onClick={() => { const el = document.getElementById('how-it-works'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}
            className="landing-btn-ghost"
            style={{ fontSize: '15px', padding: '16px 28px' }}
          >
            See How It Works
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="landing-stats">
        {[
          ['Gemini 2.5', 'Vision AI Model'],
          ['270+', 'Brain Entries'],
          ['10+', 'Play Types'],
          ['A–F', 'Graded Plays'],
        ].map(([val, label]) => (
          <div key={label} className="landing-stat">
            <div className="landing-stat-val">{val}</div>
            <div className="landing-stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* How It Works */}
      <div id="how-it-works" className="landing-section">
        <div className="landing-section-header">
          <div className="landing-section-tag">How It Works</div>
          <h2 className="landing-section-title">Three steps to better basketball</h2>
        </div>
        <div className="landing-grid-3">
          {steps.map(s => (
            <div key={s.num} className="landing-card" style={{ position: 'relative' }}>
              <div style={{ fontSize: '44px', fontWeight: '900', color: 'rgba(255,107,0,0.08)', position: 'absolute', top: '14px', right: '18px', letterSpacing: '-2px', lineHeight: 1 }}>{s.num}</div>
              <div style={{ fontSize: '17px', fontWeight: '800', color: '#0f1117', marginBottom: '10px', marginTop: '4px' }}>{s.title}</div>
              <div style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.75' }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div id="features" className="landing-section" style={{ borderTop: '1px solid #f3f4f6', paddingTop: '80px' }}>
        <div className="landing-section-header">
          <div className="landing-section-tag">Features</div>
          <h2 className="landing-section-title">Everything you need to level up</h2>
        </div>
        <div className="landing-grid-3">
          {features.map(f => (
            <div key={f.title} className="landing-card">
              <div style={{ fontSize: '28px', marginBottom: '14px' }}>{f.icon}</div>
              <div style={{ fontSize: '15px', fontWeight: '800', color: '#0f1117', marginBottom: '8px' }}>{f.title}</div>
              <div style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.75' }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div className="landing-final-cta">
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '600px', height: '400px',
          background: 'radial-gradient(ellipse, rgba(255,107,0,0.12) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />
        <h2 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: '900', letterSpacing: '-1.5px', color: '#ffffff', marginBottom: '16px', position: 'relative', textTransform: 'none' }}>
          Ready to see your game clearly?
        </h2>
        <p style={{ color: '#9ca3af', fontSize: '16px', marginBottom: '36px', position: 'relative', fontWeight: '400' }}>
          Your first analysis is free. No credit card required.
        </p>
        <button
          onClick={() => navigate('/auth?signup=true')}
          className="upload-btn"
          style={{ fontSize: '15px', padding: '16px 40px', position: 'relative' }}
        >
          Get Started Free
        </button>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '24px 20px', background: '#0f1117', borderTop: '1px solid rgba(255,255,255,0.06)', color: '#6b7280', fontSize: '13px' }}>
        © 2026 CourtIQ · AI Film Analysis
      </div>
    </div>
  );
}

export default Landing;
