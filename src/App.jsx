import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import './App.css';

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
