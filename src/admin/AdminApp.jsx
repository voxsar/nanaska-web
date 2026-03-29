import { Routes, Route } from 'react-router-dom';
import { AdminAuthProvider } from './context/AdminAuthContext';
import AdminLayout from './components/AdminLayout';
import AdminLoginPage from './pages/AdminLoginPage';
import DashboardPage from './pages/DashboardPage';
import BlogListPage from './pages/blog/BlogListPage';
import BlogEditorPage from './pages/blog/BlogEditorPage';
import LecturersPage from './pages/lecturers/LecturersPage';
import CoursesPage from './pages/courses/CoursesPage';
import CourseEditorPage from './pages/courses/CourseEditorPage';
import CourseProgramsPage from './pages/courses/CourseProgramsPage';
import CourseProgramEditorPage from './pages/courses/CourseProgramEditorPage';
import StudentsPage from './pages/StudentsPage';
import NewsletterPage from './pages/NewsletterPage';
import PaymentsPage from './pages/PaymentsPage';
import FormDataPage from './pages/FormDataPage';
import MetaTagsPage from './pages/MetaTagsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import PaymentSettingsPage from './pages/PaymentSettingsPage';
import DatabaseViewerPage from './pages/DatabaseViewerPage';
import TestimonialsAdminPage from './pages/testimonials/TestimonialsPage';
import ContactSettingsPage from './pages/ContactSettingsPage';
import EmailSettingsPage from './pages/EmailSettingsPage';
import PaymentLinksPage from './pages/PaymentLinksPage';
import BackupsPage from './pages/BackupsPage';

export default function AdminApp() {
	return (
		<AdminAuthProvider>
			<Routes>
				<Route path="login" element={<AdminLoginPage />} />
				<Route element={<AdminLayout />}>
					<Route index element={<DashboardPage />} />
					<Route path="blog" element={<BlogListPage />} />
					<Route path="blog/new" element={<BlogEditorPage />} />
					<Route path="blog/:id/edit" element={<BlogEditorPage />} />
					<Route path="lecturers" element={<LecturersPage />} />
					<Route path="courses" element={<CoursesPage />} />
					<Route path="courses/new" element={<CourseEditorPage />} />
					<Route path="courses/:id/edit" element={<CourseEditorPage />} />
					<Route path="course-programs" element={<CourseProgramsPage />} />
					<Route path="course-programs/new" element={<CourseProgramEditorPage />} />
					<Route path="course-programs/:id/edit" element={<CourseProgramEditorPage />} />
					<Route path="students" element={<StudentsPage />} />
					<Route path="newsletter" element={<NewsletterPage />} />
					<Route path="payments" element={<PaymentsPage />} />
					<Route path="form-data" element={<FormDataPage />} />
					<Route path="meta-tags" element={<MetaTagsPage />} />
					<Route path="analytics" element={<AnalyticsPage />} />
					<Route path="payment-settings" element={<PaymentSettingsPage />} />
					<Route path="database" element={<DatabaseViewerPage />} />
					<Route path="testimonials" element={<TestimonialsAdminPage />} />
					<Route path="contact-settings" element={<ContactSettingsPage />} />
					<Route path="email-settings" element={<EmailSettingsPage />} />
					<Route path="payment-links" element={<PaymentLinksPage />} />
					<Route path="backups" element={<BackupsPage />} />
				</Route>
			</Routes>
		</AdminAuthProvider>
	);
}
