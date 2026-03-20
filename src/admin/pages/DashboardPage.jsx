import { useState, useEffect } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/students').catch(() => ({ data: [] })),
      api.get('/admin/newsletter').catch(() => ({ data: [] })),
      api.get('/admin/payments').catch(() => ({ data: [] })),
      api.get('/blog?published=true').catch(() => ({ data: [] })),
      api.get('/lecturers').catch(() => ({ data: [] })),
    ]).then(([students, newsletter, payments, posts, lecturers]) => {
      const paidPayments = payments.data.filter((p) => p.status === 'PAID');
      const revenue = paidPayments.reduce((acc, p) => acc + p.amount, 0);
      setStats({
        students: students.data.length,
        newsletter: newsletter.data.length,
        payments: payments.data.length,
        revenue,
        posts: posts.data.length,
        lecturers: lecturers.data.length,
      });
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="admin-loading">Loading dashboard…</div>;

  const cards = [
    { label: 'Registered Students', value: stats.students, icon: '🎓', to: '/admin/students', color: '#3b82f6' },
    { label: 'Newsletter Signups', value: stats.newsletter, icon: '📧', to: '/admin/newsletter', color: '#8b5cf6' },
    { label: 'Total Payments', value: stats.payments, icon: '💳', to: '/admin/payments', color: '#10b981' },
    { label: 'Revenue (LKR)', value: `${(stats.revenue / 1000).toFixed(0)}K`, icon: '💰', to: '/admin/payments', color: '#f59e0b' },
    { label: 'Published Posts', value: stats.posts, icon: '📝', to: '/admin/blog', color: '#ef4444' },
    { label: 'Lecturers', value: stats.lecturers, icon: '👨‍🏫', to: '/admin/lecturers', color: '#06b6d4' },
  ];

  return (
    <div>
      <div className="page-title-row">
        <h1>Dashboard</h1>
        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Welcome back!</span>
      </div>

      <div className="stat-grid">
        {cards.map((card) => (
          <Link key={card.label} to={card.to} style={{ textDecoration: 'none' }}>
            <div className="stat-card" style={{ borderTop: `3px solid ${card.color}` }}>
              <div className="stat-icon">{card.icon}</div>
              <div className="stat-value" style={{ color: card.color }}>{card.value}</div>
              <div className="stat-label">{card.label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="admin-card">
        <p className="admin-card-title">Quick Actions</p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link to="/admin/blog/new" className="btn btn-primary">✏️ New Blog Post</Link>
          <Link to="/admin/lecturers" className="btn btn-secondary">👨‍🏫 Manage Lecturers</Link>
          <Link to="/admin/courses" className="btn btn-secondary">📚 Manage Courses</Link>
          <Link to="/admin/meta-tags" className="btn btn-secondary">🏷️ Edit Meta Tags</Link>
          <Link to="/admin/payment-settings" className="btn btn-secondary">⚙️ Payment Settings</Link>
        </div>
      </div>
    </div>
  );
}
