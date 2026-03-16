import { BrowserRouter, Routes, Route, useParams, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { CartProvider } from './context/CartContext';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import OurFacultyPage from './pages/OurFacultyPage';
import OurSpecialtyPage from './pages/OurSpecialtyPage';
import NanaskaAlumniPage from './pages/NanaskaAlumniPage';
import CertificateLevelPage from './pages/CertificateLevelPage';
import OperationalLevelPage from './pages/OperationalLevelPage';
import ManagementLevelPage from './pages/ManagementLevelPage';
import StrategicLevelPage from './pages/StrategicLevelPage';
import ContactPage from './pages/ContactPage';
import LecturersPage from './pages/LecturersPage';
import EnrollmentPage from './pages/EnrollmentPage';
import IndividualCoursePage from './components/IndividualCoursePage';
import { getCourseBySlug, getLevelById } from './data/coursesData';
import './App.css';

function CourseRouteWrapper() {
  const { courseSlug } = useParams();
  const course = getCourseBySlug(courseSlug);
  if (!course) return <Navigate to="/" replace />;
  const level = getLevelById(course.levelId);
  return <IndividualCoursePage course={course} level={level} />;
}

function Layout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/our-faculty" element={<OurFacultyPage />} />
            <Route path="/our-specialty" element={<OurSpecialtyPage />} />
            <Route path="/nanaska-alumni" element={<NanaskaAlumniPage />} />
            <Route path="/cima-certificate-level" element={<CertificateLevelPage />} />
            <Route path="/cima-operational-level" element={<OperationalLevelPage />} />
            <Route path="/cima-management-level" element={<ManagementLevelPage />} />
            <Route path="/cima-strategic-level" element={<StrategicLevelPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/lecturers" element={<LecturersPage />} />
            <Route path="/enrollment" element={<EnrollmentPage />} />
            <Route path="/:courseSlug" element={<CourseRouteWrapper />} />
          </Routes>
        </Layout>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
