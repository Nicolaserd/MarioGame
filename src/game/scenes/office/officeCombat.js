import { BOSS_STATES, stunBoss } from '../../../hooks/useBossAI.js'
import { bottleIcon, push1, vomitGas } from '../../characters/mario/marioAssets.js'
import { PLAYER, PLAYER_VISUAL, PUSH } from '../../characters/mario/marioConstants.js'
import { enemyBall, enemyStunned } from '../../characters/corruptDocument/corruptDocumentAssets.js'
import { ENEMY } from '../../characters/corruptDocument/corruptDocumentConstants.js'
import { BOTTLE, ENEMY_BALL, GAS, PIZZA } from '../../projectiles/projectileTypes.js'
import { getMarioLaunchOrigin } from '../../characters/mario/marioCombat.js'
import { clamp, intersects } from '../../physics/collision.js'
import { WORLD, floorSurfaceY } from './officeConstants.js'
import { ENEMY_DEATH_FRAMES, getFloorSegmentAtFoot } from './officeLayout.js'
import { getSpriteLayout } from '../../characters/mario/marioLayout.js'
import { triggerPlayerHurt } from './officePlayer.js'

export function createPizza(player) {
  const direction = player.facing < 0 ? -1 : 1
  const origin = getMarioLaunchOrigin(player, PIZZA)

  return {
    id: crypto.randomUUID?.() ?? `${performance.now()}-${Math.random()}`,
    ...origin,
    vx: PIZZA.speed * direction,
    vy: -80,
    damage: PIZZA.damage,
    direction,
    bounces: 0,
    active: true,
  }
}

export function createGas(player) {
  const direction = player.facing < 0 ? -1 : 1
  const x =
    direction > 0
      ? player.x + PLAYER.width / 2 + GAS.mouthOffsetX
      : player.x + PLAYER.width / 2 - GAS.mouthOffsetX - GAS.width

  return {
    id: crypto.randomUUID?.() ?? `${performance.now()}-${Math.random()}`,
    type: 'gas',
    image: vomitGas,
    x,
    y: player.y + GAS.mouthOffsetY,
    vx: GAS.speed * direction,
    vy: 0,
    width: GAS.width,
    height: GAS.height,
    hitboxWidth: GAS.hitboxWidth,
    hitboxHeight: GAS.hitboxHeight,
    damage: GAS.damage,
    direction,
    lifetime: GAS.lifetime,
    active: true,
  }
}

export function createBottle(player) {
  const direction = player.facing < 0 ? -1 : 1
  const origin = getMarioLaunchOrigin(player, BOTTLE)

  return {
    id: crypto.randomUUID?.() ?? `${performance.now()}-${Math.random()}`,
    type: 'bottle',
    image: bottleIcon,
    ...origin,
    vx: BOTTLE.speed * direction,
    vy: -110,
    width: BOTTLE.width,
    height: BOTTLE.height,
    hitboxWidth: BOTTLE.hitboxWidth,
    hitboxHeight: BOTTLE.hitboxHeight,
    damage: BOTTLE.damage,
    direction,
    lifetime: 3,
    active: true,
  }
}

export function createEnemyBall(enemy, player) {
  const playerCenterX = player.x + PLAYER.width / 2
  const playerCenterY = player.y + PLAYER.height * 0.42
  const initialDirection = enemy.facing < 0 ? -1 : 1
  const direction = initialDirection
  const x =
    direction > 0
      ? enemy.x + ENEMY.width / 2 + ENEMY_BALL.launchOffsetX
      : enemy.x + ENEMY.width / 2 - ENEMY_BALL.launchOffsetX - ENEMY_BALL.width
  const y = enemy.y + ENEMY_BALL.launchOffsetY
  const launchCenterX = x + ENEMY_BALL.width / 2
  const launchCenterY = y + ENEMY_BALL.height / 2
  const firstFlightTime = Math.max(
    0.25,
    Math.abs(playerCenterX - launchCenterX) / ENEMY_BALL.speed,
  )
  let targetX =
    playerCenterX + (player.vx ?? 0) * firstFlightTime * ENEMY_BALL.aimLeadFactor
  let targetY =
    playerCenterY + (player.vy ?? 0) * firstFlightTime * ENEMY_BALL.aimLeadFactor

  if (Math.random() < ENEMY_BALL.aimMissChance) {
    targetX += (Math.random() * 2 - 1) * ENEMY_BALL.aimMissOffsetX
    targetY += (Math.random() * 2 - 1) * ENEMY_BALL.aimMissOffsetY
  }

  const dx = targetX - launchCenterX
  const shotDirection = direction
  const vx = ENEMY_BALL.speed * shotDirection
  const flightTime = Math.max(0.25, Math.abs(dx) / ENEMY_BALL.speed)
  const rawVy =
    (targetY - launchCenterY - 0.5 * ENEMY_BALL.gravity * flightTime ** 2) /
    flightTime
  const vy = clamp(rawVy, ENEMY_BALL.minVelocityY, ENEMY_BALL.maxVelocityY)

  return {
    id: crypto.randomUUID?.() ?? `${performance.now()}-${Math.random()}`,
    image: enemyBall,
    x,
    y,
    vx,
    vy,
    width: ENEMY_BALL.width,
    height: ENEMY_BALL.height,
    hitboxWidth: ENEMY_BALL.hitboxWidth,
    hitboxHeight: ENEMY_BALL.hitboxHeight,
    damage: ENEMY_BALL.damage,
    direction: shotDirection,
    bounces: 0,
    lifetime: ENEMY_BALL.lifetime,
    active: true,
  }
}

export function getPizzaHitbox(pizza) {
  return {
    x: pizza.x + (PIZZA.width - PIZZA.hitboxWidth) / 2,
    y: pizza.y + (PIZZA.height - PIZZA.hitboxHeight) / 2,
    width: PIZZA.hitboxWidth,
    height: PIZZA.hitboxHeight,
  }
}

export function getUtilityProjectileHitbox(projectile) {
  return {
    x: projectile.x + (projectile.width - projectile.hitboxWidth) / 2,
    y: projectile.y + (projectile.height - projectile.hitboxHeight) / 2,
    width: projectile.hitboxWidth,
    height: projectile.hitboxHeight,
  }
}

export function getEnemyProjectileHitbox(projectile) {
  return {
    x: projectile.x + (projectile.width - projectile.hitboxWidth) / 2,
    y: projectile.y + (projectile.height - projectile.hitboxHeight) / 2,
    width: projectile.hitboxWidth,
    height: projectile.hitboxHeight,
  }
}

export function getEnemyHitbox(enemy) {
  const hitboxHeight =
    enemy.crouching || enemy.mode === BOSS_STATES.DODGE
      ? ENEMY.hitboxHeight * 0.5
      : ENEMY.hitboxHeight

  return {
    x: enemy.x + (ENEMY.width - ENEMY.hitboxWidth) / 2,
    y: enemy.y + ENEMY.height - hitboxHeight,
    width: ENEMY.hitboxWidth,
    height: hitboxHeight,
  }
}

export function getPlayerHitbox(player) {
  if (player.crouching) return { x: player.x, y: player.y + PLAYER.height - PLAYER.crouchHeight, width: PLAYER.width, height: PLAYER.crouchHeight }
  const layout = getSpriteLayout(player.sprite)
  const footY = player.y + PLAYER.height
  const top = Math.max(
    player.y,
    footY - layout.height + PLAYER_VISUAL.groundSink,
  )

  return {
    x: player.x,
    y: top,
    width: PLAYER.width,
    height: footY - top,
  }
}

export function resolvePlayerEnemyCollision(player, enemy) {
  if (
    !enemy.active ||
    enemy.mode === 'dying' ||
    enemy.mode === 'dead' ||
    enemy.mode === 'celebrating_walk' ||
    enemy.mode === 'celebrating_talk' ||
    player.dying
  ) {
    return
  }

  const playerHitbox = getPlayerHitbox(player)
  const enemyHitbox = getEnemyHitbox(enemy)

  if (!intersects(playerHitbox, enemyHitbox)) {
    return
  }

  const playerCenterX = playerHitbox.x + playerHitbox.width / 2
  const enemyCenterX = enemyHitbox.x + enemyHitbox.width / 2

  if (playerCenterX <= enemyCenterX) {
    player.x = enemyHitbox.x - playerHitbox.width
  } else {
    player.x = enemyHitbox.x + enemyHitbox.width
  }

  player.x = clamp(player.x, 0, WORLD.width - PLAYER.width)
  player.vx = 0
}

export function applyBossPushToPlayer(player, push, enemy) {
  if (!push || player.dying) {
    return
  }

  const direction = push.direction || 1
  const nudge = push.nudge ?? 0
  const targetDistance = push.targetDistance ?? 0

  player.crouching = false
  player.brakeTimer = 0
  player.throwTimer = 0
  player.shieldTimer = 0
  player.pushTimer = PUSH.duration
  player.pushDirection = direction
  player.pushStartX = player.x
  player.facing = direction

  if (enemy && targetDistance > 0) {
    const enemyHitbox = getEnemyHitbox(enemy)
    const enemyCenterX = enemyHitbox.x + enemyHitbox.width / 2
    const playerCenterX = player.x + PLAYER.width / 2
    const targetCenterX = enemyCenterX + direction * targetDistance
    const nudgedCenterX = playerCenterX + direction * nudge
    const nextCenterX =
      direction > 0
        ? Math.max(nudgedCenterX, targetCenterX)
        : Math.min(nudgedCenterX, targetCenterX)

    player.pushTargetX = clamp(
      nextCenterX - PLAYER.width / 2,
      0,
      WORLD.width - PLAYER.width,
    )
  } else if (nudge > 0) {
    player.pushTargetX = clamp(
      player.x + direction * nudge,
      0,
      WORLD.width - PLAYER.width,
    )
  } else {
    player.pushTargetX = player.x
  }

  player.vx =
    (direction * Math.abs(player.pushTargetX - player.pushStartX)) /
    PUSH.slideDuration
  player.vy = 0
  player.y = floorSurfaceY - PLAYER.height
  player.onGround = true
  player.sprite = push1
}

export function isEnemyVulnerable(enemy) {
  return (
    enemy.active &&
    enemy.entered &&
    !['walking', 'talking', 'celebrating_walk', 'celebrating_talk', 'dying', 'dead'].includes(
      enemy.mode,
    )
  )
}

export function applyEnemyProjectileHits(enemy, pizzas, utilityProjectiles) {
  if (!isEnemyVulnerable(enemy) || enemy.health <= 0) {
    return {
      enemy,
      pizzas,
      utilityProjectiles,
    }
  }

  const nextEnemy = { ...enemy }
  const enemyHitbox = getEnemyHitbox(nextEnemy)
  const nextPizzas = pizzas.filter((pizza) => {
    if (intersects(getPizzaHitbox(pizza), enemyHitbox)) {
      nextEnemy.health = Math.max(0, nextEnemy.health - pizza.damage)
      return false
    }

    return true
  })
  const nextUtilityProjectiles = utilityProjectiles.filter((projectile) => {
    if (intersects(getUtilityProjectileHitbox(projectile), enemyHitbox)) {
      nextEnemy.health = Math.max(0, nextEnemy.health - projectile.damage)
      if (projectile.type === 'gas' && nextEnemy.health > 0) {
        stunBoss(nextEnemy)
        nextEnemy.sprite = enemyStunned
      }
      return false
    }

    return true
  })

  if (nextEnemy.health <= 0) {
    nextEnemy.mode = 'dying'
    nextEnemy.deathTimer = 0
    nextEnemy.speechText = ''
    nextEnemy.sprite = ENEMY_DEATH_FRAMES[0]
  }

  return {
    enemy: nextEnemy,
    pizzas: nextPizzas,
    utilityProjectiles: nextUtilityProjectiles,
  }
}

export function stepPizzas(pizzas, deltaTime) {
  const dt = Math.min(deltaTime, 1 / 30)

  return pizzas
    .map((pizza) => {
      const nextPizza = {
        ...pizza,
        x: pizza.x + pizza.vx * dt,
        y: pizza.y + pizza.vy * dt,
        vy: pizza.vy + PIZZA.gravity * dt,
      }
      const hitbox = getPizzaHitbox(nextPizza)
      const floorSegment = getFloorSegmentAtFoot(hitbox.x + hitbox.width / 2)
      const hitboxBottom = hitbox.y + hitbox.height

      if (floorSegment && nextPizza.vy >= 0 && hitboxBottom >= floorSurfaceY) {
        const correctedHitboxTop = floorSurfaceY - PIZZA.hitboxHeight
        nextPizza.y = correctedHitboxTop - (PIZZA.height - PIZZA.hitboxHeight) / 2
        nextPizza.bounces += 1

        if (nextPizza.bounces > PIZZA.maxBounces) {
          nextPizza.active = false
        } else {
          nextPizza.vy = -PIZZA.floorBounceVelocity
          nextPizza.vx *= 0.72
        }
      }

      if (
        nextPizza.x + PIZZA.width < 0 ||
        nextPizza.x > WORLD.width ||
        nextPizza.y > WORLD.killY
      ) {
        nextPizza.active = false
      }

      return nextPizza
    })
    .filter((pizza) => pizza.active)
}

export function stepUtilityProjectiles(projectiles, deltaTime) {
  const dt = Math.min(deltaTime, 1 / 30)

  return projectiles
    .map((projectile) => {
      const nextProjectile = {
        ...projectile,
        x: projectile.x + projectile.vx * dt,
        y: projectile.y + projectile.vy * dt,
        lifetime: projectile.lifetime - dt,
      }

      if (nextProjectile.type === 'bottle') {
        nextProjectile.vy += BOTTLE.gravity * dt
      }

      if (
        nextProjectile.x + nextProjectile.width < 0 ||
        nextProjectile.x > WORLD.width ||
        nextProjectile.y > WORLD.killY ||
        nextProjectile.lifetime <= 0
      ) {
        nextProjectile.active = false
      }

      return nextProjectile
    })
    .filter((projectile) => projectile.active)
}

export function stepEnemyProjectiles(projectiles, deltaTime) {
  const dt = Math.min(deltaTime, 1 / 30)

  return projectiles
    .map((projectile) => {
      const nextProjectile = {
        ...projectile,
        x: projectile.x + projectile.vx * dt,
        y: projectile.y + projectile.vy * dt,
        vy: projectile.vy + ENEMY_BALL.gravity * dt,
        lifetime: projectile.lifetime - dt,
      }
      const hitbox = getEnemyProjectileHitbox(nextProjectile)
      const floorSegment = getFloorSegmentAtFoot(hitbox.x + hitbox.width / 2)
      const hitboxBottom = hitbox.y + hitbox.height

      if (floorSegment && nextProjectile.vy >= 0 && hitboxBottom >= floorSurfaceY) {
        const correctedHitboxTop = floorSurfaceY - nextProjectile.hitboxHeight
        nextProjectile.y =
          correctedHitboxTop -
          (nextProjectile.height - nextProjectile.hitboxHeight) / 2
        nextProjectile.bounces = (nextProjectile.bounces ?? 0) + 1

        if (nextProjectile.bounces > ENEMY_BALL.maxBounces) {
          nextProjectile.active = false
        } else {
          nextProjectile.vy = -ENEMY_BALL.floorBounceVelocity
          nextProjectile.vx *= 0.78
        }
      }

      if (
        nextProjectile.x + nextProjectile.width < 0 ||
        nextProjectile.x > WORLD.width ||
        nextProjectile.y > WORLD.killY ||
        nextProjectile.lifetime <= 0
      ) {
        nextProjectile.active = false
      }

      return nextProjectile
    })
    .filter((projectile) => projectile.active)
}

export function applyEnemyProjectilesToPlayer(player, projectiles) {
  if (player.dying || player.health <= 0) {
    return projectiles
  }

  const playerHitbox = getPlayerHitbox(player)

  return projectiles.filter((projectile) => {
    if (!intersects(getEnemyProjectileHitbox(projectile), playerHitbox)) {
      return true
    }

    if (!player.invulnerable) {
      player.health = Math.max(0, player.health - projectile.damage)
      triggerPlayerHurt(player)
    }

    return false
  })
}

export function toBossThreatProjectiles(pizzas, utilityProjectiles) {
  return [
    ...pizzas.map((pizza) => ({
      ...getPizzaHitbox(pizza),
      vx: pizza.vx,
      vy: pizza.vy,
      active: pizza.active,
    })),
    ...utilityProjectiles.map((projectile) => ({
      ...getUtilityProjectileHitbox(projectile),
      vx: projectile.vx,
      vy: projectile.vy,
      active: projectile.active,
    })),
  ]
}
