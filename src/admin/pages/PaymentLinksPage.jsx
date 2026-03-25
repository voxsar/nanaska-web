import { useState, useEffect, useCallback } from 'react';
import api from '../api';
import './PaymentLinksPage.css';

const FRONTEND_BASE = import.meta.env.VITE_API_URL
	? import.meta.env.VITE_API_URL.replace('/api', '')
	: 'https://nanaska.com';

const SITE_BASE = (() => {
	const parts = (import.meta.env.VITE_API_URL || 'https://api.nanaska.com').split('.');
	if (parts.length >= 2) {
		parts[0] = parts[0].replace(/\/\/api/, '//nanaska');
	}
	return 'https://nanaska.com';
})();

function formatCurrency(amount, currency) {
	if (currency === 'GBP') return `£${amount.toLocaleString()}`;
	return `LKR ${amount.toLocaleString()}`;
}

const emptyForm = {
	label: '',
	studentName: '',
	studentEmail: '',
	amount: '',
	currency: 'LKR',
	description: '',
	password: '',
	expiresAt: '',
	expireOnPayment: false,
	sendEmail: true,
};

export default function PaymentLinksPage() {
	const [links, setLinks] = useState([]);
	const [loading, setLoading] = useState(true);
	const [showForm, setShowForm] = useState(false);
	const [form, setForm] = useState(emptyForm);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [copiedId, setCopiedId] = useState(null);

	const load = useCallback(async () => {
		try {
			setLoading(true);
			const res = await api.get('/payment-links');
			setLinks(res.data);
		} catch {
			setError('Failed to load payment links');
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => { load(); }, [load]);

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setSuccess('');
		if (!form.label || !form.amount) {
			setError('Please fill in all required fields.');
			return;
		}
		try {
			setSubmitting(true);
			const payload = {
				label: form.label,
				studentName: form.studentName || undefined,
				studentEmail: form.studentEmail || undefined,
				amount: parseInt(form.amount, 10),
				currency: form.currency,
				description: form.description || undefined,
				password: form.password || undefined,
				expiresAt: form.expiresAt || undefined,
				expireOnPayment: form.expireOnPayment,
				sendEmail: form.sendEmail,
			};
			await api.post('/payment-links', payload);
			setSuccess('Payment link created' + (form.sendEmail && form.studentEmail ? ' and email sent to student.' : '.'));
			setForm(emptyForm);
			setShowForm(false);
			load();
		} catch (err) {
			setError(err.response?.data?.message || 'Failed to create payment link');
		} finally {
			setSubmitting(false);
		}
	};

	const handleDelete = async (id) => {
		if (!window.confirm('Delete this payment link? This cannot be undone.')) return;
		try {
			await api.delete(`/payment-links/${id}`);
			setLinks((l) => l.filter((x) => x.id !== id));
		} catch {
			alert('Failed to delete payment link');
		}
	};

	const handleResend = async (id) => {
		try {
			await api.post(`/payment-links/${id}/resend`);
			alert('Email resent successfully.');
		} catch {
			alert('Failed to resend email');
		}
	};

	const handleCopy = (link) => {
		const url = `${SITE_BASE}/pay/${link.slug}`;
		navigator.clipboard.writeText(url).then(() => {
			setCopiedId(link.id);
			setTimeout(() => setCopiedId(null), 2000);
		});
	};

	const getLinkUrl = (slug) => `${SITE_BASE}/pay/${slug}`;

	return (
		<div className="pl-page">
			<div className="pl-header">
				<div>
					<h1>Payment Links</h1>
					<p>Create personalised payment links for students — no login required.</p>
				</div>
				<button className="pl-btn-primary" onClick={() => { setShowForm(!showForm); setError(''); setSuccess(''); }}>
					{showForm ? '✕ Cancel' : '+ New Payment Link'}
				</button>
			</div>

			{error && <div className="pl-alert pl-alert-error">{error}</div>}
			{success && <div className="pl-alert pl-alert-success">{success}</div>}

			{showForm && (
				<div className="pl-form-card">
					<h2>Create New Payment Link</h2>
					<form onSubmit={handleSubmit} className="pl-form">
						<div className="pl-form-row">
							<div className="pl-field">
								<label>Admin Label <span className="pl-req">*</span></label>
								<input name="label" value={form.label} onChange={handleChange} placeholder="e.g. John Doe – Certificate Level Feb 2026" required />
								<small>Internal reference only — not shown to student</small>
							</div>
						</div>

						<div className="pl-form-row pl-form-row-2">
							<div className="pl-field">
								<label>Student Name <small>(optional)</small></label>
								<input name="studentName" value={form.studentName} onChange={handleChange} placeholder="Full name — leave blank for a generic link" />
							</div>
							<div className="pl-field">
								<label>Student Email <small>(optional)</small></label>
								<input name="studentEmail" type="email" value={form.studentEmail} onChange={handleChange} placeholder="student@email.com — required to send email" />
							</div>
						</div>

						<div className="pl-form-row pl-form-row-2">
							<div className="pl-field">
								<label>Amount <span className="pl-req">*</span></label>
								<input name="amount" type="number" min="1" value={form.amount} onChange={handleChange} placeholder="e.g. 16000" required />
							</div>
							<div className="pl-field">
								<label>Currency <span className="pl-req">*</span></label>
								<select name="currency" value={form.currency} onChange={handleChange}>
									<option value="LKR">LKR (Sri Lankan Rupee)</option>
									<option value="GBP">GBP (British Pound)</option>
								</select>
							</div>
						</div>

						<div className="pl-form-row">
							<div className="pl-field">
								<label>Description <small>(shown to student)</small></label>
								<textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="e.g. CIMA Certificate Level – BA1, BA2, BA3" />
							</div>
						</div>

						<div className="pl-form-row pl-form-row-2">
							<div className="pl-field">
								<label>Password Protection <small>(optional)</small></label>
								<input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Leave blank for no password" autoComplete="new-password" />
								<small>Student must enter this to access the payment page</small>
							</div>
							<div className="pl-field">
								<label>Expiry Date <small>(optional)</small></label>
								<input name="expiresAt" type="datetime-local" value={form.expiresAt} onChange={handleChange} />
							</div>
						</div>

						<div className="pl-form-row pl-checkboxes">
							<label className="pl-checkbox-label">
								<input type="checkbox" name="expireOnPayment" checked={form.expireOnPayment} onChange={handleChange} />
								Deactivate link after successful payment
							</label>
							<label className={`pl-checkbox-label${!form.studentEmail ? ' pl-checkbox-disabled' : ''}`}>
								<input type="checkbox" name="sendEmail" checked={form.sendEmail && !!form.studentEmail} onChange={handleChange} disabled={!form.studentEmail} />
								Send payment link email to student now {!form.studentEmail && <small>(enter student email above)</small>}
							</label>
						</div>

						<div className="pl-form-actions">
							<button type="submit" className="pl-btn-primary" disabled={submitting}>
								{submitting ? 'Creating…' : 'Create Payment Link'}
							</button>
							<button type="button" className="pl-btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
						</div>
					</form>
				</div>
			)}

			<div className="pl-table-wrap">
				{loading ? (
					<p className="pl-loading">Loading…</p>
				) : links.length === 0 ? (
					<div className="pl-empty">
						<p>No payment links yet. Create one above.</p>
					</div>
				) : (
					<table className="pl-table">
						<thead>
							<tr>
								<th>Student</th>
								<th>Amount</th>
								<th>Description</th>
								<th>Status</th>
								<th>Features</th>
								<th>Created</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{links.map((link) => (
								<tr key={link.id} className={link.isPaid ? 'pl-row-paid' : !link.isActive ? 'pl-row-inactive' : ''}>
									<td>
										<div className="pl-student-name">{link.studentName || <span className="pl-none">Generic link</span>}</div>
										<div className="pl-student-email">{link.studentEmail || <span className="pl-none">—</span>}</div>
										<div className="pl-slug-label">{link.label}</div>
									</td>
									<td className="pl-amount">
										<strong>{formatCurrency(link.amount, link.currency)}</strong>
									</td>
									<td className="pl-desc">{link.description ? link.description.slice(0, 60) + (link.description.length > 60 ? '…' : '') : <span className="pl-none">—</span>}</td>
									<td>
										{link.isPaid ? (
											<span className="pl-badge pl-badge-paid">✓ Paid</span>
										) : !link.isActive ? (
											<span className="pl-badge pl-badge-inactive">Inactive</span>
										) : link.expiresAt && new Date(link.expiresAt) < new Date() ? (
											<span className="pl-badge pl-badge-expired">Expired</span>
										) : (
											<span className="pl-badge pl-badge-active">Active</span>
										)}
										{link.paidAt && (
											<div className="pl-paid-at">{new Date(link.paidAt).toLocaleDateString()}</div>
										)}
									</td>
									<td>
										<div className="pl-features">
											{link.hasPassword && <span className="pl-tag">🔒 Password</span>}
											{link.expireOnPayment && <span className="pl-tag">⏱ Expires on pay</span>}
											{link.expiresAt && <span className="pl-tag">📅 {new Date(link.expiresAt).toLocaleDateString()}</span>}
										</div>
									</td>
									<td className="pl-date">{new Date(link.createdAt).toLocaleDateString()}</td>
									<td>
										<div className="pl-actions">
											<button
												className="pl-btn-action pl-btn-copy"
												onClick={() => handleCopy(link)}
												title="Copy link"
											>
												{copiedId === link.id ? '✓ Copied' : '📋 Copy'}
											</button>
											<a
												className="pl-btn-action pl-btn-open"
												href={getLinkUrl(link.slug)}
												target="_blank"
												rel="noopener noreferrer"
												title="Open link"
											>
												↗ Open
											</a>
											<button
												className="pl-btn-action pl-btn-resend"
												onClick={() => handleResend(link.id)}
												title="Resend email" disabled={!link.studentEmail}											>
												✉ Email
											</button>
											<button
												className="pl-btn-action pl-btn-delete"
												onClick={() => handleDelete(link.id)}
												title="Delete"
											>
												🗑
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>
		</div>
	);
}
