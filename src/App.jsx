import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import About from './components/About';
import Courses from './components/Courses';
import LeadLecturer from './components/LeadLecturer';
import Stats from './components/Stats';
import News from './components/News';
import Testimonials from './components/Testimonials';
import Connect from './components/Connect';
import Contact from './components/Contact';
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
import './App.css';

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <About />
      <Courses />
      <LeadLecturer />
      <Stats />
      <News />
      <Testimonials />
      <Connect />
      <Contact />
      {children}
      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
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
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
