import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { usePricing } from '../context/PricingContext';
import { getCombinationIdForLevel, getCombinationIdForCourse } from '../data/pricingData';
import './EnrollmentPage.css';

const API_URL = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');

const CIMA_STAGES = [
	'Certificate Level',
	'Operational Level',
	'Management Level',
	'Strategic Level',
];

const COUNTRIES = [
	'Sri Lanka', 'United Kingdom', 'Australia', 'United States', 'Canada',
	'Singapore', 'Malaysia', 'India', 'UAE', 'Other',
];

export default function EnrollmentPage() {
	const { cartItems, getItemPrice, getCartTotal } = useCart();
	const { selectedCountry, setSelectedCountry, formatAmount, isSriLanka, currency } = usePricing();
	const [submitted, setSubmitted] = useState(false);
	// Fetch all combinations from API to look up IDs for admin-created courses
	const [apiCombinations, setApiCombinations] = useState(null);
	useEffect(() => {
		if (!API_URL) return;
		fetch(`${API_URL}/courses/combinations`)
			.then((r) => r.ok ? r.json() : [])
			.then(setApiCombinations)
			.catch(() => { });
	}, []);
	// Country list: Sri Lanka is only shown to visitors detected as being in Sri Lanka.
	const availableCountries = isSriLanka
		? COUNTRIES
		: COUNTRIES.filter((c) => c !== 'Sri Lanka');
	const [showCimaId, setShowCimaId] = useState(false);
	const [form, setForm] = useState({
		firstName: '', lastName: '', email: '', phone: '', whatsapp: '',
		cimaId: '', cimaStage: '', dob: '', gender: '',
		country: selectedCountry || '', street: '', city: '', postcode: '',
		notes: '', terms: false,
	});

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		if (name === 'country') {
			setSelectedCountry(value);
		}
		setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
	};

	const [payError, setPayError] = useState('');
	const [paying, setPaying] = useState(false);
	const [fieldErrors, setFieldErrors] = useState({});

	const REQUIRED_FIELDS = [
		{ name: 'firstName', label: 'First Name' },
		{ name: 'lastName', label: 'Last Name' },
		{ name: 'email', label: 'Email Address' },
		{ name: 'phone', label: 'Phone Number' },
		{ name: 'country', label: 'Country' },
		{ name: 'street', label: 'Street Address' },
		{ name: 'city', label: 'City' },
		{ name: 'postcode', label: 'Postcode' },
	];

	const validateForm = () => {
		const errors = {};
		for (const field of REQUIRED_FIELDS) {
			if (!form[field.name] || !String(form[field.name]).trim()) {
				errors[field.name] = `${field.label} is required.`;
			}
		}
		if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
			errors.email = 'Please enter a valid email address.';
		}
		if (!form.terms) {
			errors.terms = 'You must agree to the terms and conditions.';
		}
		setFieldErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleBlur = (e) => {
		const { name } = e.target;
		const requiredNames = REQUIRED_FIELDS.map(f => f.name);
		if (!requiredNames.includes(name)) return;
		if (!form[name] || !String(form[name]).trim()) {
			const field = REQUIRED_FIELDS.find(f => f.name === name);
			setFieldErrors(prev => ({ ...prev, [name]: `${field.label} is required.` }));
		} else if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
			setFieldErrors(prev => ({ ...prev, email: 'Please enter a valid email address.' }));
		} else {
			setFieldErrors(prev => { const e = { ...prev }; delete e[name]; return e; });
		}
	};

	/**
	 * Attempt to pay online via the backend API.
	 * For logged-in users: uses the authenticated /payments/create endpoint.
	 * For guest users: uses /payments/guest-create with the form details already entered.
	 * Both paths redirect to the PayHere IPG checkout page.
	 */
	const handlePayOnline = async (combinationId) => {
		if (!API_URL) return;

		// If no combinationId found, extract courseIds from cart 
		const courseIds = cartItems
			.filter(item => item.type === 'course')
			.map(item => item.courseCode);

		if (!combinationId && courseIds.length === 0) {
			setPayError('No courses selected for payment.');
			return;
		}

		// Guests must have filled in at least their name and email first
		const token = localStorage.getItem('nanaska_token');
		if (!token) {
			if (!form.firstName || !form.email) {
				setPayError('Please fill in your First Name and Email Address above before paying online.');
				return;
			}
		}

		setPayError('');
		setPaying(true);
		try {
			const effectiveCurrency = currency || 'GBP';
			const cartAmount = getCartTotal(form.country || selectedCountry);
			let res;
			if (token) {
				// Authenticated user path
				const payload = {
					currency: effectiveCurrency,
					amount: cartAmount,
				};
				if (combinationId) {
					payload.combinationId = combinationId;
				} else {
					payload.courseIds = courseIds;
				}
				res = await fetch(`${API_URL}/payments/create`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify(payload),
				});
			} else {
				// Guest user path – send form details with the request
				const payload = {
					firstName: form.firstName,
					lastName: form.lastName,
					email: form.email,
					phone: form.phone || undefined,
					currency: effectiveCurrency,
					amount: cartAmount,
				};
				if (combinationId) {
					payload.combinationId = combinationId;
				} else {
					payload.courseIds = courseIds;
				}
				res = await fetch(`${API_URL}/payments/guest-create`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload),
				});
			}

			if (!res.ok) {
				const err = await res.json().catch(() => ({}));
				throw new Error(err.message || 'Payment initiation failed');
			}
			const { paymentUrl } = await res.json();

			// Redirect the browser to the PayCorp hosted checkout page
			window.location.href = paymentUrl;
		} catch (err) {
			setPayError(err.message || 'An error occurred. Please try again.');
			setPaying(false);
		}
	};

	const cartTotal = getCartTotal(form.country || selectedCountry);

	const getCartCombinationId = () => {
		if (cartItems.length === 0) return '';

		// Single item — fast path
		if (cartItems.length === 1) {
			const item = cartItems[0];
			// Use combinationId stored directly on the cart item (set by CourseLevelPage via DB)
			if (item.combinationId) return item.combinationId;

			if (item.type === 'level') return getCombinationIdForLevel(item.levelId);
			if (item.type === 'course') {
				// Try static map first
				const staticId = getCombinationIdForCourse(item.courseCode);
				if (staticId) return staticId;
				// Fall back to API combinations — find one that contains this course and has exactly 1 item
				if (apiCombinations) {
					const found = apiCombinations.find(
						(combo) => combo.items?.length === 1 && combo.items[0]?.course?.id === item.courseCode
					);
					if (found) return found.id;
				}
			}
			return '';
		}

		// Multiple items — extract all course codes, sort, and look up in API
		const courseCodes = cartItems
			.filter(item => item.type === 'course')
			.map(item => item.courseCode)
			.sort();

		if (courseCodes.length === 0) return '';

		// Look up the combination in API that matches this exact set of courses
		if (apiCombinations) {
			const found = apiCombinations.find((combo) => {
				const comboCourses = (combo.items || []).map(i => i.course?.id).filter(Boolean).sort();
				return comboCourses.length === courseCodes.length &&
					comboCourses.every((code, idx) => code === courseCodes[idx]);
			});
			if (found) return found.id;
		}

		return '';
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!validateForm()) {
			const firstErrorField = document.querySelector('.enrollment-page__input--error, .enrollment-page__select--error');
			if (firstErrorField) firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
			return;
		}
		// Save enrollment form data to backend before redirecting to payment
		if (API_URL && form.firstName && form.email) {
			try {
				await fetch(`${API_URL}/payments/enrollment-submit`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						firstName: form.firstName,
						lastName: form.lastName,
						email: form.email,
						phone: form.phone || undefined,
						whatsapp: form.whatsapp || undefined,
						cimaId: form.cimaId || undefined,
						cimaStage: form.cimaStage || undefined,
						dob: form.dob || undefined,
						gender: form.gender || undefined,
						country: form.country || undefined,
						city: form.city || undefined,
						postcode: form.postcode || undefined,
						notes: form.notes || undefined,
						cartItems,
						currency: currency || 'GBP',
						amount: cartTotal,
					}),
				});
			} catch (_) {
				// Non-blocking – proceed to payment even if save fails
			}
		}
		await handlePayOnline(getCartCombinationId());
	};

	if (submitted) {
		return (
			<div className="enrollment-page">
				<div className="enrollment-page__success">
					<div className="enrollment-page__success-icon">🎉</div>
					<h1>Enrollment Complete!</h1>
					<p>Thank you! Your payment has been received and your enrollment is confirmed. Check your email for further details.</p>
					<Link to="/" className="enrollment-page__success-btn">Back to Home</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="enrollment-page">
			<section className="enrollment-page__hero">
				<div className="enrollment-page__hero-inner">
					<h1 className="enrollment-page__hero-title">Complete Your Enrollment</h1>
					<p className="enrollment-page__hero-sub">Fill in your details below and proceed to secure online payment.</p>
				</div>
			</section>

			<div className="enrollment-page__body">
				<div className="enrollment-page__container">
					{/* Left: Summary */}
					<aside className="enrollment-page__summary">
						<div className="enrollment-page__summary-card">
							<h2 className="enrollment-page__summary-title">Enrollment Summary</h2>
							{cartItems.length === 0 ? (
								<p className="enrollment-page__summary-empty">
									Your cart is empty. <Link to="/">Browse courses</Link>
								</p>
							) : (
								<>
									<ul className="enrollment-page__summary-list">
										{cartItems.map(item => (
											<li
												key={item.type === 'level' ? item.levelId : item.courseCode}
												className={`enrollment-page__summary-item${item.type === 'level' ? ' enrollment-page__summary-item--level' : ''}`}
											>
												<div className="enrollment-page__summary-item-info">
													<span className="enrollment-page__summary-item-name">
														{item.type === 'level' ? item.levelTitle : `${item.courseCode} – ${item.courseName}`}
													</span>
													{item.type === 'level' && (
														<span className="enrollment-page__summary-badge">
															📚 Full Level · {item.courseCount} courses
														</span>
													)}
												</div>
												<span className="enrollment-page__summary-price">{formatAmount(getItemPrice(item, form.country || selectedCountry))}</span>
											</li>
										))}
									</ul>
									<div className="enrollment-page__summary-total">
										<span>Total</span>
										<span>{formatAmount(cartTotal)}</span>
									</div>
								</>
							)}
						</div>
					</aside>

					{/* Right: Form */}
					<main className="enrollment-page__form-col">
						<form className="enrollment-page__form" onSubmit={handleSubmit} noValidate>
							{/* Personal Details */}
							<fieldset className="enrollment-page__fieldset">
								<legend className="enrollment-page__legend">Personal Details</legend>
								<div className="enrollment-page__row">
									<div className="enrollment-page__field">
										<label className="enrollment-page__label" htmlFor="firstName">First Name *</label>
										<input
											id="firstName" name="firstName" type="text"
											className={`enrollment-page__input${fieldErrors.firstName ? ' enrollment-page__input--error' : ''}`}
											value={form.firstName} onChange={handleChange} onBlur={handleBlur} required
										/>
										{fieldErrors.firstName && <span className="enrollment-page__field-error">{fieldErrors.firstName}</span>}
									</div>
									<div className="enrollment-page__field">
										<label className="enrollment-page__label" htmlFor="lastName">Last Name *</label>
										<input
											id="lastName" name="lastName" type="text"
											className={`enrollment-page__input${fieldErrors.lastName ? ' enrollment-page__input--error' : ''}`}
											value={form.lastName} onChange={handleChange} onBlur={handleBlur} required
										/>
										{fieldErrors.lastName && <span className="enrollment-page__field-error">{fieldErrors.lastName}</span>}
									</div>
								</div>
								<div className="enrollment-page__field">
									<label className="enrollment-page__label" htmlFor="email">Email Address *</label>
									<input
										id="email" name="email" type="email"
										className={`enrollment-page__input${fieldErrors.email ? ' enrollment-page__input--error' : ''}`}
										value={form.email} onChange={handleChange} onBlur={handleBlur} required
									/>
									{fieldErrors.email && <span className="enrollment-page__field-error">{fieldErrors.email}</span>}
								</div>
								<div className="enrollment-page__row">
									<div className="enrollment-page__field">
										<label className="enrollment-page__label" htmlFor="phone">Phone Number *</label>
										<input
											id="phone" name="phone" type="tel"
											className={`enrollment-page__input${fieldErrors.phone ? ' enrollment-page__input--error' : ''}`}
											value={form.phone} onChange={handleChange} onBlur={handleBlur} required
										/>
										{fieldErrors.phone && <span className="enrollment-page__field-error">{fieldErrors.phone}</span>}
									</div>
									<div className="enrollment-page__field">
										<label className="enrollment-page__label" htmlFor="whatsapp">WhatsApp Number</label>
										<input
											id="whatsapp" name="whatsapp" type="tel"
											className="enrollment-page__input"
											placeholder="Optional"
											value={form.whatsapp} onChange={handleChange}
										/>
									</div>
								</div>
							</fieldset>

							{/* Professional Details */}
							<fieldset className="enrollment-page__fieldset">
								<legend className="enrollment-page__legend">Professional Details</legend>
								<div className="enrollment-page__field enrollment-page__field--toggle">
									<label className="enrollment-page__toggle-label">
										<input
											type="checkbox"
											checked={showCimaId}
											onChange={() => setShowCimaId(v => !v)}
										/>
										<span>I have a CIMA ID</span>
									</label>
								</div>
								{showCimaId && (
									<div className="enrollment-page__field">
										<label className="enrollment-page__label" htmlFor="cimaId">CIMA ID</label>
										<input
											id="cimaId" name="cimaId" type="text"
											className="enrollment-page__input"
											value={form.cimaId} onChange={handleChange}
										/>
									</div>
								)}
								<div className="enrollment-page__row">
									<div className="enrollment-page__field">
										<label className="enrollment-page__label" htmlFor="cimaStage">CIMA Stage</label>
										<select
											id="cimaStage" name="cimaStage"
											className="enrollment-page__select"
											value={form.cimaStage} onChange={handleChange}
										>
											<option value="">Select stage...</option>
											{CIMA_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
										</select>
									</div>
									<div className="enrollment-page__field">
										<label className="enrollment-page__label" htmlFor="dob">Date of Birth</label>
										<input
											id="dob" name="dob" type="date"
											className="enrollment-page__input"
											value={form.dob} onChange={handleChange}
										/>
									</div>
								</div>
								<div className="enrollment-page__field">
									<label className="enrollment-page__label">Gender</label>
									<div className="enrollment-page__radio-group">
										{['Male', 'Female', 'Prefer not to say'].map(g => (
											<label key={g} className="enrollment-page__radio-label">
												<input
													type="radio" name="gender" value={g}
													checked={form.gender === g}
													onChange={handleChange}
												/>
												<span>{g}</span>
											</label>
										))}
									</div>
								</div>
							</fieldset>

							{/* Address */}
							<fieldset className="enrollment-page__fieldset">
								<legend className="enrollment-page__legend">Address</legend>
								<div className="enrollment-page__field">
									<label className="enrollment-page__label" htmlFor="country">Country *</label>
									<select
										id="country" name="country"
										className={`enrollment-page__select${fieldErrors.country ? ' enrollment-page__select--error' : ''}`}
										value={form.country} onChange={handleChange} onBlur={handleBlur} required
									>
										<option value="">Select country...</option>
										{availableCountries.map(c => <option key={c} value={c}>{c}</option>)}
									</select>
									{fieldErrors.country && <span className="enrollment-page__field-error">{fieldErrors.country}</span>}
								</div>
								<div className="enrollment-page__field">
									<label className="enrollment-page__label" htmlFor="street">Street Address *</label>
									<input
										id="street" name="street" type="text"
										className={`enrollment-page__input${fieldErrors.street ? ' enrollment-page__input--error' : ''}`}
										value={form.street} onChange={handleChange} onBlur={handleBlur} required
									/>
									{fieldErrors.street && <span className="enrollment-page__field-error">{fieldErrors.street}</span>}
								</div>
								<div className="enrollment-page__row">
									<div className="enrollment-page__field">
										<label className="enrollment-page__label" htmlFor="city">City *</label>
										<input
											id="city" name="city" type="text"
											className={`enrollment-page__input${fieldErrors.city ? ' enrollment-page__input--error' : ''}`}
											value={form.city} onChange={handleChange} onBlur={handleBlur} required
										/>
										{fieldErrors.city && <span className="enrollment-page__field-error">{fieldErrors.city}</span>}
									</div>
									<div className="enrollment-page__field">
										<label className="enrollment-page__label" htmlFor="postcode">Postcode *</label>
										<input
											id="postcode" name="postcode" type="text"
											className={`enrollment-page__input${fieldErrors.postcode ? ' enrollment-page__input--error' : ''}`}
											value={form.postcode} onChange={handleChange} onBlur={handleBlur} required
										/>
										{fieldErrors.postcode && <span className="enrollment-page__field-error">{fieldErrors.postcode}</span>}
									</div>
								</div>
							</fieldset>

							{/* Notes & Terms */}
							<fieldset className="enrollment-page__fieldset">
								<legend className="enrollment-page__legend">Additional Notes</legend>
								<div className="enrollment-page__field">
									<label className="enrollment-page__label" htmlFor="notes">Notes</label>
									<textarea
										id="notes" name="notes"
										className="enrollment-page__textarea"
										rows={4}
										placeholder="Any questions or special requirements..."
										value={form.notes} onChange={handleChange}
									/>
								</div>
								<div className="enrollment-page__field enrollment-page__field--terms">
									<label className="enrollment-page__checkbox-label">
										<input
											type="checkbox" name="terms"
											checked={form.terms} onChange={handleChange} required
										/>
										<span>
											I agree to Nanaska&apos;s{' '}
											<a href="https://www.nanaska.com" target="_blank" rel="noopener noreferrer">
												terms and conditions
											</a>
											. *
										</span>
									</label>
									{fieldErrors.terms && <span className="enrollment-page__field-error">{fieldErrors.terms}</span>}
								</div>
							</fieldset>

							{payError && <p className="enrollment-page__pay-error">{payError}</p>}
							<button type="submit" className="enrollment-page__submit-btn" disabled={paying || cartItems.length === 0}>
								{paying ? 'Redirecting to payment…' : '💳 Enroll & Pay Now →'}
							</button>
						</form>
					</main>
				</div>
			</div>
		</div>
	);
}
