import { useState, useEffect } from 'react';
import api from '../../api';

const LEVELS = ['certificate', 'operational', 'management', 'strategic'];

const EMPTY = { id: '', name: '', price: 0, level: 'certificate', slug: '', description: '', icon: '', subtitle: '', lecturerName: '', highlights: '', outcomes: '', syllabus: '' };

export default function CoursesPage() {
	const [courses, setCourses] = useState([]);
	const [loading, setLoading] = useState(true);
	const [modal, setModal] = useState(null);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [filterLevel, setFilterLevel] = useState('');

	const load = () => {
		api.get('/courses').then((r) => setCourses(r.data)).finally(() => setLoading(false));
	};
	useEffect(load, []);

	const openCreate = () => setModal({ mode: 'create', data: { ...EMPTY } });
	const openEdit = (c) => setModal({
		mode: 'edit',
		data: {
			...c,
			highlights: Array.isArray(c.highlights) ? c.highlights.join('\n') : (c.highlights || ''),
			outcomes: Array.isArray(c.outcomes) ? c.outcomes.join('\n') : (c.outcomes || ''),
			syllabus: c.syllabus ? JSON.stringify(c.syllabus, null, 2) : '',
		},
	});
	const closeModal = () => { setModal(null); setError(''); };

	const handleChange = (e) => {
		const { name, value } = e.target;
		setModal((prev) => ({
			...prev,
			data: {
				...prev.data,
				[name]: name === 'price' ? Number(value) : value,
				...(name === 'name' && prev.mode === 'create'
					? { slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') }
					: {}),
			},
		}));
	};

	const handleSave = async (e) => {
		e.preventDefault();
		setSaving(true);
		setError('');
		try {
			const { data } = modal;
			const payload = {
				...data,
				highlights: data.highlights ? data.highlights.split('\n').map((s) => s.trim()).filter(Boolean) : [],
				outcomes: data.outcomes ? data.outcomes.split('\n').map((s) => s.trim()).filter(Boolean) : [],
				syllabus: (() => { try { return data.syllabus ? JSON.parse(data.syllabus) : []; } catch { return []; } })(),
			};
			if (modal.mode === 'create') {
				const res = await api.post('/courses', payload);
				setCourses((prev) => [...prev, res.data]);
			} else {
				const { id, ...rest } = payload;
				const res = await api.put(`/courses/${id}`, rest);
				setCourses((prev) => prev.map((c) => (c.id === id ? res.data : c)));
			}
			setSuccess(`Course ${modal.mode === 'create' ? 'created' : 'updated'} successfully!`);
			closeModal();
		} catch (err) {
			setError(err.response?.data?.message || 'Failed to save course');
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = async (id) => {
		if (!confirm('Delete this course? This may affect existing orders.')) return;
		try {
			await api.delete(`/courses/${id}`);
			setCourses((prev) => prev.filter((c) => c.id !== id));
		} catch {
			alert('Failed to delete course');
		}
	};

	const filtered = courses.filter((c) => !filterLevel || c.level === filterLevel);

	const LEVEL_COLORS = {
		certificate: 'badge-blue',
		operational: 'badge-green',
		management: 'badge-yellow',
		strategic: 'badge-red',
	};

	return (
		<div>
			<div className="page-title-row">
				<h1>Courses</h1>
				<button className="btn btn-primary" onClick={openCreate}>+ Add Course</button>
			</div>

			{error && <div className="admin-alert admin-alert-error">{error}</div>}
			{success && <div className="admin-alert admin-alert-success">{success}</div>}

			<div className="admin-filter-bar">
				<select
					value={filterLevel}
					onChange={(e) => setFilterLevel(e.target.value)}
					style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.875rem' }}
				>
					<option value="">All Levels</option>
					{LEVELS.map((l) => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
				</select>
				<span style={{ color: '#64748b', fontSize: '0.875rem' }}>{filtered.length} courses</span>
			</div>

			{loading ? (
				<div className="admin-loading">Loading…</div>
			) : (
				<div className="admin-table-wrap">
					<table className="admin-table">
						<thead>
							<tr>
								<th>ID</th>
								<th>Name</th>
								<th>Level</th>
								<th>Price (LKR)</th>
								<th>Slug</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{filtered.map((c) => (
								<tr key={c.id}>
									<td style={{ fontWeight: 600, color: '#3b82f6' }}>{c.id}</td>
									<td style={{ fontWeight: 500 }}>{c.name}</td>
									<td>
										<span className={`badge ${LEVEL_COLORS[c.level] || 'badge-gray'}`}>
											{c.level}
										</span>
									</td>
									<td>{c.price.toLocaleString()}</td>
									<td style={{ color: '#64748b', fontSize: '0.8rem' }}>{c.slug}</td>
									<td>
										<div style={{ display: 'flex', gap: '8px' }}>
											<button className="btn btn-secondary btn-sm" onClick={() => openEdit(c)}>Edit</button>
											<button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>Delete</button>
										</div>
									</td>
								</tr>
							))}
							{filtered.length === 0 && (
								<tr><td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8', padding: '32px' }}>No courses found</td></tr>
							)}
						</tbody>
					</table>
				</div>
			)}

			{modal && (
				<div className="admin-modal-overlay" onClick={closeModal}>
					<div className="admin-modal" onClick={(e) => e.stopPropagation()}>
						<div className="admin-modal-header">
							<h2>{modal.mode === 'create' ? 'Add Course' : 'Edit Course'}</h2>
							<button className="modal-close" onClick={closeModal}>×</button>
						</div>

						{error && <div className="admin-alert admin-alert-error">{error}</div>}

						<form onSubmit={handleSave}>
							<div className="admin-form-grid">
								<div className="form-group">
									<label>Course ID *</label>
									<input
										name="id"
										required
										value={modal.data.id}
										onChange={handleChange}
										disabled={modal.mode === 'edit'}
										placeholder="e.g. BA1"
										style={modal.mode === 'edit' ? { background: '#f1f5f9' } : {}}
									/>
								</div>
								<div className="form-group">
									<label>Level *</label>
									<select name="level" value={modal.data.level} onChange={handleChange}>
										{LEVELS.map((l) => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
									</select>
								</div>
								<div className="form-group full">
									<label>Name *</label>
									<input name="name" required value={modal.data.name} onChange={handleChange} />
								</div>
								<div className="form-group">
									<label>Price (LKR) *</label>
									<input name="price" type="number" required value={modal.data.price} onChange={handleChange} />
								</div>
								<div className="form-group">
									<label>Slug *</label>
									<input name="slug" required value={modal.data.slug} onChange={handleChange} />
								</div>
								<div className="form-group full">
									<label>Description</label>
									<textarea name="description" value={modal.data.description || ''} onChange={handleChange} />
								</div>
								<div className="form-group">
									<label>Icon (emoji or URL)</label>
									<input name="icon" value={modal.data.icon || ''} onChange={handleChange} placeholder="e.g. 📊" />
								</div>
								<div className="form-group">
									<label>Subtitle</label>
									<input name="subtitle" value={modal.data.subtitle || ''} onChange={handleChange} placeholder="Short tagline under course title" />
								</div>
								<div className="form-group full">
									<label>Lead Lecturer Name</label>
									<input name="lecturerName" value={modal.data.lecturerName || ''} onChange={handleChange} placeholder="e.g. Channa Gunawardana" />
								</div>
								<div className="form-group full">
									<label>Highlights (one per line)</label>
									<textarea
										name="highlights"
										rows={5}
										value={modal.data.highlights || ''}
										onChange={handleChange}
										placeholder="Each line becomes one bullet point"
									/>
								</div>
								<div className="form-group full">
									<label>Outcomes (one per line)</label>
									<textarea
										name="outcomes"
										rows={5}
										value={modal.data.outcomes || ''}
										onChange={handleChange}
										placeholder="Each line becomes one learning outcome"
									/>
								</div>
								<div className="form-group full">
									<label>Syllabus (JSON array)</label>
									<textarea
										name="syllabus"
										rows={8}
										value={modal.data.syllabus || ''}
										onChange={handleChange}
										placeholder='e.g. [{"area": "A", "title": "Topic", "topics": ["Sub-topic 1"]}]'
										style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
									/>
								</div>
							</div>

							<div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
								<button type="submit" className="btn btn-primary" disabled={saving}>
									{saving ? 'Saving…' : 'Save Course'}
								</button>
								<button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
