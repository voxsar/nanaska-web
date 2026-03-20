import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { useSEO } from '../hooks/useSEO';
import './BlogPage.css';

function formatDate(dateStr) {
	if (!dateStr) return '';
	return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function BlogPage() {
	useSEO({
		title: 'Blog — Nanaska',
		description: "Latest news, prize winners, events, and insights from Nanaska — Sri Lanka's leading CIMA provider.",
		canonical: 'https://www.nanaska.com/blog/',
	});

	const { data: posts, loading } = useApi('/blog?published=true');

	return (
		<div className="blog-page">
			<section className="blog-hero">
				<div className="blog-hero__inner">
					<h1 className="blog-hero__title">Nanaska Blog</h1>
					<p className="blog-hero__sub">
						News, prize winners, events, and insights from Sri Lanka's leading CIMA provider.
					</p>
				</div>
			</section>

			<section className="blog-list">
				<div className="blog-container">
					{loading && <p className="blog-status">Loading posts…</p>}
					{!loading && (!posts || posts.length === 0) && (
						<p className="blog-status">No posts published yet. Check back soon!</p>
					)}
					{!loading && posts && posts.length > 0 && (
						<div className="blog-grid">
							{posts.map((post) => (
								<article key={post.id} className="blog-card">
									{post.coverUrl && (
										<Link to={`/blog/${post.slug}`} className="blog-card__img-wrap" tabIndex={-1} aria-hidden>
											<img src={post.coverUrl} alt={post.title} loading="lazy" className="blog-card__img" />
										</Link>
									)}
									<div className="blog-card__body">
										<p className="blog-card__date">{formatDate(post.createdAt)}</p>
										<h2 className="blog-card__title">
											<Link to={`/blog/${post.slug}`}>{post.title}</Link>
										</h2>
										{post.metaDesc && <p className="blog-card__excerpt">{post.metaDesc}</p>}
										<Link to={`/blog/${post.slug}`} className="blog-card__read-more">
											Read more →
										</Link>
									</div>
								</article>
							))}
						</div>
					)}
				</div>
			</section>
		</div>
	);
}
