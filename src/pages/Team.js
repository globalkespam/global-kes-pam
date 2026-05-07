import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

function Team({ user, branches }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [form, setForm] = useState({
    name: '', prenon: '', role: 'Kesye', branch: '',
    phone: '', adres: '', nif: '', dateNesans: '',
    seks: '', email: '', numKont: '', password: '', blocked: false
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    const { data } = await supabase.from('itilizate').select('*').order('created_at', { ascending: false });
    setMembers(data || []);
    setLoading(false);
  };

  const addMember = async () => {
    if (!form.name || !form.role || !form.branch || !form.password) {
      alert('Ranpli: Non, Wol, Branch ak Modpas!');
      return;
    }
    const { error } = await supabase.from('itilizate').insert([{
      name: form.name,
      password: form.password,
      role: form.role,
      branch: form.branch,
      blocked: false,
    }]);
    if (error) { alert('Erè: ' + error.message); return; }
    fetchMembers();
    setForm({ name: '', prenon: '', role: 'Kesye', branch: '', phone: '', adres: '', nif: '', dateNesans: '', seks: '', email: '', numKont: '', password: '', blocked: false });
    setShowForm(false);
    alert('✅ Manm ajoute!');
  };

  const deleteMember = async (member) => {
    if (member.name === user?.name) { alert('Ou pa ka efase pwòp kont ou!'); return; }
    if (!window.confirm('Efase ' + member.name + '?')) return;
    await supabase.from('itilizate').delete().eq('id', member.id);
    fetchMembers();
  };

  const toggleBloke = async (member) => {
    if (member.name === user?.name) { alert('Ou pa ka bloke pwòp kont ou!'); return; }
    await supabase.from('itilizate').update({ blocked: !member.blocked }).eq('id', member.id);
    fetchMembers();
  };

  const roleColor = (role) => {
    if (role === 'Admin') return '#9b59b6';
    if (role === 'Kesye') return '#3498db';
    if (role === 'Manaje Sikisal') return '#1a5c2a';
    if (role === 'Ajan Pre') return '#f39c12';
    if (role === 'Resepsyonis') return '#e74c3c';
    return '#2ecc71';
  };

  const branchOptions = branches && branches.length > 0
    ? branches.filter(b => b.status === 'Aktif')
    : [{ nom: 'Branch Potoprens' }, { nom: 'Branch Kapo' }, { nom: 'Siege Central' }];

  const inputStyle = { width: '100%', padding: '10px', border: '2px solid #e0e0e0', borderRadius: '8px', boxSizing: 'border-box', fontSize: '13px' };
  const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px' };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', flexDirection: 'column', gap: '15px' }}>
      <div style={{ fontSize: '40px' }}>⏳</div>
      <p style={{ color: '#1a5c2a', fontWeight: '700' }}>Chaje ekip la...</p>
    </div>
  );

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
        }}>+ Ajoute Manm</button>
      </div>

      {/* STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '25px' }}>
        {[
          { label: 'Total Manm', value: members.length, icon: '👥', color: '#1a5c2a' },
          { label: 'Admin', value: members.filter(m => m.role === 'Admin').length, icon: '👑', color: '#9b59b6' },
          { label: 'Kesye', value: members.filter(m => m.role === 'Kesye').length, icon: '💼', color: '#3498db' },
          { label: 'Aktif', value: members.filter(m => !m.blocked).length, icon: '✅', color: '#2ecc71' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'white', borderRadius: '14px', padding: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', borderLeft: '5px solid ' + s.color, display: 'flex', alignItems: 'center', gap: '10px' }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '20px' }}>
            <div><label style={labelStyle}>Non Konplè</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Non konplè..." style={inputStyle} /></div>
            <div>
              <label style={labelStyle}>Wol</label>
              <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} style={inputStyle}>
                <option value="Kesye">Kesye</option>
                <option value="Admin">Admin</option>
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
                {branchOptions.map((b, i) => (
                  <option key={i} value={b.nom}>{b.nom}</option>
                ))}
              </select>
            </div>
            <div><label style={labelStyle}>Modpas</label><input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Modpas..." style={inputStyle} /></div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={addMember} style={{ background: '#1a5c2a', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 25px', cursor: 'pointer', fontWeight: '700' }}>Sove</button>
            <button onClick={() => setShowForm(false)} style={{ background: '#e0e0e0', color: '#333', border: 'none', borderRadius: '8px', padding: '10px 25px', cursor: 'pointer', fontWeight: '700' }}>Anile</button>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {showDetail && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '30px', width: '450px', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#1a5c2a' }}>Detay Manm</h2>
              <button onClick={() => setShowDetail(null)} style={{ background: '#e74c3c', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 15px', cursor: 'pointer', fontWeight: '700' }}>Fèmen</button>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #1a5c2a, #2d8a45)', borderRadius: '12px', padding: '20px', color: 'white', marginBottom: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>👤</div>
              <h3 style={{ margin: '0 0 5px' }}>{showDetail.name}</h3>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '13px' }}>{showDetail.role}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
              {[
                { label: 'Branch', value: showDetail.branch },
                { label: 'Wol', value: showDetail.role },
                { label: 'Estati', value: showDetail.blocked ? '🔒 Bloke' : '✅ Aktif' },
              ].map((item, i) => (
                <div key={i} style={{ background: '#f9f9f9', borderRadius: '8px', padding: '10px' }}>
                  <div style={{ fontSize: '11px', color: '#999', marginBottom: '3px' }}>{item.label}</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#333' }}>{item.value}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {showDetail.name !== user?.name && (
                <>
                  <button onClick={() => { toggleBloke(showDetail); setShowDetail(null); }} style={{ flex: 1, padding: '10px', background: showDetail.blocked ? '#2ecc71' : '#e74c3c', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}>
                    {showDetail.blocked ? '🔓 Debloke' : '🔒 Bloke'}
                  </button>
                  <button onClick={() => { deleteMember(showDetail); setShowDetail(null); }} style={{ flex: 1, padding: '10px', background: '#95a5a6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}>
                    🗑️ Efase
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TEAM CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
        {members.map((member) => (
          <div key={member.id} style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', borderTop: '4px solid ' + roleColor(member.role), opacity: member.blocked ? 0.7 : 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
              <div style={{ width: '50px', height: '50px', background: roleColor(member.role), borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '800', color: 'white', flexShrink: 0 }}>
                {member.name?.charAt(0)}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', color: '#333' }}>{member.name}</h3>
                <span style={{ background: roleColor(member.role), color: 'white', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>{member.role}</span>
              </div>
            </div>
            <div style={{ fontSize: '12px', color: '#666', display: 'grid', gap: '5px', marginBottom: '12px' }}>
              <div>🏦 {member.branch}</div>
              <div style={{ color: member.blocked ? '#e74c3c' : '#2ecc71', fontWeight: '700' }}>
                {member.blocked ? '🔒 Bloke' : '✅ Aktif'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '5px' }}>
              <button onClick={() => setShowDetail(member)} style={{ flex: 1, background: '#1a5c2a', color: 'white', border: 'none', borderRadius: '6px', padding: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                Detay
              </button>
              {member.name !== user?.name && (
                <>
                  <button onClick={() => toggleBloke(member)} style={{ background: member.blocked ? '#2ecc71' : '#e74c3c', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 10px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                    {member.blocked ? '🔓' : '🔒'}
                  </button>
                  <button onClick={() => deleteMember(member)} style={{ background: '#95a5a6', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 10px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                    🗑️
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Team;