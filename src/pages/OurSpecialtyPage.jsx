import { Link } from 'react-router-dom';
import './OurSpecialtyPage.css';

const SPECIALTIES = [
  {
    icon: '👤',
    title: 'Individual Attention',
    description:
      'At Nanaska, recognized as the best CIMA institute in Sri Lanka, our lecturers employ personalized approaches to engage with each student individually. This ensures that every learner\'s doubts are addressed and their understanding is strengthened at every step.',
  },
  {
    icon: '📚',
    title: '24/7 Tutor Support Team',
    description:
      'Our dedicated tutor team is available around the clock to clarify questions and provide guidance, making sure students never feel stuck during their CIMA course journey.',
  },
  {
    icon: '🏢',
    title: 'Industry Experts as Lecturers',
    description:
      'Most of our lecturers actively work in the corporate world, bringing real-life experience into the classroom and helping students understand the practical applications of concepts.',
  },
  {
    icon: '🎓',
    title: 'CIMA Case Study Specialist In-House',
    description:
      'Led by Mr. Channa Gunawardana, a renowned specialist who has produced numerous CIMA prize winners, Nanaska ensures students receive expert guidance for all CIMA case study exams.',
  },
  {
    icon: '👁️',
    title: 'Practical Application of Theory',
    description:
      'Students experience how theory translates into practice, learning to apply concepts rather than just memorizing them — preparing them for real-world business leadership.',
  },
  {
    icon: '📝',
    title: 'Practice Mock Exams',
    description:
      'Nanaska trains students with up to 10 mock exams in a dedicated exam engine, mirroring the actual CIMA exam environment to build confidence and readiness for the real thing.',
  },
];

const PRIZE_WINNERS = [
  {
    name: 'Luong Thi Thuy Linh',
    designation: 'ACMA, CGMA',
    country: 'Malaysia',
    achievement: 'Strategic Case Study, November 2020',
    award: 'Prize Winner',
    img: 'https://www.nanaska.com/wp-content/uploads/2021/06/Luong.png',
  },
  {
    name: 'Marco Arletti',
    designation: 'ACMA, CGMA',
    country: 'UAE (GCC)',
    achievement: 'Management Case Study, February 2020',
    award: 'Prize Winner',
    img: 'https://www.nanaska.com/wp-content/uploads/2021/06/Marco.png',
  },
  {
    name: 'Saman Edirimannage',
    designation: '',
    country: 'Oman (GCC)',
    achievement: 'CIMA Gateway Exam, August 2020',
    award: 'Joint Prize Winner',
    img: 'https://www.nanaska.com/wp-content/uploads/2021/06/Saman.png',
  },
  {
    name: 'Nimesh Jayawardana',
    designation: '',
    country: 'Sri Lanka',
    achievement: 'Strategic Case Study',
    award: 'Joint Prize Winner',
    img: 'https://www.nanaska.com/wp-content/uploads/2021/06/Nimesh.png',
  },
  {
    name: 'Chinthaka Abeydeera',
    designation: '',
    country: 'Sri Lanka',
    achievement: 'Strategic Case Study',
    award: 'Joint Prize Winner',
    img: 'https://www.nanaska.com/wp-content/uploads/2021/06/Chinthaka.png',
  },
  {
    name: 'Lakshika Kalubowila',
    designation: '',
    country: 'Sri Lanka',
    achievement: 'Management Case Study, November 2020 Gateway',
    award: 'Prize Winner',
    img: 'https://www.nanaska.com/wp-content/uploads/2021/06/Lakshika.png',
  },
  {
    name: 'Hassan Ariff',
    designation: '',
    country: 'Sri Lanka',
    achievement: 'Strategic Case Study, August 2020',
    award: 'Prize Winner',
    img: 'https://www.nanaska.com/wp-content/uploads/2021/06/Hassan.png',
  },
];

export default function OurSpecialtyPage() {
  return (
    <div className="specialty-page">
      {/* Hero */}
      <section className="specialty-page__hero">
        <div className="specialty-page__hero-inner">
          <span className="specialty-page__breadcrumb">
            <Link to="/">Home</Link> / <Link to="/about">About Us</Link> / Our Specialty
          </span>
          <h1>Our Specialty</h1>
          <p>
            Discover the unique blend of expert teaching, personal support, and proven
            methodologies that make Nanaska Sri Lanka's top-rated CIMA institute.
          </p>
        </div>
        <div className="specialty-page__hero-wave">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
            <path fill="#f9fbff" d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z"/>
          </svg>
        </div>
      </section>

      {/* Specialties grid */}
      <section className="specialty-page__features">
        <div className="specialty-page__container">
          <h2 className="specialty-page__section-title">What Makes Nanaska Different</h2>
          <div className="specialty-grid">
            {SPECIALTIES.map((s) => (
              <div key={s.title} className="specialty-card">
                <div className="specialty-card__icon">{s.icon}</div>
                <h3 className="specialty-card__title">{s.title}</h3>
                <p className="specialty-card__desc">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats banner */}
      <section className="specialty-page__stats">
        <div className="specialty-page__container">
          <div className="specialty-stats-grid">
            {[
              { num: '95%+', label: 'Sri Lankan CIMA Prize Winners' },
              { num: '10+', label: 'Mock Exams Per Student' },
              { num: '24/7', label: 'Tutor Support' },
              { num: '21+', label: 'Years of Excellence' },
            ].map((stat) => (
              <div key={stat.label} className="specialty-stat">
                <span className="specialty-stat__num">{stat.num}</span>
                <span className="specialty-stat__label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prize Winners */}
      <section className="specialty-page__winners">
        <div className="specialty-page__container">
          <h2 className="specialty-page__section-title">Our Achievements</h2>
          <p className="specialty-page__subtitle">
            A proud record of CIMA prize winners from around the world — a testament to
            the quality of Nanaska's teaching and student support.
          </p>
          <div className="winners-grid">
            {PRIZE_WINNERS.map((w) => (
              <div key={w.name} className="winner-card">
                <div className="winner-card__img-wrap">
                  <img src={w.img} alt={w.name} className="winner-card__img" />
                </div>
                <div className="winner-card__body">
                  <span className="winner-card__badge">🏅 {w.award}</span>
                  <h4 className="winner-card__name">{w.name}</h4>
                  {w.designation && <p className="winner-card__desig">{w.designation}</p>}
                  <p className="winner-card__country">📍 {w.country}</p>
                  <p className="winner-card__exam">{w.achievement}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="specialty-page__cta">
        <div className="specialty-page__container specialty-page__cta-inner">
          <h2>Experience the Nanaska Difference</h2>
          <p>Join thousands of students who chose Nanaska and achieved their CIMA qualification.</p>
          <div className="specialty-page__cta-btns">
            <a
              href="https://www.nanaska.com/onboarding/courses/gather/students/registration/begin/entry/"
              className="specialty-page__btn specialty-page__btn--primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              Register Now
            </a>
            <Link to="/our-faculty" className="specialty-page__btn specialty-page__btn--outline">
              Meet Our Faculty
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
