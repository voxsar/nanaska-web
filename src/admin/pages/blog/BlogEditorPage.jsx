import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api';

export default function BlogEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const editorRef = useRef(null);
  const [ckeLoaded, setCkeLoaded] = useState(false);

  const [form, setForm] = useState({
    title: '',
    slug: '',
    coverUrl: '',
    content: '',
    published: false,
    metaTitle: '',
    metaDesc: '',
  });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load CKEditor from CDN
  useEffect(() => {
    if (window.ClassicEditor) { setCkeLoaded(true); return; }
    const script = document.createElement('script');
    script.src = 'https://cdn.ckeditor.com/ckeditor5/41.4.2/classic/ckeditor.js';
    script.onload = () => setCkeLoaded(true);
    document.head.appendChild(script);
  }, []);

  // Load existing post
  useEffect(() => {
    if (!isEdit) return;
    api.get(`/blog/${id}`).then((r) => {
      setForm(r.data);
    }).catch(() => setError('Failed to load post')).finally(() => setLoading(false));
  }, [id, isEdit]);

  // Init editor after both CKE loaded and data ready
  useEffect(() => {
    if (!ckeLoaded || !editorRef.current || (isEdit && loading)) return;
    if (window.ClassicEditor) {
      window.ClassicEditor.create(editorRef.current, {
        toolbar: ['heading', '|', 'bold', 'italic', 'underline', 'strikethrough', '|',
          'numberedList', 'bulletedList', 'blockQuote', '|', 'link', 'undo', 'redo'],
      }).then((editor) => {
        editor.setData(form.content || '');
        editor.model.document.on('change:data', () => {
          setForm((prev) => ({ ...prev, content: editor.getData() }));
        });
        editorRef._ckInstance = editor;
      }).catch(console.error);
    }
    return () => editorRef._ckInstance?.destroy().catch(() => {});
  }, [ckeLoaded, loading]);  // eslint-disable-line

  const slugify = (title) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'title' && !isEdit ? { slug: slugify(value) } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (isEdit) {
        await api.put(`/blog/${id}`, form);
      } else {
        await api.post('/blog', form);
      }
      setSuccess('Post saved successfully!');
      setTimeout(() => navigate('/admin/blog'), 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="admin-loading">Loading…</div>;

  return (
    <div>
      <div className="page-title-row">
        <h1>{isEdit ? 'Edit Blog Post' : 'New Blog Post'}</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/admin/blog')}>
          ← Back
        </button>
      </div>

      {error && <div className="admin-alert admin-alert-error">{error}</div>}
      {success && <div className="admin-alert admin-alert-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="admin-card">
          <p className="admin-card-title">Post Details</p>
          <div className="admin-form-grid">
            <div className="form-group full">
              <label>Title *</label>
              <input name="title" required value={form.title} onChange={handleChange} placeholder="Post title" />
            </div>
            <div className="form-group">
              <label>Slug *</label>
              <input name="slug" required value={form.slug} onChange={handleChange} placeholder="post-slug" />
            </div>
            <div className="form-group">
              <label>Cover Image URL</label>
              <input name="coverUrl" value={form.coverUrl || ''} onChange={handleChange} placeholder="https://…" />
            </div>
          </div>
        </div>

        <div className="admin-card">
          <p className="admin-card-title">Content</p>
          {!ckeLoaded && <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Loading editor…</p>}
          <div ref={editorRef} style={{ minHeight: '300px' }} />
        </div>

        <div className="admin-card">
          <p className="admin-card-title">SEO / Meta</p>
          <div className="admin-form-grid">
            <div className="form-group">
              <label>Meta Title</label>
              <input name="metaTitle" value={form.metaTitle || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Meta Description</label>
              <input name="metaDesc" value={form.metaDesc || ''} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : (isEdit ? 'Update Post' : 'Create Post')}
          </button>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              name="published"
              checked={form.published}
              onChange={handleChange}
              style={{ width: 'auto' }}
            />
            Published
          </label>
        </div>
      </form>
    </div>
  );
}
