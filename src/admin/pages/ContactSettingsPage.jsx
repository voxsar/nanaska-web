import { useState, useEffect } from 'react';
import api from '../api';

const TEXT_KEYS = [
  { key: 'contact_email', label: 'Contact Email', placeholder: 'info@nanaska.com' },
  { key: 'contact_address', label: 'Office Address', placeholder: 'No. 464/1/1, Galle Road, Colombo 03' },
  { key: 'contact_map_lat', label: 'Map Latitude', placeholder: '6.8955' },
  { key: 'contact_map_lng', label: 'Map Longitude', placeholder: '79.8527' },
];

export default function ContactSettingsPage() {
  const [settings, setSettings] = useState({});
  const [phones, setPhones] = useState(['+94 77 499 7338', '+94 77 711 8902', '+94 112 575 016']);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [newPhone, setNewPhone] = useState('');

  useEffect(() => {
    api.get('/settings?category=contact')
      .then((r) => {
        const map = {};
        r.data.forEach((s) => { map[s.key] = s.value; });
        setSettings(map);
        if (map.contact_phones) {
          try { setPhones(JSON.parse(map.contact_phones)); } catch (_) {}
        }
      })
      .catch(() => setError('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const addPhone = () => {
    if (newPhone.trim()) {
      setPhones((prev) => [...prev, newPhone.trim()]);
      setNewPhone('');
    }
  };

  const removePhone = (idx) => {
    setPhones((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = [
        ...TEXT_KEYS.map(({ key }) => ({
          key,
          value: settings[key] || '',
          category: 'contact',
        })),
        {
          key: 'contact_phones',
          value: JSON.stringify(phones),
          category: 'contact',
          label: 'Contact Phone Numbers (JSON array)',
        },
      ];
      await api.post('/settings/bulk', payload);
      setSuccess('Contact settings saved!');
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="admin-loading">Loading…</div>;

  return (
    <div>
      <div className="page-title-row">
        <h1>Contact Settings</h1>
      </div>

      {success && <div className="admin-alert admin-alert-success">{success}</div>}
      {error && <div className="admin-alert admin-alert-error">{error}</div>}

      <form onSubmit={handleSave}>
        <div className="admin-card">
          <p className="admin-card-title">Contact Information</p>
          <div className="admin-form-grid single">
            {TEXT_KEYS.map(({ key, label, placeholder }) => (
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

        <div className="admin-card">
          <p className="admin-card-title">Phone Numbers</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
            {phones.map((phone, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  value={phone}
                  onChange={(e) => {
                    const updated = [...phones];
                    updated[idx] = e.target.value;
                    setPhones(updated);
                  }}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => removePhone(idx)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="+94 77 000 0000"
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addPhone(); } }}
              style={{ flex: 1 }}
            />
            <button type="button" className="btn btn-secondary btn-sm" onClick={addPhone}>
              Add Phone
            </button>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save Contact Settings'}
        </button>
      </form>
    </div>
  );
}
