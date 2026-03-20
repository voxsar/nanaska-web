import { useState, useEffect } from 'react';
import api from '../api';

const DEFAULT_PAGES = [
  { pagePath: '/', pageTitle: 'Home' },
  { pagePath: '/about', pageTitle: 'About' },
  { pagePath: '/our-faculty', pageTitle: 'Our Faculty' },
  { pagePath: '/our-specialty', pageTitle: 'Our Specialty' },
  { pagePath: '/lecturers', pageTitle: 'Lecturers' },
  { pagePath: '/cima-certificate-level', pageTitle: 'Certificate Level' },
  { pagePath: '/cima-operational-level', pageTitle: 'Operational Level' },
  { pagePath: '/cima-management-level', pageTitle: 'Management Level' },
  { pagePath: '/cima-strategic-level', pageTitle: 'Strategic Level' },
  { pagePath: '/testimonials', pageTitle: 'Testimonials' },
  { pagePath: '/contact', pageTitle: 'Contact' },
  { pagePath: '/enrollment', pageTitle: 'Enrollment' },
];

const EMPTY_META = { pagePath: '', pageTitle: '', metaTitle: '', metaDesc: '', metaKeywords: '', ogTitle: '', ogDesc: '', ogImage: '' };

export default function MetaTagsPage() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); // page to edit
  const [form, setForm] = useState(EMPTY_META);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const load = () => {
    api.get('/settings/page-meta/all').then((r) => {
      const existing = r.data;
      const merged = DEFAULT_PAGES.map((dp) => {
        const found = existing.find((e) => e.pagePath === dp.pagePath);
        return found || { ...EMPTY_META, ...dp };
      });
      // Also add any custom pages from DB
      existing.forEach((e) => {
        if (!merged.find((m) => m.pagePath === e.pagePath)) merged.push(e);
      });
      setPages(merged);
    }).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleSelect = (page) => {
    setSelected(page);
    setForm({ ...EMPTY_META, ...page });
    setSuccess('');
    setError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await api.put('/settings/page-meta', form);
      setPages((prev) => {
        const idx = prev.findIndex((p) => p.pagePath === form.pagePath);
        if (idx >= 0) { const next = [...prev]; next[idx] = res.data; return next; }
        return [...prev, res.data];
      });
      setSelected(res.data);
      setSuccess('Meta tags saved!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-title-row">
        <h1>Meta Tags</h1>
      </div>
      <p style={{ color: '#64748b', marginBottom: '20px', fontSize: '0.875rem' }}>
        Configure SEO meta tags for each page of the website.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '20px' }}>
        {/* Page list */}
        <div className="admin-card" style={{ padding: '12px', margin: 0 }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', margin: '0 0 8px', padding: '0 12px' }}>Pages</p>
          {loading ? <div className="admin-loading" style={{ padding: '20px' }}>…</div> : (
            pages.map((page) => (
              <button
                key={page.pagePath}
                onClick={() => handleSelect(page)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: selected?.pagePath === page.pagePath ? '#eff6ff' : 'none',
                  color: selected?.pagePath === page.pagePath ? '#3b82f6' : '#334155',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: selected?.pagePath === page.pagePath ? 500 : 400,
                }}
              >
                <span style={{ display: 'block' }}>{page.pageTitle}</span>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{page.pagePath}</span>
              </button>
            ))
          )}
        </div>

        {/* Edit form */}
        <div>
          {!selected ? (
            <div className="admin-card" style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
              Select a page to edit its meta tags
            </div>
          ) : (
            <form onSubmit={handleSave}>
              {success && <div className="admin-alert admin-alert-success">{success}</div>}
              {error && <div className="admin-alert admin-alert-error">{error}</div>}

              <div className="admin-card">
                <p className="admin-card-title">Page: {selected.pageTitle} <span style={{ color: '#94a3b8', fontWeight: 400, fontSize: '0.875rem' }}>{selected.pagePath}</span></p>

                <div className="admin-form-grid">
                  <div className="form-group full">
                    <label>Meta Title</label>
                    <input name="metaTitle" value={form.metaTitle || ''} onChange={handleChange} placeholder="Page title for search engines" />
                  </div>
                  <div className="form-group full">
                    <label>Meta Description</label>
                    <textarea name="metaDesc" value={form.metaDesc || ''} onChange={handleChange} placeholder="Brief description for search engines (150-160 chars)" style={{ minHeight: '70px' }} />
                  </div>
                  <div className="form-group full">
                    <label>Meta Keywords</label>
                    <input name="metaKeywords" value={form.metaKeywords || ''} onChange={handleChange} placeholder="keyword1, keyword2, keyword3" />
                  </div>
                </div>
              </div>

              <div className="admin-card">
                <p className="admin-card-title">Open Graph / Social</p>
                <div className="admin-form-grid">
                  <div className="form-group">
                    <label>OG Title</label>
                    <input name="ogTitle" value={form.ogTitle || ''} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>OG Description</label>
                    <input name="ogDesc" value={form.ogDesc || ''} onChange={handleChange} />
                  </div>
                  <div className="form-group full">
                    <label>OG Image URL</label>
                    <input name="ogImage" value={form.ogImage || ''} onChange={handleChange} placeholder="https://…" />
                  </div>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : 'Save Meta Tags'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
