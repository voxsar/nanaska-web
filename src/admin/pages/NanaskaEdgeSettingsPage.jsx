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

				<button type="submit" className="btn btn-primary" disabled={saving}>
					{saving ? 'Saving...' : 'Save Edge Settings'}
				</button>
			</form>
		</div>
	);
}
