import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import LecturerPanel from './LecturerPanel';
import { LECTURERS } from '../data/lecturersData';
import './IndividualCoursePage.css';

export default function IndividualCoursePage({ course, level }) {
  const [activeTab, setActiveTab] = useState('overview');
  const { addCourse, isInCart, isLevelInCart } = useCart();

  const inCart = isInCart(course.code);
  const levelInCart = isLevelInCart(level.levelId);
  const relatedCourses = level.subjects.filter(s => s.code !== course.code);

  const handleAddToCart = () => {
    addCourse(course, level);
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

          <div className="individual-course__icon">{course.icon}</div>
          <div className="individual-course__level-badge">{level.badge} {level.title}</div>
          <h1 className="individual-course__title">
            <span className="individual-course__code">{course.code}</span>
            {course.name}
          </h1>
          <p className="individual-course__subtitle">{course.subtitle}</p>

          <div className="individual-course__meta">
            <span className="individual-course__meta-item">📚 {level.title}</span>
            <span className="individual-course__meta-item">⏱ {level.duration}</span>
            <span className="individual-course__meta-item">💰 From ${course.price}</span>
          </div>

          <div className="individual-course__actions">
            <a
              href="https://www.nanaska.com/onboarding/courses/gather/students/registration/begin/entry/"
              className="individual-course__enroll-btn"
              target="_blank"
              rel="noopener noreferrer"
            >
              Enroll in this Course
            </a>
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
            <path fill="#f9fbff" d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z"/>
          </svg>
        </div>
      </section>

      {/* Description */}
      <section className="individual-course__about">
        <div className="individual-course__container">
          <div className="individual-course__desc-grid">
            <div className="individual-course__desc-main">
              <h2>About This Course</h2>
              <p>{course.description}</p>
              <div className="individual-course__highlights">
                {course.highlights.map(h => (
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
                  <dd>{level.duration}</dd>
                  <dt>Qualification</dt>
                  <dd>{level.qualification}</dd>
                  <dt>Price</dt>
                  <dd>From ${course.price}</dd>
                </dl>
                <a
                  href="https://www.nanaska.com/onboarding/courses/gather/students/registration/begin/entry/"
                  className="individual-course__sidebar-enroll"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Enroll Now
                </a>
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
                  <div className="individual-course__big-icon">{course.icon}</div>
                  <div>
                    <h3>{course.code} — {course.name}</h3>
                    <p>{course.subtitle}</p>
                  </div>
                </div>
                <p>{course.description}</p>
              </div>
            )}

            {activeTab === 'syllabus' && (
              <div>
                <h3>{course.code} — Syllabus Overview</h3>
                <div className="individual-course__syllabus">
                  {course.syllabus.map((item, idx) => (
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
                  {course.outcomes.map((o, idx) => (
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

      {/* Lecturer */}
      <section className="individual-course__lecturer">
        <div className="individual-course__container">
          <h2 className="individual-course__section-title">Your Lecturer</h2>
          <LecturerPanel lecturer={LECTURERS[0]} compact={true} />
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
            <a
              href="https://www.nanaska.com/onboarding/courses/gather/students/registration/begin/entry/"
              className="individual-course__cta-btn"
              target="_blank"
              rel="noopener noreferrer"
            >
              Enroll Now →
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
