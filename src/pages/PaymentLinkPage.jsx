import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PaymentLinkPage.css';

const API = import.meta.env.VITE_API_URL || 'https://api.nanaska.com';

function formatCurrency(amount, currency) {
	if (currency === 'GBP') return `£${amount.toLocaleString()}`;
	return `LKR ${amount.toLocaleString()}`;
}

export default function PaymentLinkPage() {
	const { slug } = useParams();
	const navigate = useNavigate();

	const [status, setStatus] = useState('loading'); // loading | password | form | error | paid | expired
	const [linkInfo, setLinkInfo] = useState(null);
	const [errorMsg, setErrorMsg] = useState('');

	// Password step
	const [password, setPassword] = useState('');
	const [passwordError, setPasswordError] = useState('');
	const [verifying, setVerifying] = useState(false);

	// Enrollment form
	const [form, setForm] = useState({
		firstName: '',
		lastName: '',
		email: '',
		phone: '',
		whatsapp: '',
		cimaId: '',
		cimaStage: '',
		dob: '',
		gender: '',
		country: '',
		city: '',
		postcode: '',
		notes: '',
	});
	const [showOptional, setShowOptional] = useState(false);
	const [paying, setPaying] = useState(false);
	const [formError, setFormError] = useState('');

	useEffect(() => {
		loadLink();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [slug]);

	async function loadLink() {
		try {
			const res = await axios.get(`${API}/payment-links/p/${slug}`);
			const data = res.data;
			setLinkInfo(data);

			if (data.isPaid) {
				setStatus('paid');
			} else if (data.hasPassword) {
				setStatus('password');
			} else {
				setStatus('form');
			}
		} catch (err) {
			const msg = err.response?.data?.message || 'This payment link is not available.';
			if (msg.toLowerCase().includes('expired')) {
				setStatus('expired');
			} else if (msg.toLowerCase().includes('already been used') || msg.toLowerCase().includes('already')) {
				setStatus('paid');
			} else {
				setErrorMsg(msg);
				setStatus('error');
			}
		}
	}

	async function handleVerifyPassword(e) {
		e.preventDefault();
		setPasswordError('');
		setVerifying(true);
		try {
			await axios.post(`${API}/payment-links/p/${slug}/verify`, { password });
			setStatus('form');
		} catch (err) {
			setPasswordError(err.response?.data?.message || 'Incorrect password. Please try again.');
		} finally {
			setVerifying(false);
		}
	}

	const handleFormChange = (e) => {
		const { name, value } = e.target;
		setForm((f) => ({ ...f, [name]: value }));
	};

	async function handlePay(e) {
		e.preventDefault();
		setFormError('');
		if (!form.firstName || !form.lastName || !form.email) {
			setFormError('Please fill in your first name, last name, and email.');
			return;
		}
		try {
			setPaying(true);
			const payload = {
				...form,
				password: linkInfo?.hasPassword ? password : undefined,
			};
			const res = await axios.post(`${API}/payment-links/p/${slug}/pay`, payload);
			const { paymentUrl } = res.data;
			if (paymentUrl) {
				window.location.href = paymentUrl;
			}
		} catch (err) {
			setFormError(err.response?.data?.message || 'Could not initiate payment. Please try again.');
		} finally {
			setPaying(false);
		}
	}

	// ── Loading ───────────────────────────────────────────────────────────────
	if (status === 'loading') {
		return (
			<div className="plp-wrap">
				<div className="plp-card plp-loading-card">
					<div className="plp-spinner" />
					<p>Loading your payment link…</p>
				</div>
			</div>
		);
	}

	// ── Error ─────────────────────────────────────────────────────────────────
	if (status === 'error') {
		return (
			<div className="plp-wrap">
				<div className="plp-card plp-state-card">
					<div className="plp-state-icon">❌</div>
					<h2>Link Not Available</h2>
					<p>{errorMsg || 'This payment link could not be found or is no longer available.'}</p>
					<a href="/" className="plp-btn-secondary">Go to Nanaska Home</a>
				</div>
			</div>
		);
	}

	// ── Expired ───────────────────────────────────────────────────────────────
	if (status === 'expired') {
		return (
			<div className="plp-wrap">
				<div className="plp-card plp-state-card">
					<div className="plp-state-icon">⏰</div>
					<h2>Link Expired</h2>
					<p>This payment link has expired. Please contact your Nanaska advisor for a new link.</p>
					<a href="mailto:info@nanaska.com" className="plp-btn-primary">Contact Nanaska</a>
				</div>
			</div>
		);
	}

	// ── Already paid ──────────────────────────────────────────────────────────
	if (status === 'paid') {
		return (
			<div className="plp-wrap">
				<div className="plp-card plp-state-card">
					<div className="plp-state-icon">✅</div>
					<h2>Payment Completed</h2>
					<p>This payment link has already been used. Thank you!</p>
					<p style={{ fontSize: 14, color: '#6b7280' }}>If you have any questions, contact us at <a href="mailto:info@nanaska.com">info@nanaska.com</a>.</p>
				</div>
			</div>
		);
	}

	// ── Password gate ─────────────────────────────────────────────────────────
	if (status === 'password') {
		return (
			<div className="plp-wrap">
				<div className="plp-card">
					<div className="plp-logo">
						<span className="plp-logo-dot" />
						<span className="plp-logo-text">Nanaska</span>
					</div>
					<div className="plp-lock-icon">🔒</div>
					<h2 className="plp-title">Secure Payment Link</h2>
					<p className="plp-subtitle">This link is password protected. Enter the password provided by your Nanaska advisor.</p>
					<form onSubmit={handleVerifyPassword} className="plp-form">
						<div className="plp-field">
							<label>Password</label>
							<input
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="Enter password"
								required
								autoFocus
							/>
						</div>
						{passwordError && <div className="plp-form-error">{passwordError}</div>}
						<button type="submit" className="plp-btn-primary" disabled={verifying}>
							{verifying ? 'Verifying…' : 'Continue →'}
						</button>
					</form>
					<p className="plp-contact">Forgot your password? <a href="mailto:info@nanaska.com">Contact us</a></p>
				</div>
			</div>
		);
	}

	// ── Enrollment form + payment ─────────────────────────────────────────────
	return (
		<div className="plp-wrap">
			<div className="plp-card plp-card-wide">
				{/* Header */}
				<div className="plp-logo">
					<span className="plp-logo-dot" />
					<span className="plp-logo-text">Nanaska</span>
				</div>
				<h2 className="plp-title">Complete Your Payment</h2>

				{/* Amount box */}
				<div className="plp-amount-box">
					<div className="plp-amount-label">Amount Due</div>
					<div className="plp-amount">{linkInfo && formatCurrency(linkInfo.amount, linkInfo.currency)}</div>
					<div className="plp-currency">{linkInfo?.currency}</div>
				</div>

				{linkInfo?.description && (
					<div className="plp-desc-box">
						<strong>Payment details:</strong><br />
						{linkInfo.description}
					</div>
				)}

				{linkInfo?.expiresAt && (
					<div className="plp-expiry-note">
						⏰ This link expires on {new Date(linkInfo.expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
					</div>
				)}

				{/* Enrollment form */}
				<form onSubmit={handlePay} className="plp-form">
					<h3 className="plp-section-title">Your Details</h3>
					<p className="plp-section-sub">These details will be used for your enrollment record.</p>

					<div className="plp-row">
						<div className="plp-field">
							<label>First Name <span className="plp-req">*</span></label>
							<input name="firstName" value={form.firstName} onChange={handleFormChange} placeholder="First name" required />
						</div>
						<div className="plp-field">
							<label>Last Name <span className="plp-req">*</span></label>
							<input name="lastName" value={form.lastName} onChange={handleFormChange} placeholder="Last name" required />
						</div>
					</div>

					<div className="plp-row">
						<div className="plp-field">
							<label>Email Address <span className="plp-req">*</span></label>
							<input name="email" type="email" value={form.email} onChange={handleFormChange} placeholder="your@email.com" required />
						</div>
						<div className="plp-field">
							<label>Phone Number</label>
							<input name="phone" type="tel" value={form.phone} onChange={handleFormChange} placeholder="+94 77 000 0000" />
						</div>
					</div>

					<button
						type="button"
						className="plp-optional-toggle"
						onClick={() => setShowOptional(!showOptional)}
					>
						{showOptional ? '▲ Hide' : '▼ Add'} optional enrollment details
					</button>

					{showOptional && (
						<div className="plp-optional-fields">
							<div className="plp-row">
								<div className="plp-field">
									<label>WhatsApp Number</label>
									<input name="whatsapp" value={form.whatsapp} onChange={handleFormChange} placeholder="+94 77 000 0000" />
								</div>
								<div className="plp-field">
									<label>CIMA ID</label>
									<input name="cimaId" value={form.cimaId} onChange={handleFormChange} placeholder="e.g. 12345678" />
								</div>
							</div>
							<div className="plp-row">
								<div className="plp-field">
									<label>CIMA Stage</label>
									<select name="cimaStage" value={form.cimaStage} onChange={handleFormChange}>
										<option value="">Select stage</option>
										<option value="Certificate">Certificate</option>
										<option value="Operational">Operational</option>
										<option value="Management">Management</option>
										<option value="Strategic">Strategic</option>
									</select>
								</div>
								<div className="plp-field">
									<label>Date of Birth</label>
									<input name="dob" type="date" value={form.dob} onChange={handleFormChange} />
								</div>
							</div>
							<div className="plp-row">
								<div className="plp-field">
									<label>Gender</label>
									<select name="gender" value={form.gender} onChange={handleFormChange}>
										<option value="">Prefer not to say</option>
										<option value="Male">Male</option>
										<option value="Female">Female</option>
										<option value="Other">Other</option>
									</select>
								</div>
								<div className="plp-field">
									<label>Country</label>
									<input name="country" value={form.country} onChange={handleFormChange} placeholder="e.g. Sri Lanka" />
								</div>
							</div>
							<div className="plp-row">
								<div className="plp-field">
									<label>City</label>
									<input name="city" value={form.city} onChange={handleFormChange} placeholder="e.g. Colombo" />
								</div>
								<div className="plp-field">
									<label>Postcode</label>
									<input name="postcode" value={form.postcode} onChange={handleFormChange} placeholder="e.g. 00100" />
								</div>
							</div>
							<div className="plp-field">
								<label>Additional Notes</label>
								<textarea name="notes" value={form.notes} onChange={handleFormChange} rows={3} placeholder="Any additional information…" />
							</div>
						</div>
					)}

					{formError && <div className="plp-form-error">{formError}</div>}

					<button type="submit" className="plp-btn-pay" disabled={paying}>
						{paying ? 'Redirecting to payment…' : `Pay ${linkInfo ? formatCurrency(linkInfo.amount, linkInfo.currency) : ''} →`}
					</button>

					<p className="plp-secure-note">
						🔒 Your payment is processed securely by Sampath Bank PayCorp. Nanaska does not store your card details.
					</p>
				</form>
			</div>
		</div>
	);
}
