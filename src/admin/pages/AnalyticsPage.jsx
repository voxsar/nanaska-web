import { useState, useEffect } from 'react';
import api from '../api';

const ANALYTICS_KEYS = [
	{
		key: 'gtm_container_id',
		label: 'Google Tag Manager Container ID',
		placeholder: 'GTM-XXXXXXX',
		help: 'Additional GTM container (the default GTM-KPS5PQ4T is already embedded statically).',
		type: 'input',
	},
	{
		key: 'google_analytics_id',
		label: 'Additional Google Analytics Measurement ID',
		placeholder: 'G-XXXXXXXXXX',
		help: 'Secondary GA4 property (the default G-J8HXJMBSRW is already embedded statically).',
		type: 'input',
	},
	{
		key: 'clarity_project_id',
		label: 'Microsoft Clarity Project ID',
		placeholder: 'xxxxxxxxxx',
		help: 'Additional Clarity project ID. The default (w0ukxy3wwi) is already initialised in code.',
		type: 'input',
	},
	{
		key: 'meta_pixel_id',
		label: 'Meta Pixel ID',
		placeholder: '123456789012345',
		help: 'Facebook / Meta Pixel ID for conversion tracking.',
		type: 'input',
	},
	{
		key: 'custom_head_scripts',
		label: 'Custom <head> Scripts',
		placeholder: '<!-- Paste any <script> or <noscript> tags to inject into <head> -->',
		help: 'Injected at runtime before </head>. Use with care — only paste trusted third-party tags.',
		type: 'textarea',
	},
	{
		key: 'custom_body_scripts',
		label: 'Custom <body> Scripts',
		placeholder: '<!-- Paste any <script> or <noscript> tags to inject into <body> -->',
		help: 'Injected at runtime after <body> opens. Suitable for chat widgets, heatmaps, etc.',
		type: 'textarea',
	},
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
		}).catch(() => { }).finally(() => setLoading(false));
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

	const inputKeys = ANALYTICS_KEYS.filter((k) => k.type === 'input');
	const textareaKeys = ANALYTICS_KEYS.filter((k) => k.type === 'textarea');

	return (
		<div>
			<div className="page-title-row">
				<h1>Analytics &amp; Tracking</h1>
			</div>

			{success && <div className="admin-alert admin-alert-success">{success}</div>}
			{error && <div className="admin-alert admin-alert-error">{error}</div>}

			{/* ── Static integrations (read-only info) ─────────────────── */}
			<div className="admin-card" style={{ marginBottom: '20px' }}>
				<p className="admin-card-title">Static Integrations (embedded in code)</p>
				<p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '12px' }}>
					These are hardcoded in <code>index.html</code> / <code>useTracking.js</code> and are always active.
					Change them by editing the source files and redeploying.
				</p>
				<div style={{ display: 'grid', gap: '8px' }}>
					{[
						{ label: 'Google Tag Manager', value: 'GTM-KPS5PQ4T', color: '#4285f4' },
						{ label: 'Google Analytics 4', value: 'G-J8HXJMBSRW', color: '#34a853' },
						{ label: 'Microsoft Clarity', value: 'w0ukxy3wwi', color: '#0078d4' },
					].map(({ label, value, color }) => (
						<div key={value} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
							<span style={{ width: '10px', height: '10px', borderRadius: '50%', background: color, flexShrink: 0 }} />
							<span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b', minWidth: '220px' }}>{label}</span>
							<code style={{ fontSize: '0.8rem', color: '#64748b' }}>{value}</code>
						</div>
					))}
				</div>
			</div>

			<form onSubmit={handleSave}>
				{/* ── Additional tracking IDs ──────────────────────────────── */}
				<div className="admin-card">
					<p className="admin-card-title">Additional Tracking IDs</p>
					<div className="admin-form-grid single">
						{inputKeys.map(({ key, label, placeholder, help }) => (
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

				{/* ── Custom scripts ───────────────────────────────────────── */}
				<div className="admin-card">
					<p className="admin-card-title">Custom Script Injection</p>
					<p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '16px' }}>
						Scripts saved here are injected at runtime by the frontend. Only paste code from trusted providers.
					</p>
					<div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
						{textareaKeys.map(({ key, label, placeholder, help }) => (
							<div key={key} className="form-group">
								<label>{label}</label>
								<textarea
									value={settings[key] || ''}
									onChange={(e) => handleChange(key, e.target.value)}
									placeholder={placeholder}
									rows={6}
									style={{ fontFamily: 'monospace', fontSize: '0.8rem', resize: 'vertical' }}
								/>
								{help && <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '4px 0 0' }}>{help}</p>}
							</div>
						))}
					</div>
				</div>

				{/* ── Tracking events reference ─────────────────────────────── */}
				<div className="admin-card">
					<p className="admin-card-title">Tracked Events Reference</p>
					<p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '8px' }}>
						The following events are automatically tracked across the site:
					</p>
					<table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
						<thead>
							<tr style={{ borderBottom: '1px solid #e2e8f0' }}>
								<th style={{ textAlign: 'left', padding: '6px 8px', color: '#64748b', fontWeight: 600 }}>Event</th>
								<th style={{ textAlign: 'left', padding: '6px 8px', color: '#64748b', fontWeight: 600 }}>Platform</th>
								<th style={{ textAlign: 'left', padding: '6px 8px', color: '#64748b', fontWeight: 600 }}>Trigger</th>
							</tr>
						</thead>
						<tbody>
							{[
								['page_view', 'GA4 + Clarity', 'Every SPA route change'],
								['scroll_25 / 50 / 75 / 90', 'GA4 + Clarity', 'Scroll depth milestones per page'],
								['form_start', 'GA4 + Clarity', 'First interaction with a form'],
								['form_submit', 'GA4 + Clarity', 'Successful form submission'],
								['form_error', 'GA4 + Clarity', 'Form validation error'],
								['click_*', 'GA4 + Clarity', 'Key button / CTA clicks'],
								['begin_checkout', 'GA4', 'Enrollment flow initiated'],
								['enrollment_started', 'Clarity', 'Enrollment flow initiated (session upgrade)'],
							].map(([evt, platform, trigger]) => (
								<tr key={evt} style={{ borderBottom: '1px solid #f1f5f9' }}>
									<td style={{ padding: '6px 8px' }}><code style={{ color: '#1B365D' }}>{evt}</code></td>
									<td style={{ padding: '6px 8px', color: '#64748b' }}>{platform}</td>
									<td style={{ padding: '6px 8px', color: '#64748b' }}>{trigger}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				<button type="submit" className="btn btn-primary" disabled={saving}>
					{saving ? 'Saving…' : 'Save Settings'}
				</button>
			</form>
		</div>
	);
}
