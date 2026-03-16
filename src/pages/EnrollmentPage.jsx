import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './EnrollmentPage.css';

const CIMA_STAGES = [
  'Certificate Level',
  'Operational Level',
  'Management Level',
  'Strategic Level',
];

const COUNTRIES = [
  'Sri Lanka', 'United Kingdom', 'Australia', 'United States', 'Canada',
  'Singapore', 'Malaysia', 'India', 'UAE', 'Other',
];

export default function EnrollmentPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const [submitted, setSubmitted] = useState(false);
  const [showCimaId, setShowCimaId] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', whatsapp: '',
    cimaId: '', cimaStage: '', dob: '', gender: '',
    country: '', street: '', city: '', postcode: '',
    notes: '', terms: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    clearCart();
  };

  if (submitted) {
    return (
      <div className="enrollment-page">
        <div className="enrollment-page__success">
          <div className="enrollment-page__success-icon">🎉</div>
          <h1>Enrollment Request Received!</h1>
          <p>Thank you for your interest. Our team will contact you shortly to confirm your enrollment details and finalize pricing.</p>
          <Link to="/" className="enrollment-page__success-btn">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="enrollment-page">
      <section className="enrollment-page__hero">
        <div className="enrollment-page__hero-inner">
          <h1 className="enrollment-page__hero-title">Complete Your Enrollment</h1>
          <p className="enrollment-page__hero-sub">Fill in your details and we&apos;ll get in touch to confirm your place.</p>
        </div>
      </section>

      <div className="enrollment-page__body">
        <div className="enrollment-page__container">
          {/* Left: Summary */}
          <aside className="enrollment-page__summary">
            <div className="enrollment-page__summary-card">
              <h2 className="enrollment-page__summary-title">Enrollment Summary</h2>
              {cartItems.length === 0 ? (
                <p className="enrollment-page__summary-empty">
                  Your cart is empty. <Link to="/">Browse courses</Link>
                </p>
              ) : (
                <>
                  <ul className="enrollment-page__summary-list">
                    {cartItems.map(item => (
                      <li
                        key={item.type === 'level' ? item.levelId : item.courseCode}
                        className={`enrollment-page__summary-item${item.type === 'level' ? ' enrollment-page__summary-item--level' : ''}`}
                      >
                        <div className="enrollment-page__summary-item-info">
                          <span className="enrollment-page__summary-item-name">
                            {item.type === 'level' ? item.levelTitle : `${item.courseCode} – ${item.courseName}`}
                          </span>
                          {item.type === 'level' && (
                            <span className="enrollment-page__summary-badge">
                              📚 Full Level · {item.courseCount} courses
                            </span>
                          )}
                        </div>
                        <span className="enrollment-page__summary-price">${item.price}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="enrollment-page__summary-total">
                    <span>Estimated Total</span>
                    <span>${cartTotal}</span>
                  </div>
                  <p className="enrollment-page__summary-note">
                    ℹ️ Final pricing will be confirmed by our team upon enrollment review.
                  </p>
                </>
              )}
            </div>
          </aside>

          {/* Right: Form */}
          <main className="enrollment-page__form-col">
            <form className="enrollment-page__form" onSubmit={handleSubmit} noValidate>
              {/* Personal Details */}
              <fieldset className="enrollment-page__fieldset">
                <legend className="enrollment-page__legend">Personal Details</legend>
                <div className="enrollment-page__row">
                  <div className="enrollment-page__field">
                    <label className="enrollment-page__label" htmlFor="firstName">First Name *</label>
                    <input
                      id="firstName" name="firstName" type="text"
                      className="enrollment-page__input"
                      value={form.firstName} onChange={handleChange} required
                    />
                  </div>
                  <div className="enrollment-page__field">
                    <label className="enrollment-page__label" htmlFor="lastName">Last Name *</label>
                    <input
                      id="lastName" name="lastName" type="text"
                      className="enrollment-page__input"
                      value={form.lastName} onChange={handleChange} required
                    />
                  </div>
                </div>
                <div className="enrollment-page__field">
                  <label className="enrollment-page__label" htmlFor="email">Email Address *</label>
                  <input
                    id="email" name="email" type="email"
                    className="enrollment-page__input"
                    value={form.email} onChange={handleChange} required
                  />
                </div>
                <div className="enrollment-page__row">
                  <div className="enrollment-page__field">
                    <label className="enrollment-page__label" htmlFor="phone">Phone Number *</label>
                    <input
                      id="phone" name="phone" type="tel"
                      className="enrollment-page__input"
                      value={form.phone} onChange={handleChange} required
                    />
                  </div>
                  <div className="enrollment-page__field">
                    <label className="enrollment-page__label" htmlFor="whatsapp">WhatsApp Number</label>
                    <input
                      id="whatsapp" name="whatsapp" type="tel"
                      className="enrollment-page__input"
                      placeholder="Optional"
                      value={form.whatsapp} onChange={handleChange}
                    />
                  </div>
                </div>
              </fieldset>

              {/* Professional Details */}
              <fieldset className="enrollment-page__fieldset">
                <legend className="enrollment-page__legend">Professional Details</legend>
                <div className="enrollment-page__field enrollment-page__field--toggle">
                  <label className="enrollment-page__toggle-label">
                    <input
                      type="checkbox"
                      checked={showCimaId}
                      onChange={() => setShowCimaId(v => !v)}
                    />
                    <span>I have a CIMA ID</span>
                  </label>
                </div>
                {showCimaId && (
                  <div className="enrollment-page__field">
                    <label className="enrollment-page__label" htmlFor="cimaId">CIMA ID</label>
                    <input
                      id="cimaId" name="cimaId" type="text"
                      className="enrollment-page__input"
                      value={form.cimaId} onChange={handleChange}
                    />
                  </div>
                )}
                <div className="enrollment-page__row">
                  <div className="enrollment-page__field">
                    <label className="enrollment-page__label" htmlFor="cimaStage">CIMA Stage</label>
                    <select
                      id="cimaStage" name="cimaStage"
                      className="enrollment-page__select"
                      value={form.cimaStage} onChange={handleChange}
                    >
                      <option value="">Select stage...</option>
                      {CIMA_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="enrollment-page__field">
                    <label className="enrollment-page__label" htmlFor="dob">Date of Birth</label>
                    <input
                      id="dob" name="dob" type="date"
                      className="enrollment-page__input"
                      value={form.dob} onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="enrollment-page__field">
                  <label className="enrollment-page__label">Gender</label>
                  <div className="enrollment-page__radio-group">
                    {['Male', 'Female', 'Prefer not to say'].map(g => (
                      <label key={g} className="enrollment-page__radio-label">
                        <input
                          type="radio" name="gender" value={g}
                          checked={form.gender === g}
                          onChange={handleChange}
                        />
                        <span>{g}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </fieldset>

              {/* Address */}
              <fieldset className="enrollment-page__fieldset">
                <legend className="enrollment-page__legend">Address</legend>
                <div className="enrollment-page__field">
                  <label className="enrollment-page__label" htmlFor="country">Country *</label>
                  <select
                    id="country" name="country"
                    className="enrollment-page__select"
                    value={form.country} onChange={handleChange} required
                  >
                    <option value="">Select country...</option>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="enrollment-page__field">
                  <label className="enrollment-page__label" htmlFor="street">Street Address *</label>
                  <input
                    id="street" name="street" type="text"
                    className="enrollment-page__input"
                    value={form.street} onChange={handleChange} required
                  />
                </div>
                <div className="enrollment-page__row">
                  <div className="enrollment-page__field">
                    <label className="enrollment-page__label" htmlFor="city">City *</label>
                    <input
                      id="city" name="city" type="text"
                      className="enrollment-page__input"
                      value={form.city} onChange={handleChange} required
                    />
                  </div>
                  <div className="enrollment-page__field">
                    <label className="enrollment-page__label" htmlFor="postcode">Postcode *</label>
                    <input
                      id="postcode" name="postcode" type="text"
                      className="enrollment-page__input"
                      value={form.postcode} onChange={handleChange} required
                    />
                  </div>
                </div>
              </fieldset>

              {/* Notes & Terms */}
              <fieldset className="enrollment-page__fieldset">
                <legend className="enrollment-page__legend">Additional Notes</legend>
                <div className="enrollment-page__field">
                  <label className="enrollment-page__label" htmlFor="notes">Notes</label>
                  <textarea
                    id="notes" name="notes"
                    className="enrollment-page__textarea"
                    rows={4}
                    placeholder="Any questions or special requirements..."
                    value={form.notes} onChange={handleChange}
                  />
                </div>
                <div className="enrollment-page__field enrollment-page__field--terms">
                  <label className="enrollment-page__checkbox-label">
                    <input
                      type="checkbox" name="terms"
                      checked={form.terms} onChange={handleChange} required
                    />
                    <span>
                      I agree to Nanaska&apos;s{' '}
                      <a href="https://www.nanaska.com" target="_blank" rel="noopener noreferrer">
                        terms and conditions
                      </a>
                      . I understand that pricing will be confirmed upon enrollment review. *
                    </span>
                  </label>
                </div>
              </fieldset>

              <button type="submit" className="enrollment-page__submit-btn">
                Submit Enrollment Request →
              </button>
            </form>
          </main>
        </div>
      </div>
    </div>
  );
}
