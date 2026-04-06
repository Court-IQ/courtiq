import { useNavigate } from 'react-router-dom';

function Landing() {
  const navigate = useNavigate();

  const steps = [
    { num: '01', title: 'Upload Your Film', desc: 'Drop in any game clip from your phone or camera. Full games or single plays — CourtIQ handles both.' },
    { num: '02', title: 'AI Breaks It Down', desc: 'GPT-4o analyzes every frame — positioning, shot quality, decision making, and defensive reads.' },
    { num: '03', title: 'Get Your Coaching Report', desc: 'Scores, grades, specific coaching tips, and drills tailored to what you need to fix.' },
  ];

  const features = [
    { icon: '🎬', title: 'Full Game Analysis', desc: 'Upload a full game. CourtIQ auto-splits it into plays, you tag the play types, and AI analyzes each one individually.' },
    { icon: '🧠', title: 'Basketball Brain', desc: 'Powered by 270+ expert knowledge entries on gap theory, pick & roll reads, spacing, transition, court vision, and more.' },
    { icon: '💬', title: 'AI Coach Chat', desc: 'Ask your AI coach anything — it knows your film history and has deep basketball knowledge to give real coaching advice.' },
    { icon: '📊', title: 'Graded Breakdowns', desc: 'Every play gets a score out of 100 and a letter grade across positioning, shot quality, decision making, and habits.' },
    { icon: '🏀', title: 'Play Type Detection', desc: 'Pick & roll, catch and shoot, drives, fast breaks, post ups, off-ball movement — CourtIQ knows the game.' },
    { icon: '📈', title: 'Track Improvement', desc: 'See your scores over time. Know exactly what you are getting better at and what still needs work.' },
  ];

  return (
    <div className="landing-page">

      {/* Nav */}
      <nav className="landing-nav">
        <div className="landing-nav-logo" onClick={() => window.scrollTo(0, 0)} style={{ cursor: 'pointer' }}>
          <img src="/logo192.png" alt="CourtIQ" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
          <span style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '-0.5px' }}>
            COURT<span style={{ color: '#ff6b00' }}>IQ</span>
          </span>
        </div>
        <div className="landing-nav-links">
          <a href="#how-it-works" className="landing-nav-link">How It Works</a>
        </div>
        <div className="landing-nav-buttons">
          <button onClick={() => navigate('/auth')} className="landing-btn-ghost">Sign In</button>
          <button onClick={() => navigate('/auth?signup=true')} className="upload-btn landing-btn-cta">Get Started</button>
        </div>
      </nav>

      {/* Hero */}
      <div className="landing-hero">
        <div className="landing-hero-glow" />
        <div className="landing-badge">AI-Powered Film Analysis</div>
        <h1 className="landing-hero-title">
          Your personal coach<br />
          <span style={{ color: '#ff6b00' }}>is watching film.</span>
        </h1>
        <p className="landing-hero-sub">
          Upload your game film and get elite-level breakdowns — positioning, decision making, shot quality, and a personalized plan to improve.
        </p>
        <button
          onClick={() => navigate('/auth?signup=true')}
          className="upload-btn"
          style={{ fontSize: '16px', padding: '18px 40px' }}
        >
          Start Analyzing Free
        </button>
      </div>

      {/* Stats bar */}
      <div className="landing-stats">
        {[
          ['GPT-4o', 'Vision AI'],
          ['270+', 'Brain entries'],
          ['10+', 'Play types'],
          ['A–F', 'Graded plays'],
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
              <div style={{ fontSize: '48px', fontWeight: '900', color: 'rgba(34,197,94,0.15)', position: 'absolute', top: '16px', right: '20px', letterSpacing: '-2px' }}>{s.num}</div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#111827', marginBottom: '10px', marginTop: '8px' }}>{s.title}</div>
              <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.7' }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="landing-section" style={{ borderTop: '1px solid #e5e7eb' }}>
        <div className="landing-section-header">
          <div className="landing-section-tag">Features</div>
          <h2 className="landing-section-title">Everything you need to level up</h2>
        </div>
        <div className="landing-grid-3">
          {features.map(f => (
            <div key={f.title} className="landing-card">
              <div style={{ fontSize: '32px', marginBottom: '14px' }}>{f.icon}</div>
              <div style={{ fontSize: '16px', fontWeight: '800', color: '#111827', marginBottom: '8px' }}>{f.title}</div>
              <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.7' }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div className="landing-final-cta">
        <div className="landing-hero-glow" />
        <h2 className="landing-section-title" style={{ fontSize: 'clamp(28px, 5vw, 40px)', position: 'relative' }}>
          Ready to see your game clearly?
        </h2>
        <p style={{ color: '#555', fontSize: '16px', marginBottom: '36px', position: 'relative' }}>Your first analysis is free. No credit card required.</p>
        <button
          onClick={() => navigate('/auth?signup=true')}
          className="upload-btn"
          style={{ fontSize: '16px', padding: '18px 44px', position: 'relative' }}
        >
          Get Started Free
        </button>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '28px 20px', borderTop: '1px solid #e5e7eb', color: '#333', fontSize: '13px' }}>
        © 2026 CourtIQ · AI Film Analysis
      </div>
    </div>
  );
}

export default Landing;
