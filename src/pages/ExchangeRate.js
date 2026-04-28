import React, { useState } from 'react';

function ExchangeRate({ user }) {
  const [rates, setRates] = useState([
    { deviz: 'USD', symbol: '$', rate: 132.50, updated: '2026-04-26 08:00' },
    { deviz: 'DOP', symbol: 'RD$', rate: 2.28, updated: '2026-04-26 08:00' },
    { deviz: 'EUR', symbol: '€', rate: 145.20, updated: '2026-04-26 08:00' },
    { deviz: 'CAD', symbol: 'C$', rate: 97.80, updated: '2026-04-26 08:00' },
  ]);

  const [editRate, setEditRate] = useState(null);
  const [newRate, setNewRate] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [convertAmount, setConvertAmount] = useState('');
  const [convertFrom, setConvertFrom] = useState('USD');
  const [convertTo, setConvertTo] = useState('HTG');

  const isAdmin = user?.role === 'Admin';

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const updateRate = (deviz) => {
    if (!newRate) return;
    setRates(rates.map(r => r.deviz === deviz
      ? { ...r, rate: parseFloat(newRate), updated: new Date().toLocaleString('fr-HT') }
      : r
    ));
    setEditRate(null);
    setNewRate('');
    showSuccess('To dechanj ' + deviz + ' mise a jou!');
  };

  const getRate = (deviz) => {
    if (deviz === 'HTG') return 1;
    const r = rates.find(r => r.deviz === deviz);
    return r ? r.rate : 1;
  };

  const convert = () => {
    if (!convertAmount) return 0;
    const amount = parseFloat(convertAmount);
    if (convertFrom === convertTo) return amount;
    const fromRate = getRate(convertFrom);
    const toRate = getRate(convertTo);
    if (convertFrom === 'HTG') return (amount / toRate).toFixed(2);
    if (convertTo === 'HTG') return (amount * fromRate).toFixed(2);
    return (amount * fromRate / toRate).toFixed(2);
  };

  const allDeviz = ['HTG', ...rates.map(r => r.deviz)];

  return (
    <div style={{ padding: '30px', fontFamily: 'Segoe UI, sans-serif' }}>
      <div style={{ marginBottom: '25px' }}>
        <h1 style={{ margin: 0, color: '#1a5c2a', fontSize: '24px', fontWeight: '800' }}>
          To Dechanj
        </h1>
        <p style={{ margin: '5px 0 0', color: '#666', fontSize: '14px' }}>
          1 HTG = ? Deviz etranje
        </p>
      </div>

      {successMsg && (
        <div style={{ background: '#e8f5e9', border: '2px solid #1a5c2a', borderRadius: '10px', padding: '15px', marginBottom: '20px', color: '#1a5c2a', fontWeight: '700', textAlign: 'center' }}>
          ✅ {successMsg}
        </div>
      )}

      {/* TO DECHANJ TABLE */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', marginBottom: '25px' }}>
        <h3 style={{ margin: '0 0 20px', color: '#1a5c2a', fontSize: '16px', fontWeight: '700' }}>
          Tablo To Dechanj (HTG)
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'linear-gradient(135deg, #1a5c2a, #2d8a45)' }}>
              {['Deviz', 'Senbòl', '1 HTG =', 'Dènye Mizajou', isAdmin ? 'Aksyon' : ''].map((h, i) => (
                <th key={i} style={{ padding: '12px 15px', color: 'white', textAlign: 'left', fontSize: '13px', fontWeight: '700' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr style={{ background: '#f9f9f9', borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '12px 15px', fontWeight: '700', color: '#1a5c2a' }}>HTG</td>
              <td style={{ padding: '12px 15px', color: '#666' }}>G</td>
              <td style={{ padding: '12px 15px', fontWeight: '700' }}>1.00 HTG</td>
              <td style={{ padding: '12px 15px', color: '#666', fontSize: '12px' }}>—</td>
              {isAdmin && <td></td>}
            </tr>
            {rates.map((r, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? 'white' : '#f9f9f9', borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px 15px', fontWeight: '700', color: '#3498db' }}>{r.deviz}</td>
                <td style={{ padding: '12px 15px', color: '#666' }}>{r.symbol}</td>
                <td style={{ padding: '12px 15px' }}>
                  {editRate === r.deviz ? (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="number"
                        value={newRate}
                        onChange={e => setNewRate(e.target.value)}
                        placeholder={r.rate}
                        style={{ width: '100px', padding: '6px', border: '2px solid #1a5c2a', borderRadius: '6px', fontSize: '13px' }}
                      />
                      <button onClick={() => updateRate(r.deviz)} style={{ background: '#1a5c2a', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}>
                        OK
                      </button>
                      <button onClick={() => setEditRate(null)} style={{ background: '#e0e0e0', color: '#333', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px' }}>
                        X
                      </button>
                    </div>
                  ) : (
                    <span style={{ fontWeight: '700', color: '#333' }}>{r.rate.toFixed(4)} {r.deviz}</span>
                  )}
                </td>
                <td style={{ padding: '12px 15px', color: '#666', fontSize: '12px' }}>{r.updated}</td>
                {isAdmin && (
                  <td style={{ padding: '12px 15px' }}>
                    <button onClick={() => { setEditRate(r.deviz); setNewRate(r.rate); }} style={{ background: '#3498db', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>
                      Modifye
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* KONVERTISÈ */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
        <h3 style={{ margin: '0 0 20px', color: '#1a5c2a', fontSize: '16px', fontWeight: '700' }}>
          Konvertisè Rapid
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr auto', gap: '15px', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#555' }}>Montan</label>
            <input
              type="number"
              value={convertAmount}
              onChange={e => setConvertAmount(e.target.value)}
              placeholder="0.00"
              style={{ width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#555' }}>De</label>
            <select value={convertFrom} onChange={e => setConvertFrom(e.target.value)} style={{ padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px' }}>
              {allDeviz.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div style={{ textAlign: 'center', paddingBottom: '12px', fontSize: '20px', color: '#1a5c2a', fontWeight: '800' }}>→</div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#555' }}>Vè</label>
            <select value={convertTo} onChange={e => setConvertTo(e.target.value)} style={{ padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px' }}>
              {allDeviz.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
        {convertAmount && (
          <div style={{ marginTop: '20px', background: 'linear-gradient(135deg, #1a5c2a, #2d8a45)', borderRadius: '12px', padding: '20px', textAlign: 'center', color: 'white' }}>
            <div style={{ fontSize: '14px', opacity: 0.85, marginBottom: '5px' }}>
              {convertAmount} {convertFrom} =
            </div>
            <div style={{ fontSize: '32px', fontWeight: '900' }}>
              {convert()} {convertTo}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ExchangeRate;