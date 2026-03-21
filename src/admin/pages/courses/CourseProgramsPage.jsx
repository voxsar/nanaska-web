import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

const LEVEL_COLORS = {
	certificate: 'badge-blue',
	operational: 'badge-green',
	management: 'badge-yellow',
	strategic: 'badge-red',
};

export default function CourseProgramsPage() {
	const [programs, setPrograms] = useState([]);
	const [loading, setLoading] = useState(true);
	const [success, setSuccess] = useState('');
	const [filterLevel, setFilterLevel] = useState('');
	const [showAll, setShowAll] = useState(false);

	const LEVELS = ['certificate', 'operational', 'management', 'strategic'];

	useEffect(() => {
		api.get('/courses/combinations')
			.then((r) => setPrograms(r.data))
			.finally(() => setLoading(false));
	}, []);

	const handleDelete = async (id) => {
		if (!confirm(`Delete program "${id}"? This cannot be undone if there are no linked orders.`)) return;
		try {
			await api.delete(`/courses/combinations/${id}`);
			setPrograms((prev) => prev.filter((p) => p.id !== id));
			setSuccess('Program deleted.');
			setTimeout(() => setSuccess(''), 3000);
		} catch (err) {
			alert(err.response?.data?.message || 'Failed to delete program');
		}
	};

	// By default, show only named programs (the "course-level" programs visible in Navbar).
	// Admin can toggle to show all (including auto-created single-subject combos).
	const filtered = programs
		.filter((p) => (showAll ? true : p.name))
		.filter((p) => !filterLevel || p.level === filterLevel);

	return (
		<div>
			<div className="page-title-row">
				<h1>Course Programs</h1>
				<Link to="/admin/course-programs/new" className="btn btn-primary">+ Add Program</Link>
			</div>

			<p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: 16 }}>
				Course programs are the enrollable packages (e.g. "CIMA Certificate Level") that appear in the navigation and cart.
				Each program has its own LKR and GBP price. Individual subject combinations are auto-generated separately.
			</p>

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
				<label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', color: '#64748b', cursor: 'pointer' }}>
					<input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} />
					Show all combinations (including auto-generated singles)
				</label>
				<span style={{ color: '#64748b', fontSize: '0.875rem' }}>{filtered.length} program{filtered.length !== 1 ? 's' : ''}</span>
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
								<th>Price (GBP)</th>
								<th>Subjects</th>
								<th>Slug</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{filtered.map((p) => (
								<tr key={p.id}>
									<td style={{ fontWeight: 600, color: '#3b82f6', fontFamily: 'monospace', fontSize: '0.8rem' }}>{p.id}</td>
									<td style={{ fontWeight: p.name ? 500 : 400, color: p.name ? '#0f172a' : '#94a3b8' }}>
										{p.name || <em>unnamed</em>}
									</td>
									<td>
										<span className={`badge ${LEVEL_COLORS[p.level] || 'badge-gray'}`}>{p.level}</span>
									</td>
									<td>{p.price?.toLocaleString() || '—'}</td>
									<td style={{ color: p.priceGbp ? '#16a34a' : '#ef4444', fontWeight: p.priceGbp ? 400 : 600 }}>
										{p.priceGbp ? `£${p.priceGbp.toLocaleString()}` : '⚠ Not set'}
									</td>
									<td style={{ fontSize: '0.8rem', color: '#64748b' }}>
										{p.items?.map((item) => item.course?.id || item.courseId).join(', ') || '—'}
									</td>
									<td style={{ fontSize: '0.8rem', color: '#64748b', fontFamily: 'monospace' }}>
										{p.slug || <span style={{ color: '#ef4444' }}>⚠ No slug</span>}
									</td>
									<td>
										<div style={{ display: 'flex', gap: 8 }}>
											<Link to={`/admin/course-programs/${p.id}/edit`} className="btn btn-secondary btn-sm">Edit</Link>
											{!p.orders?.length && (
												<button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Delete</button>
											)}
										</div>
									</td>
								</tr>
							))}
							{filtered.length === 0 && (
								<tr>
									<td colSpan={8} style={{ textAlign: 'center', color: '#94a3b8', padding: 32 }}>
										No programs found. <Link to="/admin/course-programs/new">Create one</Link>.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
