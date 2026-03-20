import { useState, useEffect } from 'react';
import api from '../../api';

const EMPTY_FORM = {
  studentName: '', country: '', flag: '', tag: 'SCS', exam: '', period: '',
  year: new Date().getFullYear(), marks: '', imageUrl: '', quote: '',
  videoUrl: '', badge: '', isPrizeWinner: false, published: true, sortOrder: 0,
};

export default function TestimonialsAdminPage() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = () => {
    setLoading(true);
    api.get('/testimonials?published=false')
      .then((r) => setTestimonials(r.data))
      .catch(() => setError('Failed to load testimonials'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const openEdit = (t) => {
    setEditing(t.id);
    setForm({
      studentName: t.studentName || '',
      country: t.country || '',
      flag: t.flag || '',
      tag: t.tag || 'SCS',
      exam: t.exam || '',
      period: t.period || '',
      year: t.year || new Date().getFullYear(),
      marks: t.marks ?? '',
      imageUrl: t.imageUrl || '',
      quote: t.quote || '',
      videoUrl: t.videoUrl || '',
      badge: t.badge || '',
      isPrizeWinner: t.isPrizeWinner || false,
      published: t.published !== false,
      sortOrder: t.sortOrder ?? 0,
    });
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        year: Number(form.year),
        marks: form.marks !== '' ? Number(form.marks) : undefined,
        sortOrder: Number(form.sortOrder),
        videoUrl: form.videoUrl || undefined,
        badge: form.badge || undefined,
        imageUrl: form.imageUrl || undefined,
      };
      if (editing) {
        await api.put(`/testimonials/${editing}`, payload);
      } else {
        await api.post('/testimonials', payload);
      }
      setSuccess(editing ? 'Testimonial updated!' : 'Testimonial created!');
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete testimonial from ${name}?`)) return;
    try {
      await api.delete(`/testimonials/${id}`);
      setSuccess('Deleted successfully');
      load();
    } catch {
      setError('Delete failed');
    }
  };

  const toggleField = async (t, field) => {
    try {
      await api.put(`/testimonials/${t.id}`, { [field]: !t[field] });
      load();
    } catch {
      setError('Update failed');
    }
  };

  if (loading) return <div className="admin-loading">Loading…</div>;

  return (
    <div>
      <div className="page-title-row">
        <h1>Testimonials</h1>
        <button className="btn btn-primary" onClick={openNew}>+ Add Testimonial</button>
      </div>

      {success && <div className="admin-alert admin-alert-success">{success}</div>}
      {error && <div className="admin-alert admin-alert-error">{error}</div>}

      {showForm && (
        <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
          <p className="admin-card-title">{editing ? 'Edit Testimonial' : 'New Testimonial'}</p>
          <form onSubmit={handleSave}>
            <div className="admin-form-grid">
              <div className="form-group">
                <label>Student Name *</label>
                <input name="studentName" value={form.studentName} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Country *</label>
                <input name="country" value={form.country} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Flag Emoji</label>
                <input name="flag" value={form.flag} onChange={handleChange} placeholder="🇱🇰" />
              </div>
              <div className="form-group">
                <label>Tag *</label>
                <select name="tag" value={form.tag} onChange={handleChange}>
                  <option value="SCS">SCS</option>
                  <option value="MCS">MCS</option>
                  <option value="OCS">OCS</option>
                </select>
              </div>
              <div className="form-group">
                <label>Exam *</label>
                <input name="exam" value={form.exam} onChange={handleChange} required placeholder="Strategic Case Study" />
              </div>
              <div className="form-group">
                <label>Period *</label>
                <input name="period" value={form.period} onChange={handleChange} required placeholder="Aug 2024" />
              </div>
              <div className="form-group">
                <label>Year *</label>
                <input type="number" name="year" value={form.year} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Marks</label>
                <input type="number" name="marks" value={form.marks} onChange={handleChange} placeholder="Optional" />
              </div>
              <div className="form-group">
                <label>Image URL</label>
                <input name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="https://..." />
              </div>
              <div className="form-group">
                <label>Video URL</label>
                <input name="videoUrl" value={form.videoUrl} onChange={handleChange} placeholder="https://..." />
              </div>
              <div className="form-group">
                <label>Badge</label>
                <input name="badge" value={form.badge} onChange={handleChange} placeholder="Prize Winner" />
              </div>
              <div className="form-group">
                <label>Sort Order</label>
                <input type="number" name="sortOrder" value={form.sortOrder} onChange={handleChange} />
              </div>
            </div>
            <div className="form-group" style={{ marginTop: '0.75rem' }}>
              <label>Quote *</label>
              <textarea name="quote" value={form.quote} onChange={handleChange} rows={4} required />
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', margin: '0.75rem 0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" name="isPrizeWinner" checked={form.isPrizeWinner} onChange={handleChange} />
                Prize Winner
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" name="published" checked={form.published} onChange={handleChange} />
                Published
              </label>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-card">
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Country</th>
                <th>Tag</th>
                <th>Exam</th>
                <th>Period</th>
                <th>Marks</th>
                <th>Badge</th>
                <th>🏅</th>
                <th>Published</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {testimonials.map((t) => (
                <tr key={t.id}>
                  <td>{t.studentName}</td>
                  <td>{t.flag} {t.country}</td>
                  <td><span className={`badge badge--${t.tag?.toLowerCase()}`}>{t.tag}</span></td>
                  <td style={{ maxWidth: 160, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.exam}</td>
                  <td>{t.period}</td>
                  <td>{t.marks ?? '—'}</td>
                  <td style={{ fontSize: '0.8rem' }}>{t.badge || '—'}</td>
                  <td>
                    <button
                      className={`btn btn-xs ${t.isPrizeWinner ? 'btn-warning' : 'btn-outline'}`}
                      onClick={() => toggleField(t, 'isPrizeWinner')}
                      title="Toggle prize winner"
                    >
                      {t.isPrizeWinner ? '🏅' : '○'}
                    </button>
                  </td>
                  <td>
                    <button
                      className={`btn btn-xs ${t.published ? 'btn-success' : 'btn-outline'}`}
                      onClick={() => toggleField(t, 'published')}
                    >
                      {t.published ? '✓' : '○'}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="btn btn-xs btn-secondary" onClick={() => openEdit(t)}>Edit</button>
                      <button className="btn btn-xs btn-danger" onClick={() => handleDelete(t.id, t.studentName)}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
              {testimonials.length === 0 && (
                <tr><td colSpan={10} style={{ textAlign: 'center', color: '#888' }}>No testimonials found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
