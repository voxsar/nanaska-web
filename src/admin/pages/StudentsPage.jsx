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
	const [selectedEnrollment, setSelectedEnrollment] = useState(null);
	const [syncing, setSyncing] = useState(false);

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

	const handleSyncToGoogleSheets = async () => {
		setSyncing(true);
		try {
			const response = await api.post('/admin/enrollment-submissions/sync-google-sheets');
			alert(response.data.message || 'Successfully synced to Google Sheets');
		} catch (error) {
			alert(error.response?.data?.message || 'Failed to sync to Google Sheets');
		} finally {
			setSyncing(false);
		}
	};

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
					{mainTab === 'unpaid' && (
						<button
							className="btn btn-primary btn-sm"
							onClick={handleSyncToGoogleSheets}
							disabled={syncing}
							style={{ marginLeft: 'auto' }}
						>
							{syncing ? 'Syncing...' : '📊 Sync to Google Sheets'}
						</button>
					)}
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
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{paginated.map((r, idx) => {
									const fullRecord = unpaidEnrollments.find(e => e.id === r.id);
									return (
										<tr key={r.id}>
											<td style={{ fontSize: '0.8rem', color: '#64748b' }}>{new Date(r.createdAt).toLocaleDateString()}</td>
											<td style={{ fontWeight: 500 }}>{r.name}</td>
											<td style={{ fontSize: '0.8rem' }}>{r.email}</td>
											<td style={{ fontSize: '0.8rem' }}>{r.phone}</td>
											<td style={{ fontSize: '0.8rem' }}>{r.country}</td>
											<td style={{ fontSize: '0.8rem' }}>{r.cimaStage}</td>
											<td style={{ fontWeight: 600 }}>{r.currency} {r.amount?.toLocaleString()}</td>
											<td>
												<button
													className="btn btn-secondary btn-sm"
													onClick={() => setSelectedEnrollment(fullRecord)}
													style={{ fontSize: '0.75rem', padding: '4px 8px' }}
												>
													View Details
												</button>
											</td>
										</tr>
									);
								})}
								{paginated.length === 0 && (
									<tr><td colSpan={8} style={{ textAlign: 'center', color: '#94a3b8', padding: '32px' }}>No unpaid enrollments found</td></tr>
								)}
							</tbody>
						</table>
					</div>
					<Pagination page={page} total={searched.length} pageSize={PAGE_SIZE} onPage={setPage} />
				</>
			)}

			{/* Enrollment Details Modal */}
			{selectedEnrollment && (
				<div className="admin-modal-overlay" onClick={() => setSelectedEnrollment(null)}>
					<div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
						<div className="admin-modal-header">
							<h2>Enrollment Submission Details</h2>
							<button className="modal-close" onClick={() => setSelectedEnrollment(null)}>×</button>
						</div>
						<div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.875rem' }}>
							{/* Personal Information */}
							<div>
								<h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px', color: '#1B365D' }}>Personal Information</h3>
								<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
									<div><strong>First Name:</strong> {selectedEnrollment.firstName || '—'}</div>
									<div><strong>Last Name:</strong> {selectedEnrollment.lastName || '—'}</div>
									<div><strong>Email:</strong> {selectedEnrollment.email || '—'}</div>
									<div><strong>Phone:</strong> {selectedEnrollment.phone || '—'}</div>
									<div><strong>WhatsApp:</strong> {selectedEnrollment.whatsapp || '—'}</div>
									<div><strong>Gender:</strong> {selectedEnrollment.gender || '—'}</div>
									<div><strong>Date of Birth:</strong> {selectedEnrollment.dob || '—'}</div>
								</div>
							</div>

							{/* CIMA Information */}
							<div>
								<h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px', color: '#1B365D' }}>CIMA Information</h3>
								<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
									<div><strong>CIMA ID:</strong> {selectedEnrollment.cimaId || '—'}</div>
									<div><strong>CIMA Stage:</strong> {selectedEnrollment.cimaStage || '—'}</div>
								</div>
							</div>

							{/* Location */}
							<div>
								<h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px', color: '#1B365D' }}>Location</h3>
								<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
									<div><strong>Country:</strong> {selectedEnrollment.country || '—'}</div>
									<div><strong>City:</strong> {selectedEnrollment.city || '—'}</div>
									<div><strong>Postcode:</strong> {selectedEnrollment.postcode || '—'}</div>
								</div>
							</div>

							{/* Payment Information */}
							<div>
								<h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px', color: '#1B365D' }}>Payment Information</h3>
								<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
									<div><strong>Amount:</strong> {selectedEnrollment.currency} {selectedEnrollment.amount?.toLocaleString() || '0'}</div>
									<div><strong>Order ID:</strong> {selectedEnrollment.orderId || '—'}</div>
								</div>
							</div>

							{/* Cart Items */}
							{selectedEnrollment.cartJson && Array.isArray(selectedEnrollment.cartJson) && selectedEnrollment.cartJson.length > 0 && (
								<div>
									<h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px', color: '#1B365D' }}>Cart Items</h3>
									<div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
										{selectedEnrollment.cartJson.map((item, idx) => (
											<div key={idx} style={{ marginBottom: '4px' }}>
												• {item.title || item.name || 'Unknown Course'}
												{item.combinationId && ` (${item.combinationId})`}
												{item.courseCode && ` (${item.courseCode})`}
											</div>
										))}
									</div>
								</div>
							)}

							{/* Notes */}
							{selectedEnrollment.notes && (
								<div>
									<h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px', color: '#1B365D' }}>Notes</h3>
									<div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', whiteSpace: 'pre-wrap' }}>
										{selectedEnrollment.notes}
									</div>
								</div>
							)}

							{/* Timestamp */}
							<div style={{ paddingTop: '8px', borderTop: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.8rem' }}>
								<strong>Submitted:</strong> {new Date(selectedEnrollment.createdAt).toLocaleString()}
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
