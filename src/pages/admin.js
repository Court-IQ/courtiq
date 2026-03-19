import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

const ADMIN_ID = '4b1e31f7-6366-440b-896f-ef858d9fdec2';

function Admin() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdmin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function checkAdmin() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== ADMIN_ID) {
      navigate('/');
      return;
    }
    fetchConversations();
  }

  async function fetchConversations() {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) console.error(error);
    else {
      const grouped = {};
      data.forEach(msg => {
        if (!grouped[msg.conversation_id]) {
          grouped[msg.conversation_id] = {
            conversation_id: msg.conversation_id,
            user_id: msg.user_id,
            messages: [],
            lastMessage: msg.text,
            lastTime: msg.created_at
          };
        }
        grouped[msg.conversation_id].messages.push(msg);
      });
      setConversations(Object.values(grouped));
    }
    setLoading(false);
  }

  function selectConversation(convo) {
    setSelected(convo);
    setMessages(convo.messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)));
  }

  async function sendReply() {
    if (!reply.trim() || !selected) return;
    const { error } = await supabase.from('messages').insert([{
      user_id: selected.user_id,
      role: 'coach',
      text: reply.trim(),
      conversation_id: selected.conversation_id
    }]);
    if (error) console.error(error);
    else {
      setReply('');
      fetchConversations();
      setMessages(prev => [...prev, { role: 'coach', text: reply.trim(), created_at: new Date() }]);
    }
  }

  if (loading) return <div style={{ color: 'white', padding: '40px' }}>Loading...</div>;

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0f1117', color: 'white' }}>
      
      {/* Conversation list */}
      <div style={{ width: '300px', background: '#1a1d27', borderRight: '1px solid #333', overflowY: 'auto' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #333' }}>
          <h2 style={{ margin: 0 }}>🏀 CourtIQ Admin</h2>
          <p style={{ color: '#888', fontSize: '12px', margin: '4px 0 0' }}>{conversations.length} conversations</p>
        </div>
        {conversations.map((convo) => (
          <div
            key={convo.conversation_id}
            onClick={() => selectConversation(convo)}
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid #222',
              cursor: 'pointer',
              background: selected?.conversation_id === convo.conversation_id ? '#2a2d3a' : 'transparent'
            }}
          >
            <div style={{ fontSize: '13px', color: '#888', marginBottom: '4px' }}>
              User: {convo.user_id.slice(0, 8)}...
            </div>
            <div style={{ fontSize: '14px', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {convo.lastMessage}
            </div>
          </div>
        ))}
        {conversations.length === 0 && (
          <p style={{ color: '#888', padding: '20px' }}>No conversations yet.</p>
        )}
      </div>

      {/* Chat panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selected ? (
          <>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #333', background: '#1a1d27' }}>
              <h3 style={{ margin: 0 }}>User: {selected.user_id}</h3>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-start' : 'flex-end' }}>
                  <div style={{
                    maxWidth: '70%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: msg.role === 'user' ? '#2a2d3a' : msg.role === 'coach' ? '#e85d24' : '#1a1d27',
                    color: 'white',
                    fontSize: '14px'
                  }}>
                    <div style={{ fontSize: '11px', color: msg.role === 'coach' ? 'rgba(255,255,255,0.7)' : '#888', marginBottom: '4px' }}>
                      {msg.role === 'user' ? 'Player' : msg.role === 'coach' ? '👨‍🏫 You (Coach)' : '🤖 AI'}
                    </div>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid #333', display: 'flex', gap: '12px' }}>
              <input
                type="text"
                placeholder="Reply as coach..."
                value={reply}
                onChange={e => setReply(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendReply()}
                style={{ flex: 1, padding: '12px 16px', borderRadius: '8px', border: '1px solid #333', background: '#1a1d27', color: 'white', fontSize: '14px' }}
              />
              <button onClick={sendReply} style={{ background: '#e85d24', color: 'white', border: 'none', borderRadius: '8px', padding: '12px 24px', cursor: 'pointer', fontWeight: 'bold' }}>
                Send
              </button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
            Select a conversation to view messages
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;