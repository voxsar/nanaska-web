import { useState, useEffect } from 'react';
import api from '../api';
import './ImageManagerPage.css';

const GROUP_LABELS = {
	hero: 'Hero Slider',
	courses: 'Course Level Images',
	features: 'Feature Section Images',
};

export default function ImageManagerPage() {
	const [images, setImages] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [uploading, setUploading] = useState({});
	const [editing, setEditing] = useState(null);
	const [editAlt, setEditAlt] = useState('');

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

	const groups = [...new Set(images.map((img) => img.group))];

	return (
		<div className="img-mgr">
			<div className="page-title-row">
				<h1>Site Images</h1>
				<p className="img-mgr__subtitle">Upload replacement images for any slot. Images will be served from the backend and take effect immediately.</p>
			</div>

			{error && <div className="admin-alert admin-alert-error">{error}</div>}
			{success && <div className="admin-alert admin-alert-success">{success}</div>}

			{loading ? (
				<div className="admin-loading">Loading…</div>
			) : (
				groups.map((group) => (
					<div key={group} className="img-mgr__group">
						<h2 className="img-mgr__group-title">{GROUP_LABELS[group] || group}</h2>
						<div className="img-mgr__grid">
							{images
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
											<label className="img-mgr__upload-label">
												<input
													type="file"
													accept="image/*"
													onChange={(e) => handleUpload(img.key, e.target.files?.[0], e.target)}
													className="img-mgr__file-input"
													disabled={uploading[img.key]}
												/>
												<span className={`btn btn-primary${uploading[img.key] ? ' btn-loading' : ''}`}>
													{uploading[img.key] ? 'Uploading…' : '⬆ Upload New Image'}
												</span>
											</label>
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
