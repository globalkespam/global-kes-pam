import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import logo from '../assets/logo.jpeg.jpeg';

function Transactions({ user, parametres }) {
  const [activeTab, setActiveTab] = useState('depo');
  const [resi, setResi] = useState(null);
  const [clients, setClients] = useState([]);

  const [depoSearch, setDepoSearch] = useState('');
  const [depoClient, setDepoClient] = useState(null);
  const [depoAmount, setDepoAmount] = useState('');
  const [depoMode, setDepoMode] = useState('Cash');
  const [depoNote, setDepoNote] = useState('');

  const [retreSearch, setRetreSearch] = useState('');
  const [retreClient, setRetreClient] = useState(null);
  const [retreAmount, setRetreAmount] = useState('');
  const [retrePin, setRetrePin] = useState('');
  const [retreNote, setRetreNote] = useState('');
  const [retreError, setRetreError] = useState('');

  const [transType, setTransType] = useState('kont-kont');
  const [transSous, setTransSous] = useState('');
  const [transDest, setTransDest] = useState('');
  const [transAmount, setTransAmount] = useState('');
  const [transNote, setTransNote] = useState('');

  const freTransfEten = parametres?.fre_transf_enten || 50;
  const freTransfBranch = parametres?.fre_transf_branch || 150;
  const reserveKont = parametres?.reserve_kont || 500;
  const transFre = transType === 'kont-kont' ? freTransfEten : freTransfBranch;

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    const { data } = await supabase.from('kliyan').select('*');
    setClients(data || []);
  };

  const generateRef = () => 'GKP-' + Date.now().toString().slice(-8);

  const now = () => {
    const d = new Date();
    return d.toLocaleDateString('fr-HT') + ' ' + d.toLocaleTimeString('fr-HT');
  };

  const findClient = (search) => clients.find(c =>
    c.num_kont?.toLowerCase().includes(search.toLowerCase()) ||
    (c.nom + ' ' + c.prenon).toLowerCase().includes(search.toLowerCase())
  );

  const handleDepoSearch = () => setDepoClient(findClient(depoSearch) || null);
  const handleRetreSearch = () => { setRetreClient(findClient(retreSearch) || null); setRetreError(''); };

  const handleDepo = async () => {
    if (!depoClient || !depoAmount) return;
    const montan = parseFloat(depoAmount);

    await supabase.from('kliyan').update({ balance: (depoClient.balance || 0) + montan }).eq('id', depoClient.id);

    await supabase.from('tranzaksyon').insert([{
      type: 'Depo',
      num_kont: depoClient.num_kont,
      client: depoClient.nom + ' ' + depoClient.prenon,
      montan: montan,
      deviz: depoClient.deviz,
      branch: user?.branch,
      kesye: user?.name,
      note: depoNote,
      ref: generateRef(),
    }]);

    setResi({
      type: 'DEPO', ref: generateRef(), date: now(),
      client: depoClient.nom + ' ' + depoClient.prenon,
      numKont: depoClient.num_kont,
      branch: user?.branch, kesye: user?.name,
      montan, deviz: depoClient.deviz,
      mode: depoMode, note: depoNote, color: '#1a5c2a'
    });

    fetchClients();
    setDepoSearch(''); setDepoClient(null); setDepoAmount(''); setDepoNote('');
  };

  const handleRetre = async () => {
    if (!retreClient || !retreAmount) return;
    if (retrePin !== retreClient.pin) { setRetreError('PIN enkòrèk!'); return; }

    const montan = parseFloat(retreAmount);
    const reserveKliyan = retreClient.reserve || reserveKont;
    const balansDisponib = (retreClient.balance || 0) - reserveKliyan;

    if (montan > balansDisponib) {
      setRetreError('Balans ensifizan! Disponib: ' + retreClient.deviz + ' ' + balansDisponib.toLocaleString() + ' (HTG ' + reserveKliyan + ' rezève bloke)');
      return;
    }

    await supabase.from('kliyan').update({ balance: retreClient.balance - montan }).eq('id', retreClient.id);

    await supabase.from('tranzaksyon').insert([{
      type: 'Retre',
      num_kont: retreClient.num_kont,
      client: retreClient.nom + ' ' + retreClient.prenon,
      montan, deviz: retreClient.deviz,
      branch: user?.branch, kesye: user?.name,
      note: retreNote, ref: generateRef(),
    }]);

    setResi({
      type: 'RETRE', ref: generateRef(), date: now(),
      client: retreClient.nom + ' ' + retreClient.prenon,
      numKont: retreClient.num_kont,
      branch: user?.branch, kesye: user?.name,
      montan, deviz: retreClient.deviz,
      note: retreNote, color: '#e74c3c'
    });

    fetchClients();
    setRetreSearch(''); setRetreClient(null); setRetreAmount('');
    setRetrePin(''); setRetreNote(''); setRetreError('');
  };

  const handleTransfere = async () => {
    if (!transSous || !transDest || !transAmount) return;
    const montan = parseFloat(transAmount);
    const fre = transFre;

    const kontSous = clients.find(c => c.num_kont === transSous);
    const kontDest = clients.find(c => c.num_kont === transDest);

    if (!kontSous) { alert('Kont sous pa jwenn!'); return; }
    if (!kontDest) { alert('Kont destinatè pa jwenn!'); return; }

    const balansDisponib = (kontSous.balance || 0) - reserveKont;
    if (montan + fre > balansDisponib) {
      alert('Balans ensifizan! Disponib: ' + kontSous.deviz + ' ' + balansDisponib.toLocaleString());
      return;
    }

    await supabase.from('kliyan').update({ balance: kontSous.balance - montan - fre }).eq('id', kontSous.id);
    await supabase.from('kliyan').update({ balance: kontDest.balance + montan }).eq('id', kontDest.id);

    // Sove fre transfe kòm benefis
    await supabase.from('tranzaksyon').insert([{
      type: 'Transfere',
      num_kont: transSous,
      kont_dest: transDest,
      client: kontSous.nom + ' ' + kontSous.prenon,
      montan, fre,
      deviz: 'HTG',
      branch: user?.branch, kesye: user?.name,
      note: transNote, ref: generateRef(),
    }]);

    setResi({
      type: 'TRANSFERE', ref: generateRef(), date: now(),
      kontSous: transSous, kontDest: transDest,
      branch: user?.branch, kesye: user?.name,
      montan, fre, deviz: 'HTG',
      note: transNote, color: '#f39c12'
    });

    fetchClients();
    setTransSous(''); setTransDest(''); setTransAmount(''); setTransNote('');
  };

  const inputStyle = { width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' };
  const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '12px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' };

  const ClientCard = ({ client }) => (
    <div style={{ background: '#e8f5e9', borderRadius: '10px', padding: '15px', marginTop: '15px', border: '2px solid #1a5c2a' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '45px', height: '45px', background: '#1a5c2a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '18px' }}>
          {client.nom?.charAt(0)}
        </div>
        <div>
          <div style={{ fontWeight: '700', fontSize: '16px', color: '#1a5c2a' }}>{client.nom} {client.prenon}</div>
          <div style={{ fontSize: '13px', color: '#666' }}>{client.num_kont} • {client.branch}</div>
          <div style={{ fontSize: '15px', fontWeight: '800', color: '#1a5c2a', marginTop: '3px' }}>
            Balans Total: {client.deviz} {client.balance?.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#e67e22', marginTop: '2px' }}>
            🔒 Reserve: HTG {reserveKont} | ✅ Disponib: {client.deviz} {Math.max(0, (client.balance || 0) - reserveKont).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );

  const ResiModal = ({ resi, onClose }) => (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
      <div style={{ background: 'white', borderRadius: '16px', width: '380px', maxHeight: '90vh', boxShadow: '0 25px 60px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ background: resi.color, padding: '20px', textAlign: 'center', color: 'white', flexShrink: 0 }}>
          <img src={logo} alt="GKP" style={{ width: '65px', height: '65px', objectFit: 'contain', borderRadius: '10px', background: 'white', padding: '4px', marginBottom: '8px' }} />
          <h3 style={{ margin: '0 0 3px', fontSize: '18px', fontWeight: '800' }}>RESI {resi.type}</h3>
          <p style={{ margin: 0, opacity: 0.85, fontSize: '12px' }}>Global Kes Pam — GKP</p>
        </div>
        <div style={{ padding: '20px', fontFamily: 'monospace', overflowY: 'auto', flex: 1 }}>
          <div style={{ borderBottom: '2px dashed #eee', paddingBottom: '12px', marginBottom: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#999' }}>Nimewo Referans</div>
            <div style={{ fontSize: '16px', fontWeight: '800', color: '#333' }}>{resi.ref}</div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '3px' }}>{resi.date}</div>
          </div>
          <div style={{ marginBottom: '12px' }}>
            {resi.type !== 'TRANSFERE' ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}><span style={{ color: '#999' }}>Kliyan:</span><span style={{ fontWeight: '700' }}>{resi.client}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}><span style={{ color: '#999' }}>Nimewo Kont:</span><span style={{ fontWeight: '700' }}>{resi.numKont}</span></div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}><span style={{ color: '#999' }}>Kont Sous:</span><span style={{ fontWeight: '700' }}>{resi.kontSous}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}><span style={{ color: '#999' }}>Kont Dest.:</span><span style={{ fontWeight: '700' }}>{resi.kontDest}</span></div>
              </>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}><span style={{ color: '#999' }}>Branch:</span><span style={{ fontWeight: '700' }}>{resi.branch}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}><span style={{ color: '#999' }}>Kesye:</span><span style={{ fontWeight: '700' }}>{resi.kesye}</span></div>
            {resi.mode && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}><span style={{ color: '#999' }}>Mod Peman:</span><span style={{ fontWeight: '700' }}>{resi.mode}</span></div>}
          </div>
          <div style={{ background: '#f9f9f9', borderRadius: '10px', padding: '15px', textAlign: 'center', marginBottom: '12px' }}>
            <div style={{ fontSize: '11px', color: '#999', marginBottom: '3px' }}>MONTAN</div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: resi.color }}>{resi.deviz} {resi.montan?.toLocaleString()}</div>
            {resi.fre > 0 && <div style={{ fontSize: '12px', color: '#e74c3c', marginTop: '3px' }}>Fre: HTG {resi.fre?.toLocaleString()}</div>}
          </div>
          {resi.note && <div style={{ fontSize: '12px', color: '#666', textAlign: 'center', marginBottom: '12px', fontStyle: 'italic' }}>Not: {resi.note}</div>}
          <div style={{ borderTop: '2px dashed #eee', paddingTop: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#1a5c2a', marginBottom: '5px' }}>Mesi paske ou fe pi bon Chwa</div>
            <div style={{ fontSize: '16px', fontWeight: '900', color: '#1a5c2a', marginBottom: '4px' }}>GLOBAL KES PAM</div>
            <div style={{ fontSize: '12px', color: '#c9a84c', fontWeight: '700', letterSpacing: '1px' }}>Sekirite • Ekonomize • Grandi</div>
          </div>
        </div>
        <div style={{ padding: '15px 20px', display: 'flex', gap: '10px', borderTop: '1px solid #eee', flexShrink: 0 }}>
          <button onClick={() => window.print()} style={{ flex: 1, padding: '12px', background: resi.color, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>Enprime Resi</button>
          <button onClick={onClose} style={{ flex: 1, padding: '12px', background: '#f0f0f0', color: '#333', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>Femen</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '30px', fontFamily: 'Segoe UI, sans-serif', background: '#f5f5f5', minHeight: '100vh' }}>
      {resi && <ResiModal resi={resi} onClose={() => setResi(null)} />}

      <div style={{ display: 'flex', marginBottom: '25px', background: 'white', borderRadius: '12px', padding: '5px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', width: 'fit-content' }}>
        {[
          { id: 'depo', label: 'Depo', icon: '💰', color: '#1a5c2a' },
          { id: 'retre', label: 'Retre', icon: '💸', color: '#e74c3c' },
          { id: 'transfere', label: 'Transfe', icon: '🔄', color: '#f39c12' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: '12px 30px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', background: activeTab === tab.id ? tab.color : 'transparent', color: activeTab === tab.id ? 'white' : '#666' }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* DEPO */}
      {activeTab === 'depo' && (
        <div>
          <h2 style={{ margin: '0 0 20px', color: '#333', fontSize: '20px' }}>💰 Depo</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ background: 'white', borderRadius: '12px', padding: '25px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#999', letterSpacing: '1px', marginBottom: '15px' }}>JWENN KLIYAN</div>
              <label style={labelStyle}>Nimewo Kont / Non</label>
              <input value={depoSearch} onChange={e => setDepoSearch(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleDepoSearch()} placeholder="GKP-XXXX oswa Non..." style={inputStyle} />
              <button onClick={handleDepoSearch} style={{ marginTop: '10px', padding: '10px 20px', background: 'white', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#3498db' }}>🔍 Cheche</button>
              {depoClient && <ClientCard client={depoClient} />}
              {depoSearch && !depoClient && <div style={{ marginTop: '15px', color: '#e74c3c', fontSize: '13px' }}>Kliyan pa jwenn</div>}
            </div>
            <div style={{ background: 'white', borderRadius: '12px', padding: '25px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#999', letterSpacing: '1px', marginBottom: '15px' }}>DETAY DEPO</div>
              <div style={{ marginBottom: '15px' }}>
                <label style={labelStyle}>Montan</label>
                <input type="number" value={depoAmount} onChange={e => setDepoAmount(e.target.value)} placeholder="0.00" style={inputStyle} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={labelStyle}>Mod Peman</label>
                <select value={depoMode} onChange={e => setDepoMode(e.target.value)} style={inputStyle}>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Virement">Virement</option>
                  <option value="Mobile Money">Mobile Money</option>
                </select>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Not</label>
                <input value={depoNote} onChange={e => setDepoNote(e.target.value)} placeholder="..." style={inputStyle} />
              </div>
              <button onClick={handleDepo} disabled={!depoClient || !depoAmount} style={{ background: !depoClient || !depoAmount ? '#ccc' : '#1a5c2a', color: 'white', border: 'none', borderRadius: '8px', padding: '14px 25px', cursor: !depoClient || !depoAmount ? 'not-allowed' : 'pointer', fontWeight: '700', fontSize: '14px' }}>
                Konfime Depo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RETRE */}
      {activeTab === 'retre' && (
        <div>
          <h2 style={{ margin: '0 0 20px', color: '#333', fontSize: '20px' }}>💸 Retre</h2>
          <div style={{ background: '#fff3e0', borderRadius: '10px', padding: '12px 15px', marginBottom: '20px', border: '1px solid #f39c12', fontSize: '13px', color: '#e67e22', fontWeight: '600' }}>
            ⚠️ HTG {reserveKont} rezève bloke sou chak kont — kliyan pa ka retire li!
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ background: 'white', borderRadius: '12px', padding: '25px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#999', letterSpacing: '1px', marginBottom: '15px' }}>JWENN KLIYAN</div>
              <label style={labelStyle}>Nimewo Kont / Non</label>
              <input value={retreSearch} onChange={e => setRetreSearch(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleRetreSearch()} placeholder="GKP-XXXX oswa Non..." style={inputStyle} />
              <button onClick={handleRetreSearch} style={{ marginTop: '10px', padding: '10px 20px', background: 'white', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#3498db' }}>🔍 Cheche</button>
              {retreClient && <ClientCard client={retreClient} />}
              {retreSearch && !retreClient && <div style={{ marginTop: '15px', color: '#e74c3c', fontSize: '13px' }}>Kliyan pa jwenn</div>}
            </div>
            <div style={{ background: 'white', borderRadius: '12px', padding: '25px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#999', letterSpacing: '1px', marginBottom: '15px' }}>DETAY RETRE</div>
              <div style={{ marginBottom: '15px' }}>
                <label style={labelStyle}>Montan</label>
                <input type="number" value={retreAmount} onChange={e => setRetreAmount(e.target.value)} placeholder="0.00" style={inputStyle} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={labelStyle}>PIN</label>
                <input type="password" value={retrePin} onChange={e => setRetrePin(e.target.value)} placeholder="••••" maxLength="4" style={inputStyle} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Not</label>
                <input value={retreNote} onChange={e => setRetreNote(e.target.value)} placeholder="..." style={inputStyle} />
              </div>
              {retreError && <div style={{ background: '#fdf2f2', color: '#e74c3c', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '13px', fontWeight: '600' }}>{retreError}</div>}
              <button onClick={handleRetre} disabled={!retreClient || !retreAmount} style={{ background: !retreClient || !retreAmount ? '#ccc' : '#e74c3c', color: 'white', border: 'none', borderRadius: '8px', padding: '14px 25px', cursor: !retreClient || !retreAmount ? 'not-allowed' : 'pointer', fontWeight: '700', fontSize: '14px' }}>
                Konfime Retre
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TRANSFERE */}
      {activeTab === 'transfere' && (
        <div>
          <h2 style={{ margin: '0 0 20px', color: '#333', fontSize: '20px' }}>🔄 Transfe</h2>
          <div style={{ display: 'flex', gap: '0', marginBottom: '20px', background: '#f5f5f5', borderRadius: '10px', padding: '4px', width: 'fit-content' }}>
            {[{ id: 'kont-kont', label: 'Kont → Kont' }, { id: 'branch-branch', label: 'Branch → Branch' }].map(t => (
              <button key={t.id} onClick={() => setTransType(t.id)} style={{ padding: '10px 25px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', background: transType === t.id ? 'white' : 'transparent', color: transType === t.id ? '#333' : '#999', boxShadow: transType === t.id ? '0 2px 8px rgba(0,0,0,0.1)' : 'none' }}>
                {t.label}
              </button>
            ))}
          </div>
          <div style={{ background: 'white', borderRadius: '12px', padding: '25px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div><label style={labelStyle}>Kont Sous</label><input value={transSous} onChange={e => setTransSous(e.target.value)} placeholder="GKP-XXXX" style={inputStyle} /></div>
              <div><label style={labelStyle}>Kont Destinatè</label><input value={transDest} onChange={e => setTransDest(e.target.value)} placeholder="GKP-XXXX" style={inputStyle} /></div>
              <div><label style={labelStyle}>Montan</label><input type="number" value={transAmount} onChange={e => setTransAmount(e.target.value)} placeholder="0.00" style={inputStyle} /></div>
              <div>
                <label style={labelStyle}>Fre Transfe (HTG)</label>
                <input type="number" value={transFre} readOnly style={{ ...inputStyle, background: '#f0f9f0', fontWeight: '700', color: '#1a5c2a' }} />
                <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
                  {transType === 'kont-kont' ? 'Fre enten: HTG ' + freTransfEten : 'Fre branch: HTG ' + freTransfBranch}
                </div>
              </div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Not</label>
              <input value={transNote} onChange={e => setTransNote(e.target.value)} placeholder="..." style={inputStyle} />
            </div>
            <button onClick={handleTransfere} disabled={!transSous || !transDest || !transAmount} style={{ background: !transSous || !transDest || !transAmount ? '#ccc' : '#f39c12', color: 'white', border: 'none', borderRadius: '8px', padding: '14px 25px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>
              Fe Transfe
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Transactions;