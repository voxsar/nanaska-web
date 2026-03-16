import LecturerPanel from './LecturerPanel';
import { LECTURERS } from '../data/lecturersData';
import './LeadLecturer.css';

export default function LeadLecturer() {
  return (
    <section className="lecturer" id="lecturer">
      <div className="lecturer__container">
        <LecturerPanel lecturer={LECTURERS[0]} />
      </div>
    </section>
  );
}
