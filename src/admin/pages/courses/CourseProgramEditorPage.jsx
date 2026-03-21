import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api';

const LEVELS = ['certificate', 'operational', 'management', 'strategic'];

const EMPTY_FORM = {
	id: '',
	name: '',
	slug: '',
	level: 'certificate',
	price: 0,
	priceGbp: 0,
};

export default function CourseProgramEditorPage() {
	const { id } = useParams();
	const navigate = useNavigate();
	const isEdit = Boolean(id);

	const [form, setForm] = useState({ ...EMPTY_FORM });
	const [selectedCourseIds, setSelectedCourseIds] = useState([]);
	const [allCourses, setAllCourses] = useState([]);
	const [loading, setLoading] = useState(isEdit);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');

	// Load all available subjects/courses for checkbox selection
	useEffect(() => {
		api.get('/courses').then((r) => setAllCourses(r.data)).catch(() => { });
	}, []);

	// Load existing program for edit
	useEffect(() => {
		if (!isEdit) return;
		api.get(`/courses/combinations/${id}`)
			.then((r) => {
				const p = r.data;
				setForm({
					id: p.id,
					name: p.name || '',
					slug: p.slug || '',
					level: p.level || 'certificate',
					price: p.price || 0,
					priceGbp: p.priceGbp || 0,
				});
				setSelectedCourseIds(p.items?.map((item) => item.course?.id || item.courseId) || []);
			})
			.catch(() => setError('Failed to load program'))
			.finally(() => setLoading(false));
	}, [id, isEdit]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm((prev) => ({
			...prev,
			[name]: (name === 'price' || name === 'priceGbp') ? Number(value) : value,
			// Auto-generate slug from name when creating
			...(name === 'name' && !isEdit
				? { slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') }
				: {}),
		}));
	};

	const toggleCourse = (courseId) => {
		setSelectedCourseIds((prev) =>
			prev.includes(courseId) ? prev.filter((c) => c !== courseId) : [...prev, courseId]
		);
	};

	const handleSave = async (e) => {
		e.preventDefault();
		if (selectedCourseIds.length === 0) {
			setError('Please select at least one subject for this program.');
			return;
		}
		setSaving(true);
		setError('');
		setSuccess('');
		try {
			const payload = {
				...form,
				slug: form.slug || null,
				courseIds: selectedCourseIds,
			};
			if (isEdit) {
				const { id: _id, ...rest } = payload;
				await api.put(`/courses/combinations/${id}`, rest);
			} else {
				await api.post('/courses/combinations', payload);
			}
			setSuccess(`Program ${isEdit ? 'updated' : 'created'} successfully!`);
			setTimeout(() => navigate('/admin/course-programs'), 1200);
		} catch (err) {
			setError(err.response?.data?.message || 'Failed to save program');
		} finally {
			setSaving(false);
		}
	};

	if (loading) return <div className="admin-loading">Loading…</div>;

	// Group courses by level for easier selection
	const coursesByLevel = allCourses.reduce((acc, course) => {
		if (!acc[course.level]) acc[course.level] = [];
		acc[course.level].push(course);
		return acc;
	}, {});

	return (
		<div style={{ maxWidth: 720, margin: '0 auto' }}>
			<div className="page-title-row">
				<h1>{isEdit ? 'Edit Course Program' : 'Add Course Program'}</h1>
				<button className="btn btn-secondary" onClick={() => navigate('/admin/course-programs')}>← Back</button>
			</div>

			{error && <div className="admin-alert admin-alert-error" style={{ marginBottom: 16 }}>{error}</div>}
			{success && <div className="admin-alert admin-alert-success" style={{ marginBottom: 16 }}>{success}</div>}

			<form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

				{/* Basic Info */}
				<section className="admin-card">
					<h2 className="admin-card-title">Program Details</h2>
					<div className="admin-form-grid">
						<div className="form-group">
							<label>Program ID * <small style={{ color: '#94a3b8' }}>(e.g. cert_full)</small></label>
							<input
								name="id"
								required
								value={form.id}
								onChange={handleChange}
								disabled={isEdit}
								placeholder="e.g. cert_full"
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
							<label>Display Name * <small style={{ color: '#94a3b8' }}>Shown in navigation and cart</small></label>
							<input
								name="name"
								required
								value={form.name}
								onChange={handleChange}
								placeholder="e.g. CIMA Certificate Level"
							/>
						</div>
						<div className="form-group full">
							<label>
								URL Slug <small style={{ color: '#94a3b8' }}>Used for the navigation link (e.g. cima-certificate-level)</small>
							</label>
							<input
								name="slug"
								value={form.slug}
								onChange={handleChange}
								placeholder="e.g. cima-certificate-level"
							/>
						</div>
					</div>
				</section>

				{/* Pricing */}
				<section className="admin-card">
					<h2 className="admin-card-title">Pricing</h2>
					<p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: 12 }}>
						Set the package price for this program. This is the price charged when a student enrolls in the full program,
						which may differ from the sum of individual subject prices.
					</p>
					<div className="admin-form-grid">
						<div className="form-group">
							<label>Price (LKR) *</label>
							<input
								name="price"
								type="number"
								required
								min={0}
								value={form.price}
								onChange={handleChange}
								placeholder="e.g. 64000"
							/>
						</div>
						<div className="form-group">
							<label>Price (GBP) *</label>
							<input
								name="priceGbp"
								type="number"
								required
								min={0}
								value={form.priceGbp}
								onChange={handleChange}
								placeholder="e.g. 360"
							/>
						</div>
					</div>
				</section>

				{/* Subject Selection */}
				<section className="admin-card">
					<h2 className="admin-card-title">Included Subjects</h2>
					<p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: 16 }}>
						Select which subjects are included in this program. These will appear as sub-menu items in the navigation.
					</p>
					{Object.keys(coursesByLevel).length === 0 ? (
						<p style={{ color: '#94a3b8' }}>No subjects available. Add subjects first.</p>
					) : (
						Object.entries(coursesByLevel).map(([lvl, courses]) => (
							<div key={lvl} style={{ marginBottom: 16 }}>
								<h3 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: 8 }}>
									{lvl.charAt(0).toUpperCase() + lvl.slice(1)}
								</h3>
								<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
									{courses.map((course) => (
										<label
											key={course.id}
											style={{
												display: 'flex',
												alignItems: 'center',
												gap: 8,
												padding: '8px 12px',
												border: `1.5px solid ${selectedCourseIds.includes(course.id) ? '#3b82f6' : '#e2e8f0'}`,
												borderRadius: 8,
												cursor: 'pointer',
												background: selectedCourseIds.includes(course.id) ? '#eff6ff' : '#fff',
												transition: 'all 0.15s',
											}}
										>
											<input
												type="checkbox"
												checked={selectedCourseIds.includes(course.id)}
												onChange={() => toggleCourse(course.id)}
											/>
											<span style={{ fontWeight: 600, color: '#3b82f6', fontSize: '0.85rem' }}>{course.id}</span>
											<span style={{ fontSize: '0.8rem', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
												{course.name}
											</span>
										</label>
									))}
								</div>
							</div>
						))
					)}
					{selectedCourseIds.length > 0 && (
						<p style={{ marginTop: 12, fontSize: '0.875rem', color: '#16a34a', fontWeight: 500 }}>
							✓ {selectedCourseIds.length} subject{selectedCourseIds.length !== 1 ? 's' : ''} selected: {selectedCourseIds.join(', ')}
						</p>
					)}
				</section>

				<div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
					<button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/course-programs')}>Cancel</button>
					<button type="submit" className="btn btn-primary" disabled={saving}>
						{saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Program'}
					</button>
				</div>
			</form>
		</div>
	);
}
