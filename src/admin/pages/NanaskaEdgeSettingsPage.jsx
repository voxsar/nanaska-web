import { useEffect, useState } from 'react';
import api from '../api';

const CASE_STUDIES = [
	{ code: 'ocs', label: 'OCS', name: 'Operational Case Study' },
	{ code: 'mcs', label: 'MCS', name: 'Management Case Study' },
	{ code: 'scs', label: 'SCS', name: 'Strategic Case Study' },
];

const DEFAULTS = {
	edge_ocs_available: 'true',
	edge_mcs_available: 'false',
	edge_scs_available: 'false',
	edge_ocs_opens_at: '',
	edge_mcs_opens_at: '',
	edge_scs_opens_at: '',
	edge_mcs_days_from_now: '6',
	edge_scs_days_from_now: '12',
	edge_ocs_revision_combination_id: 'op_ocs',
	edge_mcs_revision_combination_id: 'mg_mcs',
	edge_scs_revision_combination_id: 'st_scs',
	edge_n8n_registration_webhook: 'https://automation.nanaska.com/webhook-test/registration',
	// Pricing
	edge_ocs_price_lkr: '26650',
	edge_ocs_price_gbp: '399',
	edge_mcs_price_lkr: '27675',
	edge_mcs_price_gbp: '499',
	edge_scs_price_lkr: '30750',
	edge_scs_price_gbp: '599',
	edge_revision_gateway_amount_lkr: '',
};

function toLocalDateTimeValue(value) {
	if (!value) return '';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return '';
	const offsetMs = date.getTimezoneOffset() * 60000;
	return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function fromLocalDateTimeValue(value) {
	if (!value) return '';
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? '' : date.toISOString();
}

export default function NanaskaEdgeSettingsPage() {
	const [settings, setSettings] = useState(DEFAULTS);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [success, setSuccess] = useState('');
	const [error, setError] = useState('');

	useEffect(() => {
		api.get('/settings?category=nanaska-edge')
			.then((res) => {
				const map = { ...DEFAULTS };
				res.data.forEach((setting) => {
					map[setting.key] = setting.value;
				});
				setSettings(map);
			})
			.catch(() => setError('Failed to load Nanaska Edge settings.'))
			.finally(() => setLoading(false));
	}, []);

	const handleChange = (key, value) => {
		setSettings((prev) => ({ ...prev, [key]: value }));
	};

	const handleSave = async (e) => {
		e.preventDefault();
		setSaving(true);
		setSuccess('');
		setError('');

		try {
			const payload = Object.entries(settings).map(([key, value]) => ({
				key,
				value,
				category: 'nanaska-edge',
				label: key.replace(/^edge_/, '').replaceAll('_', ' '),
			}));
			await api.post('/settings/bulk', payload);
			setSuccess('Nanaska Edge settings saved.');
		} catch (err) {
			setError(err.response?.data?.message || 'Failed to save Nanaska Edge settings.');
		} finally {
			setSaving(false);
		}
	};

	if (loading) return <div className="admin-loading">Loading...</div>;

	return (
		<div>
			<div className="page-title-row">
				<h1>Nanaska Edge Settings</h1>
			</div>

			{success && <div className="admin-alert admin-alert-success">{success}</div>}
			{error && <div className="admin-alert admin-alert-error">{error}</div>}

			<form onSubmit={handleSave}>
				<div className="admin-card">
					<p className="admin-card-title">Case Study Availability</p>
					<div className="admin-form-grid">
						{CASE_STUDIES.map((item) => {
							const availableKey = `edge_${item.code}_available`;
							const opensKey = `edge_${item.code}_opens_at`;

							return (
								<div key={item.code} className="form-group">
									<label>{item.label} - {item.name}</label>
									<select
										value={settings[availableKey] || 'false'}
										onChange={(e) => handleChange(availableKey, e.target.value)}
									>
										<option value="true">Available now</option>
										<option value="false">Show countdown</option>
									</select>
									<input
										type="datetime-local"
										value={toLocalDateTimeValue(settings[opensKey])}
										onChange={(e) => handleChange(opensKey, fromLocalDateTimeValue(e.target.value))}
										placeholder="Opening date/time"
									/>
									<small style={{ color: '#64748b' }}>
										Used when this case study is set to Show countdown.
									</small>
								</div>
							);
						})}
					</div>
				</div>

				<div className="admin-card">
					<p className="admin-card-title">Fallback Countdown Days</p>
					<div className="admin-form-grid">
						<div className="form-group">
							<label>MCS fallback days from page visit</label>
							<input
								type="number"
								min="0"
								value={settings.edge_mcs_days_from_now || '6'}
								onChange={(e) => handleChange('edge_mcs_days_from_now', e.target.value)}
							/>
						</div>
						<div className="form-group">
							<label>SCS fallback days from page visit</label>
							<input
								type="number"
								min="0"
								value={settings.edge_scs_days_from_now || '12'}
								onChange={(e) => handleChange('edge_scs_days_from_now', e.target.value)}
							/>
						</div>
					</div>
				</div>

				<div className="admin-card">
					<p className="admin-card-title">Revision Checkout Mapping</p>
					<div className="admin-form-grid">
						{CASE_STUDIES.map((item) => {
							const mappingKey = `edge_${item.code}_revision_combination_id`;

							return (
								<div key={mappingKey} className="form-group">
									<label>{item.label} revision combination ID</label>
									<input
										value={settings[mappingKey] || ''}
										onChange={(e) => handleChange(mappingKey, e.target.value)}
										placeholder={item.code === 'ocs' ? 'op_ocs' : item.code === 'mcs' ? 'mg_mcs' : 'st_scs'}
									/>
									<small style={{ color: '#64748b' }}>
										Used by Nanaska Edge revision checkout and stored with the registration.
									</small>
								</div>
							);
						})}
					</div>
				</div>

				<div className="admin-card">
					<p className="admin-card-title">Pricing</p>
					<p style={{ color: '#64748b', marginBottom: '1rem', fontSize: '0.9rem' }}>
						Displayed prices shown to students on the Edge page. The gateway amount is what is actually charged through the payment gateway for revision sessions.
					</p>
					<div className="admin-form-grid">
						{CASE_STUDIES.map((item) => (
							<div key={item.code} className="form-group">
								<label>{item.label} — {item.name}</label>
								<div style={{ display: 'flex', gap: '0.5rem' }}>
									<input
										type="number"
										min="0"
										value={settings[`edge_${item.code}_price_lkr`] || ''}
										onChange={(e) => handleChange(`edge_${item.code}_price_lkr`, e.target.value)}
										placeholder="LKR e.g. 26650"
										style={{ flex: 1 }}
									/>
									<input
										type="number"
										min="0"
										value={settings[`edge_${item.code}_price_gbp`] || ''}
										onChange={(e) => handleChange(`edge_${item.code}_price_gbp`, e.target.value)}
										placeholder="GBP e.g. 399"
										style={{ flex: 1 }}
									/>
								</div>
								<small style={{ color: '#64748b' }}>LKR (left) · GBP (right)</small>
							</div>
						))}
					</div>
					<div className="admin-form-grid" style={{ marginTop: '1rem' }}>
						<div className="form-group">
							<label>Gateway charge amount (LKR) for revision sessions</label>
							<input
								type="number"
								min="1"
								value={settings.edge_revision_gateway_amount_lkr || ''}
								onChange={(e) => handleChange('edge_revision_gateway_amount_lkr', e.target.value)}
								placeholder="e.g. 10"
							/>
							<small style={{ color: '#64748b' }}>
								This is the amount actually sent to the payment gateway. Set to the real price when ready to go live.
							</small>
						</div>
					</div>
				</div>

				<div className="admin-card">
					<p className="admin-card-title">Registration Automation</p>
					<div className="admin-form-grid single">
						<div className="form-group">
							<label>n8n registration webhook URL</label>
							<input
								value={settings.edge_n8n_registration_webhook || ''}
								onChange={(e) => handleChange('edge_n8n_registration_webhook', e.target.value)}
								placeholder="https://automation.nanaska.com/webhook-test/registration"
							/>
							<small style={{ color: '#64748b' }}>
								Free mock posts immediately. Revision posts only after successful payment.
							</small>
						</div>
					</div>
				</div>

				<button type="submit" className="btn btn-primary" disabled={saving}>
					{saving ? 'Saving...' : 'Save Edge Settings'}
				</button>
			</form>
		</div>
	);
}
