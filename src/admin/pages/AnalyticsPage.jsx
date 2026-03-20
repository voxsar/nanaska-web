import { useState, useEffect } from 'react';
import api from '../api';

const ANALYTICS_KEYS = [
  { key: 'google_analytics_id', label: 'Google Analytics Measurement ID', placeholder: 'G-XXXXXXXXXX', help: 'Enter your GA4 Measurement ID (starts with G-)' },
  { key: 'meta_pixel_id', label: 'Meta Pixel ID', placeholder: '123456789012345', help: 'Enter your Facebook/Meta Pixel ID' },
  { key: 'sse_endpoint', label: 'SSE Events Endpoint', placeholder: 'https://your-server.com/sse', help: 'Server-Sent Events endpoint URL for real-time events' },
];

export default function AnalyticsPage() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/settings?category=analytics').then((r) => {
      const map = {};
      r.data.forEach((s) => { map[s.key] = s.value; });
      setSettings(map);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = ANALYTICS_KEYS.map(({ key }) => ({
        key,
        value: settings[key] || '',
        category: 'analytics',
      }));
      await api.post('/settings/bulk', payload);
      setSuccess('Analytics settings saved!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="admin-loading">Loading…</div>;

  return (
    <div>
      <div className="page-title-row">
        <h1>Analytics & Tracking</h1>
      </div>

      {success && <div className="admin-alert admin-alert-success">{success}</div>}
      {error && <div className="admin-alert admin-alert-error">{error}</div>}

      <form onSubmit={handleSave}>
        <div className="admin-card">
          <p className="admin-card-title">Tracking Integrations</p>
          <div className="admin-form-grid single">
            {ANALYTICS_KEYS.map(({ key, label, placeholder, help }) => (
              <div key={key} className="form-group">
                <label>{label}</label>
                <input
                  value={settings[key] || ''}
                  onChange={(e) => handleChange(key, e.target.value)}
                  placeholder={placeholder}
                />
                {help && <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '4px 0 0' }}>{help}</p>}
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card">
          <p className="admin-card-title">How These Are Used</p>
          <ul style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.7, paddingLeft: '20px' }}>
            <li><strong>Google Analytics:</strong> Add this ID to enable GA4 tracking on all pages.</li>
            <li><strong>Meta Pixel:</strong> Add this ID to enable Meta (Facebook) conversion tracking.</li>
            <li><strong>SSE Endpoint:</strong> Used to stream real-time events (enrollments, page views) from the server.</li>
          </ul>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '8px' }}>
            Note: After saving, update your frontend to read these settings from the API and initialize the respective scripts.
          </p>
        </div>

        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
