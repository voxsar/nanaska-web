import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import FunnelHeader from '../components/FunnelHeader';
import { useSEO } from '../hooks/useSEO';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useApi } from '../hooks/useApi';
import './CertificateLevelIntakePage.css';

/* ─── Data ────────────────────────────────────────────────────── */

const FEATURES = [
	{ icon: '👨‍🏫', label: 'Specialist Lecturers' },
	{ icon: '📅', label: '4 Months Live Sessions' },
	{ icon: '🎯', label: 'Individual Attention' },
	{ icon: '🔄', label: 'Revisions' },
	{ icon: '📝', label: '5 Mock Exams' },
	{ icon: '💻', label: 'Learning Management System (LMS)' },
	{ icon: '💬', label: 'Subject-wise WhatsApp Groups' },
	{ icon: '📚', label: 'Sessions with Case Study Specialists' },
];

const SUBJECTS = [
	{
		code: 'BA1',
		title: 'Fundamentals of Business Economics',
		desc: 'Covers the economic environment, microeconomics (supply & demand, market structures), macroeconomics, international trade, and how global economic forces affect business strategy.',
		icon: '📊',
	},
	{
		code: 'BA2',
		title: 'Fundamentals of Management Accounting',
		desc: 'Introduces cost classification, cost behaviour, absorption and marginal costing, budgeting, standard costing and variance analysis — the foundation for all CIMA management accounting.',
		icon: '📈',
	},
	{
		code: 'BA3',
		title: 'Fundamentals of Financial Accounting',
		desc: 'Covers the preparation of financial statements, including the income statement, statement of financial position and cash flow statement, as well as fundamental accounting principles.',
		icon: '📑',
	},
	{
		code: 'BA4',
		title: 'Fundamentals of Ethics, Corporate Governance and Business Law',
		desc: 'Covers professional standards, ethics, corporate governance, corporate social responsibility, audit, and the legal framework underpinning commercial activity, including contract law, employment law, and corporate administration.',
		icon: '⚖️',
	},
];

const STATIC_LECTURERS = [
	{
		name: 'Channa Gunawardana',
		code: 'Lead',
		quals: 'MBA, FCA, FCMA, BSC FIRST CLASS',
		img: 'https://www.nanaska.com/wp-content/uploads/2021/04/Channa.png',
		bio: 'Founder and lead lecturer at Nanaska, Member of CIMA Global Council, and renowned CIMA Case Study Specialist.',
	},
	{
		name: 'Ovin Bimsara',
		code: 'BA1',
		quals: 'MBA (Reading), BBA, ACMA CGMA, ACIM',
		img: null,
		bio: null,
	},
	{
		name: 'Amar Ramly',
		code: 'BA2',
		quals: 'BSc Economics and Management UOL (First Class), CIMA Exams Complete',
		img: null,
		bio: null,
	},
	{
		name: 'Ali Raheem',
		code: 'BA2 & BA3',
		quals: 'BSC (Hons) USJ, CIMA EXAMS COMPLETE',
		img: 'https://www.nanaska.com/wp-content/uploads/2024/06/Ali_Raheem-removebg-preview.png',
		bio: null,
	},
	{
		name: 'Farzana Jefferey',
		code: 'BA4',
		quals: 'Attorney-at-Law, CIMA Exams Complete',
		img: null,
		bio: null,
	},
	{
		name: 'Sanuda Minuraka',
		code: 'BA1',
		quals: 'BSc (Hons) Accounting & Finance First Class (UOP UK), CIMA Passed Finalist',
		img: 'https://www.nanaska.com/wp-content/uploads/2025/01/IMG_0606.jpg',
		bio: null,
	},
	{
		name: 'Shervin Perera',
		code: 'BA3',
		quals: 'ACMA(UK) CGMA, MBA(UOS)',
		img: 'https://www.nanaska.com/wp-content/uploads/2024/06/Shervin_Perera-removebg-preview.png',
		bio: null,
	},
	{
		name: 'Janith Jayasinghe',
		code: 'BA4',
		quals: 'LLB (Hons), Attorney-at-Law, Notary Public, Professional Qualification in HRM (CIPM)',
		img: 'https://www.nanaska.com/wp-content/uploads/2024/06/Mr.Janith-Jayasinghe-1.jpg',
		bio: null,
	},
];

const STATS = [
	{ value: '87%', label: 'of employers would pay a premium to have CGMA work for them' },
	{ value: '100%', label: "of Interbrand's Best Global Brands represented by CIMA students and CGMAs" },
	{ value: '96%', label: 'of FTSE Top 100 Companies employ CIMA students and CGMAs' },
];

/* ─── Component ───────────────────────────────────────────────── */

export default function CertificateLevelIntakePage() {
	const pageRef = useRef(null);
	const [activeSubject, setActiveSubject] = useState(0);

	useSEO({
		title: 'CIMA Certificate Level Intake — JAN 2026 — Nanaska',
		description:
			'Join Nanaska\'s JAN 2026 CIMA Certificate in Business Accounting intake. Specialist lecturers, live sessions, individual attention, 5 mock exams, LMS access. Early bird discount available. Sri Lanka\'s leading CIMA provider.',
		keywords: 'CIMA Certificate Level, Cert BA, Nanaska, CIMA Sri Lanka, JAN 2026 intake, early bird, BA1 BA2 BA3 BA4',
		ogImage: 'https://www.nanaska.com/wp-content/uploads/2021/04/Channa.png',
		canonical: 'https://www.nanaska.com/certificate-level-intake/',
	});

	useScrollReveal(pageRef);

	const { data: apiLecturers } = useApi('/lecturers?active=true');
	const extractCode = (title) => {
		const parts = title.split('–').map((s) => s.trim());
		if (parts.length > 1) return parts[1].split(' ')[0];
		if (title.includes('CEO') || title.includes('Lead')) return 'Lead';
		return 'Lecturer';
	};
	const LECTURERS = apiLecturers?.length
		? apiLecturers.map((l) => ({
			name: l.name,
			code: extractCode(l.title),
			quals: (l.credentials || []).join(', '),
			img: l.imageUrl || null,
			bio: l.bio || null,
		}))
		: STATIC_LECTURERS;

	return (
		<div className="cl-page" ref={pageRef}>
			<FunnelHeader ctaText="Register Now" ctaHref="#register" />

			{/* ── Hero / Intake Announcement ── */}
			<section className="cl-hero">
				<div className="cl-hero__overlay" />
				<div className="cl-hero__inner" data-reveal>
					<div className="cl-hero__badge">JAN 2026 Intake — Now Open</div>
					<h1 className="cl-hero__title">
						CIMA Certificate in<br />
						<span className="cl-hero__hl">Business Accounting</span>
					</h1>
					<p className="cl-hero__sub">
						Nanaska is the leading provider of CIMA in Sri Lanka, offering a <strong>100% online</strong>{' '}
						course so students can learn at their own convenience. With scholarships and concessions
						available, our students receive high-quality education with all facilities par excellence.
					</p>
					<div className="cl-hero__actions">
						<a href="#register" className="cl-btn cl-btn--primary cl-btn--lg">Register Now</a>
						<a href="#subjects" className="cl-btn cl-btn--outline">Explore Subjects</a>
					</div>
				</div>
				<div className="cl-hero__wave">
					<svg viewBox="0 0 1440 80" preserveAspectRatio="none">
						<path fill="#f5f8fc" d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" />
					</svg>
				</div>
			</section>

			{/* ── Features Grid ── */}
			<section className="cl-features">
				<div className="cl-container">
					<h2 className="cl-section-title" data-reveal>What's Included</h2>
					<p className="cl-section-sub" data-reveal>Everything you need to succeed in CIMA Certificate Level</p>
					<div className="cl-features__grid">
						{FEATURES.map((f) => (
							<div key={f.label} className="cl-feature-card" data-reveal>
								<span className="cl-feature-card__icon">{f.icon}</span>
								<p>{f.label}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ── About Cert BA ── */}
			<section className="cl-about">
				<div className="cl-container">
					<div className="cl-about__inner" data-reveal>
						<div className="cl-about__text">
							<span className="cl-about__eyebrow">JAN 2026 Intake</span>
							<h2 className="cl-section-title cl-section-title--left">
								The CIMA Certificate in Business Accounting
							</h2>
							<p>
								The CIMA Certificate in Business Accounting (Cert BA) is the <strong>entry route</strong>{' '}
								into the CIMA Professional Qualification. This level will help students with little or no
								accounting experience unleash their true business potential.
							</p>
							<p>
								Teaching core business and finance skills beyond simple financial accounting, the Cert BA
								syllabus is the perfect stepping stone towards a career in business and finance.
							</p>
							<a href="#register" className="cl-btn cl-btn--primary" style={{ marginTop: '1.25rem', display: 'inline-block' }}>
								Register Now
							</a>
						</div>
						<div className="cl-about__img">
							<img
								src="https://www.nanaska.com/wp-content/uploads/2021/04/Channa.png"
								alt="Channa Gunawardana, CEO and lead lecturer at Nanaska"
								loading="lazy"
							/>
						</div>
					</div>
				</div>
			</section>

			{/* ── Did You Know? Stats ── */}
			<section className="cl-stats">
				<div className="cl-container">
					<h2 className="cl-section-title cl-section-title--white" data-reveal>Did You Know?</h2>
					<div className="cl-stats__grid">
						{STATS.map((s) => (
							<div key={s.value} className="cl-stat-card" data-reveal>
								<div className="cl-stat-card__value">{s.value}</div>
								<p>{s.label}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ── Early Bird Offer ── */}
			<section className="cl-offer" id="offer">
				<div className="cl-container">
					<div className="cl-offer__box" data-reveal>
						<div className="cl-offer__badge">🎉 Early Bird Offer</div>
						<h2>Grab Your Early Bird Discount!</h2>
						<p>
							Register for the CIMA Certificate Level with Nanaska and obtain an early bird discount of{' '}
							<strong>10%</strong>. All 2024 Ordinary Level students are eligible to claim a special
							discount* on their course fees!
						</p>
						<p className="cl-offer__terms">*Terms &amp; Conditions applied</p>
						<a href="#register" className="cl-btn cl-btn--primary cl-btn--lg">Register Now</a>
					</div>
				</div>
			</section>

			{/* ── Subject Explorer ── */}
			<section className="cl-subjects" id="subjects">
				<div className="cl-container">
					<h2 className="cl-section-title" data-reveal>Course Subjects</h2>
					<p className="cl-section-sub" data-reveal>Click a subject to explore its syllabus</p>
					<div className="cl-subject-tabs" data-reveal>
						{SUBJECTS.map((s, i) => (
							<button
								key={s.code}
								className={`cl-subject-tab ${activeSubject === i ? 'cl-subject-tab--active' : ''}`}
								onClick={() => setActiveSubject(i)}
							>
								<span className="cl-subject-tab__code">{s.code}</span>
								<span className="cl-subject-tab__title">{s.title}</span>
							</button>
						))}
					</div>
					<div className="cl-subject-detail" data-reveal>
						<div className="cl-subject-detail__header">
							<span className="cl-subject-detail__icon">{SUBJECTS[activeSubject].icon}</span>
							<div>
								<span className="cl-subject-detail__code">{SUBJECTS[activeSubject].code}</span>
								<h3>{SUBJECTS[activeSubject].title}</h3>
							</div>
						</div>
						<p className="cl-subject-detail__desc">{SUBJECTS[activeSubject].desc}</p>
					</div>
				</div>
			</section>

			{/* ── Lecture Panel ── */}
			<section className="cl-lecturers" id="lecturers">
				<div className="cl-container">
					<h2 className="cl-section-title cl-section-title--white" data-reveal>Lecture Panel</h2>
					<p className="cl-section-sub cl-section-sub--white" data-reveal>
						Top-notch educators committed to delivering exceptional teaching
					</p>
					<div className="cl-lecturers__grid">
						{LECTURERS.map((l) => (
							<div key={l.name + l.code} className="cl-lect-card" data-reveal>
								<div className="cl-lect-card__img-wrap">
									{l.img ? (
										<img src={l.img} alt={l.name} loading="lazy" />
									) : (
										<div className="cl-lect-card__placeholder">
											{l.name.charAt(0)}{l.name.split(' ')[1]?.charAt(0)}
										</div>
									)}
								</div>
								<div className="cl-lect-card__body">
									<span className="cl-lect-card__code">{l.code}</span>
									<h3 className="cl-lect-card__name">{l.name}</h3>
									<p className="cl-lect-card__quals">{l.quals}</p>
									{l.bio && <p className="cl-lect-card__bio">{l.bio}</p>}
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ── Register CTA ── */}
			<section className="cl-register" id="register">
				<div className="cl-container">
					<div className="cl-register__inner" data-reveal>
						<h2>Ready to Begin Your CIMA Journey?</h2>
						<p>
							Secure your spot in the JAN 2026 intake now. Limited seats available — don&apos;t miss the
							early bird discount!
						</p>
						<div className="cl-register__actions">
							<Link
								to="/enrollment"
								className="cl-btn cl-btn--primary cl-btn--lg"
							>
								Start Registration
							</Link>
							<a
								href="https://wa.me/94777123456"
								className="cl-btn cl-btn--whatsapp"
								target="_blank"
								rel="noopener noreferrer"
							>
								💬 WhatsApp Us
							</a>
						</div>
					</div>
				</div>
			</section>

			{/* ── Funnel Footer ── */}
			<footer className="cl-footer">
				<p>© {new Date().getFullYear()} Nanaska (Pvt) Ltd. All rights reserved.</p>
				<p>
					<a href="https://www.nanaska.com/privacy-policy/" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
					{' · '}
					<a href="https://www.nanaska.com/terms-and-conditions/" target="_blank" rel="noopener noreferrer">Terms &amp; Conditions</a>
				</p>
			</footer>
		</div>
	);
}
