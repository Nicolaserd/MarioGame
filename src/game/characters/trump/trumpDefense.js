import { TRUMP } from './trumpConstants.js'

const DODGE = TRUMP.dodge
export const isTrumpDodging = boss => ['duck', 'jump', 'dodge-recover'].includes(boss.pose)

function heightFromFeet(boss, height) {
  boss.y += boss.height - height
  boss.height = height
}

export function settleTrump(boss, floor, gravity, dt) {
  boss.y = Math.min(floor - boss.height, boss.y + boss.vy * dt + gravity * dt * dt / 2)
  boss.vy += gravity * dt
  if (boss.y + boss.height >= floor) boss.vy = 0
}

export function cancelTrumpDodge(boss) {
  heightFromFeet(boss, TRUMP.height)
  boss.dodgeType = null
  boss.dodgeTime = 0
}

// React only to visible incoming shots, never input. Height prediction includes gravity.
function chooseDodge(s, floor) {
  const b = s.boss
  const threats = s.projectiles.filter(q => q.friendly && q.vx > 0).map(q => {
    const width = q.hitboxWidth ?? q.width
    const height = q.hitboxHeight ?? q.height
    const right = q.x + (q.width + width) / 2
    const time = (b.x - right) / q.vx
    const top = q.y + (q.height - height) / 2 + q.vy * time + (q.gravity ?? 0) * time * time / 2
    const exitTime = time + (b.width + width) / q.vx
    const exitBottom = q.y + (q.height + height) / 2 + q.vy * exitTime + (q.gravity ?? 0) * exitTime * exitTime / 2
    return { time, top, bottom: top + height, exitBottom }
  }).filter(q => q.time >= DODGE.anticipation + 0.05 && q.time <= DODGE.lookAhead[s.phase - 1]
    && q.bottom > floor - TRUMP.height && q.top < floor).sort((a, b) => a.time - b.time)
  const threat = threats[0]
  if (!threat) return null
  // A falling pizza must clear the entire body, not just its front edge.
  if (Math.max(threat.bottom, threat.exitBottom) < floor - DODGE.crouchHeight - 1) return 'duck'
  if (threat.top > floor - 162) return 'jump'
  return null
}

export function updateTrumpDefense(s, floor, gravity, dt) {
  const b = s.boss
  b.dodgeCooldown = Math.max(0, b.dodgeCooldown - dt)
  if (!isTrumpDodging(b)) {
    settleTrump(b, floor, gravity, dt)
    const earlyWindup = b.pose === 'windup' && b.poseTime < DODGE.windupWindow
    if ((b.pose !== 'idle' && !earlyWindup) || b.hurt > 0 || b.dodgeCooldown > 0 || b.y + b.height < floor) return false
    const dodge = chooseDodge(s, floor)
    if (!dodge) return false
    if (earlyWindup) {
      // Restart the same attack with a complete warning after the dodge, never a surprise cast.
      s.attackIndex = Math.max(0, s.attackIndex - 1)
      s.attack = null; s.targets = []; s.volleyRemaining = 0
    }
    b.pose = dodge; b.poseTime = 0; b.dodgeTime = 0; b.dodgeType = dodge
    heightFromFeet(b, 180)
    s.speech = dodge === 'duck' ? '¡Eso no estaba en el contrato!' : '¡Mis negocios siempre suben!'
    s.speechTimer = 1.6
  }
  const previous = b.dodgeTime
  b.dodgeTime += dt
  if (b.pose === 'duck') {
    const deep = b.dodgeTime >= DODGE.anticipation && b.dodgeTime < DODGE.duckDuration - DODGE.anticipation
    heightFromFeet(b, deep ? DODGE.crouchHeight : 180)
    if (b.dodgeTime < DODGE.duckDuration) return true
  } else if (b.pose === 'jump') {
    if (b.dodgeTime < DODGE.jumpAnticipation) return true
    if (previous < DODGE.jumpAnticipation) b.vy = -DODGE.jumpVelocity
    heightFromFeet(b, b.vy < -100 ? 185 : 170)
    settleTrump(b, floor, gravity, dt)
    if (b.vy !== 0 || b.y + b.height < floor) return true
  } else if (b.pose === 'dodge-recover') {
    heightFromFeet(b, b.poseTime < DODGE.landingDuration ? (b.dodgeType === 'jump' ? 168 : 180) : TRUMP.height)
    if (b.poseTime < DODGE.recovery[s.phase - 1]) return true
    cancelTrumpDodge(b)
    b.pose = 'idle'; b.poseTime = 0; s.attackTimer = 0.2
    return true
  }
  b.pose = 'dodge-recover'; b.poseTime = 0
  heightFromFeet(b, b.dodgeType === 'jump' ? 168 : 180)
  b.dodgeCooldown = DODGE.cooldown[s.phase - 1]
  return true
}
