import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './NanaskaEdgePage.css';

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

function LoginPanelGrid() {
	const onMove = (e) => {
		const rect = e.currentTarget.getBoundingClientRect();
		e.currentTarget.style.setProperty('--mx', `${((e.clientX - rect.left) / rect.width) * 100}%`);
		e.currentTarget.style.setProperty('--my', `${((e.clientY - rect.top) / rect.height) * 100}%`);
	};

	return (
		<div className="edge-panel-grid">
			<a
				className="edge-panel edge-reveal"
				href="https://edge.trial.nanaska.com/login"
				target="_blank"
				rel="noopener noreferrer"
				onMouseMove={onMove}
			>
				<div className="edge-panel__glow" />
				<div className="edge-panel__tag"><span /> Complimentary, no card</div>
				<h3>Free <em>Mock Exam</em></h3>
				<p>Log in to the trial platform for a complimentary timed mock with instant feedback.</p>
				<ul>
					<li><Icon.check /> Full timed mock exam</li>
					<li><Icon.check /> Instant automated marking</li>
					<li><Icon.check /> Detailed performance feedback</li>
					<li><Icon.check /> No credit card required</li>
				</ul>
				<div className="edge-panel__cta">
					<span>Log in to Edge Trial</span>
					<i><Icon.arrow /></i>
				</div>
			</a>

			<a
				className="edge-panel edge-reveal"
				href="https://edge.revision.nanaska.com/login"
				target="_blank"
				rel="noopener noreferrer"
				onMouseMove={onMove}
			>
				<div className="edge-panel__glow" />
				<div className="edge-panel__tag"><span /> Guided programme</div>
				<h3>Revision <em>Session</em></h3>
				<p>Log in to the revision platform for structured mock exams, practice and progress support.</p>
				<ul>
					<li><Icon.check /> Multiple practice sessions</li>
					<li><Icon.check /> Topic-specific revision</li>
					<li><Icon.check /> Progress tracking and analytics</li>
					<li><Icon.check /> Expert-designed questions</li>
				</ul>
				<div className="edge-panel__cta">
					<span>Log in to Edge Revision</span>
					<i><Icon.arrow /></i>
				</div>
			</a>
		</div>
	);
}

export default function NanaskaEdgeLoginPage() {
	useReveal();

	return (
		<div className="edge-page" data-edge-theme="light">
			<Aurora />

			<section className="edge-hero-combined" id="login">
				<div className="edge-container">
					<div className="edge-hero-combined__top edge-reveal is-in">
						<img src="/images/nanaska-edge-logo.png" alt="Nanaska Edge" className="edge-logo--top" />
						<h1>Log In to Your <span>NANASKA EDGE</span><br />Platform <em>Account</em></h1>
						<p>Choose your platform below to access your Edge learning environment.</p>
					</div>
					<LoginPanelGrid />
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
						<h2>Not registered yet? Get the <em>Edge</em> advantage.</h2>
						<p>
							Start with a free mock or enroll in a guided revision session — built on the same Nanaska
							admin, payment, and registration systems you already trust.
						</p>
						<div className="edge-cta__actions">
							<Link className="edge-btn edge-btn--primary" to="/nanaska-edge">
								Register for Edge <Icon.arrow />
							</Link>
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
		</div>
	);
}
