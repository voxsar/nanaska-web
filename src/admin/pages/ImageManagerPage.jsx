import { useState, useEffect, useRef, useMemo } from 'react';
import api from '../api';
import './ImageManagerPage.css';

const PAGES = [
	{ id: 'home',         label: '🏠 Home',             groups: ['hero', 'features'] },
	{ id: 'courses',      label: '📚 Courses',           groups: ['courses'] },
	{ id: 'lecturers',    label: '👤 Lecturers',         groups: ['lecturers'] },
	{ id: 'flp',          label: '🎓 FLP Programme',     groups: ['flp', 'flp-icons'] },
	{ id: 'case-study',   label: '📋 Case Study',        groups: ['case-study'] },
	{ id: 'specialty',    label: '⭐ Our Specialty',     groups: ['specialty'] },
	{ id: 'testimonials', label: '💬 Testimonials',      groups: ['testimonials'] },
	{ id: 'misc',         label: '🌐 Site-Wide',         groups: ['misc'] },
];

const GROUP_LABELS = {
	hero: 'Hero Slider',
	courses: 'Course Level Images',
	features: 'Feature Section Images',
	lecturers: 'Lecturer Photos',
	flp: 'Financial Leadership Programme',
	'flp-icons': 'FLP Icons',
	'case-study': 'Case Study Page',
	specialty: 'Our Specialty Page',
	testimonials: 'Testimonials & Student Reviews',
	misc: 'Site-Wide / Miscellaneous',
};

export default function ImageManagerPage() {
	const [images, setImages] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [uploading, setUploading] = useState({});
	const [selectedPage, setSelectedPage] = useState('home');
	const [expandedCard, setExpandedCard] = useState(null);
	const [editAlt, setEditAlt] = useState('');
	const [deleting, setDeleting] = useState({});
	const fileInputRefs = useRef({});

	useEffect(() => {
		setLoading(true);
		api.get('/media')
			.then((r) => setImages(r.data))
			.catch(() => setError('Failed to load images'))
			.finally(() => setLoading(false));
	}, []);

	const handleUpload = async (key, file) => {
		if (!file) return;
		setUploading((prev) => ({ ...prev, [key]: true }));
		setError('');
		setSuccess('');
		try {
			const formData = new FormData();
			formData.append('file', file);
			const res = await api.post(`/media/upload/${key}`, formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			});
			setImages((prev) => prev.map((img) => img.key === key ? res.data : img));
			setSuccess('✓ Image updated successfully!');
			setTimeout(() => setSuccess(''), 5000);
		} catch (err) {
			setError(err.response?.data?.message || 'Upload failed. Please try again.');
		} finally {
			setUploading((prev) => ({ ...prev, [key]: false }));
			if (fileInputRefs.current[key]) fileInputRefs.current[key].value = '';
		}
	};

	const triggerUpload = (key) => {
		fileInputRefs.current[key]?.click();
	};

	const saveAlt = async (key) => {
		setError('');
		try {
			const res = await api.put(`/media/${key}`, { altText: editAlt });
			setImages((prev) => prev.map((img) => img.key === key ? res.data : img));
			setExpandedCard(null);
			setSuccess('Alt text saved.');
			setTimeout(() => setSuccess(''), 3000);
		} catch {
			setError('Failed to save alt text.');
		}
	};

	const handleDelete = async (key) => {
		if (!confirm(`Delete image slot "${key}"? This cannot be undone.`)) return;
		setDeleting((prev) => ({ ...prev, [key]: true }));
		setError('');
		try {
			await api.delete(`/media/${key}`);
			setImages((prev) => prev.filter((img) => img.key !== key));
		} catch (err) {
			setError(err.response?.data?.message || `Failed to delete "${key}".`);
		} finally {
			setDeleting((prev) => ({ ...prev, [key]: false }));
		}
	};

	const toggleCard = (img) => {
		if (expandedCard === img.key) {
			setExpandedCard(null);
		} else {
			setExpandedCard(img.key);
			setEditAlt(img.altText || '');
		}
	};

	const pageCounts = useMemo(
		() => Object.fromEntries(PAGES.map((p) => [p.id, images.filter((img) => p.groups.includes(img.group)).length])),
		[images],
	);
	const knownGroups = useMemo(() => PAGES.flatMap((p) => p.groups), []);
	const unknownGroups = useMemo(
		() => [...new Set(images.map((img) => img.group))].filter((g) => !knownGroups.includes(g)),
		[images, knownGroups],
	);
	const currentPage = PAGES.find((p) => p.id === selectedPage);
	const effectiveGroups = useMemo(
		() => (selectedPage === 'misc'
			? [...(currentPage?.groups ?? []), ...unknownGroups]
			: (currentPage?.groups ?? [])),
		[selectedPage, currentPage, unknownGroups],
	);

	const pageImages = useMemo(
		() => images
			.filter((img) => effectiveGroups.includes(img.group))
			.sort((a, b) => {
				const gi = effectiveGroups.indexOf(a.group) - effectiveGroups.indexOf(b.group);
				return gi !== 0 ? gi : a.sortOrder - b.sortOrder;
			}),
		[images, effectiveGroups],
	);

	const groupsInPage = useMemo(
		() => [...new Set(pageImages.map((img) => img.group))],
		[pageImages],
	);

	return (
		<div className="img-mgr">
			<div className="page-title-row">
				<h1>Site Images</h1>
				<p className="img-mgr__subtitle">
					Select a page, find the image you want to change, and click <strong>Replace Image</strong> to upload a new one from your computer.
				</p>
			</div>

			{error && <div className="admin-alert admin-alert-error">{error}</div>}
			{success && <div className="admin-alert admin-alert-success">{success}</div>}

			{/* Page navigation */}
			<nav className="img-mgr__pages">
				{PAGES.map((page) => (
					<button
						key={page.id}
						className={`img-mgr__page-tab${selectedPage === page.id ? ' img-mgr__page-tab--active' : ''}`}
						onClick={() => { setSelectedPage(page.id); setExpandedCard(null); setError(''); }}
					>
						{page.label}
						{pageCounts[page.id] > 0 && <span className="img-mgr__page-count">{pageCounts[page.id]}</span>}
					</button>
				))}
			</nav>

			{loading ? (
				<div className="admin-loading">Loading images…</div>
			) : pageImages.length === 0 ? (
				<div className="img-mgr__empty">No images found for this page.</div>
			) : (
				groupsInPage.map((group) => (
					<div key={group} className="img-mgr__group">
						{groupsInPage.length > 1 && (
							<h2 className="img-mgr__group-title">{GROUP_LABELS[group] || group}</h2>
						)}
						<div className="img-mgr__grid">
							{pageImages
								.filter((img) => img.group === group)
								.map((img) => (
									<div
										key={img.key}
										className={`img-mgr__card${uploading[img.key] ? ' img-mgr__card--uploading' : ''}`}
									>
										{/* Hidden real file input */}
										<input
											type="file"
											accept="image/*"
											ref={(el) => { fileInputRefs.current[img.key] = el; }}
											onChange={(e) => handleUpload(img.key, e.target.files?.[0])}
											className="img-mgr__file-input"
											disabled={uploading[img.key]}
										/>

										{/* Clickable preview */}
										<div
											className="img-mgr__preview"
											onClick={() => !uploading[img.key] && triggerUpload(img.key)}
											title="Click to replace this image"
										>
											{img.url ? (
												<img
													src={img.url}
													alt={img.altText || img.label}
													className="img-mgr__img"
													loading="lazy"
												/>
											) : (
												<div className="img-mgr__no-image">No image set</div>
											)}
											<div className="img-mgr__preview-overlay">
												<span className="img-mgr__overlay-text">📁 Click to replace</span>
											</div>
										</div>

										{/* Card body */}
										<div className="img-mgr__body">
											<p className="img-mgr__label">{img.label}</p>
											{img.widthHint && img.heightHint && (
												<p className="img-mgr__dims">Recommended size: {img.widthHint} × {img.heightHint} px</p>
											)}

											{/* Primary action */}
											<button
												className={`btn btn-primary img-mgr__replace-btn${uploading[img.key] ? ' btn-loading' : ''}`}
												onClick={() => triggerUpload(img.key)}
												disabled={uploading[img.key]}
											>
												{uploading[img.key] ? '⏳ Uploading…' : '📁 Replace Image'}
											</button>

											{/* Advanced options toggle */}
											<button
												className="img-mgr__options-toggle"
												onClick={() => toggleCard(img)}
											>
												{expandedCard === img.key ? '▲ Hide options' : '⚙ More options'}
											</button>
										</div>

										{/* Expanded: alt text + delete */}
										{expandedCard === img.key && (
											<div className="img-mgr__advanced">
												<label className="img-mgr__adv-label">Alt text (for accessibility & SEO)</label>
												<input
													type="text"
													value={editAlt}
													onChange={(e) => setEditAlt(e.target.value)}
													placeholder="Describe this image…"
													className="admin-input img-mgr__alt-input"
												/>
												<div className="img-mgr__adv-actions">
													<button className="btn btn-primary btn-sm" onClick={() => saveAlt(img.key)}>
														Save Alt Text
													</button>
													<button
														className={`btn btn-danger btn-sm${deleting[img.key] ? ' btn-loading' : ''}`}
														onClick={() => handleDelete(img.key)}
														disabled={deleting[img.key]}
													>
														{deleting[img.key] ? 'Deleting…' : '🗑 Delete Slot'}
													</button>
												</div>
											</div>
										)}
									</div>
								))}
						</div>
					</div>
				))
			)}
		</div>
	);
}

