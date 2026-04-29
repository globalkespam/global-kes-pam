import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

function Clients({ user, kesyeOnly }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [showPin, setShowPin] = useState(false);
  const [search, setSearch] = useState('');
  const [isJoint, setIsJoint] = useState(false);

  const isAdmin = user?.role === 'Admin';

  const [form, setForm] = useState({
    nom: '', prenon: '', adres: '', phone: '', email: '',
    nif: '', dateNesans: '', deviz: 'HTG', seks: '',
    depoInisyal: '', fre: '500', pin: '', branch: ''
  });

  const [formJoint, setFormJoint] = useState({
    nom: '', prenon: '', phone: '', email: '',
    nif: '', dateNesans: '', seks: '', adres: '',
    relasyon: '', pin: ''
  });

  // CHAJE KLIYAN DEPI SUPABASE
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('kliyan')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Erè:', error);
    } else {
      setClients(data || []);
    }
    setLoading(false);
  };

  const generateNumKont = () => {
  const num = String(clients.length + 1).padStart(6, '0');
  return 'GKP-' + num;
};

  // AJOUTE NOUVO KLIYAN
  const addClient = async () => {
    if (!form.nom || !form.prenon || !form.phone) return;
    const newClient = {
      num_kont: generateNumKont(),
      nom: form.nom,
      prenon: form.prenon,
      adres: form.adres,
      phone: form.phone,
      email: form.email,
      nif: form.nif,
      date_nesans: form.dateNesans,
      seks: form.seks,
      deviz: form.deviz,
      balance: parseFloat(form.depoInisyal) || 0,
      depo_inisyal: parseFloat(form.depoInisyal) || 0,
      fre: parseFloat(form.fre) || 500,
      pin: form.pin,
      branch: form.branch || user?.branch,
      status: 'Aktif',
      kont_joint: isJoint ? formJoint : null,
    };

    const { error } = await supabase.from('kliyan').insert([newClient]);
    if (error) {
      alert('Erè: ' + error.message);
    } else {
      fetchClients();
      setForm({ nom: '', prenon: '', adres: '', phone: '', email: '', nif: '', dateNesans: '', deviz: 'HTG', seks: '', depoInisyal: '', fre: '500', pin: '', branch: '' });
      setFormJoint({ nom: '', prenon: '', phone: '', email: '', nif: '', dateNesans: '', seks: '', adres: '', relasyon: '', pin: '' });
      setIsJoint(false);
      setShowForm(false);
    }
  };

  // BLOKE / DEBLOKE
  const toggleBloke = async (client) => {
    const newStatus = client.status === 'Aktif' ? 'Bloke' : 'Aktif';
    const { error } = await supabase
      .from('kliyan')
      .update({ status: newStatus })
      .eq('id', client.id);
    if (!error) fetchClients();
  };

  // CHANJE PIN
  const changePin = async (clientId, newPin) => {
    const { error } = await supabase
      .from('kliyan')
      .update({ pin: newPin })
      .eq('id', clientId);
    if (!error) {
      fetchClients();
      setShowDetail({ ...showDetail, pin: newPin });
      alert('PIN chanje avèk siksè!');
    }
  };

  const filtered = clients.filter(c =>
    (c.nom + ' ' + c.prenon).toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').includes(search) ||
    (c.num_kont || '').includes(search)
  );

  const inputStyle = { width: '100%', padding: '10px', border: '2px solid #e0e0e0', borderRadius: '8px', boxSizing: 'border-box', fontSize: '13px' };
  const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', flexDirection: 'column', gap: '15px' }}>
      <div style={{ fontSize: '40px' }}>⏳</div>
      <p style={{ color: '#1a5c2a', fontWeight: '700', fontSize: '16px' }}>Chaje kliyan yo...</p>
    </div>
  );

  return (
    <div style={{ padding: '30px', fontFamily: 'Segoe UI, sans-serif' }}>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div>
          <h1 style={{ margin: 0, color: '#1a5c2a', fontSize: '24px', fontWeight: '800' }}>Jesyon Kliyan</h1>
          <p style={{ margin: '5px 0 0', color: '#666', fontSize: '14px' }}>{clients.length} kliyan total</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setIsJoint(false); }} style={{ background: 'linear-gradient(135deg, #1a5c2a, #2d8a45)', color: 'white', border: 'none', borderRadius: '10px', padding: '12px 24px', cursor: 'pointer', fontSize: '14px', fontWeight: '700' }}>
          Nouvo Kliyan
        </button>
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
            <div><label style={labelStyle}>Depo Inisyal</label><input type="number" value={form.depoInisyal} onChange={e => setForm({...form, depoInisyal: e.target.value})} placeholder="Montan..." style={inputStyle} /></div>
            <div><label style={labelStyle}>Fre Ouvèti</label><input type="number" value={form.fre} onChange={e => setForm({...form, fre: e.target.value})} placeholder="500" style={inputStyle} /></div>
            <div>
              <label style={labelStyle}>Branch</label>
              <select value={form.branch} onChange={e => setForm({...form, branch: e.target.value})} style={inputStyle}>
                <option value="">Chwazi Branch...</option>
                <option value="Branch Potoprens">Branch Potoprens</option>
                <option value="Branch Kapo">Branch Kapo</option>
                <option value="Siege Central">Siege Central</option>
              </select>
            </div>
            <div><label style={labelStyle}>PIN Kliyan (4 chif)</label><input type="password" value={form.pin} onChange={e => setForm({...form, pin: e.target.value})} placeholder="****" maxLength="4" style={inputStyle} /></div>
          </div>

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
                  <div><label style={labelStyle}>Relasyon</label>
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
          <div style={{ background: 'white', borderRadius: '20px', padding: '30px', width: '580px', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#1a5c2a' }}>Detay Kliyan</h2>
              <button onClick={() => { setShowDetail(null); setShowPin(false); }} style={{ background: '#e74c3c', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 15px', cursor: 'pointer', fontWeight: '700' }}>Femen</button>
            </div>

            <div style={{ background: showDetail.status === 'Bloke' ? 'linear-gradient(135deg, #e74c3c, #c0392b)' : 'linear-gradient(135deg, #1a5c2a, #2d8a45)', borderRadius: '12px', padding: '20px', color: 'white', marginBottom: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>{showDetail.seks === 'Fanm' ? '👩' : '👨'}</div>
              <h3 style={{ margin: '0 0 5px' }}>{showDetail.nom} {showDetail.prenon}</h3>
              <p style={{ margin: '0 0 5px', opacity: 0.85, fontSize: '13px' }}>{showDetail.num_kont}</p>
              <p style={{ margin: '0 0 5px', fontSize: '22px', fontWeight: '800' }}>{showDetail.deviz} {showDetail.balance?.toLocaleString()}</p>
              <span style={{ background: showDetail.status === 'Bloke' ? '#fff3e0' : 'rgba(255,255,255,0.2)', color: showDetail.status === 'Bloke' ? '#e67e22' : 'white', padding: '4px 15px', borderRadius: '20px', fontSize: '13px', fontWeight: '700' }}>
                {showDetail.status === 'Bloke' ? '🔒 Kont Bloke' : '✅ Kont Aktif'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
              {[
                { label: 'Telefon', value: showDetail.phone },
                { label: 'Email', value: showDetail.email || 'N/A' },
                { label: 'Adres', value: showDetail.adres },
                { label: 'NIF/CIN', value: showDetail.nif },
                { label: 'Dat Nesans', value: showDetail.date_nesans },
                { label: 'Seks', value: showDetail.seks },
                { label: 'Branch', value: showDetail.branch },
                { label: 'Deviz', value: showDetail.deviz },
                { label: 'Depo Inisyal', value: showDetail.deviz + ' ' + showDetail.depo_inisyal },
                { label: 'Fre Ouveti', value: 'HTG ' + showDetail.fre },
              ].map((item, i) => (
                <div key={i} style={{ background: '#f9f9f9', borderRadius: '8px', padding: '10px' }}>
                  <div style={{ fontSize: '11px', color: '#999', marginBottom: '3px' }}>{item.label}</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#333' }}>{item.value}</div>
                </div>
              ))}
            </div>

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
              {['Nimewo Kont', 'Non Konple', 'Telefon', 'Deviz', 'Balans', 'Branch', 'Estati', 'Aksyon'].map((h, i) => (
                <th key={i} style={{ padding: '15px', color: 'white', textAlign: 'left', fontSize: '13px', fontWeight: '700' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ padding: '30px', textAlign: 'center', color: '#999' }}>
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
                  <td style={{ padding: '14px 15px', fontWeight: '700', color: '#2d8a45' }}>{client.deviz} {client.balance?.toLocaleString()}</td>
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