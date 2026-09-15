import { clamp, intersects } from '../../physics/collision.js'
import { SYT_CHIP } from '../../projectiles/sytProjectileTypes.js'
import { setSytReaction, stepSyt, SYT_LINES } from '../../characters/syt/sytBehavior.js'
import { SYT, INTENSITY } from './sytConstants.js'

export function createSytRun() {
  return {
    mode: 'intro', elapsed: 0, remaining: SYT.duration, phase: 0, camera: 0,
    gap: SYT.initialGap, collected: 0, dodged: 0, stomped: 0, sequence: 0, nextId: 1,
    nextWave: 4, warning: null, hazards: [], platforms: [], pickups: [],
    speech: SYT_LINES.intro, speechTime: 4, reason: '',
    boss: { x: 5, pose: 'run', poseTime: 0 },
    player: { x: SYT.start, y: SYT.floor - SYT.playerHeight,
      width: SYT.playerWidth, height: SYT.playerHeight, vy: 0, speed: SYT.speed,
      grounded: true, crouched: false, health: SYT.health, hurt: 0, runClock: 0 },
  }
}

export function playerBody(p) {
  // Ignore the outstretched arms and the transparent margins of the sprite.
  return { x: p.x + 22, y: p.y + 9, width: p.width - 44, height: p.height - 9 }
}

function endRun(s, mode, reason = '') {
  s.mode = mode
  s.reason = reason
  s.warning = null
  setSytReaction(s, mode === 'won' ? 'react' : 'laugh', SYT_LINES[mode], 20)
}

function hurt(s) {
  if (s.player.hurt > 0) return
  s.player.health = Math.max(0, s.player.health - 1)
  s.player.hurt = SYT.immunity
  s.gap = Math.max(SYT.captureGap + 10, s.gap - 42)
  setSytReaction(s, 'laugh', SYT_LINES.hit)
  if (!s.player.health) endRun(s, 'lost', 'La persecución agotó tu vida.')
}

const patterns = [
  ['obstacle', 'platform', 'high', 'obstacle', 'low'],
  ['high', 'obstacle', 'minion', 'low', 'platform'],
  ['minion', 'low', 'obstacle', 'high', 'minion', 'platform'],
  ['low', 'minion', 'high', 'obstacle', 'low', 'platform', 'minion'],
]

function prepareWave(s) {
  const pattern = patterns[s.phase]
  const type = pattern[s.sequence % pattern.length]
  const action = type === 'high' ? 'AGÁCHATE' : type === 'platform' ? 'SALTO OPCIONAL' : 'SALTA'
  s.warning = { type, action, remaining: INTENSITY[s.phase].warning }
  s.sequence++
  setSytReaction(s, type === 'minion' || type === 'obstacle' ? 'point' : 'windup', SYT_LINES[type], 3)
}

function releaseWave(s) {
  const { type } = s.warning
  const id = () => s.nextId++
  const x = s.player.x + 770
  if (type === 'high' || type === 'low') {
    const count = s.phase >= 2 ? 2 : 1
    for (let i = 0; i < count; i++) {
      const startY = SYT.floor - SYT_CHIP.handHeight - SYT_CHIP.height / 2
      s.hazards.push({ id: id(), type: 'chip', action: type, x: s.boss.x + SYT_CHIP.handX,
        y: startY, startY, age: 0,
        targetY: SYT.floor - (type === 'high' ? SYT_CHIP.highClearance : SYT_CHIP.lowClearance),
        width: SYT_CHIP.width, height: SYT_CHIP.height,
        vx: SYT.sprintSpeed + SYT_CHIP.relativeSpeed, delay: i * SYT_CHIP.pairDelay })
    }
    setSytReaction(s, 'throw', SYT_LINES[type], 1.4)
  } else if (type === 'platform') {
    s.platforms.push({ id: id(), x, y: SYT.floor - 72, width: 170, height: 72 })
    s.pickups.push({ id: id(), x: x + 70, y: SYT.floor - 170, width: 32, height: 40 })
    setSytReaction(s, 'jump', SYT_LINES.platform)
  } else {
    const minion = type === 'minion'
    const art = minion ? 'minion' : ['keyboard', 'router', 'mouse', 'server'][s.sequence % 4]
    const height = minion ? 106 : 66
    s.hazards.push({ id: id(), type, art, x, y: SYT.floor - height, width: minion ? 64 : 68,
      height, vx: minion ? -38 - s.phase * 6 : 0, delay: 0 })
  }
  s.warning = null
  s.nextWave = s.elapsed + INTENSITY[s.phase].interval
}

function movePlayer(s, keys, dt) {
  const p = s.player
  const feet = p.y + p.height
  p.crouched = !!keys.down && p.grounded
  p.height = p.crouched ? SYT.crouchHeight : SYT.playerHeight
  p.y = feet - p.height
  if (keys.jumpQueued && p.grounded && !p.crouched) {
    p.vy = -SYT.jump
    p.grounded = false
  }
  keys.jumpQueued = false
  p.speed = keys.left ? SYT.brakeSpeed : p.crouched ? SYT.crouchSpeed : keys.right ? SYT.sprintSpeed : SYT.speed
  if (p.hurt > 1.2) p.speed *= 0.78
  const oldFeet = p.y + p.height
  p.x += p.speed * dt
  p.vy += SYT.gravity * dt
  p.y += p.vy * dt
  p.grounded = false
  // One-way desk platforms: land on the nearest crossed surface, never snap upward.
  const surfaces = s.platforms.filter(q => p.x + p.width - 22 > q.x && p.x + 22 < q.x + q.width)
    .map(q => q.y).concat(SYT.floor).sort((a, b) => a - b)
  for (const y of surfaces) {
    if (p.vy >= 0 && oldFeet <= y + 1 && p.y + p.height >= y) {
      p.y = y - p.height; p.vy = 0; p.grounded = true
      break
    }
  }
  p.runClock += dt
  p.hurt = Math.max(0, p.hurt - dt)
  s.gap = clamp(s.gap + (p.speed - (SYT.speed - 9)) * dt, 0, SYT.maxGap)
  if (s.gap <= SYT.captureGap) endRun(s, 'lost', 'La Mujer SyT te alcanzó. Frena solo para ajustar una esquiva.')
  return oldFeet
}

function resolveHazards(s, oldFeet, dt) {
  const p = s.player
  for (const h of s.hazards) {
    if (h.delay > 0) {
      h.delay -= dt
      // Each chip leaves the moving hand, including delayed casts in a pair.
      if (h.delay <= 0 && h.type === 'chip') {
        h.x = s.boss.x + SYT_CHIP.handX
        setSytReaction(s, 'throw', SYT_LINES[h.action], 1)
      }
      continue
    }
    if (h.type === 'chip' && h.targetY !== undefined) {
      h.age += dt
      const remaining = Math.max(0, 1 - h.age / SYT_CHIP.settleTime)
      h.y = h.targetY + (h.startY - h.targetY) * remaining * remaining
    }
    h.x += h.vx * dt
    if (h.done) continue
    const body = playerBody(p)
    if (intersects(body, h)) {
      if (h.type === 'minion' && p.vy > 0 && oldFeet <= h.y + 14) {
        h.done = true; p.vy = -SYT.jump * 0.56; p.grounded = false; s.stomped++
        setSytReaction(s, 'react', '¡Ese técnico acababa de entrar a trabajar!')
      } else { h.done = true; hurt(s) }
    } else if (h.type === 'chip' ? h.x > p.x + p.width : h.x + h.width < p.x) {
      h.done = true; s.dodged++
      if (!s.warning && !p.hurt) setSytReaction(s, 'react', SYT_LINES.dodge, 1.8)
    }
    if (s.mode !== 'active') break
  }
  s.hazards = s.hazards.filter(h => !h.done && h.x > s.camera - 300 && h.x < s.camera + 1400)
  for (const item of s.pickups) {
    if (intersects(playerBody(p), item)) {
      item.done = true; s.collected++
      p.health = Math.min(SYT.health, p.health + 1)
      s.gap = Math.min(SYT.maxGap, s.gap + 30)
    }
  }
  s.pickups = s.pickups.filter(q => !q.done && q.x > s.camera - 200)
  s.platforms = s.platforms.filter(q => q.x + q.width > s.camera - 200)
}

function stepFixed(s, keys, dt) {
  s.elapsed = Math.min(SYT.duration, s.elapsed + dt)
  s.remaining = Math.max(0, SYT.duration - s.elapsed)
  s.phase = Math.min(3, Math.floor(s.elapsed / 30))
  if (keys.deathQueued) { keys.deathQueued = false; s.player.health = 0; endRun(s, 'lost', 'Reintenta desde el inicio del Nivel 3.'); return }
  const oldFeet = movePlayer(s, keys, dt)
  if (s.mode !== 'active') return
  s.camera = Math.max(0, s.player.x - 380)
  stepSyt(s, dt)
  resolveHazards(s, oldFeet, dt)
  if (s.mode !== 'active') return
  if (!s.remaining) { endRun(s, 'lost', 'Se acabaron los dos minutos.'); return }
  if (s.player.x >= SYT.finish) { endRun(s, 'won'); return }
  if (s.warning) {
    s.warning.remaining -= dt
    if (s.warning.remaining <= 0) releaseWave(s)
  } else if (s.elapsed >= s.nextWave && s.hazards.length === 0 && s.platforms.every(q => q.x + q.width < s.player.x)
    && s.player.x < SYT.finish - 1200) {
    // No contradictory jump/duck combinations; every wave has its own reaction window.
    prepareWave(s)
  }
}

export function stepSytRun(s, keys, seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return
  // Substeps prevent tunneling without slowing the 120-second clock on dropped frames.
  let remaining = seconds
  while (remaining > 0 && s.mode === 'active') {
    const dt = Math.min(remaining, 1 / 120)
    stepFixed(s, keys, dt)
    remaining -= dt
  }
}
