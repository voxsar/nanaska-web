import { useState, useEffect } from 'react';
import api from '../../api';

const EMPTY = {
  name: '', title: '', bio: '', bio2: '', imageUrl: '',
  credentials: [], specialties: [], stats: [], sortOrder: 0, active: true,
};

export default function LecturersPage() {
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | { mode: 'create'|'edit', data }
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const load = () => {
    api.get('/lecturers').then((r) => setLecturers(r.data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openCreate = () => setModal({ mode: 'create', data: { ...EMPTY } });
  const openEdit = (l) => setModal({ mode: 'edit', data: { ...l } });
  const closeModal = () => setModal(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setModal((prev) => ({
      ...prev,
      data: { ...prev.data, [name]: type === 'checkbox' ? checked : value },
    }));
  };

  const handleArrayChange = (field, value) => {
    const arr = value.split('\n').map((s) => s.trim()).filter(Boolean);
    setModal((prev) => ({ ...prev, data: { ...prev.data, [field]: arr } }));
  };

  const handleStatsChange = (value) => {
    try {
      const parsed = JSON.parse(value);
      setModal((prev) => ({ ...prev, data: { ...prev.data, stats: parsed } }));
    } catch { /* ignore invalid JSON */ }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const { data } = modal;
      if (modal.mode === 'create') {
        const res = await api.post('/lecturers', data);
        setLecturers((prev) => [...prev, res.data]);
      } else {
        const res = await api.put(`/lecturers/${data.id}`, data);
        setLecturers((prev) => prev.map((l) => (l.id === data.id ? res.data : l)));
      }
      setSuccess(`Lecturer ${modal.mode === 'create' ? 'created' : 'updated'} successfully!`);
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save lecturer');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this lecturer?')) return;
    try {
      await api.delete(`/lecturers/${id}`);
      setLecturers((prev) => prev.filter((l) => l.id !== id));
    } catch {
      alert('Failed to delete lecturer');
    }
  };

  return (
    <div>
      <div className="page-title-row">
        <h1>Lecturers</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Lecturer</button>
      </div>

      {error && <div className="admin-alert admin-alert-error">{error}</div>}
      {success && <div className="admin-alert admin-alert-success">{success}</div>}

      {loading ? (
        <div className="admin-loading">Loading…</div>
      ) : (
        <>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Photo</th>
                <th>Name</th>
                <th>Title</th>
                <th>Order</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {lecturers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((l) => (
                <tr key={l.id}>
                  <td>
                    {l.imageUrl ? (
                      <img src={l.imageUrl} alt={l.name} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: 40, height: 40, background: '#e2e8f0', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>
                    )}
                  </td>
                  <td style={{ fontWeight: 500 }}>{l.name}</td>
                  <td style={{ color: '#64748b', fontSize: '0.8rem' }}>{l.title}</td>
                  <td>{l.sortOrder}</td>
                  <td>
                    <span className={`badge ${l.active ? 'badge-green' : 'badge-red'}`}>
                      {l.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(l)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(l.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {lecturers.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8', padding: '32px' }}>No lecturers found</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {Math.ceil(lecturers.length / PAGE_SIZE) > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 16, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>
            <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Page {page} / {Math.ceil(lecturers.length / PAGE_SIZE)}</span>
            <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => p + 1)} disabled={page === Math.ceil(lecturers.length / PAGE_SIZE)}>›</button>
          </div>
        )}
        </>
      )}

      {modal && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" style={{ maxWidth: '700px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>{modal.mode === 'create' ? 'Add Lecturer' : 'Edit Lecturer'}</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>

            {error && <div className="admin-alert admin-alert-error">{error}</div>}

            <form onSubmit={handleSave}>
              <div className="admin-form-grid">
                <div className="form-group">
                  <label>Name *</label>
                  <input name="name" required value={modal.data.name} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Title *</label>
                  <input name="title" required value={modal.data.title} onChange={handleChange} />
                </div>
                <div className="form-group full">
                  <label>Image URL</label>
                  <input name="imageUrl" value={modal.data.imageUrl || ''} onChange={handleChange} placeholder="https://…" />
                </div>
                <div className="form-group full">
                  <label>Bio *</label>
                  <textarea name="bio" required value={modal.data.bio} onChange={handleChange} />
                </div>
                <div className="form-group full">
                  <label>Bio 2 (optional)</label>
                  <textarea name="bio2" value={modal.data.bio2 || ''} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Credentials (one per line)</label>
                  <textarea
                    value={Array.isArray(modal.data.credentials) ? modal.data.credentials.join('\n') : ''}
                    onChange={(e) => handleArrayChange('credentials', e.target.value)}
                    style={{ minHeight: '80px' }}
                  />
                </div>
                <div className="form-group">
                  <label>Specialties (one per line)</label>
                  <textarea
                    value={Array.isArray(modal.data.specialties) ? modal.data.specialties.join('\n') : ''}
                    onChange={(e) => handleArrayChange('specialties', e.target.value)}
                    style={{ minHeight: '80px' }}
                  />
                </div>
                <div className="form-group full">
                  <label>Stats (JSON array, e.g. [{"{"}"number":"21+","label":"Years{"}"}])</label>
                  <textarea
                    value={JSON.stringify(modal.data.stats || [], null, 2)}
                    onChange={(e) => handleStatsChange(e.target.value)}
                    style={{ minHeight: '80px', fontFamily: 'monospace', fontSize: '0.8rem' }}
                  />
                </div>
                <div className="form-group">
                  <label>Sort Order</label>
                  <input name="sortOrder" type="number" value={modal.data.sortOrder || 0} onChange={handleChange} />
                </div>
                <div className="form-group" style={{ justifyContent: 'flex-end', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                  <input
                    name="active"
                    type="checkbox"
                    id="active-check"
                    checked={modal.data.active}
                    onChange={handleChange}
                    style={{ width: 'auto' }}
                  />
                  <label htmlFor="active-check" style={{ cursor: 'pointer' }}>Active</label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : 'Save Lecturer'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
