import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

const LEVELS = ['certificate', 'operational', 'management', 'strategic'];

const LEVEL_COLORS = {
	certificate: 'badge-blue',
	operational: 'badge-green',
	management: 'badge-yellow',
	strategic: 'badge-red',
};

export default function CoursesPage() {
	const [courses, setCourses] = useState([]);
	const [loading, setLoading] = useState(true);
	const [filterLevel, setFilterLevel] = useState('');
	const [success, setSuccess] = useState('');

	useEffect(() => {
		api.get('/courses').then((r) => setCourses(r.data)).finally(() => setLoading(false));
	}, []);

	const handleDelete = async (id) => {
		if (!confirm('Delete this course? This may affect existing orders.')) return;
		try {
			await api.delete(`/courses/${id}`);
			setCourses((prev) => prev.filter((c) => c.id !== id));
			setSuccess('Course deleted.');
			setTimeout(() => setSuccess(''), 3000);
		} catch {
			alert('Failed to delete course');
		}
	};

	const filtered = courses.filter((c) => !filterLevel || c.level === filterLevel);

	return (
		<div>
			<div className="page-title-row">
				<h1>Courses</h1>
				<Link to="/admin/courses/new" className="btn btn-primary">+ Add Course</Link>
			</div>

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
				<span style={{ color: '#64748b', fontSize: '0.875rem' }}>{filtered.length} course{filtered.length !== 1 ? 's' : ''}</span>
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
								<th>Duration</th>
								<th>Lecturers</th>
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
									<td>{c.price?.toLocaleString()}</td>
									<td style={{ color: '#64748b', fontSize: '0.85rem' }}>{c.duration || '—'}</td>
									<td style={{ fontSize: '0.8rem', color: '#64748b' }}>
										{Array.isArray(c.lecturerIds) && c.lecturerIds.length > 0 ? `${c.lecturerIds.length} assigned` : '—'}
									</td>
									<td>
										<div style={{ display: 'flex', gap: '8px' }}>
											<Link to={`/admin/courses/${c.id}/edit`} className="btn btn-secondary btn-sm">Edit</Link>
											<button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>Delete</button>
										</div>
									</td>
								</tr>
							))}
							{filtered.length === 0 && (
								<tr><td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8', padding: '32px' }}>No courses found</td></tr>
							)}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
