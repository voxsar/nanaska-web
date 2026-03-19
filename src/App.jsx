import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Outlet, useParams, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingWidgets from './components/FloatingWidgets';
import MobileBottomNav from './components/MobileBottomNav';
import { CartProvider } from './context/CartContext';
import { PricingProvider } from './context/PricingContext';

/* Scrolls to the top of the page on every route change */
function ScrollToTop() {
	const { pathname } = useLocation();
	useEffect(() => {
		const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		window.scrollTo({ top: 0, behavior: prefersReduced ? 'instant' : 'instant' });
	}, [pathname]);
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

import IndividualCoursePage from './components/IndividualCoursePage';
import { getCourseBySlug, getLevelById } from './data/coursesData';

import './App.css';


/* Handles dynamic course routes */
function CourseRouteWrapper() {
	const { courseSlug } = useParams();

	const course = getCourseBySlug(courseSlug);

	if (!course) {
		return <Navigate to="/" replace />;
	}

	const level = getLevelById(course.levelId);

	return <IndividualCoursePage course={course} level={level} />;
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
					<Routes>

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

							<Route path="/cima-certificate-level" element={<CertificateLevelPage />} />
							<Route path="/cima-operational-level" element={<OperationalLevelPage />} />
							<Route path="/cima-management-level" element={<ManagementLevelPage />} />
							<Route path="/cima-strategic-level" element={<StrategicLevelPage />} />

							<Route path="/testimonials" element={<TestimonialsPage />} />

							<Route path="/contact" element={<ContactPage />} />
							<Route path="/lecturers" element={<LecturersPage />} />
							<Route path="/enrollment" element={<EnrollmentPage />} />

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