import { Link } from 'react-router-dom';
import './AboutPage.css';

const ABOUT_CARDS = [
  {
    to: '/our-faculty',
    emoji: '👨‍🏫',
    title: 'Our Faculty',
    description:
      'Meet our world-class team of CIMA-certified lecturers and industry professionals who bring real-world expertise into every session.',
    cta: 'Meet the Team',
  },
  {
    to: '/our-specialty',
    emoji: '🏆',
    title: 'Our Specialty',
    description:
      'Discover what sets Nanaska apart — individual attention, 24/7 support, in-house case study specialists, and a track record of prize winners.',
    cta: 'Learn More',
  },
  {
    to: '/nanaska-alumni',
    emoji: '🎓',
    title: 'Nanaska Alumni',
    description:
      'Join our growing community of CIMA-qualified professionals from around the world. Register as a Nanaska alumnus and stay connected.',
    cta: 'Join Alumni',
  },
];

export default function AboutPage() {
  return (
    <div className="about-page">
      {/* Hero */}
      <section className="about-page__hero">
        <div className="about-page__hero-inner">
          <span className="about-page__breadcrumb">
            <Link to="/">Home</Link> / About Us
          </span>
          <h1 className="about-page__title">About Nanaska</h1>
          <p className="about-page__subtitle">
            Sri Lanka's leading CIMA institute — empowering students with expert guidance,
            personalized learning, and a proven path to professional success.
          </p>
        </div>
        <div className="about-page__hero-wave">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
            <path fill="#f9fbff" d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z"/>
          </svg>
        </div>
      </section>

      {/* Mission */}
      <section className="about-page__mission">
        <div className="about-page__container">
          <div className="about-page__mission-grid">
            <div className="about-page__mission-text">
              <h2>Our Mission</h2>
              <p>
                Nanaska was founded with a singular purpose: to make CIMA qualifications
                accessible, achievable, and transformative. We combine decades of lecturing
                expertise with modern technology to deliver education that prepares students
                not just for exams, but for leadership in the global business arena.
              </p>
              <p>
                With our CEO <strong>Channa Gunawardana</strong> — a Fellow Member of both
                CIMA UK and CA Sri Lanka — at the helm, Nanaska has produced over 95% of
                Sri Lanka's CIMA prize winners over the past decade, including multiple
                global prize winners.
              </p>
              <div className="about-page__stat-row">
                <div className="about-page__stat">
                  <span className="about-page__stat-num">95%+</span>
                  <span className="about-page__stat-label">Prize Winners Produced</span>
                </div>
                <div className="about-page__stat">
                  <span className="about-page__stat-num">21+</span>
                  <span className="about-page__stat-label">Years of Excellence</span>
                </div>
                <div className="about-page__stat">
                  <span className="about-page__stat-num">Global</span>
                  <span className="about-page__stat-label">CIMA Recognition</span>
                </div>
              </div>
            </div>
            <div className="about-page__mission-visual">
              <div className="about-page__mission-card">
                <span className="about-page__mission-icon">🌟</span>
                <h3>Best CIMA Institute in Sri Lanka</h3>
                <p>
                  Recognized for producing the highest number of CIMA prize winners,
                  with students from across South Asia, Southeast Asia, and the GCC.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sub-page cards */}
      <section className="about-page__cards-section">
        <div className="about-page__container">
          <h2 className="about-page__section-title">Explore More About Us</h2>
          <div className="about-page__cards">
            {ABOUT_CARDS.map((card) => (
              <Link key={card.to} to={card.to} className="about-card">
                <div className="about-card__emoji">{card.emoji}</div>
                <h3 className="about-card__title">{card.title}</h3>
                <p className="about-card__desc">{card.description}</p>
                <span className="about-card__cta">
                  {card.cta} <span>→</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="about-page__values">
        <div className="about-page__container">
          <h2 className="about-page__section-title about-page__section-title--light">
            Our Core Values
          </h2>
          <div className="about-page__values-grid">
            {[
              { icon: '🎯', title: 'Excellence', text: 'We hold ourselves to the highest academic and professional standards in every session.' },
              { icon: '🤝', title: 'Personalization', text: '1-to-1 attention ensures every student is supported throughout their learning journey.' },
              { icon: '💡', title: 'Innovation', text: 'Our LMS, exam engine, and teaching methods evolve with the needs of modern learners.' },
              { icon: '🌍', title: 'Global Reach', text: 'Students from Sri Lanka, Malaysia, UAE, Oman and beyond trust Nanaska to prepare them.' },
            ].map((v) => (
              <div key={v.title} className="about-value-card">
                <span className="about-value-card__icon">{v.icon}</span>
                <h4>{v.title}</h4>
                <p>{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
