import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './FloatingWidgets.css';

export default function FloatingWidgets() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 350);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <>
      {/* ── Floating action buttons (bottom-right stack) ── */}
      <div className="fab-stack">
        {/* Enroll Now button */}
        <Link to="/enrollment" className="fab fab--enroll" aria-label="Enroll now">
          <span className="fab__icon">🎓</span>
          <span className="fab__label">Enroll Now</span>
        </Link>

        {/* Chat button */}
        <button
          className="fab fab--chat"
          aria-label="Open chat"
          onClick={() => setChatOpen((v) => !v)}
        >
          <span className="fab__icon">{chatOpen ? '✕' : '💬'}</span>
          <span className="fab__label">Chat</span>
        </button>
      </div>

      {/* ── Dummy chat panel ── */}
      {chatOpen && (
        <div className="chat-panel" role="dialog" aria-modal="true" aria-label="Chat with us">
          <div className="chat-panel__header">
            <span>Chat with Nanaska</span>
            <button className="chat-panel__close" onClick={() => setChatOpen(false)} aria-label="Close chat">✕</button>
          </div>
          <div className="chat-panel__body">
            <div className="chat-panel__msg chat-panel__msg--bot">
              👋 Hi! How can we help you today?
            </div>
            <div className="chat-panel__msg chat-panel__msg--bot">
              Ask us about CIMA courses, enrolment, or study schedules.
            </div>
          </div>
          <form
            className="chat-panel__form"
            onSubmit={(e) => {
              e.preventDefault();
              const input = e.target.elements.msg;
              if (input.value.trim()) {
                input.value = '';
              }
            }}
          >
            <input
              name="msg"
              type="text"
              className="chat-panel__input"
              placeholder="Type a message…"
              autoComplete="off"
            />
            <button type="submit" className="chat-panel__send">➤</button>
          </form>
        </div>
      )}

      {/* ── Scroll-to-top button (right side) ── */}
      <button
        className={`scroll-top-btn${showScrollTop ? ' scroll-top-btn--visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Scroll to top"
      >
        ▲
      </button>
    </>
  );
}
