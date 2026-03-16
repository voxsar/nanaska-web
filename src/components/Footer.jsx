import './Footer.css';

const FOOTER_LINKS = {
  'Quick Links': [
    { label: 'Home', href: '#home' },
    { label: 'About Us', href: '#about' },
    { label: 'Courses', href: '#courses' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'Blog', href: '#blog' },
    { label: 'Contact Us', href: '#contact-us' },
  ],
  'CIMA Levels': [
    { label: 'Certificate Level', href: '#certificate' },
    { label: 'Operational Level', href: '#operational' },
    { label: 'Management Level', href: '#management' },
    { label: 'Strategic Level', href: '#strategic' },
    { label: 'CGMA FLP', href: '#cgma' },
    { label: 'Case Study', href: '#casestudy' },
  ],
  'Student Resources': [
    { label: 'Online Exams', href: '#exams' },
    { label: 'Course Structure', href: '#structure' },
    { label: 'Student Forum', href: '#forum' },
    { label: 'Nanaska Connect', href: '#connect' },
    { label: 'Registration', href: '#register' },
    { label: 'Login', href: '#login' },
  ],
};

export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="footer__top">
        <div className="footer__container">
          <div className="footer__brand">
            <a href="#home" className="footer__logo">
              <span className="footer__logo-nanaska">NAN</span>
              <span className="footer__logo-accent">ASKA</span>
            </a>
            <p className="footer__tagline">
              Leading CIMA Course Provider — building better leaders for the world.
            </p>
            <div className="footer__contact">
              <p>📧 info@nanaska.com</p>
              <p>📞 +44 (0)20 1234 5678</p>
              <p>📍 London, United Kingdom</p>
            </div>
            <div className="footer__social">
              {['Facebook', 'Twitter', 'LinkedIn', 'YouTube'].map((s) => (
                <a key={s} href="#social" className="footer__social-link" aria-label={s}>
                  {s[0]}
                </a>
              ))}
            </div>
          </div>

          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading} className="footer__col">
              <h4 className="footer__col-heading">{heading}</h4>
              <ul className="footer__col-links">
                {links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="footer__col-link">{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Secure Payments */}
      <div className="footer__payments">
        <div className="footer__payments-inner">
          <p className="footer__payments-label">Secure & Accepted Payment Methods</p>
          <img
            src="https://www.nanaska.com/wp-content/uploads/2023/02/secure-payments-logos-v2-1-2048x826.png"
            alt="Accepted payment methods – Visa, Mastercard, PayPal and more"
            className="footer__payments-img"
            loading="lazy"
          />
        </div>
      </div>

      <div className="footer__bottom">
        <div className="footer__container footer__bottom-inner">
          <p className="footer__copy">
            © {new Date().getFullYear()} Nanaska. All rights reserved.
          </p>
          <div className="footer__legal">
            <a href="#terms" className="footer__legal-link">Terms & Conditions</a>
            <a href="#privacy" className="footer__legal-link">Privacy Policy</a>
            <a href="#cookies" className="footer__legal-link">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
