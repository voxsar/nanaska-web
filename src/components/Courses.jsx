import { useState, useRef } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { usePricing } from '../context/PricingContext';
import { getLevelPricesById } from '../data/pricingData';
import './Courses.css';

const LEVELS = [
	{
		id: 'certificate',
		label: 'Certificate Level',
		tag: 'Entry Point',
		color: '#24ade3',
		img: '/images/2021-03-cert-level.jpg',
		description:
			'The Certificate Level is the ideal entry point into the CIMA qualification, covering the fundamentals of finance, accounting, and business.',
		subjects: ['Business Accounting', 'Management Accounting', 'Business Mathematics', 'Corporate & Business Law'],
	},
	{
		id: 'operational',
		label: 'Operational Level',
		tag: 'Foundation',
		color: '#1b365d',
		img: '/images/2021-03-opera-level.jpg',
		description:
			'The Operational Level builds core financial and management accounting competencies essential for day-to-day business decision-making.',
		subjects: ['Management Accounting', 'Financial Reporting', 'Business Finance', 'Enterprise Operations'],
	},
	{
		id: 'management',
		label: 'Management Level',
		tag: 'Intermediate',
		color: '#f5a623',
		img: '/images/2021-03-manage-level.jpg',
		description:
			'The Management Level develops strategic analysis and decision-making skills, equipping you to manage resources and advise on complex challenges.',
		subjects: ['Advanced Management Accounting', 'Advanced Financial Reporting', 'Risk Management', 'Enterprise Management'],
	},
	{
		id: 'strategic',
		label: 'Strategic Level',
		tag: 'Advanced',
		color: '#1b365d',
		img: '/images/2021-03-strat-level.jpg',
		description:
			'The Strategic Level is the pinnacle of the CIMA qualification, focusing on leadership, governance, and high-level strategic decision-making.',
		subjects: ['Strategic Management', 'Strategic Financial Management', 'Risk & Control Strategy', 'Business Strategy'],
	},
];

export default function Courses() {
	const [active, setActive] = useState('certificate');
	const current = LEVELS.find((l) => l.id === active);
	const sectionRef = useRef(null);
	useScrollReveal(sectionRef);
	const { selectedCountry, getAmountForCountry, formatAmount } = usePricing();
	const levelPrices = getLevelPricesById(current.id);
	const levelAmount = getAmountForCountry(levelPrices, selectedCountry);

	return (
		<section className="courses" id="courses" ref={sectionRef}>
			<div className="courses__container">
				<div className="courses__header" data-reveal="fade">
					<span className="courses__eyebrow">What We Offer</span>
					<h2 className="courses__title">CIMA Qualification Levels</h2>
					<p className="courses__subtitle">
						Progress through the four levels of the CIMA qualification with
						Nanaska&apos;s expert guidance.
					</p>
				</div>

				{/* Tab bar */}
				<div className="courses__tabs" role="tablist" data-reveal="fade">
					{LEVELS.map((level) => (
						<button
							key={level.id}
							role="tab"
							aria-selected={level.id === active}
							aria-controls={`panel-${level.id}`}
							className={`courses__tab${level.id === active ? ' courses__tab--active' : ''}`}
							style={level.id === active ? { borderBottomColor: level.color } : {}}
							onClick={() => setActive(level.id)}
						>
							<span
								className="courses__tab-dot"
								style={{ backgroundColor: level.id === active ? level.color : '#cbd5e1' }}
							/>
							{level.label}
						</button>
					))}
				</div>

				{/* Panel */}
				<div
					id={`panel-${current.id}`}
					role="tabpanel"
					className="courses__panel"
					key={current.id}
				>
					<div className="courses__panel-img-wrap" data-reveal="left">
						<img
							src={current.img}
							alt={`${current.label} diagram`}
							className="courses__panel-img"
							loading="lazy"
						/>
						<span
							className="courses__panel-tag"
							style={{ backgroundColor: current.color }}
						>
							{current.tag}
						</span>
					</div>

					<div className="courses__panel-body" data-reveal="right">
						<h3 className="courses__panel-title">{current.label}</h3>
						<p className="courses__panel-desc">{current.description}</p>
						<div className="courses__panel-price">
							<span className="courses__panel-price-label">Full Level:</span>
							<span className="courses__panel-price-amount" style={{ color: current.color }}>{formatAmount(levelAmount)}</span>
						</div>
						<ul className="courses__panel-subjects">
							{current.subjects.map((s) => (
								<li key={s} className="courses__panel-subject">
									<span className="courses__panel-check" style={{ color: current.color }}>✓</span>
									{s}
								</li>
							))}
						</ul>
						<a href={`#${current.id}`} className="courses__panel-link" style={{ backgroundColor: current.color }}>
							View Syllabus →
						</a>
					</div>
				</div>

				<div className="courses__cta" data-reveal="fade">
					<a href="#register" className="courses__cta-btn">Register for a Course</a>
				</div>
			</div>
		</section>
	);
}
