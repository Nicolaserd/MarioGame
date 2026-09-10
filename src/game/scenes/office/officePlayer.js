import { attacked, brake, crouch, fall, idle1, jump, push1, push2, shield1, shield2, throwPose } from '../../characters/mario/marioAssets.js'
import { ANIMATION, DEATH, HURT, PHYSICS, PLAYER, PUSH, SHIELD } from '../../characters/mario/marioConstants.js'
import { PIZZA, THROW, UTILITY } from '../../projectiles/projectileTypes.js'
import { clamp } from '../../physics/collision.js'
import { SCENE, SPAWN, WORLD, floorSurfaceY } from './officeConstants.js'
import { getFloorSegmentAtFoot } from './officeLayout.js'
import { IDLE_FRAMES, RUN_FRAMES, UTILITY_FRAMES, DEATH_FRAMES } from '../../characters/mario/marioLayout.js'
import { createPizza, createGas, createBottle } from './officeCombat.js'

export function createInitialPlayer() {
  const spawnSegment = getFloorSegmentAtFoot(SPAWN.x + PLAYER.width / 2)
  const spawnY = (spawnSegment ? floorSurfaceY : SCENE.height / 2) - PLAYER.height

  return {
    x: SPAWN.x,
    y: spawnY,
    vx: 0,
    vy: 0,
    facing: 1,
    onGround: Boolean(spawnSegment),
    brakeTimer: 0,
    throwTimer: 0,
    throwCooldown: 0,
    idleClock: 0,
    runClock: 0,
    utilityAnimationClock: 0,
    utilityTimer: 0,
    utilityPhase: 'idle',
    utilityCharges: UTILITY.maxCharges,
    utilityRegenTimer: 0,
    utilityGasLaunched: false,
    invulnerable: false,
    shieldTimer: 0,
    shieldCooldown: 0,
    dying: false,
    deathTimer: 0,
    deathX: SPAWN.x + PLAYER.width / 2,
    hadInput: false,
    crouching: false,
    speechText: '',
    speechTimer: 0,
    pushTimer: 0,
    pushStartX: SPAWN.x,
    pushTargetX: SPAWN.x,
    pushDirection: 1,
    hurtTimer: 0,
    sprite: idle1,
    deaths: 0,
    health: PLAYER.health,
    pizzaAmmo: PLAYER.pizzaAmmo,
    pizzaRegenTimer: 0,
  }
}

export function getDeathFrameIndex(deathTimer) {
  let elapsed = 0

  for (let index = 0; index < DEATH.frameDurations.length; index += 1) {
    elapsed += DEATH.frameDurations[index]

    if (deathTimer < elapsed) {
      return index
    }
  }

  return DEATH_FRAMES.length - 1
}

export function getDeathDuration() {
  return DEATH.frameDurations.reduce((total, duration) => total + duration, 0)
}

export function chooseSprite(player) {
  if (player.dying) {
    return DEATH_FRAMES[getDeathFrameIndex(player.deathTimer)]
  }

  if (player.pushTimer > 0) {
    return player.pushTimer > PUSH.duration - PUSH.slideDuration ? push1 : push2
  }

  if (player.hurtTimer > 0) {
    return attacked
  }

  if (player.shieldTimer > 0) {
    return player.shieldTimer > SHIELD.duration - SHIELD.introDuration
      ? shield1
      : shield2
  }

  if (player.utilityPhase === 'active' && !player.utilityGasLaunched) {
    const utilityIndex = Math.min(
      UTILITY_FRAMES.length - 1,
      Math.floor(player.utilityAnimationClock / ANIMATION.utilityFrameTime),
    )

    return UTILITY_FRAMES[utilityIndex]
  }

  if (player.crouching) return crouch

  if (player.throwTimer > 0 && player.onGround) {
    return throwPose
  }

  if (!player.onGround) {
    return player.vy < -PHYSICS.airStateThreshold ? jump : fall
  }

  if (player.brakeTimer > 0) {
    return brake
  }

  if (player.crouching) {
    return crouch
  }

  if (Math.abs(player.vx) > PHYSICS.runThreshold) {
    const index =
      Math.floor(player.runClock / ANIMATION.runFrameTime) % RUN_FRAMES.length
    return RUN_FRAMES[index]
  }

  const index =
    Math.floor(player.idleClock / ANIMATION.idleFrameTime) % IDLE_FRAMES.length
  return IDLE_FRAMES[index]
}

export function describeAnimation(player) {
  if (player.dying) {
    return 'Muriendo'
  }

  if (player.pushTimer > 0) {
    return 'Empujado'
  }

  if (player.hurtTimer > 0) {
    return 'Atacado'
  }

  if (player.shieldTimer > 0) {
    return 'Escudo'
  }

  if (player.utilityPhase === 'flash') {
    return 'Preparando util'
  }

  if (player.utilityPhase === 'active') {
    return 'Util'
  }

  if (player.throwTimer > 0) {
    return 'Lanzando'
  }

  if (!player.onGround && player.vy < -PHYSICS.airStateThreshold) {
    return 'Saltando'
  }

  if (!player.onGround) {
    return 'Cayendo'
  }

  if (player.brakeTimer > 0) {
    return 'Frenando'
  }

  if (player.crouching) {
    return 'Agachado'
  }

  if (Math.abs(player.vx) > PHYSICS.runThreshold) {
    return 'Corriendo'
  }

  return 'Idle'
}

export function startDeath(player) {
  player.dying = true
  player.deathTimer = 0
  player.deathX = player.x + PLAYER.width / 2
  player.vx = 0
  player.vy = 0
  player.onGround = true
  player.brakeTimer = 0
  player.throwTimer = 0
  player.throwCooldown = 0
  player.utilityPhase = 'idle'
  player.utilityTimer = 0
  player.utilityAnimationClock = 0
  player.utilityGasLaunched = false
  player.invulnerable = false
  player.shieldTimer = 0
  player.crouching = false
  player.pushTimer = 0
  player.hurtTimer = 0
}

export function triggerPlayerHurt(player) {
  if (player.dying || player.invulnerable) {
    return
  }

  player.hurtTimer = HURT.duration

  if (player.pushTimer <= 0) {
    player.sprite = attacked
  }
}

export function easeOutCubic(progress) {
  return 1 - (1 - progress) ** 3
}

export function tickPlayerRecoveryTimers(player, timerDt) {
  player.throwCooldown = Math.max(0, player.throwCooldown - timerDt)
  player.shieldTimer = Math.max(0, player.shieldTimer - timerDt)
  player.shieldCooldown = Math.max(0, player.shieldCooldown - timerDt)
  player.speechTimer = Math.max(0, player.speechTimer - timerDt)
  player.hurtTimer = Math.max(0, player.hurtTimer - timerDt)

  if (player.speechTimer <= 0) {
    player.speechText = ''
  }

  if (player.pizzaAmmo < PLAYER.pizzaAmmo) {
    player.pizzaRegenTimer += timerDt

    while (
      player.pizzaRegenTimer >= PIZZA.regenTime &&
      player.pizzaAmmo < PLAYER.pizzaAmmo
    ) {
      player.pizzaAmmo += 1
      player.pizzaRegenTimer -= PIZZA.regenTime
    }
  } else {
    player.pizzaRegenTimer = 0
  }

  if (player.utilityCharges < UTILITY.maxCharges) {
    player.utilityRegenTimer += timerDt

    while (
      player.utilityRegenTimer >= UTILITY.chargeRegenTime &&
      player.utilityCharges < UTILITY.maxCharges
    ) {
      player.utilityCharges += 1
      player.utilityRegenTimer -= UTILITY.chargeRegenTime
    }
  } else {
    player.utilityRegenTimer = 0
  }
}

export function toPlayerStepResult(
  player,
  resetProjectiles,
  thrownPizzas = [],
  thrownUtilityProjectiles = [],
) {
  return {
    x: player.x,
    y: player.y,
    sprite: player.sprite,
    facing: player.facing,
    onGround: player.onGround,
    animation: describeAnimation(player),
    speed: Math.round(Math.abs(player.vx)),
    deaths: player.deaths,
    health: player.health,
    pizzaAmmo: player.pizzaAmmo,
    utilityCharges: player.utilityCharges,
    utilityPhase: player.utilityPhase,
    utilityTimer: player.utilityTimer,
    invulnerable: player.invulnerable,
    shieldTimer: player.shieldTimer,
    shieldCooldown: player.shieldCooldown,
    dying: player.dying,
    deathTimer: player.deathTimer,
    speechText: player.speechText,
    speechTimer: player.speechTimer,
    resetProjectiles,
    thrownPizzas,
    thrownUtilityProjectiles,
  }
}

export function stepPushedPlayer(player, timerDt, resetProjectiles) {
  const previousTimer = player.pushTimer
  player.pushTimer = Math.max(0, player.pushTimer - timerDt)

  const elapsed = PUSH.duration - player.pushTimer
  const slideProgress = clamp(elapsed / PUSH.slideDuration, 0, 1)
  const easedProgress = easeOutCubic(slideProgress)
  const nextX =
    player.pushStartX + (player.pushTargetX - player.pushStartX) * easedProgress

  player.x = clamp(nextX, 0, WORLD.width - PLAYER.width)
  player.y = floorSurfaceY - PLAYER.height
  player.vy = 0
  player.onGround = true
  player.crouching = false
  player.throwTimer = 0
  player.brakeTimer = 0
  player.hadInput = false
  player.invulnerable =
    player.utilityPhase === 'flash' ||
    (player.utilityPhase === 'active' && !player.utilityGasLaunched)

  if (player.pushTimer <= PUSH.duration - PUSH.slideDuration) {
    player.vx = 0
  }

  if (player.pushTimer <= 0 && previousTimer > 0) {
    player.x = clamp(player.pushTargetX, 0, WORLD.width - PLAYER.width)
    player.vx = 0
    player.pushStartX = player.x
    player.pushTargetX = player.x
    player.idleClock = 0
    player.runClock = 0
  }

  tickPlayerRecoveryTimers(player, timerDt)
  player.sprite = chooseSprite(player)

  return toPlayerStepResult(player, resetProjectiles)
}

export function stepPlayer(player, keys, deltaTime) {
  const dt = Math.min(deltaTime, 1 / 30)
  const timerDt = Math.min(deltaTime, 0.5)
  const previousDeathFrame = getDeathFrameIndex(player.deathTimer)
  const wasDying = player.dying
  const respawnedAfterDeath = { current: false }
  const shouldStartDeath =
    !player.dying && (keys.deathQueued || player.health <= 0)

  if (shouldStartDeath) {
    startDeath(player)
  }

  keys.deathQueued = false

  if (player.dying) {
    player.deathTimer += timerDt

    if (
      previousDeathFrame < DEATH_FRAMES.length - 1 &&
      getDeathFrameIndex(player.deathTimer) === DEATH_FRAMES.length - 1
    ) {
      player.y -= DEATH.riseDistance
    }

    if (player.deathTimer >= getDeathDuration()) {
      const capturedDeathX = player.deathX
      Object.assign(player, createInitialPlayer(), {
        brakeTimer: PHYSICS.landingBrakeDuration,
      })
      respawnedAfterDeath.current = true
      respawnedAfterDeath.deathX = capturedDeathX
    } else {
      player.sprite = chooseSprite(player)

      return {
        x: player.x,
        y: player.y,
        sprite: player.sprite,
        facing: player.facing,
        onGround: player.onGround,
        animation: describeAnimation(player),
        speed: 0,
        deaths: player.deaths,
        health: player.health,
        pizzaAmmo: player.pizzaAmmo,
    utilityCharges: player.utilityCharges,
        utilityPhase: player.utilityPhase,
    utilityTimer: player.utilityTimer,
    invulnerable: player.invulnerable,
    shieldTimer: player.shieldTimer,
    shieldCooldown: player.shieldCooldown,
    dying: player.dying,
        deathTimer: player.deathTimer,
        resetProjectiles: shouldStartDeath,
        thrownPizzas: [],
        thrownUtilityProjectiles: [],
      }
    }
  }

  if (player.pushTimer > 0) {
    keys.left = false
    keys.right = false
    keys.down = false
    keys.jumpQueued = false
    keys.throwQueued = false
    keys.utilityQueued = false
    keys.shieldQueued = false
    return stepPushedPlayer(
      player,
      timerDt,
      wasDying && respawnedAfterDeath.current,
    )
  }

  if (
    keys.shieldQueued &&
    player.shieldTimer <= 0 &&
    player.shieldCooldown <= 0 &&
    !player.dying &&
    player.utilityPhase !== 'flash' &&
    !(player.utilityPhase === 'active' && !player.utilityGasLaunched)
  ) {
    player.shieldTimer = SHIELD.duration
    player.shieldCooldown = SHIELD.cooldown
    player.vx = 0
    player.brakeTimer = 0
    player.throwTimer = 0
  }

  keys.shieldQueued = false

  if (player.shieldTimer > 0 && !keys.shieldHeld) {
    player.shieldTimer = 0
  }

  const utilityLocked =
    player.utilityPhase === 'flash' ||
    (player.utilityPhase === 'active' && !player.utilityGasLaunched)
  const shieldActive = player.shieldTimer > 0
  const actionLocked = utilityLocked || shieldActive
  const rawInput = (keys.right ? 1 : 0) - (keys.left ? 1 : 0)
  if (rawInput !== 0 && !actionLocked) player.facing = rawInput
  const wantsCrouch = keys.down && player.onGround && !actionLocked
  player.crouching = !!wantsCrouch
  if (wantsCrouch) { player.vx = 0; player.brakeTimer = 0 }
  const input = wantsCrouch || actionLocked ? 0 : rawInput
  const thrownPizzas = []
  const thrownUtilityProjectiles = []
  const wasOnGround = player.onGround
  const previousBottom = player.y + PLAYER.height
  const releasedMovement = player.hadInput && input === 0

  if (
    keys.utilityQueued &&
    player.utilityPhase === 'idle' &&
    player.utilityCharges > 0
  ) {
    player.utilityCharges -= 1
    player.utilityPhase = 'flash'
    player.utilityTimer = 0
    player.utilityAnimationClock = 0
    player.utilityGasLaunched = false
    player.throwTimer = 0
    player.throwCooldown = 0
    player.brakeTimer = 0
    player.vx = 0
  }

  keys.utilityQueued = false

  if (player.utilityPhase === 'flash') {
    player.utilityTimer += timerDt
    player.vx = 0

    if (player.utilityTimer >= UTILITY.flashDuration) {
      player.utilityPhase = 'active'
      player.utilityTimer = 0
      player.utilityAnimationClock = 0
      player.utilityGasLaunched = false
    }
  } else if (player.utilityPhase === 'active') {
    player.utilityTimer += timerDt
    player.utilityAnimationClock += timerDt

    if (!player.utilityGasLaunched) {
      player.vx = 0
    }

    if (
      !player.utilityGasLaunched &&
      player.utilityAnimationClock >= UTILITY.gasLaunchTime
    ) {
      player.utilityGasLaunched = true
      thrownUtilityProjectiles.push(createGas(player))
      player.utilityTimer = 0
      player.brakeTimer = Math.max(player.brakeTimer, PHYSICS.brakeDuration)
      player.throwTimer = 0
      player.throwCooldown = 0
    }

    if (
      player.utilityGasLaunched &&
      player.utilityTimer >= UTILITY.postGasDuration
    ) {
      player.utilityPhase = 'idle'
      player.utilityTimer = 0
      player.utilityAnimationClock = 0
      player.utilityGasLaunched = false
      player.throwTimer = 0
      player.throwCooldown = 0
    }
  }

  player.invulnerable =
    shieldActive ||
    player.utilityPhase === 'flash' ||
    (player.utilityPhase === 'active' && !player.utilityGasLaunched)

  if (keys.jumpQueued && player.onGround && !wantsCrouch && !actionLocked) {
    player.vy = -PHYSICS.jumpVelocity
    player.onGround = false
    player.brakeTimer = 0
    player.idleClock = 0
    player.runClock = 0
  }

  keys.jumpQueued = false

  if (
    keys.throwQueued &&
    player.throwCooldown <= 0 &&
    player.utilityPhase === 'active' &&
    player.utilityGasLaunched
  ) {
    player.throwTimer = THROW.duration
    player.throwCooldown = UTILITY.bottleCooldown
    thrownUtilityProjectiles.push(createBottle(player))
  } else if (
    keys.throwQueued &&
    player.throwCooldown <= 0 &&
    player.pizzaAmmo > 0 &&
    !actionLocked
  ) {
    player.pizzaAmmo -= 1
    player.throwTimer = THROW.duration
    player.throwCooldown = THROW.duration + THROW.cooldown
    player.brakeTimer = 0
    thrownPizzas.push(createPizza(player))
  }

  keys.throwQueued = false

  if (
    releasedMovement &&
    Math.abs(player.vx) > PHYSICS.brakeTriggerSpeed &&
    !wantsCrouch &&
    !actionLocked
  ) {
    player.brakeTimer = PHYSICS.brakeDuration
  }

  const movementInput = player.throwTimer > 0 && player.onGround ? 0 : input
  if (player.throwTimer > 0 && player.onGround) player.vx = 0
  if (movementInput !== 0) {
    player.brakeTimer = 0
    player.vx += movementInput * PHYSICS.acceleration * dt
    player.facing = movementInput
  } else if (player.vx !== 0) {
    const sign = Math.sign(player.vx)
    const slowedSpeed = Math.max(0, Math.abs(player.vx) - PHYSICS.friction * dt)
    player.vx = slowedSpeed * sign
  }

  player.vx = clamp(player.vx, -PHYSICS.maxSpeed, PHYSICS.maxSpeed)
  player.vy += PHYSICS.gravity * dt

  player.x += player.vx * dt
  player.y += player.vy * dt

  player.x = clamp(player.x, 0, WORLD.width - PLAYER.width)

  const currentBottom = player.y + PLAYER.height
  const playerFoot = player.x + PLAYER.width / 2
  const floorSegment = getFloorSegmentAtFoot(playerFoot)
  const standingOnGround =
    player.vy >= 0 &&
    currentBottom >= floorSurfaceY &&
    (wasOnGround || previousBottom <= floorSurfaceY) &&
    Boolean(floorSegment)

  if (standingOnGround) {
    player.y = floorSurfaceY - PLAYER.height
    player.vy = 0
    player.onGround = true
    if (!wasOnGround) {
      player.brakeTimer = Math.max(
        player.brakeTimer,
        PHYSICS.landingBrakeDuration,
      )
    }
  } else {
    player.onGround = false
  }

  player.crouching = keys.down && player.onGround && !actionLocked

  if (player.y > WORLD.killY) {
    startDeath(player)
  }

  if (player.onGround && Math.abs(player.vx) > PHYSICS.runThreshold) {
    player.runClock += dt
    player.idleClock = 0
  } else if (player.onGround && player.brakeTimer <= 0) {
    player.idleClock += dt
    player.runClock = 0
  }

  player.brakeTimer = Math.max(0, player.brakeTimer - timerDt)
  player.throwTimer = Math.max(0, player.throwTimer - timerDt)
  player.throwCooldown = Math.max(0, player.throwCooldown - timerDt)
  player.shieldTimer = Math.max(0, player.shieldTimer - timerDt)
  player.shieldCooldown = Math.max(0, player.shieldCooldown - timerDt)
  player.speechTimer = Math.max(0, player.speechTimer - timerDt)
  player.hurtTimer = Math.max(0, player.hurtTimer - timerDt)

  if (player.speechTimer <= 0) {
    player.speechText = ''
  }

  if (player.pizzaAmmo < PLAYER.pizzaAmmo) {
    player.pizzaRegenTimer += timerDt

    while (
      player.pizzaRegenTimer >= PIZZA.regenTime &&
      player.pizzaAmmo < PLAYER.pizzaAmmo
    ) {
      player.pizzaAmmo += 1
      player.pizzaRegenTimer -= PIZZA.regenTime
    }
  } else {
    player.pizzaRegenTimer = 0
  }

  if (player.utilityCharges < UTILITY.maxCharges) {
    player.utilityRegenTimer += timerDt

    while (
      player.utilityRegenTimer >= UTILITY.chargeRegenTime &&
      player.utilityCharges < UTILITY.maxCharges
    ) {
      player.utilityCharges += 1
      player.utilityRegenTimer -= UTILITY.chargeRegenTime
    }
  } else {
    player.utilityRegenTimer = 0
  }

  player.hadInput = movementInput !== 0
  player.sprite = chooseSprite(player)

  return {
    x: player.x,
    y: player.y,
    sprite: player.sprite,
    facing: player.facing,
    onGround: player.onGround,
    animation: describeAnimation(player),
    speed: Math.round(Math.abs(player.vx)),
    deaths: player.deaths,
    health: player.health,
    pizzaAmmo: player.pizzaAmmo,
    utilityCharges: player.utilityCharges,
    utilityPhase: player.utilityPhase,
    utilityTimer: player.utilityTimer,
    invulnerable: player.invulnerable,
    shieldTimer: player.shieldTimer,
    shieldCooldown: player.shieldCooldown,
    dying: player.dying,
    deathTimer: player.deathTimer,
    speechText: player.speechText,
    speechTimer: player.speechTimer,
    resetProjectiles: wasDying && respawnedAfterDeath.current,
    respawnDeathX: respawnedAfterDeath.current ? respawnedAfterDeath.deathX : null,
    thrownPizzas,
    thrownUtilityProjectiles,
  }
}

export function toSceneState(player) {
  return {
    x: player.x,
    y: player.y,
    sprite: player.sprite,
    facing: player.facing,
    onGround: player.onGround,
    animation: describeAnimation(player),
    speed: Math.round(Math.abs(player.vx)),
    deaths: player.deaths,
    health: player.health,
    pizzaAmmo: player.pizzaAmmo,
    utilityCharges: player.utilityCharges,
    utilityPhase: player.utilityPhase,
    utilityTimer: player.utilityTimer,
    invulnerable: player.invulnerable,
    shieldTimer: player.shieldTimer,
    shieldCooldown: player.shieldCooldown,
    dying: player.dying,
    deathTimer: player.deathTimer,
    speechText: player.speechText,
    speechTimer: player.speechTimer,
  }
}
