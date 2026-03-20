import { useState } from 'react';
import { Link } from 'react-router-dom';
import './NanaskaAlumniPage.css';
import { useApi } from '../hooks/useApi';

const INITIAL = { name: '', email: '', phone: '', occupation: '', address: '' };

export default function NanaskaAlumniPage() {
  const [form, setForm] = useState(INITIAL);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const { data: prizeWinners } = useApi('/testimonials?prizeWinner=true&published=true');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');
    setSubmitted(true);
  };

  return (
    <div className="alumni-page">
      {/* Hero */}
      <section className="alumni-page__hero">
        <div className="alumni-page__hero-inner">
          <span className="alumni-page__breadcrumb">
            <Link to="/">Home</Link> / <Link to="/about">About Us</Link> / Nanaska Alumni
          </span>
          <h1>Nanaska Alumni</h1>
          <p>
            A proud community of CIMA-qualified professionals who began their journey at
            Nanaska. Stay connected, give back, and inspire the next generation.
          </p>
        </div>
        <div className="alumni-page__hero-wave">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
            <path fill="#f9fbff" d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z"/>
          </svg>
        </div>
      </section>

      {/* Community Info */}
      <section className="alumni-page__community">
        <div className="alumni-page__container alumni-page__community-grid">
          <div className="alumni-page__community-text">
            <h2>Join the Nanaska Family</h2>
            <p>
              Since our founding, Nanaska has been the launchpad for hundreds of CIMA
              professionals across Sri Lanka, Malaysia, the GCC and beyond. Our alumni
              network spans global industries — from finance and banking to consulting
              and corporate leadership.
            </p>
            <p>
              As a Nanaska alumnus, you are part of a legacy of excellence. Share your
              success story, mentor current students, and stay connected with the
              institute that helped shape your career.
            </p>
            <div className="alumni-page__highlights">
              {[
                { icon: '🌍', label: 'Global Alumni Community' },
                { icon: '🤝', label: 'Peer Mentoring Network' },
                { icon: '📢', label: 'Alumni Events & Webinars' },
                { icon: '🏅', label: 'Prize Winner Recognition' },
              ].map((h) => (
                <div key={h.label} className="alumni-highlight">
                  <span className="alumni-highlight__icon">{h.icon}</span>
                  <span className="alumni-highlight__label">{h.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Registration Form */}
          <div className="alumni-page__form-wrap">
            <h3 className="alumni-page__form-title">Register as Alumni</h3>
            <p className="alumni-page__form-sub">
              If you have been a student of Nanaska and completed CIMA, please provide
              your contact details below.
            </p>
            {submitted ? (
              <div className="alumni-page__success">
                <span className="alumni-page__success-icon">✅</span>
                <h4>Thank You!</h4>
                <p>
                  Your details have been submitted. Welcome to the Nanaska Alumni
                  community!
                </p>
              </div>
            ) : (
              <form className="alumni-form" onSubmit={handleSubmit} noValidate>
                {error && <p className="alumni-form__error">{error}</p>}
                <div className="alumni-form__field">
                  <label htmlFor="alumni-name">Full Name *</label>
                  <input
                    id="alumni-name"
                    name="name"
                    type="text"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="alumni-form__field">
                  <label htmlFor="alumni-email">Email Address *</label>
                  <input
                    id="alumni-email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="alumni-form__field">
                  <label htmlFor="alumni-phone">Phone Number *</label>
                  <input
                    id="alumni-phone"
                    name="phone"
                    type="tel"
                    placeholder="+94 77 XXXXXXX"
                    value={form.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="alumni-form__field">
                  <label htmlFor="alumni-occupation">Occupation</label>
                  <input
                    id="alumni-occupation"
                    name="occupation"
                    type="text"
                    placeholder="Your current role"
                    value={form.occupation}
                    onChange={handleChange}
                  />
                </div>
                <div className="alumni-form__field">
                  <label htmlFor="alumni-address">Address</label>
                  <textarea
                    id="alumni-address"
                    name="address"
                    rows={3}
                    placeholder="Your address"
                    value={form.address}
                    onChange={handleChange}
                  />
                </div>
                <button type="submit" className="alumni-form__submit">Submit</button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Prize Winner Showcase */}
      <section className="alumni-page__showcase">
        <div className="alumni-page__container">
          <h2 className="alumni-page__section-title">Our Prize Winners</h2>
          <p className="alumni-page__section-sub">
            Nanaska alumni have made Sri Lanka proud with global prize wins across CIMA
            exams. Here are some of our outstanding achievers:
          </p>
          <div className="alumni-showcase-grid">
            {(prizeWinners && prizeWinners.length > 0 ? prizeWinners : [
              { studentName: 'Luong Thi Thuy Linh', exam: 'Strategic Case Study Nov 2020', country: 'Malaysia', badge: 'Global Prize Winner', imageUrl: null, quote: '' },
              { studentName: 'Hassan Ariff', exam: 'Strategic Case Study Aug 2020', country: 'Sri Lanka', badge: 'Prize Winner', imageUrl: null, quote: '' },
              { studentName: 'Nimesh Jayawardana', exam: 'Strategic Case Study', country: 'Sri Lanka', badge: 'Joint Prize Winner', imageUrl: null, quote: '' },
              { studentName: 'Chinthaka Abeydeera', exam: 'Strategic Case Study', country: 'Sri Lanka', badge: 'Joint Prize Winner', imageUrl: null, quote: '' },
              { studentName: 'Lakshika Kalubowila', exam: 'Management Case Study Nov 2020', country: 'Sri Lanka', badge: 'Prize Winner', imageUrl: null, quote: '' },
              { studentName: 'Saman Edirimannage', exam: 'CIMA Gateway Aug 2020', country: 'Oman', badge: 'Joint Prize Winner', imageUrl: null, quote: '' },
            ]).map((w) => (
              <div key={w.studentName || w.name} className="alumni-showcase-card">
                {w.imageUrl ? (
                  <img src={w.imageUrl} alt={w.studentName || w.name} className="alumni-showcase-avatar alumni-showcase-avatar--img" loading="lazy" />
                ) : (
                  <div className="alumni-showcase-avatar">
                    {(w.studentName || w.name || '').split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                )}
                <h4 className="alumni-showcase-card__name">{w.studentName || w.name}</h4>
                <p className="alumni-showcase-card__exam">{w.exam}</p>
                <p className="alumni-showcase-card__country">📍 {w.country}</p>
                {w.badge && <span className="alumni-showcase-card__badge">🏅 {w.badge}</span>}
                {w.quote && <p className="alumni-showcase-card__quote">"{w.quote.substring(0, 120)}{w.quote.length > 120 ? '…' : ''}"</p>}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
