import { useState, useEffect } from 'react';
import api from '../api';

const PAGE_SIZE = 20;

function applyDateFilter(items, dateKey, filter) {
	if (filter === 'all') return items;
	const now = new Date();
	return items.filter((item) => {
		const d = new Date(item[dateKey]);
		if (filter === 'today') {
			return d.toDateString() === now.toDateString();
		}
		if (filter === 'month') {
			return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
		}
		if (filter === 'year') {
			return d.getFullYear() === now.getFullYear();
		}
		return true;
	});
}

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

export default function StudentsPage() {
	const [paidStudents, setPaidStudents] = useState([]);
	const [unpaidEnrollments, setUnpaidEnrollments] = useState([]);
	const [loading, setLoading] = useState(true);
	const [mainTab, setMainTab] = useState('paid');
	const [dateFilter, setDateFilter] = useState('all');
	const [search, setSearch] = useState('');
	const [page, setPage] = useState(1);

	useEffect(() => {
		Promise.all([
			api.get('/admin/paid-students').then((r) => r.data).catch(() => []),
			api.get('/admin/enrollment-submissions').then((r) => r.data).catch(() => []),
		]).then(([paid, unpaid]) => {
			setPaidStudents(paid);
			setUnpaidEnrollments(unpaid);
		}).finally(() => setLoading(false));
	}, []);

	const switchTab = (tab) => { setMainTab(tab); setPage(1); setDateFilter('all'); setSearch(''); };
	const switchDate = (f) => { setDateFilter(f); setPage(1); };

	const rawPaid = paidStudents.map((o) => ({
		id: o.id,
		name: o.user?.name || o.guestName || '—',
		email: o.user?.email || o.guestEmail || '—',
		courses: o.combination?.items?.map((i) => i.course?.id).join(', ') || '—',
		currency: o.currency,
		amount: o.amount,
		createdAt: o.createdAt,
	}));

	const rawUnpaid = unpaidEnrollments.map((s) => ({
		id: s.id,
		name: `${s.firstName} ${s.lastName}`.trim() || '—',
		email: s.email || '—',
		phone: s.phone || '—',
		country: s.country || '—',
		cimaStage: s.cimaStage || '—',
		currency: s.currency,
		amount: s.amount,
		createdAt: s.createdAt,
	}));

	const source = mainTab === 'paid' ? rawPaid : rawUnpaid;
	const dateSrc = applyDateFilter(source, 'createdAt', dateFilter);
	const searched = dateSrc.filter((r) =>
		r.name.toLowerCase().includes(search.toLowerCase()) ||
		r.email.toLowerCase().includes(search.toLowerCase())
	);
	const paginated = searched.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

	const DATE_TABS = [
		{ key: 'all', label: 'All Time' },
		{ key: 'today', label: 'Today' },
		{ key: 'month', label: 'This Month' },
		{ key: 'year', label: 'This Year' },
	];

	return (
		<div>
			<div className="page-title-row">
				<h1>Students</h1>
				<div style={{ display: 'flex', gap: 8 }}>
					<span className="badge badge-green">{rawPaid.length} paid</span>
					<span className="badge badge-yellow">{rawUnpaid.length} unpaid</span>
				</div>
			</div>

			{/* Main tabs */}
			<div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #e2e8f0', marginBottom: 16 }}>
				{[{ key: 'paid', label: '✅ Paid Students' }, { key: 'unpaid', label: '⏳ Unpaid Enrollments' }].map(({ key, label }) => (
					<button
						key={key}
						onClick={() => switchTab(key)}
						style={{
							padding: '10px 20px',
							border: 'none',
							background: 'none',
							cursor: 'pointer',
							fontWeight: mainTab === key ? 700 : 400,
							color: mainTab === key ? '#1B365D' : '#64748b',
							borderBottom: mainTab === key ? '2px solid #1B365D' : '2px solid transparent',
							marginBottom: -2,
							fontSize: '0.9rem',
						}}
					>{label}</button>
				))}
			</div>

			{/* Date sub-tabs */}
			<div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
				{DATE_TABS.map(({ key, label }) => (
					<button
						key={key}
						onClick={() => switchDate(key)}
						style={{
							padding: '5px 14px',
							borderRadius: 20,
							border: '1px solid',
							borderColor: dateFilter === key ? '#24ADE3' : '#e2e8f0',
							background: dateFilter === key ? '#24ADE3' : '#fff',
							color: dateFilter === key ? '#fff' : '#64748b',
							cursor: 'pointer',
							fontSize: '0.8rem',
							fontWeight: dateFilter === key ? 600 : 400,
						}}
					>{label}</button>
				))}
			</div>

			<div className="admin-filter-bar">
				<input
					className="admin-search"
					placeholder="Search by name or email…"
					value={search}
					onChange={(e) => { setSearch(e.target.value); setPage(1); }}
				/>
				<span style={{ color: '#64748b', fontSize: '0.875rem' }}>{searched.length} records</span>
			</div>

			{loading ? (
				<div className="admin-loading">Loading…</div>
			) : mainTab === 'paid' ? (
				<>
					<div className="admin-table-wrap">
						<table className="admin-table">
							<thead>
								<tr>
									<th>Date</th>
									<th>Name</th>
									<th>Email</th>
									<th>Courses</th>
									<th>Amount</th>
								</tr>
							</thead>
							<tbody>
								{paginated.map((r) => (
									<tr key={r.id}>
										<td style={{ fontSize: '0.8rem', color: '#64748b' }}>{new Date(r.createdAt).toLocaleDateString()}</td>
										<td style={{ fontWeight: 500 }}>{r.name}</td>
										<td style={{ fontSize: '0.8rem' }}>{r.email}</td>
										<td style={{ fontSize: '0.8rem' }}>{r.courses}</td>
										<td style={{ fontWeight: 600 }}>{r.currency} {r.amount?.toLocaleString()}</td>
									</tr>
								))}
								{paginated.length === 0 && (
									<tr><td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8', padding: '32px' }}>No paid students found</td></tr>
								)}
							</tbody>
						</table>
					</div>
					<Pagination page={page} total={searched.length} pageSize={PAGE_SIZE} onPage={setPage} />
				</>
			) : (
				<>
					<div className="admin-table-wrap">
						<table className="admin-table">
							<thead>
								<tr>
									<th>Date</th>
									<th>Name</th>
									<th>Email</th>
									<th>Phone</th>
									<th>Country</th>
									<th>CIMA Stage</th>
									<th>Amount</th>
								</tr>
							</thead>
							<tbody>
								{paginated.map((r) => (
									<tr key={r.id}>
										<td style={{ fontSize: '0.8rem', color: '#64748b' }}>{new Date(r.createdAt).toLocaleDateString()}</td>
										<td style={{ fontWeight: 500 }}>{r.name}</td>
										<td style={{ fontSize: '0.8rem' }}>{r.email}</td>
										<td style={{ fontSize: '0.8rem' }}>{r.phone}</td>
										<td style={{ fontSize: '0.8rem' }}>{r.country}</td>
										<td style={{ fontSize: '0.8rem' }}>{r.cimaStage}</td>
										<td style={{ fontWeight: 600 }}>{r.currency} {r.amount?.toLocaleString()}</td>
									</tr>
								))}
								{paginated.length === 0 && (
									<tr><td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8', padding: '32px' }}>No unpaid enrollments found</td></tr>
								)}
							</tbody>
						</table>
					</div>
					<Pagination page={page} total={searched.length} pageSize={PAGE_SIZE} onPage={setPage} />
				</>
			)}
		</div>
	);
}
