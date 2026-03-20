import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';

const CONVERSATION_ID = crypto.randomUUID();

function Chat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hey! I'm your AI coach. Ask me anything about your game — I can see all your past analyses and help you improve. What do you want to work on?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function saveMessage(role, text) {
    if (!userId) return;
    await supabase.from('messages').insert([{
      user_id: userId,
      role,
      text,
      conversation_id: CONVERSATION_ID
    }]);
  }

  async function sendMessage() {
    if (!input.trim()) return;
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    await saveMessage('user', userMessage);
    setLoading(true);

    try {
      const { data: analyses } = await supabase
        .from('analyses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      const response = await fetch('https://tranquil-nourishment-production-4ff8.up.railway.app/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, analyses })
      });

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', text: data.reply }]);
      await saveMessage('assistant', data.reply);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, something went wrong. Try again!' }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="main" style={{ display: 'flex', flexDirection: 'column', height: '90vh' }}>
      <div className="top-bar">
        <div>
          <h1>AI Coach</h1>
          <p>Ask your personal basketball coach anything</p>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
          }}>
            <div style={{
              maxWidth: '75%',
              padding: '12px 16px',
              borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              background: msg.role === 'user' ? '#e85d24' : msg.role === 'coach' ? '#2a5c2a' : '#1a1d27',
              color: 'white',
              fontSize: '15px',
              lineHeight: '1.5'
            }}>
              {msg.role === 'coach' && <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginBottom: '4px' }}>👨‍🏫 CourtIQ Coach</div>}
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ background: '#1a1d27', padding: '12px 16px', borderRadius: '18px 18px 18px 4px', color: '#888' }}>
              Coaching...⏳
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <input
          type="text"
          placeholder="Ask your coach anything..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            flex: 1,
            padding: '14px 18px',
            borderRadius: '12px',
            border: '1px solid #333',
            background: '#1a1d27',
            color: 'white',
            fontSize: '15px'
          }}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="upload-btn"
          style={{ padding: '14px 24px', opacity: loading ? 0.6 : 1 }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default Chat;