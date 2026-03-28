import { useState, useEffect, useCallback, useRef } from 'react';
import './Hero.css';

const SLIDES = [
	{ src: '/images/2026-03-HomePage-Dekstop.png', alt: 'Nanaska – Leading CIMA Course Provider' },
	{ src: '/images/2025-11-Desktop.webp', alt: 'Nanaska CIMA Courses' },
	{ src: '/images/2025-10-resize-web.webp', alt: 'Nanaska Students' },
	{ src: '/images/2025-10-Prize-Winner-yanik-web-1.webp', alt: 'Prize Winner' },
	{ src: '/images/2025-10-Nanaska_September_lecture_panel_Slider.webp', alt: 'September Lecture Panel' },
	{ src: '/images/2025-10-Nanska_Prize_winner_Template-v2_Banner.webp', alt: 'Prize Winner Template' },
	{ src: '/images/2025-10-Nanaska_CIMA-Prize-Winner-Slider-1916x792-1.webp', alt: 'CIMA Prize Winner' },
	{ src: '/images/2026-01-100-Club-MCS-02-Web-banner.webp', alt: '100 Club MCS' },
	{ src: '/images/2026-01-Prize-Winner-Kaneshamoorthy-Anochkaran-wb-1.png', alt: 'Prize Winner Kaneshamoorthy' },
];

const INTERVAL = 5000;

export default function Hero() {
	const [current, setCurrent] = useState(0);
	const [animating, setAnimating] = useState(false);
	const timerRef = useRef(null);
	const count = SLIDES.length;

	const goTo = useCallback((index) => {
		if (animating) return;
		setAnimating(true);
		setCurrent(index);
		setTimeout(() => setAnimating(false), 700);
	}, [animating]);

	const next = useCallback(() => goTo((current + 1) % count), [current, count, goTo]);
	const prev = useCallback(() => goTo((current - 1 + count) % count), [current, count, goTo]);

	const resetTimer = useCallback(() => {
		clearInterval(timerRef.current);
		timerRef.current = setInterval(() => setCurrent((c) => (c + 1) % count), INTERVAL);
	}, [count]);

	useEffect(() => {
		timerRef.current = setInterval(() => setCurrent((c) => (c + 1) % count), INTERVAL);
		return () => clearInterval(timerRef.current);
	}, [count]);

	const handleDot = (i) => {
		goTo(i);
		resetTimer();
	};
	const handlePrev = () => { prev(); resetTimer(); };
	const handleNext = () => { next(); resetTimer(); };

	return (
		<section className="hero" id="home" aria-label="Hero image slider">
			<div className="hero__track">
				{SLIDES.map((slide, i) => (
					<div
						key={i}
						className={`hero__slide${i === current ? ' hero__slide--active' : ''}`}
						aria-hidden={i !== current}
					>
						<img src={slide.src} alt={slide.alt} className="hero__img" loading={i === 0 ? 'eager' : 'lazy'} />
						<div className="hero__slide-overlay" />
					</div>
				))}
			</div>

			<div className="hero__caption">
				<span className="hero__badge">Leading CIMA Course Provider</span>
				<h1 className="hero__title">
					To Build Better&nbsp;
					<span className="hero__title-accent">Leaders</span>
					&nbsp;for the World
				</h1>
				<p className="hero__subtitle">
					Nanaska provides world-class CIMA tuition with expert instruction,
					cutting-edge resources, and dedicated support to help you achieve
					your professional accounting qualifications.
				</p>
				<div className="hero__actions">
					<a href="#courses" className="hero__btn hero__btn--primary">Explore Courses</a>
					<a href="#about" className="hero__btn hero__btn--secondary">Learn More</a>
				</div>
			</div>

			<button className="hero__arrow hero__arrow--prev" onClick={handlePrev} aria-label="Previous slide">&#8249;</button>
			<button className="hero__arrow hero__arrow--next" onClick={handleNext} aria-label="Next slide">&#8250;</button>

			<div className="hero__dots" role="tablist" aria-label="Slide indicators">
				{SLIDES.map((_, i) => (
					<button
						key={i}
						role="tab"
						aria-selected={i === current}
						aria-label={`Go to slide ${i + 1}`}
						className={`hero__dot${i === current ? ' hero__dot--active' : ''}`}
						onClick={() => handleDot(i)}
					/>
				))}
			</div>
		</section>
	);
}
