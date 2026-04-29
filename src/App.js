import React, { useState, useEffect } from 'react';
import './App.css';
import logo from './assets/logo.jpeg.jpeg';
import lang from './lang';
import { supabase } from './supabase';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Transactions from './pages/Transactions';
import Loans from './pages/Loans';
import Reports from './pages/Reports';
import Team from './pages/Team';
import Settings from './pages/Settings';
import ExchangeRate from './pages/ExchangeRate';

const initialBranches = [
  { id: 1, nom: 'Branch Potoprens', adres: 'Delmas 33, Potoprens', telefon: '509-2222-3333', responsab: 'Marie Kesye', status: 'Aktif' },
  { id: 2, nom: 'Branch Kapo', adres: 'Kapo Vil, No', telefon: '509-4444-5555', responsab: 'jude', status: 'Aktif' },
  { id: 3, nom: 'Siege Central', adres: 'Potoprens, HT', telefon: '509-1111-2222', responsab: 'Administrateur', status: 'Aktif' },
];

const initialOreKes = {
  'Branch Potoprens': { louvri: '07:00', femen: '20:00', aktif: true, jou: [true,true,true,true,true,true,true] },
  'Branch Kapo': { louvri: '07:00', femen: '20:00', aktif: true, jou: [true,true,true,true,true,true,true] },
  'Siege Central': { louvri: '07:00', femen: '20:00', aktif: true, jou: [true,true,true,true,true,true,true] },
};

const langFlags = {
  ht: 'Kreyol',
  fr: 'Francais',
  en: 'English',
  es: 'Espanol',
  pt: 'Portugues',
};

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);
  const [currentLang, setCurrentLang] = useState('ht');
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState(initialBranches);
  const [oreKes, setOreKes] = useState(initialOreKes);
  const [currentTime, setCurrentTime] = useState('');
  const [freTransf, setFreTransf] = useState({ enten: 50, branch: 150 });

  const t = lang[currentLang];

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      setCurrentTime(String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0'));
    };
    checkTime();
    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data } = await supabase.from('itilizate').select('*');
    setUsers(data || []);
  };

  const isBranchOpen = (branchName) => {
    const ore = oreKes[branchName];
    if (!ore || !ore.aktif) return false;
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const current = h * 60 + m;
    const [lh, lm] = ore.louvri.split(':').map(Number);
    const [fh, fm] = ore.femen.split(':').map(Number);
    const louvri = lh * 60 + lm;
    const femen = fh * 60 + fm;
    const jouMap = [6,0,1,2,3,4,5];
    const jouIndex = jouMap[now.getDay()];
    const jouOuve = ore.jou ? ore.jou[jouIndex] : true;
    return jouOuve && current >= louvri && current < femen;
  };

  const handleLogin = async (userData) => {
    const { data, error } = await supabase
      .from('itilizate')
      .select('*')
      .eq('name', userData.name)
      .eq('password', userData.password)
      .single();

    if (error || !data) {
      alert('Non oswa modpas enkòrèk!');
      return;
    }

    if (data.blocked) {
      alert('Kont ou bloke! Kontakte administrateur.');
      return;
    }

    if (data.role !== 'Admin' && !isBranchOpen(data.branch)) {
      const ore = oreKes[data.branch];
      alert('Kes ' + data.branch + ' femen!\nOre: ' + (ore?.louvri || '07:00') + ' - ' + (ore?.femen || '20:00'));
      return;
    }

    setUser(data);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('login');
  };

  const navigate = (page) => setCurrentPage(page);

  if (currentPage === 'login') {
    return (
      <Login
        onLogin={handleLogin}
        users={users}
        currentLang={currentLang}
        setCurrentLang={setCurrentLang}
        langFlags={langFlags}
        t={t}
        oreKes={oreKes}
        isBranchOpen={isBranchOpen}
      />
    );
  }

  return (
    <div className="app">
      <Sidebar
        user={user}
        currentPage={currentPage}
        navigate={navigate}
        onLogout={handleLogout}
        currentLang={currentLang}
        setCurrentLang={setCurrentLang}
        langFlags={langFlags}
        t={t}
        currentTime={currentTime}
        oreKes={oreKes}
        isBranchOpen={isBranchOpen}
      />
      <main className="main-content">
        {currentPage === 'dashboard' && <Dashboard user={user} navigate={navigate} t={t} currentTime={currentTime} oreKes={oreKes} />}
        {currentPage === 'clients' && user.role === 'Admin' && <Clients user={user} t={t} />}
        {currentPage === 'clients' && user.role === 'Kesye' && <Clients user={user} t={t} kesyeOnly={true} />}
        {currentPage === 'transactions' && <Transactions user={user} t={t} freTransf={freTransf} />}
        {currentPage === 'loans' && <Loans user={user} t={t} />}
        {currentPage === 'reports' && <Reports user={user} t={t} />}
        {currentPage === 'team' && user.role === 'Admin' && <Team user={user} t={t} />}
        {currentPage === 'team' && user.role !== 'Admin' && <AccessDenied />}
        {currentPage === 'exchange' && <ExchangeRate user={user} />}
        {currentPage === 'settings' && user.role === 'Admin' && (
          <Settings
            user={user}
            users={users}
            setUsers={setUsers}
            branches={branches}
            setBranches={setBranches}
            oreKes={oreKes}
            setOreKes={setOreKes}
            freTransf={freTransf}
            setFreTransf={setFreTransf}
          />
        )}
        {currentPage === 'settings' && user.role !== 'Admin' && (
          <KesyeInfo freTransf={freTransf} oreKes={oreKes} user={user} />
        )}
      </main>
    </div>
  );
}

function AccessDenied() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', fontFamily: 'Segoe UI, sans-serif' }}>
      <div style={{ fontSize: '60px', marginBottom: '20px' }}>🔒</div>
      <h2 style={{ color: '#e74c3c', fontSize: '24px', margin: '0 0 10px' }}>Acces Refize</h2>
      <p style={{ color: '#666', fontSize: '14px' }}>Ou pa gen pemisyon pou we paj sa a.</p>
    </div>
  );
}

function KesyeInfo({ freTransf, oreKes, user }) {
  const ore = oreKes[user?.branch] || { louvri: '07:00', femen: '20:00' };
  return (
    <div style={{ padding: '30px', fontFamily: 'Segoe UI, sans-serif' }}>
      <h1 style={{ margin: '0 0 25px', color: '#1a5c2a', fontSize: '24px', fontWeight: '800' }}>Enfòmasyon Sistèm</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
          <h3 style={{ margin: '0 0 20px', color: '#1a5c2a', fontSize: '16px', fontWeight: '700' }}>Fre ak Chaj</h3>
          {[
            { label: 'Fre Ouveti Kont', value: 'HTG 300', icon: '💳' },
            { label: 'Reserve Bloke pa Kont', value: 'HTG 500', icon: '🔒' },
            { label: 'Fre Transfe Enten', value: 'HTG ' + (freTransf?.enten || 50), icon: '🔄' },
            { label: 'Fre Transfe Branch-Branch', value: 'HTG ' + (freTransf?.branch || 150), icon: '🏦' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                <span style={{ color: '#555', fontSize: '14px' }}>{item.label}</span>
              </div>
              <span style={{ fontWeight: '800', color: '#1a5c2a', background: '#e8f5e9', padding: '4px 12px', borderRadius: '8px', fontSize: '13px' }}>{item.value}</span>
            </div>
          ))}
        </div>
        <div style={{ background: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
          <h3 style={{ margin: '0 0 20px', color: '#1a5c2a', fontSize: '16px', fontWeight: '700' }}>Ore Travay — {user?.branch}</h3>
          {[
            { label: 'Jou Travay', value: 'Lendi — Dimanch', icon: '📅' },
            { label: 'Louveti', value: ore.louvri, icon: '🌅' },
            { label: 'Femti', value: ore.femen, icon: '🌙' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                <span style={{ color: '#555', fontSize: '14px' }}>{item.label}</span>
              </div>
              <span style={{ fontWeight: '800', color: '#3498db', background: '#ebf5fb', padding: '4px 12px', borderRadius: '8px', fontSize: '13px' }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Sidebar({ user, currentPage, navigate, onLogout, currentLang, setCurrentLang, langFlags, t, currentTime, oreKes, isBranchOpen }) {
  const [showLang, setShowLang] = useState(false);
  const isOpen = isBranchOpen(user?.branch);

  const adminMenu = [
    { id: 'dashboard', label: t.dashboard, icon: '📊' },
    { id: 'clients', label: t.clients, icon: '👥' },
    { id: 'transactions', label: t.transactions, icon: '💰' },
    { id: 'loans', label: t.loans, icon: '📋' },
    { id: 'reports', label: t.reports, icon: '📈' },
    { id: 'exchange', label: 'To Dechanj', icon: '💱' },
    { id: 'team', label: t.team, icon: '👤' },
    { id: 'settings', label: 'Paramèt', icon: '⚙️' },
  ];

  const kesyeMenu = [
    { id: 'dashboard', label: t.dashboard, icon: '📊' },
    { id: 'clients', label: t.clients, icon: '👥' },
    { id: 'transactions', label: t.transactions, icon: '💰' },
    { id: 'loans', label: t.loans, icon: '📋' },
    { id: 'reports', label: t.reports, icon: '📈' },
    { id: 'exchange', label: 'To Dechanj', icon: '💱' },
    { id: 'settings', label: 'Enfòmasyon', icon: 'ℹ️' },
  ];

  const menuItems = user?.role === 'Admin' ? adminMenu : kesyeMenu;

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src={logo} alt="GKP" style={{ width: '45px', height: '45px', borderRadius: '8px', objectFit: 'contain', background: 'white', padding: '2px' }} />
        <div>
          <div className="logo-title">Global Kes Pam</div>
          <div className="logo-sub">GKP Banking System</div>
        </div>
      </div>

      {user?.role !== 'Admin' && (
        <div style={{ margin: '0 12px 8px', padding: '8px 12px', background: 'rgba(52,152,219,0.2)', borderRadius: '8px', textAlign: 'center' }}>
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#3498db', textTransform: 'uppercase' }}>💼 Kesye</span>
          <div style={{ fontSize: '11px', fontWeight: '700', color: isOpen ? '#2ecc71' : '#e74c3c', marginTop: '4px' }}>
            {isOpen ? '✅ Kes Louvri' : '🔒 Kes Femen'}
          </div>
        </div>
      )}

      <div style={{ margin: '0 12px 8px', position: 'relative' }}>
        <button onClick={() => setShowLang(!showLang)} style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: '600', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{langFlags[currentLang]}</span>
          <span>{showLang ? '▲' : '▼'}</span>
        </button>
        {showLang && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', borderRadius: '8px', boxShadow: '0 8px 25px rgba(0,0,0,0.2)', zIndex: 100, overflow: 'hidden', marginTop: '4px' }}>
            {Object.entries(langFlags).map(([code, label]) => (
              <button key={code} onClick={() => { setCurrentLang(code); setShowLang(false); }} style={{ width: '100%', padding: '10px 15px', border: 'none', background: currentLang === code ? '#e8f5e9' : 'white', cursor: 'pointer', fontSize: '13px', fontWeight: currentLang === code ? '700' : '400', color: currentLang === code ? '#1a5c2a' : '#333', textAlign: 'left' }}>
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <button key={item.id}
            className={'nav-item' + (currentPage === item.id ? ' active' : '')}
            onClick={() => navigate(item.id)}
            style={item.id === 'settings' && currentPage !== 'settings' ? { color: '#c9a84c' } : {}}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">{user?.name?.charAt(0) || 'A'}</div>
          <div>
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{user?.role}</div>
          </div>
        </div>
        <button className="logout-btn" onClick={onLogout}>{t.logout}</button>
      </div>
    </aside>
  );
}

export default App;