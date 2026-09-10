import test from 'node:test'
import assert from 'node:assert/strict'
import { getMarioLaunchOrigin } from '../src/game/characters/mario/marioCombat.js'
import { PIZZA, BOTTLE, THROW } from '../src/game/projectiles/projectileTypes.js'
import { TOWER_PROJECTILES } from '../src/game/projectiles/towerProjectileTypes.js'
import { HERO } from '../src/game/scenes/tower/towerConstants.js'
import { createTowerBattle, stepTower } from '../src/game/scenes/tower/towerSimulation.js'

test('both chapters use the same projectile scale, speed and gravity', () => {
  for (const [type, source] of [['pizza', PIZZA], ['bottle', BOTTLE]]) {
    for (const key of ['width', 'height', 'hitboxWidth', 'hitboxHeight', 'speed', 'gravity']) {
      assert.equal(TOWER_PROJECTILES[type][key], source[key])
    }
  }
  assert.equal(HERO.throwCooldown, THROW.duration + THROW.cooldown)
  assert.equal(HERO.regen, PIZZA.regenTime)
})

test('launch origins mirror around Mario and share crouched height in both chapters', () => {
  const p = { x: 100, y: 200, facing: 1 }
  for (const projectile of [PIZZA, BOTTLE]) {
    const right = getMarioLaunchOrigin(p, projectile)
    const left = getMarioLaunchOrigin({ ...p, facing: -1 }, projectile)
    assert.equal(right.x - 148, 148 - left.x - projectile.width)
    assert.equal(left.y, right.y)
    const office = getMarioLaunchOrigin({ ...p, crouching: true }, projectile)
    const tower = getMarioLaunchOrigin({ ...p, crouched: true }, projectile)
    assert.deepEqual(office, tower)
    assert.ok(tower.y > right.y)
  }
})

test('crouching and firing preserves the crouch; firing uses an independent pose timer', () => {
  const s = createTowerBattle()
  s.mode = 'active'; s.attackTimer = 100
  stepTower(s, { down: true, throwQueued: true }, 1 / 60)
  assert.equal(s.player.crouched, true)
  assert.ok(s.player.throwTimer > 0)
  assert.ok(s.player.shot > s.player.throwTimer)
  assert.equal(s.projectiles[0].width, PIZZA.width)
  const x = s.player.x
  stepTower(s, { right: true }, 1 / 60)
  assert.equal(s.player.x, x)
})

test('running stops at the arena boundary instead of cycling in place', () => {
  const s = createTowerBattle()
  s.mode = 'active'; s.player.x = 24
  stepTower(s, { left: true }, 1 / 60)
  assert.equal(s.player.moving, false)
  assert.equal(s.player.runClock, 0)
})
