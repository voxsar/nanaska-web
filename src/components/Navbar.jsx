import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LEVELS } from '../data/coursesData';
import { useCart } from '../context/CartContext';
import CartDrawer from './CartDrawer';
import './Navbar.css';

const TOP_LINKS = [
  { label: 'LMS', href: 'https://nanaska.webcolms.com/login' },
  { label: 'Online Exams', href: 'https://exam.nanaska.com/index.php?r=site/login' },
  { label: 'Nanaska Connect', href: '/#connect' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [mobileExpanded, setMobileExpanded] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { cartCount } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLinkClick = () => {
    setMenuOpen(false);
    setOpenDropdown(null);
    setOpenSubmenu(null);
    setMobileExpanded(null);
  };

  const NAV_LINKS = [
    { label: 'Home', to: '/' },
    {
      label: 'About Us',
      to: '/about',
      dropdown: [
        { label: 'Our Faculty', to: '/our-faculty' },
        { label: 'Our Specialty', to: '/our-specialty' },
        { label: 'Nanaska Alumni', to: '/nanaska-alumni' },
        { label: 'Our Lecturers', to: '/lecturers' },
      ],
    },
    {
      label: 'Courses',
      to: null,
      dropdown: LEVELS.map(level => ({
        label: level.title.replace('CIMA ', ''),
        to: level.currentPath,
        hasSub: true,
        sub: level.subjects.map(s => ({ label: `${s.code} – ${s.name}`, to: `/${s.slug}` })),
      })),
    },
    { label: 'Testimonials', to: '/#testimonials' },
    { label: 'Blog', to: '/#blog' },
    { label: 'Contact Us', to: '/contact' },
  ];

  return (
    <>
      <header className={`site-header${scrolled ? ' site-header--scrolled' : ''}`}>
        {/* Blue topbar */}
        <div className={`topbar${scrolled ? ' topbar--hidden' : ''}`}>
          <div className="topbar__container">
            <ul className="topbar__links">
              {TOP_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="topbar__link"
                    target={link.href.startsWith('http') ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    onClick={handleLinkClick}
                  >
                    {link.label}
                  </a>
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

            <ul className={`navbar__links ${menuOpen ? 'navbar__links--open' : ''}`}>
              {NAV_LINKS.map((link) =>
                link.dropdown ? (
                  <li
                    key={link.label}
                    className="navbar__item navbar__item--dropdown"
                    onMouseEnter={() => { setOpenDropdown(link.label); setOpenSubmenu(null); }}
                    onMouseLeave={() => { setOpenDropdown(null); setOpenSubmenu(null); }}
                  >
                    {link.to ? (
                      <Link to={link.to} className="navbar__link" onClick={handleLinkClick}>
                        {link.label} <span className="navbar__caret">▾</span>
                      </Link>
                    ) : (
                      <span
                        className="navbar__link navbar__link--noroute"
                        onClick={() => setMobileExpanded(prev => prev === link.label ? null : link.label)}
                      >
                        {link.label} <span className="navbar__caret">▾</span>
                      </span>
                    )}
                    {/* Desktop dropdown */}
                    <ul className={`navbar__dropdown ${openDropdown === link.label ? 'navbar__dropdown--visible' : ''}`}>
                      {link.dropdown.map((sub) => (
                        <li
                          key={sub.label}
                          className={`navbar__dropdown-item${sub.hasSub ? ' navbar__dropdown-item--has-sub' : ''}`}
                          onMouseEnter={() => sub.hasSub && setOpenSubmenu(sub.label)}
                          onMouseLeave={() => sub.hasSub && setOpenSubmenu(null)}
                        >
                          <Link to={sub.to} className="navbar__dropdown-link" onClick={handleLinkClick}>
                            {sub.label}
                            {sub.hasSub && <span className="navbar__sub-caret">▸</span>}
                          </Link>
                          {sub.hasSub && sub.sub && (
                            <ul className={`navbar__submenu${openSubmenu === sub.label ? ' navbar__submenu--visible' : ''}`}>
                              {sub.sub.map(item => (
                                <li key={item.label}>
                                  <Link to={item.to} className="navbar__submenu-link" onClick={handleLinkClick}>
                                    {item.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                    {/* Mobile accordion */}
                    {menuOpen && mobileExpanded === link.label && (
                      <ul className="navbar__mobile-accordion">
                        {link.dropdown.map((sub) => (
                          <li key={sub.label}>
                            <Link to={sub.to} className="navbar__mobile-accordion-link" onClick={handleLinkClick}>
                              {sub.label}
                            </Link>
                            {sub.hasSub && sub.sub && (
                              <ul className="navbar__mobile-sub">
                                {sub.sub.map(item => (
                                  <li key={item.label}>
                                    <Link to={item.to} className="navbar__mobile-sub-link" onClick={handleLinkClick}>
                                      {item.label}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ) : (
                  <li key={link.label} className="navbar__item">
                    {link.to && link.to.startsWith('/#') ? (
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

            <div className="navbar__right">
              <button
                className="navbar__cart-btn"
                onClick={() => setCartOpen(true)}
                aria-label={`Open enrollment cart (${cartCount} items)`}
              >
                🛒
                {cartCount > 0 && (
                  <span className="navbar__cart-count">{cartCount}</span>
                )}
              </button>

              <button
                className={`navbar__hamburger ${menuOpen ? 'open' : ''}`}
                aria-label="Toggle menu"
                onClick={() => setMenuOpen((prev) => !prev)}
              >
                <span />
                <span />
                <span />
              </button>
            </div>
          </div>
        </nav>
      </header>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
