import { useNavigate } from 'react-router-dom';

function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: '🎬',
      title: 'Upload Game Film',
      desc: 'Upload any basketball clip. Mark the play you want analyzed — we extract the key frames automatically.',
    },
    {
      icon: '🤖',
      title: 'AI Film Analysis',
      desc: 'Our AI breaks down positioning, shot quality, decision making, and gives you a score with a letter grade.',
    },
    {
      icon: '💬',
      title: 'Personal AI Coach',
      desc: 'Chat with an AI coach that knows your full history and gives personalized advice based on your patterns.',
    },
    {
      icon: '📈',
      title: 'Track Your Progress',
      desc: 'See how your scores trend over time. Know exactly which plays to work on and which drills to run.',
    },
  ];

  return (
    <div style={{ background: '#080a0f', minHeight: '100vh', color: '#fff', fontFamily: 'Inter, sans-serif' }}>

      {/* Nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 48px', borderBottom: '1px solid #1a1d2e' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '22px' }}>🏀</span>
          <span style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '-0.5px' }}>CourtIQ</span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => navigate('/auth')}
            style={{ background: 'none', border: '1px solid #1a1d2e', color: '#888', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/auth?signup=true')}
            className="upload-btn"
            style={{ padding: '10px 20px' }}
          >
            Get Started
          </button>
        </div>
      </div>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '100px 48px 80px' }}>
        <div style={{ display: 'inline-block', background: '#1a1d2e', border: '1px solid #252836', borderRadius: '20px', padding: '6px 16px', fontSize: '12px', fontWeight: '700', color: '#ff6b00', letterSpacing: '1px', marginBottom: '24px', textTransform: 'uppercase' }}>
          AI Film Analysis
        </div>
        <h1 style={{ fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: '900', letterSpacing: '-2px', lineHeight: '1.05', marginBottom: '20px' }}>
          Get coached like a<br />
          <span style={{ color: '#ff6b00' }}>pro</span> — from your phone.
        </h1>
        <p style={{ fontSize: '18px', color: '#555', maxWidth: '520px', margin: '0 auto 40px', lineHeight: '1.6' }}>
          Upload your game film. Get a full AI breakdown — positioning, shot quality, decision making, and a personalized drill to fix it.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/auth?signup=true')}
            className="upload-btn"
            style={{ fontSize: '16px', padding: '16px 36px' }}
          >
            Start Analyzing Free
          </button>
          <button
            onClick={() => navigate('/auth')}
            style={{ background: 'none', border: '1px solid #1a1d2e', color: '#888', padding: '16px 36px', borderRadius: '10px', cursor: 'pointer', fontSize: '16px', fontWeight: '700' }}
          >
            Sign In
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '64px', padding: '40px 48px', borderTop: '1px solid #1a1d2e', borderBottom: '1px solid #1a1d2e', flexWrap: 'wrap' }}>
        {[['5s', 'Analysis time'], ['10+', 'Play types'], ['A–F', 'Graded plays'], ['Free', 'To get started']].map(([val, label]) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '36px', fontWeight: '900', color: '#ff6b00', letterSpacing: '-1px' }}>{val}</div>
            <div style={{ fontSize: '13px', color: '#555', fontWeight: '600', marginTop: '4px' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Features */}
      <div style={{ padding: '80px 48px' }}>
        <h2 style={{ textAlign: 'center', fontSize: '32px', fontWeight: '900', letterSpacing: '-1px', marginBottom: '48px', textTransform: 'none', color: '#fff' }}>
          Everything you need to level up
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', maxWidth: '1000px', margin: '0 auto' }}>
          {features.map(f => (
            <div key={f.title} style={{ background: '#0f1117', border: '1px solid #1a1d2e', borderRadius: '16px', padding: '28px' }}>
              <div style={{ fontSize: '32px', marginBottom: '14px' }}>{f.icon}</div>
              <div style={{ fontSize: '16px', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>{f.title}</div>
              <div style={{ fontSize: '14px', color: '#555', lineHeight: '1.6' }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ textAlign: 'center', padding: '80px 48px', borderTop: '1px solid #1a1d2e' }}>
        <h2 style={{ fontSize: '36px', fontWeight: '900', letterSpacing: '-1px', marginBottom: '16px', textTransform: 'none', color: '#fff' }}>
          Ready to see your game clearly?
        </h2>
        <p style={{ color: '#555', fontSize: '16px', marginBottom: '32px' }}>Upload your first clip in under a minute.</p>
        <button
          onClick={() => navigate('/auth?signup=true')}
          className="upload-btn"
          style={{ fontSize: '16px', padding: '16px 40px' }}
        >
          Get Started Free
        </button>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '24px', borderTop: '1px solid #1a1d2e', color: '#333', fontSize: '13px' }}>
        © 2026 CourtIQ · AI Film Analysis
      </div>
    </div>
  );
}

export default Landing;
