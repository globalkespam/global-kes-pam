import React, { useState, useEffect } from 'react';
import logo from '../assets/logo.jpeg.jpeg';
import { supabase } from '../supabase';

function Dashboard({ user, navigate, t, currentTime, oreKes }) {
  const isAdmin = user?.role === 'Admin';
  const ore = oreKes ? oreKes[user?.branch] : null;

  const [stats, setStats] = useState({
    totalDepo: 0,
    totalRetre: 0,
    totalTransf: 0,
    totalKliyan: 0,
    preAktif: 0,
    benefis: 0,
    balansKes: 0,
    kobBloke: 0,
    pemaPreTotal: 0,
  });

  const [recentTrans, setRecentTrans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];

    // TRANZAKSYON JOUNEN AN
    let transQuery = supabase
      .from('tranzaksyon')
      .select('*')
      .gte('created_at', today)
      .lte('created_at', today + 'T23:59:59');

    if (!isAdmin) {
      transQuery = transQuery.eq('branch', user?.branch);
    }

    const { data: transData } = await transQuery;
    const trans = transData || [];

    const totalDepo = trans.filter(t => t.type === 'Depo').reduce((s, t) => s + (t.montan || 0), 0);
    const totalRetre = trans.filter(t => t.type === 'Retre').reduce((s, t) => s + (t.montan || 0), 0);
    const totalTransf = trans.filter(t => t.type === 'Transfere').reduce((s, t) => s + (t.montan || 0), 0);
    const pemaPreTotal = trans.filter(t => t.type === 'Peman Pre').reduce((s, t) => s + (t.montan || 0), 0);

    // KLIYAN
    const { data: kliyanData } = await supabase.from('kliyan').select('*');
    const kliyan = kliyanData || [];
    const totalKliyan = kliyan.length;
    const kobBloke = kliyan.reduce((s, k) => s + 500, 0);
    const balansTotal = kliyan.reduce((s, k) => s + (k.balance || 0), 0);

    // PRE
    const { data: preData } = await supabase.from('pre').select('*').eq('status', 'Aktif');
    const preAktif = (preData || []).length;

    const benefis = totalDepo - totalRetre;

    setStats({
      totalDepo,
      totalRetre,
      totalTransf,
      totalKliyan,
      preAktif,
      benefis,
      balansKes: balansTotal,
      kobBloke,
      pemaPreTotal,
    });

    setRecentTrans(trans.slice(0, 5));
    setLoading(false);
  };

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

  const statsAdmin = [
    { label: 'Total Depo Jounen', value: 'HTG ' + stats.totalDepo.toLocaleString(), icon: '💰', color: '#1a5c2a' },
    { label: 'Total Retrè', value: 'HTG ' + stats.totalRetre.toLocaleString(), icon: '💸', color: '#e74c3c' },
    { label: 'Pre Aktif', value: stats.preAktif, icon: '📋', color: '#f39c12' },
    { label: 'Total Kliyan', value: stats.totalKliyan, icon: '👥', color: '#3498db' },
    { label: 'Benefis Net', value: 'HTG ' + stats.benefis.toLocaleString(), icon: '📈', color: '#9b59b6' },
  ];

  const statsKesye = [
    { label: 'Total Depo Jounen', value: 'HTG ' + stats.totalDepo.toLocaleString(), icon: '💰', color: '#1a5c2a' },
    { label: 'Total Retrè', value: 'HTG ' + stats.totalRetre.toLocaleString(), icon: '💸', color: '#e74c3c' },
    { label: 'Pre Aktif', value: stats.preAktif, icon: '📋', color: '#f39c12' },
    { label: 'Total Kliyan', value: stats.totalKliyan, icon: '👥', color: '#3498db' },
  ];

  const statsList = isAdmin ? statsAdmin : statsKesye;

  const typeColor = (type) => {
    if (type === 'Depo') return '#2ecc71';
    if (type === 'Retre') return '#e74c3c';
    if (type === 'Transfere') return '#3498db';
    return '#f39c12';
  };

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
        {statsList.map((stat, i) => (
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

      {/* BAS */}
      <div style={{ display: 'grid', gridTemplateColumns: isAdmin ? '1fr 320px' : '1fr', gap: '15px' }}>

        {/* DÈNYE TRANZAKSYON */}
        <div style={{ background: 'white', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
          <h2 style={{ margin: '0 0 15px', color: '#1a5c2a', fontSize: '14px', fontWeight: '700' }}>🕐 Dènye Tranzaksyon</h2>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>⏳ Chaje...</div>
          ) : recentTrans.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '25px', color: '#999' }}>
              <div style={{ fontSize: '30px', marginBottom: '8px' }}>📭</div>
              Pa gen tranzaksyon jodi a
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #1a5c2a, #2d8a45)' }}>
                  {['Kliyan', 'Tip', 'Montan', 'Kesye', 'Lè'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', color: 'white', textAlign: 'left', fontSize: '12px', fontWeight: '700' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentTrans.map((t, i) => (
                  <tr key={t.id} style={{ background: i % 2 === 0 ? '#f9f9f9' : 'white', borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px 12px', fontWeight: '600', fontSize: '13px' }}>{t.client}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ background: typeColor(t.type) + '20', color: typeColor(t.type), padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }}>{t.type}</span>
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: '700', color: typeColor(t.type), fontSize: '13px' }}>HTG {t.montan?.toLocaleString()}</td>
                    <td style={{ padding: '10px 12px', color: '#666', fontSize: '12px' }}>{t.kesye}</td>
                    <td style={{ padding: '10px 12px', color: '#666', fontSize: '12px' }}>
                      {new Date(t.created_at).toLocaleTimeString('fr-HT', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* BALANS KES — ADMIN SELMAN */}
        {isAdmin && (
          <div style={{ background: 'white', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
            <h2 style={{ margin: '0 0 15px', color: '#1a5c2a', fontSize: '14px', fontWeight: '700' }}>💰 Balans Kès</h2>
            <div style={{ background: 'linear-gradient(135deg, #1a5c2a, #2d8a45)', borderRadius: '10px', padding: '15px', marginBottom: '15px', color: 'white', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '5px', fontWeight: '600' }}>Kès Disponib</div>
              <div style={{ fontSize: '22px', fontWeight: '900' }}>HTG {stats.balansKes.toLocaleString()}</div>
            </div>
            {[
              { label: 'Depo', value: '+HTG ' + stats.totalDepo.toLocaleString(), color: '#2ecc71' },
              { label: 'Retrè', value: '-HTG ' + stats.totalRetre.toLocaleString(), color: '#e74c3c' },
              { label: 'Transfè', value: 'HTG ' + stats.totalTransf.toLocaleString(), color: '#3498db' },
              { label: 'Peman Prè', value: 'HTG ' + stats.pemaPreTotal.toLocaleString(), color: '#e67e22' },
              { label: 'Kòb Bloke', value: 'HTG ' + stats.kobBloke.toLocaleString(), color: '#9b59b6' },
              { label: 'Benefis', value: 'HTG ' + stats.benefis.toLocaleString(), color: '#f39c12' },
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