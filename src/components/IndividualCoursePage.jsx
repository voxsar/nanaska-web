import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { usePricing } from '../context/PricingContext';
import { getCoursePricesByCode } from '../data/pricingData';
import LecturerPanel from './LecturerPanel';
import { LECTURERS as STATIC_LECTURERS } from '../data/lecturersData';
import { useApi } from '../hooks/useApi';
import './IndividualCoursePage.css';

export default function IndividualCoursePage({ course, level }) {
	const [activeTab, setActiveTab] = useState('overview');
	const [lecturerIdx, setLecturerIdx] = useState(0);
	const { addCourse, isInCart, isLevelInCart } = useCart();
	const { selectedCountry, getAmountForCountry, formatAmount } = usePricing();

	const { data: apiLecturers } = useApi('/lecturers?active=true');
	const { data: dbCourse } = useApi(`/courses/${course.code}`);
	const ALL_LECTURERS = (apiLecturers?.length) ? apiLecturers : STATIC_LECTURERS;
	// Overlay DB fields (icon, subtitle, highlights, syllabus, outcomes) over static course data
	const mergedCourse = dbCourse ? { ...course, ...dbCourse, code: course.code } : course;

	// Pick lecturers for this course: use lecturerIds if set, otherwise fall back to first lecturer
	const courseLecturers = (() => {
		const ids = mergedCourse.lecturerIds;
		if (Array.isArray(ids) && ids.length > 0) {
			const matched = ids.map((lid) => ALL_LECTURERS.find((l) => String(l.id) === String(lid))).filter(Boolean);
			if (matched.length > 0) return matched;
		}
		return ALL_LECTURERS.slice(0, 1);
	})();

	// Duration: prefer course-level override, then level default
	const displayDuration = mergedCourse.duration || level.duration;

	const inCart = isInCart(course.code);
	const levelInCart = isLevelInCart(level.levelId);
	const relatedCourses = level.subjects.filter(s => s.code !== course.code);
	const coursePrice = getAmountForCountry(getCoursePricesByCode(course.code, course.price || 0), selectedCountry);

	const handleAddToCart = () => {
		addCourse(mergedCourse, level);
	};

	return (
		<div className="individual-course" style={{ '--level-color': level.color, '--level-gradient': level.gradient }}>
			{/* Hero */}
			<section className="individual-course__hero">
				<div className="individual-course__hero-bg" />
				<div className="individual-course__hero-inner">
					<nav className="individual-course__breadcrumb">
						<Link to="/">Home</Link>
						{' / '}
						<Link to={level.currentPath}>{level.title}</Link>
						{' / '}
						<span>{course.code}</span>
					</nav>

					<div className="individual-course__icon">{mergedCourse.icon}</div>
					<div className="individual-course__level-badge">{level.badge} {level.title}</div>
					<h1 className="individual-course__title">
						<span className="individual-course__code">{course.code}</span>
						{mergedCourse.name}
					</h1>
					<p className="individual-course__subtitle">{mergedCourse.subtitle}</p>

					<div className="individual-course__meta">
						<span className="individual-course__meta-item">📚 {level.title}</span>
						<span className="individual-course__meta-item">⏱ {displayDuration}</span>
						<span className="individual-course__meta-item">💰 From {formatAmount(coursePrice)}</span>
					</div>

					<div className="individual-course__actions">
						<button
							className={`individual-course__cart-btn${(inCart || levelInCart) ? ' individual-course__cart-btn--added' : ''}`}
							onClick={handleAddToCart}
							disabled={inCart || levelInCart}
						>
							{levelInCart ? '✓ Level in Cart' : inCart ? '✓ Added to Cart' : '+ Add to Enrollment Cart'}
						</button>
					</div>
				</div>
				<div className="individual-course__hero-wave">
					<svg viewBox="0 0 1440 80" preserveAspectRatio="none">
						<path fill="#f9fbff" d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" />
					</svg>
				</div>
			</section>

			{/* Description */}
			<section className="individual-course__about">
				<div className="individual-course__container">
					<div className="individual-course__desc-grid">
						<div className="individual-course__desc-main">
							<h2>About This Course</h2>
							<p>{mergedCourse.description}</p>
							<div className="individual-course__highlights">
								{(mergedCourse.highlights || []).map(h => (
									<div key={h} className="individual-course__highlight">
										<span className="individual-course__highlight-check">✓</span>
										<span>{h}</span>
									</div>
								))}
							</div>
						</div>
						<aside className="individual-course__sidebar">
							<div className="individual-course__sidebar-card">
								<h3>Course Details</h3>
								<dl className="individual-course__details-list">
									<dt>Level</dt>
									<dd>{level.title}</dd>
									<dt>Duration</dt>
									<dd>{displayDuration}</dd>
									<dt>Qualification</dt>
									<dd>{level.qualification}</dd>
									<dt>Price</dt>
									<dd>From {formatAmount(coursePrice)}</dd>
								</dl>
							</div>
						</aside>
					</div>
				</div>
			</section>

			{/* Tabs */}
			<section className="individual-course__tabs-section">
				<div className="individual-course__container">
					<div className="individual-course__tabs">
						{['overview', 'syllabus', 'outcomes'].map(tab => (
							<button
								key={tab}
								className={`individual-course__tab${activeTab === tab ? ' individual-course__tab--active' : ''}`}
								onClick={() => setActiveTab(tab)}
							>
								{tab.charAt(0).toUpperCase() + tab.slice(1)}
							</button>
						))}
					</div>

					<div className="individual-course__tab-panel">
						{activeTab === 'overview' && (
							<div className="individual-course__overview">
								<div className="individual-course__header-block">
									<div className="individual-course__big-icon">{mergedCourse.icon}</div>
									<div>
										<h3>{course.code} — {mergedCourse.name}</h3>
										<p>{mergedCourse.subtitle}</p>
									</div>
								</div>
								<p>{mergedCourse.description}</p>
							</div>
						)}

						{activeTab === 'syllabus' && (
							<div>
								<h3>{course.code} — Syllabus Overview</h3>
								<div className="individual-course__syllabus">
									{(mergedCourse.syllabus || []).map((item, idx) => (
										<div key={idx} className="individual-course__syllabus-item">
											<span className="individual-course__syllabus-num">{String(idx + 1).padStart(2, '0')}</span>
											<div>
												<h4>{item.topic}</h4>
												<p>{item.desc}</p>
											</div>
										</div>
									))}
								</div>
							</div>
						)}

						{activeTab === 'outcomes' && (
							<div>
								<h3>{course.code} — Learning Outcomes</h3>
								<ul className="individual-course__outcomes">
									{(mergedCourse.outcomes || []).map((o, idx) => (
										<li key={idx} className="individual-course__outcome">
											<span className="individual-course__outcome-icon">🎯</span>
											<span>{o}</span>
										</li>
									))}
								</ul>
							</div>
						)}
					</div>
				</div>
			</section>

			{/* Lecturer(s) */}
			<section className="individual-course__lecturer">
				<div className="individual-course__container">
					<h2 className="individual-course__section-title">
						{courseLecturers.length === 1 ? 'Your Lecturer' : 'Your Lecturers'}
					</h2>
					{courseLecturers.length <= 1 ? (
						courseLecturers.map((lec) => (
							<LecturerPanel key={lec.id ?? lec.name} lecturer={lec} compact={true} />
						))
					) : (
						<div style={{ position: 'relative' }}>
							<LecturerPanel lecturer={courseLecturers[lecturerIdx]} compact={true} />
							<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 20 }}>
								<button
									onClick={() => setLecturerIdx(i => Math.max(0, i - 1))}
									disabled={lecturerIdx === 0}
									style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid #24ADE3', background: lecturerIdx === 0 ? '#f1f5f9' : '#24ADE3', color: lecturerIdx === 0 ? '#94a3b8' : '#fff', fontSize: '1.2rem', cursor: lecturerIdx === 0 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
								>‹</button>
								<div style={{ display: 'flex', gap: 6 }}>
									{courseLecturers.map((_, i) => (
										<button
											key={i}
											onClick={() => setLecturerIdx(i)}
											style={{ width: 10, height: 10, borderRadius: '50%', border: 'none', background: i === lecturerIdx ? '#24ADE3' : '#cbd5e1', cursor: 'pointer', padding: 0 }}
										/>
									))}
								</div>
								<button
									onClick={() => setLecturerIdx(i => Math.min(courseLecturers.length - 1, i + 1))}
									disabled={lecturerIdx === courseLecturers.length - 1}
									style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid #24ADE3', background: lecturerIdx === courseLecturers.length - 1 ? '#f1f5f9' : '#24ADE3', color: lecturerIdx === courseLecturers.length - 1 ? '#94a3b8' : '#fff', fontSize: '1.2rem', cursor: lecturerIdx === courseLecturers.length - 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
								>›</button>
							</div>
							<p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.85rem', marginTop: 8 }}>
								{lecturerIdx + 1} of {courseLecturers.length}
							</p>
						</div>
					)}
				</div>
			</section>

			{/* Related Courses */}
			{relatedCourses.length > 0 && (
				<section className="individual-course__related">
					<div className="individual-course__container">
						<h2 className="individual-course__section-title">Other Courses in {level.title}</h2>
						<div className="individual-course__related-grid">
							{relatedCourses.map(rc => (
								<Link key={rc.code} to={`/${rc.slug}`} className="individual-course__related-card">
									<span className="individual-course__related-icon">{rc.icon}</span>
									<div>
										<span className="individual-course__related-code">{rc.code}</span>
										<span className="individual-course__related-name">{rc.name}</span>
									</div>
									<span className="individual-course__related-arrow">→</span>
								</Link>
							))}
						</div>
					</div>
				</section>
			)}

			{/* CTA */}
			<section className="individual-course__cta">
				<div className="individual-course__container">
					<div className="individual-course__cta-inner">
						<h2>Ready to Start {course.code}?</h2>
						<p>Join Nanaska and study with Sri Lanka&apos;s leading CIMA educators.</p>
					</div>
				</div>
			</section>
		</div>
	);
}
