import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import logo from '../assets/logo.jpeg.jpeg';

function Reports({ user, branches }) {
  const now = new Date();
  const today = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  const isAdmin = user?.role === 'Admin';

  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);
  const [selectedBranch, setSelectedBranch] = useState(isAdmin ? 'Tout Branch' : user?.branch);
  const [transactions, setTransactions] = useState([]);
  const [benefisData, setBenefisData] = useState([]);
  const [kliyanData, setKliyanData] = useState([]);
  const [loading, setLoading] = useState(true);

  const branchOptions = ['Tout Branch', ...(branches && branches.length > 0 ? branches.map(b => b.nom) : [])];
  const branchList = branches && branches.length > 0 ? branches.map(b => b.nom) : [];

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFrom, dateTo, selectedBranch]);

  const fetchAll = async () => {
    setLoading(true);

    let query = supabase.from('tranzaksyon').select('*').order('created_at', { ascending: false });

    if (isAdmin) {
      query = query.gte('created_at', dateFrom).lte('created_at', dateTo + 'T23:59:59');
      if (selectedBranch !== 'Tout Branch') query = query.eq('branch', selectedBranch);
    } else {
      query = query.eq('branch', user?.branch).gte('created_at', today).lte('created_at', today + 'T23:59:59');
    }

    const { data: transData } = await query;
    setTransactions(transData || []);

    let benefisQuery = supabase.from('benefis').select('*').order('created_at', { ascending: false });
    if (isAdmin) {
      benefisQuery = benefisQuery.gte('created_at', dateFrom).lte('created_at', dateTo + 'T23:59:59');
      if (selectedBranch !== 'Tout Branch') benefisQuery = benefisQuery.eq('branch', selectedBranch);
    } else {
      benefisQuery = benefisQuery.eq('branch', user?.branch).gte('created_at', today).lte('created_at', today + 'T23:59:59');
    }
    const { data: benData } = await benefisQuery;
    setBenefisData(benData || []);

    const { data: kliData } = await supabase.from('kliyan').select('reserve, balance, branch, nom, prenon');
    setKliyanData(kliData || []);

    setLoading(false);
  };

  const totalDepo = transactions.filter(t => t.type === 'Depo').reduce((s, t) => s + (t.montan || 0), 0);
  const totalRetre = transactions.filter(t => t.type === 'Retre').reduce((s, t) => s + (t.montan || 0), 0);
  const totalTransf = transactions.filter(t => t.type === 'Transfere').reduce((s, t) => s + (t.montan || 0), 0);
  const totalPre = transactions.filter(t => t.type === 'Peman Pre').reduce((s, t) => s + (t.montan || 0), 0);

  const totalFreOuveti = benefisData.filter(b => b.type === 'Fre Ouveti Kont').reduce((s, b) => s + (b.montan || 0), 0);
  const totalEntere = benefisData.filter(b => b.type === 'Enterè Prè').reduce((s, b) => s + (b.montan || 0), 0);
  const totalPenalite = benefisData.filter(b => b.type === 'Penalite Prè').reduce((s, b) => s + (b.montan || 0), 0);
  const totalBenefis = totalFreOuveti + totalEntere + totalPenalite;

  const kobBloke = kliyanData.reduce((s, k) => s + (k.reserve || 500), 0);

  const branchStats = branchList.map(b => ({
    name: b,
    depo: transactions.filter(t => t.branch === b && t.type === 'Depo').reduce((s, t) => s + (t.montan || 0), 0),
    retre: transactions.filter(t => t.branch === b && t.type === 'Retre').reduce((s, t) => s + (t.montan || 0), 0),
    transf: transactions.filter(t => t.branch === b && t.type === 'Transfere').reduce((s, t) => s + (t.montan || 0), 0),
    pre: transactions.filter(t => t.branch === b && t.type === 'Peman Pre').reduce((s, t) => s + (t.montan || 0), 0),
    benefis: benefisData.filter(b2 => b2.branch === b).reduce((s, b2) => s + (b2.montan || 0), 0),
    count: transactions.filter(t => t.branch === b).length,
  }));

  const typeColor = (type) => {
    if (type === 'Depo') return '#2ecc71';
    if (type === 'Retre') return '#e74c3c';
    if (type === 'Transfere') return '#3498db';
    if (type === 'Fre Ouveti') return '#9b59b6';
    return '#f39c12';
  };

  const formatDate = (d) => {
  if (!d) return '';
  try {
    if (d.includes('T')) return new Date(d).toLocaleDateString('fr-HT');
    return new Date(d + 'T12:00:00').toLocaleDateString('fr-HT');
  } catch { return d; }
};
  const formatTime = (d) => { if (!d) return ''; return new Date(d).toLocaleTimeString('fr-HT', { hour: '2-digit', minute: '2-digit' }); };

  return (
    <div style={{ padding: '30px', fontFamily: 'Segoe UI, sans-serif' }}>
   

      {/* HEADER */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div>
          <h1 style={{ margin: 0, color: '#1a5c2a', fontSize: '24px', fontWeight: '800' }}>Rapo Jounen</h1>
          <p style={{ margin: '5px 0 0', color: '#666', fontSize: '14px' }}>
            {isAdmin ? 'Rapo detaye pa dat ak branch' : 'Rapo jounen — ' + user?.branch}
          </p>
        </div>
      <button onClick={() => {
  const printDiv = document.getElementById('resi-direct-print');
  if (!printDiv) return;

  printDiv.innerHTML = `
    <div style="font-family:Arial,sans-serif;width:100%;color:#000;font-size:14px;">

      <div style="text-align:center;margin-bottom:8px;border-bottom:2px solid #000;padding-bottom:6px;">
        <img src="${logo}" style="width:100px;height:100px;object-fit:contain;" onload="window.print()" onerror="this.style.display='none'" />
        <div style="font-size:18px;font-weight:bold;">GLOBAL KES PAM</div>
        <div style="font-size:13px;">GKP Banking System</div>
        <div style="font-size:13px;">Rapo: ${isAdmin ? formatDate(dateFrom) + ' — ' + formatDate(dateTo) : formatDate(today)}</div>
        <div style="font-size:13px;">Branch: ${isAdmin ? selectedBranch : user?.branch}</div>
        <div style="font-size:13px;">Prepare pa: ${user?.name}</div>
      </div>

      <div style="margin-bottom:8px;border-bottom:1px dashed #000;padding-bottom:6px;">
        <div style="font-size:15px;font-weight:bold;margin-bottom:4px;">REZIME</div>
        <div style="display:flex;justify-content:space-between;font-size:14px;padding:2px 0;">
          <span>Total Depo:</span><span style="font-weight:bold;">HTG ${totalDepo.toLocaleString()}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:14px;padding:2px 0;">
          <span>Fre Ouveti Kont:</span><span style="font-weight:bold;">HTG ${totalFreOuveti.toLocaleString()}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:13px;padding:2px 0;">
          <span>Total Retre:</span><span style="font-weight:bold;">HTG ${totalRetre.toLocaleString()}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:13px;padding:2px 0;">
          <span>Total Transfe:</span><span style="font-weight:bold;">HTG ${totalTransf.toLocaleString()}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:13px;padding:2px 0;">
          <span>Peman Pre:</span><span style="font-weight:bold;">HTG ${totalPre.toLocaleString()}</span>
        </div>
        ${isAdmin ? `
        <div style="display:flex;justify-content:space-between;font-size:13px;padding:2px 0;">
          <span>Benefis Total:</span><span style="font-weight:bold;">HTG ${totalBenefis.toLocaleString()}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:13px;padding:2px 0;">
          <span>Kob Bloke:</span><span style="font-weight:bold;">HTG ${kobBloke.toLocaleString()}</span>
        </div>
        ` : ''}
      </div>

      ${isAdmin ? `
      <div style="margin-bottom:8px;border-bottom:1px dashed #000;padding-bottom:6px;">
        <div style="font-size:15px;font-weight:bold;margin-bottom:4px;">RAPO PA BRANCH</div>
        ${branchStats.map(b => `
          <div style="margin-bottom:6px;padding:4px;border:1px solid #ccc;">
            <div style="font-size:13px;font-weight:bold;">🏦 ${b.name}</div>
            <div style="display:flex;justify-content:space-between;font-size:14px;"><span>Depo:</span><span>HTG ${b.depo.toLocaleString()}</span></div>
            <div style="display:flex;justify-content:space-between;font-size:14px;"><span>Retre:</span><span>HTG ${b.retre.toLocaleString()}</span></div>
            <div style="display:flex;justify-content:space-between;font-size:14px;"><span>Transfe:</span><span>HTG ${b.transf.toLocaleString()}</span></div>
            <div style="display:flex;justify-content:space-between;font-size:14px;"><span>Benefis:</span><span>HTG ${b.benefis.toLocaleString()}</span></div>
            <div style="display:flex;justify-content:space-between;font-size:14px;"><span>Tranzaksyon:</span><span>${b.count}</span></div>
          </div>
        `).join('')}
      </div>
      ` : ''}

      <div style="margin-bottom:8px;">
        <div style="font-size:15px;font-weight:bold;margin-bottom:4px;">LIS TRANZAKSYON (${transactions.length})</div>
        ${transactions.map((t, i) => `
          <div style="border-bottom:1px dotted #ccc;padding:4px 0;margin-bottom:2px;">
            <div style="display:flex;justify-content:space-between;font-size:13px;">
              <span style="font-weight:bold;">${t.type || ''}</span>
              <span style="font-weight:bold;">HTG ${(t.montan || 0).toLocaleString()}</span>
            </div>
            <div style="font-size:14px;color:#000;font-weight:bold;">${t.client || ''} — ${t.ref || ''}</div>
<div style="font-size:14px;color:#000;">${t.kesye || ''} — ${new Date(t.created_at).toLocaleDateString('fr-HT')}</div>
          </div>
        `).join('')}
        <div style="display:flex;justify-content:space-between;font-size:14px;font-weight:bold;border-top:2px solid #000;padding-top:4px;margin-top:4px;">
          <span>TOTAL:</span>
          <span>HTG ${transactions.reduce((s, t) => s + (t.montan || 0), 0).toLocaleString()}</span>
        </div>
      </div>

      <div style="border-top:2px solid #000;padding-top:8px;margin-top:10px;">
        <div style="font-size:14px;margin-bottom:20px;">Prepare pa: ___________________</div>
        <div style="font-size:14px;margin-bottom:20px;">Verifye pa: ___________________</div>
        <div style="font-size:14px;">Apwouve pa: ___________________</div>
      </div>

    </div>
  `;

}} style={{ background: 'linear-gradient(135deg, #1a5c2a, #2d8a45)', color: 'white', border: 'none', borderRadius: '10px', padding: '12px 24px', cursor: 'pointer', fontSize: '14px', fontWeight: '700' }}>
  🖨️ Enprime Rapo
</button>
      </div>

      {/* FILTERS */}
      {isAdmin && (
        <div className="no-print" style={{ background: 'white', borderRadius: '16px', padding: '25px', marginBottom: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
          <h3 style={{ margin: '0 0 15px', color: '#1a5c2a', fontSize: '15px', fontWeight: '700' }}>Chèche Rapo</h3>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>De Dat</label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ padding: '10px 15px', border: '2px solid #1a5c2a', borderRadius: '8px', fontSize: '14px' }} />
            </div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#1a5c2a', paddingBottom: '8px' }}>→</div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Jiska Dat</label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ padding: '10px 15px', border: '2px solid #1a5c2a', borderRadius: '8px', fontSize: '14px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' }}>Branch</label>
              <select value={selectedBranch} onChange={e => setSelectedBranch(e.target.value)} style={{ padding: '10px 15px', border: '2px solid #1a5c2a', borderRadius: '8px', fontSize: '14px' }}>
                {branchOptions.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div style={{ background: '#e8f5e9', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', color: '#1a5c2a', fontWeight: '700' }}>
              {transactions.length} tranzaksyon
            </div>
          </div>
        </div>
      )}

      {/* PRINT HEADER */}
      <div style={{ background: 'linear-gradient(135deg, #1a5c2a, #2d8a45)', borderRadius: '16px', padding: '25px', marginBottom: '25px', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '15px' }}>
          <img src={logo} alt="GKP" style={{ width: '70px', height: '70px', objectFit: 'contain', background: 'white', borderRadius: '10px', padding: '5px' }} />
          <div>
            <h2 style={{ margin: '0 0 5px', fontSize: '22px', fontWeight: '800' }}>GLOBAL KÈS PAM — GKP</h2>
            <p style={{ margin: '0 0 3px', opacity: 0.9, fontSize: '13px' }}>
              Rapo: {isAdmin ? formatDate(dateFrom) + ' — ' + formatDate(dateTo) : formatDate(today)}
            </p>
            <p style={{ margin: 0, opacity: 0.75, fontSize: '12px' }}>
              Branch: {isAdmin ? selectedBranch : user?.branch} | Prepare pa: {user?.name}
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#1a5c2a', fontWeight: '700' }}>⏳ Chaje done yo...</div>
      ) : (
        <>
          {/* STATS */}
          <div style={{ display: 'grid', gridTemplateColumns: isAdmin ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)', gap: '15px', marginBottom: '20px' }}>
            {[
              { label: 'Total Depo', value: 'HTG ' + totalDepo.toLocaleString(), icon: '💰', color: '#2ecc71' },
              { label: 'Total Retre', value: 'HTG ' + totalRetre.toLocaleString(), icon: '💸', color: '#e74c3c' },
              { label: 'Total Transfe', value: 'HTG ' + totalTransf.toLocaleString(), icon: '🔄', color: '#3498db' },
              { label: 'Peman Prè', value: 'HTG ' + totalPre.toLocaleString(), icon: '📋', color: '#f39c12' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'white', borderRadius: '14px', padding: '18px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', borderLeft: '5px solid ' + s.color, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '26px' }}>{s.icon}</span>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: '11px', color: '#666' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* BENEFIS AK KOB BLOKE */}
          {isAdmin && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div style={{ background: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', border: '2px solid #1a5c2a' }}>
                <h3 style={{ margin: '0 0 15px', color: '#1a5c2a', fontSize: '16px', fontWeight: '700' }}>📈 Benefis Total</h3>
                <div style={{ fontSize: '28px', fontWeight: '900', color: '#1a5c2a', marginBottom: '15px' }}>
                  HTG {totalBenefis.toLocaleString()}
                </div>
                {[
                  { label: 'Fre Ouveti Kont', value: totalFreOuveti, color: '#9b59b6', icon: '💳' },
                  { label: 'Enterè Prè', value: totalEntere, color: '#f39c12', icon: '📋' },
                  { label: 'Penalite Prè', value: totalPenalite, color: '#e74c3c', icon: '⚠️' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>{item.icon}</span>
                      <span style={{ fontSize: '13px', color: '#666' }}>{item.label}</span>
                    </div>
                    <span style={{ fontWeight: '800', color: item.color, fontSize: '14px' }}>HTG {item.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div style={{ background: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', border: '2px solid #9b59b6' }}>
                <h3 style={{ margin: '0 0 15px', color: '#9b59b6', fontSize: '16px', fontWeight: '700' }}>🔒 Kòb Bloke</h3>
                <div style={{ fontSize: '28px', fontWeight: '900', color: '#9b59b6', marginBottom: '15px' }}>
                  HTG {kobBloke.toLocaleString()}
                </div>
                <div style={{ background: '#f3e8ff', borderRadius: '10px', padding: '15px', fontSize: '13px', color: '#9b59b6' }}>
                  <p style={{ margin: '0 0 8px', fontWeight: '700' }}>📊 Detay:</p>
                  <p style={{ margin: '0 0 5px' }}>• Total Kliyan: {kliyanData.length}</p>
                  <p style={{ margin: '0 0 5px' }}>• Mwayèn Reserve: HTG {kliyanData.length > 0 ? (kobBloke / kliyanData.length).toFixed(0) : 0}</p>
                  <p style={{ margin: 0 }}>• Kòb sa pa ka retire pa kliyan yo</p>
                </div>
              </div>
            </div>
          )}

          {/* RAPO PA BRANCH */}
          {isAdmin && branchList.length > 0 && (
            <div style={{ background: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', marginBottom: '25px' }}>
              <h2 style={{ margin: '0 0 20px', color: '#1a5c2a', fontSize: '16px', fontWeight: '700' }}>📊 Rapo pa Branch</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg, #1a5c2a, #2d8a45)' }}>
                    {['Branch', 'Depo', 'Retre', 'Transfe', 'Peman Prè', 'Benefis', 'Tranzaksyon'].map((h, i) => (
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
                      <td style={{ padding: '12px 15px', fontWeight: '700', color: '#1a5c2a' }}>HTG {b.benefis.toLocaleString()}</td>
                      <td style={{ padding: '12px 15px', fontWeight: '600' }}>{b.count}</td>
                    </tr>
                  ))}
                  <tr style={{ background: '#1a5c2a', color: 'white', fontWeight: '800' }}>
                    <td style={{ padding: '12px 15px' }}>TOTAL</td>
                    <td style={{ padding: '12px 15px' }}>HTG {totalDepo.toLocaleString()}</td>
                    <td style={{ padding: '12px 15px' }}>HTG {totalRetre.toLocaleString()}</td>
                    <td style={{ padding: '12px 15px' }}>HTG {totalTransf.toLocaleString()}</td>
                    <td style={{ padding: '12px 15px' }}>HTG {totalPre.toLocaleString()}</td>
                    <td style={{ padding: '12px 15px' }}>HTG {totalBenefis.toLocaleString()}</td>
                    <td style={{ padding: '12px 15px' }}>{transactions.length}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* LIS TRANZAKSYON */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', marginBottom: '25px' }}>
            <h2 style={{ margin: '0 0 20px', color: '#1a5c2a', fontSize: '16px', fontWeight: '700' }}>
              📋 Lis Tranzaksyon {!isAdmin && '— ' + user?.branch}
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
                  <tr style={{ background: '#1a5c2a', color: 'white', fontWeight: '800' }}>
                    <td colSpan="3" style={{ padding: '12px 15px' }}>TOTAL JENERAL</td>
                    <td style={{ padding: '12px 15px' }}>HTG {transactions.reduce((s, t) => s + (t.montan || 0), 0).toLocaleString()}</td>
                    <td colSpan="4"></td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>

          {/* SIYEN */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginTop: '40px' }}>
            {['Prepare pa', 'Verifye pa', 'Apwouve pa'].map((label, i) => (
              <div key={i} style={{ textAlign: 'center', borderTop: '2px solid #1a5c2a', paddingTop: '10px' }}>
                <div style={{ fontSize: '13px', color: '#666', marginBottom: '30px' }}>{label}</div>
                <div style={{ fontSize: '12px', color: '#999' }}>Siyati & Dat</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Reports;