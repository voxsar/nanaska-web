import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Outlet, useParams, Navigate, useLocation } from 'react-router-dom';
import { useApi } from './hooks/useApi';
import { useTracking } from './hooks/useTracking';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingWidgets from './components/FloatingWidgets';
import MobileBottomNav from './components/MobileBottomNav';
import { CartProvider } from './context/CartContext';
import { PricingProvider } from './context/PricingContext';
import AdminApp from './admin/AdminApp';

/* Scrolls to the top of the page on every route change */
function ScrollToTop() {
	const { pathname } = useLocation();
	useEffect(() => {
		const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		window.scrollTo({ top: 0, behavior: prefersReduced ? 'instant' : 'instant' });
	}, [pathname]);
	return null;
}

/* Initialises Clarity & fires GA4/Clarity events on every route change */
function TrackingWrapper() {
	useTracking();
	return null;
}

import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import OurFacultyPage from './pages/OurFacultyPage';
import OurSpecialtyPage from './pages/OurSpecialtyPage';
import NanaskaAlumniPage from './pages/NanaskaAlumniPage';

import CertificateLevelPage from './pages/CertificateLevelPage';
import OperationalLevelPage from './pages/OperationalLevelPage';
import ManagementLevelPage from './pages/ManagementLevelPage';
import StrategicLevelPage from './pages/StrategicLevelPage';

import TestimonialsPage from './pages/TestimonialsPage';

import ContactPage from './pages/ContactPage';
import LecturersPage from './pages/LecturersPage';
import EnrollmentPage from './pages/EnrollmentPage';

import FinancialLeadershipPage from './pages/FinancialLeadershipPage';
import CaseStudyPage from './pages/CaseStudyPage';
import CertificateLevelIntakePage from './pages/CertificateLevelIntakePage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentCancelPage from './pages/PaymentCancelPage';
import PaymentLinkPage from './pages/PaymentLinkPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import NanaskaEdgePage from './pages/NanaskaEdgePage';
import RegistrationSuccessPage from './pages/RegistrationSuccessPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';

import IndividualCoursePage from './components/IndividualCoursePage';
import { getCourseBySlug, getLevelById } from './data/coursesData';

import './App.css';


/* Fallback: load a course from the API when it isn't in the static data */
function ApiCourseLoader({ slug }) {
	const { data: apiCourses, loading } = useApi('/courses');

	if (loading) {
		return (
			<div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
				Loading…
			</div>
		);
	}

	const apiCourse = apiCourses?.find((c) => c.slug === slug);
	if (!apiCourse) return <Navigate to="/" replace />;

	const level = getLevelById(apiCourse.level);
	if (!level) return <Navigate to="/" replace />;

	const course = {
		code: apiCourse.id,
		name: apiCourse.name,
		slug: apiCourse.slug,
		price: apiCourse.price,
		levelId: apiCourse.level,
		description: apiCourse.description || '',
		icon: apiCourse.icon || '📘',
		subtitle: apiCourse.subtitle || '',
		highlights: apiCourse.highlights || [],
		syllabus: apiCourse.syllabus || [],
		outcomes: apiCourse.outcomes || [],
	};

	return <IndividualCoursePage course={course} level={level} />;
}

/* Handles dynamic course routes */
function CourseRouteWrapper() {
	const { courseSlug } = useParams();

	const staticCourse = getCourseBySlug(courseSlug);

	if (staticCourse) {
		const level = getLevelById(staticCourse.levelId);
		return <IndividualCoursePage course={staticCourse} level={level} />;
	}

	// Course not found in static data — try loading from the API (admin-created courses)
	return <ApiCourseLoader slug={courseSlug} />;
}


/* Shared layout (Navbar + Footer + Floating widgets) */
function Layout() {
	return (
		<>
			<Navbar />
			<Outlet />
			<Footer />
			<FloatingWidgets />
			<MobileBottomNav />
		</>
	);
}


function App() {
	return (
		<BrowserRouter>
			<PricingProvider>
				<CartProvider>
					<ScrollToTop />
					<TrackingWrapper />
					<Routes>

						{/* Admin panel – completely separate layout */}
						<Route path="/admin/*" element={<AdminApp />} />

						{/* Custom payment links – no navbar/footer */}
						<Route path="/pay/:slug" element={<PaymentLinkPage />} />

						{/* Funnel landing pages (no navbar/footer) */}
						<Route path="/financial-leadership-program" element={<FinancialLeadershipPage />} />
						<Route path="/case-study" element={<CaseStudyPage />} />
						<Route path="/certificate-level-intake" element={<CertificateLevelIntakePage />} />

						{/* Regular pages with layout */}
						<Route element={<Layout />}>

							<Route path="/" element={<HomePage />} />
							<Route path="/about" element={<AboutPage />} />
							<Route path="/our-faculty" element={<OurFacultyPage />} />
							<Route path="/our-specialty" element={<OurSpecialtyPage />} />
							<Route path="/nanaska-alumni" element={<NanaskaAlumniPage />} />
							<Route path="/nanaska-edge" element={<NanaskaEdgePage />} />
							<Route path="/nanaska-edge/:mockType/select-cima-type" element={<NanaskaEdgePage />} />
							<Route path="/nanaska-edge/registration-success" element={<RegistrationSuccessPage />} />

							<Route path="/cima-certificate-level" element={<CertificateLevelPage />} />
							<Route path="/cima-operational-level" element={<OperationalLevelPage />} />
							<Route path="/cima-management-level" element={<ManagementLevelPage />} />
							<Route path="/cima-strategic-level" element={<StrategicLevelPage />} />

							<Route path="/testimonials" element={<TestimonialsPage />} />
							<Route path="/blog" element={<BlogPage />} />
							<Route path="/blog/:slug" element={<BlogPostPage />} />
							<Route path="/contact" element={<ContactPage />} />
							<Route path="/lecturers" element={<LecturersPage />} />
							<Route path="/enrollment" element={<EnrollmentPage />} />						<Route path="/payment-success" element={<PaymentSuccessPage />} />
							<Route path="/payment-cancel" element={<PaymentCancelPage />} />
							<Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
							<Route path="/terms-and-conditions" element={<TermsPage />} />
							{/* Dynamic course pages */}
							<Route path="/:courseSlug" element={<CourseRouteWrapper />} />

						</Route>

					</Routes>

				</CartProvider>
			</PricingProvider>
		</BrowserRouter>
	);
}

export default App;
