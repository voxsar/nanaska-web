import LecturerPanel from '../components/LecturerPanel';
import { LECTURERS } from '../data/lecturersData';
import './LecturersPage.css';

export default function LecturersPage() {
  return (
    <div className="lecturers-page">
      <section className="lecturers-page__hero">
        <div className="lecturers-page__hero-inner">
          <h1 className="lecturers-page__hero-title">Meet Our Lecturers</h1>
          <p className="lecturers-page__hero-sub">World-class CIMA educators with proven track records</p>
        </div>
      </section>
      <section className="lecturers-page__grid">
        <div className="lecturers-page__container">
          {LECTURERS.map(lecturer => (
            <div key={lecturer.name} className="lecturers-page__card">
              <LecturerPanel lecturer={lecturer} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
