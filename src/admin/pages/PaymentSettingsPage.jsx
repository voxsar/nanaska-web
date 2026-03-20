import { useState, useEffect } from 'react';
import api from '../api';

const PAYMENT_KEYS = [
  { key: 'payment_gateway_client_id', label: 'Payment Gateway Client ID', placeholder: 'Your client ID', category: 'payment' },
  { key: 'payment_gateway_secret', label: 'Payment Gateway Secret', placeholder: '••••••••••', category: 'payment', isSecret: true },
  { key: 'payment_success_url', label: 'Payment Success URL', placeholder: '/payment-success', category: 'payment' },
  { key: 'payment_cancel_url', label: 'Payment Cancel URL', placeholder: '/payment-cancel', category: 'payment' },
  { key: 'site_name', label: 'Site Name', placeholder: 'Nanaska', category: 'general' },
  { key: 's3_bucket_url', label: 'S3 Bucket URL', placeholder: 'https://your-bucket.s3.amazonaws.com', category: 'storage' },
];

export default function PaymentSettingsPage() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showSecrets, setShowSecrets] = useState(false);

  useEffect(() => {
    api.get('/settings').then((r) => {
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
      const payload = PAYMENT_KEYS.map(({ key, category }) => ({
        key,
        value: settings[key] || '',
        category,
      }));
      await api.post('/settings/bulk', payload);
      setSuccess('Settings saved successfully!');
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
        <h1>Payment & Site Settings</h1>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => setShowSecrets((v) => !v)}
        >
          {showSecrets ? '🙈 Hide Secrets' : '👁 Show Secrets'}
        </button>
      </div>

      {success && <div className="admin-alert admin-alert-success">{success}</div>}
      {error && <div className="admin-alert admin-alert-error">{error}</div>}

      <form onSubmit={handleSave}>
        <div className="admin-card">
          <p className="admin-card-title">Payment Gateway</p>
          <div className="admin-form-grid single">
            {PAYMENT_KEYS.filter((k) => k.category === 'payment').map(({ key, label, placeholder, isSecret }) => (
              <div key={key} className="form-group">
                <label>{label}</label>
                <input
                  type={isSecret && !showSecrets ? 'password' : 'text'}
                  value={settings[key] || ''}
                  onChange={(e) => handleChange(key, e.target.value)}
                  placeholder={placeholder}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card">
          <p className="admin-card-title">Storage & General</p>
          <div className="admin-form-grid single">
            {PAYMENT_KEYS.filter((k) => k.category !== 'payment').map(({ key, label, placeholder }) => (
              <div key={key} className="form-group">
                <label>{label}</label>
                <input
                  value={settings[key] || ''}
                  onChange={(e) => handleChange(key, e.target.value)}
                  placeholder={placeholder}
                />
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
