import { useState, useEffect } from 'react';
import './Navbar.css';

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'About Us', href: '#about' },
  {
    label: 'Courses',
    href: '#courses',
    dropdown: [
      { label: 'Certificate Level', href: '#certificate' },
      { label: 'Operational Level', href: '#operational' },
      { label: 'Management Level', href: '#management' },
      { label: 'Strategic Level', href: '#strategic' },
    ],
  },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'Blog', href: '#blog' },
  { label: 'Contact Us', href: '#contact' },
];

const TOP_LINKS = [
  { label: 'Exam Login', href: '#exam' },
  { label: 'Nanaska Edge', href: '#edge' },
  { label: 'Nanaska Connect', href: '#connect' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`site-header${scrolled ? ' site-header--scrolled' : ''}`}>
      {/* Blue topbar – slides up on scroll */}
      <div className={`topbar${scrolled ? ' topbar--hidden' : ''}`}>
        <div className="topbar__container">
          <ul className="topbar__links">
            {TOP_LINKS.map((link) => (
              <li key={link.label}>
                <a href={link.href} className="topbar__link">{link.label}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* White main navbar */}
      <nav className="navbar">
        <div className="navbar__container">
          <a href="#home" className="navbar__logo">
            <span className="navbar__logo-nanaska">NAN</span>
            <span className="navbar__logo-accent">ASKA</span>
          </a>

          <button
            className={`navbar__hamburger ${menuOpen ? 'open' : ''}`}
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <span />
            <span />
            <span />
          </button>

          <ul className={`navbar__links ${menuOpen ? 'navbar__links--open' : ''}`}>
            {NAV_LINKS.map((link) =>
              link.dropdown ? (
                <li
                  key={link.label}
                  className="navbar__item navbar__item--dropdown"
                  onMouseEnter={() => setDropdownOpen(true)}
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <a href={link.href} className="navbar__link">
                    {link.label} <span className="navbar__caret">▾</span>
                  </a>
                  <ul className={`navbar__dropdown ${dropdownOpen ? 'navbar__dropdown--visible' : ''}`}>
                    {link.dropdown.map((sub) => (
                      <li key={sub.label}>
                        <a href={sub.href} className="navbar__dropdown-link">
                          {sub.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
              ) : (
                <li key={link.label} className="navbar__item">
                  <a href={link.href} className="navbar__link">
                    {link.label}
                  </a>
                </li>
              )
            )}
          </ul>
        </div>
      </nav>
    </header>
  );
}
