import test from 'node:test'
import assert from 'node:assert/strict'
import { createTowerBattle, stepTower } from '../src/game/scenes/tower/towerSimulation.js'
import { HERO, TOWER } from '../src/game/scenes/tower/towerConstants.js'
import { PLAYER } from '../src/game/characters/mario/marioConstants.js'
import { UTILITY } from '../src/game/projectiles/projectileTypes.js'
import { TRUMP } from '../src/game/characters/trump/trumpConstants.js'
import { getTrumpFrame } from '../src/game/characters/trump/trumpAnimation.js'

const active = () => Object.assign(createTowerBattle(), { mode: 'active', attackTimer: 100 })
const advance = (s, seconds, keys = {}) => { for (let t = 0; t < seconds; t += 1 / 60) stepTower(s, keys, 1 / 60) }
const shot = (s, changes = {}) => ({ id: 1, x: s.player.x, y: s.player.y + 8, width: 42, height: 26, vx: 0, vy: 0, damage: 1, friendly: false, ...changes })

test('same hero size across chapters; office starts with three sodas', () => {
  assert.equal(HERO.height, PLAYER.height)
  assert.equal(HERO.width, PLAYER.width)
  assert.equal(UTILITY.maxCharges, 3)
})
test('intro and final screens freeze simulation', () => {
  const s = createTowerBattle(), copy = structuredClone(s)
  advance(s, 2, { right: true, throwQueued: true })
  assert.deepEqual(s, copy)
})
test('contracts hit standing player but pass over crouching player', () => {
  const standing = active(), crouching = active()
  standing.projectiles = [shot(standing)]
  crouching.projectiles = [shot(crouching)]
  stepTower(standing, {}, 1 / 60)
  stepTower(crouching, { down: true }, 1 / 60)
  assert.equal(standing.player.health, 4)
  assert.equal(crouching.player.health, 5)
})
test('shield blocks hits and releasing it ends protection', () => {
  const s = active()
  s.projectiles = [shot(s)]
  stepTower(s, { shieldQueued: true, shieldHeld: true }, 1 / 60)
  assert.equal(s.player.health, 5)
  assert.ok(s.player.shieldCooldown > 0)
  s.projectiles = [shot(s)]
  stepTower(s, {}, 1 / 60)
  assert.equal(s.player.health, 4)
})
test('multiple hits in the same frame do not consume all health', () => {
  const s = active()
  s.projectiles = Array.from({ length: 5 }, () => shot(s))
  stepTower(s, {}, 0.1)
  assert.equal(s.player.health, 4)
})
test('jump clears the wall and lands exactly on the floor', () => {
  const s = active()
  stepTower(s, { jumpQueued: true }, 1 / 60)
  advance(s, 0.18)
  assert.ok(s.player.y + s.player.height < TOWER.floor - 62)
  advance(s, 2)
  assert.equal(s.player.y + s.player.height, TOWER.floor)
})
test('soda is consumed once, bottles replace pizzas during utility', () => {
  const s = active()
  stepTower(s, { utilityQueued: true, throwQueued: true }, 1 / 60)
  assert.equal(s.player.charges, HERO.utilityCharges - 1)
  assert.equal(s.player.ammo, HERO.ammo)
  assert.equal(s.projectiles[0].type, 'bottle')
  stepTower(s, { utilityQueued: true }, 1 / 60)
  assert.equal(s.player.charges, HERO.utilityCharges - 1)
})
test('boss phases, defeat and restart state', () => {
  const s = active()
  s.boss.health = TRUMP.health / 2
  stepTower(s, {}, 1 / 60)
  assert.equal(s.phase, 2)
  s.projectiles = [shot(s, { ...s.boss, friendly: true, damage: TRUMP.health / 2 })]
  stepTower(s, {}, 1 / 60)
  assert.equal(s.mode, 'victory')
  advance(s, TRUMP.defeatDuration + 0.1)
  assert.equal(s.mode, 'won')
  assert.equal(createTowerBattle().boss.health, TRUMP.health)
})

test('anger interrupts the telegraph once and resumes with a fresh warning', () => {
  const s = active()
  s.boss.pose = 'windup'; s.attack = TRUMP.attacks[1]; s.targets = [100]; s.boss.health = 60
  stepTower(s, {}, 1 / 60)
  assert.equal(s.boss.pose, 'angry')
  assert.equal(s.attack, null)
  assert.deepEqual(s.targets, [])
  advance(s, 1)
  assert.equal(s.boss.pose, 'angry')
  assert.equal(s.projectiles.length, 0)
  advance(s, 0.85)
  assert.equal(s.boss.pose, 'windup')
  assert.equal(s.attack.type, 'wall', 'phase two immediately challenges permanent crouching')
  assert.ok(s.attackTimer > 0.8)
  assert.equal(s.phaseAnnounced, true)
})

test('each power releases on the cast frame and keeps its follow-through', () => {
  for (const attack of TRUMP.attacks) {
    const s = active()
    s.boss.pose = 'windup'; s.attack = attack; s.attackTimer = 0.1; s.targets = [600]
    advance(s, 0.05)
    assert.equal(s.projectiles.length, 0)
    assert.equal(getTrumpFrame(s.boss.pose, s.boss.poseTime), 0)
    advance(s, 0.1)
    assert.equal(s.projectiles[0].type, attack.type)
    assert.equal(getTrumpFrame(s.boss.pose, s.boss.poseTime), 1)
    advance(s, 0.3)
    assert.equal(getTrumpFrame(s.boss.pose, s.boss.poseTime), 2)
    advance(s, attack.type === 'contract' ? 1.5 : 0.3)
    assert.equal(s.boss.pose, 'recover')
  }
})

test('three anger and defeat frames; defeat holds its last frame before results', () => {
  assert.deepEqual([0, 0.61, 1.21].map(t => getTrumpFrame('angry', t)), [3, 4, 5])
  assert.deepEqual([0, 0.66, 1.31, 3].map(t => getTrumpFrame('defeated', t)), [6, 7, 8, 8])
  const s = active()
  s.boss.health = 0
  stepTower(s, {}, 1 / 60)
  advance(s, 2.1)
  assert.equal(s.mode, 'victory')
  assert.equal(getTrumpFrame(s.boss.pose, s.boss.poseTime), 8)
  advance(s, 1)
  assert.equal(s.mode, 'won')
  const last = structuredClone(s)
  advance(s, 1)
  assert.deepEqual(s, last)
})
test('death clears hazards; invalid delta cannot corrupt state', () => {
  const s = active()
  const copy = structuredClone(s)
  stepTower(s, {}, NaN)
  assert.deepEqual(s, copy)
  s.projectiles = [shot(s)]
  stepTower(s, { deathQueued: true, utilityQueued: true }, 1 / 60)
  assert.equal(s.mode, 'dying')
  assert.equal(s.player.charges, HERO.utilityCharges)
  assert.equal(s.projectiles.length, 0)
  advance(s, 2.1)
  assert.equal(s.mode, 'lost')
})

test('victory clears damage flicker and lets an airborne Mario land', () => {
  const s = active()
  s.player.hurt = 1; s.player.y -= 60; s.player.vy = -50; s.boss.health = 0
  stepTower(s, {}, 1 / 60)
  assert.equal(s.mode, 'victory')
  assert.equal(s.player.hurt, 0)
  advance(s, 1)
  assert.equal(s.player.y + s.player.height, TOWER.floor)
  assert.equal(s.player.vy, 0)
})
