import Hero from '../components/Hero';
import Features from '../components/Features';
import About from '../components/About';
import Courses from '../components/Courses';
import LeadLecturer from '../components/LeadLecturer';
import Stats from '../components/Stats';
import News from '../components/News';
import Testimonials from '../components/Testimonials';
import Connect from '../components/Connect';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <About />
      <Courses />
      <LeadLecturer />
      <Stats />
      <News />
      <Testimonials compact />
      <Connect />
    </>
  );
}
