import { useState, useEffect, useRef, useCallback } from 'react';
import { LECTURERS as STATIC_LECTURERS } from '../data/lecturersData';
import { useApi } from '../hooks/useApi';
import './LeadLecturer.css';

const INTERVAL = 6000;

export default function LeadLecturer() {
  const { data: apiData } = useApi('/lecturers?active=true');
  const LECTURERS = (apiData && apiData.length > 0) ? apiData : STATIC_LECTURERS;

  const [current, setCurrent] = useState(0);
  const [animDir, setAnimDir] = useState(null);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);
  const count = LECTURERS.length;

  const goTo = useCallback((index, dir = 'next') => {
    setAnimDir(dir);
    setCurrent(index);
    setTimeout(() => setAnimDir(null), 500);
  }, []);

  const next = useCallback(() => goTo((current + 1) % count, 'next'), [current, count, goTo]);
  const prev = useCallback(() => goTo((current - 1 + count) % count, 'prev'), [current, count, goTo]);

  const resetTimer = useCallback(() => {
    clearInterval(timerRef.current);
    if (!paused) {
      timerRef.current = setInterval(next, INTERVAL);
    }
  }, [paused, next]);

  useEffect(() => {
    if (!paused) {
      timerRef.current = setInterval(() => setCurrent((c) => (c + 1) % count), INTERVAL);
    }
    return () => clearInterval(timerRef.current);
  }, [count, paused]);

  const lecturer = LECTURERS[current];

  return (
    <section className="faculty" id="lecturer" aria-label="Our Faculty">
      {/* ── Section header ── */}
      <div className="faculty__header">
        <span className="faculty__eyebrow">Meet the Experts</span>
        <h2 className="faculty__title">Our Faculty</h2>
        <p className="faculty__subtitle">
          World-class professionals dedicated to your CIMA success.
        </p>
      </div>

      {/* ── Thumbnail strip ── */}
      <div
        className="faculty__strip"
        role="tablist"
        aria-label="Faculty members"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {LECTURERS.map((lec, i) => (
          <button
            key={lec.name}
            role="tab"
            aria-selected={i === current}
            aria-label={lec.name}
            className={`faculty__thumb${i === current ? ' faculty__thumb--active' : ''}`}
            onClick={() => { goTo(i, i > current ? 'next' : 'prev'); resetTimer(); }}
          >
            <img
              src={lec.imageUrl}
              alt={lec.name}
              className="faculty__thumb-img"
              loading="lazy"
            />
            <span className="faculty__thumb-name">{lec.name.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* ── Main panel ── */}
      <div
        className="faculty__panel-wrap"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className={`faculty__panel faculty__panel--${animDir || 'idle'}`} key={current}>
          {/* Image column */}
          <div className="faculty__img-col">
            <div className="faculty__img-wrap">
              <img
                src={lecturer.imageUrl}
                alt={lecturer.name}
                className="faculty__img"
              />
              <div className="faculty__img-accent" />
            </div>
            {/* Stats row */}
            <div className="faculty__stats">
              {lecturer.stats.map(({ number, label }) => (
                <div key={label} className="faculty__stat">
                  <span className="faculty__stat-number">{number}</span>
                  <span className="faculty__stat-label">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Body column */}
          <div className="faculty__body">
            <span className="faculty__panel-eyebrow">Our Faculty</span>
            <h3 className="faculty__name">{lecturer.name}</h3>
            <p className="faculty__role">{lecturer.title}</p>
            <div className="faculty__credentials">
              {lecturer.credentials.map((c) => (
                <span key={c} className="faculty__badge">{c}</span>
              ))}
            </div>
            <p className="faculty__bio">{lecturer.bio}</p>
            {lecturer.bio2 && <p className="faculty__bio">{lecturer.bio2}</p>}
            {lecturer.specialties && (
              <div className="faculty__specialties">
                {lecturer.specialties.map((s) => (
                  <span key={s} className="faculty__spec-tag">{s}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Nav arrows ── */}
        <button
          className="faculty__arrow faculty__arrow--prev"
          onClick={() => { prev(); resetTimer(); }}
          aria-label="Previous lecturer"
        >
          &#8249;
        </button>
        <button
          className="faculty__arrow faculty__arrow--next"
          onClick={() => { next(); resetTimer(); }}
          aria-label="Next lecturer"
        >
          &#8250;
        </button>
      </div>

      {/* ── Dots ── */}
      <div className="faculty__dots" role="tablist" aria-label="Lecturer indicators">
        {LECTURERS.map((_, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === current}
            aria-label={`Lecturer ${i + 1}`}
            className={`faculty__dot${i === current ? ' faculty__dot--active' : ''}`}
            onClick={() => { goTo(i, i > current ? 'next' : 'prev'); resetTimer(); }}
          />
        ))}
      </div>

      {/* ── Counter ── */}
      <p className="faculty__counter" aria-live="polite">
        {current + 1} / {count}
      </p>
    </section>
  );
}
