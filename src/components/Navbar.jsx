import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  {
    label: 'About Us',
    to: '/about',
    dropdown: [
      { label: 'Our Faculty', to: '/our-faculty' },
      { label: 'Our Specialty', to: '/our-specialty' },
      { label: 'Nanaska Alumni', to: '/nanaska-alumni' },
    ],
  },
  {
    label: 'Courses',
    to: null,
    dropdown: [
      { label: 'Certificate Level', to: '/cima-certificate-level' },
      { label: 'Operational Level', to: '/cima-operational-level' },
      { label: 'Management Level', to: '/cima-management-level' },
      { label: 'Strategic Level', to: '/cima-strategic-level' },
    ],
  },
  { label: 'Testimonials', to: '/#testimonials' },
  { label: 'Blog', to: '/#blog' },
  { label: 'Contact Us', to: '/#contact' },
];

const TOP_LINKS = [
  { label: 'LMS', href: 'https://nanaska.webcolms.com/login' },
  { label: 'Online Exams', href: 'https://exam.nanaska.com/index.php?r=site/login' },
  { label: 'Nanaska Connect', href: '/#connect' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLinkClick = () => {
    setMenuOpen(false);
    setOpenDropdown(null);
  };

  return (
    <header className={`site-header${scrolled ? ' site-header--scrolled' : ''}`}>
      {/* Blue topbar – slides up on scroll */}
      <div className={`topbar${scrolled ? ' topbar--hidden' : ''}`}>
        <div className="topbar__container">
          <ul className="topbar__links">
            {TOP_LINKS.map((link) => (
              <li key={link.label}>
                <a href={link.href} className="topbar__link"
                   target={link.href.startsWith('http') ? '_blank' : undefined}
                   rel="noopener noreferrer"
                   onClick={handleLinkClick}>{link.label}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* White main navbar */}
      <nav className="navbar">
        <div className="navbar__container">
          <Link to="/" className="navbar__logo" onClick={handleLinkClick}>
            <span className="navbar__logo-nanaska">NAN</span>
            <span className="navbar__logo-accent">ASKA</span>
          </Link>

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
                  onMouseEnter={() => setOpenDropdown(link.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  {link.to ? (
                    <Link to={link.to} className="navbar__link" onClick={handleLinkClick}>
                      {link.label} <span className="navbar__caret">▾</span>
                    </Link>
                  ) : (
                    <span className="navbar__link navbar__link--noroute">
                      {link.label} <span className="navbar__caret">▾</span>
                    </span>
                  )}
                  <ul className={`navbar__dropdown ${openDropdown === link.label ? 'navbar__dropdown--visible' : ''}`}>
                    {link.dropdown.map((sub) => (
                      <li key={sub.label}>
                        <Link to={sub.to} className="navbar__dropdown-link" onClick={handleLinkClick}>
                          {sub.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ) : (
                <li key={link.label} className="navbar__item">
                  {link.to.startsWith('/#') ? (
                    <a href={link.to.slice(1)} className="navbar__link" onClick={handleLinkClick}>
                      {link.label}
                    </a>
                  ) : (
                    <Link to={link.to} className="navbar__link" onClick={handleLinkClick}>
                      {link.label}
                    </Link>
                  )}
                </li>
              )
            )}
          </ul>
        </div>
      </nav>
    </header>
  );
}
