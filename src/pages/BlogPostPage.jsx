import { Link, useParams } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { useSEO } from '../hooks/useSEO';
import './BlogPostPage.css';

function formatDate(dateStr) {
	if (!dateStr) return '';
	return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function BlogPostPage() {
	const { slug } = useParams();
	const { data: post, loading, error } = useApi(`/blog/slug/${slug}`);

	useSEO({
		title: post ? `${post.title} — Nanaska` : 'Blog — Nanaska',
		description: post?.metaDesc || '',
		ogImage: post?.coverUrl || '',
		canonical: `https://www.nanaska.com/blog/${slug}/`,
	});

	if (loading) {
		return (
			<div className="blog-post-state">
				<p>Loading…</p>
			</div>
		);
	}

	if (error || !post) {
		return (
			<div className="blog-post-state">
				<p>Post not found.</p>
				<Link to="/blog" className="blog-post-back">← Back to Blog</Link>
			</div>
		);
	}

	return (
		<article className="blog-post">
			{post.coverUrl && (
				<div className="blog-post__cover-wrap">
					<img src={post.coverUrl} alt={post.title} className="blog-post__cover" />
				</div>
			)}
			<div className="blog-post__container">
				<header className="blog-post__header">
					<Link to="/blog" className="blog-post-back">← Back to Blog</Link>
					<p className="blog-post__date">{formatDate(post.createdAt)}</p>
					<h1 className="blog-post__title">{post.title}</h1>
				</header>
				{/* Content is admin-authored HTML from CKEditor */}
				<div
					className="blog-post__content"
					// eslint-disable-next-line react/no-danger
					dangerouslySetInnerHTML={{ __html: post.content }}
				/>
			</div>
		</article>
	);
}
