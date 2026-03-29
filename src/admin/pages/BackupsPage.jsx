import { useState, useEffect } from 'react';
import api from '../api';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Navigate } from 'react-router-dom';
import './BackupsPage.css';

export default function BackupsPage() {
	const { isSuperadmin } = useAdminAuth();
	const [backups, setBackups] = useState([]);
	const [loading, setLoading] = useState(true);
	const [creating, setCreating] = useState(false);
	const [restoring, setRestoring] = useState(null);
	const [deleting, setDeleting] = useState(null);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');

	const loadBackups = async () => {
		setLoading(true);
		setError('');
		try {
			const response = await api.get('/admin/backups');
			setBackups(response.data.backups || []);
		} catch (err) {
			setError(err.response?.data?.message || 'Failed to load backups');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (!isSuperadmin) return;
		loadBackups();
	}, [isSuperadmin]);

	if (!isSuperadmin) return <Navigate to="/admin" replace />;

	const handleCreateBackup = async () => {
		setCreating(true);
		setError('');
		setSuccess('');
		try {
			const response = await api.post('/admin/backups');
			if (response.data.success) {
				setSuccess('Backup created successfully!');
				await loadBackups();
			} else {
				setError(response.data.message || 'Failed to create backup');
			}
		} catch (err) {
			setError(err.response?.data?.message || 'Failed to create backup');
		} finally {
			setCreating(false);
		}
	};

	const handleRestoreBackup = async (filename) => {
		if (!window.confirm(`Are you sure you want to restore the database from "${filename}"?\n\n⚠️ WARNING: This will overwrite the current database!`)) {
			return;
		}

		setRestoring(filename);
		setError('');
		setSuccess('');
		try {
			const response = await api.post('/admin/backups/restore', { filename });
			if (response.data.success) {
				setSuccess('Database restored successfully!');
			} else {
				setError(response.data.message || 'Failed to restore backup');
			}
		} catch (err) {
			setError(err.response?.data?.message || 'Failed to restore backup');
		} finally {
			setRestoring(null);
		}
	};

	const handleDeleteBackup = async (filename) => {
		if (!window.confirm(`Are you sure you want to delete "${filename}"?`)) {
			return;
		}

		setDeleting(filename);
		setError('');
		setSuccess('');
		try {
			const response = await api.delete('/admin/backups', { data: { filename } });
			if (response.data.success) {
				setSuccess('Backup deleted successfully!');
				await loadBackups();
			} else {
				setError(response.data.message || 'Failed to delete backup');
			}
		} catch (err) {
			setError(err.response?.data?.message || 'Failed to delete backup');
		} finally {
			setDeleting(null);
		}
	};

	const formatDate = (dateString) => {
		const date = new Date(dateString);
		return date.toLocaleString('en-GB', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	return (
		<div className="backups-page">
			<div className="page-title-row">
				<h1>Database Backups</h1>
				<div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
					<span className="badge badge-info">Auto-backup: Every 4 hours</span>
					<span className="badge badge-red">Superadmin Only</span>
				</div>
			</div>

			{error && (
				<div className="alert alert-danger">
					<strong>Error:</strong> {error}
				</div>
			)}

			{success && (
				<div className="alert alert-success">
					<strong>Success:</strong> {success}
				</div>
			)}

			<div className="admin-card" style={{ marginBottom: '20px', padding: '20px' }}>
				<h2 style={{ fontSize: '1.1rem', marginBottom: '10px' }}>Create Manual Backup</h2>
				<p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '15px' }}>
					Database backups are automatically created every 4 hours. You can also create a manual backup at any time.
				</p>
				<button
					className="btn btn-primary"
					onClick={handleCreateBackup}
					disabled={creating}
				>
					{creating ? '⏳ Creating Backup...' : '💾 Create Backup Now'}
				</button>
			</div>

			<div className="admin-card">
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
					<h2 style={{ fontSize: '1.1rem', margin: 0 }}>Available Backups</h2>
					<button
						className="btn btn-secondary"
						onClick={loadBackups}
						disabled={loading}
						style={{ fontSize: '0.85rem', padding: '6px 12px' }}
					>
						🔄 Refresh
					</button>
				</div>

				{loading ? (
					<div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
						Loading backups...
					</div>
				) : backups.length === 0 ? (
					<div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
						No backups found. Create your first backup above.
					</div>
				) : (
					<div className="backups-table-wrapper">
						<table className="backups-table">
							<thead>
								<tr>
									<th>Filename</th>
									<th>Size</th>
									<th>Created</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{backups.map((backup) => (
									<tr key={backup.filename}>
										<td>
											<code style={{ fontSize: '0.85rem' }}>{backup.filename}</code>
										</td>
										<td>{backup.sizeFormatted}</td>
										<td>{formatDate(backup.createdAt)}</td>
										<td>
											<div className="backup-actions">
												<button
													className="btn btn-small btn-success"
													onClick={() => handleRestoreBackup(backup.filename)}
													disabled={restoring === backup.filename || restoring !== null}
													title="Restore this backup"
												>
													{restoring === backup.filename ? '⏳' : '↩️'} Restore
												</button>
												<button
													className="btn btn-small btn-danger"
													onClick={() => handleDeleteBackup(backup.filename)}
													disabled={deleting === backup.filename || deleting !== null}
													title="Delete this backup"
												>
													{deleting === backup.filename ? '⏳' : '🗑️'} Delete
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>

			<div className="admin-card" style={{ marginTop: '20px', padding: '15px', background: '#fef3c7' }}>
				<p style={{ margin: 0, fontSize: '0.9rem', color: '#92400e' }}>
					<strong>⚠️ Important:</strong> Restoring a backup will completely overwrite the current database.
					Make sure you have a recent backup before restoring. The current automatic backup schedule runs every 4 hours.
				</p>
			</div>
		</div>
	);
}
