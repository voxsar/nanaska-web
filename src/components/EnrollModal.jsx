import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './EnrollModal.css';

export default function EnrollModal() {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [level, setLevel] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleClose = useCallback(() => {
    setOpen(false);
    setDismissed(true);
  }, []);

  /* Show modal after 4 seconds on first visit */
  useEffect(() => {
    const seen = sessionStorage.getItem('enrollModalSeen');
    if (seen) return;
    const t = setTimeout(() => {
      if (!dismissed) {
        setOpen(true);
        sessionStorage.setItem('enrollModalSeen', '1');
      }
    }, 4000);
    return () => clearTimeout(t);
  }, [dismissed]);

  /* Close on Escape key */
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, handleClose]);

  /* Prevent body scroll when modal is open */
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name && email) {
      setSubmitted(true);
    }
  };

  if (!open) return null;

  return (
    <div className="enroll-modal__overlay" onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
      <div className="enroll-modal" role="dialog" aria-modal="true" aria-labelledby="enroll-modal-title">

        <button className="enroll-modal__close" onClick={handleClose} aria-label="Close enrolment form">✕</button>

        <div className="enroll-modal__badge">🎓 Next Intake Open</div>

        <h2 className="enroll-modal__title" id="enroll-modal-title">
          Start Your CIMA Journey Today
        </h2>
        <p className="enroll-modal__sub">
          Register your interest and our team will reach out within 24 hours.
        </p>

        {submitted ? (
          <div className="enroll-modal__success">
            <span className="enroll-modal__success-icon">✓</span>
            <h3>Thank you, {name.split(' ')[0]}!</h3>
            <p>We've received your details and will be in touch shortly.</p>
            <Link to="/enrollment" className="enroll-modal__cta" onClick={handleClose}>
              View Full Enrolment
            </Link>
          </div>
        ) : (
          <form className="enroll-modal__form" onSubmit={handleSubmit}>
            <div className="enroll-modal__field">
              <label htmlFor="enroll-name">Full Name *</label>
              <input
                id="enroll-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                required
              />
            </div>

            <div className="enroll-modal__field">
              <label htmlFor="enroll-email">Email Address *</label>
              <input
                id="enroll-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="enroll-modal__field">
              <label htmlFor="enroll-phone">Phone Number</label>
              <input
                id="enroll-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+94 77 xxx xxxx"
              />
            </div>

            <div className="enroll-modal__field">
              <label htmlFor="enroll-level">CIMA Level</label>
              <select
                id="enroll-level"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              >
                <option value="">Select a level…</option>
                <option value="certificate">Certificate Level</option>
                <option value="operational">Operational Level</option>
                <option value="management">Management Level</option>
                <option value="strategic">Strategic Level</option>
              </select>
            </div>

            <button type="submit" className="enroll-modal__submit">
              Register My Interest →
            </button>

            <p className="enroll-modal__note">
              Or <Link to="/enrollment" onClick={handleClose}>view the full enrolment page</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
