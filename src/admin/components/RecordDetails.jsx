export function formatBlank(value) {
	if (value === null || value === undefined || value === '') return '-';
	return value;
}

export function formatDateTime(value) {
	if (!value) return '-';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return '-';
	return date.toLocaleString();
}

export function formatDate(value) {
	if (!value) return '-';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return '-';
	return date.toLocaleDateString();
}

export function formatCurrency(amount, currency) {
	const safeAmount = typeof amount === 'number' ? amount : Number(amount || 0);
	return `${currency || ''} ${safeAmount.toLocaleString()}`.trim();
}

export function valueToText(value) {
	if (value === null || value === undefined || value === '') return '-';
	if (value instanceof Date) return formatDateTime(value);
	if (Array.isArray(value)) return value.length ? value.map(valueToText).join(', ') : '-';
	if (typeof value === 'object') return JSON.stringify(value, null, 2);
	return String(value);
}

export function DetailGrid({ items }) {
	return (
		<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px 16px' }}>
			{items.map(({ label, value }) => (
				<div key={label}>
					<div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>{label}</div>
					<div style={{ color: '#1e293b', fontSize: '0.9rem', wordBreak: 'break-word', whiteSpace: typeof value === 'object' ? 'pre-wrap' : 'normal' }}>
						{valueToText(value)}
					</div>
				</div>
			))}
		</div>
	);
}

export function DetailSection({ title, children }) {
	if (!children) return null;
	return (
		<section style={{ borderTop: '1px solid #e2e8f0', paddingTop: 14 }}>
			<h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 10px', color: '#1B365D' }}>{title}</h3>
			{children}
		</section>
	);
}

export function CartItems({ items }) {
	if (!Array.isArray(items) || items.length === 0) return null;
	return (
		<div style={{ display: 'grid', gap: 8 }}>
			{items.map((item, index) => {
				const title = item?.title || item?.name || item?.label || item?.courseCode || item?.combinationId || item?.id || `Item ${index + 1}`;
				const details = [
					item?.courseCode,
					item?.combinationId,
					item?.registrationType,
					item?.studyMode,
					item?.type,
				].filter(Boolean).join(' | ');
				return (
					<div key={`${title}-${index}`} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 10 }}>
						<div style={{ fontWeight: 600 }}>{title}</div>
						{details && <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: 3 }}>{details}</div>}
					</div>
				);
			})}
		</div>
	);
}

export function JsonBlock({ value }) {
	if (!value || (typeof value === 'object' && Object.keys(value).length === 0)) return null;
	return (
		<pre style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, overflowX: 'auto', fontSize: '0.78rem', lineHeight: 1.5, margin: 0 }}>
			{valueToText(value)}
		</pre>
	);
}

export function DetailModal({ title, onClose, children, maxWidth = 760 }) {
	return (
		<div className="admin-modal-overlay" onClick={onClose}>
			<div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth }}>
				<div className="admin-modal-header">
					<h2>{title}</h2>
					<button className="modal-close" onClick={onClose}>x</button>
				</div>
				<div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontSize: '0.875rem' }}>
					{children}
				</div>
			</div>
		</div>
	);
}
