import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const steps = [
  {
    icon: '🏀',
    title: 'Welcome to CourtIQ',
    desc: 'Your AI-powered basketball coach. Upload game film, get detailed analysis, and improve your game — possession by possession.',
  },
  {
    icon: '🎬',
    title: 'Upload Your Film',
    desc: 'Record a game, a quarter, or even a single play. Upload the video and CourtIQ will split it into segments automatically.',
  },
  {
    icon: '🏷️',
    title: 'Tag Your Plays',
    desc: 'Preview each segment and tag it with the play type — pick and roll, drive, post move, three pointer, and more. Skip the dead ball time.',
  },
  {
    icon: '🧠',
    title: 'Get AI Analysis',
    desc: 'CourtIQ grades every play on shot quality, decision making, and positioning. You get specific coaching tips, drills, and habits to work on.',
  },
  {
    icon: '💬',
    title: 'Talk to Your AI Coach',
    desc: 'Ask the AI Coach questions about your game. It knows your full analysis history and can spot patterns across all your sessions.',
  },
];

export default function Onboarding({ onComplete }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const current = steps[step];
  const isLast = step === steps.length - 1;

  function handleNext() {
    if (isLast) {
      onComplete();
      navigate('/upload');
    } else {
      setStep(step + 1);
    }
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.85)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        background: '#0f1117', border: '1px solid #1a1d2e', borderRadius: '24px',
        padding: '48px 40px', maxWidth: '440px', width: '100%', textAlign: 'center',
      }}>
        <div style={{ fontSize: '56px', marginBottom: '20px' }}>{current.icon}</div>
        <h2 style={{
          fontSize: '24px', fontWeight: '900', color: '#fff',
          marginBottom: '12px', letterSpacing: '-0.5px', textTransform: 'none',
        }}>
          {current.title}
        </h2>
        <p style={{
          color: '#888', fontSize: '15px', lineHeight: '1.7', marginBottom: '32px',
        }}>
          {current.desc}
        </p>

        {/* Progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '28px' }}>
          {steps.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === step ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: i === step ? '#ff6b00' : '#1a1d2e',
                transition: 'all 0.3s',
              }}
            />
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              style={{
                flex: 1, padding: '14px', borderRadius: '10px', cursor: 'pointer',
                border: '1px solid #1a1d2e', background: 'transparent',
                color: '#888', fontWeight: '700', fontSize: '14px',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            className="upload-btn"
            style={{ flex: 1, margin: 0 }}
          >
            {isLast ? 'Get Started' : 'Next'}
          </button>
        </div>

        {step === 0 && (
          <button
            onClick={() => { onComplete(); }}
            style={{
              marginTop: '16px', background: 'none', border: 'none',
              color: '#555', fontSize: '13px', cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Skip intro
          </button>
        )}
      </div>
    </div>
  );
}
