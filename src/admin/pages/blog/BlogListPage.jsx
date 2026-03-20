import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

export default function BlogListPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;
    api.get('/blog')
      .then((r) => { if (!cancelled) { setPosts(r.data); setLoading(false); } })
      .catch(() => { if (!cancelled) { setError('Failed to load posts'); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this post?')) return;
    try {
      await api.delete(`/blog/${id}`);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert('Failed to delete post');
    }
  };

  const filtered = posts.filter(
    (p) => p.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <div className="page-title-row">
        <h1>Blog Posts</h1>
        <Link to="/admin/blog/new" className="btn btn-primary">+ New Post</Link>
      </div>

      {error && <div className="admin-alert admin-alert-error">{error}</div>}

      <div className="admin-filter-bar">
        <input
          className="admin-search"
          placeholder="Search posts…"
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
                <th>Title</th>
                <th>Slug</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8', padding: '32px' }}>No posts found</td></tr>
              )}
              {filtered.map((post) => (
                <tr key={post.id}>
                  <td style={{ fontWeight: 500 }}>{post.title}</td>
                  <td style={{ color: '#64748b', fontSize: '0.8rem' }}>{post.slug}</td>
                  <td>
                    <span className={`badge ${post.published ? 'badge-green' : 'badge-gray'}`}>
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td style={{ color: '#64748b', fontSize: '0.8rem' }}>
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Link to={`/admin/blog/${post.id}/edit`} className="btn btn-secondary btn-sm">Edit</Link>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(post.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
