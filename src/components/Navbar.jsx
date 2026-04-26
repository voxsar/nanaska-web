import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LEVELS } from '../data/coursesData';
import { useCart } from '../context/CartContext';
import { useApi } from '../hooks/useApi';
import CartDrawer from './CartDrawer';
import nanaskaLogo from '../assets/nanaska-logo.png';
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
	{ label: 'Testimonials', to: '/testimonials' },
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
	const [openSubmenu, setOpenSubmenu] = useState(null);
	const [mobileExpanded, setMobileExpanded] = useState(null);
	const [mobileSubExpanded, setMobileSubExpanded] = useState(null);
	const [cartOpen, setCartOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const { cartCount } = useCart();
	const { data: apiCourses } = useApi('/courses');

	const LEVEL_META = [
		{ id: 'certificate', label: 'Certificate Level', to: '/cima-certificate-level' },
		{ id: 'operational', label: 'Operational Level', to: '/cima-operational-level' },
		{ id: 'management', label: 'Management Level', to: '/cima-management-level' },
		{ id: 'strategic', label: 'Strategic Level', to: '/cima-strategic-level' },
	];

	// Always show individual courses grouped by level (not combo packages)
	const coursesDropdown = apiCourses?.length
		? LEVEL_META.map((lvl) => ({
			label: lvl.label,
			to: lvl.to,
			hasSub: true,
			sub: apiCourses
				.filter((c) => c.level === lvl.id)
				.map((c) => ({ label: `${c.id} – ${c.name}`, to: `/${c.slug}` })),
		}))
		: LEVELS.map((level) => ({
			label: level.title.replace('CIMA ', ''),
			to: level.currentPath,
			hasSub: true,
			sub: level.subjects.map((s) => ({ label: `${s.code} – ${s.name}`, to: `/${s.slug}` })),
		}));

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
		setMobileSubExpanded(null);
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
			dropdown: coursesDropdown,
		},
		{ label: 'Nanaska Edge', to: '/nanaska-edge' },
		{ label: 'Testimonials', to: '/testimonials' },
		{ label: 'Blog', to: '/blog' },
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
							<img src={nanaskaLogo} alt="Nanaska – Building Better Leaders" className="navbar__logo-img" />
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
										{/* Desktop: link or span (for items without route) */}
										{link.to ? (
											<div className="navbar__link-wrap">
												<Link to={link.to} className="navbar__link" onClick={handleLinkClick}>
													{link.label}
												</Link>
												<button
													className={`navbar__toggle-btn${mobileExpanded === link.label ? ' navbar__toggle-btn--open' : ''}`}
													onClick={() => setMobileExpanded(prev => prev === link.label ? null : link.label)}
													aria-label={`Toggle ${link.label} submenu`}
												>
													<span className="navbar__caret">▾</span>
												</button>
											</div>
										) : (
											<div className="navbar__link-wrap">
												<span
													className="navbar__link navbar__link--noroute"
												>
													{link.label}
												</span>
												<button
													className={`navbar__toggle-btn${mobileExpanded === link.label ? ' navbar__toggle-btn--open' : ''}`}
													onClick={() => setMobileExpanded(prev => prev === link.label ? null : link.label)}
													aria-label={`Toggle ${link.label} submenu`}
												>
													<span className="navbar__caret">▾</span>
												</button>
											</div>
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
														{sub.hasSub ? (
															<>
																<div className="navbar__mobile-accordion-row">
																	<Link to={sub.to} className="navbar__mobile-accordion-link" onClick={handleLinkClick}>
																		{sub.label}
																	</Link>
																	<button
																		className={`navbar__toggle-btn navbar__toggle-btn--sub${mobileSubExpanded === sub.label ? ' navbar__toggle-btn--open' : ''}`}
																		onClick={() => setMobileSubExpanded(prev => prev === sub.label ? null : sub.label)}
																		aria-label={`Toggle ${sub.label} courses`}
																	>
																		<span className="navbar__caret">▾</span>
																	</button>
																</div>
																{mobileSubExpanded === sub.label && sub.sub && (
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
															</>
														) : (
															<Link to={sub.to} className="navbar__mobile-accordion-link" onClick={handleLinkClick}>
																{sub.label}
															</Link>
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
