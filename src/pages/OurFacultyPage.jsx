import { useState } from 'react';
import { Link } from 'react-router-dom';
import './OurFacultyPage.css';

const FACULTY = [
  {
    id: 'channa',
    name: 'Channa Gunawardana',
    credentials: 'MBA, FCA, FCMA, BSc First Class',
    role: 'CEO & Lead Lecturer — CIMA Case Study Specialist',
    img: 'https://www.nanaska.com/wp-content/uploads/2021/03/Lead-Lecturer-home-page-.jpg',
    bio: "Channa Gunawardana serves as the CEO of a public listed company in Sri Lanka and is a Fellow Member of both CIMA UK and CA Sri Lanka. He holds a Bachelor's degree in Accountancy and Financial Management from the University of Sri Jayewardenepura and an MBA in Finance from the University of Southern Queensland, Australia. He is also pursuing a PhD at Management and Science University, Malaysia. With 21+ years of lecturing experience, he is renowned as Sri Lanka's CIMA Case Study Specialist — having produced over 95% of Sri Lanka's CIMA prize winners over the past decade, including global prize winners. He is also a Member of the CIMA Global Council.",
    tag: '🏆 Lead',
  },
  {
    id: 'aloka',
    name: 'Aloka Seneviratne',
    credentials: 'CIMA Passed Finalist, DipM, BSc Hons (Engineering Physics)',
    role: 'E3 Lecturer — Strategic Management',
    img: 'https://www.nanaska.com/wp-content/uploads/2024/07/DSC_0454-Copy-1.png',
    bio: 'Praveen Aloka Seneviratne brings a wealth of knowledge and experience, holding a BSc Hons in Engineering Physics along with credentials as a CIMA Passed Finalist and DipM. His diverse academic background and professional expertise make him a valuable asset to the Nanaska faculty. Aloka lecturers E3 — Strategic Management, combining academic rigour with real-world strategic insights.',
    tag: '📐 E3',
  },
  {
    id: 'indika',
    name: 'Indika Rajakaruna',
    credentials: 'CISA – ISCA (USA), AIB (IBSL), PG Ex.Dip in Bank Mgt (IBSL), Executive MSc in Marketing',
    role: 'P3 Lecturer — Risk Management (Cyber Risk)',
    img: 'https://www.nanaska.com/wp-content/uploads/2021/04/Indika.png',
    bio: 'Indika Rajakaruna is a banker by profession in the Governance, Risk and Control field with over 25 years of exposure in the banking industry. He currently leads a team of audit professionals at a listed bank recognised as both Best Bank and Best Digital Bank in Sri Lanka. He is the First and Only Accredited Trainer in Sri Lanka for the CISA (Certified Information Systems Auditor) by ISACA-USA, and serves as Director for Corporate Relations of ISACA–Sri Lanka Chapter. He covers Cyber Risk within P3 at Nanaska.',
    tag: '🔐 P3',
  },
  {
    id: 'ruchira',
    name: 'Ruchira Perera',
    credentials: 'B.Sc. Accountancy & Financial Management (USJ), First Class MBA (PIM – USJ), ACMA, CPA, FCMA (SL)',
    role: 'F3 Lecturer — Financial Strategy',
    img: 'https://www.nanaska.com/wp-content/uploads/2022/05/ruchi-1.png',
    bio: 'Mr. Ruchira Perera is a graduate of the University of Sri Jayewardenepura with a first class in Accountancy and Financial Management. He holds an MBA from the Postgraduate Institute of Management and is professionally qualified with CPA (Australia), CIMA (UK) and CMA (SL). He has nearly two decades of industry experience in senior roles including CFO and Financial Controller. He is a Governing Council Member of CMA Sri Lanka, a Technical Advisor to SAFA, and is pursuing his Doctorate at Lincoln University College, Malaysia. He lectures F3 at Nanaska.',
    tag: '📊 F3',
  },
  {
    id: 'shervin',
    name: 'Shervin Perera',
    credentials: 'ACMA (UK), CGMA, MBA (UOS)',
    role: 'Lecturer',
    img: 'https://www.nanaska.com/wp-content/uploads/2024/07/IMG_8581-1-copy.png',
    bio: 'Shervin Perera is an ACMA-qualified professional with a CGMA designation and an MBA from the University of Salford, bringing strong analytical and strategic finance skills to the Nanaska faculty.',
    tag: '📈 Lecturer',
  },
  {
    id: 'mark',
    name: 'Mark Gunathilake',
    credentials: 'B.Sc. Hons (USJ), ACMA, CGMA (SCS Prize Winner)',
    role: 'Case Study Lecturer',
    img: 'https://www.nanaska.com/wp-content/uploads/2025/01/Untitled-design-11.png',
    bio: 'Mark Gunathilake is an ACMA, CGMA professional and a former CIMA Strategic Case Study Prize Winner. His first-hand knowledge of excelling in CIMA case study exams gives students a unique practical edge in their preparation at Nanaska.',
    tag: '🥇 SCS Winner',
  },
  {
    id: 'osmand',
    name: 'Osmand Fernando',
    credentials: 'MBA (UK), ACMA, CGMA',
    role: 'Lecturer',
    img: 'https://www.nanaska.com/wp-content/uploads/2024/07/IMG_6966-1copy.png',
    bio: 'Osmand Fernando holds an MBA from the United Kingdom and ACMA/CGMA qualifications, bringing international perspective and professional finance expertise to Nanaska students.',
    tag: '🌐 Lecturer',
  },
];

export default function OurFacultyPage() {
  const [active, setActive] = useState(null);

  return (
    <div className="faculty-page">
      {/* Hero */}
      <section className="faculty-page__hero">
        <div className="faculty-page__hero-inner">
          <span className="faculty-page__breadcrumb">
            <Link to="/">Home</Link> / <Link to="/about">About Us</Link> / Our Faculty
          </span>
          <h1>Our Faculty</h1>
          <p>
            A panel of experienced, diversified lecturers — each an industry expert — ensuring
            every Nanaska student thrives in their studies and carries the learnings forward.
          </p>
        </div>
        <div className="faculty-page__hero-wave">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
            <path fill="#f9fbff" d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z"/>
          </svg>
        </div>
      </section>

      {/* Faculty Grid */}
      <section className="faculty-page__grid-section">
        <div className="faculty-page__container">
          <div className="faculty-grid">
            {FACULTY.map((member) => (
              <div
                key={member.id}
                className={`faculty-card ${active === member.id ? 'faculty-card--active' : ''}`}
                onClick={() => setActive(active === member.id ? null : member.id)}
              >
                <div className="faculty-card__img-wrap">
                  <img src={member.img} alt={member.name} className="faculty-card__img" />
                  <span className="faculty-card__tag">{member.tag}</span>
                </div>
                <div className="faculty-card__body">
                  <h3 className="faculty-card__name">{member.name}</h3>
                  <p className="faculty-card__creds">{member.credentials}</p>
                  <p className="faculty-card__role">{member.role}</p>
                  <button className="faculty-card__toggle">
                    {active === member.id ? '▲ Hide bio' : '▼ Read bio'}
                  </button>
                  {active === member.id && (
                    <p className="faculty-card__bio">{member.bio}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="faculty-page__cta">
        <div className="faculty-page__container faculty-page__cta-inner">
          <h2>Ready to start your CIMA journey?</h2>
          <p>Learn from Sri Lanka's best — register today and get expert guidance every step of the way.</p>
          <a
            href="https://www.nanaska.com/onboarding/courses/gather/students/registration/begin/entry/"
            className="faculty-page__cta-btn"
            target="_blank"
            rel="noopener noreferrer"
          >
            Register Now
          </a>
        </div>
      </section>
    </div>
  );
}
