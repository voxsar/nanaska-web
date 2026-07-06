import { useState, useEffect } from 'react';
import api from '../api';
import {
	CartItems,
	DetailGrid,
	DetailModal,
	DetailSection,
	JsonBlock,
	formatCurrency,
	formatDate,
	formatDateTime,
} from '../components/RecordDetails';

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

function getPaymentName(payment) {
	const enrollment = payment.enrollmentSubmission;
	const enrollmentName = [enrollment?.firstName, enrollment?.lastName].filter(Boolean).join(' ');
	return payment.user?.name || payment.guestName || enrollmentName || '—';
}

function getPaymentEmail(payment) {
	return payment.user?.email || payment.guestEmail || payment.enrollmentSubmission?.email || payment.metaJson?.email || '—';
}

function getPaymentPhone(payment) {
	return payment.guestPhone || payment.enrollmentSubmission?.phone || payment.metaJson?.phone || payment.metaJson?.studentPhone || '—';
}

function getPaymentCourses(payment) {
	const courseIds = payment.combination?.items?.map((i) => i.course?.id).filter(Boolean);
	if (courseIds?.length) return courseIds.join(', ');
	if (payment.paymentLink?.label) return payment.paymentLink.label;
	const cartItems = payment.enrollmentSubmission?.cartJson || payment.metaJson?.cartItems;
	if (Array.isArray(cartItems) && cartItems.length > 0) {
		return cartItems.map((item) => item.courseCode || item.title || item.name || item.combinationId || item.id).filter(Boolean).join(', ') || '—';
	}
	return '—';
}

function PaymentRegistrationDetails({ enrollment }) {
	if (!enrollment) return null;
	return (
		<>
			<DetailSection title="Registration">
				<DetailGrid items={[
					{ label: 'First Name', value: enrollment.firstName },
					{ label: 'Last Name', value: enrollment.lastName },
					{ label: 'Email', value: enrollment.email },
					{ label: 'Phone', value: enrollment.phone },
					{ label: 'WhatsApp', value: enrollment.whatsapp },
					{ label: 'CIMA ID', value: enrollment.cimaId },
					{ label: 'CIMA Stage', value: enrollment.cimaStage },
					{ label: 'Date of Birth', value: enrollment.dob },
					{ label: 'Gender', value: enrollment.gender },
					{ label: 'Country', value: enrollment.country },
					{ label: 'Street', value: enrollment.street },
					{ label: 'City', value: enrollment.city },
					{ label: 'Postcode', value: enrollment.postcode },
					{ label: 'Submitted', value: formatDateTime(enrollment.createdAt) },
				]} />
			</DetailSection>
			{Array.isArray(enrollment.cartJson) && enrollment.cartJson.length > 0 && (
				<DetailSection title="Cart Items">
					<CartItems items={enrollment.cartJson} />
				</DetailSection>
			)}
			{enrollment.notes && (
				<DetailSection title="Notes">
					<div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, whiteSpace: 'pre-wrap' }}>
						{enrollment.notes}
					</div>
				</DetailSection>
			)}
		</>
	);
}

export default function PaymentsPage() {
	const [payments, setPayments] = useState([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState('');
	const [filterStatus, setFilterStatus] = useState('');
	const [page, setPage] = useState(1);
	const [selectedPayment, setSelectedPayment] = useState(null);

	useEffect(() => {
		api.get('/admin/payments').then((r) => setPayments(r.data)).finally(() => setLoading(false));
	}, []);

	const filtered = payments.filter((p) => {
		const matchSearch =
			getPaymentEmail(p).toLowerCase().includes(search.toLowerCase()) ||
			getPaymentName(p).toLowerCase().includes(search.toLowerCase()) ||
			getPaymentPhone(p).toLowerCase().includes(search.toLowerCase()) ||
			(p.ipgRef || '').toLowerCase().includes(search.toLowerCase()) ||
			(p.ipgMerchantRef || '').toLowerCase().includes(search.toLowerCase());
		const matchStatus = !filterStatus || p.status === filterStatus;
		return matchSearch && matchStatus;
	});
	const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

	const revenueByCurrency = filtered
		.filter((p) => p.status === 'PAID')
		.reduce((acc, p) => {
			const currency = p.currency || 'LKR';
			acc[currency] = (acc[currency] || 0) + p.amount;
			return acc;
		}, {});

	return (
		<div>
			<div className="page-title-row">
				<h1>Payments</h1>
				<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
					{Object.entries(revenueByCurrency).map(([currency, amount]) => (
						<span key={currency} style={{ background: '#dcfce7', color: '#16a34a', borderRadius: '8px', padding: '6px 12px', fontSize: '0.875rem', fontWeight: 600 }}>
							Revenue: {formatCurrency(amount, currency)}
						</span>
					))}
				</div>
			</div>

			<div className="admin-filter-bar">
				<input
					className="admin-search"
					placeholder="Search by name, email, phone or ref..."
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
									<th>Phone</th>
									<th>Courses</th>
									<th>Amount</th>
									<th>Status</th>
									<th>Ref</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{paginated.map((p) => {
									const name = getPaymentName(p);
									const email = getPaymentEmail(p);
									const phone = getPaymentPhone(p);
									const courses = getPaymentCourses(p);
									return (
										<tr key={p.id}>
											<td style={{ fontSize: '0.8rem', color: '#64748b' }}>{formatDate(p.createdAt)}</td>
											<td style={{ fontWeight: 500 }}>{name}</td>
											<td style={{ fontSize: '0.8rem' }}>{email}</td>
											<td style={{ fontSize: '0.8rem' }}>{phone}</td>
											<td style={{ fontSize: '0.8rem' }}>{courses}</td>
											<td style={{ fontWeight: 600 }}>{formatCurrency(p.amount, p.currency)}</td>
											<td><span className={`badge ${STATUS_BADGE[p.status] || 'badge-gray'}`}>{p.status}</span></td>
											<td style={{ fontSize: '0.75rem', color: '#94a3b8', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
												{p.ipgRef || '—'}
											</td>
											<td>
												<button
													className="btn btn-secondary btn-sm"
													onClick={() => setSelectedPayment(p)}
													style={{ fontSize: '0.75rem', padding: '4px 8px' }}
												>
													View More
												</button>
											</td>
										</tr>
									);
								})}
								{paginated.length === 0 && (
									<tr><td colSpan={9} style={{ textAlign: 'center', color: '#94a3b8', padding: '32px' }}>No payments found</td></tr>
								)}
							</tbody>
						</table>
					</div>
					<Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onPage={setPage} />
				</>
			)}
			{selectedPayment && (
				<DetailModal title="Payment Details" onClose={() => setSelectedPayment(null)}>
					<DetailSection title="Customer">
						<DetailGrid items={[
							{ label: 'Name', value: getPaymentName(selectedPayment) },
							{ label: 'Email', value: getPaymentEmail(selectedPayment) },
							{ label: 'Phone', value: getPaymentPhone(selectedPayment) },
							{ label: 'User ID', value: selectedPayment.user?.id },
						]} />
					</DetailSection>
					<DetailSection title="Payment">
						<DetailGrid items={[
							{ label: 'Status', value: selectedPayment.status },
							{ label: 'Amount', value: formatCurrency(selectedPayment.amount, selectedPayment.currency) },
							{ label: 'Order ID', value: selectedPayment.id },
							{ label: 'Gateway Ref', value: selectedPayment.ipgRef },
							{ label: 'Merchant Ref', value: selectedPayment.ipgMerchantRef },
							{ label: 'Payment Link', value: selectedPayment.paymentLink?.label },
							{ label: 'Created', value: formatDateTime(selectedPayment.createdAt) },
							{ label: 'Updated', value: formatDateTime(selectedPayment.updatedAt) },
						]} />
					</DetailSection>
					<DetailSection title="Course Or Link">
						<DetailGrid items={[
							{ label: 'Package', value: selectedPayment.combination?.name || selectedPayment.paymentLink?.description || getPaymentCourses(selectedPayment) },
							{ label: 'Course Codes', value: getPaymentCourses(selectedPayment) },
						]} />
					</DetailSection>
					<PaymentRegistrationDetails enrollment={selectedPayment.enrollmentSubmission} />
					{selectedPayment.metaJson && (
						<DetailSection title="Payment Metadata">
							<JsonBlock value={selectedPayment.metaJson} />
						</DetailSection>
					)}
				</DetailModal>
			)}
		</div>
	);
}
