import test from 'node:test'
import assert from 'node:assert/strict'
import { createTowerBattle, stepTower } from '../src/game/scenes/tower/towerSimulation.js'
import { getGoldTargets, getActiveGoldWarnings } from '../src/game/scenes/tower/towerAttacks.js'
import { TRUMP } from '../src/game/characters/trump/trumpConstants.js'
import { HERO } from '../src/game/scenes/tower/towerConstants.js'
import { createBossAIState, updateBossAI, stunBoss, BOSS_STATES } from '../src/hooks/useBossAI.js'
import { DOCUMENT_ATTACK } from '../src/game/characters/corruptDocument/corruptDocumentConstants.js'

const advance = (s, seconds) => { for (let t = 0; t < seconds; t += 1 / 120) stepTower(s, { down: true }, 1 / 120) }
function tower(phase = 1) {
  const s = createTowerBattle()
  Object.assign(s, { mode: 'active', phase, phaseAnnounced: phase === 2, attackTimer: 0.1, attack: TRUMP.attacks[0] })
  s.boss.health = phase === 2 ? TRUMP.health / 2 : TRUMP.health; s.boss.pose = 'windup'
  return s
}

test('contracts release one by one from the hand; phase two adds a fourth cast', () => {
  for (const phase of [1, 2]) {
    const s = tower(phase)
    advance(s, 0.08)
    assert.equal(s.nextId, 0)
    advance(s, 0.04)
    assert.equal(s.nextId, 1)
    assert.ok(s.projectiles[0].x < s.boss.x)
    assert.ok(s.projectiles[0].x > s.boss.x - 100)
    advance(s, 0.4)
    assert.equal(s.nextId, 1)
    advance(s, phase === 1 ? 1.5 : 2.1)
    assert.equal(s.nextId, TRUMP.volleySize[phase - 1])
    assert.equal(s.boss.pose, 'recover')
    assert.equal(s.player.health, HERO.health, 'the full volley is duckable')
  }
})

test('gold warnings survive recovery until the matching bars finish falling', () => {
  const s = tower()
  s.attack = TRUMP.attacks[1]; s.targets = getGoldTargets(s.player.x, 1)
  const targets = [...s.targets]
  advance(s, 0.8)
  assert.equal(s.boss.pose, 'recover')
  assert.deepEqual(getActiveGoldWarnings(s), targets)
  advance(s, 0.6)
  assert.deepEqual(getActiveGoldWarnings(s), [])
})

test('enraged gold pattern leaves corridors wider than Mario', () => {
  const lanes = getGoldTargets(300, 2)
  assert.equal(lanes.length, 4)
  for (let i = 1; i < lanes.length; i++) assert.ok(lanes[i] - lanes[i - 1] - 46 > HERO.width)
  assert.ok(TRUMP.recovery[1] < TRUMP.recovery[0])
  assert.ok(TRUMP.windupMultiplier[1] < TRUMP.windupMultiplier[0])
})

test('death cancels the remainder of a volley', () => {
  const s = tower(2)
  advance(s, 0.2)
  assert.ok(s.volleyRemaining > 0)
  stepTower(s, { deathQueued: true }, 1 / 120)
  const count = s.nextId
  advance(s, 1)
  assert.equal(s.volleyRemaining, 0)
  assert.equal(s.nextId, count)
  assert.deepEqual(s.projectiles, [])
})

function documentBoss() {
  return { ...createBossAIState(), aiState: BOSS_STATES.THROW_ATTACK, mode: BOSS_STATES.THROW_ATTACK,
    x: 600, y: 100, width: 350, height: 224, vx: 0, vy: 0, onGround: true, groundY: 100, facing: 1 }
}
const player = { x: 0, y: 100, width: 96, height: 172 }

test('document holds its facing and releases exactly once after preparation', () => {
  const boss = documentBoss()
  let shots = 0
  for (let t = 0; t < DOCUMENT_ATTACK.duration; t += 1 / 120) {
    updateBossAI(boss, player, [], 1 / 120)
    if (t + 1 / 120 < DOCUMENT_ATTACK.prepareTime) assert.equal(boss.pendingShot, false)
    if (boss.pendingShot) { shots++; assert.equal(boss.facing, 1) }
  }
  assert.equal(shots, 1)
  assert.equal(boss.isThrowing, false)
})

test('stunning the document cancels a prepared shot and throwing flags immediately', () => {
  const boss = documentBoss()
  boss.attackTimer = 0.5; boss.isThrowing = true; boss.pendingShot = true
  boss.thrownEnemyProjectiles = [{ id: 'uncommitted-shot' }]
  stunBoss(boss)
  assert.equal(boss.pendingShot, false)
  assert.equal(boss.isThrowing, false)
  assert.deepEqual(boss.thrownEnemyProjectiles, [])
  updateBossAI(boss, player, [], 1 / 60)
  assert.equal(boss.pendingShot, false)
  assert.equal(boss.mode, BOSS_STATES.STUNNED)
})
