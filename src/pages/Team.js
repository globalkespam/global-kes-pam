import React, { useState } from 'react';

function Team({ user }) {
  const [members, setMembers] = useState([
    { id: 1, nom: 'Jean Claude', prenon: 'Admin', role: 'Admin', branch: 'Siege Central', phone: '509-1111-2222', adres: 'Potoprens', nif: '001-234-5678', dateNesans: '1985-03-15', seks: 'Gason', email: 'admin@gkp.com', numKont: 'GKP-2026-0001', modpas: '****', status: 'Aktif' },
    { id: 2, nom: 'Marie', prenon: 'Kesye', role: 'Kesye', branch: 'Branch Potoprens', phone: '509-3333-4444', adres: 'Delmas', nif: '002-345-6789', dateNesans: '1990-07-22', seks: 'Fanm', email: 'marie@gkp.com', numKont: 'GKP-2026-0002', modpas: '****', status: 'Aktif' },
    { id: 3, nom: 'Paul', prenon: 'Kesye', role: 'Kesye', branch: 'Branch Kapo', phone: '509-5555-6666', adres: 'Kapo', nif: '003-456-7890', dateNesans: '1992-11-10', seks: 'Gason', email: 'paul@gkp.com', numKont: 'GKP-2026-0003', modpas: '****', status: 'Aktif' },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [form, setForm] = useState({
    nom: '', prenon: '', role: '', branch: '',
    phone: '', adres: '', nif: '', dateNesans: '',
    seks: '', email: '', numKont: '', modpas: ''
  });

  const addMember = () => {
    if (!form.nom || !form.role) return;
    setMembers([...members, {
      id: members.length + 1,
      ...form,
      status: 'Aktif'
    }]);
    setForm({ nom: '', prenon: '', role: '', branch: '', phone: '', adres: '', nif: '', dateNesans: '', seks: '', email: '', numKont: '', modpas: '' });
    setShowForm(false);
  };

  const roleColor = (role) => {
    if (role === 'Admin') return '#9b59b6';
    if (role === 'Kesye') return '#3498db';
    if (role === 'Manaje Sikisal') return '#1a5c2a';
    if (role === 'Ajan Pre') return '#f39c12';
    if (role === 'Resepsyonis') return '#e74c3c';
    return '#2ecc71';
  };

  const inputStyle = { width: '100%', padding: '10px', border: '2px solid #e0e0e0', borderRadius: '8px', boxSizing: 'border-box', fontSize: '13px' };
  const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' };

  return (
    <div style={{ padding: '30px', fontFamily: 'Segoe UI, sans-serif' }}>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div>
          <h1 style={{ margin: 0, color: '#1a5c2a', fontSize: '24px', fontWeight: '800' }}>Jere Ekip</h1>
          <p style={{ margin: '5px 0 0', color: '#666', fontSize: '14px' }}>{members.length} manm ekip total</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{
          background: 'linear-gradient(135deg, #1a5c2a, #2d8a45)',
          color: 'white', border: 'none', borderRadius: '10px',
          padding: '12px 24px', cursor: 'pointer', fontSize: '14px', fontWeight: '700'
        }}>Ajoute Manm</button>
      </div>

      {/* STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px', marginBottom: '25px' }}>
        {[
          { label: 'Total Manm', value: members.length, icon: '👥', color: '#1a5c2a' },
          { label: 'Admin', value: members.filter(m => m.role === 'Admin').length, icon: '👑', color: '#9b59b6' },
          { label: 'Kesye', value: members.filter(m => m.role === 'Kesye').length, icon: '💼', color: '#3498db' },
          { label: 'Ajan Pre', value: members.filter(m => m.role === 'Ajan Pre').length, icon: '📋', color: '#f39c12' },
          { label: 'Manaje', value: members.filter(m => m.role === 'Manaje Sikisal').length, icon: '🏦', color: '#1a5c2a' },
        ].map((s, i) => (
          <div key={i} style={{
            background: 'white', borderRadius: '14px', padding: '15px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
            borderLeft: '5px solid ' + s.color,
            display: 'flex', alignItems: 'center', gap: '10px'
          }}>
            <span style={{ fontSize: '24px' }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '11px', color: '#666' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* FORM */}
      {showForm && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '25px', marginBottom: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', border: '2px solid #1a5c2a' }}>
          <h3 style={{ margin: '0 0 20px', color: '#1a5c2a' }}>Ajoute Nouvo Manm</h3>

          {/* INFO PÈSONÈL */}
          <h4 style={{ color: '#1a5c2a', margin: '0 0 12px', fontSize: '13px', borderBottom: '2px solid #e8f5e9', paddingBottom: '8px' }}>Enfòmasyon Pèsonèl</h4>
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

          {/* INFO TRAVAY */}
          <h4 style={{ color: '#1a5c2a', margin: '0 0 12px', fontSize: '13px', borderBottom: '2px solid #e8f5e9', paddingBottom: '8px' }}>Enfòmasyon Travay</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={labelStyle}>Wol</label>
              <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} style={inputStyle}>
                <option value="">Chwazi wol...</option>
                <option value="Admin">Admin</option>
                <option value="Kesye">Kesye</option>
                <option value="Ajan Pre">Ajan Pre</option>
                <option value="Manaje Sikisal">Manaje Sikisal</option>
                <option value="Resepsyonis">Resepsyonis</option>
                <option value="Sipevize">Sipevize</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Branch</label>
              <select value={form.branch} onChange={e => setForm({...form, branch: e.target.value})} style={inputStyle}>
                <option value="">Chwazi Branch...</option>
                <option value="Branch Potoprens">Branch Potoprens</option>
                <option value="Branch Kapo">Branch Kapo</option>
                <option value="Siege Central">Siege Central</option>
              </select>
            </div>
            <div><label style={labelStyle}>Nimewo Kont GKP</label><input value={form.numKont} onChange={e => setForm({...form, numKont: e.target.value})} placeholder="GKP-2026-XXXX" style={inputStyle} /></div>
            <div><label style={labelStyle}>Modpas</label><input type="password" value={form.modpas} onChange={e => setForm({...form, modpas: e.target.value})} placeholder="Modpas..." style={inputStyle} /></div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={addMember} style={{ background: '#1a5c2a', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 25px', cursor: 'pointer', fontWeight: '700' }}>Sove</button>
            <button onClick={() => setShowForm(false)} style={{ background: '#e0e0e0', color: '#333', border: 'none', borderRadius: '8px', padding: '10px 25px', cursor: 'pointer', fontWeight: '700' }}>Anile</button>
          </div>
        </div>
      )}

      {/* DETAIL VIEW */}
      {showDetail && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '30px', width: '550px', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#1a5c2a' }}>Detay Manm</h2>
              <button onClick={() => setShowDetail(null)} style={{ background: '#e74c3c', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 15px', cursor: 'pointer', fontWeight: '700' }}>Fèmen</button>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #1a5c2a, #2d8a45)', borderRadius: '12px', padding: '20px', color: 'white', marginBottom: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>{showDetail.seks === 'Fanm' ? '👩' : '👨'}</div>
              <h3 style={{ margin: '0 0 5px' }}>{showDetail.nom} {showDetail.prenon}</h3>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '13px' }}>{showDetail.role}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                { label: 'Branch', value: showDetail.branch },
                { label: 'Telefon', value: showDetail.phone },
                { label: 'Email', value: showDetail.email || 'N/A' },
                { label: 'Adrès', value: showDetail.adres },
                { label: 'NIF/CIN', value: showDetail.nif },
                { label: 'Dat Nesans', value: showDetail.dateNesans },
                { label: 'Seks', value: showDetail.seks },
                { label: 'Nimewo Kont GKP', value: showDetail.numKont || 'N/A' },
                { label: 'Estati', value: showDetail.status },
              ].map((item, i) => (
                <div key={i} style={{ background: '#f9f9f9', borderRadius: '8px', padding: '10px' }}>
                  <div style={{ fontSize: '11px', color: '#999', marginBottom: '3px' }}>{item.label}</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#333' }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TEAM CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
        {members.map((member) => (
          <div key={member.id} style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', borderTop: '4px solid ' + roleColor(member.role) }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
              <div style={{ width: '50px', height: '50px', background: roleColor(member.role), borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '800', color: 'white', flexShrink: 0 }}>
                {member.nom.charAt(0)}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', color: '#333' }}>{member.nom} {member.prenon}</h3>
                <span style={{ background: roleColor(member.role), color: 'white', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>{member.role}</span>
              </div>
            </div>
            <div style={{ fontSize: '12px', color: '#666', display: 'grid', gap: '5px', marginBottom: '12px' }}>
              <div>🏦 {member.branch}</div>
              <div>📞 {member.phone}</div>
              <div>📧 {member.email || 'N/A'}</div>
              <div>📍 {member.adres}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ background: '#e8f5e9', color: '#1a5c2a', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>{member.status}</span>
              <button onClick={() => setShowDetail(member)} style={{ background: '#1a5c2a', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Wè Detay</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Team;