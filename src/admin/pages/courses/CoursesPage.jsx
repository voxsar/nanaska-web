import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

const LEVELS = ['certificate', 'operational', 'management', 'strategic'];

const LEVEL_COLORS = {
	certificate: 'badge-blue',
	operational: 'badge-green',
	management: 'badge-yellow',
	strategic: 'badge-red',
};

function LecturerSlider({ ids, lecturerMap }) {
	const [index, setIndex] = useState(0);
	const timerRef = useRef(null);

	const lecturers = ids.map((id) => lecturerMap[id]).filter(Boolean);

	const advance = useCallback(() => {
		setIndex((i) => (i + 1) % lecturers.length);
	}, [lecturers.length]);

	useEffect(() => {
		if (lecturers.length <= 1) return;
		timerRef.current = setInterval(advance, 3000);
		return () => clearInterval(timerRef.current);
	}, [advance, lecturers.length]);

	const handleClick = () => {
		if (lecturers.length <= 1) return;
		clearInterval(timerRef.current);
		advance();
		timerRef.current = setInterval(advance, 3000);
	};

	if (lecturers.length === 0) return <span style={{ color: '#94a3b8' }}>—</span>;

	const lec = lecturers[index];

	return (
		<div
			onClick={handleClick}
			title={lecturers.length > 1 ? 'Click to cycle' : undefined}
			style={{
				display: 'flex',
				alignItems: 'center',
				gap: '6px',
				cursor: lecturers.length > 1 ? 'pointer' : 'default',
				userSelect: 'none',
				minWidth: 0,
			}}
		>
			{lec.imageUrl && (
				<img
					src={lec.imageUrl}
					alt={lec.name}
					style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1.5px solid #e2e8f0' }}
				/>
			)}
			<span style={{ fontSize: '0.8rem', color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 130 }}>
				{lec.name}
			</span>
			{lecturers.length > 1 && (
				<span style={{ fontSize: '0.7rem', color: '#94a3b8', flexShrink: 0 }}>
					{index + 1}/{lecturers.length}
				</span>
			)}
		</div>
	);
}

export default function CoursesPage() {
	const [courses, setCourses] = useState([]);
	const [lecturerMap, setLecturerMap] = useState({});
	const [loading, setLoading] = useState(true);
	const [filterLevel, setFilterLevel] = useState('');
	const [success, setSuccess] = useState('');
	const [page, setPage] = useState(1);
	const PAGE_SIZE = 20;

	useEffect(() => {
		Promise.all([
			api.get('/courses'),
			api.get('/lecturers'),
		]).then(([coursesRes, lecturersRes]) => {
			setCourses(coursesRes.data);
			const map = {};
			for (const l of lecturersRes.data) map[l.id] = l;
			setLecturerMap(map);
		}).finally(() => setLoading(false));
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
	const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
	const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

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
					onChange={(e) => { setFilterLevel(e.target.value); setPage(1); }}
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
				<>
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
								{paginated.map((c) => (
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
										<td>
											<LecturerSlider ids={c.lecturerIds || []} lecturerMap={lecturerMap} />
										</td>
										<td>
											<div style={{ display: 'flex', gap: '8px' }}>
												<Link to={`/admin/courses/${c.id}/edit`} className="btn btn-secondary btn-sm">Edit</Link>
												<button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>Delete</button>
											</div>
										</td>
									</tr>
								))}
								{paginated.length === 0 && (
									<tr><td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8', padding: '32px' }}>No courses found</td></tr>
								)}
							</tbody>
						</table>
					</div>
					{totalPages > 1 && (
						<div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 16, justifyContent: 'flex-end' }}>
							<button className="btn btn-secondary btn-sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>
							<span style={{ fontSize: '0.875rem', color: '#64748b' }}>Page {page} / {totalPages}</span>
							<button className="btn btn-secondary btn-sm" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>›</button>
						</div>
					)}
				</>
			)}
		</div>
	);
}
