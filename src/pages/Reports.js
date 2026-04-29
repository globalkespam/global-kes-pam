import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

function Reports({ user }) {
  const today = new Date().toISOString().split('T')[0];
  const isAdmin = user?.role === 'Admin';

  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);
  const [selectedBranch, setSelectedBranch] = useState(isAdmin ? 'Tout Branch' : user?.branch);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const branches = ['Tout Branch', 'Branch Potoprens', 'Branch Kapo', 'Siege Central'];

 useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFrom, dateTo, selectedBranch]);

  const fetchTransactions = async () => {
    setLoading(true);
    let query = supabase
      .from('tranzaksyon')
      .select('*')
      .order('created_at', { ascending: false });

    if (isAdmin) {
      query = query.gte('created_at', dateFrom).lte('created_at', dateTo + 'T23:59:59');
      if (selectedBranch !== 'Tout Branch') {
        query = query.eq('branch', selectedBranch);
      }
    } else {
      query = query.eq('branch', user?.branch).gte('created_at', today).lte('created_at', today + 'T23:59:59');
    }

    const { data, error } = await query;
    if (!error) setTransactions(data || []);
    setLoading(false);
  };

  const totalDepo = transactions.filter(t => t.type === 'Depo').reduce((s, t) => s + (t.montan || 0), 0);
  const totalRetre = transactions.filter(t => t.type === 'Retre').reduce((s, t) => s + (t.montan || 0), 0);
  const totalTransf = transactions.filter(t => t.type === 'Transfere').reduce((s, t) => s + (t.montan || 0), 0);
  const totalPre = transactions.filter(t => t.type === 'Peman Pre').reduce((s, t) => s + (t.montan || 0), 0);
  const totalNet = totalDepo - totalRetre;

  const branchList = ['Branch Potoprens', 'Branch Kapo', 'Siege Central'];
  const branchStats = branchList.map(b => ({
    name: b,
    depo: transactions.filter(t => t.branch === b && t.type === 'Depo').reduce((s, t) => s + (t.montan || 0), 0),
    retre: transactions.filter(t => t.branch === b && t.type === 'Retre').reduce((s, t) => s + (t.montan || 0), 0),
    transf: transactions.filter(t => t.branch === b && t.type === 'Transfere').reduce((s, t) => s + (t.montan || 0), 0),
    pre: transactions.filter(t => t.branch === b && t.type === 'Peman Pre').reduce((s, t) => s + (t.montan || 0), 0),
    count: transactions.filter(t => t.branch === b).length,
  }));

  const typeColor = (type) => {
    if (type === 'Depo') return '#2ecc71';
    if (type === 'Retre') return '#e74c3c';
    if (type === 'Transfere') return '#3498db';
    return '#f39c12';
  };

  const formatDate = (d) => {
    if (!d) return '';
    const date = new Date(d);
    return date.toLocaleDateString('fr-HT');
  };

  const formatTime = (d) => {
    if (!d) return '';
    const date = new Date(d);
    return date.toLocaleTimeString('fr-HT', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'Segoe UI, sans-serif' }}>
      <style>{`@media print { .no-print { display: none !important; } }`}</style>

      {/* HEADER */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div>
          <h1 style={{ margin: 0, color: '#1a5c2a', fontSize: '24px', fontWeight: '800' }}>Rapo Jounen</h1>
          <p style={{ margin: '5px 0 0', color: '#666', fontSize: '14px' }}>
            {isAdmin ? 'Rapo detaye pa dat ak branch' : 'Rapo jounen — ' + user?.branch}
          </p>
        </div>
        <button onClick={() => window.print()} style={{ background: 'linear-gradient(135deg, #1a5c2a, #2d8a45)', color: 'white', border: 'none', borderRadius: '10px', padding: '12px 24px', cursor: 'pointer', fontSize: '14px', fontWeight: '700' }}>
          Enprime / Telechaje
        </button>
      </div>

      {/* FILTERS — ADMIN SELMAN */}
      {isAdmin && (
        <div className="no-print" style={{ background: 'white', borderRadius: '16px', padding: '25px', marginBottom: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
          <h3 style={{ margin: '0 0 15px', color: '#1a5c2a', fontSize: '15px', fontWeight: '700' }}>Chèche Rapo</h3>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>De Dat</label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                style={{ padding: '10px 15px', border: '2px solid #1a5c2a', borderRadius: '8px', fontSize: '14px' }} />
            </div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#1a5c2a', paddingBottom: '8px' }}>→</div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Jiska Dat</label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                style={{ padding: '10px 15px', border: '2px solid #1a5c2a', borderRadius: '8px', fontSize: '14px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Branch</label>
              <select value={selectedBranch} onChange={e => setSelectedBranch(e.target.value)}
                style={{ padding: '10px 15px', border: '2px solid #1a5c2a', borderRadius: '8px', fontSize: '14px' }}>
                {branches.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div style={{ background: '#e8f5e9', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', color: '#1a5c2a', fontWeight: '700' }}>
              {transactions.length} tranzaksyon jwenn
            </div>
          </div>
        </div>
      )}

      {/* KESYE INFO */}
      {!isAdmin && (
        <div className="no-print" style={{ background: '#e8f5e9', borderRadius: '12px', padding: '15px', marginBottom: '25px', border: '2px solid #1a5c2a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: '700', color: '#1a5c2a', fontSize: '14px' }}>📅 Rapo jounen: {formatDate(today)}</div>
          <div style={{ fontWeight: '700', color: '#1a5c2a', fontSize: '14px' }}>🏦 {user?.branch}</div>
          <div style={{ background: '#1a5c2a', color: 'white', padding: '6px 15px', borderRadius: '20px', fontSize: '13px', fontWeight: '700' }}>
            {transactions.length} tranzaksyon
          </div>
        </div>
      )}

      {/* PRINT HEADER */}
      <div style={{ background: 'linear-gradient(135deg, #1a5c2a, #2d8a45)', borderRadius: '16px', padding: '25px', marginBottom: '25px', color: 'white', textAlign: 'center' }}>
        <h2 style={{ margin: '0 0 5px', fontSize: '22px', fontWeight: '800' }}>GLOBAL KES PAM — GKP</h2>
        <p style={{ margin: '0 0 5px', opacity: 0.9, fontSize: '15px' }}>
          Rapo: {isAdmin ? formatDate(dateFrom) + ' — ' + formatDate(dateTo) : formatDate(today)}
        </p>
        <p style={{ margin: 0, opacity: 0.75, fontSize: '13px' }}>Branch: {isAdmin ? selectedBranch : user?.branch}</p>
      </div>

      {/* LOADING */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#1a5c2a', fontWeight: '700' }}>
          ⏳ Chaje tranzaksyon yo...
        </div>
      ) : (
        <>
          {/* STATS */}
          <div style={{ display: 'grid', gridTemplateColumns: isAdmin ? 'repeat(5, 1fr)' : 'repeat(4, 1fr)', gap: '15px', marginBottom: '25px' }}>
            {[
              { label: 'Total Depo', value: 'HTG ' + totalDepo.toLocaleString(), icon: '💰', color: '#2ecc71', show: true },
              { label: 'Total Retre', value: 'HTG ' + totalRetre.toLocaleString(), icon: '💸', color: '#e74c3c', show: true },
              { label: 'Total Transfe', value: 'HTG ' + totalTransf.toLocaleString(), icon: '🔄', color: '#3498db', show: true },
              { label: 'Peman Pre', value: 'HTG ' + totalPre.toLocaleString(), icon: '📋', color: '#f39c12', show: true },
              { label: 'Benefis Net', value: 'HTG ' + totalNet.toLocaleString(), icon: '📈', color: '#1a5c2a', show: isAdmin },
            ].filter(s => s.show).map((s, i) => (
              <div key={i} style={{ background: 'white', borderRadius: '14px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', borderLeft: '5px solid ' + s.color, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '28px' }}>{s.icon}</span>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* RAPO PA BRANCH — ADMIN SELMAN */}
          {isAdmin && (
            <div style={{ background: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', marginBottom: '25px' }}>
              <h2 style={{ margin: '0 0 20px', color: '#1a5c2a', fontSize: '16px', fontWeight: '700' }}>Rapo pa Branch</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg, #1a5c2a, #2d8a45)' }}>
                    {['Branch', 'Total Depo', 'Total Retre', 'Total Transfe', 'Peman Pre', 'Tranzaksyon'].map((h, i) => (
                      <th key={i} style={{ padding: '12px 15px', color: 'white', textAlign: 'left', fontSize: '13px', fontWeight: '700' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {branchStats.map((b, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? '#f9f9f9' : 'white', borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px 15px', fontWeight: '700', color: '#1a5c2a' }}>🏦 {b.name}</td>
                      <td style={{ padding: '12px 15px', fontWeight: '700', color: '#2ecc71' }}>HTG {b.depo.toLocaleString()}</td>
                      <td style={{ padding: '12px 15px', fontWeight: '700', color: '#e74c3c' }}>HTG {b.retre.toLocaleString()}</td>
                      <td style={{ padding: '12px 15px', fontWeight: '700', color: '#3498db' }}>HTG {b.transf.toLocaleString()}</td>
                      <td style={{ padding: '12px 15px', fontWeight: '700', color: '#f39c12' }}>HTG {b.pre.toLocaleString()}</td>
                      <td style={{ padding: '12px 15px', fontWeight: '600' }}>{b.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* LIS TRANZAKSYON */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', marginBottom: '25px' }}>
            <h2 style={{ margin: '0 0 20px', color: '#1a5c2a', fontSize: '16px', fontWeight: '700' }}>
              Lis Tranzaksyon {!isAdmin && '— ' + user?.branch}
            </h2>
            {transactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>📭</div>
                <p>Pa gen tranzaksyon pou peryod sa a</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg, #1a5c2a, #2d8a45)' }}>
                    {['Ref', 'Tip', 'Kliyan', 'Montan', 'Kesye', 'Branch', 'Dat', 'Lè'].map((h, i) => (
                      <th key={i} style={{ padding: '12px 15px', color: 'white', textAlign: 'left', fontSize: '13px', fontWeight: '700' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t, i) => (
                    <tr key={t.id} style={{ background: i % 2 === 0 ? '#f9f9f9' : 'white', borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px 15px', fontWeight: '700', color: '#1a5c2a', fontSize: '11px' }}>{t.ref}</td>
                      <td style={{ padding: '12px 15px' }}>
                        <span style={{ background: typeColor(t.type) + '20', color: typeColor(t.type), padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>{t.type}</span>
                      </td>
                      <td style={{ padding: '12px 15px', fontWeight: '600', fontSize: '13px' }}>{t.client}</td>
                      <td style={{ padding: '12px 15px', fontWeight: '700', color: typeColor(t.type) }}>HTG {t.montan?.toLocaleString()}</td>
                      <td style={{ padding: '12px 15px', color: '#666', fontSize: '12px' }}>{t.kesye}</td>
                      <td style={{ padding: '12px 15px', color: '#666', fontSize: '12px' }}>{t.branch}</td>
                      <td style={{ padding: '12px 15px', color: '#666', fontSize: '12px' }}>{formatDate(t.created_at)}</td>
                      <td style={{ padding: '12px 15px', color: '#666', fontSize: '12px' }}>{formatTime(t.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ background: '#f0f0f0', fontWeight: '800' }}>
                    <td colSpan="3" style={{ padding: '12px 15px', color: '#1a5c2a' }}>TOTAL</td>
                    <td style={{ padding: '12px 15px', color: '#1a5c2a' }}>HTG {transactions.reduce((s, t) => s + (t.montan || 0), 0).toLocaleString()}</td>
                    <td colSpan="4"></td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Reports;