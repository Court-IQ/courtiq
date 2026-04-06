import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    height: '',
    weight: '',
    class_year: '',
    position: '',
    jersey_number: '',
    team_name: '',
  });
  const [usage, setUsage] = useState(null);

  const API_URL = 'https://courtiq-n8wl.onrender.com';

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (data) {
      setProfile({
        full_name: data.full_name || '',
        height: data.height || '',
        weight: data.weight || '',
        class_year: data.class_year || '',
        position: data.position || '',
        jersey_number: data.jersey_number || '',
        team_name: data.team_name || '',
      });
    }

    // Get usage info
    try {
      const res = await fetch(`${API_URL}/api/check-usage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      const usageData = await res.json();
      setUsage(usageData);
    } catch (e) {
      console.error('Usage check failed:', e);
    }

    setLoading(false);
  }

  async function saveProfile() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('profiles').update({
      full_name: profile.full_name,
      height: profile.height,
      weight: profile.weight,
      class_year: profile.class_year,
      position: profile.position,
      jersey_number: profile.jersey_number,
      team_name: profile.team_name,
    }).eq('id', user.id);

    if (error) {
      console.error('Save error:', error);
      alert('Failed to save profile');
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  }

  function handleChange(field, value) {
    setProfile(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  const input = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    background: '#f5f6f8',
    color: '#111827',
    fontSize: '14px',
    fontFamily: 'Inter, sans-serif',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  const label = {
    fontSize: '11px',
    fontWeight: '700',
    color: '#555',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    marginBottom: '6px',
    display: 'block',
  };

  const section = {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
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
    marginBottom: '20px',
  };

  if (loading) {
    return (
      <div className="main">
        <div style={{ color: '#555', padding: '40px' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="main">
      <div className="top-bar">
        <div>
          <h1>Profile</h1>
          <p>Your player info and account settings</p>
        </div>
        <button
          className="upload-btn"
          onClick={saveProfile}
          disabled={saving}
          style={{ opacity: saving ? 0.6 : 1 }}
        >
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div style={{ maxWidth: '680px' }}>

        {/* Player Info */}
        <div style={section}>
          <div style={sectionTitle}>Player Info</div>
          <div style={{ marginBottom: '14px' }}>
            <span style={label}>Full Name</span>
            <input
              type="text"
              placeholder="Your name"
              value={profile.full_name}
              onChange={e => handleChange('full_name', e.target.value)}
              style={input}
              onFocus={e => e.target.style.borderColor = '#ff6b00'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
            <div style={{ flex: 1 }}>
              <span style={label}>Height</span>
              <input
                type="text"
                placeholder="6'2&quot;"
                value={profile.height}
                onChange={e => handleChange('height', e.target.value)}
                style={input}
                onFocus={e => e.target.style.borderColor = '#ff6b00'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
            <div style={{ flex: 1 }}>
              <span style={label}>Weight</span>
              <input
                type="text"
                placeholder="185 lbs"
                value={profile.weight}
                onChange={e => handleChange('weight', e.target.value)}
                style={input}
                onFocus={e => e.target.style.borderColor = '#ff6b00'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <span style={label}>Jersey Number</span>
              <input
                type="text"
                placeholder="#23"
                value={profile.jersey_number}
                onChange={e => handleChange('jersey_number', e.target.value)}
                style={input}
                onFocus={e => e.target.style.borderColor = '#ff6b00'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
            <div style={{ flex: 1 }}>
              <span style={label}>Position</span>
              <select
                value={profile.position}
                onChange={e => handleChange('position', e.target.value)}
                style={{ ...input, cursor: 'pointer' }}
              >
                <option value="">Select position</option>
                <option value="point guard">Point Guard</option>
                <option value="shooting guard">Shooting Guard</option>
                <option value="small forward">Small Forward</option>
                <option value="power forward">Power Forward</option>
                <option value="center">Center</option>
              </select>
            </div>
          </div>
        </div>

        {/* Team Info */}
        <div style={section}>
          <div style={sectionTitle}>Team Info</div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <span style={label}>Team Name</span>
              <input
                type="text"
                placeholder="Eagles Basketball"
                value={profile.team_name}
                onChange={e => handleChange('team_name', e.target.value)}
                style={input}
                onFocus={e => e.target.style.borderColor = '#ff6b00'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
            <div style={{ flex: 1 }}>
              <span style={label}>Class / Year</span>
              <select
                value={profile.class_year}
                onChange={e => handleChange('class_year', e.target.value)}
                style={{ ...input, cursor: 'pointer' }}
              >
                <option value="">Select class</option>
                <option value="freshman">Freshman</option>
                <option value="sophomore">Sophomore</option>
                <option value="junior">Junior</option>
                <option value="senior">Senior</option>
                <option value="college">College</option>
                <option value="adult">Adult / Rec League</option>
              </select>
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div style={section}>
          <div style={sectionTitle}>Account</div>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Usage</div>
            <div style={{ fontSize: '13px', color: '#555', marginTop: '2px' }}>
              {usage ? `${usage.used} analyses used this month` : 'Loading...'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
