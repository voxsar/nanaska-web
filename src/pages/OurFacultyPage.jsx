import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useScrollReveal } from '../hooks/useScrollReveal';
import './OurFacultyPage.css';

const FACULTY = [
  {
    id: 'channa',
    name: 'Channa Gunawardana',
    credentials: 'MBA, FCA, FCMA, BSc First Class',
    role: 'CEO & Lead Lecturer — CIMA Case Study Specialist',
    img: 'https://www.nanaska.com/wp-content/uploads/2021/04/Channa.png',
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
    role: 'Lecturer — F2 & BA3',
    img: 'https://www.nanaska.com/wp-content/uploads/2024/06/Shervin_Perera-removebg-preview.png',
    bio: 'Shervin Perera holds impressive credentials including ACMA (UK), CGMA, and an MBA from the University of Southampton. His extensive expertise in management accounting and business analysis is invaluable as he teaches the F2 and BA3 subjects at Nanaska.',
    tag: '📈 F2 & BA3',
  },
  {
    id: 'mark',
    name: 'Mark Gunathilake',
    credentials: 'B.Sc. Hons (USJ), ACMA, CGMA (SCS Prize Winner)',
    role: 'Lecturer — P2, OCS & BA2',
    img: 'https://www.nanaska.com/wp-content/uploads/2025/01/Untitled-design-11.png',
    bio: 'Mark Gunathilake is an ACMA, CGMA professional and a former CIMA Strategic Case Study Prize Winner. He also holds a 1st Class Bachelor\'s Degree in Accountancy from USJ and brings experience from one of the Big 4 audit firms. He is the P2, OCS and BA2 lecturer at Nanaska.',
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
  {
    id: 'lasantha',
    name: 'Lasantha Vidanagamage',
    credentials: 'CIMA Passed Finalist, MPAcc (USJ), BPharm (USJ)',
    role: 'Lecturer — P2 Advanced Management Accounting',
    img: 'https://www.nanaska.com/wp-content/uploads/2024/07/441312389_467371879000666_851286037044610417_n-copy-1.png',
    bio: 'Lasantha Vidanagamage is a CIMA pass finalist and holds both a Master of Professional Accounting (MPAcc) and a Bachelor of Pharmacy (BPharm) from the University of Sri Jayewardenepura. His diverse academic background and extensive expertise in management accounting provide students with a comprehensive and practical learning experience.',
    tag: '📋 P2',
  },
  {
    id: 'sanuda',
    name: 'Sanuda Minuraka',
    credentials: 'BSc Hons 1st Class Accounting & Finance (Plymouth University UK), CIMA Passed Finalist',
    role: 'Lecturer — BA1',
    img: 'https://www.nanaska.com/wp-content/uploads/2025/01/Untitled-design-12.png',
    bio: 'Sanuda Minuraka holds a First-Class Honours degree in Accounting & Finance from Plymouth University, UK, reflecting his academic excellence and in-depth knowledge of the field. As a CIMA Passed Finalist, Sanuda combines his strong theoretical foundation with practical insights into management accounting, making his teaching highly engaging and relevant to real-world applications.',
    tag: '🎓 BA1',
  },
  {
    id: 'janith',
    name: 'Janith Jayasinghe',
    credentials: 'LB (Hons), Affiliate CIPM, Attorney-at-Law, Notary Public, Commissioner for Oaths, Company Secretary',
    role: 'Lecturer — Law, Ethics & HRM',
    img: 'https://www.nanaska.com/wp-content/uploads/2025/01/Untitled-design-15.png',
    bio: 'Janith Jayasinghe is a multifaceted professional excelling in both the legal and human resources domains. Holding an LB (Hons) degree and a Professional Qualification in HRM from CIPM, he is an Attorney-at-Law, Notary Public, Commissioner for Oaths, and a Company Secretary. As an Affiliate CIPM, Janith brings a unique blend of legal expertise and HR management proficiency, making him a well-rounded professional in his field.',
    tag: '⚖️ Law & HRM',
  },
  {
    id: 'ali',
    name: 'Ali Raheem',
    credentials: 'BSc USJ (UG), CIMA Exams Complete',
    role: 'Lecturer — BA2',
    img: 'https://www.nanaska.com/wp-content/uploads/2025/01/Untitled-design-13.png',
    bio: "Ali Raheem is a CIMA passed finalist, having completed the qualification within a span of 2 years. He is a product of St. Peter's College, Colombo and is currently an Undergraduate at the University of Sri Jayewardenepura. Ali has been an assistant lecturer at Nanaska since 2019 and he is the BA2 lecturer at Nanaska.",
    tag: '📗 BA2',
  },
];

export default function OurFacultyPage() {
  const [active, setActive] = useState(null);
  const pageRef = useRef(null);
  useScrollReveal(pageRef);

  return (
    <div className="faculty-page" ref={pageRef}>
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
          <div className="faculty-grid" data-reveal-stagger>
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
        <div className="faculty-page__container faculty-page__cta-inner" data-reveal="fade">
          <h2>Ready to start your CIMA journey?</h2>
          <p>Learn from Sri Lanka&apos;s best — register today and get expert guidance every step of the way.</p>
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
