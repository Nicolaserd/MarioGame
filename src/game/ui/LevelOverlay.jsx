import './levelOverlay.css'

export function LevelOverlay({ titleId, eyebrow, title, children, className = '' }) {
  return <div className={`level-overlay ${className}`}>
    <div className="level-card" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <span className="level-eyebrow">{eyebrow}</span>
      <h2 id={titleId}>{title}</h2>
      {children}
    </div>
  </div>
}
