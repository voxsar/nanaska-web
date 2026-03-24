import { useState, useEffect } from 'react';
import api from '../api';

const EMAIL_KEYS = [
	{ key: 'email_webhook_url',       label: 'Webhook URL',           placeholder: 'https://automation.nanaska.com/webhook/send-email', category: 'email', type: 'text' },
	{ key: 'email_webhook_auth_key',  label: 'Auth Header Name',      placeholder: 'monthra',     category: 'email', type: 'text' },
	{ key: 'email_webhook_auth_value',label: 'Auth Header Value',     placeholder: 'secret…',     category: 'email', type: 'password' },
	{ key: 'email_from_name',         label: 'From Name',             placeholder: 'Nanaska',     category: 'email', type: 'text' },
	{ key: 'email_cc',                label: 'CC Address(es)',         placeholder: 'info@nanaska.com', category: 'email', type: 'text' },
];

export default function EmailSettingsPage() {
	const [settings, setSettings] = useState({});
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [testEmail, setTestEmail] = useState('');
	const [testing, setTesting] = useState(false);
	const [success, setSuccess] = useState('');
	const [error, setError] = useState('');

	useEffect(() => {
		api.get('/settings?category=email').then((r) => {
			const map = {};
			r.data.forEach((s) => { map[s.key] = s.value; });
			setSettings(map);
		}).catch(() => { }).finally(() => setLoading(false));
	}, []);

	const handleChange = (key, value) => {
		setSettings((prev) => ({ ...prev, [key]: value }));
	};

	const handleSave = async (e) => {
		e.preventDefault();
		setSaving(true);
		setError('');
		setSuccess('');
		try {
			const payload = EMAIL_KEYS.map(({ key, category }) => ({
				key,
				value: settings[key] ?? '',
				category,
				label: EMAIL_KEYS.find((k) => k.key === key)?.label ?? key,
			}));
			await api.post('/settings/bulk', payload);
			setSuccess('Email settings saved successfully!');
		} catch (err) {
			setError(err.response?.data?.message || 'Failed to save settings.');
		} finally {
			setSaving(false);
		}
	};

	const handleTestEmail = async () => {
		if (!testEmail) {
			setError('Please enter a recipient email address for the test.');
			return;
		}
		setTesting(true);
		setError('');
		setSuccess('');
		try {
			await api.post('/settings/test-email', { to: testEmail });
			setSuccess(`Test email sent to ${testEmail}. Please check your inbox.`);
		} catch (err) {
			setError(err.response?.data?.message || 'Failed to send test email. Check your webhook settings.');
		} finally {
			setTesting(false);
		}
	};

	if (loading) return <div className="admin-loading">Loading…</div>;

	return (
		<div>
			<div className="page-title-row">
				<h1>Email Settings</h1>
			</div>

			{success && <div className="admin-alert admin-alert-success">{success}</div>}
			{error && <div className="admin-alert admin-alert-error">{error}</div>}

			<form onSubmit={handleSave}>
				<div className="admin-card">
					<p className="admin-card-title">Email Webhook Configuration</p>
					<p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
						Emails are delivered via an HTTP webhook. The <strong>To</strong>, <strong>CC</strong>,
						<strong> Subject</strong>, and <strong>Body (HTML)</strong> fields are posted as JSON.
						The auth header is sent on every request.
					</p>
					<div className="admin-form-grid single">
						{EMAIL_KEYS.map(({ key, label, placeholder, type }) => (
							<div key={key} className="form-group">
								<label>{label}{key === 'email_cc' && <span style={{ color: '#999', fontWeight: 'normal', marginLeft: 6 }}>(comma-separated for multiple)</span>}</label>
								<input
									type={type}
									value={settings[key] ?? ''}
									onChange={(e) => handleChange(key, e.target.value)}
									placeholder={placeholder}
									autoComplete={type === 'password' ? 'new-password' : undefined}
								/>
							</div>
						))}
					</div>
				</div>

				<div className="admin-card">
					<p className="admin-card-title">Send a Test Email</p>
					<p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
						Save your settings first, then send a test email to verify your configuration.
					</p>
					<div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
						<div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
							<label>Recipient Email</label>
							<input
								type="email"
								value={testEmail}
								onChange={(e) => setTestEmail(e.target.value)}
								placeholder="e.g. you@example.com"
							/>
						</div>
						<button
							type="button"
							className="btn btn-secondary"
							onClick={handleTestEmail}
							disabled={testing}
							style={{ whiteSpace: 'nowrap' }}
						>
							{testing ? 'Sending…' : 'Send Test Email'}
						</button>
					</div>
				</div>

				<button type="submit" className="btn btn-primary" disabled={saving}>
					{saving ? 'Saving…' : 'Save Email Settings'}
				</button>
			</form>
		</div>
	);
}
