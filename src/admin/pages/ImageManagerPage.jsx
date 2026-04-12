import { useState, useEffect } from 'react';
import api from '../api';
import './ImageManagerPage.css';

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
	misc: 'Miscellaneous / Site-Wide',
};

const EMPTY_NEW = { key: '', group: '', label: '', url: '', altText: '' };

export default function ImageManagerPage() {
	const [images, setImages] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [uploading, setUploading] = useState({});
	const [editing, setEditing] = useState(null);
	const [editAlt, setEditAlt] = useState('');
	const [urlEditing, setUrlEditing] = useState(null);
	const [urlInput, setUrlInput] = useState('');
	const [filterGroup, setFilterGroup] = useState('');
	const [search, setSearch] = useState('');
	const [showCreate, setShowCreate] = useState(false);
	const [newImg, setNewImg] = useState(EMPTY_NEW);
	const [creating, setCreating] = useState(false);
	const [deleting, setDeleting] = useState({});

	const load = () => {
		setLoading(true);
		api.get('/media')
			.then((r) => setImages(r.data))
			.catch(() => setError('Failed to load images'))
			.finally(() => setLoading(false));
	};

	useEffect(() => { load(); }, []);

	const handleUpload = async (key, file, inputEl) => {
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
			setSuccess(`Image "${key}" updated successfully.`);
		} catch (err) {
			setError(err.response?.data?.message || `Failed to upload image for ${key}`);
		} finally {
			setUploading((prev) => ({ ...prev, [key]: false }));
			if (inputEl) inputEl.value = '';
		}
	};

	const openEditAlt = (img) => {
		setEditing(img.key);
		setEditAlt(img.altText || '');
	};

	const saveAlt = async (key) => {
		setError('');
		try {
			const res = await api.put(`/media/${key}`, { altText: editAlt });
			setImages((prev) => prev.map((img) => img.key === key ? res.data : img));
			setSuccess('Alt text updated.');
		} catch {
			setError('Failed to update alt text.');
		} finally {
			setEditing(null);
		}
	};

	const openUrlEdit = (img) => {
		setUrlEditing(img.key);
		setUrlInput(img.url || '');
	};

	const saveUrl = async (key) => {
		if (!urlInput.trim()) { setError('URL cannot be empty.'); return; }
		setError('');
		try {
			const res = await api.put(`/media/${key}`, { url: urlInput.trim() });
			setImages((prev) => prev.map((img) => img.key === key ? res.data : img));
			setSuccess('Image URL updated.');
		} catch {
			setError('Failed to update URL.');
		} finally {
			setUrlEditing(null);
		}
	};

	const handleCreate = async (e) => {
		e.preventDefault();
		if (!newImg.key || !newImg.group || !newImg.label || !newImg.url) {
			setError('Key, group, label and URL are all required.');
			return;
		}
		setCreating(true);
		setError('');
		try {
			const res = await api.post('/media', newImg);
			setImages((prev) => [...prev, res.data]);
			setSuccess(`Image slot "${res.data.key}" created.`);
			setNewImg(EMPTY_NEW);
			setShowCreate(false);
		} catch (err) {
			setError(err.response?.data?.message || 'Failed to create image slot.');
		} finally {
			setCreating(false);
		}
	};

	const handleDelete = async (key) => {
		if (!confirm(`Delete image slot "${key}"? This cannot be undone.`)) return;
		setDeleting((prev) => ({ ...prev, [key]: true }));
		setError('');
		try {
			await api.delete(`/media/${key}`);
			setImages((prev) => prev.filter((img) => img.key !== key));
			setSuccess(`Image slot "${key}" deleted.`);
		} catch (err) {
			setError(err.response?.data?.message || `Failed to delete "${key}".`);
		} finally {
			setDeleting((prev) => ({ ...prev, [key]: false }));
		}
	};

	const allGroups = [...new Set(images.map((img) => img.group))].sort();
	const visibleImages = images
		.filter((img) => !filterGroup || img.filterGroup === filterGroup || img.group === filterGroup)
		.filter((img) => !search || img.label.toLowerCase().includes(search.toLowerCase()) || img.key.toLowerCase().includes(search.toLowerCase()));
	const groups = [...new Set(visibleImages.map((img) => img.group))].sort((a, b) => {
		const order = Object.keys(GROUP_LABELS);
		const ai = order.indexOf(a); const bi = order.indexOf(b);
		if (ai === -1 && bi === -1) return a.localeCompare(b);
		if (ai === -1) return 1;
		if (bi === -1) return -1;
		return ai - bi;
	});

	return (
		<div className="img-mgr">
			<div className="page-title-row">
				<h1>Site Images</h1>
				<p className="img-mgr__subtitle">Upload or paste a URL to replace any image. Changes take effect immediately on the live site.</p>
			</div>

			{error && <div className="admin-alert admin-alert-error">{error}</div>}
			{success && <div className="admin-alert admin-alert-success">{success}</div>}

			{/* Toolbar */}
			<div className="img-mgr__toolbar">
				<input
					type="text"
					placeholder="Search by label or key…"
					className="admin-input img-mgr__search"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>
				<select
					className="admin-input img-mgr__filter"
					value={filterGroup}
					onChange={(e) => setFilterGroup(e.target.value)}
				>
					<option value="">All groups</option>
					{allGroups.map((g) => (
						<option key={g} value={g}>{GROUP_LABELS[g] || g}</option>
					))}
				</select>
				<button className="btn btn-primary" onClick={() => { setShowCreate((v) => !v); setError(''); }}>
					{showCreate ? '✕ Cancel' : '+ New Image Slot'}
				</button>
			</div>

			{/* Create new slot form */}
			{showCreate && (
				<form className="img-mgr__create-form" onSubmit={handleCreate}>
					<h3 className="img-mgr__create-title">Create New Image Slot</h3>
					<div className="img-mgr__create-fields">
						<input
							className="admin-input"
							placeholder="Key (unique, e.g. hero_slide_10)"
							value={newImg.key}
							onChange={(e) => setNewImg({ ...newImg, key: e.target.value.trim() })}
							required
						/>
						<input
							className="admin-input"
							placeholder="Group (e.g. hero, lecturers, misc)"
							value={newImg.group}
							onChange={(e) => setNewImg({ ...newImg, group: e.target.value.trim() })}
							required
						/>
						<input
							className="admin-input"
							placeholder="Label (human-readable name)"
							value={newImg.label}
							onChange={(e) => setNewImg({ ...newImg, label: e.target.value })}
							required
						/>
						<input
							className="admin-input"
							placeholder="Image URL (paste link, e.g. https://api.nanaska.com/uploads/…)"
							value={newImg.url}
							onChange={(e) => setNewImg({ ...newImg, url: e.target.value.trim() })}
							required
						/>
						<input
							className="admin-input"
							placeholder="Alt text (optional)"
							value={newImg.altText}
							onChange={(e) => setNewImg({ ...newImg, altText: e.target.value })}
						/>
					</div>
					<button className={`btn btn-primary${creating ? ' btn-loading' : ''}`} type="submit" disabled={creating}>
						{creating ? 'Creating…' : 'Create Slot'}
					</button>
				</form>
			)}

			{loading ? (
				<div className="admin-loading">Loading…</div>
			) : (
				groups.map((group) => (
					<div key={group} className="img-mgr__group">
						<h2 className="img-mgr__group-title">{GROUP_LABELS[group] || group}</h2>
						<div className="img-mgr__grid">
							{visibleImages
								.filter((img) => img.group === group)
								.sort((a, b) => a.sortOrder - b.sortOrder)
								.map((img) => (
									<div key={img.key} className="img-mgr__card">
										<div className="img-mgr__preview">
											<img
												src={img.url || ''}
												alt={img.altText || img.label}
												className="img-mgr__img"
												loading="lazy"
											/>
										</div>
										<div className="img-mgr__info">
											<p className="img-mgr__label">{img.label}</p>
											<p className="img-mgr__key">Key: <code>{img.key}</code></p>
											{img.widthHint && img.heightHint && (
												<p className="img-mgr__dims">
													Recommended: <strong>{img.widthHint} × {img.heightHint} px</strong>
												</p>
											)}
											{/* Alt text editor */}
											{editing === img.key ? (
												<div className="img-mgr__alt-edit">
													<input
														type="text"
														value={editAlt}
														onChange={(e) => setEditAlt(e.target.value)}
														placeholder="Alt text"
														className="admin-input"
													/>
													<div className="img-mgr__alt-actions">
														<button className="btn btn-primary btn-sm" onClick={() => saveAlt(img.key)}>Save</button>
														<button className="btn btn-secondary btn-sm" onClick={() => setEditing(null)}>Cancel</button>
													</div>
												</div>
											) : (
												<p className="img-mgr__alt">
													Alt: {img.altText || <em>none</em>}
													<button className="img-mgr__edit-alt-btn" onClick={() => openEditAlt(img)}>Edit</button>
												</p>
											)}
										</div>
										<div className="img-mgr__upload">
											{/* File upload */}
											<label className="img-mgr__upload-label">
												<input
													type="file"
													accept="image/*"
													onChange={(e) => handleUpload(img.key, e.target.files?.[0], e.target)}
													className="img-mgr__file-input"
													disabled={uploading[img.key]}
												/>
												<span className={`btn btn-primary btn-sm${uploading[img.key] ? ' btn-loading' : ''}`}>
													{uploading[img.key] ? 'Uploading…' : '⬆ Upload File'}
												</span>
											</label>

											{/* URL paste */}
											{urlEditing === img.key ? (
												<div className="img-mgr__url-edit">
													<input
														type="text"
														value={urlInput}
														onChange={(e) => setUrlInput(e.target.value)}
														placeholder="Paste image URL…"
														className="admin-input img-mgr__url-input"
													/>
													<div className="img-mgr__alt-actions">
														<button className="btn btn-primary btn-sm" onClick={() => saveUrl(img.key)}>Save URL</button>
														<button className="btn btn-secondary btn-sm" onClick={() => setUrlEditing(null)}>Cancel</button>
													</div>
												</div>
											) : (
												<button className="btn btn-secondary btn-sm img-mgr__url-btn" onClick={() => openUrlEdit(img)}>
													🔗 Paste URL
												</button>
											)}

											{/* Delete */}
											<button
												className={`btn btn-danger btn-sm img-mgr__delete-btn${deleting[img.key] ? ' btn-loading' : ''}`}
												onClick={() => handleDelete(img.key)}
												disabled={deleting[img.key]}
											>
												{deleting[img.key] ? '…' : '🗑 Delete'}
											</button>
										</div>
									</div>
								))}
						</div>
					</div>
				))
			)}
		</div>
	);
}

