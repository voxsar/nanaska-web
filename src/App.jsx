import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
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
import FinancialLeadershipPage from './pages/FinancialLeadershipPage';
import CaseStudyPage from './pages/CaseStudyPage';
import CertificateLevelIntakePage from './pages/CertificateLevelIntakePage';
import './App.css';

/** Wraps regular site pages with the shared Navbar + Footer. */
function Layout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Funnel landing pages – no Navbar or Footer ── */}
        <Route path="/financial-leadership-program" element={<FinancialLeadershipPage />} />
        <Route path="/case-study" element={<CaseStudyPage />} />
        <Route path="/certificate-level-intake" element={<CertificateLevelIntakePage />} />

        {/* ── Regular site pages wrapped in the shared Layout ── */}
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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
