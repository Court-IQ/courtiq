import { useState } from 'react';
import { supabase } from './supabase';

function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="auth-container">
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏀</div>
          <div style={{ fontSize: '32px', fontWeight: '900', color: '#ffffff', letterSpacing: '-1px' }}>CourtIQ</div>
          <div style={{ fontSize: '11px', color: '#555', letterSpacing: '3px', fontWeight: '700', marginTop: '4px' }}>AI FILM ANALYSIS</div>
        </div>

        <div className="auth-box">
          <div style={{ marginBottom: '8px' }}>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#fff' }}>
              {isLogin ? 'Welcome back' : 'Create account'}
            </div>
            <div style={{ fontSize: '13px', color: '#555', marginTop: '4px' }}>
              {isLogin ? 'Sign in to your account' : 'Start analyzing your game'}
            </div>
          </div>

          {error && (
            <div style={{
              background: '#2a0a0a', border: '1px solid #ff4444', borderRadius: '8px',
              padding: '10px 14px', color: '#ff4444', fontSize: '13px', fontWeight: '500'
            }}>
              {error}
            </div>
          )}

          <input
            className="auth-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <input
            className="auth-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <button
            className="upload-btn"
            onClick={handleSubmit}
            disabled={loading}
            style={{ width: '100%', opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>

          <p className="auth-switch" onClick={() => { setIsLogin(!isLogin); setError(''); }}>
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Auth;
