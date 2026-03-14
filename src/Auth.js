import React, { useState } from 'react';
import { supabase } from './supabase';

function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="logo">
          <span className="logo-icon">🏀</span>
          <div>
            <div className="logo-title">CourtIQ</div>
            <div className="logo-sub">AI FILM ANALYSIS</div>
          </div>
        </div>
        <h2>{isLogin ? 'Sign In' : 'Create Account'}</h2>
        {error && <div className="auth-error">{error}</div>}
        <input className="auth-input" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="auth-input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        <button className="upload-btn" onClick={handleSubmit}>{isLogin ? 'Sign In' : 'Sign Up'}</button>
        <p className="auth-switch" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
        </p>
      </div>
    </div>
  );
}

export default Auth;