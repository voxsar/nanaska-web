import { useRef } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import './Features.css';

const FEATURES = [
  {
    icon: '🎯',
    title: 'Personalised Tutoring',
    body: 'One-to-one guidance tailored to your learning pace, strengths, and goals. Our expert tutors adapt their approach to ensure you truly understand every concept.',
    img: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=480&q=80',
    alt: 'Personalised tutoring session',
  },
  {
    icon: '💻',
    title: 'Online & On-site Classes',
    body: 'Flexible learning options so you can study where and how it suits you. Live online sessions, recorded lectures, and face-to-face classes at our centres.',
    img: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=480&q=80',
    alt: 'Online learning on laptop',
  },
  {
    icon: '📚',
    title: 'Comprehensive Study Materials',
    body: 'Expertly crafted notes, mock exams, and revision packs aligned with the latest CIMA syllabus. Everything you need to prepare with confidence.',
    img: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=480&q=80',
    alt: 'Study materials and books',
  },
  {
    icon: '🤝',
    title: 'Dedicated Student Support',
    body: 'From enrolment to exam day, our student support team is with you every step of the way — answering questions, tracking progress, and keeping you motivated.',
    img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=480&q=80',
    alt: 'Dedicated student support team',
  },
];

export default function Features() {
  const sectionRef = useRef(null);
  useScrollReveal(sectionRef);

  return (
    <section className="features" id="features" ref={sectionRef}>
      <div className="features__inner">
        <div className="features__header" data-reveal="fade">
          <span className="features__eyebrow">Why Choose Nanaska</span>
          <h2 className="features__title">World-Class CIMA Tuition, Built Around You</h2>
          <p className="features__subtitle">
            We combine expert instruction with flexible delivery and unwavering student support
            to give you the best possible chance of exam success.
          </p>
        </div>

        <div className="features__grid" data-reveal-stagger>
          {FEATURES.map(({ icon, title, body, img, alt }) => (
            <div key={title} className="features__card">
              <div className="features__card-img-wrap">
                <img src={img} alt={alt} className="features__card-img" loading="lazy" />
              </div>
              <div className="features__card-body">
                <span className="features__card-icon">{icon}</span>
                <h3 className="features__card-title">{title}</h3>
                <p className="features__card-text">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
