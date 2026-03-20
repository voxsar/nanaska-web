import { useState, useEffect } from 'react';
import api from '../api';

const PAGE_SIZE = 20;

function Pagination({ page, total, pageSize, onPage }) {
	const totalPages = Math.ceil(total / pageSize);
	if (totalPages <= 1) return null;
	return (
		<div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 16, justifyContent: 'flex-end' }}>
			<button className="btn btn-secondary btn-sm" onClick={() => onPage(page - 1)} disabled={page === 1}>‹</button>
			<span style={{ fontSize: '0.875rem', color: '#64748b' }}>Page {page} / {totalPages}</span>
			<button className="btn btn-secondary btn-sm" onClick={() => onPage(page + 1)} disabled={page === totalPages}>›</button>
		</div>
	);
}

export default function NewsletterPage() {
	const [signups, setSignups] = useState([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState('');
	const [page, setPage] = useState(1);

	useEffect(() => {
		api.get('/admin/newsletter').then((r) => setSignups(r.data)).finally(() => setLoading(false));
	}, []);

	const filtered = signups.filter(
		(s) =>
			(s.email || '').toLowerCase().includes(search.toLowerCase()) ||
			(s.name || '').toLowerCase().includes(search.toLowerCase()),
	);
	const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

	const exportCSV = () => {
		const rows = [['Name', 'Email', 'Date'], ...filtered.map((s) => [s.name || '', s.email, new Date(s.createdAt).toLocaleDateString()])];
		const csv = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
		const blob = new Blob([csv], { type: 'text/csv' });
		const a = document.createElement('a');
		a.href = URL.createObjectURL(blob);
		a.download = 'newsletter-signups.csv';
		a.click();
	};

	return (
		<div>
			<div className="page-title-row">
				<h1>Newsletter Signups</h1>
				<button className="btn btn-secondary" onClick={exportCSV}>⬇ Export CSV</button>
			</div>

			<div className="admin-filter-bar">
				<input
					className="admin-search"
					placeholder="Search by name or email…"
					value={search}
					onChange={(e) => { setSearch(e.target.value); setPage(1); }}
				/>
				<span style={{ color: '#64748b', fontSize: '0.875rem' }}>{filtered.length} signups</span>
			</div>

			{loading ? (
				<div className="admin-loading">Loading…</div>
			) : (
				<>
					<div className="admin-table-wrap">
						<table className="admin-table">
							<thead>
								<tr>
									<th>#</th>
									<th>Name</th>
									<th>Email</th>
									<th>Date</th>
								</tr>
							</thead>
							<tbody>
								{paginated.map((s, i) => (
									<tr key={s.id}>
										<td style={{ color: '#94a3b8' }}>{(page - 1) * PAGE_SIZE + i + 1}</td>
										<td>{s.name || '—'}</td>
										<td>{s.email}</td>
										<td style={{ color: '#64748b', fontSize: '0.8rem' }}>
											{new Date(s.createdAt).toLocaleDateString()}
										</td>
									</tr>
								))}
								{paginated.length === 0 && (
									<tr><td colSpan={4} style={{ textAlign: 'center', color: '#94a3b8', padding: '32px' }}>No signups yet</td></tr>
								)}
							</tbody>
						</table>
					</div>
					<Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onPage={setPage} />
				</>
			)}
		</div>
	);
}
