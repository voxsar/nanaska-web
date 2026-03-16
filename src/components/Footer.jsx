import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const SOCIAL_LINKS = [
  { label: 'Facebook', href: 'https://www.facebook.com/LearnCIMA', initial: 'f' },
  { label: 'Instagram', href: 'https://www.instagram.com/nanaska__/', initial: 'in' },
  { label: 'Twitter', href: 'https://twitter.com/learn_cima', initial: 't' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/72011696/', initial: 'li' },
];

const LEARN_MORE_LINKS = [
  { label: 'Online Exams', href: 'https://exam.nanaska.com/index.php?r=site/login', external: true },
  { label: 'Course Structure', href: '#courses', external: false },
  { label: 'Levels & Categories', href: '#courses', external: false },
  { label: 'Terms and Conditions', href: 'https://www.nanaska.com/terms-and-conditions/', external: true },
  { label: 'Privacy Policy', href: 'https://www.nanaska.com/privacy-policy/', external: true },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="footer" id="contact">
      <div className="footer__main">
        <div className="footer__container">

          {/* Brand column */}
          <div className="footer__brand">
            <Link to="/" className="footer__logo">
              <span className="footer__logo-nanaska">NAN</span>
              <span className="footer__logo-accent">ASKA</span>
            </Link>

            <p className="footer__tagline">
              Join with the best CIMA study partner with inspirational individual support!
            </p>

            <div className="footer__social">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  className="footer__social-link"
                  aria-label={s.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {s.initial}
                </a>
              ))}
            </div>

            <img
              src="https://www.nanaska.com/wp-content/uploads/2023/02/secure-payments-logos-v2-1-2048x826.png"
              alt="Secure payment logos"
              className="footer__payments-img"
              loading="lazy"
            />

            <p className="footer__copyright">
              © Copyright 2022 - Artslab Creatives - All Rights Reserved
            </p>
          </div>

          {/* Get In Touch */}
          <div className="footer__col">
            <h4 className="footer__col-heading">GET IN TOUCH</h4>

            <div className="footer__contact-item">
              <span className="footer__contact-icon">📍</span>
              <p>
                331 Galle Rd,<br />
                Colombo 00300<br />
                Sri Lanka
              </p>
            </div>

            <div className="footer__contact-item">
              <span className="footer__contact-icon">📞</span>
              <p>
                (+94) 0774997338<br />
                (+94) 0773669817<br />
                (+94) 0112575016
              </p>
            </div>

            <div className="footer__contact-item">
              <span className="footer__contact-icon">✉</span>
              <a href="mailto:info@nanaska.com" className="footer__col-link">
                info@nanaska.com
              </a>
            </div>
          </div>

          {/* Learn More */}
          <div className="footer__col">
            <h4 className="footer__col-heading">LEARN MORE</h4>

            <ul className="footer__col-links">
              {LEARN_MORE_LINKS.map((link) => (
                <li key={link.label}>
                  {link.external ? (
                    <a
                      href={link.href}
                      className="footer__col-link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <a href={link.href} className="footer__col-link">
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Subscribe */}
          <div className="footer__col">
            <h4 className="footer__col-heading">SUBSCRIBE NOW</h4>

            <p className="footer__subscribe-text">
              Subscribe for free CIMA study materials
            </p>

            {subscribed ? (
              <p className="footer__subscribe-success">
                ✓ Thank you for subscribing!
              </p>
            ) : (
              <form
                className="footer__subscribe-form"
                onSubmit={handleSubscribe}
              >
                <input
                  type="email"
                  className="footer__subscribe-input"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <button
                  type="submit"
                  className="footer__subscribe-btn"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>

        </div>
      </div>

      <div className="footer__bottom">
        <div className="footer__bottom-inner">

          <p className="footer__copy">
            © {new Date().getFullYear()} Nanaska. All rights reserved.
          </p>

          <div className="footer__legal">
            <a
              href="https://www.nanaska.com/terms-and-conditions/"
              className="footer__legal-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Terms & Conditions
            </a>

            <a
              href="https://www.nanaska.com/privacy-policy/"
              className="footer__legal-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy Policy
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
}