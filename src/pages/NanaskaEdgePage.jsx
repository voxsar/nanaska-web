import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { usePricing } from '../context/PricingContext';
import {
	formatCurrency,
	getCombinationIdForCourse,
	getCoursePricesByCode,
	getPriceForCountry,
} from '../data/pricingData';
import './NanaskaEdgePage.css';

const API_URL = (import.meta.env.VITE_API_URL || 'https://api.nanaska.com').trim().replace(/\/+$/, '');

const COUNTRIES = [
	'Sri Lanka',
	'United Kingdom',
	'Australia',
	'United States',
	'Canada',
	'Singapore',
	'Malaysia',
	'India',
	'UAE',
	'Other',
];

const DEFAULT_EDGE_SETTINGS = {
	edge_ocs_available: 'true',
	edge_mcs_available: 'false',
	edge_scs_available: 'false',
	edge_mcs_days_from_now: '6',
	edge_scs_days_from_now: '12',
	edge_ocs_revision_combination_id: 'op_ocs',
	edge_mcs_revision_combination_id: 'mg_mcs',
	edge_scs_revision_combination_id: 'st_scs',
};

const CASE_STUDIES = [
	{
		code: 'OCS',
		name: 'Operational',
		cimaStage: 'Operational Case Study',
		tagline: 'Operational Case Study, built for the operational level of CIMA.',
		fallbackDays: 0,
	},
	{
		code: 'MCS',
		name: 'Management',
		cimaStage: 'Management Case Study',
		tagline: 'Management Case Study, built for the management level of CIMA.',
		fallbackDays: 6,
	},
	{
		code: 'SCS',
		name: 'Strategic',
		cimaStage: 'Strategic Case Study',
		tagline: 'Strategic Case Study, built for the final CIMA case study level.',
		fallbackDays: 12,
	},
];

const FEATURES = [
	{ icon: 'target', title: 'Mock Exams', body: 'Full timed CIMA mock papers with multi-part questions, attempt tracking, and shareable result summaries.' },
	{ icon: 'edit', title: 'Practice Questions', body: 'Targeted practice tied to pre-seen documents so students can master specific topics at their own pace.' },
	{ icon: 'book', title: 'Past Papers', body: 'A complete CIMA past-paper library for understanding patterns, examiner expectations, and answer structure.' },
	{ icon: 'doc', title: 'Pre-Seen Documents', body: 'Upload, view, and reference pre-seen materials through an integrated PDF citation viewer.' },
	{ icon: 'bolt', title: 'Automated Marking', body: 'Intelligent marking for mocks and practice questions, with feedback available the moment an attempt is submitted.' },
	{ icon: 'search', title: 'Ask Pre-Seen', body: 'A focused question interface tied directly to pre-seen materials to unpack scenarios and assumptions.' },
	{ icon: 'keyboard', title: 'Typing Tutor', body: 'Practice sessions with progress tracking to build the speed and accuracy timed case-study exams demand.' },
	{ icon: 'video', title: 'Video Library', body: 'On-demand walkthroughs from expert tutors, covering exam technique and complex business concepts.' },
	{ icon: 'chart', title: 'Business Models', body: 'A reference library of business frameworks and sample student responses for better answer planning.' },
];

const WHY_EDGE = [
	{ num: '01', title: 'Intelligent Marking', body: 'Advanced automated marking provides instant feedback that adapts to each student attempt.' },
	{ num: '02', title: 'Comprehensive Coverage', body: 'From mock exams to industry knowledge, the key tools for CIMA case-study success live in one platform.' },
	{ num: '03', title: 'Time-Saving Automation', body: 'Automated marking means students spend more time improving answers and less time waiting for review.' },
	{ num: '04', title: 'Expert-Designed Content', body: 'Content is shaped around CIMA case-study expectations and Nanaska tutor experience.' },
];

const Icon = {
	check: (props) => (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
			<polyline points="20 6 9 17 4 12" />
		</svg>
	),
	arrow: (props) => (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
			<line x1="5" y1="12" x2="19" y2="12" />
			<polyline points="12 5 19 12 12 19" />
		</svg>
	),
	close: (props) => (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
			<line x1="18" y1="6" x2="6" y2="18" />
			<line x1="6" y1="6" x2="18" y2="18" />
		</svg>
	),
	symbol: (name) => {
		const common = {
			viewBox: '0 0 24 24',
			fill: 'none',
			stroke: 'currentColor',
			strokeWidth: '1.8',
			strokeLinecap: 'round',
			strokeLinejoin: 'round',
		};
		const paths = {
			target: <><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></>,
			edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></>,
			book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></>,
			doc: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></>,
			bolt: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />,
			search: <><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>,
			keyboard: <><rect x="2" y="6" width="20" height="14" rx="2" /><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h.01M18 14h.01M10 14h4" /></>,
			video: <><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" /></>,
			chart: <><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></>,
		};
		return <svg {...common}>{paths[name]}</svg>;
	},
};

function settingsToMap(settings) {
	return settings.reduce((acc, item) => {
		acc[item.key] = item.value;
		return acc;
	}, { ...DEFAULT_EDGE_SETTINGS });
}

function toBool(value, fallback = false) {
	if (value === undefined || value === null || value === '') return fallback;
	return ['true', '1', 'yes', 'on'].includes(String(value).trim().toLowerCase());
}

function parseTargetMs(value, fallbackMs) {
	if (!value) return fallbackMs;
	const timestamp = new Date(value).getTime();
	return Number.isNaN(timestamp) ? fallbackMs : timestamp;
}

function splitName(form) {
	return [form.firstName, form.lastName].filter(Boolean).join(' ').trim();
}

function useReveal() {
	useEffect(() => {
		const els = document.querySelectorAll('.edge-reveal');
		const io = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add('is-in');
					io.unobserve(entry.target);
				}
			});
		}, { threshold: 0.15 });
		els.forEach((el) => io.observe(el));
		return () => io.disconnect();
	}, []);
}

function useEdgeSettings() {
	const [settings, setSettings] = useState(DEFAULT_EDGE_SETTINGS);

	useEffect(() => {
		if (!API_URL) return;
		fetch(`${API_URL}/settings/public?category=nanaska-edge`)
			.then((res) => (res.ok ? res.json() : []))
			.then((data) => setSettings(settingsToMap(Array.isArray(data) ? data : [])))
			.catch(() => setSettings(DEFAULT_EDGE_SETTINGS));
	}, []);

	return settings;
}

function useCountdown(targetMs) {
	const [now, setNow] = useState(() => Date.now());

	useEffect(() => {
		const id = window.setInterval(() => setNow(Date.now()), 1000);
		return () => window.clearInterval(id);
	}, []);

	const diff = Math.max(0, targetMs - now);
	return {
		days: Math.floor(diff / 86400000),
		hours: Math.floor((diff % 86400000) / 3600000),
		mins: Math.floor((diff % 3600000) / 60000),
		secs: Math.floor((diff % 60000) / 1000),
		done: diff === 0,
	};
}

function Countdown({ targetMs }) {
	const { days, hours, mins, secs } = useCountdown(targetMs);
	const pad = (n) => String(n).padStart(2, '0');

	return (
		<div className="edge-countdown" aria-label="Countdown until registration opens">
			<div className="edge-countdown__cell"><span>{pad(days)}</span><small>Days</small></div>
			<div className="edge-countdown__cell"><span>{pad(hours)}</span><small>Hrs</small></div>
			<div className="edge-countdown__cell"><span>{pad(mins)}</span><small>Min</small></div>
			<div className="edge-countdown__cell"><span>{pad(secs)}</span><small>Sec</small></div>
		</div>
	);
}

function Aurora() {
	return (
		<div className="edge-aurora" aria-hidden="true">
			<div className="edge-aurora__blob edge-aurora__blob--one" />
			<div className="edge-aurora__blob edge-aurora__blob--two" />
			<div className="edge-aurora__blob edge-aurora__blob--three" />
			<div className="edge-aurora__grain" />
		</div>
	);
}

function PanelGrid({ onPickFree, onPickRevision }) {
	const onMove = (e) => {
		const rect = e.currentTarget.getBoundingClientRect();
		e.currentTarget.style.setProperty('--mx', `${((e.clientX - rect.left) / rect.width) * 100}%`);
		e.currentTarget.style.setProperty('--my', `${((e.clientY - rect.top) / rect.height) * 100}%`);
	};

	return (
		<div className="edge-panel-grid">
			<button className="edge-panel edge-reveal" onMouseMove={onMove} onClick={onPickFree}>
				<div className="edge-panel__glow" />
				<div className="edge-panel__tag"><span /> Complimentary, no card</div>
				<h3>Free <em>Mock Exam</em></h3>
				<p>Try the platform with a complimentary timed mock and instant feedback before you commit.</p>
				<ul>
					<li><Icon.check /> Full timed mock exam</li>
					<li><Icon.check /> Instant automated marking</li>
					<li><Icon.check /> Detailed performance feedback</li>
					<li><Icon.check /> No credit card required</li>
				</ul>
				<div className="edge-panel__cta">
					<span>Start free mock</span>
					<i><Icon.arrow /></i>
				</div>
			</button>

			<button className="edge-panel edge-reveal" onMouseMove={onMove} onClick={onPickRevision}>
				<div className="edge-panel__glow" />
				<div className="edge-panel__tag"><span /> Guided programme</div>
				<h3>Revision <em>Session</em></h3>
				<p>Enroll in structured revision with expert-designed mocks, practice and progress support.</p>
				<ul>
					<li><Icon.check /> Multiple practice sessions</li>
					<li><Icon.check /> Topic-specific revision</li>
					<li><Icon.check /> Progress tracking and analytics</li>
					<li><Icon.check /> Expert-designed questions</li>
				</ul>
				<div className="edge-panel__cta">
					<span>Start revision</span>
					<i><Icon.arrow /></i>
				</div>
			</button>
		</div>
	);
}

function SelectionModal({ kind, settings, baseTime, onClose, onPick }) {
	const [now, setNow] = useState(() => Date.now());

	useEffect(() => {
		const onKey = (e) => {
			if (e.key === 'Escape') onClose();
		};
		const id = window.setInterval(() => setNow(Date.now()), 1000);
		window.addEventListener('keydown', onKey);
		document.body.style.overflow = 'hidden';
		return () => {
			window.clearInterval(id);
			window.removeEventListener('keydown', onKey);
			document.body.style.overflow = '';
		};
	}, [onClose]);

	const title = kind === 'free' ? 'Free Mock' : 'Revision Session';
	const sub = kind === 'free'
		? 'Pick your CIMA case study to start a complimentary timed mock with instant marking.'
		: 'Pick your CIMA case study to enroll in a guided revision programme.';

	return (
		<div className="edge-overlay" role="dialog" aria-modal="true" aria-label={`${title} case study selection`}>
			<div className="edge-overlay__bg" />

			<div className="edge-overlay__content">
				<div className="edge-overlay__eyebrow">{title}, step 1 of 2</div>
				<h2 className="edge-overlay__title">Choose your <em>case study.</em></h2>
				<p className="edge-overlay__sub">{sub}</p>

				<div className="edge-option-grid">
					{CASE_STUDIES.map((option) => {
						const key = option.code.toLowerCase();
						const fallbackDays = Number(settings[`edge_${key}_days_from_now`] ?? option.fallbackDays);
						const fallbackTarget = baseTime + (Number.isFinite(fallbackDays) ? fallbackDays : option.fallbackDays) * 86400000;
						const configuredTarget = parseTargetMs(settings[`edge_${key}_opens_at`], fallbackTarget);
						const isOpenByTime = configuredTarget <= now;
						const available = toBool(settings[`edge_${key}_available`], option.code === 'OCS') || isOpenByTime;

						return (
							<div key={option.code} className={`edge-option${available ? ' edge-option--available' : ''}`}>
								<div className="edge-option__code">{option.code}</div>
								<h3>{option.name} <em>Case Study</em></h3>
								<p>{option.tagline}</p>

								<div className="edge-option__meta">
									{available ? (
										<>
											<div className="edge-option__status"><span /> Available now</div>
											<button className="edge-option__cta" onClick={() => onPick({ ...option, kind })}>
												<span>Continue</span>
												<i><Icon.arrow /></i>
											</button>
										</>
									) : (
										<>
											<div className="edge-option__status"><span /> Opens soon</div>
											<Countdown targetMs={configuredTarget} />
											<div className="edge-option__disabled">Registration opens with the next intake window.</div>
										</>
									)}
								</div>
							</div>
						);
					})}
				</div>

				<div className="edge-overlay__footer">
					<button className="edge-overlay__close" onClick={onClose} aria-label="Close">
						<Icon.close /> Close
					</button>
				</div>
			</div>
		</div>
	);
}

const EDGE_TRIAL_API = 'https://edge.trial.nanaska.com/api/provision/students/email';
const EDGE_REVISION_API = 'https://edge.revision.nanaska.com/api/provision/students/email';
const EDGE_TRIAL_RESEND_API = 'https://edge.trial.nanaska.com/api/auth/resend-setup-email';
const EDGE_REVISION_RESEND_API = 'https://edge.revision.nanaska.com/api/auth/resend-setup-email';

async function checkEmailRegistered(email, kind) {
	const base = kind === 'free' ? EDGE_TRIAL_API : EDGE_REVISION_API;
	try {
		const res = await fetch(`${base}?email=${encodeURIComponent(email)}`);
		if (res.ok) {
			const data = await res.json().catch(() => null);
			// Registered if response is ok and returns student data
			return data && (data.id || data.email || data.student);
		}
		return false;
	} catch {
		return false;
	}
}

function SignupView({ selection, settings, onBack, prefill = {} }) {
	const { selectedCountry, setSelectedCountry, currency, formatAmount } = usePricing();

	// Split prefill.name into first/last if individual fields aren't provided
	const prefillFirstName = prefill.firstName || (prefill.name ? prefill.name.trim().split(/\s+/)[0] : '');
	const prefillLastName = prefill.lastName || (prefill.name ? prefill.name.trim().split(/\s+/).slice(1).join(' ') : '');

	const [form, setForm] = useState({
		firstName: prefillFirstName,
		lastName: prefillLastName,
		email: prefill.email || '',
		phone: prefill.phone || '',
		cimaId: prefill.studentId || '',
		studyMode: 'Online',
		country: selectedCountry || '',
		notes: '',
	});
	const [submitting, setSubmitting] = useState(false);
	const [submitted, setSubmitted] = useState(false);
	const [error, setError] = useState('');
	const [emailWarning, setEmailWarning] = useState('');
	const [emailCountdown, setEmailCountdown] = useState(0);
	const [resending, setResending] = useState(false);
	const [resendMsg, setResendMsg] = useState('');

	const kindLabel = selection.kind === 'free' ? 'Free Mock' : 'Revision Session';
	const registrationType = selection.kind === 'free' ? 'free-mock' : 'revision';
	const productLabel = `${selection.code} ${selection.name} Case Study, ${kindLabel}`;
	const effectiveCountry = form.country || selectedCountry;
	const selectedCurrency = effectiveCountry ? (effectiveCountry === 'Sri Lanka' ? 'LKR' : 'GBP') : currency;

	// Read display prices from Edge settings (admin-editable), fall back to pricingData
	const codeKey = selection.code.toLowerCase();
	const settingLkr = settings[`edge_${codeKey}_price_lkr`];
	const settingGbp = settings[`edge_${codeKey}_price_gbp`];
	const staticPrices = getCoursePricesByCode(selection.code, 0);
	const displayPrices = {
		lkr: settingLkr ? parseInt(settingLkr, 10) : staticPrices.lkr,
		gbp: settingGbp ? parseInt(settingGbp, 10) : staticPrices.gbp,
	};
	const amount = selection.kind === 'free' ? 0 : getPriceForCountry(displayPrices, effectiveCountry);
	const priceLabel = selection.kind === 'free' ? 'Complimentary' : formatCurrency(amount, selectedCurrency);
	const revisionCombinationId = settings[`edge_${codeKey}_revision_combination_id`] || getCombinationIdForCourse(selection.code);
	const combinationId = selection.kind === 'revision' ? revisionCombinationId : getCombinationIdForCourse(selection.code);

	const update = (key) => (e) => {
		const value = e.target.value;
		if (key === 'country') setSelectedCountry(value);
		if (key === 'email') setEmailWarning('');
		setForm((prev) => ({ ...prev, [key]: value }));
	};

	const handleEmailBlur = async () => {
		if (!form.email) return;
		const registered = await checkEmailRegistered(form.email, selection.kind);
		if (registered) {
			setEmailWarning('This email is already registered on the Edge platform. If you need help, please contact us.');
		}
	};

	const saveEnrollment = async ({ orderId } = {}) => {
		const notes = [
			'Nanaska Edge registration',
			`Programme: ${kindLabel}`,
			`Case study: ${selection.code} ${selection.name}`,
			`Study mode: ${form.studyMode}`,
			form.notes ? `Student notes: ${form.notes}` : '',
		].filter(Boolean).join('\n');

		const res = await fetch(`${API_URL}/payments/enrollment-submit`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				firstName: form.firstName,
				lastName: form.lastName,
				email: form.email,
				phone: form.phone || undefined,
				cimaId: form.cimaId || undefined,
				cimaStage: selection.cimaStage,
				country: form.country || undefined,
				notes,
				cartItems: [{
					type: 'nanaska-edge',
					title: productLabel,
					name: productLabel,
					courseCode: selection.code,
					combinationId,
					kind: selection.kind,
					registrationType,
					studyMode: form.studyMode,
				}],
				registrationType,
				currency: selectedCurrency,
				amount,
				orderId,
			}),
		});

		if (!res.ok) {
			const body = await res.json().catch(() => ({}));
			throw new Error(body.message || 'Could not save your registration.');
		}
	};

	const startPayment = async () => {
		// Build enrollment metadata so backend can create the enrollment record
		// after payment success — no enrollment is saved before payment.
		const enrollmentMeta = {
			cimaId: form.cimaId || undefined,
			cimaStage: selection.cimaStage,
			country: form.country || undefined,
			notes: [
				'Nanaska Edge registration',
				`Programme: ${kindLabel}`,
				`Case study: ${selection.code} ${selection.name}`,
				`Study mode: ${form.studyMode}`,
				form.notes ? `Student notes: ${form.notes}` : '',
			].filter(Boolean).join('\n'),
			cartItems: [{
				type: 'nanaska-edge',
				title: productLabel,
				name: productLabel,
				courseCode: selection.code,
				combinationId,
				kind: selection.kind,
				registrationType,
				studyMode: form.studyMode,
			}],
			registrationType,
			externalId: prefill?.externalId || undefined,
		};

		const payload = {
			firstName: form.firstName,
			lastName: form.lastName,
			email: form.email,
			phone: form.phone || undefined,
			currency: selectedCurrency,
			amount,
			...(combinationId ? { combinationId } : { courseIds: [selection.code] }),
			isEdgeRevision: true,
			enrollmentMeta,
		};

		const res = await fetch(`${API_URL}/payments/guest-create`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		});

		if (!res.ok) {
			const body = await res.json().catch(() => ({}));
			throw new Error(body.message || 'Could not start payment.');
		}

		return res.json();
	};

	const sendUpgradeWebhook = (paymentUrl) => {
		const payload = {
			firstName: form.firstName,
			lastName: form.lastName,
			email: form.email,
			phone: form.phone || undefined,
			cimaId: form.cimaId || undefined,
			cimaStage: selection.cimaStage,
			country: form.country || undefined,
			studyMode: form.studyMode,
			caseStudyCode: selection.code,
			caseStudyName: selection.name,
			programme: 'Revision Session',
			combinationId,
			currency: selectedCurrency,
			amount,
			externalId: prefill?.externalId || undefined,
			paymentUrl: paymentUrl || undefined,
		};
		fetch('https://automation.nanaska.com/webhook/upgrade', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		}).catch(() => { });
	};

	const submit = async (e) => {
		e.preventDefault();
		setSubmitting(true);
		setError('');

		try {
			if (selection.kind === 'revision') {
				// Enrollment is created by the backend webhook AFTER payment succeeds.
				// No enrollment record is saved here — user can retry freely if payment fails.
				const payment = await startPayment();
				sendUpgradeWebhook(payment.paymentUrl);
				window.location.href = payment.paymentUrl;
				return;
			}

			await saveEnrollment();
			setSubmitted(true);		// Start 60-second countdown for the password setup email
			setEmailCountdown(60);
		} catch (err) {
			setError(err.message || 'Something went wrong. Please try again.');
		} finally {
			setSubmitting(false);
		}
	};

	// Tick down the password email expiry countdown
	useEffect(() => {
		if (emailCountdown <= 0) return;
		const id = window.setTimeout(() => setEmailCountdown((c) => Math.max(0, c - 1)), 1000);
		return () => window.clearTimeout(id);
	}, [emailCountdown]);

	const handleResendEmail = async () => {
		setResending(true);
		setResendMsg('');
		try {
			const resendUrl = selection.kind === 'free' ? EDGE_TRIAL_RESEND_API : EDGE_REVISION_RESEND_API;
			const res = await fetch(resendUrl, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: form.email }),
			});
			if (res.ok) {
				setResendMsg('Email resent! Check your inbox.');
				setEmailCountdown(60);
			} else {
				setResendMsg('Could not resend. Please try again shortly.');
			}
		} catch {
			setResendMsg('Could not resend. Please check your connection.');
		} finally {
			setResending(false);
		}
	};

	return (
		<div className="edge-signup" role="dialog" aria-modal="true" aria-label={`${productLabel} registration`}>
			<div className="edge-signup__shell">
				<aside className="edge-signup__side">
					<div>
						<button className="edge-signup__back" onClick={onBack}>
							<span><Icon.arrow /></span>
							Back to Edge
						</button>

						<div className="edge-signup__eyebrow">Enrollment, {selection.code}</div>
						<h2>You're one step from the <em>{selection.name}</em> case study.</h2>
						<p>
							Tell us a little about yourself. We will register your Edge interest in the main Nanaska admin flow
							and {selection.kind === 'free' ? 'send the next access instructions.' : 'send you to secure payment.'}
						</p>
					</div>

					<div className="edge-signup__summary">
						<div><span>Programme</span><strong>{kindLabel}</strong></div>
						<div><span>Case study</span><strong>{selection.code}, {selection.name}</strong></div>
						<div><span>Format</span><strong>{form.studyMode}</strong></div>
						<div><span>Price</span><strong>{selection.kind === 'free' ? priceLabel : formatAmount(amount)}</strong></div>
					</div>
				</aside>

				<main className="edge-signup__form-wrap">
					{submitted ? (
						<div className="edge-success">
							<div className="edge-success__icon"><Icon.check /></div>
							<h2>You're <em>in.</em></h2>
							<p>
								Thanks {form.firstName || splitName(form)}. Your {productLabel} registration has been saved.
							</p>
							<div className="edge-success__email-notice">
								<strong>Check your inbox at {form.email}</strong>
								<p>We've sent a password setup link to get you into the platform. The link expires in 60 seconds — open it quickly.</p>
								{emailCountdown > 0 && (
									<div className="edge-success__countdown">
										Link expires in <strong>{emailCountdown}s</strong>
									</div>
								)}
								{(emailCountdown === 0 || resendMsg) && (
									<div className="edge-success__resend">
										{resendMsg && <span className="edge-success__resend-msg">{resendMsg}</span>}
										<button
											className="edge-btn edge-btn--ghost edge-btn--sm"
											onClick={handleResendEmail}
											disabled={resending}
										>
											{resending ? 'Sending…' : 'Resend email'}
										</button>
									</div>
								)}
							</div>
							<button className="edge-btn edge-btn--primary" onClick={onBack}>
								Back to Edge <Icon.arrow />
							</button>
						</div>
					) : (
						<form className="edge-form" onSubmit={submit}>
							<div className="edge-form__eyebrow">Your details</div>
							{error && <div className="edge-form__error">{error}</div>}

							<div className="edge-form__row">
								<label>
									<span>First name</span>
									<input required value={form.firstName} onChange={update('firstName')} placeholder="First name" />
								</label>
								<label>
									<span>Last name</span>
									<input required value={form.lastName} onChange={update('lastName')} placeholder="Last name" />
								</label>
							</div>

							<label>
								<span>Email</span>
								<input required type="email" value={form.email} onChange={update('email')} onBlur={handleEmailBlur} placeholder="you@example.com" />
								{emailWarning && <div className="edge-form__email-warning">{emailWarning}</div>}
							</label>

							<div className="edge-form__row">
								<label>
									<span>Phone</span>
									<input required value={form.phone} onChange={update('phone')} placeholder="+94 77 ..." />
								</label>
								<label>
									<span>CIMA Contact ID <small>(optional)</small></span>
									<input value={form.cimaId} onChange={update('cimaId')} placeholder="0000000" />
								</label>
							</div>

							<div className="edge-form__row">
								<label>
									<span>Study mode</span>
									<select value={form.studyMode} onChange={update('studyMode')}>
										<option>Online</option>
										<option>Hybrid</option>
										<option>On-campus (Colombo)</option>
									</select>
								</label>
								<label>
									<span>Country</span>
									<select value={form.country} onChange={update('country')}>
										<option value="">Select country...</option>
										{COUNTRIES.map((country) => <option key={country}>{country}</option>)}
									</select>
								</label>
							</div>

							<label>
								<span>Anything we should know?</span>
								<textarea rows="3" value={form.notes} onChange={update('notes')} placeholder="Goals, prior attempts, scheduling notes..." />
							</label>

							<button type="submit" className="edge-btn edge-btn--primary" disabled={submitting}>
								{submitting ? 'Processing...' : selection.kind === 'free' ? 'Start free mock' : `Pay ${priceLabel}`} <Icon.arrow />
							</button>

							<p className="edge-form__fineprint">
								{selection.kind === 'free'
									? 'Your registration will appear under Nanaska admin enrollment submissions.'
									: 'Secure payment is processed through the main Nanaska payment gateway.'}
							</p>
						</form>
					)}
				</main>
			</div>
		</div>
	);
}

export default function NanaskaEdgePage() {
	const settings = useEdgeSettings();
	const { mockType } = useParams();
	const [searchParams] = useSearchParams();

	// Pre-fill data from URL params (used by revision-upgrade endpoint)
	const urlCode = searchParams.get('code')?.toUpperCase();
	const prefill = urlCode ? {
		name: searchParams.get('name') || '',
		email: searchParams.get('email') || '',
		phone: searchParams.get('phone') || '',
		studentId: searchParams.get('studentId') || '',
		externalId: searchParams.get('externalId') || '',
	} : null;

	// If a code is in the URL, auto-select that case study and go straight to SignupView
	const [signupSelection, setSignupSelection] = useState(() => {
		if (urlCode && mockType === 'revision-mock') {
			const matched = CASE_STUDIES.find((cs) => cs.code === urlCode);
			if (matched) return { ...matched, kind: 'revision' };
		}
		return null;
	});

	// Only open the SelectionModal if we don't already have an auto-selected course
	const [selectionKind, setSelectionKind] = useState(() => {
		if (mockType === 'free-mock') return 'free';
		if (mockType === 'revision-mock' && !urlCode) return 'revision';
		return null;
	});
	const [baseTime] = useState(() => Date.now());

	useReveal();

	const openSelection = (kind) => {
		setSignupSelection(null);
		setSelectionKind(kind);
	};

	return (
		<div className="edge-page" data-edge-theme="light">
			<Aurora />

			<section className="edge-hero-combined" id="mock">
				<div className="edge-container">
					<div className="edge-hero-combined__top edge-reveal is-in">
						<img src="/images/nanaska-edge-logo.png" alt="Nanaska Edge" className="edge-logo--top" />
						<h1>Transform Your <span>CIMA CASE STUDY</span><br />Learnings <em>Today</em></h1>
						<p>Personalized, Instant and Interactive Learning for Superior Performance</p>
					</div>
					<PanelGrid onPickFree={() => openSelection('free')} onPickRevision={() => openSelection('revision')} />
				</div>
			</section>

			<section className="edge-section--blue">
				<div className="edge-features edge-container">
					<div className="edge-reveal">
						<div className="edge-section-eyebrow">Feature set</div>
						<h2 className="edge-section-title">Everything you need <em>to excel.</em></h2>
						<p className="edge-section-sub">Nine purpose-built tools that work together across the full case-study journey.</p>
					</div>

					<div className="edge-feature-grid">
						{FEATURES.map((feature, index) => (
							<div key={feature.title} className="edge-feature edge-reveal" style={{ transitionDelay: `${index * 50}ms` }}>
								<div className="edge-feature__num">{String(index + 1).padStart(2, '0')}</div>
								<div className="edge-feature__icon">{Icon.symbol(feature.icon)}</div>
								<h3>{feature.title}</h3>
								<p>{feature.body}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			<section className="edge-why edge-container">
				<div className="edge-reveal">
					<div className="edge-section-eyebrow">Why Edge</div>
					<h2 className="edge-section-title">An <em>edge</em> measured in hours saved.</h2>
					<p className="edge-section-sub">Built specifically for CIMA students, by people who know what the exam asks of you.</p>
				</div>

				<div className="edge-why-grid">
					{WHY_EDGE.map((item, index) => (
						<div key={item.num} className="edge-why-card edge-reveal" style={{ transitionDelay: `${index * 60}ms` }}>
							<div>{item.num}</div>
							<h3>{item.title}</h3>
							<p>{item.body}</p>
						</div>
					))}
				</div>
			</section>

			<section className="edge-section--blue">
				<div className="edge-cta edge-container">
					<div className="edge-cta__card edge-reveal">
						<h2>Ready for the <em>Edge</em> advantage?</h2>
						<p>
							Start with a free mock or enroll in a guided revision session using the same Nanaska admin,
							payment, and registration systems you already trust.
						</p>
						<div className="edge-cta__actions">
							<button className="edge-btn edge-btn--primary" onClick={() => openSelection('free')}>
								Start your free mock <Icon.arrow />
							</button>
							<Link className="edge-btn edge-btn--ghost" to="/contact">Talk to an advisor</Link>
						</div>
						<div className="edge-cta__bullets">
							<div><Icon.check /> Instant marking</div>
							<div><Icon.check /> Mock exams</div>
							<div><Icon.check /> Video library</div>
							<div><Icon.check /> Progress analytics</div>
							<div><Icon.check /> Past papers</div>
							<div><Icon.check /> Typing tutor</div>
						</div>
					</div>
				</div>
			</section>

			<section className="edge-stats-bottom edge-container">
				<div className="edge-stats edge-stats--centered edge-reveal">
					<div><strong>90%</strong><span>Faster marking turnaround</span></div>
					<div><strong>24/7</strong><span>Tutor support, always on</span></div>
					<div><strong>100%</strong><span>Instant feedback on every attempt</span></div>
				</div>
			</section>

			{selectionKind && (
				<SelectionModal
					kind={selectionKind}
					settings={settings}
					baseTime={baseTime}
					onClose={() => setSelectionKind(null)}
					onPick={(selection) => {
						setSelectionKind(null);
						setSignupSelection(selection);
					}}
				/>
			)}

			{signupSelection && (
				<SignupView selection={signupSelection} settings={settings} onBack={() => setSignupSelection(null)} prefill={prefill || {}} />
			)}
		</div>
	);
}
