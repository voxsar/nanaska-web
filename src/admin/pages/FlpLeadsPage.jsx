import { useState, useEffect } from 'react';
import api from '../api';
import {
	DetailGrid,
	DetailModal,
	DetailSection,
	formatDate,
	formatDateTime,
} from '../components/RecordDetails';

const PAGE_SIZE = 20;

function applyDateFilter(items, dateKey, filter) {
	if (filter === 'all') return items;
	const now = new Date();
	return items.filter((item) => {
		const d = new Date(item[dateKey]);
		if (filter === 'today') return d.toDateString() === now.toDateString();
		if (filter === 'month') return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
		if (filter === 'year') return d.getFullYear() === now.getFullYear();
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

const DATE_TABS = [
	{ key: 'all', label: 'All Time' },
	{ key: 'today', label: 'Today' },
	{ key: 'month', label: 'This Month' },
	{ key: 'year', label: 'This Year' },
];

export default function FlpLeadsPage() {
	const [leads, setLeads] = useState([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState('');
	const [dateFilter, setDateFilter] = useState('all');
	const [page, setPage] = useState(1);
	const [selected, setSelected] = useState(null);
	const [exporting, setExporting] = useState(false);

	useEffect(() => {
		api.get('/flp-leads')
			.then((r) => setLeads(r.data))
			.catch(() => setLeads([]))
			.finally(() => setLoading(false));
	}, []);

	const dateSrc = applyDateFilter(leads, 'createdAt', dateFilter);
	const filtered = dateSrc.filter((l) => {
		const q = search.toLowerCase();
		return (
			(l.fullName || '').toLowerCase().includes(q) ||
			(l.email || '').toLowerCase().includes(q) ||
			(l.phone || '').toLowerCase().includes(q) ||
			(l.entryLevel || '').toLowerCase().includes(q)
		);
	});
	const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

	const handleExport = async () => {
		setExporting(true);
		try {
			const res = await api.get('/flp-leads/export', { responseType: 'blob' });
			const blob = new Blob([res.data], {
				type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			});
			const stamp = new Date().toISOString().slice(0, 10);
			const a = document.createElement('a');
			a.href = URL.createObjectURL(blob);
			a.download = `flp-leads-${stamp}.xlsx`;
			document.body.appendChild(a);
			a.click();
			a.remove();
			URL.revokeObjectURL(a.href);
		} catch {
			alert('Failed to export. Please try again.');
		} finally {
			setExporting(false);
		}
	};

	return (
		<div>
			<div className="page-title-row">
				<h1>FLP Leads</h1>
				<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
					<span className="badge badge-blue">{leads.length} total</span>
					<button
						className="btn btn-primary btn-sm"
						onClick={handleExport}
						disabled={exporting || leads.length === 0}
					>
						{exporting ? 'Exporting…' : '⬇ Export Excel'}
					</button>
				</div>
			</div>

			<div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
				{DATE_TABS.map(({ key, label }) => (
					<button
						key={key}
						onClick={() => { setDateFilter(key); setPage(1); }}
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
					placeholder="Search by name, email, phone or level…"
					value={search}
					onChange={(e) => { setSearch(e.target.value); setPage(1); }}
				/>
				<span style={{ color: '#64748b', fontSize: '0.875rem' }}>{filtered.length} records</span>
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
									<th>Name</th>
									<th>Email</th>
									<th>Phone</th>
									<th>Interested Level</th>
									<th>Qualification</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{paginated.map((l) => (
									<tr key={l.id}>
										<td style={{ fontSize: '0.8rem', color: '#64748b' }}>{formatDate(l.createdAt)}</td>
										<td style={{ fontWeight: 500 }}>{l.fullName}</td>
										<td style={{ fontSize: '0.8rem' }}>{l.email}</td>
										<td style={{ fontSize: '0.8rem' }}>{l.phone || '—'}</td>
										<td style={{ fontSize: '0.8rem' }}>{l.entryLevel || '—'}</td>
										<td style={{ fontSize: '0.8rem', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.qualification || '—'}</td>
										<td>
											<button
												className="btn btn-secondary btn-sm"
												onClick={() => setSelected(l)}
												style={{ fontSize: '0.75rem', padding: '4px 8px' }}
											>
												View More
											</button>
										</td>
									</tr>
								))}
								{paginated.length === 0 && (
									<tr><td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8', padding: '32px' }}>No leads found</td></tr>
								)}
							</tbody>
						</table>
					</div>
					<Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onPage={setPage} />
				</>
			)}

			{selected && (
				<DetailModal title="FLP Lead" onClose={() => setSelected(null)}>
					<DetailSection title="Contact">
						<DetailGrid items={[
							{ label: 'Full Name', value: selected.fullName },
							{ label: 'Email', value: selected.email },
							{ label: 'Phone', value: selected.phone },
							{ label: 'WhatsApp', value: selected.whatsapp },
						]} />
					</DetailSection>
					<DetailSection title="Enquiry">
						<DetailGrid items={[
							{ label: 'Interested Level', value: selected.entryLevel },
							{ label: 'Qualification', value: selected.qualification },
							{ label: 'Source', value: selected.source },
							{ label: 'Submitted', value: formatDateTime(selected.createdAt) },
						]} />
					</DetailSection>
					{selected.message && (
						<DetailSection title="Message">
							<div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, whiteSpace: 'pre-wrap' }}>
								{selected.message}
							</div>
						</DetailSection>
					)}
				</DetailModal>
			)}
		</div>
	);
}
