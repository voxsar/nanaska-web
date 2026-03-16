import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import './Testimonials.css';
import TESTIMONIALS_DATA, { EXAM_TAGS, INTAKE_YEARS, FEATURED_COUNT } from '../data/testimonialsData';

const TAG_COLORS = { SCS: 'navy', MCS: 'cyan', OCS: 'orange' };
const SLIDER_PAGE_SIZE = 3;
const SLIDER_PAGES = Math.ceil(FEATURED_COUNT / SLIDER_PAGE_SIZE); // 3
const FEATURED = TESTIMONIALS_DATA.slice(0, FEATURED_COUNT);
const INTERVAL = 5000;

/* ─── Graceful image with initials fallback ─────────────── */
function StudentPhoto({ src, alt, initials, photoClass, fallbackClass }) {
  const [errored, setErrored] = useState(false);
  if (errored) {
    return <div className={fallbackClass}>{initials}</div>;
  }
  return (
    <img
      src={src}
      alt={alt}
      className={photoClass}
      loading="lazy"
      onError={() => setErrored(true)}
    />
  );
}

/* ─── Student Profile Modal ─────────────────────────────── */
function StudentModal({ testimonial: t, onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div className="t-modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={`${t.name}'s testimonial`}>
      <div className="t-modal" onClick={(e) => e.stopPropagation()}>
        <button className="t-modal__close" onClick={onClose} aria-label="Close">✕</button>

        <div className="t-modal__inner">
          {/* Left: photo + meta */}
          <div className="t-modal__left">
            <div className="t-modal__photo-wrap">
              <img
                src={t.image}
                alt={t.name}
                className="t-modal__photo"
                onError={(e) => { e.currentTarget.src = ''; e.currentTarget.style.display = 'none'; }}
              />
            </div>
            <h3 className="t-modal__name">{t.name}</h3>
            <p className="t-modal__country">{t.flag}&nbsp;{t.country}</p>
            <div className="t-modal__tags">
              <span className={`t-tag t-tag--${TAG_COLORS[t.tag]}`}>{t.tag}</span>
              {t.badge && <span className="t-badge">{t.badge}</span>}
            </div>
            <div className="t-modal__meta">
              <div className="t-modal__meta-row">
                <span className="t-modal__meta-label">Exam</span>
                <span className="t-modal__meta-value">{t.exam}</span>
              </div>
              <div className="t-modal__meta-row">
                <span className="t-modal__meta-label">Intake</span>
                <span className="t-modal__meta-value">{t.period}</span>
              </div>
              {t.marks && (
                <div className="t-modal__meta-row">
                  <span className="t-modal__meta-label">Marks</span>
                  <span className="t-modal__meta-value t-modal__marks">{t.marks}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: quote or video */}
          <div className="t-modal__right">
            {t.videoUrl ? (
              <div className="t-modal__video-wrap">
                <iframe
                  src={t.videoUrl}
                  title={`${t.name} video testimonial`}
                  className="t-modal__video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : null}
            <div className="t-modal__quote-block">
              <span className="t-modal__open-quote">&ldquo;</span>
              <p className="t-modal__quote-text">{t.quote}</p>
              <span className="t-modal__close-quote">&rdquo;</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Testimonials Section ─────────────────────────── */
export default function Testimonials() {
  /* Slider state */
  const [sliderPage, setSliderPage] = useState(0);
  const [sliderAnimDir, setSliderAnimDir] = useState(null);
  const timerRef = useRef(null);

  /* Search / filter state */
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');

  /* Modal state */
  const [activeTestimonial, setActiveTestimonial] = useState(null);

  /* ── Slider logic ── */
  const goSlider = useCallback((dir) => {
    setSliderAnimDir(dir);
    setSliderPage((prev) =>
      dir === 'next'
        ? (prev + 1) % SLIDER_PAGES
        : (prev - 1 + SLIDER_PAGES) % SLIDER_PAGES
    );
    setTimeout(() => setSliderAnimDir(null), 450);
  }, []);

  const resetTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => goSlider('next'), INTERVAL);
  }, [goSlider]);

  useEffect(() => {
    timerRef.current = setInterval(() => goSlider('next'), INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [goSlider]);

  const sliderCards = FEATURED.slice(
    sliderPage * SLIDER_PAGE_SIZE,
    sliderPage * SLIDER_PAGE_SIZE + SLIDER_PAGE_SIZE
  );

  /* ── Filtered grid ── */
  const filteredGrid = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return TESTIMONIALS_DATA.filter((t) => {
      const matchTag = selectedTag === 'All' || t.tag === selectedTag;
      const matchYear = selectedYear === 'All' || t.year === Number(selectedYear);
      const matchSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.country.toLowerCase().includes(q) ||
        t.exam.toLowerCase().includes(q) ||
        t.quote.toLowerCase().includes(q);
      return matchTag && matchYear && matchSearch;
    });
  }, [searchQuery, selectedTag, selectedYear]);

  const totalCountries = useMemo(
    () => new Set(TESTIMONIALS_DATA.map((t) => t.country)).size,
    []
  );

  return (
    <section className="testimonials" id="testimonials">

      {/* ══ Hero Banner ══ */}
      <div className="t-hero">
        <div className="t-hero__bg-shapes" aria-hidden="true">
          <span className="t-hero__shape t-hero__shape--1" />
          <span className="t-hero__shape t-hero__shape--2" />
          <span className="t-hero__shape t-hero__shape--3" />
        </div>
        <div className="t-hero__content">
          <span className="t-hero__eyebrow">Student Stories</span>
          <h2 className="t-hero__title">
            Real Results.<br />Real&nbsp;Students.
          </h2>
          <p className="t-hero__subtitle">
            At Nanaska, we take pride in every student who achieves their CIMA qualification.
            These are their stories — straight from the people who lived them.
          </p>
          <div className="t-hero__stats">
            <div className="t-hero__stat">
              <span className="t-hero__stat-num">{TESTIMONIALS_DATA.length}+</span>
              <span className="t-hero__stat-label">Student Stories</span>
            </div>
            <div className="t-hero__stat-divider" />
            <div className="t-hero__stat">
              <span className="t-hero__stat-num">{totalCountries}</span>
              <span className="t-hero__stat-label">Countries</span>
            </div>
            <div className="t-hero__stat-divider" />
            <div className="t-hero__stat">
              <span className="t-hero__stat-num">{INTAKE_YEARS.length}</span>
              <span className="t-hero__stat-label">Intake Years</span>
            </div>
          </div>
        </div>
      </div>

      {/* ══ Featured Slider ══ */}
      <div className="t-slider-section">
        <div className="t-slider-section__container">
          <div className="t-slider-section__header">
            <span className="t-section-eyebrow">Latest Achievements</span>
            <h3 className="t-section-title">Most Recent Success Stories</h3>
          </div>

          <div className={`t-slider__track t-slider__track--${sliderAnimDir || 'idle'}`}>
            {sliderCards.map((t) => (
              <button
                key={t.id}
                className={`t-slider-card t-slider-card--${TAG_COLORS[t.tag]}`}
                onClick={() => setActiveTestimonial(t)}
                aria-label={`View ${t.name}'s testimonial`}
              >
                {t.marks && t.marks >= 90 ? (
                  <span className="t-slider-card__ribbon">🏆 High Achiever</span>
                ) : t.badge ? (
                  <span className="t-slider-card__ribbon t-slider-card__ribbon--badge">⭐ {t.badge}</span>
                ) : null}
                <div className="t-slider-card__top">
                  <div className="t-slider-card__photo-wrap">
                    <StudentPhoto
                      src={t.image}
                      alt={t.name}
                      initials={t.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                      photoClass="t-slider-card__photo"
                      fallbackClass="t-slider-card__photo-fallback"
                    />
                  </div>
                  <div className="t-slider-card__info">
                    <p className="t-slider-card__name">{t.name}</p>
                    <p className="t-slider-card__country">{t.flag} {t.country}</p>
                    <span className={`t-tag t-tag--${TAG_COLORS[t.tag]}`}>{t.tag}</span>
                  </div>
                </div>
                <p className="t-slider-card__quote">
                  &ldquo;{t.quote.length > 160 ? t.quote.slice(0, 157) + '…' : t.quote}&rdquo;
                </p>
                <div className="t-slider-card__footer">
                  <span className="t-slider-card__period">{t.exam} · {t.period}</span>
                  {t.marks && <span className="t-slider-card__marks">{t.marks} marks</span>}
                </div>
              </button>
            ))}
          </div>

          <div className="t-slider__controls">
            <button
              className="t-arrow"
              aria-label="Previous"
              onClick={() => { goSlider('prev'); resetTimer(); }}
            >
              &#8249;
            </button>
            <div className="t-dots">
              {Array.from({ length: SLIDER_PAGES }, (_, i) => (
                <button
                  key={i}
                  className={`t-dot${i === sliderPage ? ' t-dot--active' : ''}`}
                  aria-label={`Slide group ${i + 1}`}
                  onClick={() => { setSliderPage(i); resetTimer(); }}
                />
              ))}
            </div>
            <button
              className="t-arrow"
              aria-label="Next"
              onClick={() => { goSlider('next'); resetTimer(); }}
            >
              &#8250;
            </button>
          </div>
        </div>
      </div>

      {/* ══ Search & Filters ══ */}
      <div className="t-filter-bar">
        <div className="t-filter-bar__container">
          <div className="t-filter-bar__search-wrap">
            <span className="t-filter-bar__search-icon" aria-hidden="true">🔍</span>
            <input
              type="search"
              className="t-filter-bar__search"
              placeholder="Search by name, country, exam…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search testimonials"
            />
            {searchQuery && (
              <button className="t-filter-bar__clear" onClick={() => setSearchQuery('')} aria-label="Clear search">✕</button>
            )}
          </div>

          <div className="t-filter-bar__groups">
            <div className="t-filter-group">
              <span className="t-filter-group__label">Exam</span>
              <div className="t-filter-group__chips">
                {['All', ...EXAM_TAGS].map((tag) => (
                  <button
                    key={tag}
                    className={`t-chip${selectedTag === tag ? ' t-chip--active' : ''} ${tag !== 'All' ? `t-chip--${TAG_COLORS[tag]}` : ''}`}
                    onClick={() => setSelectedTag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="t-filter-group">
              <span className="t-filter-group__label">Year</span>
              <div className="t-filter-group__chips">
                {['All', ...INTAKE_YEARS].map((yr) => (
                  <button
                    key={yr}
                    className={`t-chip${selectedYear === String(yr) || (yr === 'All' && selectedYear === 'All') ? ' t-chip--active' : ''}`}
                    onClick={() => setSelectedYear(yr === 'All' ? 'All' : String(yr))}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <p className="t-filter-bar__count">
            Showing <strong>{filteredGrid.length}</strong> of {TESTIMONIALS_DATA.length} testimonials
          </p>
        </div>
      </div>

      {/* ══ Testimonials Grid ══ */}
      <div className="t-grid-section">
        <div className="t-grid-section__container">
          {filteredGrid.length === 0 ? (
            <div className="t-grid__empty">
              <p>No testimonials match your search. <button className="t-grid__reset-btn" onClick={() => { setSearchQuery(''); setSelectedTag('All'); setSelectedYear('All'); }}>Reset filters</button></p>
            </div>
          ) : (
            <div className="t-grid">
              {filteredGrid.map((t) => (
                <button
                  key={t.id}
                  className={`t-card t-card--${TAG_COLORS[t.tag]}`}
                  onClick={() => setActiveTestimonial(t)}
                  aria-label={`View ${t.name}'s testimonial`}
                >
                  <div className="t-card__header">
                    <div className="t-card__photo-wrap">
                      <StudentPhoto
                        src={t.image}
                        alt={t.name}
                        initials={t.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                        photoClass="t-card__photo"
                        fallbackClass="t-card__photo-fallback"
                      />
                    </div>
                    <div className="t-card__identity">
                      <p className="t-card__name">{t.name}</p>
                      <p className="t-card__country">{t.flag} {t.country}</p>
                      <div className="t-card__chips">
                        <span className={`t-tag t-tag--${TAG_COLORS[t.tag]}`}>{t.tag}</span>
                        {t.badge && <span className="t-badge t-badge--sm">{t.badge}</span>}
                      </div>
                    </div>
                    {t.marks && (
                      <div className={`t-card__score${t.marks >= 90 ? ' t-card__score--high' : ''}`}>
                        <span className="t-card__score-num">{t.marks}</span>
                        <span className="t-card__score-label">marks</span>
                      </div>
                    )}
                  </div>

                  <p className="t-card__quote">
                    &ldquo;{t.quote.length > 140 ? t.quote.slice(0, 137) + '…' : t.quote}&rdquo;
                  </p>

                  <div className="t-card__footer">
                    <span className="t-card__period">{t.exam} · {t.period}</span>
                    <span className="t-card__view">View profile →</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══ Modal ══ */}
      {activeTestimonial && (
        <StudentModal
          testimonial={activeTestimonial}
          onClose={() => setActiveTestimonial(null)}
        />
      )}
    </section>
  );
}
