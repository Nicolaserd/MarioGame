import { TRUMP } from '../../characters/trump/trumpConstants.js'
import { TOWER_PROJECTILES as TYPES } from '../../projectiles/towerProjectileTypes.js'
import { TOWER } from './towerConstants.js'
import { cancelTrumpDodge, updateTrumpDefense } from '../../characters/trump/trumpDefense.js'

export function getGoldTargets(playerX, phase) {
  // Fixed lanes leave 142px corridors: Mario is 96px wide. Targets never track after warning.
  const lanes = [44, 232, 420, 608]
  if (phase === 2) return lanes
  return lanes.sort((a, b) => Math.abs(a - playerX) - Math.abs(b - playerX)).slice(0, 3).sort((a, b) => a - b)
}

function release(s) {
  const type = s.attack.type
  const speed = TRUMP.speedMultiplier[s.phase - 1]
  const emit = (x, y, vx, vy) => s.projectiles.push({ ...TYPES[type], id: s.nextId++, type, x, y, vx, vy, friendly: false })
  if (type === 'contract') {
    // Every sheet exits the extended hand, with its own release frame.
    emit(s.boss.x - 53 - TYPES.contract.width / 2, TOWER.floor - 166, -TYPES.contract.speed * speed, 0)
  } else if (type === 'gold') {
    for (const x of s.targets) emit(x, -TYPES.gold.height, 0, TYPES.gold.speed * speed)
  } else {
    emit(s.boss.x - 53, TOWER.floor - TYPES.wall.height, -TYPES.wall.speed * speed, 0)
  }
  s.boss.pose = 'attack'; s.boss.poseTime = 0; s.attackTimer = TRUMP.castDuration
}

export function updateTowerAttacks(s, dt) {
  s.phase = s.boss.health <= TRUMP.health / 2 ? 2 : 1
  if (s.phase === 2 && !s.phaseAnnounced) {
    cancelTrumpDodge(s.boss)
    s.phaseAnnounced = true; s.speech = TRUMP.phase; s.speechTimer = 4
    s.boss.pose = 'angry'; s.boss.poseTime = 0; s.attackTimer = TRUMP.rageDuration
    s.attack = null; s.targets = []; s.volleyRemaining = 0; s.attackIndex = 0
    s.projectiles = s.projectiles.filter(q => q.friendly)
  }
  if (updateTrumpDefense(s, TOWER.floor, TOWER.gravity, dt)) return
  s.attackTimer -= dt
  if (s.attackTimer > 0) return
  if (s.boss.pose === 'windup') {
    s.volleyRemaining = s.attack.type === 'contract' ? TRUMP.volleySize[s.phase - 1] - 1 : 0
    release(s)
  } else if (s.boss.pose === 'attack' && s.volleyRemaining > 0) {
    s.volleyRemaining--; release(s)
  } else if (s.boss.pose === 'attack') {
    s.boss.pose = 'recover'; s.boss.poseTime = 0; s.attack = null; s.targets = []
    s.attackTimer = TRUMP.recovery[s.phase - 1]
  } else if (s.boss.pose === 'recover') {
    s.boss.pose = 'idle'; s.boss.poseTime = 0
    s.attackTimer = TRUMP.guardDuration[s.phase - 1]
  } else {
    const pattern = TRUMP.patterns[s.phase - 1]
    s.attack = TRUMP.attacks[pattern[s.attackIndex++ % pattern.length]]
    s.boss.pose = 'windup'; s.boss.poseTime = 0
    s.windupDuration = s.attack.windup * TRUMP.windupMultiplier[s.phase - 1]
    s.attackTimer = s.windupDuration
    s.targets = s.attack.type === 'gold' ? getGoldTargets(s.player.x, s.phase) : []
    s.speech = s.attack.line; s.speechTimer = s.windupDuration + TRUMP.castDuration
  }
}

export function getActiveGoldWarnings(s) {
  const upcoming = s.attack?.type === 'gold' && s.boss.pose === 'windup' ? s.targets : []
  return [...new Set([...upcoming, ...s.projectiles.filter(q => q.type === 'gold' && q.y < TOWER.floor).map(q => q.x)])]
}
