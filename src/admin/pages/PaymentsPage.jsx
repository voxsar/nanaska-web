import { useState, useEffect } from 'react';
import api from '../api';

const STATUS_BADGE = {
	PAID: 'badge-green',
	PENDING: 'badge-yellow',
	FAILED: 'badge-red',
	REFUNDED: 'badge-gray',
};

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

export default function PaymentsPage() {
	const [payments, setPayments] = useState([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState('');
	const [filterStatus, setFilterStatus] = useState('');
	const [page, setPage] = useState(1);

	useEffect(() => {
		api.get('/admin/payments').then((r) => setPayments(r.data)).finally(() => setLoading(false));
	}, []);

	const filtered = payments.filter((p) => {
		const matchSearch =
			(p.user?.email || p.guestEmail || '').toLowerCase().includes(search.toLowerCase()) ||
			(p.user?.name || p.guestName || '').toLowerCase().includes(search.toLowerCase());
		const matchStatus = !filterStatus || p.status === filterStatus;
		return matchSearch && matchStatus;
	});
	const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

	const totalRevenue = filtered
		.filter((p) => p.status === 'PAID')
		.reduce((acc, p) => acc + p.amount, 0);

	return (
		<div>
			<div className="page-title-row">
				<h1>Payments</h1>
				<span style={{ background: '#dcfce7', color: '#16a34a', borderRadius: '8px', padding: '6px 12px', fontSize: '0.875rem', fontWeight: 600 }}>
					Revenue: LKR {totalRevenue.toLocaleString()}
				</span>
			</div>

			<div className="admin-filter-bar">
				<input
					className="admin-search"
					placeholder="Search by name or email…"
					value={search}
					onChange={(e) => { setSearch(e.target.value); setPage(1); }}
				/>
				<select
					value={filterStatus}
					onChange={(e) => setFilterStatus(e.target.value)}
					style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.875rem' }}
				>
					<option value="">All Statuses</option>
					<option value="PAID">Paid</option>
					<option value="PENDING">Pending</option>
					<option value="FAILED">Failed</option>
					<option value="REFUNDED">Refunded</option>
				</select>
				<span style={{ color: '#64748b', fontSize: '0.875rem' }}>{filtered.length} payments</span>
			</div>

			{loading ? (
				<div className="admin-loading">Loading…</div>
			) : (
				<>
					<div className="admin-table-wrap">
						<table className="admin-table">
							<thead>
								<tr>
									<th>Date</th>
									<th>Customer</th>
									<th>Email</th>
									<th>Courses</th>
									<th>Amount (LKR)</th>
									<th>Currency</th>
									<th>Status</th>
									<th>Ref</th>
								</tr>
							</thead>
							<tbody>
								{paginated.map((p) => {
									const name = p.user?.name || p.guestName || '—';
									const email = p.user?.email || p.guestEmail || '—';
									const courses = p.combination?.items?.map((i) => i.course?.id).join(', ') || '—';
									return (
										<tr key={p.id}>
											<td style={{ fontSize: '0.8rem', color: '#64748b' }}>{new Date(p.createdAt).toLocaleDateString()}</td>
											<td style={{ fontWeight: 500 }}>{name}</td>
											<td style={{ fontSize: '0.8rem' }}>{email}</td>
											<td style={{ fontSize: '0.8rem' }}>{courses}</td>
											<td style={{ fontWeight: 600 }}>{p.amount.toLocaleString()}</td>
											<td style={{ fontSize: '0.8rem' }}>{p.currency}</td>
											<td><span className={`badge ${STATUS_BADGE[p.status] || 'badge-gray'}`}>{p.status}</span></td>
											<td style={{ fontSize: '0.75rem', color: '#94a3b8', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
												{p.ipgRef || '—'}
											</td>
										</tr>
									);
								})}
								{paginated.length === 0 && (
									<tr><td colSpan={8} style={{ textAlign: 'center', color: '#94a3b8', padding: '32px' }}>No payments found</td></tr>
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
