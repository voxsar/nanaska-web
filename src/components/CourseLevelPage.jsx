import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { usePricing } from '../context/PricingContext';
import { getLevelPricesById, getCoursePricesByCode } from '../data/pricingData';
import LecturerPanel from './LecturerPanel';
import { LECTURERS as STATIC_LECTURERS } from '../data/lecturersData';
import { useApi } from '../hooks/useApi';
import './CourseLevelPage.css';

export default function CourseLevelPage({ level }) {
	const [activeSubject, setActiveSubject] = useState(level.subjects[0].code);
	const [activeTab, setActiveTab] = useState('overview');
	const currentSubject = level.subjects.find((s) => s.code === activeSubject);
	const { addCourse, addLevel, isInCart, isLevelInCart } = useCart();
	const { selectedCountry, getAmountForCountry, formatAmount } = usePricing();
	const levelPrices = getLevelPricesById(level.levelId);
	const levelAmount = getAmountForCountry(levelPrices, selectedCountry);

	const { data: apiLecturers } = useApi('/lecturers?active=true');
	const LECTURERS = (apiLecturers?.length) ? apiLecturers : STATIC_LECTURERS;

	const levelInCart = isLevelInCart(level.levelId);

	return (
		<div className="course-page" style={{ '--level-color': level.color, '--level-gradient': level.gradient }}>
			{/* Hero */}
			<section className="course-page__hero">
				<div className="course-page__hero-bg" />
				<div className="course-page__hero-inner">
					<span className="course-page__breadcrumb">
						<Link to="/">Home</Link> / Courses / {level.title}
					</span>
					<div className="course-page__level-badge">{level.badge}</div>
					<h1 className="course-page__title">{level.title}</h1>
					<p className="course-page__tagline">{level.tagline}</p>
					<div className="course-page__meta">
						<span className="course-page__meta-item">📚 {level.subjects.length} Subjects</span>
						<span className="course-page__meta-item">⏱ {level.duration}</span>
						<span className="course-page__meta-item">🏆 {level.qualification}</span>
						<span className="course-page__meta-item">💰 Full Level: {formatAmount(levelAmount)}</span>
					</div>
					<div className="course-page__hero-actions">
						<button
							className={`course-page__add-level-btn${levelInCart ? ' course-page__add-level-btn--added' : ''}`}
							onClick={() => addLevel(level)}
							disabled={levelInCart}
						>
							{levelInCart ? '✓ Level Added' : '+ Add Level to Cart'}
						</button>
					</div>
				</div>
				<div className="course-page__hero-wave">
					<svg viewBox="0 0 1440 80" preserveAspectRatio="none">
						<path fill="#f9fbff" d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" />
					</svg>
				</div>
			</section>

			{/* Subject Explorer */}
			<section className="course-page__explorer">
				<div className="course-page__container">
					<h2 className="course-page__section-title">Explore Subjects</h2>
					<p className="course-page__section-sub">Click on any subject to explore the syllabus, learning outcomes and more.</p>

					{/* Subject Selector */}
					<div className="subject-selector">
						{level.subjects.map((subject) => {
							const subjectInCart = isInCart(subject.code);
							const subjectPrices = getCoursePricesByCode(subject.code, 0);
							const subjectAmount = getAmountForCountry(subjectPrices, selectedCountry);
							return (
								<div key={subject.code} className="subject-selector__item">
									<button
										className={`subject-selector__btn ${activeSubject === subject.code ? 'subject-selector__btn--active' : ''}`}
										onClick={() => { setActiveSubject(subject.code); setActiveTab('overview'); }}
									>
										<span className="subject-selector__code">{subject.code}</span>
										<span className="subject-selector__name">{subject.name}</span>
										<span className="subject-selector__price">{formatAmount(subjectAmount)}</span>
									</button>
									<button
										className={`subject-selector__cart-btn${(subjectInCart || levelInCart) ? ' subject-selector__cart-btn--added' : ''}`}
										onClick={(e) => { e.stopPropagation(); addCourse(subject, level); }}
										disabled={subjectInCart || levelInCart}
										title={levelInCart ? 'Level already in cart' : subjectInCart ? 'Already in cart' : 'Add to enrollment cart'}
									>
										{(subjectInCart || levelInCart) ? '✓' : '+'}
									</button>
								</div>
							);
						})}
					</div>

					{/* Subject Detail */}
					{currentSubject && (
						<div className="subject-detail">
							{/* Tabs */}
							<div className="subject-tabs">
								{['overview', 'syllabus', 'outcomes'].map((tab) => (
									<button
										key={tab}
										className={`subject-tab ${activeTab === tab ? 'subject-tab--active' : ''}`}
										onClick={() => setActiveTab(tab)}
									>
										{tab.charAt(0).toUpperCase() + tab.slice(1)}
									</button>
								))}
							</div>

							{activeTab === 'overview' && (
								<div className="subject-detail__panel">
									<div className="subject-detail__header">
										<div className="subject-detail__icon">{currentSubject.icon}</div>
										<div>
											<h3>{currentSubject.code} — {currentSubject.name}</h3>
											<p className="subject-detail__subtitle">{currentSubject.subtitle}</p>
										</div>
									</div>
									<p className="subject-detail__desc">{currentSubject.description}</p>
									<div className="subject-detail__highlights">
										{currentSubject.highlights.map((h) => (
											<div key={h} className="subject-highlight">
												<span className="subject-highlight__check">✓</span>
												<span>{h}</span>
											</div>
										))}
									</div>
								</div>
							)}

							{activeTab === 'syllabus' && (
								<div className="subject-detail__panel">
									<h3>{currentSubject.code} — Syllabus Overview</h3>
									<div className="syllabus-list">
										{currentSubject.syllabus.map((item, idx) => (
											<div key={idx} className="syllabus-item">
												<span className="syllabus-item__num">{String(idx + 1).padStart(2, '0')}</span>
												<div className="syllabus-item__content">
													<h4>{item.topic}</h4>
													<p>{item.desc}</p>
												</div>
											</div>
										))}
									</div>
								</div>
							)}

							{activeTab === 'outcomes' && (
								<div className="subject-detail__panel">
									<h3>{currentSubject.code} — Learning Outcomes</h3>
									<ul className="outcomes-list">
										{currentSubject.outcomes.map((o, idx) => (
											<li key={idx} className="outcome-item">
												<span className="outcome-item__icon">🎯</span>
												<span>{o}</span>
											</li>
										))}
									</ul>
								</div>
							)}
						</div>
					)}
				</div>
			</section>

			{/* Why Study This Level */}
			<section className="course-page__why">
				<div className="course-page__container">
					<h2 className="course-page__section-title course-page__section-title--light">
						Why Study {level.title}?
					</h2>
					<div className="course-page__why-grid">
						{level.whyPoints.map((point) => (
							<div key={point.title} className="why-card">
								<span className="why-card__icon">{point.icon}</span>
								<h4>{point.title}</h4>
								<p>{point.desc}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Lecturer Panel */}
			<section className="course-page__lecturer-section">
				<div className="course-page__container">
					<h2 className="course-page__section-title">Your Lead Lecturer</h2>
					<LecturerPanel lecturer={LECTURERS[0]} compact={true} />
				</div>
			</section>

			{/* Related Levels */}
			<section className="course-page__related">
				<div className="course-page__container">
					<h2 className="course-page__section-title">Other CIMA Levels</h2>
					<div className="course-page__related-grid">
						{[
							{ title: 'Certificate Level', to: '/cima-certificate-level', emoji: '📗' },
							{ title: 'Operational Level', to: '/cima-operational-level', emoji: '📘' },
							{ title: 'Management Level', to: '/cima-management-level', emoji: '��' },
							{ title: 'Strategic Level', to: '/cima-strategic-level', emoji: '📕' },
						].filter((r) => r.to !== level.currentPath).map((r) => (
							<Link key={r.to} to={r.to} className="related-card">
								<span className="related-card__emoji">{r.emoji}</span>
								<span className="related-card__title">{r.title}</span>
								<span className="related-card__arrow">→</span>
							</Link>
						))}
					</div>
				</div>
			</section>
		</div>
	);
}
