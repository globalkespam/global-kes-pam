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
    totalFreOuveti: 0,
    totalAnile: 0,
    montanAnile: 0,
    rantre: 0,
    soti: 0,
    balansJounen: 0,
  });

  const [recentTrans, setRecentTrans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStats = async () => {
    setLoading(true);

    const now = new Date();
    const todayHaiti = new Date(now.getTime() - (5 * 60 * 60 * 1000)).toISOString().split('T')[0];

    let transQuery = supabase
      .from('tranzaksyon')
      .select('*')
      .order('created_at', { ascending: false });

    if (!isAdmin) {
      transQuery = transQuery.eq('branch', user?.branch);
    }

    const { data: transData } = await transQuery;

    // Filtre jis tranzaksyon jounen an (valid + anile)
    const trans = (transData || []).filter(tr => {
      const dat = new Date(tr.created_at);
      const datHaiti = new Date(dat.getTime() - (5 * 60 * 60 * 1000)).toISOString().split('T')[0];
      return datHaiti === todayHaiti;
    });

    // --- STATS ---
    const totalDepo = trans
      .filter(tr => tr.type === 'Depo' && !tr.annule)
      .reduce((s, tr) => s + (tr.montan || 0), 0);

    const totalRetre = trans
      .filter(tr => tr.type === 'Retre' && !tr.annule)
      .reduce((s, tr) => s + (tr.montan || 0), 0);

    const totalTransf = trans
      .filter(tr => tr.type === 'Transfere' && !tr.annule)
      .reduce((s, tr) => s + (tr.montan || 0), 0);

    const pemaPreTotal = trans
      .filter(tr => tr.type === 'Peman Pre' && !tr.annule)
      .reduce((s, tr) => s + (tr.montan || 0), 0);

    const totalFreOuveti = trans
      .filter(tr => tr.type === 'Fre Ouveti' && !tr.annule)
      .reduce((s, tr) => s + (tr.montan || 0), 0);

    const totalAnile = trans.filter(tr => tr.annule).length;
    const montanAnile = trans
      .filter(tr => tr.annule)
      .reduce((s, tr) => s + (tr.montan || 0), 0);

    // Rantre = Depo + Fre Ouveti + Peman Pre (valid sèlman)
    const rantre = totalDepo + totalFreOuveti + pemaPreTotal;

    // Soti = Retre + Transfere (valid sèlman)
    const soti = totalRetre + totalTransf;

    // Balans Jounen = Rantre - Soti
    const balansJounen = rantre - soti;

    const { data: kliyanData } = await supabase.from('kliyan').select('*');
    const kliyan = kliyanData || [];
    const totalKliyan = kliyan.length;
    const kobBloke = kliyan.reduce((s, k) => s + (k.reserve || 500), 0);
    const balansTotal = kliyan.reduce((s, k) => s + (k.balance || 0), 0);

    const { data: preData } = await supabase.from('pre').select('*').eq('status', 'Aktif');
    const preAktif = (preData || []).length;

    const benefis = totalDepo - totalRetre + totalFreOuveti;

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
      totalFreOuveti,
      totalAnile,
      montanAnile,
      rantre,
      soti,
      balansJounen,
    });

    // ✅ Montre TOUT tranzaksyon jounen an (valid + anile)
    setRecentTrans(trans);
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
    { label: 'Frè Ouveti', value: 'HTG ' + stats.totalFreOuveti.toLocaleString(), icon: '💳', color: '#9b59b6' },
    { label: 'Pre Aktif', value: stats.preAktif, icon: '📋', color: '#f39c12' },
    { label: 'Total Kliyan', value: stats.totalKliyan, icon: '👥', color: '#3498db' },
    { label: stats.totalAnile + ' Anile | HTG ' + stats.montanAnile.toLocaleString(), value: '', icon: '❌', color: '#e74c3c' },
  ];

  const statsKesye = [
    { label: 'Total Depo Jounen', value: 'HTG ' + stats.totalDepo.toLocaleString(), icon: '💰', color: '#1a5c2a' },
    { label: 'Total Retrè', value: 'HTG ' + stats.totalRetre.toLocaleString(), icon: '💸', color: '#e74c3c' },
    { label: 'Frè Ouveti', value: 'HTG ' + stats.totalFreOuveti.toLocaleString(), icon: '💳', color: '#9b59b6' },
    { label: 'Pre Aktif', value: stats.preAktif, icon: '📋', color: '#f39c12' },
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
      <div style={{ display: 'grid', gridTemplateColumns: isAdmin ? '1fr 340px' : '1fr', gap: '15px' }}>

        {/* DÈNYE TRANZAKSYON — TOUT jounen an */}
        <div style={{ background: 'white', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
          <h2 style={{ margin: '0 0 15px', color: '#1a5c2a', fontSize: '14px', fontWeight: '700' }}>
            🕐 Tranzaksyon Jounen an ({recentTrans.length})
          </h2>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>⏳ Chaje...</div>
          ) : recentTrans.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '25px', color: '#999' }}>
              <div style={{ fontSize: '30px', marginBottom: '8px' }}>📭</div>
              Pa gen tranzaksyon jodi a
            </div>
          ) : (
            <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ position: 'sticky', top: 0 }}>
                  <tr style={{ background: 'linear-gradient(135deg, #1a5c2a, #2d8a45)' }}>
                    {['Eta', 'Kliyan', 'Tip', 'Montan', 'Kesye', 'Lè'].map((h, i) => (
                      <th key={i} style={{ padding: '10px 12px', color: 'white', textAlign: 'left', fontSize: '12px', fontWeight: '700' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentTrans.map((tr, i) => (
                    <tr key={tr.id} style={{
                      background: tr.annule ? '#fff5f5' : (i % 2 === 0 ? '#f9f9f9' : 'white'),
                      borderBottom: '1px solid #eee',
                      opacity: tr.annule ? 0.75 : 1
                    }}>
                      {/* ETA — ✅ valid oswa ❌ anile */}
                      <td style={{ padding: '10px 12px', fontSize: '16px', textAlign: 'center' }}>
                        {tr.annule ? '❌' : '✅'}
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: '600', fontSize: '13px', textDecoration: tr.annule ? 'line-through' : 'none', color: tr.annule ? '#999' : 'inherit' }}>
                        {tr.client}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ background: typeColor(tr.type) + '20', color: tr.annule ? '#999' : typeColor(tr.type), padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }}>
                          {tr.type}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: '700', color: tr.annule ? '#999' : typeColor(tr.type), fontSize: '13px', textDecoration: tr.annule ? 'line-through' : 'none' }}>
                        HTG {tr.montan?.toLocaleString()}
                      </td>
                      <td style={{ padding: '10px 12px', color: '#666', fontSize: '12px' }}>{tr.kesye}</td>
                      <td style={{ padding: '10px 12px', color: '#666', fontSize: '12px' }}>
                        {new Date(tr.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* BALANS KES — ADMIN SELMAN */}
        {isAdmin && (
          <div style={{ background: 'white', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
            <h2 style={{ margin: '0 0 15px', color: '#1a5c2a', fontSize: '14px', fontWeight: '700' }}>💰 Rezime Kès Jounen an</h2>

            {/* Balans Kliyan */}
            <div style={{ background: 'linear-gradient(135deg, #1a5c2a, #2d8a45)', borderRadius: '10px', padding: '15px', marginBottom: '12px', color: 'white', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '5px', fontWeight: '600' }}>Kès Disponib (Balans Kliyan)</div>
              <div style={{ fontSize: '22px', fontWeight: '900' }}>HTG {stats.balansKes.toLocaleString()}</div>
            </div>

            {/* Rantre / Soti / Balans Jounen */}
            <div style={{ background: '#f0faf3', border: '1px solid #c3e6cb', borderRadius: '10px', padding: '12px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', color: '#155724', fontWeight: '600' }}>📥 Kòb Rantre</span>
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#1a5c2a' }}>HTG {stats.rantre.toLocaleString()}</span>
              </div>
              <div style={{ fontSize: '10px', color: '#666', marginBottom: '10px', paddingLeft: '4px' }}>
                Depo + Frè Ouveti + Peman Prè
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', color: '#721c24', fontWeight: '600' }}>📤 Kòb Soti</span>
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#e74c3c' }}>HTG {stats.soti.toLocaleString()}</span>
              </div>
              <div style={{ fontSize: '10px', color: '#666', marginBottom: '10px', paddingLeft: '4px' }}>
                Retrè + Transfè
              </div>
              <div style={{ borderTop: '2px solid #1a5c2a', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', color: '#1a5c2a', fontWeight: '800' }}>
                  {stats.balansJounen >= 0 ? '📈' : '📉'} Balans Kès
                </span>
                <span style={{ fontSize: '14px', fontWeight: '900', color: stats.balansJounen >= 0 ? '#1a5c2a' : '#e74c3c' }}>
                  {stats.balansJounen >= 0 ? '+' : ''}HTG {stats.balansJounen.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Detay */}
            {[
              { label: 'Depo', value: '+HTG ' + stats.totalDepo.toLocaleString(), color: '#2ecc71' },
              { label: 'Retrè', value: '-HTG ' + stats.totalRetre.toLocaleString(), color: '#e74c3c' },
              { label: 'Transfè', value: 'HTG ' + stats.totalTransf.toLocaleString(), color: '#3498db' },
              { label: 'Frè Ouveti', value: 'HTG ' + stats.totalFreOuveti.toLocaleString(), color: '#9b59b6' },
              { label: 'Peman Prè', value: 'HTG ' + stats.pemaPreTotal.toLocaleString(), color: '#e67e22' },
              { label: 'Kòb Bloke', value: 'HTG ' + stats.kobBloke.toLocaleString(), color: '#95a5a6' },
              { label: 'Benefis', value: 'HTG ' + stats.benefis.toLocaleString(), color: '#f39c12' },
              { label: '❌ Anile (' + stats.totalAnile + ')', value: 'HTG ' + stats.montanAnile.toLocaleString(), color: '#e74c3c' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                <span style={{ fontSize: '12px', color: '#666' }}>{item.label}</span>
                <span style={{ fontSize: '12px', fontWeight: '800', color: item.color }}>{item.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;