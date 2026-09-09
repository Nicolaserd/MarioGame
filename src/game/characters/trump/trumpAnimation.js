import { TRUMP } from './trumpConstants.js'

// Frames follow simulation time: pausing never skips a pose or restarts a cast.
export function getTrumpFrame(pose, elapsed = 0) {
  if (pose === 'windup') return 0
  if (pose === 'attack') return elapsed < TRUMP.castDuration / 2 ? 1 : 2
  if (pose === 'angry') return 3 + Math.min(2, Math.floor(elapsed / (TRUMP.rageDuration / 3)))
  if (pose === 'defeated') return 6 + Math.min(2, Math.floor(elapsed / 0.65))
  return null
}
