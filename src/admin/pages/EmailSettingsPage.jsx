import { useState, useEffect } from 'react';
import api from '../api';

const EMAIL_KEYS = [
	{ key: 'email_webhook_url', label: 'Webhook URL', placeholder: 'https://automation.nanaska.com/webhook/send-email', category: 'email', type: 'text' },
	{ key: 'email_webhook_auth_key', label: 'Auth Header Name', placeholder: 'monthra', category: 'email', type: 'text' },
	{ key: 'email_webhook_auth_value', label: 'Auth Header Value', placeholder: 'secret…', category: 'email', type: 'password' },
	{ key: 'email_from_name', label: 'From Name', placeholder: 'Nanaska', category: 'email', type: 'text' },
	{
		key: 'email_cc', label: 'CC – General Emails', placeholder: 'info@nanaska.com', category: 'email', type: 'text',
		hint: 'Used for newsletters, contact forms, registrations. Comma-separated.'
	},
	{
		key: 'email_payment_cc', label: 'CC – Payments & Enrolments', placeholder: 'accounts@nanaska.com', category: 'email', type: 'text',
		hint: 'Used for payment receipts and enrolment reminders. Comma-separated. Falls back to general CC if blank.'
	},
];

const REMINDER_KEYS = [
	{
		key: 'reminder_intervals', label: 'Reminder Intervals (days)', placeholder: '1,2,4,8,16,32', category: 'email', type: 'text',
		hint: 'Comma-separated days since enrolment when each reminder is sent. Exponential e.g. 1,2,4,8,16. Reminders stop automatically after the max months window.'
	},
	{
		key: 'reminder_max_months', label: 'Stop Reminders After (months)', placeholder: '2', category: 'email', type: 'number',
		hint: 'No reminders are sent to enrolments older than this many months.'
	},
];

const TEST_TYPES = [
	{ value: 'generic', label: 'Generic / Connectivity Test' },
	{ value: 'registration', label: 'Registration Welcome' },
	{ value: 'newsletter', label: 'Newsletter Welcome' },
	{ value: 'contact', label: 'Contact Form Notification (admin)' },
	{ value: 'payment-receipt', label: 'Payment Receipt' },
	{ value: 'enrollment-reminder', label: 'Enrolment Payment Reminder' },
];

export default function EmailSettingsPage() {
	const [settings, setSettings] = useState({});
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [testEmail, setTestEmail] = useState('');
	const [testType, setTestType] = useState('generic');
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

	const allKeys = [...EMAIL_KEYS, ...REMINDER_KEYS];

	const handleSave = async (e) => {
		e.preventDefault();
		setSaving(true);
		setError('');
		setSuccess('');
		try {
			const payload = allKeys.map(({ key, label, category }) => ({
				key,
				value: settings[key] ?? '',
				category,
				label,
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
			const res = await api.post('/settings/test-email', { to: testEmail, type: testType });
			setSuccess(res.data?.message || `Test email sent to ${testEmail}.`);
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
						{EMAIL_KEYS.map(({ key, label, placeholder, type, hint }) => (
							<div key={key} className="form-group">
								<label>{label}</label>
								{hint && <p style={{ color: '#888', fontSize: '13px', margin: '2px 0 6px' }}>{hint}</p>}
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
					<p className="admin-card-title">Payment Reminder Settings</p>
					<p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
						Students who submit an enrolment form but have not paid will receive automated reminders
						at the intervals below. The scheduler runs every hour.
					</p>
					<div className="admin-form-grid single">
						{REMINDER_KEYS.map(({ key, label, placeholder, type, hint }) => (
							<div key={key} className="form-group">
								<label>{label}</label>
								{hint && <p style={{ color: '#888', fontSize: '13px', margin: '2px 0 6px' }}>{hint}</p>}
								<input
									type={type}
									value={settings[key] ?? ''}
									onChange={(e) => handleChange(key, e.target.value)}
									placeholder={placeholder}
								/>
							</div>
						))}
					</div>
				</div>

				<div className="admin-card">
					<p className="admin-card-title">Send a Test Email</p>
					<p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
						Save your settings first, then send a test email of any type to verify your configuration.
					</p>
					<div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
						<div className="form-group" style={{ flex: '1 1 220px', marginBottom: 0 }}>
							<label>Recipient Email</label>
							<input
								type="email"
								value={testEmail}
								onChange={(e) => setTestEmail(e.target.value)}
								placeholder="e.g. you@example.com"
							/>
						</div>
						<div className="form-group" style={{ flex: '1 1 220px', marginBottom: 0 }}>
							<label>Email Type</label>
							<select value={testType} onChange={(e) => setTestType(e.target.value)}>
								{TEST_TYPES.map((t) => (
									<option key={t.value} value={t.value}>{t.label}</option>
								))}
							</select>
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
