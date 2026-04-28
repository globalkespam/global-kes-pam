import React, { useState } from 'react';

function Loans({ user }) {
  const [view, setView] = useState('list');
  const [loans, setLoans] = useState([
    { id: 'PRE-001', numKont: 'GKP-2026-0001', client: 'Marie Joseph', prensipa: 50000, res: 35000, taux: 3, penalite: 2, dire: 12, tipRembou: 'Chak Mwa', garanti: 'Kay', branch: 'Branch Potoprens', date: '2026-01-15', status: 'Aktif' },
    { id: 'PRE-002', numKont: 'GKP-2026-0002', client: 'Jean Pierre', prensipa: 200000, res: 200000, taux: 2.5, penalite: 2, dire: 24, tipRembou: 'Chak Mwa', garanti: 'Machin', branch: 'Branch Kapo', date: '2026-02-20', status: 'Aktif' },
  ]);

  const [form, setForm] = useState({
    numKont: '', montan: '', taux: '3', dire: '12', penalite: '2',
    tipRembou: 'Chak Mwa', garanti: ''
  });
  const [calcResult, setCalcResult] = useState(null);
  const [showRembou, setShowRembou] = useState(null);
  const [rembouAmount, setRembouAmount] = useState('');
  const [rembouSuccess, setRembouSuccess] = useState(false);

  const isAdmin = user?.role === 'Admin';

  const clients = [
    { numKont: 'GKP-2026-0001', nom: 'Marie Joseph' },
    { numKont: 'GKP-2026-0002', nom: 'Jean Pierre' },
    { numKont: 'GKP-2026-0003', nom: 'Paul Joseph' },
  ];

  const kalkile = () => {
    const P = parseFloat(form.montan);
    const r = parseFloat(form.taux) / 100;
    const n = parseInt(form.dire);
    if (!P || !r || !n) return;
    const peman = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPeman = peman * n;
    const totalEnterè = totalPeman - P;
    setCalcResult({ peman: peman.toFixed(2), totalPeman: totalPeman.toFixed(2), totalEntere: totalEnterè.toFixed(2) });
  };

  const apwouvePre = () => {
    if (!form.numKont || !form.montan) return;
    const client = clients.find(c => c.numKont === form.numKont);
    const newLoan = {
      id: 'PRE-00' + (loans.length + 1),
      numKont: form.numKont,
      client: client ? client.nom : form.numKont,
      prensipa: parseFloat(form.montan),
      res: parseFloat(form.montan),
      taux: parseFloat(form.taux),
      penalite: parseFloat(form.penalite),
      dire: parseInt(form.dire),
      tipRembou: form.tipRembou,
      garanti: form.garanti,
      branch: user?.branch || '',
      date: new Date().toISOString().split('T')[0],
      status: 'Aktif'
    };
    setLoans([...loans, newLoan]);
    setForm({ numKont: '', montan: '', taux: '3', dire: '12', penalite: '2', tipRembou: 'Chak Mwa', garanti: '' });
    setCalcResult(null);
    setView('list');
  };

  const handleRembou = (loan) => {
    if (!rembouAmount) return;
    setLoans(loans.map(l => {
      if (l.id === loan.id) {
        const newRes = Math.max(0, l.res - parseFloat(rembouAmount));
        return { ...l, res: newRes, status: newRes === 0 ? 'Peye' : 'Aktif' };
      }
      return l;
    }));
    setRembouSuccess(true);
    setTimeout(() => { setRembouSuccess(false); setShowRembou(null); setRembouAmount(''); }, 2000);
  };

  const inputStyle = { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' };
  const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: '600', fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' };

  return (
    <div style={{ padding: '30px', fontFamily: 'Segoe UI, sans-serif' }}>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div>
          <h1 style={{ margin: 0, color: '#1a5c2a', fontSize: '24px', fontWeight: '800' }}>Jesyon Pre</h1>
          <p style={{ margin: '5px 0 0', color: '#666', fontSize: '14px' }}>
            {loans.filter(l => l.status === 'Aktif').length} pre aktif
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {isAdmin && (
            <button onClick={() => setView(view === 'list' ? 'create' : 'list')} style={{
              background: view === 'create' ? '#e74c3c' : 'linear-gradient(135deg, #1a5c2a, #2d8a45)',
              color: 'white', border: 'none', borderRadius: '10px',
              padding: '12px 24px', cursor: 'pointer', fontSize: '14px', fontWeight: '700'
            }}>
              {view === 'create' ? 'Retounen' : 'Kreye Nouvo Pre'}
            </button>
          )}
        </div>
      </div>

      {/* STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '25px' }}>
        {[
          { label: 'Pre Aktif', value: loans.filter(l => l.status === 'Aktif').length, icon: '📋', color: '#f39c12' },
          { label: 'Total Pre', value: loans.length, icon: '📊', color: '#3498db' },
          { label: 'Pre Peye', value: loans.filter(l => l.status === 'Peye').length, icon: '✅', color: '#2ecc71' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'white', borderRadius: '14px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', borderLeft: '5px solid ' + s.color, display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontSize: '32px' }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: '28px', fontWeight: '800', color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* KREYE PRE VIEW */}
      {view === 'create' && isAdmin && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '30px', marginBottom: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
          <h2 style={{ margin: '0 0 25px', color: '#1a5c2a', fontSize: '18px', fontWeight: '800' }}>
            Kreye Pre
          </h2>

          {/* FORM */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={labelStyle}>Kont Kliyan</label>
              <input 
  value={form.numKont} 
  onChange={e => setForm({...form, numKont: e.target.value})}
  placeholder="GKP-XXXX"
  style={inputStyle} 
/>
            </div>
            <div>
              <label style={labelStyle}>Montan Pre</label>
              <input type="number" value={form.montan} onChange={e => setForm({...form, montan: e.target.value})} placeholder="0.00" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>To Entere (%) / Mwa</label>
              <input type="number" value={form.taux} onChange={e => setForm({...form, taux: e.target.value})} placeholder="3" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Dire (Mwa)</label>
              <input type="number" value={form.dire} onChange={e => setForm({...form, dire: e.target.value})} placeholder="12" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Penalite (%)</label>
              <input type="number" value={form.penalite} onChange={e => setForm({...form, penalite: e.target.value})} placeholder="2" style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={labelStyle}>Tip Rembousman</label>
              <select value={form.tipRembou} onChange={e => setForm({...form, tipRembou: e.target.value})} style={inputStyle}>
                <option value="Chak Mwa">Chak Mwa</option>
                <option value="Chak 2 Semèn">Chak 2 Semèn</option>
                <option value="Chak Semèn">Chak Semèn</option>
                <option value="Fen Dire">Fen Dire (Bullet)</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Garanti</label>
              <input value={form.garanti} onChange={e => setForm({...form, garanti: e.target.value})} placeholder="Kay, machin, bijou..." style={inputStyle} />
            </div>
          </div>

          {/* BOUTON */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button onClick={kalkile} style={{ padding: '12px 25px', background: '#f0f0f0', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Kalkile
            </button>
            <button onClick={apwouvePre} style={{ padding: '12px 25px', background: 'linear-gradient(135deg, #1a5c2a, #2d8a45)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Apwouve Pre
            </button>
          </div>

          {/* REZILTA KALKIL */}
          {calcResult && (
            <div style={{ background: '#e8f5e9', borderRadius: '12px', padding: '20px', border: '2px solid #1a5c2a' }}>
              <h4 style={{ margin: '0 0 15px', color: '#1a5c2a', fontSize: '14px' }}>Rezilta Kalkil</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                {[
                  { label: 'Peman Chak Mwa', value: 'HTG ' + parseFloat(calcResult.peman).toLocaleString() },
                  { label: 'Total Peman', value: 'HTG ' + parseFloat(calcResult.totalPeman).toLocaleString() },
                  { label: 'Total Entere', value: 'HTG ' + parseFloat(calcResult.totalEntere).toLocaleString() },
                ].map((item, i) => (
                  <div key={i} style={{ background: 'white', borderRadius: '10px', padding: '15px', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#666', marginBottom: '5px' }}>{item.label}</div>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#1a5c2a' }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL REMBOURE */}
      {showRembou && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '30px', width: '400px', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
            {rembouSuccess ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: '50px', marginBottom: '15px' }}>✅</div>
                <h3 style={{ color: '#1a5c2a', margin: 0 }}>Rembourseman Konfime!</h3>
              </div>
            ) : (
              <>
                <h3 style={{ margin: '0 0 20px', color: '#1a5c2a' }}>Remboure Pre</h3>
                <div style={{ background: '#e8f5e9', borderRadius: '10px', padding: '15px', marginBottom: '20px' }}>
                  <div style={{ fontWeight: '700', color: '#1a5c2a' }}>{showRembou.client}</div>
                  <div style={{ fontSize: '13px', color: '#666' }}>{showRembou.id} • {showRembou.numKont}</div>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: '#e74c3c', marginTop: '5px' }}>
                    Res: HTG {showRembou.res.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '3px' }}>
                    Peman chak mwa: HTG {((showRembou.prensipa * (showRembou.taux/100) * Math.pow(1 + showRembou.taux/100, showRembou.dire)) / (Math.pow(1 + showRembou.taux/100, showRembou.dire) - 1)).toFixed(2)}
                  </div>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={labelStyle}>Montan Rembourseman</label>
                  <input type="number" value={rembouAmount} onChange={e => setRembouAmount(e.target.value)} placeholder="0.00" style={inputStyle} />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => handleRembou(showRembou)} style={{ background: '#f39c12', color: 'white', border: 'none', borderRadius: '8px', padding: '12px 25px', cursor: 'pointer', fontWeight: '700', flex: 1 }}>
                    Konfime
                  </button>
                  <button onClick={() => setShowRembou(null)} style={{ background: '#e0e0e0', color: '#333', border: 'none', borderRadius: '8px', padding: '12px 20px', cursor: 'pointer', fontWeight: '700' }}>
                    Anile
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* LIST VIEW */}
      {view === 'list' && (
        <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(135deg, #1a5c2a, #2d8a45)' }}>
                {['#', 'Kliyan', 'Prensipa', 'Res', 'Taux', 'Dire', 'Tip Rembou', 'Statut', 'Aksyon'].map((h, i) => (
                  <th key={i} style={{ padding: '15px', color: 'white', textAlign: 'left', fontSize: '13px', fontWeight: '700' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loans.map((loan, i) => (
                <tr key={loan.id} style={{ background: i % 2 === 0 ? '#f9f9f9' : 'white', borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '14px 15px', fontWeight: '700', color: '#1a5c2a', fontSize: '12px' }}>{loan.id}</td>
                  <td style={{ padding: '14px 15px' }}>
                    <div style={{ fontWeight: '600' }}>{loan.client}</div>
                    <div style={{ fontSize: '11px', color: '#999' }}>{loan.numKont}</div>
                  </td>
                  <td style={{ padding: '14px 15px', fontWeight: '700', color: '#3498db' }}>HTG {loan.prensipa.toLocaleString()}</td>
                  <td style={{ padding: '14px 15px', fontWeight: '700', color: loan.res > 0 ? '#e74c3c' : '#2ecc71' }}>HTG {loan.res.toLocaleString()}</td>
                  <td style={{ padding: '14px 15px', color: '#666' }}>{loan.taux}%</td>
                  <td style={{ padding: '14px 15px', color: '#666' }}>{loan.dire} mwa</td>
                  <td style={{ padding: '14px 15px', color: '#666', fontSize: '12px' }}>{loan.tipRembou}</td>
                  <td style={{ padding: '14px 15px' }}>
                    <span style={{ background: loan.status === 'Aktif' ? '#fff3e0' : '#e8f5e9', color: loan.status === 'Aktif' ? '#f39c12' : '#2ecc71', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                      {loan.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 15px' }}>
                    {loan.status === 'Aktif' && (
                      <button onClick={() => { setShowRembou(loan); setRembouAmount(''); }} style={{ background: '#f39c12', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 15px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>
                        Remboure
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Loans;