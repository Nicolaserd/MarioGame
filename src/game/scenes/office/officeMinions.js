import { PLAYER } from '../../characters/mario/marioConstants.js'
import { ENEMY } from '../../characters/corruptDocument/corruptDocumentConstants.js'
import { DOC_MINION } from '../../characters/docMinion/docMinionConstants.js'
import { clamp, intersects } from '../../physics/collision.js'
import { WORLD, floorSurfaceY } from './officeConstants.js'
import { getPlayerHitbox, isEnemyVulnerable } from './officeCombat.js'
import { triggerPlayerHurt } from './officePlayer.js'

export function getDocMinionSpawnCooldown() {
  return (
    DOC_MINION.spawnCooldownMin +
    Math.random() * (DOC_MINION.spawnCooldownMax - DOC_MINION.spawnCooldownMin)
  )
}

export function createInitialDocMinionSystem() {
  return {
    activated: false,
    spawnTimer: getDocMinionSpawnCooldown(),
  }
}

export function createDocMinion(enemy, player) {
  const playerCenterX = player.x + PLAYER.width / 2
  const enemyCenterX = enemy.x + ENEMY.width / 2
  const direction = playerCenterX >= enemyCenterX ? 1 : -1
  const x = clamp(
    enemyCenterX +
      direction * DOC_MINION.spawnBossOffsetX -
      DOC_MINION.width / 2,
    0,
    WORLD.width - DOC_MINION.width,
  )

  return {
    id: crypto.randomUUID?.() ?? `${performance.now()}-${Math.random()}`,
    x,
    y: floorSurfaceY,
    vx: 0,
    direction,
    frameClock: 0,
    emergeTimer: 0,
    active: true,
  }
}

export function getDocMinionHitbox(minion) {
  return {
    x: minion.x + (DOC_MINION.width - DOC_MINION.hitboxWidth) / 2,
    y: minion.y + DOC_MINION.height - DOC_MINION.hitboxHeight,
    width: DOC_MINION.hitboxWidth,
    height: DOC_MINION.hitboxHeight,
  }
}

export function shouldDocMinionsRun(enemy) {
  return (
    isEnemyVulnerable(enemy) &&
    enemy.health > 0 &&
    enemy.health <= ENEMY.health * DOC_MINION.activationHealthRatio
  )
}

export function stepDocMinions(system, minions, enemy, player, deltaTime) {
  const dt = Math.min(deltaTime, 1 / 30)

  if (!shouldDocMinionsRun(enemy)) {
    return []
  }

  system.activated = true
  system.spawnTimer -= dt

  const nextMinions = minions
    .map((minion) => {
      const nextMinion = {
        ...minion,
        frameClock: minion.frameClock + dt,
        emergeTimer: Math.min(
          DOC_MINION.emergeDuration,
          minion.emergeTimer + dt,
        ),
      }
      const emergeProgress = clamp(
        nextMinion.emergeTimer / DOC_MINION.emergeDuration,
        0,
        1,
      )

      nextMinion.y =
        floorSurfaceY -
        DOC_MINION.height * emergeProgress +
        DOC_MINION.groundSink

      if (emergeProgress >= 1) {
        nextMinion.vx = DOC_MINION.speed * nextMinion.direction
        nextMinion.x += nextMinion.vx * dt
      }

      if (
        nextMinion.x + DOC_MINION.width < -80 ||
        nextMinion.x > WORLD.width + 80
      ) {
        nextMinion.active = false
      }

      return nextMinion
    })
    .filter((minion) => minion.active)

  if (
    system.activated &&
    system.spawnTimer <= 0 &&
    nextMinions.length < DOC_MINION.maxAlive
  ) {
    nextMinions.push(createDocMinion(enemy, player))
    system.spawnTimer = getDocMinionSpawnCooldown()
  }

  return nextMinions
}

export function applyDocMinionsToPlayer(player, minions) {
  if (player.dying || player.health <= 0) {
    return minions
  }

  const playerHitbox = getPlayerHitbox(player)

  return minions.filter((minion) => {
    if (!intersects(getDocMinionHitbox(minion), playerHitbox)) {
      return true
    }

    if (!player.invulnerable) {
      player.health = Math.max(0, player.health - DOC_MINION.damage)
      triggerPlayerHurt(player)
    }

    return false
  })
}
