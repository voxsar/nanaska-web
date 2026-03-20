import { useState, useEffect } from 'react';
import api from '../api';

export default function FormDataPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/admin/contact-submissions').then((r) => setSubmissions(r.data)).finally(() => setLoading(false));
  }, []);

  const filtered = submissions.filter(
    (s) =>
      (s.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.subject || '').toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <div className="page-title-row">
        <h1>Form Submissions</h1>
        <span className="badge badge-blue">{submissions.length} total</span>
      </div>

      <div className="admin-filter-bar">
        <input
          className="admin-search"
          placeholder="Search by name, email or subject…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="admin-loading">Loading…</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Subject</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} onClick={() => setSelected(s)} style={{ cursor: 'pointer' }}>
                  <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{new Date(s.createdAt).toLocaleDateString()}</td>
                  <td style={{ fontWeight: 500 }}>{s.name}</td>
                  <td>{s.email}</td>
                  <td>{s.phone || '—'}</td>
                  <td>{s.subject || '—'}</td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.8rem', color: '#64748b' }}>
                    {s.message}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8', padding: '32px' }}>No submissions found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="admin-modal-overlay" onClick={() => setSelected(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Contact Submission</h2>
              <button className="modal-close" onClick={() => setSelected(null)}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.875rem' }}>
              <div><strong>Name:</strong> {selected.name}</div>
              <div><strong>Email:</strong> {selected.email}</div>
              {selected.phone && <div><strong>Phone:</strong> {selected.phone}</div>}
              {selected.subject && <div><strong>Subject:</strong> {selected.subject}</div>}
              <div><strong>Date:</strong> {new Date(selected.createdAt).toLocaleString()}</div>
              <div>
                <strong>Message:</strong>
                <p style={{ marginTop: '8px', padding: '12px', background: '#f8fafc', borderRadius: '8px', whiteSpace: 'pre-wrap' }}>
                  {selected.message}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
