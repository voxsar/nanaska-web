import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import FunnelHeader from '../components/FunnelHeader';
import { useSEO } from '../hooks/useSEO';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useApi } from '../hooks/useApi';
import {
	trackButtonClick,
	trackFormStart,
	trackFormSubmit,
	trackFormError,
	trackEvent,
} from '../hooks/useTracking';
import './FinancialLeadershipPage.css';

const API_URL = (import.meta.env.VITE_API_URL || 'https://api.nanaska.com').trim().replace(/\/+$/, '');
const BROCHURE_URL = '/images/2025-07-Nanaska-FLP-Pathway.pdf';

/* ─── Data ────────────────────────────────────────────────────── */

/* Official CIMA diagrams (white-background images, shown on a white section) */
const TSHAPE_IMG = '/images/t-shape-finance-model.jpeg';
const QUALIFICATION_IMG = '/images/CIMA_Professional_Qualification_RGB-830x1024.jpg.jpeg';

/* Key features of the CIMA FLP pathway */
const KEY_FEATURES = [
	{ icon: '📝', title: 'Only 3 Exams', desc: 'Complete the CIMA Professional Qualification with just three case-study exams.' },
	{ icon: '⏱️', title: 'Qualify in 12 Months', desc: 'A fast-track route to the CGMA designation for driven professionals.' },
	{ icon: '💰', title: 'Cost-Effective', desc: 'Significantly cheaper than the traditional CIMA route.' },
	{ icon: '🌍', title: 'Study Anytime, Anywhere', desc: 'Perfect for working professionals — learn at your own pace.' },
	{ icon: '💻', title: 'Digital-First Platform', desc: 'All content, assessments and resources are accessible online.' },
	{ icon: '🏆', title: 'Same CGMA Qualification', desc: 'Earn the exact same globally recognised CGMA designation.' },
];

/* What the all-inclusive 1-year subscription voucher covers */
const FEE_INCLUDES = [
	'CIMA Registration Fee',
	'CIMA Annual Subscription for the year',
	'CIMA Case Study exam fees (2 credits each exam)',
	'CIMA Registration re-activation fee (if applicable)',
	'Tuition Fee for all your Self-Assessment subjects',
	'Case Study Exam Tuition Fee (1 attempt for each case)',
];

/* CGMA FLP registration process */
const REGISTRATION_STEPS = [
	{ title: 'Share Your Academic Details', desc: 'Send us your prior academic details to clear exemptions / CIMA profile, if any.' },
	{ title: 'Confirm Your Eligibility', desc: 'Receive confirmation on your eligibility and entry point.' },
	{ title: 'Register & Pay First Installment', desc: 'Register through the Nanaska website and pay the first installment of GBP 500 to get class and LMS access.' },
	{ title: 'Start Your Studies', desc: 'Begin your studies with Nanaska right away.' },
	{ title: 'Complete the Balance Payment', desc: 'Settle the balance payment by the registration deadline.' },
	{ title: 'Registration Sent to CIMA UK', desc: 'Nanaska sends your registration request to CIMA UK.' },
	{ title: 'CIMA UK Onboards You', desc: 'CIMA UK communicates with you directly regarding FLP learning-platform registration.' },
];

const ENTRY_LEVEL_OPTIONS = ['Operational Level', 'Management Level', 'Strategic Level', 'Not sure yet'];

const WHY_POINTS = [
	{ icon: '/images/2025-07-certificate.png', title: 'Official Partner for CGMA FLP', desc: 'Recognized collaboration with CIMA to provide support for this specific pathway.', alt: 'Certificate icon' },
	{ icon: '/images/2025-07-world-map.png', title: 'World Class Case Study Program', desc: 'Meticulously crafted under Mr. Channa Gunawardena’s leadership.', alt: 'World map icon' },
	{ icon: '/images/2025-07-support.png', title: 'Exceptional Student Support System', desc: 'Guidance every step of the way until program completion.', alt: 'Support icon' },
	{ icon: '/images/2025-07-personalized.png', title: 'Personalized Attention & Proactive Monitoring', desc: 'Our dedicated team proactively tracks your progress, identifies learning gaps early, and provides timely guidance.', alt: 'Personalized icon' },
	{ icon: '/images/2025-07-medical-prescription.png', title: 'Proven Track Record', desc: 'Countless students have completed their full CGMA qualification in record time — within 10 to 12 months.', alt: 'Track record icon' },
	{ icon: '/images/2025-07-cup.png', title: 'Nurturing Prize Winners & High Achievers', desc: 'Delivering Global & Sri Lankan prize winners with first-attempt success, year after year.', alt: 'Trophy icon' },
];

const STATIC_LECTURERS = {
	operational: [
		{ name: 'Aloka Seneviratne', subject: 'Digital Finance', quals: 'DipM, B.Sc (Hons) Engineering Physics, CIMA Passed Finalist', img: '/images/2025-07-4.png' },
		{ name: 'Ali Raheem', subject: 'Management Accounting', quals: 'B.Sc (Hons) — University of Sri Jayewardenepura, CIMA Passed Finalist', img: '/images/2025-07-1.png' },
		{ name: 'Osmand Fernando', subject: 'Financial Reporting / OCS', quals: 'MBA (UK), ACMA, CGMA', img: '/images/2025-09-Untitled-design-1.png' },
		{ name: 'Mark Gunathilake', subject: 'Digital Finance', quals: 'B.Sc (Hons) — USJ, ACMA, CGMA', img: '/images/2025-07-2.png' },
	],
	management: [
		{ name: 'Aloka Seneviratne', subject: 'Managing Performance', quals: 'DipM, B.Sc (Hons) Engineering Physics, CIMA Passed Finalist', img: '/images/2025-07-4.png' },
		{ name: 'Lasantha Vidanagamage', subject: 'Advance Management Accounting', quals: 'MPAcc, BPharm — USJ, CIMA Passed Finalist', img: '/images/2025-07-3-2.png' },
		{ name: 'Shervin Perera', subject: 'Advance Financial Reporting / MCS', quals: 'ACMA, CGMA, MBA (UOS)', img: '/images/2025-07-2-3.png' },
		{ name: 'Channa Gunawardena', subject: 'MCS', quals: 'MBA, FCA, FCMA, B.Sc (First Class) — USJ', img: '/images/2025-07-Untitled-design.png' },
	],
	strategic: [
		{ name: 'Ruchira Perera', subject: 'Financial Strategy', quals: 'B.Sc (First Class) — USJ, MBA (PIM-USJ), ACMA, CPA, FCMA (SL)', img: '/images/2025-07-1-3.png' },
		{ name: 'Indika Rajakaruna', subject: 'Risk Management', quals: 'CISA (ISCA USA), AIB (IBSL), Executive MSc in Marketing', img: '/images/2025-07-Untitled-design-1-2.png' },
		{ name: 'Aloka Seneviratne', subject: 'Advance Financial Reporting', quals: 'DipM, B.Sc (Hons) Engineering Physics, CIMA Passed Finalist', img: '/images/2025-07-4.png' },
		{ name: 'Channa Gunawardena', subject: 'SCS', quals: 'MBA, FCA, FCMA, B.Sc (First Class) — USJ', img: '/images/2025-07-Untitled-design.png' },
	],
};

const FAST_TRACKERS = [
	{ name: 'Chenuka Pasindu', org: 'Cinec Campus', time: '10 Months', img: '/images/2025-07-1-5.png' },
	{ name: 'Pramodhya Loku Gamage', org: 'Account Assistant — PML Seafrigo UK', time: '6 Months', img: '/images/2025-07-8-1-300x300.png' },
	{ name: 'Vishwa Peiris', org: 'Senior Credit Solutions Manager — Scotiabank', time: '10 Months', img: '/images/2025-07-Untitled-design-2-300x300.png' },
	{ name: 'K. L. Upeshika', org: 'Assistant Manager Finance — InQube Global (Pvt) Ltd', time: '10 Months', img: '/images/2025-07-12-1-300x300.png' },
	{ name: 'Sanuda Minuraka Vidyaratna', org: 'Academic Associate / Lecturer — BMS Campus', time: '10 Months', img: '/images/2025-07-9-1-300x300.png' },
	{ name: 'Daminda Bandara', org: 'Finance Manager — OI Vietnam', time: '10 Months', img: '/images/2025-07-4-2-300x300.png' },
	{ name: 'Thisal Liyanage', org: 'Assistant Manager Finance — MAS Nayon Lanka', time: '10 Months', img: '/images/2025-07-11-1-300x300.png' },
	{ name: 'Dulan Sankalpa', org: 'Assistant Manager — First Capital Treasuries PLC', time: '10 Months', img: '/images/2025-07-6-1-300x300.png' },
	{ name: 'Thilini Thilakarathne', org: 'Senior Consultant — IFS R&D International (Pvt) Ltd', time: '10 Months', img: '/images/2025-07-10-1-300x300.png' },
	{ name: 'Aruna Premasooriya', org: 'Head of Finance — AMC Advertising & Marketing', time: '10 Months', img: '/images/2025-07-2-5-300x300.png' },
];

const BENEFITS = [
	{ icon: '🎯', label: 'Greater focus on leadership' },
	{ icon: '📅', label: 'One-time subscription' },
	{ icon: '🚀', label: 'Career Progression' },
	{ icon: '🌐', label: 'Global Recognition' },
	{ icon: '💰', label: 'Cost Savings' },
	{ icon: '🏆', label: 'Earn CGMA Designation' },
	{ icon: '📈', label: 'Streamline professional development' },
	{ icon: '💡', label: 'Developing demand skills' },
];

const ENTRY_POINTS = [
	{ level: 'Operational Level', req: "Bachelor's Degree in business, AAT, HND etc", icon: '🔵' },
	{ level: 'Management Level', req: "Bachelor's Degree in accounting and Finance, Post Graduate Diploma in Financial Management etc", icon: '🟣' },
	{ level: 'Strategic Level', req: 'ACCA, FCA Members etc', icon: '🔴' },
];

const PROGRAM_TABS = [
	{
		label: 'Operational Level',
		img: '/images/2023-08-Group-335-1.png',
		photo: '/images/2023-08-sdsd.png',
		photoAlt: 'Person at board representing Operational Level teaching',
	},
	{
		label: 'Management Level',
		img: '/images/2023-08-Group-336-1.png',
		photo: '/images/2023-08-Rectangle-194.png',
		photoAlt: 'Hands together representing Management Level teamwork',
	},
	{
		label: 'Strategic Level',
		img: '/images/2023-08-Group-337-2.png',
		photo: '/images/2023-08-sdsds.png',
		photoAlt: 'Person writing representing Strategic Level exam prep',
	},
];

/* ─── Component ───────────────────────────────────────────────── */

const EMPTY_FORM = { fullName: '', email: '', phone: '', whatsapp: '', qualification: '', entryLevel: '', message: '' };

export default function FinancialLeadershipPage() {
	const pageRef = useRef(null);
	const [lecturerTab, setLecturerTab] = useState('operational');
	const [programTab, setProgramTab] = useState(0);
	const [trackerIdx, setTrackerIdx] = useState(0);
	const [showStickyBar, setShowStickyBar] = useState(false);

	/* ── Lead-capture CTA form ── */
	const [form, setForm] = useState(EMPTY_FORM);
	const [formState, setFormState] = useState('idle'); // idle | submitting | success | error
	const [formError, setFormError] = useState('');
	const formStarted = useRef(false);

	const FORM_NAME = 'flp_lead';

	/* Show the sticky sign-up bar after the hero, hide it once the form is on screen. */
	useEffect(() => {
		const onScroll = () => {
			const y = window.scrollY;
			const register = document.getElementById('register');
			const formInView = register && register.getBoundingClientRect().top < window.innerHeight - 120;
			setShowStickyBar(y > 640 && !formInView);
		};
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	/* Smooth-scroll to the lead form and focus the first field. */
	const scrollToForm = (label) => {
		trackButtonClick(label, 'flp_sticky');
		const register = document.getElementById('register');
		if (register) register.scrollIntoView({ behavior: 'smooth', block: 'start' });
		setTimeout(() => {
			const el = document.getElementById('flp-fullname');
			if (el) el.focus({ preventScroll: true });
		}, 600);
	};

	const handleFieldFocus = () => {
		if (!formStarted.current) {
			formStarted.current = true;
			trackFormStart(FORM_NAME);
		}
	};

	const handleFieldChange = (e) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	/* Track any CTA click (GA4 + Clarity) and pass the label + section context. */
	const trackCTA = (label, category = 'flp_cta') => trackButtonClick(label, category);

	const trackBrochure = (location) => trackEvent('brochure_download', { form_name: FORM_NAME, location });

	const handleFormSubmit = async (e) => {
		e.preventDefault();
		if (formState === 'submitting') return;

		if (!form.fullName.trim()) {
			setFormError('Please enter your full name.');
			trackFormError(FORM_NAME, 'fullName');
			return;
		}
		if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
			setFormError('Please enter a valid email address.');
			trackFormError(FORM_NAME, 'email');
			return;
		}
		if (!form.phone.trim()) {
			setFormError('Please enter your phone number.');
			trackFormError(FORM_NAME, 'phone');
			return;
		}

		setFormError('');
		setFormState('submitting');
		try {
			const res = await fetch(`${API_URL}/flp-leads`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ...form, source: 'flp-page' }),
			});
			if (!res.ok) throw new Error('Request failed');
			setFormState('success');
			// GA4: standard lead events + Clarity upgrade
			trackFormSubmit(FORM_NAME, { entry_level: form.entryLevel || 'unspecified' });
			trackEvent('generate_lead', { form_name: FORM_NAME, currency: 'GBP', value: 2000 });
			setForm(EMPTY_FORM);
		} catch {
			setFormState('error');
			setFormError('Something went wrong. Please try again or contact us on WhatsApp.');
			trackEvent('form_submit_failed', { form_name: FORM_NAME });
		}
	};

	useSEO({
		title: 'Financial Leadership Program - Nanaska',
		description:
			'Qualify CIMA in 12 months with only 3 exams through the CGMA Finance Leadership Program at Nanaska — Sri Lanka\'s official CGMA FLP partner. Expert lecturers, prize winners, personalised support.',
		keywords: 'CGMA FLP, Finance Leadership Program, CIMA Sri Lanka, CIMA qualification, Nanaska, ACMA, CGMA designation',
		ogImage: '/images/2023-10-Nanaska_FLP_Spetember-23-Introductory-Post-Web-Slider-1920x1080-1.png',
		canonical: 'https://www.nanaska.com/financial-leadership-program/',
	});

	useScrollReveal(pageRef);

	const { data: apiLecturers } = useApi('/lecturers?active=true');
	const LECTURERS = !apiLecturers?.length
		? STATIC_LECTURERS
		: (() => {
			const byName = {};
			apiLecturers.forEach((l) => { byName[l.name.toLowerCase()] = l; });
			const merge = (entry) => {
				const key = entry.name.toLowerCase();
				const dbL =
					byName[key] ||
					Object.values(byName).find((l) =>
						key.includes(l.name.split(' ')[0].toLowerCase()),
					);
				if (!dbL) return entry;
				return { ...entry, quals: (dbL.credentials || []).join(', ') || entry.quals };
			};
			return {
				operational: STATIC_LECTURERS.operational.map(merge),
				management: STATIC_LECTURERS.management.map(merge),
				strategic: STATIC_LECTURERS.strategic.map(merge),
			};
		})()

	const prevTracker = () => setTrackerIdx((i) => (i - 1 + FAST_TRACKERS.length) % FAST_TRACKERS.length);
	const nextTracker = () => setTrackerIdx((i) => (i + 1) % FAST_TRACKERS.length);

	return (
		<div className="flp-page" ref={pageRef}>
			<FunnelHeader
				ctaText="Register Now"
				ctaHref="#register"
				onCtaClick={() => trackCTA('header_register_now', 'flp_nav')}
			/>

			{/* ── Hero ── */}
			<section className="flp-hero">
				<div className="flp-hero__overlay" />
				<div className="flp-hero__content" data-reveal>
					<span className="flp-hero__eyebrow">CGMA Finance Leadership Program</span>
					<h1 className="flp-hero__title">
						Qualify CIMA in<br />
						<span className="flp-hero__highlight">12 Months</span> · Only{' '}
						<span className="flp-hero__highlight">3 Exams</span>
					</h1>
					<p className="flp-hero__sub">
						Sri Lanka&apos;s Official CGMA FLP Partner — a self-paced digital pathway
						to the prestigious ACMA/CGMA designation.
					</p>
					<div className="flp-hero__actions">
						<a href="#register" className="flp-btn flp-btn--primary" onClick={() => trackCTA('hero_get_in_touch')}>Get In Touch</a>
						<a
							href={BROCHURE_URL}
							className="flp-btn flp-btn--outline"
							target="_blank"
							rel="noopener noreferrer"
							onClick={() => trackBrochure('hero')}
						>
							Download Brochure
						</a>
					</div>
				</div>
				<div className="flp-hero__wave">
					<svg viewBox="0 0 1440 80" preserveAspectRatio="none">
						<path fill="#f5f8fc" d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" />
					</svg>
				</div>
			</section>

			{/* ── Why Choose Nanaska ── */}
			<section className="flp-why" id="why">
				<div className="flp-container">
					<h2 className="flp-section-title" data-reveal>Why Choose Nanaska?</h2>
					<p className="flp-section-sub flp-why__intro" data-reveal>
						We are a global leader in CIMA and CGMA FLP tuition, known for producing prize winners and
						top results both locally and internationally. With expert lecturers — including Mr. Channa
						Gunawardena, a world-class CIMA case study specialist, as the Lead Lecturer — and 24/7
						support, we help students and professionals fast-track their qualification in under 12 months.
					</p>
					<div className="flp-why__track-wrap">
						<div className="flp-why__track">
							{[...WHY_POINTS, ...WHY_POINTS].map((p, i) => (
								<div key={i} className="flp-why__card">
									<img src={p.icon} alt={p.alt} className="flp-why__icon" />
									<p className="flp-why__label">{p.title}</p>
									<p className="flp-why__desc">{p.desc}</p>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* ── Lecturer Panel ── */}
			<section className="flp-lecturers" id="lecturers">
				<div className="flp-container">
					<h2 className="flp-section-title" data-reveal>FLP Lecturer Panel</h2>
					<div className="flp-level-tabs" data-reveal>
						{Object.keys(LECTURERS).map((key) => (
							<button
								key={key}
								className={`flp-tab-btn ${lecturerTab === key ? 'flp-tab-btn--active' : ''}`}
								onClick={() => setLecturerTab(key)}
							>
								{key.charAt(0).toUpperCase() + key.slice(1)} Level
							</button>
						))}
					</div>
					<div className="flp-lecturers__grid">
						{LECTURERS[lecturerTab].map((l) => (
							<div key={l.name + l.subject} className="flp-lecturer-card" data-reveal>
								<div className="flp-lecturer-card__img-wrap">
									<img src={l.img} alt={l.name} loading="lazy" />
								</div>
								<div className="flp-lecturer-card__body">
									<span className="flp-lecturer-card__subject">{l.subject}</span>
									<h3 className="flp-lecturer-card__name">{l.name}</h3>
									<p className="flp-lecturer-card__quals">{l.quals}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ── What is CGMA FLP ── */}
			<section className="flp-about" id="about">
				<div className="flp-container flp-about__inner">
					<div className="flp-about__text" data-reveal>
						<h2 className="flp-section-title flp-section-title--left">What is CGMA FLP?</h2>
						<p>
							The CGMA (Chartered Global Management Accounting) Finance Leadership Program (FLP) is an
							innovative, self-directed, and self-paced digital learning and assessment pathway designed
							for ambitious finance professionals. This program allows learners to complete the CIMA course
							and achieve the prestigious CGMA designation in just <strong>12 months</strong> with only{' '}
							<strong>3 exams</strong>, utilising real-life case simulations.
						</p>
						<p>
							The FLP offers a guided learning route where all instruction, practice, and exam preparation
							occurs on a cutting-edge digital platform. By following the CGMA Finance Leadership Program,
							participants gain practical skills and strategic insights that prepare them for senior finance
							leadership roles while accelerating their CIMA career progression.
						</p>
						<a
							href={BROCHURE_URL}
							className="flp-btn flp-btn--primary"
							target="_blank"
							rel="noopener noreferrer"
							style={{ marginTop: '1.5rem', display: 'inline-block' }}
							onClick={() => trackBrochure('about')}
						>
							Download Brochure
						</a>
					</div>
					<div className="flp-about__img" data-reveal>
						<img
							src="/images/2025-07-Brochure-Cover-scaled.webp"
							alt="Nanaska FLP Brochure Cover"
							loading="lazy"
						/>
					</div>
				</div>
			</section>

			{/* ── Key Features ── */}
			<section className="flp-features" id="features">
				<div className="flp-container">
					<h2 className="flp-section-title" data-reveal>Key Features of the CIMA FLP Pathway</h2>
					<p className="flp-section-sub" data-reveal>A guided digital learning route built for ambitious, working professionals</p>
					<div className="flp-features__grid">
						{KEY_FEATURES.map((f) => (
							<div key={f.title} className="flp-feature-card" data-reveal>
								<span className="flp-feature-card__icon">{f.icon}</span>
								<h3>{f.title}</h3>
								<p>{f.desc}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ── The T-Shaped Finance Professional ── */}
			<section className="flp-tshape" id="tshape">
				<div className="flp-container">
					<h2 className="flp-section-title" data-reveal>The T-Shaped Finance Professional</h2>
					<p className="flp-section-sub flp-tshape__lead" data-reveal>
						The CIMA T-shaped Professional model develops finance professionals with both deep technical
						expertise and broad business skills. It combines strong knowledge in finance, digital
						capabilities, and ethics with essential skills such as strategic thinking, leadership,
						communication, innovation, and resilience. This prepares students to become well-rounded
						professionals who can create value and lead with confidence in today&apos;s business world.
					</p>
					<div className="flp-tshape__figure" data-reveal>
						<img
							src={TSHAPE_IMG}
							alt="The CIMA T-shaped finance professional model — wide boundary-crossing skills combined with deep technical knowledge, AI & digital skills, and trust & ethics"
							loading="lazy"
						/>
					</div>
				</div>
			</section>

			{/* ── Course Structure (CIMA Professional Qualification) ── */}
			<section className="flp-syllabus" id="course-structure">
				<div className="flp-container">
					<h2 className="flp-section-title" data-reveal>Course Structure</h2>
					<p className="flp-section-sub" data-reveal>
						The CIMA Professional Qualification — from Certificate Level to the CGMA designation
					</p>
					<div className="flp-syllabus__figure" data-reveal>
						<img
							src={QUALIFICATION_IMG}
							alt="CIMA Professional Qualification structure — Certificate, Operational, Management and Strategic levels with case study exams, leading to CGMA membership"
							loading="lazy"
						/>
					</div>
				</div>
			</section>

			{/* ── Fast Track Finishers ── */}
			<section className="flp-finishers" id="finishers">
				<div className="flp-container">
					<h2 className="flp-section-title flp-section-title--white" data-reveal>
						Our FLP Fast Track Finishers
					</h2>
					<p className="flp-section-sub flp-section-sub--white" data-reveal>Passed in Under 12 Months</p>
					<div className="flp-carousel" data-reveal>
						<button className="flp-carousel__arrow flp-carousel__arrow--prev" onClick={prevTracker} aria-label="Previous">‹</button>
						<div className="flp-carousel__track">
							{[
								FAST_TRACKERS[(trackerIdx - 1 + FAST_TRACKERS.length) % FAST_TRACKERS.length],
								FAST_TRACKERS[trackerIdx],
								FAST_TRACKERS[(trackerIdx + 1) % FAST_TRACKERS.length],
							].map((t, i) => (
								<div key={i} className={`flp-finisher-card ${i === 1 ? 'flp-finisher-card--active' : ''}`}>
									<img src={t.img} alt={t.name} loading="lazy" />
									<div className="flp-finisher-card__body">
										<span className="flp-finisher-card__time">✓ Qualified in {t.time}</span>
										<h4>{t.name}</h4>
										<p>{t.org}</p>
									</div>
								</div>
							))}
						</div>
						<button className="flp-carousel__arrow flp-carousel__arrow--next" onClick={nextTracker} aria-label="Next">›</button>
					</div>
					<div className="flp-carousel__dots">
						{FAST_TRACKERS.map((_, i) => (
							<button
								key={i}
								className={`flp-dot ${i === trackerIdx ? 'flp-dot--active' : ''}`}
								onClick={() => setTrackerIdx(i)}
								aria-label={`Go to finisher ${i + 1}`}
							/>
						))}
					</div>
				</div>
			</section>

			{/* ── Intake CTA ── */}
			<section className="flp-intake" id="intake">
				<div className="flp-container">
					<div className="flp-intake__box" data-reveal>
						<div className="flp-intake__badge">AUG 2025 Intake</div>
						<h2>Only 3 Exams! Qualify CIMA in 12 Months</h2>
						<p>
							Seats are filling fast for the August 2025 cohort. Secure your place today and begin your
							journey to the CGMA designation.
						</p>
						<a href="#register" className="flp-btn flp-btn--primary" onClick={() => trackCTA('intake_register_now')}>Register Now</a>
					</div>
				</div>
			</section>

			{/* ── Program Structure ── */}
			<section className="flp-structure" id="structure">
				<div className="flp-container">
					<h2 className="flp-section-title" data-reveal>CGMA FLP Program Structure</h2>
					<div className="flp-level-tabs" data-reveal>
						{PROGRAM_TABS.map((t, i) => (
							<button
								key={i}
								className={`flp-tab-btn ${programTab === i ? 'flp-tab-btn--active' : ''}`}
								onClick={() => setProgramTab(i)}
							>
								{t.label}
							</button>
						))}
					</div>
					<div className="flp-structure__panel" data-reveal>
						<img src={PROGRAM_TABS[programTab].photo} alt={PROGRAM_TABS[programTab].photoAlt} className="flp-structure__photo" loading="lazy" />
						<img src={PROGRAM_TABS[programTab].img} alt={`${PROGRAM_TABS[programTab].label} diagram`} className="flp-structure__diagram" loading="lazy" />
					</div>
				</div>
			</section>

			{/* ── Eligibility ── */}
			<section className="flp-eligibility" id="eligibility">
				<div className="flp-container">
					<h2 className="flp-section-title" data-reveal>Who is Eligible?</h2>
					<div className="flp-eligibility__grid">
						{[
							{ icon: '🎓', title: 'Education', desc: "Accounting and finance degrees often qualify for entry at the Management Level; business degrees often qualify at the Operational Level." },
							{ icon: '📜', title: 'Professional Qualification', desc: "Professionally qualified candidates holding MBA, HND, AAT, ACCA, CA, etc. may gain entry or exemptions." },
							{ icon: '💼', title: 'Work Experience', desc: "Direct, relevant experience in true accounting or finance roles may also provide exemptions." },
						].map((e) => (
							<div key={e.title} className="flp-elig-card" data-reveal>
								<span className="flp-elig-card__icon">{e.icon}</span>
								<h3>{e.title}</h3>
								<p>{e.desc}</p>
							</div>
						))}
					</div>
					<div className="flp-eligibility__imgs" data-reveal>
						<img src="/images/2023-08-Group-254.png" alt="Strategic Level qualification diagram" loading="lazy" />
						<img src="/images/2023-08-Group-255-1.png" alt="Operational Level qualification diagram" loading="lazy" />
						<img src="/images/2023-08-Group-255.png" alt="Management Level qualification diagram" loading="lazy" />
					</div>
				</div>
			</section>

			{/* ── Entry Points ── */}
			<section className="flp-entry" id="entry">
				<div className="flp-container">
					<h2 className="flp-section-title flp-section-title--white" data-reveal>
						Program Entry Points
					</h2>
					<p className="flp-section-sub flp-section-sub--white" data-reveal>
						Based on Educational &amp; Professional Qualifications
					</p>
					<div className="flp-entry__grid">
						{ENTRY_POINTS.map((e) => (
							<div key={e.level} className="flp-entry-card" data-reveal>
								<span className="flp-entry-card__icon">{e.icon}</span>
								<h3>{e.level}</h3>
								<p>{e.req}</p>
							</div>
						))}
					</div>
					<div className="flp-entry__note" data-reveal>
						<h3>FLP Entry Route</h3>
						<p>
							The program is accessible to anyone interested in advancing their finance career. Learners
							who already hold academic or professional qualifications, or have relevant professional
							experience, may be eligible for exemptions from certain elements of the program. Exemptions
							and entry points are determined during registration based on each candidate&apos;s background,
							ensuring a tailored learning pathway that maximises efficiency in completing the CIMA course
							and earning the CGMA designation.
						</p>
						<a href="#register" className="flp-btn flp-btn--outline-light" onClick={() => trackCTA('entry_check_exemptions')}>Check Your Exemptions</a>
					</div>
				</div>
			</section>

			{/* ── Cost Savings ── */}
			<section className="flp-cost" id="cost">
				<div className="flp-container">
					<div className="flp-cost__inner" data-reveal>
						<div className="flp-cost__left">
							<img
								src="/images/2023-07-Rectangle-47-2.png"
								alt="Students learning at Nanaska"
								loading="lazy"
							/>
						</div>
						<div className="flp-cost__right">
							<div className="flp-cost__tag">FLP Fast Track</div>
							<div className="flp-cost__price">GBP 2,000</div>
							<div className="flp-cost__saving">
								Saving up to <strong>LKR 550,000</strong>
							</div>
							<p>
								With CGMA FLP as opposed to the traditional pathway — fewer exams, less time,
								and significantly reduced cost.
							</p>
							<a href="#register" className="flp-btn flp-btn--primary" onClick={() => trackCTA('cost_know_more')}>Know More</a>
						</div>
					</div>
				</div>
			</section>

			{/* ── Payment Plan ── */}
			<section className="flp-payment" id="payment">
				<div className="flp-container">
					<h2 className="flp-section-title" data-reveal>FLP Payment Plan</h2>
					<p className="flp-section-sub" data-reveal>FLP 1-Year License: GBP 2,000</p>
					<div className="flp-payment__grid">
						{[
							{ num: '1st', label: 'LKR equivalent to GBP 500', desc: 'To get registered with Nanaska' },
							{ num: '2nd', label: 'LKR equivalent to GBP 1,200', desc: 'To apply the FLP License from CIMA' },
							{ num: '3rd', label: 'LKR equivalent to GBP 300', desc: 'To complete the payment' },
						].map((p) => (
							<div key={p.num} className="flp-payment-card" data-reveal>
								<div className="flp-payment-card__num">{p.num}</div>
								<div className="flp-payment-card__label">{p.label}</div>
								<p>{p.desc}</p>
								<a href="#register" className="flp-btn flp-btn--primary flp-btn--sm" onClick={() => trackCTA(`payment_plan_${p.num}_register`)}>Register Now</a>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ── What the Fee Includes ── */}
			<section className="flp-fee" id="fee">
				<div className="flp-container flp-fee__inner">
					<div className="flp-fee__text" data-reveal>
						<h2 className="flp-section-title flp-section-title--left">An All-Inclusive Subscription</h2>
						<p>
							The CGMA FLP is a subscription-based route — students acquire an annual subscription.
							The <strong>1-year subscription voucher</strong> is an all-inclusive package that covers:
						</p>
						<ul className="flp-fee__list">
							{FEE_INCLUDES.map((item) => (
								<li key={item}><span className="flp-fee__check">✓</span>{item}</li>
							))}
						</ul>
						<p className="flp-fee__note">
							<strong>Undergraduate students:</strong> the FLP Undergraduate Programme lets you complete
							the CGMA–FLP in parallel with your university studies on a discounted arrangement.
							Reach out to our team for more information.
						</p>
						<a href="#register" className="flp-btn flp-btn--primary" onClick={() => trackCTA('fee_talk_to_us')}>Talk to Our Team</a>
					</div>
					<div className="flp-fee__badge-card" data-reveal>
						<span className="flp-fee__badge-tag">FLP 1-Year License</span>
						<div className="flp-fee__badge-price">GBP 2,000</div>
						<p>All-inclusive · Registration + Subscription + Exam &amp; Tuition fees</p>
					</div>
				</div>
			</section>

			{/* ── Benefits ── */}
			<section className="flp-benefits" id="benefits">
				<div className="flp-container">
					<h2 className="flp-section-title flp-section-title--white" data-reveal>Benefits of CGMA FLP</h2>
					<p className="flp-section-sub flp-section-sub--white" data-reveal>
						Nanaska&apos;s FLP provides comprehensive resources and personalised support to ensure success
					</p>
					<div className="flp-benefits__grid">
						{BENEFITS.map((b) => (
							<div key={b.label} className="flp-benefit-card" data-reveal>
								<span className="flp-benefit-card__icon">{b.icon}</span>
								<p>{b.label}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ── Registration Process ── */}
			<section className="flp-process" id="process">
				<div className="flp-container">
					<h2 className="flp-section-title" data-reveal>CGMA FLP Registration Process</h2>
					<p className="flp-section-sub" data-reveal>Seven simple steps from enquiry to CIMA UK onboarding</p>
					<div className="flp-process__steps">
						{REGISTRATION_STEPS.map((s, i) => (
							<div key={s.title} className="flp-process-step" data-reveal>
								<div className="flp-process-step__num">{i + 1}</div>
								<div className="flp-process-step__body">
									<h3>{s.title}</h3>
									<p>{s.desc}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ── Register / Lead-capture form ── */}
			<section className="flp-register" id="register">
				<div className="flp-container">
					<div className="flp-register__inner" data-reveal>
						<div className="flp-register__intro">
							<h2>Ready to Fast-Track Your CIMA Journey?</h2>
							<p>
								Share your details and our team will contact you to clear exemptions, confirm your
								entry point, and walk you through the payment options — no obligation.
							</p>
							<ul className="flp-register__ticks">
								<li>✓ Free exemption &amp; eligibility check</li>
								<li>✓ Guidance from CGMA FLP specialists</li>
								<li>✓ Flexible 3-installment payment plan</li>
							</ul>
							<div className="flp-register__alt">
								<Link to="/enrollment" className="flp-btn flp-btn--outline-light" onClick={() => trackCTA('register_start_enrollment', 'flp_secondary')}>
									Start Full Registration →
								</Link>
								<a
									href="https://wa.me/94777123456"
									className="flp-btn flp-btn--whatsapp"
									target="_blank"
									rel="noopener noreferrer"
									onClick={() => trackCTA('register_whatsapp', 'flp_secondary')}
								>
									💬 WhatsApp Us
								</a>
							</div>
						</div>

						{formState === 'success' ? (
							<div className="flp-form flp-form--success" data-reveal>
								<div className="flp-form__success-icon">🎉</div>
								<h3>Thank you!</h3>
								<p>Your enquiry has been received. Our team will reach out to you shortly to guide you through the CGMA FLP pathway.</p>
								<a
									href={BROCHURE_URL}
									className="flp-btn flp-btn--primary"
									target="_blank"
									rel="noopener noreferrer"
									onClick={() => trackBrochure('form_success')}
								>
									Download the Brochure
								</a>
							</div>
						) : (
							<form className="flp-form" data-reveal onSubmit={handleFormSubmit} noValidate>
								<h3 className="flp-form__title">Request a Callback</h3>
								<div className="flp-form__row">
									<label className="flp-form__field">
										<span>Full Name *</span>
										<input id="flp-fullname" type="text" name="fullName" value={form.fullName} onChange={handleFieldChange} onFocus={handleFieldFocus} placeholder="Your full name" autoComplete="name" required />
									</label>
									<label className="flp-form__field">
										<span>Email *</span>
										<input type="email" name="email" value={form.email} onChange={handleFieldChange} onFocus={handleFieldFocus} placeholder="you@example.com" autoComplete="email" required />
									</label>
								</div>
								<div className="flp-form__row">
									<label className="flp-form__field">
										<span>Phone *</span>
										<input type="tel" name="phone" value={form.phone} onChange={handleFieldChange} onFocus={handleFieldFocus} placeholder="+94 7X XXX XXXX" autoComplete="tel" required />
									</label>
									<label className="flp-form__field">
										<span>WhatsApp</span>
										<input type="tel" name="whatsapp" value={form.whatsapp} onChange={handleFieldChange} onFocus={handleFieldFocus} placeholder="If different from phone" />
									</label>
								</div>
								<div className="flp-form__row">
									<label className="flp-form__field">
										<span>Current / Prior Qualification</span>
										<input type="text" name="qualification" value={form.qualification} onChange={handleFieldChange} onFocus={handleFieldFocus} placeholder="e.g. BSc Accounting, AAT, ACCA…" />
									</label>
									<label className="flp-form__field">
										<span>Interested Entry Level</span>
										<select name="entryLevel" value={form.entryLevel} onChange={handleFieldChange} onFocus={handleFieldFocus}>
											<option value="">Select a level…</option>
											{ENTRY_LEVEL_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
										</select>
									</label>
								</div>
								<label className="flp-form__field">
									<span>Message</span>
									<textarea name="message" value={form.message} onChange={handleFieldChange} onFocus={handleFieldFocus} rows={3} placeholder="Anything you'd like us to know?" />
								</label>

								{formError && <p className="flp-form__error">{formError}</p>}

								<button
									type="submit"
									className="flp-btn flp-btn--primary flp-btn--lg flp-form__submit"
									disabled={formState === 'submitting'}
								>
									{formState === 'submitting' ? 'Sending…' : 'Get In Touch'}
								</button>
								<p className="flp-form__privacy">
									By submitting, you agree to be contacted by Nanaska. We respect your privacy.
								</p>
							</form>
						)}
					</div>
				</div>
			</section>

			{/* ── Funnel Footer ── */}
			<footer className="flp-footer">
				<p>© {new Date().getFullYear()} Nanaska (Pvt) Ltd. All rights reserved.</p>
				<p>
					<a href="https://www.nanaska.com/privacy-policy/" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
					{' · '}
					<a href="https://www.nanaska.com/terms-and-conditions/" target="_blank" rel="noopener noreferrer">Terms &amp; Conditions</a>
				</p>
			</footer>

			{/* ── Sticky sign-up bar (follows scroll) ── */}
			<div className={`flp-sticky-cta ${showStickyBar ? 'flp-sticky-cta--show' : ''}`} role="complementary" aria-hidden={!showStickyBar}>
				<div className="flp-sticky-cta__text">
					<span className="flp-sticky-cta__pulse" aria-hidden="true" />
					<span className="flp-sticky-cta__title">Qualify CIMA in 12 months — only 3 exams</span>
					<span className="flp-sticky-cta__sub">Free exemption &amp; eligibility check</span>
				</div>
				<button type="button" className="flp-btn flp-btn--primary flp-sticky-cta__btn" onClick={() => scrollToForm('sticky_register')}>
					Register Now →
				</button>
			</div>
		</div>
	);
}
