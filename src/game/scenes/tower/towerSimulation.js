import { TRUMP } from '../../characters/trump/trumpConstants.js'
import { TOWER_PROJECTILES as TYPES } from '../../projectiles/towerProjectileTypes.js'
import { TOWER, HERO } from './towerConstants.js'
import { clamp, intersects as overlap } from '../../physics/collision.js'
import { getMarioLaunchOrigin } from '../../characters/mario/marioCombat.js'
import { THROW, UTILITY } from '../../projectiles/projectileTypes.js'
import { updateTowerAttacks } from './towerAttacks.js'
import { cancelTrumpDodge, settleTrump } from '../../characters/trump/trumpDefense.js'

export function createTowerBattle() {
  return {
    mode: 'intro', time: 0, nextId: 0, phase: 1, phaseAnnounced: false,
    player: { x: HERO.x, y: TOWER.floor - HERO.height, width: HERO.width, height: HERO.height,
      vx: 0, vy: 0, facing: 1, health: HERO.health, ammo: HERO.ammo, charges: HERO.utilityCharges,
      regen: 0, hurt: 0, shield: 0, shieldCooldown: 0, utility: 0, shot: 0, throwTimer: 0, runClock: 0, idleClock: 0, moving: false, crouched: false },
    boss: { x: TRUMP.x, y: TOWER.floor - TRUMP.height, width: TRUMP.width,
      height: TRUMP.height, health: TRUMP.health, pose: 'talk', poseTime: 0, hurt: 0,
      vy: 0, dodgeType: null, dodgeTime: 0, dodgeCooldown: 0 },
    projectiles: [], attackIndex: 0, attack: null, attackTimer: 1.6, targets: [], volleyRemaining: 0, windupDuration: 0,
    speech: TRUMP.intro, speechTimer: 0, endTimer: 0,
  }
}

function spawn(state, type, x, y, vx, vy, friendly = false) {
  state.projectiles.push({ ...TYPES[type], id: state.nextId++, type, x, y, vx, vy, friendly })
}

// Fixed small steps keep projectile collisions reliable across slow frames.
export function stepTower(s, keys, elapsed) {
  if (!Number.isFinite(elapsed) || elapsed <= 0) return s
  const total = Math.min(Math.max(elapsed, 0), 0.1)
  const steps = Math.max(1, Math.ceil(total / (1 / 120)))
  for (let i = 0; i < steps; i++) step(s, keys, total / steps)
  return s
}

function step(s, keys, dt) {
  if (s.mode === 'intro' || s.mode === 'won' || s.mode === 'lost') return
  s.time += dt
  s.boss.poseTime += dt
  if (s.mode === 'dying' || s.mode === 'victory') {
    settleTrump(s.boss, TOWER.floor, TOWER.gravity, dt)
    if (s.mode === 'victory') {
      const p = s.player
      p.vy += TOWER.gravity * dt
      p.y = Math.min(TOWER.floor - p.height, p.y + p.vy * dt)
      if (p.y + p.height >= TOWER.floor) p.vy = 0
    }
    s.endTimer += dt
    if (s.endTimer >= (s.mode === 'victory' ? TRUMP.defeatDuration : 2)) s.mode = s.mode === 'dying' ? 'lost' : 'won'
    return
  }
  const p = s.player
  for (const timer of ['hurt', 'shield', 'shieldCooldown', 'utility', 'shot', 'throwTimer']) p[timer] = Math.max(0, p[timer] - dt)
  s.boss.hurt = Math.max(0, s.boss.hurt - dt)
  s.speechTimer = Math.max(0, s.speechTimer - dt)
  if (!s.speechTimer) s.speech = ''
  if (keys.deathQueued) {
    cancelTrumpDodge(s.boss); s.boss.pose = 'idle'; s.boss.poseTime = 0
    p.health = 0; keys.deathQueued = false; s.mode = 'dying'; s.projectiles = []; s.targets = []; s.attack = null; s.volleyRemaining = 0
    s.speech = 'Buen intento. La torre sigue abierta.'
    return
  }
  if (keys.shieldQueued && p.shieldCooldown === 0) { p.shield = HERO.shieldDuration; p.shieldCooldown = HERO.shieldCooldown }
  keys.shieldQueued = false
  if (!keys.shieldHeld) p.shield = 0
  if (keys.utilityQueued && p.charges > 0 && p.utility === 0) { p.utility = HERO.utilityDuration; p.charges--; s.speech = '¿Pizza con cláusulas? ¡Prefiero extra queso!'; s.speechTimer = 3 }
  keys.utilityQueued = false
  const grounded = p.y + p.height >= TOWER.floor
  p.crouched = !!keys.down && grounded && !p.shield
  const direction = Number(!!keys.right) - Number(!!keys.left)
  const movementLocked = p.crouched || p.shield || (grounded && p.throwTimer > 0)
  if (movementLocked) p.vx = 0
  else if (direction) { p.facing = direction; p.vx = clamp(p.vx + direction * HERO.acceleration * dt, -HERO.speed, HERO.speed) }
  else p.vx = Math.sign(p.vx) * Math.max(0, Math.abs(p.vx) - HERO.friction * dt)
  const previousX = p.x
  p.x = clamp(p.x + p.vx * dt, 24, TRUMP.x - p.width - 48)
  if (p.x === previousX) p.vx = 0
  p.moving = Math.abs(p.vx) > HERO.runThreshold
  p.runClock = p.moving && grounded ? p.runClock + dt : 0
  p.idleClock = p.moving ? 0 : p.idleClock + dt
  if (keys.jumpQueued && grounded && !p.crouched && !p.shield) p.vy = -HERO.jump
  keys.jumpQueued = false
  p.vy += TOWER.gravity * dt
  p.y = Math.min(TOWER.floor - p.height, p.y + p.vy * dt)
  if (p.y + p.height >= TOWER.floor) p.vy = 0
  p.regen += dt
  if (p.regen >= HERO.regen) { p.ammo = Math.min(HERO.ammo, p.ammo + 1); p.regen = 0 }
  if (keys.throwQueued && p.shot === 0 && !p.shield && (p.utility > 0 || p.ammo > 0)) {
    const type = p.utility > 0 ? 'bottle' : 'pizza'
    const origin = getMarioLaunchOrigin(p, TYPES[type])
    spawn(s, type, origin.x, origin.y, TYPES[type].speed * p.facing, TYPES[type].launchVy, true)
    if (type === 'pizza') p.ammo--
    p.shot = type === 'bottle' ? UTILITY.bottleCooldown : HERO.throwCooldown
    p.throwTimer = THROW.duration
  }
  keys.throwQueued = false
  updateTowerAttacks(s, dt)
  const hitbox = p.crouched ? { ...p, y: p.y + p.height - HERO.crouchHeight, height: HERO.crouchHeight } : p
  s.projectiles = s.projectiles.filter(q => {
    q.x += q.vx * dt; q.y += q.vy * dt
    if (q.friendly) q.vy += (q.gravity ?? 0) * dt
    const qHitbox = q.hitboxWidth ? { x: q.x + (q.width - q.hitboxWidth) / 2, y: q.y + (q.height - q.hitboxHeight) / 2, width: q.hitboxWidth, height: q.hitboxHeight } : q
    if (q.friendly && overlap(qHitbox, s.boss)) { s.boss.health = Math.max(0, s.boss.health - q.damage); s.boss.hurt = 0.15; return false }
    if (q.type === 'pizza' && q.vy >= 0 && qHitbox.y + qHitbox.height >= TOWER.floor) {
      q.bounces = (q.bounces ?? 0) + 1
      if (q.bounces > q.maxBounces) return false
      q.y = TOWER.floor - q.height / 2 - q.hitboxHeight / 2
      q.vy = -q.floorBounceVelocity; q.vx *= 0.72
    }
    if (!q.friendly && overlap(q, hitbox)) {
      if (!p.hurt && !p.shield && p.health > 0) { p.health--; p.hurt = HERO.immunity }
      return false
    }
    return q.x > -80 && q.x < 1250 && q.y < TOWER.floor + 5
  })
  if (p.health <= 0) { s.mode = 'dying'; s.speech = 'Buen intento. La torre sigue abierta.' }
  else if (s.boss.health <= 0) { s.mode = 'victory'; s.boss.pose = 'defeated'; s.boss.poseTime = 0; s.boss.hurt = 0; s.speech = TRUMP.defeat }
  if (s.mode !== 'active') {
    cancelTrumpDodge(s.boss)
    if (s.mode === 'dying') { s.boss.pose = 'idle'; s.boss.poseTime = 0 }
    s.projectiles = []; s.attack = null; s.targets = []; s.volleyRemaining = 0
    p.hurt = 0; p.throwTimer = 0; p.moving = false; p.vx = 0; p.shield = 0; p.utility = 0; p.crouched = false
  }
}
