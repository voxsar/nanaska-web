import { useLocation } from 'react-router-dom';

const PAGE_TITLES = {
  '/admin': 'Dashboard',
  '/admin/blog': 'Blog Posts',
  '/admin/blog/new': 'New Blog Post',
  '/admin/lecturers': 'Lecturers',
  '/admin/courses': 'Courses',
  '/admin/students': 'Registered Students',
  '/admin/newsletter': 'Newsletter Signups',
  '/admin/payments': 'Payments',
  '/admin/form-data': 'Form Submissions',
  '/admin/meta-tags': 'Meta Tags',
  '/admin/analytics': 'Analytics & Pixels',
  '/admin/payment-settings': 'Payment Settings',
  '/admin/database': 'Database Viewer',
  '/admin/profile': 'My Profile',
};

export default function AdminHeader() {
  const { pathname } = useLocation();

  const title =
    Object.keys(PAGE_TITLES)
      .filter((k) => pathname === k || pathname.startsWith(k + '/'))
      .sort((a, b) => b.length - a.length)[0];

  return (
    <header className="admin-header">
      <div>
        <h2>{PAGE_TITLES[title] || 'Admin'}</h2>
      </div>
      <div className="header-breadcrumb">
        Nanaska Admin Panel
      </div>
    </header>
  );
}
