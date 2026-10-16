import { useEffect, useState } from 'react';
import api from '../api';

const EMPTY = {
	name: '',
	url: '',
	secret: '',
	courseCodesText: '',
	isActive: true,
	sortOrder: 0,
	notes: '',
};

const WEBHOOK_PATH = '/api/provision/students/website-registration';

function toForm(webhook) {
	return {
		...webhook,
		secret: '',
		courseCodesText: (webhook.courseCodes || []).join(', '),
		notes: webhook.notes || '',
	};
}

function statusBadge(delivery) {
	if (!delivery) return <span className="badge">Never used</span>;
	if (delivery.status === 'success') return <span className="badge badge-green">Delivered</span>;
	if (delivery.status === 'failed') return <span className="badge badge-red">Failed</span>;
	return <span className="badge">Pending</span>;
}

/**
 * Nanaska Edge registration webhooks: one row per running edge.
 *
 * On a successful payment the registration is posted to every enabled edge
 * whose course codes match the order (leave the codes empty for all courses).
 * Each edge then creates the student pending approval and emails the admin.
 */
export default function EdgeWebhooksManager() {
	const [webhooks, setWebhooks] = useState([]);
	const [loading, setLoading] = useState(true);
	const [modal, setModal] = useState(null); // null | { mode: 'create'|'edit', data }
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [testing, setTesting] = useState('');
	const [deliveries, setDeliveries] = useState(null); // null | { webhook, rows }

	const load = () => {
		api.get('/edge-webhooks')
			.then((res) => setWebhooks(res.data))
			.catch(() => setError('Failed to load edge webhooks.'))
			.finally(() => setLoading(false));
	};
	useEffect(load, []);

	const openCreate = () => { setError(''); setModal({ mode: 'create', data: { ...EMPTY } }); };
	const openEdit = (webhook) => { setError(''); setModal({ mode: 'edit', data: toForm(webhook) }); };
	const closeModal = () => setModal(null);

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setModal((prev) => ({
			...prev,
			data: { ...prev.data, [name]: type === 'checkbox' ? checked : value },
		}));
	};

	const handleSave = async (e) => {
		e.preventDefault();
		setSaving(true);
		setError('');
		setSuccess('');

		const { data } = modal;
		const payload = {
			name: data.name,
			url: data.url,
			courseCodes: data.courseCodesText
				.split(',')
				.map((code) => code.trim())
				.filter(Boolean),
			isActive: Boolean(data.isActive),
			sortOrder: Number(data.sortOrder) || 0,
			notes: data.notes || '',
		};
		// An empty secret on edit keeps the stored one.
		if (data.secret) payload.secret = data.secret;

		try {
			if (modal.mode === 'create') {
				await api.post('/edge-webhooks', payload);
				setSuccess(`Edge "${data.name}" added.`);
			} else {
				await api.put(`/edge-webhooks/${data.id}`, payload);
				setSuccess(`Edge "${data.name}" updated.`);
			}
			closeModal();
			load();
		} catch (err) {
			setError(err.response?.data?.message || 'Failed to save this edge webhook.');
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = async (webhook) => {
		if (!confirm(`Remove "${webhook.name}"? Paid registrations will no longer be sent to it.`)) return;
		try {
			await api.delete(`/edge-webhooks/${webhook.id}`);
			setSuccess(`Edge "${webhook.name}" removed.`);
			load();
		} catch (err) {
			setError(err.response?.data?.message || 'Failed to remove this edge webhook.');
		}
	};

	const handleTest = async (webhook) => {
		setTesting(webhook.id);
		setError('');
		setSuccess('');
		try {
			const res = await api.post(`/edge-webhooks/${webhook.id}/test`);
			const { ok, statusCode, message } = res.data;
			if (ok || statusCode === 422) {
				setSuccess(`${webhook.name}: ${message} (HTTP ${statusCode})`);
			} else {
				setError(`${webhook.name}: ${message}${statusCode ? ` (HTTP ${statusCode})` : ''}`);
			}
		} catch (err) {
			setError(err.response?.data?.message || `Could not reach ${webhook.name}.`);
		} finally {
			setTesting('');
		}
	};

	const openDeliveries = async (webhook) => {
		setError('');
		try {
			const res = await api.get(`/edge-webhooks/${webhook.id}/deliveries?limit=20`);
			setDeliveries({ webhook, rows: res.data });
		} catch (err) {
			setError(err.response?.data?.message || 'Failed to load deliveries.');
		}
	};

	const handleRetry = async (delivery) => {
		try {
			const res = await api.post(`/edge-webhooks/deliveries/${delivery.id}/retry`);
			if (res.data.ok) {
				setSuccess('Delivery re-sent successfully.');
			} else {
				setError(`Retry failed: ${res.data.error || `HTTP ${res.data.statusCode}`}`);
			}
			openDeliveries(deliveries.webhook);
			load();
		} catch (err) {
			setError(err.response?.data?.message || 'Retry failed.');
		}
	};

	return (
		<div className="admin-card">
			<div className="page-title-row" style={{ marginBottom: '0.5rem' }}>
				<p className="admin-card-title" style={{ margin: 0 }}>Edge Registration Webhooks</p>
				<button type="button" className="btn btn-primary btn-sm" onClick={openCreate}>+ Add Edge</button>
			</div>
			<p style={{ color: '#64748b', marginBottom: '1rem', fontSize: '0.9rem' }}>
				Every edge listed here is sent the student's registration when a payment succeeds. The edge creates
				the account pending approval, emails the student a verification link, and emails the admin an
				approval request with the receipt attached. Leave <strong>course codes</strong> empty to send that
				edge every registration, or list the codes it serves (e.g. <code>OCS, MCS</code>). The secret must
				match that edge's <code>PROVISION_HMAC_SECRET</code>, and the URL ends in <code>{WEBHOOK_PATH}</code>.
			</p>

			{error && <div className="admin-alert admin-alert-error">{error}</div>}
			{success && <div className="admin-alert admin-alert-success">{success}</div>}

			{loading ? (
				<div className="admin-loading">Loading…</div>
			) : (
				<div className="admin-table-wrap">
					<table className="admin-table">
						<thead>
							<tr>
								<th>Edge</th>
								<th>Endpoint</th>
								<th>Courses</th>
								<th>Enabled</th>
								<th>Last delivery</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{webhooks.map((webhook) => (
								<tr key={webhook.id}>
									<td style={{ fontWeight: 500 }}>
										{webhook.name}
										{!webhook.hasSecret && (
											<div style={{ color: '#dc2626', fontSize: '0.75rem' }}>No secret set</div>
										)}
									</td>
									<td style={{ color: '#64748b', fontSize: '0.78rem', wordBreak: 'break-all' }}>{webhook.url}</td>
									<td style={{ fontSize: '0.8rem' }}>
										{webhook.courseCodes?.length ? webhook.courseCodes.join(', ') : 'All courses'}
									</td>
									<td>
										<span className={`badge ${webhook.isActive ? 'badge-green' : 'badge-red'}`}>
											{webhook.isActive ? 'Enabled' : 'Disabled'}
										</span>
									</td>
									<td style={{ fontSize: '0.78rem' }}>
										{statusBadge(webhook.lastDelivery)}
										{webhook.lastDelivery && (
											<div style={{ color: '#64748b', marginTop: 4 }}>
												{new Date(webhook.lastDelivery.createdAt).toLocaleString()}
												{webhook.lastDelivery.error ? ` – ${webhook.lastDelivery.error}` : ''}
											</div>
										)}
									</td>
									<td>
										<div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
											<button type="button" className="btn btn-secondary btn-sm" onClick={() => openEdit(webhook)}>Edit</button>
											<button
												type="button"
												className="btn btn-secondary btn-sm"
												disabled={testing === webhook.id}
												onClick={() => handleTest(webhook)}
											>
												{testing === webhook.id ? 'Testing…' : 'Test'}
											</button>
											<button type="button" className="btn btn-secondary btn-sm" onClick={() => openDeliveries(webhook)}>Log</button>
											<button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(webhook)}>Delete</button>
										</div>
									</td>
								</tr>
							))}
							{webhooks.length === 0 && (
								<tr>
									<td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8', padding: '32px' }}>
										No edges configured yet – paid registrations are not being sent anywhere.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			)}

			{modal && (
				<div className="admin-modal-overlay" onClick={closeModal}>
					<div className="admin-modal" style={{ maxWidth: '700px' }} onClick={(e) => e.stopPropagation()}>
						<div className="admin-modal-header">
							<h2>{modal.mode === 'create' ? 'Add Edge' : `Edit ${modal.data.name}`}</h2>
							<button type="button" className="modal-close" onClick={closeModal}>×</button>
						</div>

						{error && <div className="admin-alert admin-alert-error">{error}</div>}

						<form onSubmit={handleSave}>
							<div className="admin-form-grid">
								<div className="form-group">
									<label>Name *</label>
									<input name="name" required value={modal.data.name} onChange={handleChange} placeholder="Lambda (tau)" />
								</div>
								<div className="form-group">
									<label>Sort order</label>
									<input type="number" name="sortOrder" value={modal.data.sortOrder} onChange={handleChange} />
								</div>
								<div className="form-group full">
									<label>Webhook URL *</label>
									<input
										name="url"
										required
										value={modal.data.url}
										onChange={handleChange}
										placeholder={`https://edge.api.lambda.nanaska.com${WEBHOOK_PATH}`}
									/>
								</div>
								<div className="form-group full">
									<label>Shared secret {modal.mode === 'create' ? '*' : '(leave blank to keep)'}</label>
									<input
										name="secret"
										type="password"
										autoComplete="new-password"
										required={modal.mode === 'create'}
										value={modal.data.secret}
										onChange={handleChange}
										placeholder={modal.mode === 'create' ? "That edge's PROVISION_HMAC_SECRET" : 'Unchanged'}
									/>
									<small style={{ color: '#64748b' }}>
										Used to sign each delivery (<code>X-Signature: sha256=…</code>). Stored secrets are never shown again.
									</small>
								</div>
								<div className="form-group full">
									<label>Course codes</label>
									<input
										name="courseCodesText"
										value={modal.data.courseCodesText}
										onChange={handleChange}
										placeholder="OCS, MCS, SCS — or leave empty for all courses"
									/>
									<small style={{ color: '#64748b' }}>
										Comma separated. Matched against the order's case study, combination, course IDs and level.
									</small>
								</div>
								<div className="form-group full">
									<label>Notes</label>
									<textarea name="notes" value={modal.data.notes} onChange={handleChange} />
								</div>
								<div className="form-group">
									<label>
										<input type="checkbox" name="isActive" checked={Boolean(modal.data.isActive)} onChange={handleChange} />
										{' '}Enabled
									</label>
								</div>
							</div>

							<div style={{ display: 'flex', gap: '8px', marginTop: '1rem' }}>
								<button type="submit" className="btn btn-primary" disabled={saving}>
									{saving ? 'Saving…' : 'Save Edge'}
								</button>
								<button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{deliveries && (
				<div className="admin-modal-overlay" onClick={() => setDeliveries(null)}>
					<div className="admin-modal" style={{ maxWidth: '860px' }} onClick={(e) => e.stopPropagation()}>
						<div className="admin-modal-header">
							<h2>{deliveries.webhook.name} – recent deliveries</h2>
							<button type="button" className="modal-close" onClick={() => setDeliveries(null)}>×</button>
						</div>
						<div className="admin-table-wrap">
							<table className="admin-table">
								<thead>
									<tr>
										<th>When</th>
										<th>Order</th>
										<th>Status</th>
										<th>Attempts</th>
										<th>Detail</th>
										<th />
									</tr>
								</thead>
								<tbody>
									{deliveries.rows.map((row) => (
										<tr key={row.id}>
											<td style={{ fontSize: '0.78rem' }}>{new Date(row.createdAt).toLocaleString()}</td>
											<td style={{ fontSize: '0.78rem', wordBreak: 'break-all' }}>{row.orderId || '—'}</td>
											<td>{statusBadge(row)}</td>
											<td>{row.attempts}</td>
											<td style={{ fontSize: '0.75rem', color: '#64748b', maxWidth: 280, wordBreak: 'break-word' }}>
												{row.error || row.responseBody || '—'}
											</td>
											<td>
												{row.status !== 'success' && (
													<button type="button" className="btn btn-secondary btn-sm" onClick={() => handleRetry(row)}>
														Retry
													</button>
												)}
											</td>
										</tr>
									))}
									{deliveries.rows.length === 0 && (
										<tr>
											<td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>
												Nothing delivered to this edge yet.
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
