import { TRUMP } from './trumpConstants.js'

// Frames follow simulation time: pausing never skips a pose or restarts a cast.
export function getTrumpFrame(pose, elapsed = 0) {
  if (pose === 'windup') return 0
  if (pose === 'recover' && elapsed < 0.18) return 2
  if (pose === 'attack') return elapsed < TRUMP.castDuration / 2 ? 1 : 2
  if (pose === 'angry') return 3 + Math.min(2, Math.floor(elapsed / (TRUMP.rageDuration / 3)))
  if (pose === 'defeated') return 6 + Math.min(2, Math.floor(elapsed / 0.65))
  return null
}

export function getTrumpDodgeFrame(pose, elapsed, vy, dodgeType) {
  const d = TRUMP.dodge
  if (pose === 'duck') return elapsed < d.anticipation ? 0 : elapsed < d.duckDuration - d.anticipation ? 1 : 2
  if (pose === 'jump') return elapsed < d.jumpAnticipation ? 0 : vy < -100 ? 3 : 4
  if (pose === 'dodge-recover' && elapsed < d.landingDuration) return dodgeType === 'jump' ? 5 : 2
  return null
}
