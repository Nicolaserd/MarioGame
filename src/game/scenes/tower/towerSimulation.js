import { TRUMP } from '../../characters/trump/trumpConstants.js'
import { TOWER_PROJECTILES as TYPES } from '../../projectiles/towerProjectileTypes.js'
import { TOWER, HERO } from './towerConstants.js'
import { clamp, intersects as overlap } from '../../physics/collision.js'

export function createTowerBattle() {
  return {
    mode: 'intro', time: 0, nextId: 0, phase: 1, phaseAnnounced: false,
    player: { x: HERO.x, y: TOWER.floor - HERO.height, width: HERO.width, height: HERO.height,
      vy: 0, facing: 1, health: HERO.health, ammo: HERO.ammo, charges: HERO.utilityCharges,
      regen: 0, hurt: 0, shield: 0, shieldCooldown: 0, utility: 0, shot: 0, moving: false, crouched: false },
    boss: { x: TRUMP.x, y: TOWER.floor - TRUMP.height, width: TRUMP.width,
      height: TRUMP.height, health: TRUMP.health, pose: 'talk', poseTime: 0, hurt: 0 },
    projectiles: [], attackIndex: 0, attack: null, attackTimer: 1.6, targets: [],
    speech: TRUMP.intro, speechTimer: 0, endTimer: 0,
  }
}

function spawn(state, type, x, y, vx, vy, friendly = false) {
  state.projectiles.push({ ...TYPES[type], id: state.nextId++, type, x, y, vx, vy, friendly })
}
function fireAttack(s) {
  const speed = s.phase === 2 ? 1.25 : 1
  if (s.attack.type === 'contract') {
    for (let i = 0; i < s.phase + 1; i++) spawn(s, 'contract', TRUMP.x + i * 120, TOWER.floor - HERO.height + 32, -TYPES.contract.speed * speed, 0)
  } else if (s.attack.type === 'gold') {
    for (const x of s.targets) spawn(s, 'gold', x, -35, 0, TYPES.gold.speed * speed)
  } else {
    spawn(s, 'wall', TRUMP.x, TOWER.floor - TYPES.wall.height, -TYPES.wall.speed * speed, 0)
  }
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
    s.endTimer += dt
    if (s.endTimer >= (s.mode === 'victory' ? TRUMP.defeatDuration : 2)) s.mode = s.mode === 'dying' ? 'lost' : 'won'
    return
  }
  const p = s.player
  for (const timer of ['hurt', 'shield', 'shieldCooldown', 'utility', 'shot']) p[timer] = Math.max(0, p[timer] - dt)
  s.boss.hurt = Math.max(0, s.boss.hurt - dt)
  s.speechTimer = Math.max(0, s.speechTimer - dt)
  if (!s.speechTimer) s.speech = ''
  if (keys.deathQueued) {
    p.health = 0; keys.deathQueued = false; s.mode = 'dying'; s.projectiles = []; s.targets = []; s.attack = null
    s.speech = 'Buen intento. La torre sigue abierta.'
    return
  }
  if (keys.shieldQueued && p.shieldCooldown === 0) { p.shield = HERO.shieldDuration; p.shieldCooldown = HERO.shieldCooldown }
  keys.shieldQueued = false
  if (!keys.shieldHeld) p.shield = 0
  if (keys.utilityQueued && p.charges > 0 && p.utility === 0) { p.utility = HERO.utilityDuration; p.charges--; s.speech = '¿Pizza con cláusulas? ¡Prefiero extra queso!'; s.speechTimer = 3 }
  keys.utilityQueued = false
  const grounded = p.y + p.height >= TOWER.floor
  p.crouched = !!keys.down && grounded
  const direction = Number(!!keys.right) - Number(!!keys.left)
  p.moving = direction !== 0 && !p.crouched && !p.shield
  if (p.moving) { p.facing = direction; p.x = clamp(p.x + direction * HERO.speed * dt, 24, TRUMP.x - p.width - 16) }
  if (keys.jumpQueued && grounded && !p.crouched && !p.shield) p.vy = -HERO.jump
  keys.jumpQueued = false
  p.vy += TOWER.gravity * dt
  p.y = Math.min(TOWER.floor - p.height, p.y + p.vy * dt)
  if (p.y + p.height >= TOWER.floor) p.vy = 0
  p.regen += dt
  if (p.regen >= HERO.regen) { p.ammo = Math.min(HERO.ammo, p.ammo + 1); p.regen = 0 }
  if (keys.throwQueued && p.shot === 0 && !p.shield && (p.utility > 0 || p.ammo > 0)) {
    const type = p.utility > 0 ? 'bottle' : 'pizza'
    spawn(s, type, p.x + p.width / 2, p.y + (p.crouched ? HERO.height - 45 : HERO.handHeight), TYPES[type].speed * p.facing, 0, true)
    if (type === 'pizza') p.ammo--
    p.shot = HERO.throwCooldown
  }
  keys.throwQueued = false
  s.phase = s.boss.health <= TRUMP.health / 2 ? 2 : 1
  if (s.phase === 2 && !s.phaseAnnounced) {
    s.phaseAnnounced = true; s.speech = TRUMP.phase; s.speechTimer = 4
    s.boss.pose = 'angry'; s.boss.poseTime = 0; s.attackTimer = TRUMP.rageDuration
    s.attack = null; s.targets = []
  }
  s.attackTimer -= dt
  if (s.attackTimer <= 0) {
    s.boss.poseTime = 0
    if (s.boss.pose === 'windup') {
      fireAttack(s); s.boss.pose = 'attack'; s.attackTimer = TRUMP.castDuration
    } else if (s.boss.pose === 'attack') {
      s.boss.pose = 'recover'; s.attack = null; s.targets = []; s.attackTimer = s.phase === 2 ? 1.3 : 1.9
    } else {
      s.attack = TRUMP.attacks[s.attackIndex++ % TRUMP.attacks.length]
      s.boss.pose = 'windup'; s.attackTimer = s.attack.windup
      s.targets = [...new Set([p.x, p.x - 160, p.x + 160].map(x => clamp(x, 30, 720)))]
      if (!s.speechTimer) { s.speech = s.attack.line; s.speechTimer = 2.2 }
    }
  }
  const hitbox = p.crouched ? { ...p, y: p.y + p.height - HERO.crouchHeight, height: HERO.crouchHeight } : p
  s.projectiles = s.projectiles.filter(q => {
    q.x += q.vx * dt; q.y += q.vy * dt
    if (q.friendly && overlap(q, s.boss)) { s.boss.health = Math.max(0, s.boss.health - q.damage); s.boss.hurt = 0.15; return false }
    if (!q.friendly && overlap(q, hitbox)) {
      if (!p.hurt && !p.shield && p.health > 0) { p.health--; p.hurt = HERO.immunity }
      return false
    }
    return q.x > -80 && q.x < 1250 && q.y < TOWER.floor + 5
  })
  if (p.health <= 0) { s.mode = 'dying'; s.speech = 'Buen intento. La torre sigue abierta.' }
  else if (s.boss.health <= 0) { s.mode = 'victory'; s.boss.pose = 'defeated'; s.boss.poseTime = 0; s.boss.hurt = 0; s.speech = TRUMP.defeat }
  if (s.mode !== 'active') { s.projectiles = []; s.attack = null; s.targets = [] }
}
