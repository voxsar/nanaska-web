import { useState, useEffect, useRef } from 'react';
import './Contact.css';

// Office coordinates – Galle Road, Colombo 03, Sri Lanka
const MAP_LAT = 6.8955;
const MAP_LNG = 79.8527;
const MAP_BBOX = `${MAP_LNG - 0.004}%2C${MAP_LAT - 0.004}%2C${MAP_LNG + 0.004}%2C${MAP_LAT + 0.004}`;
const MAP_EMBED_SRC = `https://www.openstreetmap.org/export/embed.html?bbox=${MAP_BBOX}&layer=mapnik&marker=${MAP_LAT}%2C${MAP_LNG}`;
const MAP_LINK = `https://www.openstreetmap.org/?mlat=${MAP_LAT}&mlon=${MAP_LNG}#map=17/${MAP_LAT}/${MAP_LNG}`;

const INFO_CARDS = [
  {
    icon: '📞',
    title: 'Call Us',
    lines: ['+94 77 499 7338', '+94 77 711 8902', '+94 112 575 016'],
    href: 'tel:+94774997338',
    cta: 'Call now',
  },
  {
    icon: '✉️',
    title: 'Email Us',
    lines: ['info@nanaska.com'],
    href: 'mailto:info@nanaska.com',
    cta: 'Send email',
  },
  {
    icon: '📍',
    title: 'Visit Us',
    lines: ['No. 464/1/1, Galle Road,', 'Colombo 03, Sri Lanka'],
    href: MAP_LINK,
    cta: 'Get directions',
  },
];

const SOCIAL_LINKS = [
  { label: 'Facebook', abbr: 'fb', href: 'https://www.facebook.com/LearnCIMA' },
  { label: 'Instagram', abbr: 'ig', href: 'https://www.instagram.com/nanaska__/' },
  { label: 'Twitter', abbr: 'tw', href: 'https://twitter.com/learn_cima' },
  { label: 'LinkedIn', abbr: 'li', href: 'https://www.linkedin.com/in/nanaska-learncima-92b430120/' },
];

const SUBJECTS = [
  'General Enquiry',
  'Course Information',
  'Enrollment',
  'Fees & Payment',
  'Exam Preparation',
  'Technical Support',
  'Other',
];

function useVisible(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setVisible(true); obs.disconnect(); }
      },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function InfoCard({ card, delay }) {
  const [ref, visible] = useVisible();
  return (
    <a
      ref={ref}
      href={card.href}
      target={card.href.startsWith('http') ? '_blank' : undefined}
      rel={card.href.startsWith('http') ? 'noopener noreferrer' : undefined}
      className={`contact__info-card${visible ? ' contact__info-card--visible' : ''}`}
      style={{ transitionDelay: `${delay}ms` }}
      aria-label={card.title}
    >
      <div className="contact__info-icon">{card.icon}</div>
      <h3 className="contact__info-title">{card.title}</h3>
      {card.lines.map((line) => (
        <p key={line} className="contact__info-line">{line}</p>
      ))}
      <span className="contact__info-cta">{card.cta} →</span>
    </a>
  );
}

export default function Contact() {
  const [headerRef, headerVisible] = useVisible(0.1);
  const [formRef, formVisible] = useVisible(0.1);
  const [mapRef, mapVisible] = useVisible(0.1);

  const [fields, setFields] = useState({
    name: '', email: '', phone: '', subject: SUBJECTS[0], message: '',
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  function validate() {
    const errs = {};
    if (!fields.name.trim()) errs.name = 'Please enter your name.';
    if (!fields.email.trim()) errs.email = 'Please enter your email address.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) errs.email = 'Please enter a valid email.';
    if (!fields.message.trim()) errs.message = 'Please enter a message.';
    return errs;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSending(true);
    // Submit via Netlify Forms (works when deployed to Netlify)
    const formData = new FormData(e.target);
    fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(formData).toString() })
      .then(() => {
        setSending(false);
        setSubmitted(true);
        setFields({ name: '', email: '', phone: '', subject: SUBJECTS[0], message: '' });
      })
      .catch(() => {
        setSending(false);
        setSubmitted(true);
        setFields({ name: '', email: '', phone: '', subject: SUBJECTS[0], message: '' });
      });
  }

  return (
    <section className="contact" id="contact-us">
      {/* ── HERO BANNER ─────────────────────────────────────── */}
      <div className="contact__hero">
        <div
          ref={headerRef}
          className={`contact__hero-inner${headerVisible ? ' contact__hero-inner--visible' : ''}`}
        >
          <span className="contact__eyebrow">We&apos;re Here to Help</span>
          <h2 className="contact__hero-title">Get in Touch</h2>
          <p className="contact__hero-subtitle">
            Have a question about our CIMA courses, fees, or schedules? Our friendly support
            team is ready to help you every step of the way.
          </p>
        </div>
      </div>

      {/* ── INFO CARDS ──────────────────────────────────────── */}
      <div className="contact__cards-row">
        {INFO_CARDS.map((card, i) => (
          <InfoCard key={card.title} card={card} delay={i * 120} />
        ))}
      </div>

      {/* ── FORM + MAP ──────────────────────────────────────── */}
      <div className="contact__main">
        {/* Form */}
        <div
          ref={formRef}
          className={`contact__form-wrap${formVisible ? ' contact__form-wrap--visible' : ''}`}
        >
          <h3 className="contact__form-heading">Send Us a Message</h3>
          <p className="contact__form-sub">
            Fill in the form below and we&apos;ll get back to you within one business day.
          </p>

          {submitted ? (
            <div className="contact__success">
              <span className="contact__success-icon">✅</span>
              <h4>Message Sent!</h4>
              <p>Thank you for reaching out. We&apos;ll be in touch shortly.</p>
              <button className="contact__reset-btn" onClick={() => setSubmitted(false)}>
                Send another message
              </button>
            </div>
          ) : (
            <form
              className="contact__form"
              onSubmit={handleSubmit}
              noValidate
              data-netlify="true"
              name="contact"
            >
              <input type="hidden" name="form-name" value="contact" />

              <div className="contact__form-row">
                <div className={`contact__field${errors.name ? ' contact__field--error' : ''}`}>
                  <label htmlFor="cf-name" className="contact__label">Full Name *</label>
                  <input
                    id="cf-name"
                    name="name"
                    type="text"
                    className="contact__input"
                    placeholder="e.g. John Smith"
                    value={fields.name}
                    onChange={handleChange}
                    autoComplete="name"
                  />
                  {errors.name && <span className="contact__error">{errors.name}</span>}
                </div>

                <div className={`contact__field${errors.email ? ' contact__field--error' : ''}`}>
                  <label htmlFor="cf-email" className="contact__label">Email Address *</label>
                  <input
                    id="cf-email"
                    name="email"
                    type="email"
                    className="contact__input"
                    placeholder="you@example.com"
                    value={fields.email}
                    onChange={handleChange}
                    autoComplete="email"
                  />
                  {errors.email && <span className="contact__error">{errors.email}</span>}
                </div>
              </div>

              <div className="contact__form-row">
                <div className="contact__field">
                  <label htmlFor="cf-phone" className="contact__label">Phone Number</label>
                  <input
                    id="cf-phone"
                    name="phone"
                    type="tel"
                    className="contact__input"
                    placeholder="+94 77 000 0000"
                    value={fields.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                  />
                </div>

                <div className="contact__field">
                  <label htmlFor="cf-subject" className="contact__label">Subject</label>
                  <select
                    id="cf-subject"
                    name="subject"
                    className="contact__select"
                    value={fields.subject}
                    onChange={handleChange}
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={`contact__field${errors.message ? ' contact__field--error' : ''}`}>
                <label htmlFor="cf-message" className="contact__label">Message *</label>
                <textarea
                  id="cf-message"
                  name="message"
                  className="contact__textarea"
                  placeholder="Tell us how we can help…"
                  rows={5}
                  value={fields.message}
                  onChange={handleChange}
                />
                {errors.message && <span className="contact__error">{errors.message}</span>}
              </div>

              <button
                type="submit"
                className={`contact__submit${sending ? ' contact__submit--sending' : ''}`}
                disabled={sending}
              >
                {sending ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          )}
        </div>

        {/* Map */}
        <div
          ref={mapRef}
          className={`contact__map-wrap${mapVisible ? ' contact__map-wrap--visible' : ''}`}
        >
          <h3 className="contact__map-heading">Find Us on the Map</h3>
          <p className="contact__map-address">
            📍 Study Support Centre: No. 464/1/1, Galle Road, Colombo 03, Sri Lanka
          </p>
          <div className="contact__map-frame">
            <iframe
              title="Nanaska Office Location – Galle Road, Colombo 03, Sri Lanka"
              src={MAP_EMBED_SRC}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <a
            href={MAP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="contact__map-link"
          >
            View larger map →
          </a>

          {/* Social links */}
          <div className="contact__social">
            <p className="contact__social-label">Connect with us</p>
            <div className="contact__social-row">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`contact__social-btn contact__social-btn--${s.abbr}`}
                  aria-label={s.label}
                >
                  {s.abbr.toUpperCase()}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
