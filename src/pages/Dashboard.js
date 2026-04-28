import React from 'react';
import logo from '../assets/logo.jpeg.jpeg';

function Dashboard({ user, navigate, t, currentTime, oreKes }) {
  const isAdmin = user?.role === 'Admin';
  const ore = oreKes ? oreKes[user?.branch] : null;

  const statsAdmin = [
    { label: 'Total Depo Jounen', value: 'HTG 0.00', icon: '💰', color: '#1a5c2a' },
    { label: 'Total Retrè', value: 'HTG 0.00', icon: '💸', color: '#e74c3c' },
    { label: 'Pre Aktif', value: '2', icon: '📋', color: '#f39c12' },
    { label: 'Total Kliyan', value: '3', icon: '👥', color: '#3498db' },
    { label: 'Benefis Net', value: 'HTG 0.00', icon: '📈', color: '#9b59b6' },
  ];

  const statsKesye = [
    { label: 'Total Depo Jounen', value: 'HTG 0.00', icon: '💰', color: '#1a5c2a' },
    { label: 'Total Retrè', value: 'HTG 0.00', icon: '💸', color: '#e74c3c' },
    { label: 'Pre Aktif', value: '2', icon: '📋', color: '#f39c12' },
    { label: 'Total Kliyan', value: '3', icon: '👥', color: '#3498db' },
  ];

  const stats = isAdmin ? statsAdmin : statsKesye;

  const actionsAdmin = [
    { label: 'Depo', icon: '💰', page: 'transactions', color: '#1a5c2a' },
    { label: 'Retre', icon: '💸', page: 'transactions', color: '#e74c3c' },
    { label: 'Transfe', icon: '🔄', page: 'transactions', color: '#3498db' },
    { label: 'Nouvo Kliyan', icon: '👤', page: 'clients', color: '#2ecc71' },
    { label: 'Kreye Pre', icon: '📋', page: 'loans', color: '#f39c12' },
    { label: 'Rapo Jounen', icon: '📊', page: 'reports', color: '#9b59b6' },
    { label: 'Jere Ekip', icon: '👥', page: 'team', color: '#1a5c2a' },
    { label: 'Jere Branch', icon: '🏦', page: 'settings', color: '#34495e' },
  ];

  const actionsKesye = [
    { label: 'Depo', icon: '💰', page: 'transactions', color: '#1a5c2a' },
    { label: 'Retre', icon: '💸', page: 'transactions', color: '#e74c3c' },
    { label: 'Transfe', icon: '🔄', page: 'transactions', color: '#3498db' },
    { label: 'Nouvo Kliyan', icon: '👤', page: 'clients', color: '#2ecc71' },
    { label: 'Rapo Jounen', icon: '📊', page: 'reports', color: '#9b59b6' },
  ];

  const actions = isAdmin ? actionsAdmin : actionsKesye;

  return (
    <div style={{ padding: '20px', fontFamily: 'Segoe UI, sans-serif' }}>

      {/* HEADER */}
      <div style={{ background: 'linear-gradient(135deg, #1a5c2a, #2d8a45)', borderRadius: '14px', padding: '20px 25px', marginBottom: '20px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>Tableau de Bord</h1>
          <p style={{ margin: '4px 0 0', opacity: 0.85, fontSize: '13px' }}>Byenveni, {user?.name}</p>
          <p style={{ margin: '3px 0 0', opacity: 0.75, fontSize: '12px' }}>
            {new Date().toLocaleDateString('fr-HT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <img src={logo} alt="GKP" style={{ width: '120px', height: '120px', borderRadius: '12px', objectFit: 'contain', background: 'white', padding: '5px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }} />

        <div style={{ background: 'rgba(255,255,255,0.15)', padding: '15px 25px', borderRadius: '12px', textAlign: 'center', minWidth: '180px' }}>
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#c9a84c', marginBottom: '4px' }}>
            {user?.role === 'Admin' ? '👑 ADMIN' : '💼 KESYE'}
          </div>
          <div style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.9)', marginBottom: '8px' }}>
            {user?.branch}
          </div>
          <div style={{ fontSize: '28px', fontWeight: '900', color: 'white', lineHeight: 1, marginBottom: '6px' }}>
            {currentTime}
          </div>
          {ore && (
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', fontWeight: '600' }}>
              {ore.louvri} - {ore.femen}
            </div>
          )}
        </div>
      </div>

      {/* STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: isAdmin ? 'repeat(5, 1fr)' : 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {stats.map((stat, i) => (
          <div key={i} style={{ background: 'white', borderRadius: '12px', padding: '15px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', borderTop: '3px solid ' + stat.color }}>
            <div style={{ fontSize: '22px', marginBottom: '6px' }}>{stat.icon}</div>
            <div style={{ fontSize: '15px', fontWeight: '800', color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: '10px', color: '#666', marginTop: '3px' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* AKSYON RAPID */}
      <div style={{ background: 'white', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', marginBottom: '20px' }}>
        <h2 style={{ margin: '0 0 15px', color: '#1a5c2a', fontSize: '14px', fontWeight: '700' }}>⚡ Aksyon Rapid</h2>
        <div style={{ display: 'grid', gridTemplateColumns: isAdmin ? 'repeat(4, 1fr)' : 'repeat(5, 1fr)', gap: '10px' }}>
          {actions.map((action, i) => (
            <button key={i} onClick={() => navigate(action.page)}
              style={{ background: action.color + '15', border: '1px solid ' + action.color + '30', borderRadius: '10px', padding: '12px 8px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: '22px', marginBottom: '5px' }}>{action.icon}</div>
              <div style={{ fontSize: '11px', fontWeight: '600', color: action.color }}>{action.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* BAS — Tranzaksyon + Balans */}
      <div style={{ display: 'grid', gridTemplateColumns: isAdmin ? '1fr 320px' : '1fr', gap: '15px' }}>

        {/* DÈNYE TRANZAKSYON */}
        <div style={{ background: 'white', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
          <h2 style={{ margin: '0 0 15px', color: '#1a5c2a', fontSize: '14px', fontWeight: '700' }}>🕐 Dènye Tranzaksyon</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(135deg, #1a5c2a, #2d8a45)' }}>
                {['#', 'Kliyan', 'Tip', 'Montan', 'Lè'].map((h, i) => (
                  <th key={i} style={{ padding: '10px 12px', color: 'white', textAlign: 'left', fontSize: '12px', fontWeight: '700' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="5" style={{ padding: '25px', textAlign: 'center', color: '#999', fontSize: '13px' }}>
                  <div style={{ fontSize: '30px', marginBottom: '8px' }}>📭</div>
                  Pa gen tranzaksyon jodi a
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* BALANS KES — ADMIN SELMAN */}
        {isAdmin && (
          <div style={{ background: 'white', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
            <h2 style={{ margin: '0 0 15px', color: '#1a5c2a', fontSize: '14px', fontWeight: '700' }}>💰 Balans Kès</h2>

            <div style={{ background: 'linear-gradient(135deg, #1a5c2a, #2d8a45)', borderRadius: '10px', padding: '15px', marginBottom: '15px', color: 'white', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '5px', fontWeight: '600' }}>Kès Disponib</div>
              <div style={{ fontSize: '22px', fontWeight: '900' }}>HTG 500,000.00</div>
            </div>

            {[
              { label: 'Depo', value: '+HTG 0.00', color: '#2ecc71' },
              { label: 'Retrè', value: '-HTG 0.00', color: '#e74c3c' },
              { label: 'Transfè', value: 'HTG 0.00', color: '#3498db' },
              { label: 'Peman Prè', value: 'HTG 0.00', color: '#e67e22' },
              { label: 'Kòb Bloke', value: 'HTG 1,500.00', color: '#9b59b6' },
              { label: 'Benefis', value: 'HTG 0.00', color: '#f39c12' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                <span style={{ fontSize: '13px', color: '#666' }}>{item.label}</span>
                <span style={{ fontSize: '13px', fontWeight: '800', color: item.color }}>{item.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;