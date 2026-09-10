import './bossAttackCue.css'

export function BossAttackCue({ x, y, label, progress, released = false }) {
  return <div className={`boss-attack-cue ${released ? 'is-released' : ''}`} style={{ left: x, top: y }}>
    <span>{released ? '¡AHORA!' : label}</span>
    <div className="boss-attack-track"><i style={{ transform: `scaleX(${Math.max(0, Math.min(1, progress))})` }} /></div>
  </div>
}
