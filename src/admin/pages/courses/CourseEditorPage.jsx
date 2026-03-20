import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api';

const LEVELS = ['certificate', 'operational', 'management', 'strategic'];

const EMPTY_SYLLABUS_ITEM = { topic: '', desc: '' };
const EMPTY_FORM = {
	id: '',
	name: '',
	price: 0,
	level: 'certificate',
	slug: '',
	description: '',
	icon: '',
	subtitle: '',
	duration: '',
	lecturerName: '',
};

export default function CourseEditorPage() {
	const { id } = useParams();
	const navigate = useNavigate();
	const isEdit = Boolean(id);

	const [form, setForm] = useState({ ...EMPTY_FORM });
	const [highlights, setHighlights] = useState(['']);
	const [outcomes, setOutcomes] = useState(['']);
	const [syllabus, setSyllabus] = useState([{ topic: '', desc: '' }]);
	const [selectedLecturerIds, setSelectedLecturerIds] = useState([]);
	const [lecturers, setLecturers] = useState([]);
	const [loading, setLoading] = useState(isEdit);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');

	// Load lecturers
	useEffect(() => {
		api.get('/lecturers').then((r) => setLecturers(r.data)).catch(() => { });
	}, []);

	// Load existing course for edit
	useEffect(() => {
		if (!isEdit) return;
		api.get(`/courses/${id}`)
			.then((r) => {
				const c = r.data;
				setForm({
					id: c.id || '',
					name: c.name || '',
					price: c.price || 0,
					level: c.level || 'certificate',
					slug: c.slug || '',
					description: c.description || '',
					icon: c.icon || '',
					subtitle: c.subtitle || '',
					duration: c.duration || '',
					lecturerName: c.lecturerName || '',
				});
				setHighlights(Array.isArray(c.highlights) && c.highlights.length ? c.highlights : ['']);
				setOutcomes(Array.isArray(c.outcomes) && c.outcomes.length ? c.outcomes : ['']);
				setSyllabus(Array.isArray(c.syllabus) && c.syllabus.length ? c.syllabus : [{ topic: '', desc: '' }]);
				setSelectedLecturerIds(Array.isArray(c.lecturerIds) ? c.lecturerIds : []);
			})
			.catch(() => setError('Failed to load course'))
			.finally(() => setLoading(false));
	}, [id, isEdit]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm((prev) => ({
			...prev,
			[name]: name === 'price' ? Number(value) : value,
			...(name === 'name' && !isEdit
				? { slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') }
				: {}),
		}));
	};

	/* ── Highlights ── */
	const updateHighlight = (i, val) => setHighlights((p) => { const a = [...p]; a[i] = val; return a; });
	const addHighlight = () => setHighlights((p) => [...p, '']);
	const removeHighlight = (i) => setHighlights((p) => p.filter((_, idx) => idx !== i));

	/* ── Outcomes ── */
	const updateOutcome = (i, val) => setOutcomes((p) => { const a = [...p]; a[i] = val; return a; });
	const addOutcome = () => setOutcomes((p) => [...p, '']);
	const removeOutcome = (i) => setOutcomes((p) => p.filter((_, idx) => idx !== i));

	/* ── Syllabus ── */
	const updateSyllabus = (i, field, val) => setSyllabus((p) => {
		const a = [...p]; a[i] = { ...a[i], [field]: val }; return a;
	});
	const addSyllabusItem = () => setSyllabus((p) => [...p, { topic: '', desc: '' }]);
	const removeSyllabusItem = (i) => setSyllabus((p) => p.filter((_, idx) => idx !== i));
	const moveSyllabus = (i, dir) => setSyllabus((p) => {
		const a = [...p];
		const j = i + dir;
		if (j < 0 || j >= a.length) return a;
		[a[i], a[j]] = [a[j], a[i]];
		return a;
	});

	/* ── Lecturers ── */
	const toggleLecturer = (lecId) => {
		setSelectedLecturerIds((prev) =>
			prev.includes(lecId) ? prev.filter((l) => l !== lecId) : [...prev, lecId]
		);
	};

	const handleSave = async (e) => {
		e.preventDefault();
		setSaving(true);
		setError('');
		setSuccess('');
		try {
			const payload = {
				...form,
				highlights: highlights.filter(Boolean),
				outcomes: outcomes.filter(Boolean),
				syllabus: syllabus.filter((s) => s.topic),
				lecturerIds: selectedLecturerIds,
			};
			if (isEdit) {
				const { id: _id, ...rest } = payload;
				await api.put(`/courses/${id}`, rest);
			} else {
				await api.post('/courses', payload);
			}
			setSuccess(`Course ${isEdit ? 'updated' : 'created'} successfully!`);
			setTimeout(() => navigate('/admin/courses'), 1200);
		} catch (err) {
			setError(err.response?.data?.message || 'Failed to save course');
		} finally {
			setSaving(false);
		}
	};

	if (loading) return <div className="admin-loading">Loading course…</div>;

	return (
		<div style={{ maxWidth: 860, margin: '0 auto' }}>
			<div className="page-title-row">
				<h1>{isEdit ? 'Edit Course' : 'Add New Course'}</h1>
				<button className="btn btn-secondary" onClick={() => navigate('/admin/courses')}>← Back to Courses</button>
			</div>

			{error && <div className="admin-alert admin-alert-error" style={{ marginBottom: 16 }}>{error}</div>}
			{success && <div className="admin-alert admin-alert-success" style={{ marginBottom: 16 }}>{success}</div>}

			<form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

				{/* ── Basic Info ── */}
				<section className="admin-card">
					<h2 className="admin-card-title">Basic Info</h2>
					<div className="admin-form-grid">
						<div className="form-group">
							<label>Course ID * <small style={{ color: '#94a3b8' }}>(e.g. BA1, E1)</small></label>
							<input
								name="id"
								required
								value={form.id}
								onChange={handleChange}
								disabled={isEdit}
								placeholder="e.g. BA1"
								style={isEdit ? { background: '#f1f5f9' } : {}}
							/>
						</div>
						<div className="form-group">
							<label>Level *</label>
							<select name="level" value={form.level} onChange={handleChange}>
								{LEVELS.map((l) => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
							</select>
						</div>
						<div className="form-group full">
							<label>Course Name *</label>
							<input name="name" required value={form.name} onChange={handleChange} placeholder="e.g. Fundamentals of Business Economics" />
						</div>
						<div className="form-group">
							<label>Price (LKR) *</label>
							<input name="price" type="number" required min={0} value={form.price} onChange={handleChange} />
						</div>
						<div className="form-group">
							<label>Slug *</label>
							<input name="slug" required value={form.slug} onChange={handleChange} placeholder="auto-generated from name" />
						</div>
						<div className="form-group">
							<label>Duration</label>
							<input name="duration" value={form.duration} onChange={handleChange} placeholder="e.g. 4 Months, 6–12 months" />
						</div>
						<div className="form-group">
							<label>Icon (emoji)</label>
							<input name="icon" value={form.icon} onChange={handleChange} placeholder="e.g. 📊" />
						</div>
						<div className="form-group full">
							<label>Subtitle <small style={{ color: '#94a3b8' }}>Short tagline shown under the title</small></label>
							<input name="subtitle" value={form.subtitle} onChange={handleChange} placeholder="e.g. Enterprise, economics & the global business environment" />
						</div>
					</div>
				</section>

				{/* ── Overview / Description ── */}
				<section className="admin-card">
					<h2 className="admin-card-title">Overview</h2>
					<p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: 12 }}>
						Displayed in the Overview tab on the course page. The title is automatically "{form.id || 'CODE'} — {form.name || 'Course Name'}".
					</p>
					<div className="form-group">
						<label>Body</label>
						<textarea
							name="description"
							rows={5}
							value={form.description}
							onChange={handleChange}
							placeholder="Detailed description of the course…"
						/>
					</div>
				</section>

				{/* ── Highlights ── */}
				<section className="admin-card">
					<h2 className="admin-card-title">Highlights <small style={{ fontWeight: 400, color: '#64748b' }}>What's Included / Key Topics</small></h2>
					{highlights.map((h, i) => (
						<div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
							<input
								value={h}
								onChange={(e) => updateHighlight(i, e.target.value)}
								placeholder={`Highlight ${i + 1}`}
								style={{ flex: 1 }}
							/>
							<button type="button" className="btn btn-danger btn-sm" onClick={() => removeHighlight(i)} disabled={highlights.length === 1}>×</button>
						</div>
					))}
					<button type="button" className="btn btn-secondary btn-sm" onClick={addHighlight}>+ Add Highlight</button>
				</section>

				{/* ── Syllabus ── */}
				<section className="admin-card">
					<h2 className="admin-card-title">Syllabus</h2>
					<p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: 12 }}>Each item appears numbered in the Syllabus tab.</p>
					{syllabus.map((item, i) => (
						<div key={i} style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: '12px 16px', marginBottom: 12, background: '#f8fafc' }}>
							<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
								<span style={{ fontWeight: 600, color: '#64748b', fontSize: '0.85rem' }}>Topic {i + 1}</span>
								<div style={{ display: 'flex', gap: 6 }}>
									<button type="button" className="btn btn-secondary btn-sm" onClick={() => moveSyllabus(i, -1)} disabled={i === 0}>↑</button>
									<button type="button" className="btn btn-secondary btn-sm" onClick={() => moveSyllabus(i, 1)} disabled={i === syllabus.length - 1}>↓</button>
									<button type="button" className="btn btn-danger btn-sm" onClick={() => removeSyllabusItem(i)} disabled={syllabus.length === 1}>×</button>
								</div>
							</div>
							<div className="form-group" style={{ marginBottom: 8 }}>
								<label style={{ fontSize: '0.8rem' }}>Title</label>
								<input
									value={item.topic}
									onChange={(e) => updateSyllabus(i, 'topic', e.target.value)}
									placeholder="e.g. The Global Business Environment"
								/>
							</div>
							<div className="form-group" style={{ marginBottom: 0 }}>
								<label style={{ fontSize: '0.8rem' }}>Description</label>
								<textarea
									rows={2}
									value={item.desc}
									onChange={(e) => updateSyllabus(i, 'desc', e.target.value)}
									placeholder="Brief description of what is covered…"
								/>
							</div>
						</div>
					))}
					<button type="button" className="btn btn-secondary btn-sm" onClick={addSyllabusItem}>+ Add Syllabus Topic</button>
				</section>

				{/* ── Outcomes ── */}
				<section className="admin-card">
					<h2 className="admin-card-title">Learning Outcomes <small style={{ fontWeight: 400, color: '#64748b' }}>Bullet points shown in the Outcomes tab</small></h2>
					{outcomes.map((o, i) => (
						<div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
							<span style={{ color: '#24ade3', fontWeight: 700, lineHeight: '36px', fontSize: '1.1rem' }}>🎯</span>
							<input
								value={o}
								onChange={(e) => updateOutcome(i, e.target.value)}
								placeholder={`Outcome ${i + 1} — e.g. Explain the role of markets in resource allocation.`}
								style={{ flex: 1 }}
							/>
							<button type="button" className="btn btn-danger btn-sm" onClick={() => removeOutcome(i)} disabled={outcomes.length === 1}>×</button>
						</div>
					))}
					<button type="button" className="btn btn-secondary btn-sm" onClick={addOutcome}>+ Add Outcome</button>
				</section>

				{/* ── Lecturers ── */}
				<section className="admin-card">
					<h2 className="admin-card-title">Lecturers for this Course</h2>
					<p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: 12 }}>Select one or more lecturers who teach this course.</p>
					{lecturers.length === 0 && <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>No lecturers found. Add lecturers first.</p>}
					<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
						{lecturers.map((l) => {
							const checked = selectedLecturerIds.includes(String(l.id));
							return (
								<label
									key={l.id}
									style={{
										display: 'flex',
										alignItems: 'center',
										gap: 10,
										padding: '10px 12px',
										border: `2px solid ${checked ? '#24ade3' : '#e2e8f0'}`,
										borderRadius: 8,
										cursor: 'pointer',
										background: checked ? '#f0f9ff' : '#fff',
										transition: 'all 0.15s',
									}}
								>
									<input
										type="checkbox"
										checked={checked}
										onChange={() => toggleLecturer(String(l.id))}
										style={{ width: 16, height: 16, accentColor: '#24ade3' }}
									/>
									{l.imageUrl && (
										<img src={l.imageUrl} alt={l.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
									)}
									<div>
										<div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1b365d' }}>{l.name}</div>
										<div style={{ fontSize: '0.75rem', color: '#64748b' }}>{l.title}</div>
									</div>
								</label>
							);
						})}
					</div>
				</section>

				{/* ── Actions ── */}
				<div style={{ display: 'flex', gap: 12, paddingBottom: 40 }}>
					<button type="submit" className="btn btn-primary" disabled={saving}>
						{saving ? 'Saving…' : isEdit ? 'Update Course' : 'Create Course'}
					</button>
					<button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/courses')}>Cancel</button>
				</div>
			</form>
		</div>
	);
}
