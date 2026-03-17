import { useState, useRef } from 'react';
import FunnelHeader from '../components/FunnelHeader';
import { useSEO } from '../hooks/useSEO';
import { useScrollReveal } from '../hooks/useScrollReveal';
import './CaseStudyPage.css';

/* ─── Data ────────────────────────────────────────────────────── */

const SPECIALISTS = [
  {
    name: 'Channa Gunawardena',
    quals: 'MBA, FCA, FCMA, BSC First Class, CIMA Case Study Specialist',
    img: 'https://www.nanaska.com/wp-content/uploads/2023/09/Group-274.png',
    bio: 'Mr. Channa is the founder and lead lecturer at Nanaska with more than two decades of experience in teaching and currently serving as the CEO of a public listed company in Sri Lanka. His hands-on expertise makes him one of the best case study experts when it comes to CIMA, with over 95% of CIMA Sri Lankan prize winners including global prize winners during the last decade along with overseas prize winners in Ghana, UAE, Malaysia and UK. He is also a member of the CIMA Global Council.',
  },
  {
    name: 'Mark Gunathilake',
    quals: 'BSc Hons., USJ, ACMA, CGMA, CIMA SCS Prize Winner',
    img: 'https://www.nanaska.com/wp-content/uploads/2023/09/Group-303.png',
    bio: 'Meet our renowned lecturer Mark Gunathilake, a Sri Lankan Prize Winner for the Strategic Case Study Examination of CIMA (UK). He has over 5 years of valuable experience in the business sectors of Manufacturing, Transportation, and Retail. Starting his career at one of the Big 4 audit firms, he has gained extensive knowledge and expertise in finance, risk, project management and operations.',
  },
];

const CASE_STUDIES = [
  {
    code: 'OCS',
    title: 'Operational Case Study',
    award: 'CIMA Diploma in Management Accounting (CIMA Dip MA)',
    subjects: ['E1 — Managing Finance in a Digital World', 'P1 — Management Accounting', 'F1 — Financial Reporting'],
    icon: '🧩',
    color: '#16a34a',
  },
  {
    code: 'MCS',
    title: 'Management Case Study',
    award: 'CIMA Advanced Diploma in Management Accounting (CIMA Adv Dip MA)',
    subjects: ['E2 — Managing Performance', 'P2 — Advanced Management Accounting', 'F2 — Advanced Financial Reporting'],
    icon: '📅',
    color: '#2563eb',
  },
  {
    code: 'SCS',
    title: 'Strategic Case Study',
    award: 'Membership of CIMA (ACMA/FCMA) and the CGMA designation',
    subjects: ['E3 — Strategic Management', 'P3 — Risk Management', 'F3 — Financial Management'],
    icon: '⏱',
    color: '#7c3aed',
  },
];

const COURSE_OUTLINE = [
  'Know your pre-seen',
  'Know your industry',
  'Power mock / financial mock',
  'Reality mocks in exam engine',
  'Ground rules',
  'Deep dive',
  'Refresh theory',
  'Insights by industry experts',
  'One-to-one discussions',
  'Possible issues & revisions',
];

const PRIZE_WINNERS = [
  { name: 'Shamini Devee Saygaran', award: "SCS CIMA Southeast Asia's 21 Prize Winner", img: 'https://www.nanaska.com/wp-content/uploads/2023/08/Ellipse-14.png' },
  { name: 'Sashika Wijesiri', award: "Gateway Nov'21 Sri Lanka Prize Winner", img: 'https://www.nanaska.com/wp-content/uploads/2023/08/Ellipse-14-1.png' },
  { name: 'Sanara Manamperi', award: "SCS Nov'21 Sri Lanka Prize Winner", img: 'https://www.nanaska.com/wp-content/uploads/2023/08/Ellipse-14-1-1.png' },
  { name: 'Randi Vithanagamage', award: "CIMA SCS Aug'22 Sri Lanka Prize Winner", img: 'https://www.nanaska.com/wp-content/uploads/2023/08/Ellipse-14-2.png' },
  { name: 'Lakshika Kalubowila', award: "MCS Nov'20 Gateway Prize Winner", img: 'https://www.nanaska.com/wp-content/uploads/2023/08/Ellipse-14-3.png' },
  { name: 'Marco Arletti', award: "MCS Feb'20 Prize Winner", img: 'https://www.nanaska.com/wp-content/uploads/2023/08/Ellipse-14-4.png' },
  { name: 'Luong Thi Thuy Linh', award: "SCS Nov'20 Prize Winner", img: 'https://www.nanaska.com/wp-content/uploads/2023/08/Ellipse-14-5.png' },
  { name: 'Saman Edirimannage', award: "CIMA Gateway Exam Aug'20 Joint Prize Winner", img: 'https://www.nanaska.com/wp-content/uploads/2023/08/Ellipse-14-6.png' },
  { name: 'Tharanga Ileperuma', award: "MCS MAY'21 GATEWAY PRIZE WINNER", img: 'https://www.nanaska.com/wp-content/uploads/2023/08/Ellipse-14-7.png' },
  { name: 'Thilan Darmarathne', award: "MCS MAY'21 GATEWAY PRIZE WINNER", img: 'https://www.nanaska.com/wp-content/uploads/2023/08/Ellipse-14-8.png' },
  { name: 'Nimesh Jayawardana', award: "SCS Nov'20 Joint Prize Winner", img: 'https://www.nanaska.com/wp-content/uploads/2023/08/Ellipse-14-9.png' },
  { name: 'Hassan Ariff', award: "SCS Aug'20 Joint Prize Winner", img: 'https://www.nanaska.com/wp-content/uploads/2023/08/Ellipse-14-10.png' },
  { name: 'Hasitha Wanniarachchi', award: "MCS MAY'21 GATEWAY PRIZE WINNER", img: 'https://www.nanaska.com/wp-content/uploads/2023/08/Ellipse-14-11.png' },
  { name: 'Chinthaka Abeydeera', award: "SCS Nov'20 Joint Prize Winner", img: 'https://www.nanaska.com/wp-content/uploads/2023/08/Ellipse-14-12.png' },
];

const TESTIMONIALS = [
  {
    name: 'Luong Thi Thuy Linh',
    role: 'Strategic Case Study (Prize Winner)',
    img: 'https://www.nanaska.com/wp-content/uploads/2023/09/Rectangle-8.png',
    quote: 'I am very grateful for what Nanaska had prepared for my Strategic Case Study exam. Thank you, Mr. Channa and Nanaska team for the inspiring lectures, the comprehensive and unique learning materials as well as the one-to-one coaching sessions after each mock exam.',
  },
  {
    name: 'Thisal Liyanage',
    role: 'SCS – May 23 · 106 Marks',
    img: 'https://www.nanaska.com/wp-content/uploads/2023/09/Rectangle-8-2.png',
    quote: 'CIMA finance leadership program allowed me to step into the prestigious CIMA qualification with fewer exams. Most importantly FLP helps us to face exams while continuing our professional work. Furthermore, flexibility from Nanaska team on tutoring and pre-preparations for the exams helped me a lot to get through the final case study easily.',
  },
  {
    name: 'Piyumi Divyanjali',
    role: 'SCS – May 23 · 103 Marks',
    img: 'https://www.nanaska.com/wp-content/uploads/2023/09/Rectangle-8-3.png',
    quote: 'I appreciate the enormous support offered by Nanaska team for me to pass the Strategic Level Case Study with a good score. The holistic approach followed by Channa Sir and staff while giving personal attention to each student was very helpful and one of the fundamental reasons behind my success.',
  },
  {
    name: 'Fathima Shifara',
    role: 'OCS – May 23 · 97 Marks',
    img: 'https://www.nanaska.com/wp-content/uploads/2023/09/Rectangle-8-5.png',
    quote: 'Thank you for all the support and extra efforts given to pass the exam.',
  },
  {
    name: 'Eugene Akorli',
    role: 'OCS – May 23 · 93 Marks',
    img: 'https://www.nanaska.com/wp-content/uploads/2023/09/Rectangle-8-4.png',
    quote: 'The teaching methods used by Nanaska helped me believe that if I put in the required effort I could achieve the result I wanted. The responsiveness and dedication of the team at Nanaska proved really valuable and made me feel that I had all the support I needed to pass the exam.',
  },
];

const REGISTER_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSecF74xq478TiPPJsg4P4EG2DoIWzv8pDVyaSCzF-hvFSvjiQ/viewform';

/* ─── Component ───────────────────────────────────────────────── */

export default function CaseStudyPage() {
  const pageRef = useRef(null);
  const [testimonyIdx, setTestimonyIdx] = useState(0);
  const [activeSpecialist, setActiveSpecialist] = useState(0);

  useSEO({
    title: 'CIMA Case Study — Nanaska',
    description:
      "Kickstart your CIMA Case Study journey at Nanaska. Expert lecturers, live sessions, personalised support for OCS, MCS and SCS. Sri Lanka's leading CIMA case study provider with 95%+ prize winner success rate.",
    keywords: 'CIMA Case Study, OCS, MCS, SCS, Nanaska, CIMA Sri Lanka, case study specialist, prize winners',
    ogImage: 'https://www.nanaska.com/wp-content/uploads/2023/09/Akka-1.png',
    canonical: 'https://www.nanaska.com/case-study/',
  });

  useScrollReveal(pageRef);

  const prevTestimony = () => setTestimonyIdx((i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  const nextTestimony = () => setTestimonyIdx((i) => (i + 1) % TESTIMONIALS.length);

  return (
    <div className="cs-page" ref={pageRef}>
      <FunnelHeader ctaText="Start Your Journey" ctaHref={REGISTER_URL} />

      {/* ── Hero ── */}
      <section className="cs-hero">
        <div className="cs-hero__overlay" />
        <div className="cs-hero__inner" data-reveal>
          <span className="cs-hero__eyebrow">CIMA Case Study Programme</span>
          <h1 className="cs-hero__title">
            Are you still wondering where to start your<br />
            <span className="cs-hero__hl">Case Study Journey?</span>
          </h1>
          <p className="cs-hero__sub">
            At Nanaska, we provide a structured path through all Operational, Management, and Strategic
            Level Case Study courses — guided by award-winning specialists.
          </p>
          <a href={REGISTER_URL} className="cs-btn cs-btn--primary" target="_blank" rel="noopener noreferrer">
            Start Your Case Study Journey →
          </a>
        </div>
        <div className="cs-hero__img-col" data-reveal>
          <img
            src="https://www.nanaska.com/wp-content/uploads/2023/09/Akka-1.png"
            alt="Professional woman representing Nanaska lecturers"
            loading="eager"
          />
        </div>
        <div className="cs-hero__wave">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
            <path fill="#f5f8fc" d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" />
          </svg>
        </div>
      </section>

      {/* ── Why Nanaska for Case Study ── */}
      <section className="cs-why" id="why">
        <div className="cs-container">
          <h2 className="cs-section-title" data-reveal>Why Nanaska for Case Study?</h2>
          <p className="cs-section-sub" data-reveal>Our programme offers exceptional support for your success</p>
          <div className="cs-why__grid">
            {[
              {
                icon: 'https://www.nanaska.com/wp-content/uploads/2023/09/user-time-1.png',
                alt: 'Time icon',
                title: '24/7 Service',
                desc: 'Round-the-clock support and resources so you can study at your own pace, any time.',
              },
              {
                icon: 'https://www.nanaska.com/wp-content/uploads/2023/09/address-book-1.png',
                alt: 'Address book icon',
                title: 'Live Sessions',
                desc: 'Free live classes covering both competencies and case studies, with recordings for missed sessions.',
              },
              {
                icon: 'https://www.nanaska.com/wp-content/uploads/2023/09/calendar-clock-1.png',
                alt: 'Calendar icon',
                title: 'Flexible Timetable',
                desc: 'Adapt your learning schedule to your lifestyle with our flexible, student-friendly timetable.',
              },
            ].map((f) => (
              <div key={f.title} className="cs-feature-card" data-reveal>
                <img src={f.icon} alt={f.alt} className="cs-feature-card__icon" />
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
          <div className="cs-why__body" data-reveal>
            <div className="cs-why__text">
              <p>
                Our programme is designed to maximise student outcomes by providing exceptional support at
                every stage of the CIMA case study journey. Despite limited class sizes, we prioritise
                personalised guidance to ensure every student receives tailored attention throughout their
                preparation.
              </p>
              <p>
                Students benefit from free live classes covering both competencies and case studies, with
                recordings available for any missed sessions. Continuous follow-up on progress, along with
                an active WhatsApp group, allows for sharing valuable exam tips, industry updates, and
                peer interaction.
              </p>
              <p>
                Nanaska is committed to making quality education accessible, offering competitive tuition
                fees with transparent pricing for all levels. Our live sessions are highly interactive,
                combining theory, practical application, and mock exam practice.
              </p>
            </div>
            <div className="cs-why__action">
              <img src="https://www.nanaska.com/wp-content/uploads/2023/09/Group-301-1.png" alt="Students attending Nanaska CIMA classes" loading="lazy" />
              <a href={REGISTER_URL} className="cs-btn cs-btn--primary" target="_blank" rel="noopener noreferrer">Register Now</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Case Study Specialists ── */}
      <section className="cs-specialists" id="specialists">
        <div className="cs-container">
          <h2 className="cs-section-title cs-section-title--white" data-reveal>Our Case Study Specialists</h2>
          <div className="cs-spec-tabs" data-reveal>
            {SPECIALISTS.map((s, i) => (
              <button
                key={s.name}
                className={`cs-spec-tab ${activeSpecialist === i ? 'cs-spec-tab--active' : ''}`}
                onClick={() => setActiveSpecialist(i)}
              >
                {s.name}
              </button>
            ))}
          </div>
          <div className="cs-spec-panel" data-reveal>
            <div className="cs-spec-panel__img">
              <img
                src={SPECIALISTS[activeSpecialist].img}
                alt={SPECIALISTS[activeSpecialist].name}
                loading="lazy"
              />
            </div>
            <div className="cs-spec-panel__body">
              <h3 className="cs-spec-panel__name">{SPECIALISTS[activeSpecialist].name}</h3>
              <p className="cs-spec-panel__quals">{SPECIALISTS[activeSpecialist].quals}</p>
              <p className="cs-spec-panel__bio">{SPECIALISTS[activeSpecialist].bio}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Case Study Structure ── */}
      <section className="cs-structure" id="structure">
        <div className="cs-container">
          <h2 className="cs-section-title" data-reveal>Case Study Structure</h2>
          <div className="cs-structure__grid">
            {CASE_STUDIES.map((cs) => (
              <div key={cs.code} className="cs-struct-card" style={{ '--cs-color': cs.color }} data-reveal>
                <div className="cs-struct-card__header">
                  <span className="cs-struct-card__icon">{cs.icon}</span>
                  <div>
                    <span className="cs-struct-card__code">{cs.code}</span>
                    <h3>{cs.title}</h3>
                  </div>
                </div>
                <p className="cs-struct-card__award">🏆 {cs.award}</p>
                <ul className="cs-struct-card__subjects">
                  {cs.subjects.map((s) => (
                    <li key={s}>
                      <span className="cs-struct-card__check">✓</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Course Outline ── */}
      <section className="cs-outline" id="outline">
        <div className="cs-container">
          <div className="cs-outline__inner">
            <div className="cs-outline__text" data-reveal>
              <h2 className="cs-section-title cs-section-title--left cs-section-title--white">
                Case Study Course Outline
              </h2>
              <p className="cs-section-sub cs-section-sub--left cs-section-sub--white">
                Our proven 10-step methodology for case study mastery
              </p>
              <ol className="cs-outline__list">
                {COURSE_OUTLINE.map((step, i) => (
                  <li key={i}>
                    <span className="cs-outline__num">{String(i + 1).padStart(2, '0')}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
              <a href={REGISTER_URL} className="cs-btn cs-btn--outline-light" target="_blank" rel="noopener noreferrer">
                Register Now →
              </a>
            </div>
            <div className="cs-outline__img" data-reveal>
              <img
                src="https://www.nanaska.com/wp-content/uploads/2023/09/Ayiyaa.png"
                alt="Professional man representing Nanaska lecturers"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Prize Winners ── */}
      <section className="cs-winners" id="winners">
        <div className="cs-container">
          <h2 className="cs-section-title" data-reveal>Nanaska Prize Winners</h2>
          <p className="cs-section-sub" data-reveal>
            Over 95% of CIMA Sri Lankan prize winners during the last decade
          </p>
          <div className="cs-winners__track-wrap" data-reveal>
            <div className="cs-winners__track">
              {[...PRIZE_WINNERS, ...PRIZE_WINNERS].map((w, i) => (
                <div key={i} className="cs-winner-card">
                  <img src={w.img} alt={w.name} loading="lazy" />
                  <p className="cs-winner-card__name">{w.name}</p>
                  <p className="cs-winner-card__award">{w.award}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="cs-testimonials" id="testimonials">
        <div className="cs-container">
          <h2 className="cs-section-title cs-section-title--white" data-reveal>Student Testimonials</h2>
          <div className="cs-testimonials__slider" data-reveal>
            <button className="cs-testi-arrow cs-testi-arrow--prev" onClick={prevTestimony} aria-label="Previous">‹</button>
            <div className="cs-testi-card">
              <img src={TESTIMONIALS[testimonyIdx].img} alt={TESTIMONIALS[testimonyIdx].name} loading="lazy" />
              <div className="cs-testi-card__body">
                <div className="cs-testi-card__quote">&ldquo;</div>
                <p className="cs-testi-card__text">{TESTIMONIALS[testimonyIdx].quote}</p>
                <div className="cs-testi-card__author">
                  <strong>{TESTIMONIALS[testimonyIdx].name}</strong>
                  <span>{TESTIMONIALS[testimonyIdx].role}</span>
                </div>
              </div>
            </div>
            <button className="cs-testi-arrow cs-testi-arrow--next" onClick={nextTestimony} aria-label="Next">›</button>
          </div>
          <div className="cs-testi-dots">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                className={`cs-dot ${i === testimonyIdx ? 'cs-dot--active' : ''}`}
                onClick={() => setTestimonyIdx(i)}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Register CTA ── */}
      <section className="cs-register" id="register">
        <div className="cs-container">
          <div className="cs-register__box" data-reveal>
            <h2>Ready to Ace Your Case Study?</h2>
            <p>
              Join hundreds of successful CIMA students guided by Nanaska&apos;s award-winning specialists.
              Register today and secure your spot.
            </p>
            <a href={REGISTER_URL} className="cs-btn cs-btn--primary cs-btn--lg" target="_blank" rel="noopener noreferrer">
              Register Now →
            </a>
          </div>
        </div>
      </section>

      {/* ── Funnel Footer ── */}
      <footer className="cs-footer">
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
