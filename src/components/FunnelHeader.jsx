import './FunnelHeader.css';

export default function FunnelHeader({ ctaText = 'Register Now', ctaHref = '#register' }) {
  return (
    <header className="funnel-header">
      <div className="funnel-header__inner">
        <a href="https://www.nanaska.com" className="funnel-header__logo" aria-label="Nanaska home">
          <span className="funnel-header__logo-nan">NAN</span>
          <span className="funnel-header__logo-aska">ASKA</span>
        </a>
        <a href={ctaHref} className="funnel-header__cta">
          {ctaText}
        </a>
      </div>
    </header>
  );
}
