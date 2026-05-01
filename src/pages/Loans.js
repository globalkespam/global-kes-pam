import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

function Loans({ user }) {
  const [loans, setLoans] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showRemboure, setShowRemboure] = useState(null);
  const [montanRemboure, setMontanRemboure] = useState('');
  const isAdmin = user?.role === 'Admin';

  const [form, setForm] = useState({
    numKont: '', montan: '', taux: '5', dire: '12',
    penalite: '0', garanti: '', tipRembou: 'Chak Mwa'
  });

  useEffect(() => {
    fetchLoans();
    fetchClients();
  }, []);

  const fetchLoans = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('pre')
      .select('*')
      .order('created_at', { ascending: false });
    setLoans(data || []);
    setLoading(false);
  };

  const fetchClients = async () => {
    const { data } = await supabase.from('kliyan').select('*');
    setClients(data || []);
  };

  const calcPeman = () => {
    const P = parseFloat(form.montan) || 0;
    const r = (parseFloat(form.taux) || 0) / 100 / 12;
    const n = parseInt(form.dire) || 12;
    if (r === 0) return P / n;
    return (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  };

  const addLoan = async () => {
    if (!form.numKont || !form.montan) return;
    const client = clients.find(c => c.num_kont === form.numKont);
    if (!client) { alert('Kliyan pa jwenn!'); return; }

    const peman = calcPeman();
    const { error } = await supabase.from('pre').insert([{
      num_kont: form.numKont,
      client: client.nom + ' ' + client.prenon,
      montan: parseFloat(form.montan),
      taux: parseFloat(form.taux),
      dire: parseInt(form.dire),
      peman_chak_mwa: peman,
      penalite: parseFloat(form.penalite) || 0,
      garanti: form.garanti,
      status: 'Aktif',
      branch: user?.branch,
    }]);

    if (error) { alert('Erè: ' + error.message); return; }
    fetchLoans();
    setForm({ numKont: '', montan: '', taux: '5', dire: '12', penalite: '0', garanti: '', tipRembou: 'Chak Mwa' });
    setShowForm(false);
  };

  const remboure = async () => {
    if (!showRemboure || !montanRemboure) return;
    const montan = parseFloat(montanRemboure);

    // Kalkile enterè ak kapital
    const peman = showRemboure.peman_chak_mwa || 0;
    const enterè = montan > peman ? montan - peman : 0;
    const kapital = montan - enterè;
    const resteApeye = Math.max(0, showRemboure.montan - kapital);
    const newStatus = resteApeye <= 0 ? 'Peye' : 'Aktif';

    // Mete ajou prè
    await supabase.from('pre').update({
      status: newStatus,
      montan: resteApeye
    }).eq('id', showRemboure.id);

    // Sove tranzaksyon
    await supabase.from('tranzaksyon').insert([{
      type: 'Peman Pre',
      num_kont: showRemboure.num_kont,
      client: showRemboure.client,
      montan: montan,
      deviz: 'HTG',
      branch: user?.branch,
      kesye: user?.name,
      ref: 'GKP-' + Date.now().toString().slice(-8),
      benefis: enterè,
    }]);

    // Sove enterè kòm BENEFIS
    if (enterè > 0) {
      await supabase.from('benefis').insert([{
        type: 'Enterè Prè',
        montan: enterè,
        source: showRemboure.num_kont,
        ref: 'GKP-ENT-' + Date.now().toString().slice(-8),
        branch: user?.branch,
        kesye: user?.name,
        note: 'Enterè prè — ' + showRemboure.client,
      }]);
    }

    // Sove penalite si genyen
    if (showRemboure.penalite > 0 && newStatus === 'Peye') {
      await supabase.from('benefis').insert([{
        type: 'Penalite Prè',
        montan: showRemboure.penalite,
        source: showRemboure.num_kont,
        ref: 'GKP-PEN-' + Date.now().toString().slice(-8),
        branch: user?.branch,
        kesye: user?.name,
        note: 'Penalite prè — ' + showRemboure.client,
      }]);
    }

    fetchLoans();
    setShowRemboure(null);
    setMontanRemboure('');
    alert('✅ Rembourseman anrejistre!\nKapital: HTG ' + kapital.toFixed(2) + '\nEnterè: HTG ' + enterè.toFixed(2));
  };

  const inputStyle = { width: '100%', padding: '10px', border: '2px solid #e0e0e0', borderRadius: '8px', boxSizing: 'border-box', fontSize: '13px' };
  const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', flexDirection: 'column', gap: '15px' }}>
      <div style={{ fontSize: '40px' }}>⏳</div>
      <p style={{ color: '#1a5c2a', fontWeight: '700' }}>Chaje prè yo...</p>
    </div>
  );

  return (
    <div style={{ padding: '30px', fontFamily: 'Segoe UI, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div>
          <h1 style={{ margin: 0, color: '#1a5c2a', fontSize: '24px', fontWeight: '800' }}>Jesyon Prè</h1>
          <p style={{ margin: '5px 0 0', color: '#666', fontSize: '14px' }}>{loans.length} prè total</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowForm(!showForm)} style={{ background: 'linear-gradient(135deg, #1a5c2a, #2d8a45)', color: 'white', border: 'none', borderRadius: '10px', padding: '12px 24px', cursor: 'pointer', fontSize: '14px', fontWeight: '700' }}>
            + Nouvo Prè
          </button>
        )}
      </div>

      {/* STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '25px' }}>
        {[
          { label: 'Total Prè', value: loans.length, icon: '📋', color: '#1a5c2a' },
          { label: 'Prè Aktif', value: loans.filter(l => l.status === 'Aktif').length, icon: '✅', color: '#f39c12' },
          { label: 'Prè Peye', value: loans.filter(l => l.status === 'Peye').length, icon: '💚', color: '#2ecc71' },
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

      {/* FORM NOUVO PRE */}
      {showForm && isAdmin && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '30px', marginBottom: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', border: '2px solid #1a5c2a' }}>
          <h3 style={{ margin: '0 0 20px', color: '#1a5c2a' }}>Nouvo Prè</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '20px' }}>
            <div><label style={labelStyle}>Nimewo Kont Kliyan</label><input value={form.numKont} onChange={e => setForm({...form, numKont: e.target.value})} placeholder="GKP-XXXX" style={inputStyle} /></div>
            <div><label style={labelStyle}>Montan Prè (HTG)</label><input type="number" value={form.montan} onChange={e => setForm({...form, montan: e.target.value})} placeholder="0" style={inputStyle} /></div>
            <div><label style={labelStyle}>Taux Enterè (%)</label><input type="number" value={form.taux} onChange={e => setForm({...form, taux: e.target.value})} placeholder="5" style={inputStyle} /></div>
            <div><label style={labelStyle}>Dire (Mwa)</label><input type="number" value={form.dire} onChange={e => setForm({...form, dire: e.target.value})} placeholder="12" style={inputStyle} /></div>
            <div><label style={labelStyle}>Penalite (%)</label><input type="number" value={form.penalite} onChange={e => setForm({...form, penalite: e.target.value})} placeholder="0" style={inputStyle} /></div>
            <div><label style={labelStyle}>Garanti</label><input value={form.garanti} onChange={e => setForm({...form, garanti: e.target.value})} placeholder="Garanti..." style={inputStyle} /></div>
          </div>

          {form.montan && (
            <div style={{ background: '#e8f5e9', borderRadius: '10px', padding: '15px', marginBottom: '20px', border: '2px solid #1a5c2a' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#1a5c2a' }}>
                Peman Chak Mwa: <span style={{ fontSize: '20px' }}>HTG {calcPeman().toLocaleString('fr-HT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                Total ap peye: HTG {(calcPeman() * parseInt(form.dire || 12)).toLocaleString('fr-HT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={addLoan} style={{ background: '#1a5c2a', color: 'white', border: 'none', borderRadius: '8px', padding: '12px 30px', cursor: 'pointer', fontWeight: '700' }}>Kreye Prè</button>
            <button onClick={() => setShowForm(false)} style={{ background: '#e0e0e0', color: '#333', border: 'none', borderRadius: '8px', padding: '12px 30px', cursor: 'pointer', fontWeight: '700' }}>Anile</button>
          </div>
        </div>
      )}

      {/* MODAL REMBOURE */}
      {showRemboure && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '30px', width: '400px', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
            <h3 style={{ margin: '0 0 20px', color: '#1a5c2a' }}>Remboure Prè</h3>
            <div style={{ background: '#e8f5e9', borderRadius: '10px', padding: '15px', marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', color: '#666', marginBottom: '5px' }}>Kliyan: <strong>{showRemboure.client}</strong></div>
              <div style={{ fontSize: '13px', color: '#666', marginBottom: '5px' }}>Montan Prè: <strong>HTG {showRemboure.montan?.toLocaleString()}</strong></div>
              <div style={{ fontSize: '13px', color: '#666' }}>Peman Chak Mwa: <strong>HTG {showRemboure.peman_chak_mwa?.toLocaleString('fr-HT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Montan Rembourseman (HTG)</label>
              <input type="number" value={montanRemboure} onChange={e => setMontanRemboure(e.target.value)} placeholder="0" style={inputStyle} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={remboure} style={{ flex: 1, background: '#1a5c2a', color: 'white', border: 'none', borderRadius: '8px', padding: '12px', cursor: 'pointer', fontWeight: '700' }}>Konfime</button>
              <button onClick={() => { setShowRemboure(null); setMontanRemboure(''); }} style={{ flex: 1, background: '#e0e0e0', color: '#333', border: 'none', borderRadius: '8px', padding: '12px', cursor: 'pointer', fontWeight: '700' }}>Anile</button>
            </div>
          </div>
        </div>
      )}

      {/* LIS PRE */}
      <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'linear-gradient(135deg, #1a5c2a, #2d8a45)' }}>
              {['Kliyan', 'Nimewo Kont', 'Montan', 'Taux', 'Dire', 'Peman/Mwa', 'Status', 'Aksyon'].map((h, i) => (
                <th key={i} style={{ padding: '15px', color: 'white', textAlign: 'left', fontSize: '13px', fontWeight: '700' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loans.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ padding: '30px', textAlign: 'center', color: '#999' }}>
                  <div style={{ fontSize: '40px', marginBottom: '10px' }}>📭</div>
                  Pa gen prè ankò
                </td>
              </tr>
            ) : (
              loans.map((loan, i) => (
                <tr key={loan.id} style={{ background: i % 2 === 0 ? '#f9f9f9' : 'white', borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '14px 15px', fontWeight: '600' }}>{loan.client}</td>
                  <td style={{ padding: '14px 15px', color: '#1a5c2a', fontWeight: '700', fontSize: '12px' }}>{loan.num_kont}</td>
                  <td style={{ padding: '14px 15px', fontWeight: '700', color: '#f39c12' }}>HTG {loan.montan?.toLocaleString()}</td>
                  <td style={{ padding: '14px 15px', color: '#666' }}>{loan.taux}%</td>
                  <td style={{ padding: '14px 15px', color: '#666' }}>{loan.dire} mwa</td>
                  <td style={{ padding: '14px 15px', fontWeight: '700', color: '#1a5c2a' }}>HTG {loan.peman_chak_mwa?.toLocaleString('fr-HT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td style={{ padding: '14px 15px' }}>
                    <span style={{ background: loan.status === 'Aktif' ? '#fff3e0' : '#e8f5e9', color: loan.status === 'Aktif' ? '#f39c12' : '#2ecc71', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
                      {loan.status === 'Aktif' ? '🔄 Aktif' : '✅ Peye'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 15px' }}>
                    {loan.status === 'Aktif' && (
                      <button onClick={() => setShowRemboure(loan)} style={{ background: '#1a5c2a', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                        Remboure
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Loans;