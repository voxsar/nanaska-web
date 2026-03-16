import './LecturerPanel.css';

export default function LecturerPanel({ lecturer, compact = false }) {
  return (
    <div className={`lecturer-panel${compact ? ' lecturer-panel--compact' : ''}`}>
      <div className="lecturer-panel__image-col">
        <div className="lecturer-panel__image-wrap">
          <img
            src={lecturer.imageUrl}
            alt={lecturer.name}
            className="lecturer-panel__image"
            loading="lazy"
          />
          <div className="lecturer-panel__image-accent" />
        </div>
      </div>

      <div className="lecturer-panel__body">
        <span className="lecturer-panel__eyebrow">
          {compact ? 'Your Lecturer' : 'Our Lead Lecturer'}
        </span>
        <h2 className="lecturer-panel__name">{lecturer.name}</h2>
        <p className="lecturer-panel__title">{lecturer.title}</p>
        <div className="lecturer-panel__credentials">
          {lecturer.credentials.map(c => (
            <span key={c} className="lecturer-panel__badge">{c}</span>
          ))}
        </div>
        <p className="lecturer-panel__bio">{lecturer.bio}</p>
        {!compact && lecturer.bio2 && (
          <p className="lecturer-panel__bio">{lecturer.bio2}</p>
        )}
        {lecturer.specialties && (
          <div className="lecturer-panel__specialties">
            {lecturer.specialties.map(s => (
              <span key={s} className="lecturer-panel__specialty-tag">{s}</span>
            ))}
          </div>
        )}
        <div className="lecturer-panel__stats">
          {lecturer.stats.map(({ number, label }) => (
            <div key={label} className="lecturer-panel__stat">
              <span className="lecturer-panel__stat-number">{number}</span>
              <span className="lecturer-panel__stat-label">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
