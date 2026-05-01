import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

function Settings({ user, branches, setBranches, oreKes, setOreKes, parametres, saveParametre, saveBranch, fetchBranches }) {
  const [activeTab, setActiveTab] = useState('general');
  const [successMsg, setSuccessMsg] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPassIndex, setShowPassIndex] = useState(null);
  const [showBranchForm, setShowBranchForm] = useState(false);
  const [newBranch, setNewBranch] = useState({ nom: '', adres: '', telefon: '', responsab: '' });

  const [localParams, setLocalParams] = useState({
    fre_ouveti_HTG: parametres.fre_ouveti_HTG || 300,
    fre_ouveti_USD: parametres.fre_ouveti_USD || 5,
    fre_ouveti_DOP: parametres.fre_ouveti_DOP || 150,
    fre_ouveti_EUR: parametres.fre_ouveti_EUR || 10,
    fre_ouveti_CAD: parametres.fre_ouveti_CAD || 8,
    fre_transf_enten: parametres.fre_transf_enten || 50,
    fre_transf_branch: parametres.fre_transf_branch || 150,
    reserve_kont: parametres.reserve_kont || 500,
  });

  useEffect(() => {
    setLocalParams({
      fre_ouveti_HTG: parametres.fre_ouveti_HTG || 300,
      fre_ouveti_USD: parametres.fre_ouveti_USD || 5,
      fre_ouveti_DOP: parametres.fre_ouveti_DOP || 150,
      fre_ouveti_EUR: parametres.fre_ouveti_EUR || 10,
      fre_ouveti_CAD: parametres.fre_ouveti_CAD || 8,
      fre_transf_enten: parametres.fre_transf_enten || 50,
      fre_transf_branch: parametres.fre_transf_branch || 150,
      reserve_kont: parametres.reserve_kont || 500,
    });
  }, [parametres]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await supabase.from('itilizate').select('*');
    setUsers(data || []);
    setLoading(false);
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const saveAllParams = async () => {
    for (const [cle, valeur] of Object.entries(localParams)) {
      await saveParametre(cle, valeur);
    }
    showSuccess('Tout paramèt sove nan Supabase!');
  };

  const toggleBloke = async (u) => {
    await supabase.from('itilizate').update({ blocked: !u.blocked }).eq('id', u.id);
    fetchUsers();
    showSuccess(u.blocked ? u.name + ' debloke!' : u.name + ' bloke!');
  };

  const deleteUser = async (u) => {
    if (!window.confirm('Ou vle efase ' + u.name + '?')) return;
    await supabase.from('itilizate').delete().eq('id', u.id);
    fetchUsers();
    showSuccess(u.name + ' efase!');
  };

  const changePassword = async (u, newPass) => {
    if (!newPass || newPass.length < 4) return;
    await supabase.from('itilizate').update({ password: newPass }).eq('id', u.id);
    fetchUsers();
    showSuccess('Modpas ' + u.name + ' chanje!');
  };

  const saveOreKes = async (branchNom, ore) => {
    const branch = branches.find(b => b.nom === branchNom);
    if (!branch) return;
    await saveBranch({
      id: branch.id,
      nom: branch.nom,
      adres: branch.adres,
      telefon: branch.telefon,
      responsab: branch.responsab,
      status: branch.status,
      louvri: ore.louvri,
      femen: ore.femen,
      aktif: ore.aktif,
      jou: ore.jou,
    });
    showSuccess('Ore ' + branchNom + ' sove nan Supabase!');
  };

  const addBranch = async () => {
    if (!newBranch.nom) return;
    await supabase.from('branches').insert([{
      ...newBranch,
      status: 'Aktif',
      louvri: '07:00',
      femen: '20:00',
      aktif: true,
      jou: [true,true,true,true,true,true,true],
    }]);
    fetchBranches();
    setNewBranch({ nom: '', adres: '', telefon: '', responsab: '' });
    setShowBranchForm(false);
    showSuccess('Branch ' + newBranch.nom + ' kreye!');
  };

  const deleteBranch = async (branch) => {
    if (!window.confirm('Efase branch ' + branch.nom + '?')) return;
    await supabase.from('branches').delete().eq('id', branch.id);
    fetchBranches();
    showSuccess('Branch ' + branch.nom + ' efase!');
  };

  const toggleBranchStatus = async (branch) => {
    const newStatus = branch.status === 'Aktif' ? 'Inaktif' : 'Aktif';
    await saveBranch({ ...branch, status: newStatus });
    showSuccess('Branch ' + branch.nom + ' mise a jou!');
  };

  const inputStyle = { width: '100%', padding: '10px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' };
  const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#555' };

  const tabs = [
    { id: 'general', label: 'Jeneral', icon: '⚙️' },
    { id: 'oreke', label: 'Ore Kes', icon: '🕐' },
    { id: 'users', label: 'Itilizate', icon: '👥' },
    { id: 'branches', label: 'Branch', icon: '🏦' },
    { id: 'security', label: 'Sekirite', icon: '🔒' },
  ];

  return (
    <div style={{ padding: '30px', fontFamily: 'Segoe UI, sans-serif' }}>
      <div style={{ marginBottom: '25px' }}>
        <h1 style={{ margin: 0, color: '#1a5c2a', fontSize: '24px', fontWeight: '800' }}>Paramèt Sistèm</h1>
        <p style={{ margin: '5px 0 0', color: '#666', fontSize: '14px' }}>Konfigirasyon jeneral GKP Banking System</p>
      </div>

      {successMsg && (
        <div style={{ background: '#e8f5e9', border: '2px solid #1a5c2a', borderRadius: '10px', padding: '15px', marginBottom: '20px', color: '#1a5c2a', fontWeight: '700', textAlign: 'center' }}>
          ✅ {successMsg}
        </div>
      )}

      <div style={{ display: 'flex', gap: '5px', marginBottom: '25px', background: 'white', borderRadius: '12px', padding: '5px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', width: 'fit-content' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', background: activeTab === tab.id ? '#1a5c2a' : 'transparent', color: activeTab === tab.id ? 'white' : '#666' }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* JENERAL */}
      {activeTab === 'general' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

          {/* FRE OUVETI PA DEVIZ */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', gridColumn: '1 / -1' }}>
            <h3 style={{ margin: '0 0 20px', color: '#1a5c2a', fontSize: '16px', fontWeight: '700' }}>Fre Ouveti Kont pa Deviz</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px', marginBottom: '20px' }}>
              {[
                { key: 'fre_ouveti_HTG', label: '🇭🇹 HTG', placeholder: '300' },
                { key: 'fre_ouveti_USD', label: '🇺🇸 USD', placeholder: '5' },
                { key: 'fre_ouveti_DOP', label: '🇩🇴 DOP', placeholder: '150' },
                { key: 'fre_ouveti_EUR', label: '🇪🇺 EUR', placeholder: '10' },
                { key: 'fre_ouveti_CAD', label: '🇨🇦 CAD', placeholder: '8' },
              ].map((item, i) => (
                <div key={i}>
                  <label style={labelStyle}>{item.label}</label>
                  <input
                    type="number"
                    value={localParams[item.key]}
                    onChange={e => setLocalParams({ ...localParams, [item.key]: parseFloat(e.target.value) || 0 })}
                    placeholder={item.placeholder}
                    style={inputStyle}
                  />
                </div>
              ))}
            </div>
            <button onClick={saveAllParams} style={{ background: '#1a5c2a', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 25px', cursor: 'pointer', fontWeight: '700' }}>
              💾 Sove Tout Fre yo
            </button>
          </div>

          {/* FRE TRANSFE */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
            <h3 style={{ margin: '0 0 20px', color: '#1a5c2a', fontSize: '16px', fontWeight: '700' }}>Fre Transfe</h3>
            <div style={{ marginBottom: '15px' }}>
              <label style={labelStyle}>Fre Transfe Enten (HTG)</label>
              <input type="number" value={localParams.fre_transf_enten} onChange={e => setLocalParams({ ...localParams, fre_transf_enten: parseFloat(e.target.value) || 0 })} style={inputStyle} />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={labelStyle}>Fre Transfe Branch-Branch (HTG)</label>
              <input type="number" value={localParams.fre_transf_branch} onChange={e => setLocalParams({ ...localParams, fre_transf_branch: parseFloat(e.target.value) || 0 })} style={inputStyle} />
            </div>
            <button onClick={saveAllParams} style={{ background: '#1a5c2a', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontWeight: '700' }}>
              💾 Sove
            </button>
          </div>

          {/* RESERVE */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
            <h3 style={{ margin: '0 0 20px', color: '#1a5c2a', fontSize: '16px', fontWeight: '700' }}>Reserve Obligatwa pa Kont</h3>
            <div style={{ marginBottom: '15px' }}>
              <label style={labelStyle}>Montan Bloke (HTG)</label>
              <input type="number" value={localParams.reserve_kont} onChange={e => setLocalParams({ ...localParams, reserve_kont: parseFloat(e.target.value) || 0 })} style={inputStyle} />
            </div>
            <div style={{ background: '#fff3e0', borderRadius: '8px', padding: '12px', marginBottom: '15px', fontSize: '13px', color: '#e67e22' }}>
              ⚠️ HTG {localParams.reserve_kont} bloke — kliyan pa ka retire li
            </div>
            <button onClick={saveAllParams} style={{ background: '#1a5c2a', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontWeight: '700' }}>
              💾 Sove
            </button>
          </div>
        </div>
      )}

      {/* ORE KES */}
      {activeTab === 'oreke' && (
        <div>
          <div style={{ background: '#e8f5e9', borderRadius: '12px', padding: '15px', marginBottom: '20px', border: '2px solid #1a5c2a' }}>
            <p style={{ margin: 0, color: '#1a5c2a', fontWeight: '600', fontSize: '14px' }}>
              ✅ Chanjman yo ap sove dirèkteman nan Supabase — yo ap rete menm apre ou femen app la!
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            {branches.map((branch, i) => {
              const ore = oreKes[branch.nom] || { louvri: '07:00', femen: '20:00', aktif: true, jou: [true,true,true,true,true,true,true] };
              return (
                <div key={i} style={{ background: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', borderLeft: '5px solid ' + (ore.aktif ? '#1a5c2a' : '#e74c3c') }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, color: '#1a5c2a', fontSize: '15px', fontWeight: '700' }}>🏦 {branch.nom}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#666' }}>{ore.aktif ? 'Aktif' : 'Dezaktive'}</span>
                      <div onClick={() => {
                        const newOre = { ...ore, aktif: !ore.aktif };
                        setOreKes({ ...oreKes, [branch.nom]: newOre });
                        saveOreKes(branch.nom, newOre);
                      }} style={{ width: '44px', height: '24px', background: ore.aktif ? '#1a5c2a' : '#ccc', borderRadius: '12px', cursor: 'pointer', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '2px', left: ore.aktif ? '22px' : '2px', width: '20px', height: '20px', background: 'white', borderRadius: '50%', transition: 'left 0.3s' }} />
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                    <div>
                      <label style={labelStyle}>Le Louveti</label>
                      <input type="time" value={ore.louvri} onChange={e => setOreKes({ ...oreKes, [branch.nom]: { ...ore, louvri: e.target.value } })} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Le Femti</label>
                      <input type="time" value={ore.femen} onChange={e => setOreKes({ ...oreKes, [branch.nom]: { ...ore, femen: e.target.value } })} style={inputStyle} />
                    </div>
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={labelStyle}>Jou Travay</label>
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      {['Lun', 'Mad', 'Mek', 'Jed', 'Van', 'Sam', 'Dim'].map((jou, j) => {
                        const jouAktif = ore.jou ? ore.jou[j] : true;
                        return (
                          <button key={j} onClick={() => {
                            const newJou = ore.jou ? [...ore.jou] : [true,true,true,true,true,true,true];
                            newJou[j] = !newJou[j];
                            setOreKes({ ...oreKes, [branch.nom]: { ...ore, jou: newJou } });
                          }} style={{ padding: '6px 10px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '12px', background: jouAktif ? '#1a5c2a' : '#f0f0f0', color: jouAktif ? 'white' : '#999' }}>
                            {jou}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <button onClick={() => saveOreKes(branch.nom, ore)} style={{ background: '#1a5c2a', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontWeight: '700', width: '100%' }}>
                    💾 Sove Ore nan Supabase
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ITILIZATE */}
      {activeTab === 'users' && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
          <h3 style={{ margin: '0 0 20px', color: '#1a5c2a', fontSize: '16px', fontWeight: '700' }}>Jere Itilizate</h3>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#999' }}>⏳ Chaje...</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #1a5c2a, #2d8a45)' }}>
                  {['Non', 'Wol', 'Branch', 'Estati', 'Modpas', 'Aksyon'].map((h, i) => (
                    <th key={i} style={{ padding: '12px 15px', color: 'white', textAlign: 'left', fontSize: '13px', fontWeight: '700' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id} style={{ background: i % 2 === 0 ? '#f9f9f9' : 'white', borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px 15px', fontWeight: '600' }}>{u.name}</td>
                    <td style={{ padding: '12px 15px' }}>
                      <span style={{ background: u.role === 'Admin' ? '#f3e8ff' : '#ebf5fb', color: u.role === 'Admin' ? '#9b59b6' : '#3498db', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>{u.role}</span>
                    </td>
                    <td style={{ padding: '12px 15px', color: '#666', fontSize: '13px' }}>{u.branch}</td>
                    <td style={{ padding: '12px 15px' }}>
                      <span style={{ background: u.blocked ? '#fdf2f2' : '#e8f5e9', color: u.blocked ? '#e74c3c' : '#1a5c2a', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
                        {u.blocked ? 'Bloke' : 'Aktif'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 15px' }}>
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <input
                          type={showPassIndex === i ? 'text' : 'password'}
                          defaultValue={u.password}
                          onBlur={e => { if (e.target.value !== u.password) changePassword(u, e.target.value); }}
                          style={{ padding: '6px 30px 6px 10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', width: '120px' }}
                        />
                        <button onClick={() => setShowPassIndex(showPassIndex === i ? null : i)} style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', padding: 0 }}>
                          {showPassIndex === i ? '🙈' : '👁️'}
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: '12px 15px' }}>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        {u.name !== user.name && (
                          <>
                            <button onClick={() => toggleBloke(u)} style={{ background: u.blocked ? '#2ecc71' : '#e74c3c', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}>
                              {u.blocked ? 'Debloke' : 'Bloke'}
                            </button>
                            <button onClick={() => deleteUser(u)} style={{ background: '#95a5a6', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}>
                              Efase
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* BRANCH */}
      {activeTab === 'branches' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, color: '#1a5c2a', fontSize: '16px', fontWeight: '700' }}>Jere Branch</h3>
            <button onClick={() => setShowBranchForm(!showBranchForm)} style={{ background: 'linear-gradient(135deg, #1a5c2a, #2d8a45)', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontWeight: '700' }}>
              + Nouvo Branch
            </button>
          </div>
          {showBranchForm && (
            <div style={{ background: 'white', borderRadius: '16px', padding: '25px', marginBottom: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', border: '2px solid #1a5c2a' }}>
              <h4 style={{ margin: '0 0 15px', color: '#1a5c2a' }}>Ajoute Nouvo Branch</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div><label style={labelStyle}>Non Branch</label><input value={newBranch.nom} onChange={e => setNewBranch({...newBranch, nom: e.target.value})} placeholder="Ex: Branch Okay" style={inputStyle} /></div>
                <div><label style={labelStyle}>Adres</label><input value={newBranch.adres} onChange={e => setNewBranch({...newBranch, adres: e.target.value})} placeholder="Adres konple..." style={inputStyle} /></div>
                <div><label style={labelStyle}>Telefon</label><input value={newBranch.telefon} onChange={e => setNewBranch({...newBranch, telefon: e.target.value})} placeholder="509-XXXX-XXXX" style={inputStyle} /></div>
                <div><label style={labelStyle}>Responsab</label><input value={newBranch.responsab} onChange={e => setNewBranch({...newBranch, responsab: e.target.value})} placeholder="Non responsab..." style={inputStyle} /></div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={addBranch} style={{ background: '#1a5c2a', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontWeight: '700' }}>Kreye Branch</button>
                <button onClick={() => setShowBranchForm(false)} style={{ background: '#e0e0e0', color: '#333', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontWeight: '700' }}>Anile</button>
              </div>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
            {branches.map((branch, i) => (
              <div key={i} style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', borderTop: '4px solid #1a5c2a' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <h4 style={{ margin: 0, color: '#1a5c2a', fontSize: '15px' }}>🏦 {branch.nom}</h4>
                  <span style={{ background: branch.status === 'Aktif' ? '#e8f5e9' : '#fdf2f2', color: branch.status === 'Aktif' ? '#1a5c2a' : '#e74c3c', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }}>{branch.status}</span>
                </div>
                <div style={{ fontSize: '13px', color: '#666', display: 'grid', gap: '5px', marginBottom: '12px' }}>
                  <div>📍 {branch.adres}</div>
                  <div>📞 {branch.telefon}</div>
                  <div>👤 {branch.responsab}</div>
                </div>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button onClick={() => toggleBranchStatus(branch)} style={{ flex: 1, padding: '8px', background: branch.status === 'Aktif' ? '#e74c3c' : '#2ecc71', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '11px' }}>
                    {branch.status === 'Aktif' ? 'Dezaktive' : 'Aktive'}
                  </button>
                  <button onClick={() => deleteBranch(branch)} style={{ padding: '8px 12px', background: '#95a5a6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '11px' }}>
                    Efase
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SEKIRITE */}
      {activeTab === 'security' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
            <h3 style={{ margin: '0 0 20px', color: '#1a5c2a', fontSize: '16px', fontWeight: '700' }}>Regl Sekirite</h3>
            {[
              { label: 'Reserve obligatwa', value: 'HTG ' + localParams.reserve_kont },
              { label: 'Fre ouveti HTG', value: 'HTG ' + localParams.fre_ouveti_HTG },
              { label: 'Fre ouveti USD', value: 'USD ' + localParams.fre_ouveti_USD },
              { label: 'Fre transfe enten', value: 'HTG ' + localParams.fre_transf_enten },
              { label: 'Fre transfe branch', value: 'HTG ' + localParams.fre_transf_branch },
              { label: 'PIN kliyan obligatwa', value: 'Wi' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f0f0f0', fontSize: '14px' }}>
                <span style={{ color: '#666' }}>{item.label}</span>
                <span style={{ fontWeight: '700', color: '#1a5c2a' }}>{item.value}</span>
              </div>
            ))}
          </div>
          <div style={{ background: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
            <h3 style={{ margin: '0 0 20px', color: '#1a5c2a', fontSize: '16px', fontWeight: '700' }}>Itilizate Aktif</h3>
            {users.map((u, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#333' }}>{u.name}</div>
                  <div style={{ fontSize: '11px', color: '#999' }}>{u.role} — {u.branch}</div>
                </div>
                <span style={{ background: u.blocked ? '#fdf2f2' : '#e8f5e9', color: u.blocked ? '#e74c3c' : '#1a5c2a', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }}>
                  {u.blocked ? 'Bloke' : 'Aktif'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;