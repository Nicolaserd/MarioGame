import test from 'node:test'
import assert from 'node:assert/strict'
import { createTowerBattle, stepTower } from '../src/game/scenes/tower/towerSimulation.js'
import { TOWER } from '../src/game/scenes/tower/towerConstants.js'
import { TRUMP } from '../src/game/characters/trump/trumpConstants.js'
import { getTrumpDodgeFrame } from '../src/game/characters/trump/trumpAnimation.js'

const advance = (s, seconds) => { for (let t = 0; t < seconds; t += 1 / 120) stepTower(s, {}, 1 / 120) }
function battle(phase = 1) {
  const s = createTowerBattle()
  Object.assign(s, { mode: 'active', phase, phaseAnnounced: phase === 2, attackTimer: 1 })
  Object.assign(s.boss, { pose: 'idle', dodgeCooldown: 0, health: phase === 2 ? 75 : 150 })
  return s
}
function incoming(s, height, changes = {}) {
  return { id: s.nextId++, type: 'bottle', x: s.boss.x - 290, y: TOWER.floor - height,
    width: 20, height: 18, vx: 600, vy: 0, gravity: 0, friendly: true, damage: 4, ...changes }
}

test('a high projectile hits standing Trump but passes above his real crouched hitbox', () => {
  const ducking = battle(), standing = battle()
  standing.boss.dodgeCooldown = 100
  for (const s of [ducking, standing]) s.projectiles.push(incoming(s, 165))
  advance(ducking, 0.25)
  assert.equal(ducking.boss.pose, 'duck')
  assert.equal(ducking.boss.height, TRUMP.dodge.crouchHeight)
  assert.equal(ducking.boss.y + ducking.boss.height, TOWER.floor)
  advance(ducking, 0.6); advance(standing, 0.85)
  assert.equal(ducking.boss.health, 150)
  assert.equal(standing.boss.health, 146)
  assert.ok(ducking.projectiles[0].x > ducking.boss.x + ducking.boss.width)
})

test('a low projectile passes below jumping Trump; he lands before the vulnerable recovery', () => {
  const s = battle()
  s.projectiles.push(incoming(s, 70))
  advance(s, 0.35)
  assert.equal(s.boss.pose, 'jump')
  assert.ok(s.boss.y + s.boss.height < TOWER.floor - 70)
  advance(s, 0.7)
  assert.equal(s.boss.health, 150)
  assert.equal(s.boss.pose, 'dodge-recover')
  assert.equal(s.boss.y + s.boss.height, TOWER.floor)
  assert.equal(s.boss.vy, 0)
})

test('dodging grants no immunity: low attacks can punish a crouch', () => {
  const s = battle()
  s.projectiles.push(incoming(s, 165))
  advance(s, 0.25)
  s.projectiles.push(incoming(s, 50, { x: s.boss.x + 10 }))
  advance(s, 0.02)
  assert.equal(s.boss.pose, 'duck')
  assert.equal(s.boss.health, 146)
})

test('casts, committed windups and recovery cannot be interrupted to dodge an incoming hit', () => {
  for (const pose of ['attack', 'windup', 'recover', 'dodge-recover']) {
    const s = battle(2)
    Object.assign(s.boss, { pose, dodgeType: pose === 'dodge-recover' ? 'duck' : null })
    if (pose === 'windup') s.boss.poseTime = TRUMP.dodge.windupWindow
    s.attack = pose === 'attack' || pose === 'windup' ? TRUMP.attacks[0] : null
    s.projectiles.push(incoming(s, 165))
    advance(s, 0.55)
    assert.equal(s.boss.health, 71, pose)
    assert.notEqual(s.boss.pose, 'duck')
    assert.notEqual(s.boss.pose, 'jump')
  }
})

test('cooldown leaves a punish window in both phases; phase two recovers its dodge sooner', () => {
  const cooldowns = []
  for (const phase of [1, 2]) {
    const s = battle(phase), health = s.boss.health
    s.projectiles.push(incoming(s, 165))
    advance(s, 1.1)
    cooldowns.push(s.boss.dodgeCooldown)
    s.projectiles.push(incoming(s, 165))
    advance(s, 0.6)
    assert.equal(s.boss.health, health - 4)
    assert.ok(s.boss.dodgeCooldown > 0.5)
  }
  assert.ok(cooldowns[1] < cooldowns[0])
})

test('ordinary opening pizzas trigger visible dodges without preparing boss timers or position', () => {
  for (const down of [false, true]) for (const delay of [0, 0.9, 1.7]) {
    const s = createTowerBattle()
    s.mode = 'active'; s.boss.pose = 'idle' // Same transition as the start button.
    advance(s, delay)
    const poses = new Set()
    for (let i = 0; i < 170; i++) {
      stepTower(s, { down, throwQueued: i === 0 }, 1 / 120)
      poses.add(s.boss.pose)
    }
    assert.ok(poses.has('jump') || poses.has('duck'), `delay ${delay}, crouched ${down}: ${[...poses]}`)
    assert.equal(s.boss.health, TRUMP.health, `delay ${delay}, crouched ${down}`)
  }
})

test('dodging during early preparation clears lanes and restarts the same full attack warning', () => {
  const s = battle()
  s.boss.pose = 'windup'; s.attack = TRUMP.attacks[1]; s.attackIndex = 2
  s.targets = [44, 232, 420]; s.windupDuration = 1.3; s.attackTimer = 1.3
  s.projectiles.push(incoming(s, 165))
  advance(s, 0.2)
  assert.equal(s.boss.pose, 'duck')
  assert.equal(s.attack, null)
  assert.deepEqual(s.targets, [])
  advance(s, 1.85)
  assert.equal(s.boss.pose, 'windup')
  assert.equal(s.attack.type, 'gold')
  assert.ok(s.attackTimer > 1)
  assert.ok(s.projectiles.every(q => q.friendly))
})

test('opening dodge survives normal frame rates and slower rendering', () => {
  for (const dt of [1 / 144, 1 / 60, 1 / 30, 0.1]) {
    const s = createTowerBattle()
    s.mode = 'active'; s.boss.pose = 'idle'
    for (let i = 0; i < Math.ceil(1.5 / dt); i++) stepTower(s, { throwQueued: i === 0 }, dt)
    assert.equal(s.boss.health, TRUMP.health, `frame time ${dt}`)
  }
  for (let offset = 0; offset < 12; offset++) {
    const s = createTowerBattle()
    s.mode = 'active'; s.boss.pose = 'idle'
    const frames = [0.0166, 0.004, 0.054, 0.031, 0.006, 0.02]
    for (let i = 0; i < 85; i++) stepTower(s, { throwQueued: i === 12 + offset }, frames[i % frames.length])
    assert.equal(s.boss.health, TRUMP.health, `jitter offset ${offset}`)
  }
})

test('outgoing, too late and off-height shots do not trigger omniscient dodges', () => {
  for (const changes of [{ vx: -600 }, { x: 780 }, { y: 10 }, { friendly: false }]) {
    const s = battle()
    s.projectiles.push(incoming(s, 165, changes))
    advance(s, 0.02)
    assert.equal(s.boss.pose, 'idle')
  }
})

test('enrage and defeat cancel a midair dodge without teleporting the feet', () => {
  for (const health of [75, 0]) {
    const s = battle()
    s.projectiles.push(incoming(s, 70))
    advance(s, 0.3)
    const feet = s.boss.y + s.boss.height
    s.boss.health = health
    advance(s, 0.01)
    assert.equal(s.boss.dodgeType, null)
    assert.ok(Math.abs(s.boss.y + s.boss.height - feet) < 15)
    assert.equal(s.boss.pose, health ? 'angry' : 'defeated')
    advance(s, 0.9)
    assert.equal(s.boss.y + s.boss.height, TOWER.floor)
    assert.equal(s.boss.vy, 0)
  }
})

test('all six dodge frames follow physics and hold when simulation is frozen', () => {
  assert.deepEqual([0, 0.3, 0.8].map(t => getTrumpDodgeFrame('duck', t, 0, 'duck')), [0, 1, 2])
  assert.equal(getTrumpDodgeFrame('jump', 0.3, -300, 'jump'), 3)
  assert.equal(getTrumpDodgeFrame('jump', 0.5, 40, 'jump'), 4)
  assert.equal(getTrumpDodgeFrame('dodge-recover', 0.1, 0, 'jump'), 5)
  const s = battle()
  s.projectiles.push(incoming(s, 70)); advance(s, 0.3)
  const frozen = structuredClone(s)
  stepTower(s, {}, 0)
  assert.deepEqual(s, frozen)
})

test('real Mario pizzas can be evaded with gravity, their full width and both attack heights', () => {
  for (const phase of [1, 2]) for (const down of [false, true]) {
    const s = battle(phase), health = s.boss.health
    s.player.x = down ? 100 : 350
    s.attackTimer = 2
    const poses = new Set()
    for (let i = 0; i < 180; i++) {
      stepTower(s, { down, throwQueued: i === 0 }, 1 / 120)
      poses.add(s.boss.pose)
    }
    assert.ok(poses.has(down ? 'jump' : 'duck'))
    assert.equal(s.boss.health, health, `phase ${phase}, crouched throw: ${down}`)
  }
})
