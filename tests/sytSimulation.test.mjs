import test from 'node:test'
import assert from 'node:assert/strict'
import { createSytRun, stepSytRun } from '../src/game/scenes/syt/sytSimulation.js'
import { SYT, formatTime } from '../src/game/scenes/syt/sytConstants.js'
import { PLAYER } from '../src/game/characters/mario/marioConstants.js'
import { SYT_CHIP } from '../src/game/projectiles/sytProjectileTypes.js'

const active = () => Object.assign(createSytRun(), { mode: 'active', nextWave: 999 })
const advance = (s, time, keys = {}) => stepSytRun(s, keys, time)
const hazard = (s, changes = {}) => ({ id: 1, type: 'chip', action: 'high', x: s.player.x + 26,
  y: SYT.floor - SYT_CHIP.highClearance, width: SYT_CHIP.width, height: SYT_CHIP.height, vx: SYT.speed, delay: 0, ...changes })

test('runner preserves Mario metrics and intro/result screens freeze the clock', () => {
  const s = createSytRun()
  assert.equal(s.player.height, PLAYER.height)
  const initial = structuredClone(s)
  advance(s, 10)
  assert.deepEqual(s, initial)
  s.mode = 'won'; advance(s, 10); assert.equal(s.remaining, 120)
})

test('timer starts at 02:00 and timeout at 00:00 takes priority over a late finish', () => {
  const s = active()
  assert.equal(formatTime(s.remaining), '02:00')
  s.elapsed = 119.999; s.player.x = SYT.finish - 0.3
  advance(s, 0.01)
  assert.equal(s.mode, 'lost')
  assert.equal(s.remaining, 0)
  assert.equal(s.elapsed, 120)
  assert.equal(formatTime(s.remaining), '00:00')
})

test('normal uninterrupted route takes approximately 114 seconds and crosses all four phases', () => {
  const s = active()
  advance(s, 29.9); assert.equal(s.phase, 0)
  advance(s, 0.2); assert.equal(s.phase, 1)
  advance(s, 30); assert.equal(s.phase, 2)
  advance(s, 30); assert.equal(s.phase, 3)
  advance(s, 30)
  assert.equal(s.mode, 'won')
  assert.ok(s.elapsed > 110 && s.elapsed < 120)
})

test('high chip hits standing Mario but passes over his actual crouched body', () => {
  const standing = active(); standing.hazards = [hazard(standing)]
  advance(standing, 1 / 60); assert.equal(standing.player.health, 4)
  const crouched = active(); crouched.hazards = [hazard(crouched)]
  advance(crouched, 1 / 60, { down: true }); assert.equal(crouched.player.health, 5)
  assert.equal(crouched.player.y + crouched.player.height, SYT.floor)
})

test('a jump clears a ground hazard and returns to the same floor', () => {
  const s = active()
  advance(s, 0.2, { jumpQueued: true })
  s.hazards = [hazard(s, { type: 'obstacle', y: SYT.floor - 66, width: 68, height: 66, vx: 0 })]
  advance(s, 1)
  assert.equal(s.player.health, 5)
  assert.equal(s.player.y + s.player.height, SYT.floor)
})

test('falling onto a minion bounces; side contact causes damage', () => {
  const s = active()
  s.player.y = SYT.floor - 106 - s.player.height - 2
  s.player.vy = 200; s.player.grounded = false
  s.hazards = [hazard(s, { type: 'minion', y: SYT.floor - 106, height: 106, width: 64, vx: 0 })]
  advance(s, 0.03)
  assert.equal(s.stomped, 1); assert.ok(s.player.vy < 0); assert.equal(s.player.health, 5)
  const side = active()
  side.hazards = [hazard(side, { type: 'minion', y: SYT.floor - 106, height: 106 })]
  advance(side, 0.01); assert.equal(side.player.health, 4)
})

test('hits grant immunity and braking lets SyT catch Mario', () => {
  const s = active(); s.hazards = [hazard(s), hazard(s, { id: 2 })]
  advance(s, 0.02); assert.equal(s.player.health, 4)
  const slow = active(); advance(slow, 4, { left: true })
  assert.equal(slow.mode, 'lost'); assert.match(slow.reason, /alcanzó/)
})

test('one-way platforms catch a descending player, then he falls off the edge', () => {
  const s = active()
  s.platforms = [{ id: 1, x: 360, y: SYT.floor - 72, width: 170, height: 72 }]
  s.player.y = SYT.floor - 72 - s.player.height - 8; s.player.vy = 100; s.player.grounded = false
  advance(s, 0.06)
  assert.equal(s.player.y + s.player.height, SYT.floor - 72)
  advance(s, 1)
  assert.equal(s.player.y + s.player.height, SYT.floor)
})

test('USB restores one life, never exceeds max health, and is only collected once', () => {
  const s = active(); s.player.health = 4
  s.pickups = [{ id: 1, x: s.player.x + 24, y: s.player.y + 20, width: 32, height: 40 }]
  advance(s, 0.1); assert.equal(s.player.health, 5); assert.equal(s.collected, 1)
  advance(s, 1); assert.equal(s.collected, 1)
})

test('dropped frames preserve wall-clock time, invalid dt cannot corrupt a run', () => {
  const s = active(); advance(s, 2.5)
  assert.ok(Math.abs(s.elapsed - 2.5) < 1e-8)
  assert.ok(Math.abs(s.player.x - SYT.start - SYT.speed * 2.5) < 1e-7)
  const snapshot = structuredClone(s)
  for (const dt of [NaN, Infinity, -1]) advance(s, dt)
  assert.deepEqual(s, snapshot)
})

test('complete generated route is beatable with reactive jump/duck inputs at common frame rates', () => {
  for (const fps of [30, 60, 120]) {
    const s = Object.assign(createSytRun(), { mode: 'active' })
    const phases = new Set()
    for (let frame = 0; frame < fps * 121 && s.mode === 'active'; frame++) {
      const keys = {}
      for (const h of s.hazards) {
        if (h.action === 'high') keys.down = true
        else {
          const until = h.type === 'chip'
            ? (s.player.x + 22 - h.x - h.width) / (h.vx - s.player.speed) + Math.max(0, h.delay)
            : (h.x - s.player.x - s.player.width + 22) / (s.player.speed - h.vx)
          if (until < 0.22 && until > -0.12 && s.player.grounded) keys.jumpQueued = true
        }
      }
      stepSytRun(s, keys, 1 / fps)
      phases.add(s.phase)
    }
    assert.equal(s.mode, 'won', `${fps} fps: ${s.reason}; health ${s.player.health}`)
    assert.equal(phases.size, 4)
    assert.equal(s.player.health, 5, `${fps} fps route must have a damage-free solution`)
    assert.ok(s.dodged + s.stomped >= 15)
  }
})

test('paired chips leave the current hand and settle into a readable lane before reaching Mario', () => {
  const s = active()
  s.elapsed = 61
  s.warning = { type: 'low', remaining: 0.001 }
  advance(s, 1 / 120)
  const first = s.hazards[0]
  const second = s.hazards[1]
  assert.equal(first.x, s.boss.x + SYT_CHIP.handX)
  assert.equal(first.y + first.height / 2, SYT.floor - SYT_CHIP.handHeight)
  while (second.delay > 0) advance(s, 1 / 120)
  assert.equal(second.x, s.boss.x + SYT_CHIP.handX)
  assert.equal(second.age, 0)
  advance(s, SYT_CHIP.settleTime - first.age + 1 / 120)
  assert.equal(first.y, SYT.floor - SYT_CHIP.lowClearance)
  assert.ok(first.x + first.width < s.player.x)
})
