import { useState, useEffect } from 'react';
import api from '../api';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Navigate } from 'react-router-dom';

export default function DatabaseViewerPage() {
  const { isSuperadmin } = useAdminAuth();
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isSuperadmin) return;
    api.get('/admin/db/tables').then((r) => setTables(r.data)).catch(() => {});
  }, [isSuperadmin]);

  if (!isSuperadmin) return <Navigate to="/admin" replace />;

  const loadTable = (tableName) => {
    setSelectedTable(tableName);
    setLoading(true);
    setRows([]);
    setColumns([]);
    setError('');
    api.get(`/admin/db/tables/${tableName}`)
      .then((r) => {
        const data = Array.isArray(r.data) ? r.data : [];
        setRows(data);
        if (data.length > 0) {
          setColumns(Object.keys(data[0]));
        }
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load table'))
      .finally(() => setLoading(false));
  };

  const startEdit = (row) => {
    setEditingRow(row.id);
    setEditData({ ...row });
    setSuccess('');
    setError('');
  };

  const cancelEdit = () => {
    setEditingRow(null);
    setEditData({});
  };

  const handleEditChange = (col, value) => {
    setEditData((prev) => ({ ...prev, [col]: value }));
  };

  const saveRow = async () => {
    setSaving(true);
    setError('');
    try {
      await api.put(`/admin/db/tables/${selectedTable}/${editingRow}`, editData);
      setRows((prev) => prev.map((r) => (r.id === editingRow ? { ...r, ...editData } : r)));
      setSuccess('Row updated successfully!');
      cancelEdit();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update row');
    } finally {
      setSaving(false);
    }
  };

  const formatCellValue = (val) => {
    if (val === null || val === undefined) return <span style={{ color: '#94a3b8' }}>NULL</span>;
    if (typeof val === 'object') return <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{JSON.stringify(val)}</span>;
    if (typeof val === 'boolean') return <span className={`badge ${val ? 'badge-green' : 'badge-red'}`}>{val.toString()}</span>;
    const str = String(val);
    return str.length > 80 ? str.slice(0, 80) + '…' : str;
  };

  return (
    <div>
      <div className="page-title-row">
        <h1>Database Viewer</h1>
        <span className="badge badge-red">Superadmin Only</span>
      </div>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        {/* Table list */}
        <div className="admin-card" style={{ width: '200px', flexShrink: 0, padding: '12px', margin: 0 }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', margin: '0 0 8px', padding: '0 8px' }}>Tables</p>
          {tables.map((t) => (
            <button
              key={t}
              onClick={() => loadTable(t)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '7px 10px',
                borderRadius: '6px',
                border: 'none',
                background: selectedTable === t ? '#eff6ff' : 'none',
                color: selectedTable === t ? '#3b82f6' : '#334155',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: selectedTable === t ? 500 : 400,
                fontFamily: 'monospace',
              }}
            >
              {t}
            </button>
          ))}
          {tables.length === 0 && (
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', padding: '8px' }}>No tables found</p>
          )}
        </div>

        {/* Table data */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {error && <div className="admin-alert admin-alert-error">{error}</div>}
          {success && <div className="admin-alert admin-alert-success">{success}</div>}

          {!selectedTable && (
            <div className="admin-card" style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
              Select a table to view its data
            </div>
          )}

          {selectedTable && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#1e293b' }}>{selectedTable}</span>
                  <span style={{ color: '#94a3b8', fontSize: '0.8rem', marginLeft: '8px' }}>{rows.length} rows</span>
                </div>
                {editingRow && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-success btn-sm" onClick={saveRow} disabled={saving}>{saving ? '…' : '✓ Save'}</button>
                    <button className="btn btn-secondary btn-sm" onClick={cancelEdit}>✕ Cancel</button>
                  </div>
                )}
              </div>

              {loading ? (
                <div className="admin-loading">Loading…</div>
              ) : (
                <div style={{ overflow: 'auto', maxHeight: '600px', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                  <table className="admin-table" style={{ minWidth: columns.length * 150 }}>
                    <thead>
                      <tr>
                        <th style={{ position: 'sticky', top: 0, background: '#f8fafc' }}>Actions</th>
                        {columns.map((col) => (
                          <th key={col} style={{ position: 'sticky', top: 0, background: '#f8fafc', fontFamily: 'monospace' }}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, i) => (
                        <tr key={i}>
                          <td>
                            {editingRow === row.id ? (
                              <span style={{ fontSize: '0.75rem', color: '#3b82f6' }}>Editing…</span>
                            ) : (
                              row.id && (
                                <button
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => startEdit(row)}
                                  style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                                >
                                  Edit
                                </button>
                              )
                            )}
                          </td>
                          {columns.map((col) => (
                            <td key={col}>
                              {editingRow === row.id && col !== 'id' ? (
                                <input
                                  value={editData[col] ?? ''}
                                  onChange={(e) => handleEditChange(col, e.target.value)}
                                  style={{
                                    width: '100%',
                                    padding: '4px 8px',
                                    border: '1px solid #3b82f6',
                                    borderRadius: '4px',
                                    fontSize: '0.8rem',
                                    fontFamily: 'monospace',
                                    boxSizing: 'border-box',
                                    minWidth: '120px',
                                  }}
                                />
                              ) : (
                                <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                                  {formatCellValue(row[col])}
                                </span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                      {rows.length === 0 && (
                        <tr><td colSpan={columns.length + 1} style={{ textAlign: 'center', color: '#94a3b8', padding: '32px' }}>Empty table</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
