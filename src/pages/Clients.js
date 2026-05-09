import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

function ResiOuveti({ resi, onClose }) {
  useEffect(() => {
    const printDiv = document.getElementById('resi-direct-print');
    if (!printDiv) return;

    const row = (label, value) =>
      `<tr>
        <td style="padding:3px 4px;font-size:13px;color:#000;">${label}</td>
        <td style="padding:3px 4px;font-size:13px;font-weight:bold;color:#000;text-align:right;">${value}</td>
      </tr>`;

    printDiv.innerHTML = `
      <div style="text-align:center;margin-bottom:8px;">
        <img src="${resi.logoSrc}" style="width:100px;height:100px;object-fit:contain;" />
        <div style="font-size:16px;font-weight:bold;margin-top:3px;">RESI OUVETI KONT</div>
        <div style="font-size:13px;">Global Kes Pam — GKP</div>
      </div>
      <div style="border-top:1px dashed #000;border-bottom:1px dashed #000;padding:5px 0;margin-bottom:8px;text-align:center;">
        <div style="font-size:13px;">Nimewo Referans</div>
        <div style="font-size:14px;font-weight:bold;">${resi.ref}</div>
        <div style="font-size:13px;">${resi.date}</div>
      </div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:8px;">
        ${row('Nom du Compte:', resi.client)}
        ${row('Nimewo Kont:', resi.numKont)}
        ${row('Branch:', resi.branch)}
        ${row('Kesye:', resi.kesye)}
        ${row('Depo Inisyal:', resi.deviz + ' ' + resi.depoInisyal?.toLocaleString())}
        ${row('Fre Ouveti:', '-' + resi.deviz + ' ' + resi.fre?.toLocaleString())}
        
        </table>
      <div style="border:1px solid #000;padding:8px;text-align:center;margin-bottom:8px;">
        <div style="font-size:13px;">BALANS DISPONIB</div>
        <div style="font-size:22px;font-weight:bold;">${resi.deviz} ${resi.montan?.toLocaleString()}</div>
      </div>
      <div style="border-top:1px dashed #000;padding-top:6px;text-align:center;">
        <div style="font-size:13px;font-weight:bold;">Mesi paske ou fe pi bon Chwa</div>
        <div style="font-size:15px;font-weight:bold;">GLOBAL KES PAM</div>
        <div style="font-size:13px;">Sekirite • Ekonomize • Grandi</div>
      </div>
    `;

    window.print();
  }, [resi]);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', borderRadius: '16px', padding: '30px', textAlign: 'center', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ fontSize: '40px', marginBottom: '15px' }}>🖨️</div>
        <p style={{ color: '#1a5c2a', fontWeight: '700', marginBottom: '20px' }}>Resi ap enprime...</p>
        <button onClick={onClose} style={{ background: '#e0e0e0', color: '#333', border: 'none', borderRadius: '8px', padding: '10px 25px', cursor: 'pointer', fontWeight: '700' }}>Femen</button>
      </div>
    </div>
  );
}

function Clients({ user, kesyeOnly, parametres, branches }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [showPin, setShowPin] = useState(false);
  const [search, setSearch] = useState('');
  const [isJoint, setIsJoint] = useState(false);
  const [resi, setResi] = useState(null);
const [showEdit, setShowEdit] = useState(null);
  const isAdmin = user?.role === 'Admin';

  const [form, setForm] = useState({
    nom: '', prenon: '', adres: '', phone: '', email: '',
    nif: '', dateNesans: '', lyeNesans: '', deviz: 'HTG', seks: '',
    depoInisyal: '', pin: '', branch: ''
  });

  const [formJoint, setFormJoint] = useState({
    nom: '', prenon: '', phone: '', email: '',
    nif: '', dateNesans: '', seks: '', adres: '',
    relasyon: '', pin: ''
  });

  useEffect(() => { fetchClients(); }, []);

  const fetchClients = async () => {
    setLoading(true);
    const { data } = await supabase.from('kliyan').select('*').order('created_at', { ascending: false });
    setClients(data || []);
    setLoading(false);
  };

  const getFreOuveti = (deviz) => {
    const key = 'fre_ouveti_' + deviz;
    return parametres[key] || 300;
  };

  const generateNumKont = () => {
    const num = String(clients.length + 1).padStart(6, '0');
    return 'GKP-' + num;
  };

  const addClient = async () => {
    if (!form.nom || !form.prenon || !form.phone) return;
    const fre = getFreOuveti(form.deviz);
    const reserve = parametres.reserve_kont || 500;
    const depoInisyal = parseFloat(form.depoInisyal) || 0;

    if (depoInisyal < fre) {
      alert('Depo inisyal dwe omwen ' + form.deviz + ' ' + fre + ' (Fre ouveti)');
      return;
    }

    const balans = depoInisyal - fre;
    const numKont = generateNumKont();

    const { error } = await supabase.from('kliyan').insert([{
      num_kont: numKont,
      nom: form.nom,
      prenon: form.prenon,
      adres: form.adres,
      phone: form.phone,
      email: form.email,
      nif: form.nif,
      date_nesans: form.dateNesans,
      lye_nesans: form.lyeNesans,
      seks: form.seks,
      deviz: form.deviz,
      balance: balans,
      depo_inisyal: depoInisyal,
      fre: fre,
      reserve: reserve,
      pin: form.pin,
      branch: form.branch || user?.branch,
      status: 'Aktif',
      kont_joint: isJoint ? formJoint : null,
    }]);

    if (error) { alert('Erè: ' + error.message); return; }

    await supabase.from('benefis').insert([{
      type: 'Fre Ouveti Kont',
      montan: fre,
      source: numKont,
      ref: 'GKP-FRE-' + Date.now().toString().slice(-8),
      branch: form.branch || user?.branch,
      kesye: user?.name,
      note: 'Fre ouveti — ' + form.nom + ' ' + form.prenon,
    }]);

    await supabase.from('tranzaksyon').insert([{
      type: 'Fre Ouveti',
      num_kont: numKont,
      client: form.nom + ' ' + form.prenon,
      montan: fre,
      deviz: form.deviz,
      branch: form.branch || user?.branch,
      kesye: user?.name,
      note: 'Fre ouveti kont',
      ref: 'GKP-FRE-' + Date.now().toString().slice(-8),
      benefis: fre,
    }]);

    await supabase.from('tranzaksyon').insert([{
      type: 'Depo',
      num_kont: numKont,
      client: form.nom + ' ' + form.prenon,
      montan: balans || 0,
      deviz: form.deviz,
      branch: form.branch || user?.branch,
      kesye: user?.name,
      note: 'Depo inisyal — ouveti kont',
      ref: 'GKP-DEP-' + Date.now().toString().slice(-8),
    }]);

    fetchClients();

    const nomKliyan = form.nom + ' ' + form.prenon;
    const branchKliyan = form.branch || user?.branch;

    setForm({ nom: '', prenon: '', adres: '', phone: '', email: '', nif: '', dateNesans: '', lyeNesans: '', deviz: 'HTG', seks: '', depoInisyal: '', pin: '', branch: '' });
    setFormJoint({ nom: '', prenon: '', phone: '', email: '', nif: '', dateNesans: '', seks: '', adres: '', relasyon: '', pin: '' });
    setIsJoint(false);
    setShowForm(false);

    setResi({
      type: 'OUVETI KONT',
      logoSrc: require('../assets/logo.jpeg.jpeg'),
      ref: 'GKP-OUV-' + Date.now().toString().slice(-8),
      date: new Date().toLocaleDateString('fr-HT') + ' ' + new Date().toLocaleTimeString('fr-HT'),
      client: nomKliyan,
      numKont: numKont,
      branch: branchKliyan,
      kesye: user?.name,
      montan: balans,
      deviz: form.deviz,
      fre: fre,
      reserve: reserve,
      depoInisyal: depoInisyal,
      note: 'Ouveti Kont Nouvo',
      color: '#1a5c2a'
    });
  };

  const toggleBloke = async (client) => {
    const newStatus = client.status === 'Aktif' ? 'Bloke' : 'Aktif';
    await supabase.from('kliyan').update({ status: newStatus }).eq('id', client.id);
    fetchClients();
  };

  const changePin = async (clientId, newPin) => {
    await supabase.from('kliyan').update({ pin: newPin }).eq('id', clientId);
    fetchClients();
    setShowDetail({ ...showDetail, pin: newPin });
    alert('PIN chanje avèk siksè!');
  };

  const changeReserve = async (client, nouvoReserve) => {
    const reserve = parseFloat(nouvoReserve);
    if (isNaN(reserve) || reserve < 0) { alert('Mete yon montan valid!'); return; }
    const { error } = await supabase.from('kliyan').update({ reserve }).eq('id', client.id);
    if (!error) {
      fetchClients();
      setShowDetail({ ...showDetail, reserve });
      alert('✅ Reserve chanje — HTG ' + reserve.toLocaleString());
    }
  };

  const filtered = clients.filter(c =>
    (c.nom + ' ' + c.prenon).toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').includes(search) ||
    (c.num_kont || '').includes(search)
  );

  const inputStyle = { width: '100%', padding: '10px', border: '2px solid #e0e0e0', borderRadius: '8px', boxSizing: 'border-box', fontSize: '13px' };
  const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' };

  const branchOptions = branches && branches.length > 0
    ? branches.filter(b => b.status === 'Aktif')
    : [{ nom: 'Branch Potoprens' }, { nom: 'Branch Kapo' }, { nom: 'Siege Central' }];

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', flexDirection: 'column', gap: '15px' }}>
      <div style={{ fontSize: '40px' }}>⏳</div>
      <p style={{ color: '#1a5c2a', fontWeight: '700', fontSize: '16px' }}>Chaje kliyan yo...</p>
    </div>
  );

  return (
    <div style={{ padding: '30px', fontFamily: 'Segoe UI, sans-serif' }}>
      {resi && <ResiOuveti resi={resi} onClose={() => setResi(null)} />}

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div>
          <h1 style={{ margin: 0, color: '#1a5c2a', fontSize: '24px', fontWeight: '800' }}>Jesyon Kliyan</h1>
          <p style={{ margin: '5px 0 0', color: '#666', fontSize: '14px' }}>{clients.length} kliyan total</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setIsJoint(false); }} style={{
          background: 'linear-gradient(135deg, #1a5c2a, #2d8a45)',
          color: 'white', border: 'none', borderRadius: '10px',
          padding: '12px 24px', cursor: 'pointer', fontSize: '14px', fontWeight: '700'
        }}>Nouvo Kliyan</button>
      </div>

      {/* STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '25px' }}>
        {[
          { label: 'Total Kliyan', value: clients.length, icon: '👥', color: '#1a5c2a' },
          { label: 'Kont Aktif', value: clients.filter(c => c.status === 'Aktif').length, icon: '✅', color: '#2ecc71' },
          { label: 'Kont Joint', value: clients.filter(c => c.kont_joint).length, icon: '👫', color: '#3498db' },
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

      {/* FORM NOUVO KLIYAN */}
      {showForm && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '30px', marginBottom: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', border: '2px solid #1a5c2a' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, color: '#1a5c2a', fontSize: '18px' }}>Nouvo Kliyan</h3>
            <div style={{ background: '#e8f5e9', color: '#1a5c2a', padding: '8px 16px', borderRadius: '8px', fontWeight: '800', fontSize: '14px' }}>
              Nimewo Kont: {generateNumKont()}
            </div>
          </div>

          <h4 style={{ color: '#1a5c2a', margin: '0 0 15px', fontSize: '14px', borderBottom: '2px solid #e8f5e9', paddingBottom: '8px' }}>Enfòmasyon Pèsonèl</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '20px' }}>
            <div><label style={labelStyle}>Non</label><input value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} placeholder="Non..." style={inputStyle} /></div>
            <div><label style={labelStyle}>Prenon</label><input value={form.prenon} onChange={e => setForm({...form, prenon: e.target.value})} placeholder="Prenon..." style={inputStyle} /></div>
            <div>
              <label style={labelStyle}>Seks</label>
              <select value={form.seks} onChange={e => setForm({...form, seks: e.target.value})} style={inputStyle}>
                <option value="">Chwazi...</option>
                <option value="Gason">Gason</option>
                <option value="Fanm">Fanm</option>
              </select>
            </div>
            <div><label style={labelStyle}>Dat de Nesans</label><input type="date" value={form.dateNesans} onChange={e => setForm({...form, dateNesans: e.target.value})} style={inputStyle} /></div>
            <div><label style={labelStyle}>Lye de Nesans</label><input value={form.lyeNesans} onChange={e => setForm({...form, lyeNesans: e.target.value})} placeholder="Vil, Peyi..." style={inputStyle} /></div>
            <div><label style={labelStyle}>NIF / CIN</label><input value={form.nif} onChange={e => setForm({...form, nif: e.target.value})} placeholder="NIF oswa CIN..." style={inputStyle} /></div>
            <div><label style={labelStyle}>Adrès</label><input value={form.adres} onChange={e => setForm({...form, adres: e.target.value})} placeholder="Adres..." style={inputStyle} /></div>
            <div><label style={labelStyle}>Telefon</label><input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="509-XXXX-XXXX" style={inputStyle} /></div>
            <div><label style={labelStyle}>Email</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="email@..." style={inputStyle} /></div>
          </div>

          <h4 style={{ color: '#1a5c2a', margin: '0 0 15px', fontSize: '14px', borderBottom: '2px solid #e8f5e9', paddingBottom: '8px' }}>Enfòmasyon Kont</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={labelStyle}>Deviz Kont</label>
              <select value={form.deviz} onChange={e => setForm({...form, deviz: e.target.value})} style={inputStyle}>
                <option value="HTG">HTG - Goud Ayisyen</option>
                <option value="USD">USD - Dola Ameriken</option>
                <option value="DOP">DOP - Peso Dominiken</option>
                <option value="EUR">EUR - Euro</option>
                <option value="CAD">CAD - Dola Kanadyen</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Depo Inisyal</label>
              <input type="number" value={form.depoInisyal} onChange={e => setForm({...form, depoInisyal: e.target.value})} placeholder="Montan..." style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Fre Ouvèti (Otomatik)</label>
              <input type="text" value={form.deviz + ' ' + getFreOuveti(form.deviz)} readOnly style={{ ...inputStyle, background: '#f0f9f0', fontWeight: '700', color: '#1a5c2a', cursor: 'not-allowed' }} />
            </div>
            <div>
              <label style={labelStyle}>Reserve Bloke (Otomatik)</label>
              <input type="text" value={'HTG ' + (parametres.reserve_kont || 500)} readOnly style={{ ...inputStyle, background: '#fff3e0', fontWeight: '700', color: '#e67e22', cursor: 'not-allowed' }} />
            </div>
            <div>
              <label style={labelStyle}>Branch</label>
              <select value={form.branch} onChange={e => setForm({...form, branch: e.target.value})} style={inputStyle}>
                <option value="">Chwazi Branch...</option>
                {branchOptions.map((b, i) => (
                  <option key={i} value={b.nom}>{b.nom}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>PIN Kliyan (4 chif)</label>
              <input type="password" value={form.pin} onChange={e => setForm({...form, pin: e.target.value})} placeholder="****" maxLength="4" style={inputStyle} />
            </div>
          </div>

          {form.depoInisyal && (
            <div style={{ background: '#e8f5e9', borderRadius: '10px', padding: '15px', marginBottom: '20px', border: '2px solid #1a5c2a' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#1a5c2a', marginBottom: '8px' }}>📊 Kalkil Otomatik:</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', fontSize: '13px' }}>
                <div>💰 Depo: <strong>{form.deviz} {parseFloat(form.depoInisyal || 0).toLocaleString()}</strong></div>
                <div>💳 Fre: <strong>-{form.deviz} {getFreOuveti(form.deviz)}</strong></div>
                <div>🔒 Bloke: <strong>HTG {parametres.reserve_kont || 500}</strong></div>
                <div>✅ Disponib: <strong>{form.deviz} {Math.max(0, parseFloat(form.depoInisyal || 0) - getFreOuveti(form.deviz) - (parametres.reserve_kont || 500)).toLocaleString()} (apre 500 bloke)</strong></div>
              </div>
              <div style={{ marginTop: '10px', fontSize: '15px', fontWeight: '800', color: '#1a5c2a' }}>
                Balans Total (enkli bloke): {form.deviz} {Math.max(0, parseFloat(form.depoInisyal || 0) - getFreOuveti(form.deviz)).toLocaleString()}
              </div>
            </div>
          )}

          {/* KONT JOINT */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ border: '2px solid ' + (isJoint ? '#3498db' : '#e0e0e0'), borderRadius: '12px', padding: '20px', background: isJoint ? '#ebf5fb' : '#f9f9f9' }}>
              <div onClick={() => setIsJoint(!isJoint)} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', marginBottom: isJoint ? '20px' : '0' }}>
                <div style={{ width: '24px', height: '24px', border: '2px solid ' + (isJoint ? '#3498db' : '#ccc'), borderRadius: '6px', background: isJoint ? '#3498db' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {isJoint && <span style={{ color: 'white', fontSize: '14px', fontWeight: '800' }}>✓</span>}
                </div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '15px', color: isJoint ? '#3498db' : '#333' }}>👫 Aktive Kont Joint</div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>Toude titile ka fe retre endepandaman</div>
                </div>
              </div>
              {isJoint && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                  <div><label style={labelStyle}>Non</label><input value={formJoint.nom} onChange={e => setFormJoint({...formJoint, nom: e.target.value})} placeholder="Non..." style={inputStyle} /></div>
                  <div><label style={labelStyle}>Prenon</label><input value={formJoint.prenon} onChange={e => setFormJoint({...formJoint, prenon: e.target.value})} placeholder="Prenon..." style={inputStyle} /></div>
                  <div><label style={labelStyle}>Telefon</label><input value={formJoint.phone} onChange={e => setFormJoint({...formJoint, phone: e.target.value})} placeholder="509-XXXX-XXXX" style={inputStyle} /></div>
                  <div>
                    <label style={labelStyle}>Relasyon</label>
                    <select value={formJoint.relasyon} onChange={e => setFormJoint({...formJoint, relasyon: e.target.value})} style={inputStyle}>
                      <option value="">Chwazi...</option>
                      <option value="Mari/Madanm">Mari / Madanm</option>
                      <option value="Pitit">Pitit</option>
                      <option value="Paran">Paran</option>
                      <option value="Fre/Se">Fre / Se</option>
                      <option value="Asosye">Asosye</option>
                    </select>
                  </div>
                  <div><label style={labelStyle}>PIN (4 chif)</label><input type="password" value={formJoint.pin} onChange={e => setFormJoint({...formJoint, pin: e.target.value})} placeholder="****" maxLength="4" style={inputStyle} /></div>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={addClient} style={{ background: '#1a5c2a', color: 'white', border: 'none', borderRadius: '8px', padding: '12px 30px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>
              Kreye Kont
            </button>
            <button onClick={() => { setShowForm(false); setIsJoint(false); }} style={{ background: '#e0e0e0', color: '#333', border: 'none', borderRadius: '8px', padding: '12px 30px', cursor: 'pointer', fontWeight: '700' }}>
              Anile
            </button>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {showDetail && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '30px', width: '620px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#1a5c2a' }}>Detay Kliyan</h2>
              <div style={{ display: 'flex', gap: '10px' }}>
  {isAdmin && (
    <button onClick={() => setShowEdit(showDetail)} style={{ background: '#3498db', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 15px', cursor: 'pointer', fontWeight: '700' }}>✏️ Modifye</button>
  )}
  <button onClick={() => { setShowDetail(null); setShowPin(false); }} style={{ background: '#e74c3c', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 15px', cursor: 'pointer', fontWeight: '700' }}>Femen</button>
</div>
            </div>

            <div style={{ background: showDetail.status === 'Bloke' ? 'linear-gradient(135deg, #e74c3c, #c0392b)' : 'linear-gradient(135deg, #1a5c2a, #2d8a45)', borderRadius: '12px', padding: '20px', color: 'white', marginBottom: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>{showDetail.seks === 'Fanm' ? '👩' : '👨'}</div>
              <h3 style={{ margin: '0 0 5px' }}>{showDetail.nom} {showDetail.prenon}</h3>
              <p style={{ margin: '0 0 10px', opacity: 0.85, fontSize: '13px' }}>{showDetail.num_kont}</p>
              <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '10px', padding: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <div style={{ fontSize: '10px', opacity: 0.8 }}>BALANS TOTAL</div>
                  <div style={{ fontSize: '18px', fontWeight: '900' }}>{showDetail.deviz} {showDetail.balance?.toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', opacity: 0.8 }}>🔒 BLOKE</div>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: '#f39c12' }}>HTG {(showDetail.reserve || 500).toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', opacity: 0.8 }}>✅ DISPONIB</div>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: '#2ecc71' }}>{showDetail.deviz} {Math.max(0, (showDetail.balance || 0) - (showDetail.reserve || 500)).toLocaleString()}</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
              {[
                { label: 'Telefon', value: showDetail.phone },
                { label: 'Email', value: showDetail.email || 'N/A' },
                { label: 'Adres', value: showDetail.adres },
                { label: 'NIF/CIN', value: showDetail.nif },
                { label: 'Dat Nesans', value: showDetail.date_nesans },
                { label: 'Lye Nesans', value: showDetail.lye_nesans || 'N/A' },
                { label: 'Seks', value: showDetail.seks },
                { label: 'Branch', value: showDetail.branch },
                { label: 'Deviz', value: showDetail.deviz },
                { label: 'Depo Inisyal', value: showDetail.deviz + ' ' + showDetail.depo_inisyal },
                { label: 'Fre Ouveti', value: showDetail.deviz + ' ' + showDetail.fre },
              ].map((item, i) => (
                <div key={i} style={{ background: '#f9f9f9', borderRadius: '8px', padding: '10px' }}>
                  <div style={{ fontSize: '11px', color: '#999', marginBottom: '3px' }}>{item.label}</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#333' }}>{item.value}</div>
                </div>
              ))}
            </div>

            {/* RESERVE BLOKE */}
            {isAdmin && (
              <div style={{ background: '#f3e8ff', borderRadius: '10px', padding: '15px', marginBottom: '15px', border: '2px solid #9b59b6' }}>
                <div style={{ fontWeight: '700', color: '#9b59b6', fontSize: '14px', marginBottom: '12px' }}>
                  🔒 Jere Kòb Bloke — Aktyèl: HTG {(showDetail.reserve || 500).toLocaleString()}
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#9b59b6', marginBottom: '5px' }}>➕ Ajoute Blokaj</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="number" placeholder="Montan pou bloke..." id="ajouBlokInput"
                      style={{ flex: 1, padding: '8px 12px', border: '2px solid #9b59b6', borderRadius: '8px', fontSize: '13px' }} />
                    <button onClick={() => {
                      const input = document.getElementById('ajouBlokInput');
                      const ajout = parseFloat(input.value);
                      if (!ajout || ajout <= 0) { alert('Mete yon montan valid!'); return; }
                      changeReserve(showDetail, (showDetail.reserve || 500) + ajout);
                      input.value = '';
                    }} style={{ padding: '8px 16px', background: '#9b59b6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>
                      🔒 Bloke
                    </button>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#2ecc71', marginBottom: '5px' }}>➖ Debloke Kòb</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="number" placeholder={'Max: HTG ' + Math.max(0, (showDetail.reserve || 500) - 500)} id="deblokInput"
                      style={{ flex: 1, padding: '8px 12px', border: '2px solid #2ecc71', borderRadius: '8px', fontSize: '13px' }} />
                    <button onClick={() => {
                      const input = document.getElementById('deblokInput');
                      const retire = parseFloat(input.value);
                      const reserveMin = 500;
                      const reserveAktyel = showDetail.reserve || 500;
                      if (!retire || retire <= 0) { alert('Mete yon montan valid!'); return; }
                      const nouvoReserve = reserveAktyel - retire;
                      if (nouvoReserve < reserveMin) {
                        alert('Pa ka debloke plis!\nReserve minimòm: HTG ' + reserveMin);
                        return;
                      }
                      changeReserve(showDetail, nouvoReserve);
                      input.value = '';
                    }} style={{ padding: '8px 16px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>
                      🔓 Debloke
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* PIN */}
            <div style={{ background: '#fff3e0', borderRadius: '10px', padding: '15px', marginBottom: '15px', border: '2px solid #f39c12' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ fontWeight: '700', color: '#e67e22', fontSize: '14px' }}>🔑 PIN Kliyan</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '4px', color: '#333' }}>
                    {showPin ? showDetail.pin : '••••'}
                  </span>
                  <button onClick={() => setShowPin(!showPin)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}>
                    {showPin ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              {isAdmin && (
                <button onClick={() => {
                  const newPin = prompt('Nouvo PIN (4 chif):');
                  if (newPin && newPin.length === 4 && !isNaN(newPin)) {
                    changePin(showDetail.id, newPin);
                  } else if (newPin !== null) {
                    alert('PIN dwe gen egzakteman 4 chif!');
                  }
                }} style={{ width: '100%', padding: '8px', background: '#f39c12', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>
                  🔄 Chanje PIN
                </button>
              )}
            </div>

            {/* KONT JOINT */}
            {showDetail.kont_joint && (
              <div>
                <h4 style={{ color: '#3498db', margin: '0 0 10px' }}>👫 Titile 2 — Kont Joint</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {[
                    { label: 'Non', value: showDetail.kont_joint.nom + ' ' + showDetail.kont_joint.prenon },
                    { label: 'Telefon', value: showDetail.kont_joint.phone },
                    { label: 'Relasyon', value: showDetail.kont_joint.relasyon },
                  ].map((item, i) => (
                    <div key={i} style={{ background: '#ebf5fb', borderRadius: '8px', padding: '10px' }}>
                      <div style={{ fontSize: '11px', color: '#3498db', marginBottom: '3px' }}>{item.label}</div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#333' }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
{/* EDIT MODAL */}
{showEdit && (
  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001 }}>
    <div style={{ background: 'white', borderRadius: '20px', padding: '30px', width: '580px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: '#1a5c2a' }}>✏️ Modifye Kliyan</h2>
        <button onClick={() => setShowEdit(null)} style={{ background: '#e74c3c', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 15px', cursor: 'pointer', fontWeight: '700' }}>Femen</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
        {[
          { label: 'Non', key: 'nom' },
          { label: 'Prenon', key: 'prenon' },
          { label: 'Telefon', key: 'phone' },
          { label: 'Email', key: 'email' },
          { label: 'Adres', key: 'adres' },
          { label: 'NIF/CIN', key: 'nif' },
        ].map((item, i) => (
          <div key={i}>
            <label style={labelStyle}>{item.label}</label>
            <input
              value={showEdit[item.key] || ''}
              onChange={e => setShowEdit({...showEdit, [item.key]: e.target.value})}
              style={inputStyle}
            />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={async () => {
          const { error } = await supabase.from('kliyan').update({
            nom: showEdit.nom,
            prenon: showEdit.prenon,
            phone: showEdit.phone,
            email: showEdit.email,
            adres: showEdit.adres,
            nif: showEdit.nif,
          }).eq('id', showEdit.id);
          if (!error) {
            fetchClients();
            setShowEdit(null);
            setShowDetail(null);
            alert('✅ Enfòmasyon kliyan mete ajou!');
          }
        }} style={{ flex: 1, background: '#1a5c2a', color: 'white', border: 'none', borderRadius: '8px', padding: '12px', cursor: 'pointer', fontWeight: '700' }}>
          💾 Sove Chanjman
        </button>
        <button onClick={() => setShowEdit(null)} style={{ flex: 1, background: '#e0e0e0', color: '#333', border: 'none', borderRadius: '8px', padding: '12px', cursor: 'pointer', fontWeight: '700' }}>
          Anile
        </button>
      </div>
    </div>
  </div>
)}
      {/* SEARCH */}
      <div style={{ marginBottom: '20px' }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Chèche pa non, prenon, telefon oswa nimewo kont..."
          style={{ width: '100%', padding: '14px 16px', border: '2px solid #e0e0e0', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box' }}
        />
      </div>

      {/* TABLE */}
      <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'linear-gradient(135deg, #1a5c2a, #2d8a45)' }}>
              {['Nimewo Kont', 'Non Konple', 'Telefon', 'Deviz', 'Balans Total', 'Bloke', 'Branch', 'Estati', 'Aksyon'].map((h, i) => (
                <th key={i} style={{ padding: '15px', color: 'white', textAlign: 'left', fontSize: '13px', fontWeight: '700' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ padding: '30px', textAlign: 'center', color: '#999' }}>
                  <div style={{ fontSize: '40px', marginBottom: '10px' }}>📭</div>
                  Pa gen kliyan ankò
                </td>
              </tr>
            ) : (
              filtered.map((client, i) => (
                <tr key={client.id} style={{ background: client.status === 'Bloke' ? '#fff8f8' : (i % 2 === 0 ? '#f9f9f9' : 'white'), borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '14px 15px', fontWeight: '700', color: '#1a5c2a', fontSize: '12px' }}>{client.num_kont}</td>
                  <td style={{ padding: '14px 15px', fontWeight: '600' }}>{client.nom} {client.prenon}</td>
                  <td style={{ padding: '14px 15px', color: '#666' }}>{client.phone}</td>
                  <td style={{ padding: '14px 15px' }}>
                    <span style={{ background: client.deviz === 'USD' ? '#ebf5fb' : '#e8f5e9', color: client.deviz === 'USD' ? '#3498db' : '#1a5c2a', padding: '3px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '700' }}>
                      {client.deviz}
                    </span>
                  </td>
                  <td style={{ padding: '14px 15px' }}>
                    <div style={{ fontWeight: '700', color: '#2d8a45', fontSize: '14px' }}>{client.deviz} {client.balance?.toLocaleString()}</div>
                    <div style={{ fontSize: '11px', color: '#27ae60', marginTop: '2px' }}>
                      ✅ Disponib: {client.deviz} {Math.max(0, (client.balance || 0) - (client.reserve || 500)).toLocaleString()}
                    </div>
                  </td>
                  <td style={{ padding: '14px 15px' }}>
                    <span style={{ background: '#f3e8ff', color: '#9b59b6', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
                      🔒 HTG {(client.reserve || 500).toLocaleString()}
                    </span>
                  </td>
                  <td style={{ padding: '14px 15px' }}>
                    <span style={{ background: '#e8f5e9', color: '#1a5c2a', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                      {client.branch}
                    </span>
                  </td>
                  <td style={{ padding: '14px 15px' }}>
                    <span style={{ background: client.status === 'Bloke' ? '#fdf2f2' : '#e8f5e9', color: client.status === 'Bloke' ? '#e74c3c' : '#1a5c2a', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', border: '1px solid ' + (client.status === 'Bloke' ? '#e74c3c' : '#1a5c2a') }}>
                      {client.status === 'Bloke' ? '🔒 Bloke' : '✅ Aktif'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 15px' }}>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button onClick={() => { setShowDetail(client); setShowPin(false); }} style={{ background: '#1a5c2a', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                        Detay
                      </button>
                      {isAdmin && (
                        <button onClick={() => toggleBloke(client)} style={{ background: client.status === 'Aktif' ? '#e74c3c' : '#2ecc71', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                          {client.status === 'Aktif' ? '🔒' : '🔓'}
                        </button>
                      )}
                    </div>
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

export default Clients;