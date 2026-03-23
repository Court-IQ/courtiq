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

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: '/mo',
      desc: 'Try it out',
      features: ['2 video analyses per month', 'AI coaching chat', 'Basic feedback & grades'],
      cta: 'Get Started Free',
      highlighted: false,
    },
    {
      name: 'Pro',
      price: '$9.99',
      period: '/mo',
      desc: 'For serious players',
      features: ['15 analyses per month', 'Full game breakdowns', 'Detailed coaching reports', 'Progress tracking', 'Basketball Brain access'],
      cta: 'Go Pro',
      highlighted: true,
    },
    {
      name: 'Elite',
      price: '$19.99',
      period: '/mo',
      desc: 'Unlimited everything',
      features: ['Unlimited analyses', 'Priority processing', 'Advanced breakdowns', 'Shareable coach reports', 'Everything in Pro'],
      cta: 'Go Elite',
      highlighted: false,
    },
  ];

  return (
    <div style={{ background: '#080a0f', minHeight: '100vh', color: '#fff', fontFamily: 'Inter, sans-serif' }}>

      {/* Nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 48px', borderBottom: '1px solid #1a1d2e' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '22px' }}>🏀</span>
          <span style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '-0.5px' }}>
            COURT<span style={{ color: '#ff6b00' }}>IQ</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <a href="#how-it-works" style={{ color: '#888', fontSize: '14px', fontWeight: '600', textDecoration: 'none' }}>How It Works</a>
          <a href="#pricing" style={{ color: '#888', fontSize: '14px', fontWeight: '600', textDecoration: 'none' }}>Pricing</a>
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
      <div style={{ textAlign: 'center', padding: '120px 48px 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(255,107,0,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ display: 'inline-block', background: 'rgba(255,107,0,0.1)', border: '1px solid rgba(255,107,0,0.2)', borderRadius: '20px', padding: '6px 16px', fontSize: '12px', fontWeight: '700', color: '#ff6b00', letterSpacing: '1px', marginBottom: '28px', textTransform: 'uppercase' }}>
          AI-Powered Film Analysis
        </div>
        <h1 style={{ fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: '900', letterSpacing: '-3px', lineHeight: '1.05', marginBottom: '24px', position: 'relative' }}>
          Your personal coach<br />
          <span style={{ color: '#ff6b00' }}>is watching film.</span>
        </h1>
        <p style={{ fontSize: '18px', color: '#666', maxWidth: '520px', margin: '0 auto 44px', lineHeight: '1.7' }}>
          Upload your game film and get elite-level breakdowns — positioning, decision making, shot quality, and a personalized plan to improve.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/auth?signup=true')}
            className="upload-btn"
            style={{ fontSize: '16px', padding: '18px 40px' }}
          >
            Start Analyzing Free
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '64px', padding: '48px', borderTop: '1px solid #1a1d2e', borderBottom: '1px solid #1a1d2e', flexWrap: 'wrap' }}>
        {[
          ['GPT-4o', 'Vision AI'],
          ['270+', 'Brain entries'],
          ['10+', 'Play types'],
          ['A–F', 'Graded plays'],
        ].map(([val, label]) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '36px', fontWeight: '900', color: '#ff6b00', letterSpacing: '-1px' }}>{val}</div>
            <div style={{ fontSize: '13px', color: '#555', fontWeight: '600', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* How It Works */}
      <div id="how-it-works" style={{ padding: '100px 48px', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#ff6b00', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>How It Works</div>
          <h2 style={{ fontSize: '36px', fontWeight: '900', letterSpacing: '-1.5px', textTransform: 'none', color: '#fff' }}>
            Three steps to better basketball
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {steps.map(s => (
            <div key={s.num} style={{ background: '#0f1117', border: '1px solid #1a1d2e', borderRadius: '16px', padding: '32px', position: 'relative' }}>
              <div style={{ fontSize: '48px', fontWeight: '900', color: 'rgba(255,107,0,0.15)', position: 'absolute', top: '16px', right: '20px', letterSpacing: '-2px' }}>{s.num}</div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#fff', marginBottom: '10px', marginTop: '8px' }}>{s.title}</div>
              <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.7' }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div style={{ padding: '80px 48px', borderTop: '1px solid #1a1d2e' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#ff6b00', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>Features</div>
          <h2 style={{ fontSize: '36px', fontWeight: '900', letterSpacing: '-1.5px', textTransform: 'none', color: '#fff' }}>
            Everything you need to level up
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', maxWidth: '1000px', margin: '0 auto' }}>
          {features.map(f => (
            <div key={f.title} style={{ background: '#0f1117', border: '1px solid #1a1d2e', borderRadius: '16px', padding: '28px', transition: 'border-color 0.2s', cursor: 'default' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#ff6b00'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#1a1d2e'}
            >
              <div style={{ fontSize: '32px', marginBottom: '14px' }}>{f.icon}</div>
              <div style={{ fontSize: '16px', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>{f.title}</div>
              <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.7' }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div id="pricing" style={{ padding: '100px 48px', borderTop: '1px solid #1a1d2e' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#ff6b00', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>Pricing</div>
          <h2 style={{ fontSize: '36px', fontWeight: '900', letterSpacing: '-1.5px', textTransform: 'none', color: '#fff' }}>
            Pick your plan
          </h2>
          <p style={{ color: '#555', fontSize: '16px', marginTop: '12px' }}>Start free. Upgrade when you're ready.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', maxWidth: '900px', margin: '0 auto' }}>
          {plans.map(plan => (
            <div key={plan.name} style={{
              background: plan.highlighted ? 'linear-gradient(135deg, #1a1000 0%, #0f1117 100%)' : '#0f1117',
              border: plan.highlighted ? '1px solid #ff6b00' : '1px solid #1a1d2e',
              borderRadius: '20px',
              padding: '36px',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
            }}>
              {plan.highlighted && (
                <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#ff6b00', color: '#fff', fontSize: '11px', fontWeight: '700', padding: '4px 16px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Most Popular
                </div>
              )}
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#ff6b00', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>{plan.name}</div>
              <div style={{ marginBottom: '4px' }}>
                <span style={{ fontSize: '44px', fontWeight: '900', color: '#fff', letterSpacing: '-2px' }}>{plan.price}</span>
                <span style={{ fontSize: '16px', color: '#555', fontWeight: '600' }}>{plan.period}</span>
              </div>
              <div style={{ fontSize: '14px', color: '#555', marginBottom: '24px' }}>{plan.desc}</div>
              <div style={{ flex: 1, marginBottom: '24px' }}>
                {plan.features.map(f => (
                  <div key={f} style={{ fontSize: '14px', color: '#aaa', padding: '8px 0', borderBottom: '1px solid #1a1d2e', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#ff6b00', fontSize: '14px' }}>&#10003;</span> {f}
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate('/auth?signup=true')}
                style={{
                  background: plan.highlighted ? '#ff6b00' : 'transparent',
                  border: plan.highlighted ? 'none' : '1px solid #1a1d2e',
                  color: plan.highlighted ? '#fff' : '#888',
                  padding: '14px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  transition: 'all 0.2s',
                  width: '100%',
                }}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div style={{ textAlign: 'center', padding: '100px 48px', borderTop: '1px solid #1a1d2e', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(255,107,0,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <h2 style={{ fontSize: '40px', fontWeight: '900', letterSpacing: '-1.5px', marginBottom: '16px', textTransform: 'none', color: '#fff', position: 'relative' }}>
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
      <div style={{ textAlign: 'center', padding: '28px', borderTop: '1px solid #1a1d2e', color: '#333', fontSize: '13px' }}>
        © 2026 CourtIQ · AI Film Analysis
      </div>
    </div>
  );
}

export default Landing;
