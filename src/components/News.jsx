import { useState, useRef, useEffect, useCallback } from 'react';
import './News.css';
import { useApi } from '../hooks/useApi';

const STATIC_NEWS = [
	{
		id: 1,
		category: 'Prize Winner',
		date: 'March 2026',
		title: 'Nanaska Student Wins Global CIMA Prize',
		excerpt:
			'Congratulations to our latest global prize winner who achieved top marks in the CIMA Strategic Level case study examination, representing Nanaska on the world stage.',
		img: '/images/2026-03-HomePage-Dekstop.png',
	},
	{
		id: 2,
		category: 'Prize Winner',
		date: 'January 2026',
		title: 'Prize Winner: Kaneshamoorthy Anochkaran',
		excerpt:
			'Kaneshamoorthy Anochkaran joins our ever-growing list of CIMA prize winners, achieving an outstanding result in the latest examination sitting.',
		img: '/images/2026-01-Prize-Winner-Kaneshamoorthy-Anochkaran-wb-1.png',
	},
	{
		id: 3,
		category: 'Achievement',
		date: 'January 2026',
		title: '100 Club MCS — Another Record-Breaking Result',
		excerpt:
			'Our exclusive 100 Club management case study programme continues to deliver exceptional results, with multiple students scoring over 90 marks.',
		img: '/images/2026-01-100-Club-MCS-02-Web-banner.webp',
	},
	{
		id: 4,
		category: 'Event',
		date: 'November 2025',
		title: 'Nanaska Launches New Desktop Learning Platform',
		excerpt:
			'We are excited to unveil our brand-new desktop learning environment, giving students a richer, more interactive online study experience.',
		img: '/images/2025-11-Desktop.webp',
	},
	{
		id: 5,
		category: 'Event',
		date: 'October 2025',
		title: 'September Lecture Panel Highlights',
		excerpt:
			'Our September lecture panel brought together leading industry professionals to discuss emerging trends in management accounting and finance.',
		img: '/images/2025-10-Nanaska_September_lecture_panel_Slider.webp',
	},
	{
		id: 6,
		category: 'Prize Winner',
		date: 'October 2025',
		title: 'CIMA Prize Winner Spotlight: Yanik',
		excerpt:
			'Yanik&apos;s outstanding performance in the CIMA examinations has earned him a well-deserved place in Nanaska&apos;s prestigious prize winners hall of fame.',
		img: '/images/2025-10-Prize-Winner-yanik-web-1.webp',
	},
];

const VISIBLE = 3;

function formatDate(dateStr) {
	if (!dateStr) return '';
	const d = new Date(dateStr);
	return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function News() {
	const { data: blogData } = useApi('/blog?published=true');
	const NEWS = (blogData && blogData.length > 0)
		? blogData.map((post) => ({
			id: post.id,
			category: 'News',
			date: formatDate(post.createdAt),
			title: post.title,
			excerpt: post.metaDesc || post.content.substring(0, 180),
			img: post.coverUrl,
		}))
		: STATIC_NEWS;

	const [startIdx, setStartIdx] = useState(0);
	const [animDir, setAnimDir] = useState(null);
	const timerRef = useRef(null);
	const count = NEWS.length;

	const go = useCallback((dir) => {
		setAnimDir(dir);
		setStartIdx((prev) =>
			dir === 'next'
				? (prev + 1) % count
				: (prev - 1 + count) % count
		);
		setTimeout(() => setAnimDir(null), 400);
	}, [count]);

	const resetTimer = useCallback(() => {
		clearInterval(timerRef.current);
		timerRef.current = setInterval(() => go('next'), 5000);
	}, [go]);

	useEffect(() => {
		timerRef.current = setInterval(() => go('next'), 5000);
		return () => clearInterval(timerRef.current);
	}, [go]);

	const visibleCards = Array.from({ length: VISIBLE }, (_, i) => NEWS[(startIdx + i) % count]);

	return (
		<section className="news" id="news">
			<div className="news__container">
				<div className="news__header">
					<span className="news__eyebrow">Latest News</span>
					<h2 className="news__title">Stay Up to Date</h2>
					<p className="news__subtitle">
						Prize winners, events, and achievements from the Nanaska community.
					</p>
				</div>

				<div className={`news__track news__track--${animDir || 'idle'}`}>
					{visibleCards.map((item) => (
						<article key={item.id} className="news-card">
							<div className="news-card__img-wrap">
								<img src={item.img} alt={item.title} className="news-card__img" loading="lazy" />
								<span className="news-card__category">{item.category}</span>
							</div>
							<div className="news-card__body">
								<p className="news-card__date">{item.date}</p>
								<h3 className="news-card__title">{item.title}</h3>
								<p className="news-card__excerpt">{item.excerpt}</p>
								<a href="#news" className="news-card__link">Read More →</a>
							</div>
						</article>
					))}
				</div>

				<div className="news__controls">
					<button
						className="news__arrow"
						aria-label="Previous news"
						onClick={() => { go('prev'); resetTimer(); }}
					>
						&#8249;
					</button>
					<div className="news__dots">
						{NEWS.map((_, i) => (
							<button
								key={i}
								className={`news__dot${i === startIdx ? ' news__dot--active' : ''}`}
								aria-label={`Go to news item ${i + 1}`}
								onClick={() => { setStartIdx(i); resetTimer(); }}
							/>
						))}
					</div>
					<button
						className="news__arrow"
						aria-label="Next news"
						onClick={() => { go('next'); resetTimer(); }}
					>
						&#8250;
					</button>
				</div>
			</div>
		</section>
	);
}
