import React, { useState } from 'react';
import logo from '../assets/logo.jpeg.jpeg';

function Login({ onLogin, users, currentLang, setCurrentLang, langFlags, t }) {
  const [selectedUser, setSelectedUser] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [blocked, setBlocked] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const startBlockTimer = () => {
    setBlocked(true);
    setCountdown(30);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setBlocked(false);
          setAttempts(0);
          setError('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleLogin = () => {
    if (blocked) return;
    const found = users.find(u => u.name === selectedUser && u.password === password);
    if (found) {
      setAttempts(0);
      onLogin(found);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 3) {
        setError('Kont ou bloke pou 30 segond!');
        startBlockTimer();
      } else {
        setError('Modpas enkòrèk! Tantativ ' + newAttempts + '/3');
      }
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a5c2a 0%, #0d3518 50%, #1a5c2a 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Segoe UI, sans-serif'
    }}>
      <div style={{ background: 'white', borderRadius: '24px', padding: '50px 40px', width: '420px', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>

    

        {/* LOGO */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <img src={logo} alt="GKP" style={{ width: '110px', height: '110px', objectFit: 'contain', borderRadius: '16px' }} />
          <h1 style={{ color: '#1a5c2a', fontSize: '26px', fontWeight: '800', margin: '12px 0 4px' }}>
            Global Kès Pam
          </h1>
          <p style={{ color: '#888', fontSize: '13px', margin: 0 }}>
            Sistèm Bancaire Pwofesyonèl — GKP
          </p>
        </div>

        {/* BLOCKED */}
        {blocked && (
          <div style={{ background: '#fff3e0', border: '2px solid #f39c12', borderRadius: '10px', padding: '15px', textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ fontSize: '28px' }}>🔒</div>
            <div style={{ color: '#e67e22', fontWeight: '700' }}>Kont bloke!</div>
            <div style={{ color: '#e67e22', fontSize: '13px' }}>Tann {countdown} segond...</div>
          </div>
        )}

        {/* DROPDOWN ITILIZATÈ */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', color: '#555', fontWeight: '700', marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            NON ITILIZATÈ
          </label>
          <select
            value={selectedUser}
            onChange={e => { setSelectedUser(e.target.value); setError(''); }}
            disabled={blocked}
            style={{ width: '100%', padding: '14px 16px', border: '2px solid #e0e0e0', borderRadius: '10px', fontSize: '15px', outline: 'none', boxSizing: 'border-box', background: 'white', cursor: 'pointer' }}
          >
            <option value="">Chwazi itilizatè...</option>
            {users.map((u, i) => (
              <option key={i} value={u.name}>{u.name}</option>
            ))}
          </select>
        </div>

        {/* MODPAS */}
        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', color: '#555', fontWeight: '700', marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            MODPAS
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              onKeyPress={e => e.key === 'Enter' && handleLogin()}
              placeholder="••••••••"
              disabled={blocked}
              style={{ width: '100%', padding: '14px 50px 14px 16px', border: '2px solid #e0e0e0', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
            />
            <button onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        {/* TENTATIV */}
        {attempts > 0 && !blocked && (
          <div style={{ background: '#fff3e0', color: '#e67e22', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '13px', textAlign: 'center', border: '1px solid #f39c12' }}>
            ⚠️ Tantativ {attempts}/3 — {3 - attempts} chans ki rete
          </div>
        )}

        {/* ERROR */}
        {error && !blocked && (
          <div style={{ background: '#fdf2f2', color: '#c0392b', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', textAlign: 'center', border: '1px solid #fcc' }}>
            ⚠️ {error}
          </div>
        )}

        {/* BOUTON */}
        <button
          onClick={handleLogin}
          disabled={blocked || !selectedUser}
          style={{
            width: '100%', padding: '15px',
            background: blocked || !selectedUser ? '#ccc' : 'linear-gradient(135deg, #1a5c2a, #2d8a45)',
            color: 'white', border: 'none', borderRadius: '10px',
            fontSize: '16px', fontWeight: '700',
            cursor: blocked || !selectedUser ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}
        >
          {blocked ? '🔒 Kont Bloke...' : '🔑 Konekte'}
        </button>

        <div style={{ textAlign: 'center', marginTop: '20px', color: '#bbb', fontSize: '12px' }}>
          
        </div>
      </div>
    </div>
  );
}

export default Login;