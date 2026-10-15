import { Link } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';
import './E2BPage.css';

const HERO_STATS = [
	{ value: '6', label: 'Weeks' },
	{ value: '2h', label: 'Per session' },
	{ value: 'Online', label: 'Preferred delivery' },
	{ value: '6-10', label: 'Ideal initial cohort' },
];

const ENGINEER_GAINS = [
	'Understand the financial impact of technical decisions',
	'Evaluate costs, investments and business opportunities',
	'Connect operational performance with business results',
	'Assess risk and make informed decisions',
	'Communicate with finance, management and senior leadership',
];

const AUDIENCES = [
	{
		title: 'Emerging Technical Professionals',
		profile: 'Engineers and technical specialists with workplace experience but limited exposure to finance, budgets or senior-management decisions.',
		outcome: 'Business language, commercial awareness and confidence in wider management decisions.',
	},
	{
		title: 'Project and Functional Leaders',
		profile: 'Project engineers, team leads, engineering managers and operational managers handling people, resources, customers, suppliers or budgets.',
		outcome: 'Stronger cost judgement, business-case thinking, risk awareness and cross-functional communication.',
	},
	{
		title: 'Senior Engineering and Business Leaders',
		profile: 'Heads of engineering, senior managers, general managers, directors or CEO-track professionals reviewing investments and financial information.',
		outcome: 'A structured finance and strategy framework, governance perspective and a clear pathway into CIMA.',
	},
];

const SNAPSHOT = [
	{ label: 'Programme length', value: '6 weeks / 6 sessions' },
	{ label: 'Session length', value: '2 hours per session' },
	{ label: 'Suggested timing', value: 'Weekdays, 7.30 pm-9.30 pm' },
	{ label: 'Corporate delivery', value: 'Arranged around package requirements' },
	{ label: 'Learning style', value: 'Scenarios, guided discussion, group problem-solving and selected CIMA extracts' },
	{ label: 'Pathway', value: 'Move directly into the relevant Nanaska FLP intake' },
];

const SESSION_LEADERS = {
	channa: { name: 'Channa Gunawardana', image: '/images/e2b/channa-gunawardana.png' },
	ali: { name: 'Ali Raheem', image: '/images/2024-06-Ali_Raheem-removebg-preview.png' },
	mahesh: { name: 'Mahesh Amarasiri', image: '/images/e2b/mahesh-amarasiri.png' },
	lahiru: { name: 'Lahiru Wijerathna', image: '/images/e2b/lahiru-wijerathna.png' },
	miyuru: { name: 'Miyuru Dharmage', image: '/images/e2b/miyuru-dharmage.png' },
};

const SESSIONS = [
	{
		no: '01',
		title: 'Strategy & Leadership',
		focus: 'How businesses create value; strategic choices and trade-offs; whether an idea is commercially and operationally workable.',
		topics: 'Value creation, strategic options, suitability, feasibility, acceptability and strategy implementation.',
		lead: 'Channa Gunawardana',
		leaders: ['channa'],
	},
	{
		no: '02',
		title: 'Cost & Operations Decisions',
		focus: 'Relevant costs, contribution, bottlenecks, limiting factors, quality costs and environmental costs.',
		topics: 'Relevant costing, opportunity cost, linear programming and operational decision-making.',
		lead: 'Ali Raheem with Lahiru Wijerathna',
		leaders: ['ali', 'lahiru'],
	},
	{
		no: '03',
		title: 'Financial Insight & Business Cases',
		focus: 'Ratio interpretation, financial-reporting judgement, ESG and what a CFO expects in an engineering business case.',
		topics: 'Profitability, liquidity, gearing, impairment, provisions, R&D expenditure, ESG and funding.',
		lead: 'Ali Raheem with Mahesh Amarasiri',
		leaders: ['ali', 'mahesh'],
	},
	{
		no: '04',
		title: 'Decisions & AI',
		focus: 'Payoff tables, expected value, risk attitudes, practical AI tasks, human review and governance.',
		topics: 'Decision models, AI, data governance, internal controls, cyber and confidentiality risks.',
		lead: 'Ali Raheem with Miyuru Dharmage',
		leaders: ['ali', 'miyuru'],
	},
	{
		no: '05',
		title: 'Governance & Case Thinking',
		focus: 'Board and management responsibilities, ethics, escalation, accountability and applied problem-solving.',
		topics: 'Corporate governance, risk ownership, internal controls, ethics and professional scepticism.',
		lead: 'Channa Gunawardana',
		leaders: ['channa'],
	},
	{
		no: '06',
		title: 'Business Case & Boardroom Practice',
		focus: 'Short pre-seen, focused update, group discussion, verbal pitch and supportive panel feedback.',
		topics: 'CIMA case study framework and boardroom-style recommendation practice.',
		lead: 'Channa Gunawardana, Lahiru Wijerathna and Mahesh Amarasiri',
		leaders: ['channa', 'lahiru', 'mahesh'],
	},
];

const FACULTY = [
	{
		name: 'Channa Gunawardana',
		role: 'Founder and Lead Lecturer, Nanaska',
		credentials: 'FCMA, CGMA (UK), FCA (SL), MBA, BSc First Class',
		image: '/images/e2b/channa-gunawardana.png',
	},
	{
		name: 'Mahesh Amarasiri',
		role: 'Group CFO and Board Director, ACL Cables PLC',
		credentials: 'BSc Electrical Engineering, FCMA, CGMA, ACIM, CMA - Sri Lanka, MBA (PIM)',
		image: '/images/e2b/mahesh-amarasiri.png',
	},
	{
		name: 'Ali Raheem',
		role: 'Chief Executive Officer and Lecturer, Nanaska',
		credentials: 'ACMA (UK), CGMA, BSc (Hons) Applied Sciences in Chemistry',
		image: '/images/2024-06-Ali_Raheem-removebg-preview.png',
	},
	{
		name: 'Lahiru Wijerathna',
		role: 'Chief Executive Officer, Modern Pack Lanka (Pvt) Ltd',
		credentials: 'BSc Engineering (Hons), CIMA Passed Finalist, MBS, MSc Project Management',
		image: '/images/e2b/lahiru-wijerathna.png',
	},
	{
		name: 'Miyuru Dharmage',
		role: 'Senior Manager - AI Innovations, Nanaska',
		credentials: 'MSc Advanced Software Engineering, BSc Computer Science',
		image: '/images/e2b/miyuru-dharmage.png',
	},
];

function ArrowIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path d="M5 12h14" />
			<path d="m13 6 6 6-6 6" />
		</svg>
	);
}

function CheckIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path d="m20 6-11 11-5-5" />
		</svg>
	);
}

export default function E2BPage() {
	useSEO({
		title: 'E2B Engineer-to-Business Leadership - Nanaska',
		description:
			'E2B is Nanaska\'s six-week online bridging programme for engineers preparing to start CIMA through the Finance Leadership Program.',
		keywords: 'E2B, Engineer to Business Leadership, CIMA for engineers, Nanaska, CIMA FLP, business leadership for engineers',
		ogImage: '/images/2021-04-Channa.png',
		canonical: 'https://www.nanaska.com/e2b/',
	});

	return (
		<main className="e2b-page">
			<section className="e2b-hero">
				<div className="e2b-container e2b-hero__grid">
					<div className="e2b-hero__content">
						<p className="e2b-eyebrow">Engineer-to-Business Leadership</p>
						<h1>E2B for Engineers</h1>
						<p className="e2b-hero__subtitle">Ready to Lead Beyond Technical Expertise</p>
						<p className="e2b-hero__lead">
							A focused six-week online bridging programme that helps engineering professionals build the
							business perspective, commercial confidence and leadership language needed before entering CIMA
							through the Finance Leadership Program.
						</p>
						<div className="e2b-hero__actions">
							<a className="e2b-btn e2b-btn--primary" href="#programme">
								Explore programme <ArrowIcon />
							</a>
							<Link className="e2b-btn e2b-btn--ghost" to="/financial-leadership-program">
								View FLP pathway
							</Link>
						</div>
					</div>

					<div className="e2b-hero__visual" aria-label="E2B programme summary">
						<img src="/images/2021-04-Channa.png" alt="Channa Gunawardana" />
						<div className="e2b-hero__visual-panel">
							<span>Technical expertise</span>
							<strong>+</strong>
							<span>Business understanding</span>
							<strong>+</strong>
							<span>Leadership capability</span>
						</div>
					</div>
				</div>
				<div className="e2b-container e2b-hero__stats" aria-label="E2B programme quick facts">
					{HERO_STATS.map((item) => (
						<div key={item.label} className="e2b-stat">
							<strong>{item.value}</strong>
							<span>{item.label}</span>
						</div>
					))}
				</div>
			</section>

			<section className="e2b-section e2b-section--white e2b-section--image e2b-section--image-desk">
				<div className="e2b-container e2b-split">
					<div>
						<p className="e2b-eyebrow">Why CIMA for engineers?</p>
						<h2>Engineering solves problems. Business decides which problems matter.</h2>
					</div>
					<div className="e2b-copy">
						<p>
							Engineers bring analytical thinking, technical expertise and structured problem-solving into the
							workplace. As careers progress, those responsibilities often expand into budgets, investments,
							operations, strategy, risk and leadership.
						</p>
						<p>
							E2B helps engineers become comfortable with the business thinking they will meet in CIMA:
							understanding value, interpreting financial and operational information, making decisions without
							perfect certainty and explaining recommendations clearly.
						</p>
					</div>
				</div>
			</section>

			<section className="e2b-section">
				<div className="e2b-container">
					<div className="e2b-section-head">
						<p className="e2b-eyebrow">From technical decisions to business decisions</p>
						<h2>E2B strengthens the commercial layer around engineering judgement.</h2>
					</div>
					<div className="e2b-check-grid">
						{ENGINEER_GAINS.map((gain) => (
							<div key={gain} className="e2b-check-card">
								<CheckIcon />
								<span>{gain}</span>
							</div>
						))}
					</div>
				</div>
			</section>

			<section className="e2b-section e2b-section--blue">
				<div className="e2b-container">
					<div className="e2b-section-head">
						<p className="e2b-eyebrow">Who the programme is for</p>
						<h2>Designed for engineers at different leadership stages.</h2>
					</div>
					<div className="e2b-audience-grid">
						{AUDIENCES.map((item) => (
							<article key={item.title} className="e2b-audience-card">
								<h3>{item.title}</h3>
								<p>{item.profile}</p>
								<div>
									<span>What E2B adds</span>
									<strong>{item.outcome}</strong>
								</div>
							</article>
						))}
					</div>
				</div>
			</section>

			<section className="e2b-section e2b-section--image e2b-section--image-blueprint" id="programme">
				<div className="e2b-container e2b-programme-grid">
					<div>
						<p className="e2b-eyebrow">Programme at a glance</p>
						<h2>A practical bridge into CIMA FLP, not an accounting crash course.</h2>
						<p className="e2b-copy e2b-copy--standalone">
							The purpose is not to turn engineers into accountants before CIMA begins. It is to build comfort
							with value, cost, finance, governance, risk and applied case thinking.
						</p>
					</div>
					<div className="e2b-snapshot">
						{SNAPSHOT.map((item) => (
							<div key={item.label}>
								<span>{item.label}</span>
								<strong>{item.value}</strong>
							</div>
						))}
					</div>
				</div>
			</section>

			<section className="e2b-section e2b-section--white">
				<div className="e2b-container">
					<div className="e2b-section-head">
						<p className="e2b-eyebrow">Programme structure</p>
						<h2>Six guided sessions with practical business and CIMA case-study exposure.</h2>
					</div>
					<div className="e2b-session-list">
						{SESSIONS.map((session) => (
							<article key={session.no} className="e2b-session">
								<div className="e2b-session__no">{session.no}</div>
								<div>
									<h3>{session.title}</h3>
									<p>{session.focus}</p>
									<small>{session.topics}</small>
								</div>
								<div className="e2b-session__lead">
									<strong>{session.lead}</strong>
									<div className="e2b-session__avatars" aria-label={`${session.lead} lecturer photos`}>
										{session.leaders.map((leaderKey) => {
											const leader = SESSION_LEADERS[leaderKey];
											return (
												<span key={leaderKey} className={`e2b-session__avatar e2b-session__avatar--${leaderKey}`}>
													<img src={leader.image} alt={leader.name} loading="lazy" />
												</span>
											);
										})}
									</div>
								</div>
							</article>
						))}
					</div>
				</div>
			</section>

			<section className="e2b-section e2b-section--image e2b-section--image-workshop">
				<div className="e2b-container">
					<div className="e2b-section-head">
						<p className="e2b-eyebrow">Faculty</p>
						<h2>Led by Nanaska faculty with finance, engineering, AI and boardroom experience.</h2>
					</div>
					<div className="e2b-faculty-grid">
						{FACULTY.map((person) => (
							<article key={person.name} className="e2b-faculty-card">
								{person.image ? (
									<img src={person.image} alt={person.name} loading="lazy" />
								) : (
									<div className="e2b-faculty-card__initials">{person.initials}</div>
								)}
								<div>
									<h3>{person.name}</h3>
									<span>{person.role}</span>
									<p>{person.credentials}</p>
								</div>
							</article>
						))}
					</div>
				</div>
			</section>

			<section className="e2b-cta">
				<div className="e2b-container e2b-cta__inner">
					<div>
						<p className="e2b-eyebrow">Next step</p>
						<h2>Build the business confidence to take your engineering expertise further.</h2>
					</div>
					<div className="e2b-cta__actions">
						<Link className="e2b-btn e2b-btn--primary" to="/contact">
							Talk to Nanaska <ArrowIcon />
						</Link>
						<Link className="e2b-btn e2b-btn--ghost" to="/financial-leadership-program">
							Continue to FLP
						</Link>
					</div>
				</div>
			</section>
		</main>
	);
}
