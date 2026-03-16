import { useRef } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import './About.css';

export default function About() {
  const sectionRef = useRef(null);
  useScrollReveal(sectionRef);

  return (
    <section className="about" id="about" ref={sectionRef}>
      {/* Full-bleed background image with overlay */}
      <div className="about__bg" aria-hidden="true" />

      <div className="about__inner">
        {/* Left column – enroll CTA */}
        <div className="about__col about__col--enroll" data-reveal="left">
          <span className="about__eyebrow">Latest Batch Now Open</span>
          <h2 className="about__title">Start Your CIMA Journey Today</h2>
          <p className="about__body">
            Enrol in our next intake and join thousands of students who have
            already transformed their finance careers with Nanaska. Expert
            tutors, flexible schedules, and a proven track record of success.
          </p>
          <a href="#register" className="about__btn">Enrol Now</a>
        </div>

        {/* Middle column – intentionally empty for spacious layout */}
        <div className="about__col about__col--empty" aria-hidden="true" />

        {/* Right column – stats + testimonial */}
        <div className="about__col about__col--stats" data-reveal="right">
          <div className="about__metrics">
            {[
              { number: '5,000+', label: 'Graduates' },
              { number: '15+',    label: 'Years Experience' },
              { number: '20+',    label: 'Countries' },
            ].map(({ number, label }) => (
              <div key={label} className="about__metric">
                <span className="about__metric-number">{number}</span>
                <span className="about__metric-label">{label}</span>
              </div>
            ))}
          </div>

          <blockquote className="about__quote">
            <p className="about__quote-text">
              &ldquo;Nanaska gave me the skills and confidence to pass all my CIMA
              exams first time. The support is truly world-class.&rdquo;
            </p>
            <footer className="about__quote-footer">— Sarah K., CGMA</footer>
          </blockquote>
        </div>
      </div>
    </section>
  );
}
