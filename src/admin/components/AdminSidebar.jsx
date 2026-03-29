import { NavLink, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

const navItems = [
	{ label: 'Dashboard', icon: '📊', to: '/admin' },
];

const contentItems = [
	{ label: 'Blog Posts', icon: '📝', to: '/admin/blog' },
	{ label: 'Lecturers', icon: '👨‍🏫', to: '/admin/lecturers' },
	{ label: 'Subjects', icon: '📖', to: '/admin/courses' },
	{ label: 'Course Programs', icon: '📚', to: '/admin/course-programs' },
	{ label: 'Testimonials', icon: '💬', to: '/admin/testimonials' },
];

const dataItems = [
	{ label: 'Students', icon: '🎓', to: '/admin/students' },
	{ label: 'Newsletter', icon: '📧', to: '/admin/newsletter' },
	{ label: 'Payments', icon: '💳', to: '/admin/payments' },
	{ label: 'Payment Links', icon: '🔗', to: '/admin/payment-links' },
	{ label: 'Form Submissions', icon: '📋', to: '/admin/form-data' },
];

const settingItems = [
	{ label: 'Meta Tags', icon: '🏷️', to: '/admin/meta-tags' },
	{ label: 'Analytics & Pixels', icon: '📈', to: '/admin/analytics' },
	{ label: 'Payment Settings', icon: '⚙️', to: '/admin/payment-settings' },
	{ label: 'Contact Settings', icon: '📞', to: '/admin/contact-settings' },
	{ label: 'Email Settings', icon: '✉️', to: '/admin/email-settings' },
];

const superadminItems = [
	{ label: 'Database Viewer', icon: '🗄️', to: '/admin/database' },
	{ label: 'Database Backups', icon: '💾', to: '/admin/backups' },
];

export default function AdminSidebar() {
	const { admin, logout, isSuperadmin } = useAdminAuth();
	const navigate = useNavigate();

	const handleLogout = () => {
		logout();
		navigate('/admin/login');
	};

	return (
		<aside className="admin-sidebar">
			<div className="sidebar-logo">
				<h1>Nanaska Admin</h1>
				<p>Management Dashboard</p>
			</div>

			<nav className="sidebar-nav">
				<div className="nav-section">
					{navItems.map((item) => (
						<NavLink
							key={item.to}
							to={item.to}
							end
							className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
						>
							<span>{item.icon}</span>
							{item.label}
						</NavLink>
					))}
				</div>

				<div className="nav-section">
					<p className="nav-section-title">Content</p>
					{contentItems.map((item) => (
						<NavLink
							key={item.to}
							to={item.to}
							className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
						>
							<span>{item.icon}</span>
							{item.label}
						</NavLink>
					))}
				</div>

				<div className="nav-section">
					<p className="nav-section-title">Data</p>
					{dataItems.map((item) => (
						<NavLink
							key={item.to}
							to={item.to}
							className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
						>
							<span>{item.icon}</span>
							{item.label}
						</NavLink>
					))}
				</div>

				<div className="nav-section">
					<p className="nav-section-title">Settings</p>
					{settingItems.map((item) => (
						<NavLink
							key={item.to}
							to={item.to}
							className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
						>
							<span>{item.icon}</span>
							{item.label}
						</NavLink>
					))}
				</div>

				{isSuperadmin && (
					<div className="nav-section">
						<p className="nav-section-title">Superadmin</p>
						{superadminItems.map((item) => (
							<NavLink
								key={item.to}
								to={item.to}
								className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
							>
								<span>{item.icon}</span>
								{item.label}
							</NavLink>
						))}
					</div>
				)}
			</nav>

			<div className="sidebar-footer">
				<div className="sidebar-user">
					<div className="sidebar-avatar">
						{(admin?.email?.[0] || 'A').toUpperCase()}
					</div>
					<div className="sidebar-user-info">
						<p className="user-role">{admin?.role}</p>
						<p className="user-email">{admin?.email}</p>
					</div>
				</div>
				<button className="sidebar-logout" onClick={handleLogout}>
					🚪 Sign out
				</button>
			</div>
		</aside>
	);
}
