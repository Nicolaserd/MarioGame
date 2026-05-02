import { useMemo } from 'react'

export const BOSS_STATES = Object.freeze({
  IDLE: 'idle',
  CHASE: 'chase',
  KEEP_DISTANCE: 'keep_distance',
  THROW_ATTACK: 'throw_attack',
  RETREAT: 'retreat',
  DODGE: 'dodge',
  AIRBORNE: 'airborne',
  STUNNED: 'stunned',
})

const AI = {
  walkSpeed: 118,
  retreatSpeed: 178,
  airRetreatSpeed: 238,
  longBackJumpSpeed: 455,
  gravity: 1850,
  jumpVelocity: 610,
  backJumpVelocity: 520,
  longBackJumpVelocity: 760,
  closeActionDistance: 155,
  closeEscapeTargetDistance: 620,
  shoveTargetDistance: 930,
  closeShoveChance: 0.55,
  closeActionCooldownMin: 1.15,
  closeActionCooldownMax: 2.05,
  shoveVelocity: 620,
  shoveLiftVelocity: 340,
  shoveNudge: 96,
  shoveEnemyRetreatSpeed: 265,
  postEscapeAttackCooldownMin: 0.28,
  postEscapeAttackCooldownMax: 0.72,
  postEscapeDecisionMin: 0.1,
  postEscapeDecisionMax: 0.28,
  veryCloseDistance: 250,
  optimalMinDistance: 395,
  optimalMaxDistance: 760,
  farDistance: 850,
  attackPrepareTime: 0.58,
  attackDuration: 0.94,
  attackCooldownMin: 1.05,
  attackCooldownMax: 2,
  attackChance: 0.78,
  driftChance: 0.32,
  decisionMin: 0.34,
  decisionMax: 0.78,
  dodgeDuration: 0.62,
  retreatDuration: 0.76,
  dodgeCooldownMin: 1.25,
  dodgeCooldownMax: 2.15,
  reactionMin: 0.1,
  reactionMax: 0.25,
  threatLookahead: 0.82,
  stunDuration: 1.05,
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min)
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function getCenter(rect) {
  return {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2,
  }
}

export function createBossAIState() {
  return {
    aiState: BOSS_STATES.IDLE,
    stateTimer: 0,
    decisionTimer: randomBetween(AI.decisionMin, AI.decisionMax),
    attackTimer: 0,
    attackCooldown: randomBetween(0.9, 1.5),
    shotReleased: false,
    dodgeTimer: 0,
    dodgeCooldown: 0,
    dodgeKind: null,
    reactionTimer: 0,
    pendingDodge: null,
    retreatTimer: 0,
    stunTimer: 0,
    closeActionCooldown: randomBetween(0.8, 1.35),
    driftDirection: 0,
    retreatSpeedOverride: 0,
    escapeTargetDistance: 0,
    isThrowing: false,
    isDodging: false,
    isStunned: false,
    pendingShot: false,
    pendingPush: null,
    crouching: false,
  }
}

function resetFrameFlags(boss) {
  boss.isThrowing = false
  boss.isDodging = false
  boss.isStunned = false
  boss.pendingShot = false
  boss.pendingPush = null
}

function setState(boss, nextState) {
  if (boss.aiState === nextState && boss.mode === nextState) {
    return
  }

  boss.aiState = nextState
  boss.mode = nextState
  boss.stateTimer = 0
}

function updateTimers(boss, dt) {
  boss.stateTimer += dt
  boss.attackCooldown = Math.max(0, boss.attackCooldown - dt)
  boss.dodgeCooldown = Math.max(0, boss.dodgeCooldown - dt)
  boss.closeActionCooldown = Math.max(0, boss.closeActionCooldown - dt)
  boss.decisionTimer = Math.max(0, boss.decisionTimer - dt)
}

function getBossHitbox(boss) {
  return boss.hitbox ?? {
    x: boss.x,
    y: boss.y,
    width: boss.width ?? 0,
    height: boss.height ?? 0,
  }
}

function findIncomingThreat(boss, projectiles) {
  const hitbox = getBossHitbox(boss)
  const expanded = {
    x: hitbox.x - 36,
    y: hitbox.y - 28,
    width: hitbox.width + 72,
    height: hitbox.height + 56,
  }

  let bestThreat = null

  for (const projectile of projectiles) {
    if (!projectile || projectile.active === false || Math.abs(projectile.vx) < 1) {
      continue
    }

    const projectileBox = projectile.hitbox ?? projectile
    const projectileCenter = getCenter(projectileBox)
    const movingRight = projectile.vx > 0
    const movingLeft = projectile.vx < 0
    const approaching =
      (movingRight && projectileCenter.x < expanded.x + expanded.width) ||
      (movingLeft && projectileCenter.x > expanded.x)

    if (!approaching) {
      continue
    }

    const targetX = movingRight
      ? expanded.x
      : expanded.x + expanded.width
    const timeToCross = (targetX - projectileCenter.x) / projectile.vx

    if (timeToCross < 0 || timeToCross > AI.threatLookahead) {
      continue
    }

    const predictedY = projectileCenter.y + (projectile.vy ?? 0) * timeToCross
    const intersectsY =
      predictedY >= expanded.y &&
      predictedY <= expanded.y + expanded.height

    if (!intersectsY) {
      continue
    }

    const high = predictedY < hitbox.y + hitbox.height * 0.44
    const score = AI.threatLookahead - timeToCross

    if (!bestThreat || score > bestThreat.score) {
      bestThreat = {
        score,
        high,
        low: !high,
        close: timeToCross < 0.32,
      }
    }
  }

  return bestThreat
}

function chooseDodge(threat, distance) {
  if (distance < AI.veryCloseDistance * 0.82) {
    return 'back'
  }

  if (!threat) {
    return Math.random() < 0.65 ? 'back' : 'jump'
  }

  if (threat.high) {
    return Math.random() < 0.78 ? 'crouch' : 'back'
  }

  if (threat.low) {
    return Math.random() < 0.72 ? 'jump' : 'back'
  }

  return 'back'
}

function maybeScheduleDodge(boss, threat, distance) {
  if (boss.dodgeCooldown > 0 || boss.pendingDodge) {
    return false
  }

  const dangerClose = distance < AI.veryCloseDistance * 0.9

  if (!threat && !dangerClose) {
    return false
  }

  const reactionChance = randomBetween(0.6, 0.85)

  if (Math.random() > reactionChance) {
    boss.dodgeCooldown = randomBetween(0.45, 0.9)
    return false
  }

  boss.pendingDodge = chooseDodge(threat, distance)
  boss.reactionTimer = randomBetween(AI.reactionMin, AI.reactionMax)
  return true
}

function startDodge(boss, playerCenterX) {
  const kind = boss.pendingDodge ?? 'back'
  const awayDirection = boss.x + (boss.width ?? 0) / 2 < playerCenterX ? -1 : 1

  boss.pendingDodge = null
  boss.reactionTimer = 0
  boss.dodgeCooldown = randomBetween(AI.dodgeCooldownMin, AI.dodgeCooldownMax)
  boss.dodgeKind = kind
  boss.isDodging = true

  if (kind === 'crouch') {
    setState(boss, BOSS_STATES.DODGE)
    boss.dodgeTimer = AI.dodgeDuration
    boss.crouching = true
    boss.vx = 0
    return
  }

  if (kind === 'jump') {
    setState(boss, BOSS_STATES.AIRBORNE)
    boss.dodgeTimer = AI.dodgeDuration
    boss.crouching = false
    boss.vy = -AI.jumpVelocity
    boss.onGround = false
    boss.vx = awayDirection * 46
    return
  }

  setState(boss, BOSS_STATES.RETREAT)
  boss.retreatTimer = AI.retreatDuration
  boss.dodgeTimer = AI.retreatDuration
  boss.crouching = false
  boss.retreatSpeedOverride = 0
  boss.escapeTargetDistance = 0
  boss.vx = awayDirection * AI.airRetreatSpeed
  boss.vy = -AI.backJumpVelocity
  boss.onGround = false
}

function primePostEscapeAttack(boss) {
  boss.attackCooldown = Math.min(
    boss.attackCooldown ?? 0,
    randomBetween(AI.postEscapeAttackCooldownMin, AI.postEscapeAttackCooldownMax),
  )
  boss.decisionTimer = Math.min(
    boss.decisionTimer ?? 0,
    randomBetween(AI.postEscapeDecisionMin, AI.postEscapeDecisionMax),
  )
}

function startLongBackJump(boss, playerCenterX) {
  const awayDirection = boss.x + (boss.width ?? 0) / 2 < playerCenterX ? -1 : 1

  setState(boss, BOSS_STATES.RETREAT)
  boss.closeActionCooldown = randomBetween(
    AI.closeActionCooldownMin,
    AI.closeActionCooldownMax,
  )
  boss.dodgeCooldown = randomBetween(AI.dodgeCooldownMin, AI.dodgeCooldownMax)
  boss.retreatTimer = AI.retreatDuration * 2.1
  boss.dodgeTimer = boss.retreatTimer
  boss.dodgeKind = 'back'
  boss.crouching = false
  boss.isDodging = true
  boss.retreatSpeedOverride = AI.longBackJumpSpeed
  boss.escapeTargetDistance = AI.closeEscapeTargetDistance
  boss.vx = awayDirection * AI.longBackJumpSpeed
  boss.vy = -AI.longBackJumpVelocity
  boss.onGround = false
  primePostEscapeAttack(boss)
}

function startShove(boss, playerCenterX) {
  const enemyCenterX = boss.x + (boss.width ?? 0) / 2
  const playerPushDirection = playerCenterX < enemyCenterX ? -1 : 1
  const enemyBackDirection = -playerPushDirection

  setState(boss, BOSS_STATES.RETREAT)
  boss.closeActionCooldown = randomBetween(
    AI.closeActionCooldownMin,
    AI.closeActionCooldownMax,
  )
  boss.retreatTimer = Math.max(boss.retreatTimer, 0.78)
  boss.dodgeKind = null
  boss.crouching = false
  boss.retreatSpeedOverride = AI.shoveEnemyRetreatSpeed
  boss.escapeTargetDistance = AI.closeEscapeTargetDistance
  boss.pendingPush = {
    direction: playerPushDirection,
    velocity: AI.shoveVelocity,
    liftVelocity: AI.shoveLiftVelocity,
    nudge: AI.shoveNudge,
    targetDistance: AI.shoveTargetDistance,
  }
  boss.vx = enemyBackDirection * AI.shoveEnemyRetreatSpeed
  primePostEscapeAttack(boss)
}

function tryCloseContactResponse(boss, playerCenterX, distance) {
  if (
    distance > AI.closeActionDistance ||
    boss.closeActionCooldown > 0 ||
    boss.pendingDodge ||
    boss.aiState === BOSS_STATES.DODGE ||
    boss.aiState === BOSS_STATES.AIRBORNE ||
    boss.aiState === BOSS_STATES.STUNNED ||
    !boss.onGround
  ) {
    return false
  }

  if (Math.random() < AI.closeShoveChance) {
    startShove(boss, playerCenterX)
  } else {
    startLongBackJump(boss, playerCenterX)
  }

  return true
}

function startThrow(boss) {
  setState(boss, BOSS_STATES.THROW_ATTACK)
  boss.attackTimer = 0
  boss.shotReleased = false
  boss.vx = 0
  boss.crouching = false
}

function finishThrow(boss) {
  setState(boss, BOSS_STATES.KEEP_DISTANCE)
  boss.attackCooldown = randomBetween(AI.attackCooldownMin, AI.attackCooldownMax)
  boss.decisionTimer = randomBetween(AI.decisionMin, AI.decisionMax)
  boss.attackTimer = 0
  boss.shotReleased = false
}

function updateThrow(boss, dt) {
  boss.isThrowing = true
  boss.vx = 0
  boss.attackTimer += dt

  if (!boss.shotReleased && boss.attackTimer >= AI.attackPrepareTime) {
    boss.pendingShot = true
    boss.shotReleased = true
  }

  if (boss.attackTimer >= AI.attackDuration) {
    finishThrow(boss)
  }
}

function updateDodge(boss, dt) {
  boss.isDodging = true
  boss.dodgeTimer = Math.max(0, boss.dodgeTimer - dt)

  if (boss.dodgeKind === 'crouch') {
    boss.crouching = true
    boss.vx = 0
  }

  if (boss.dodgeTimer <= 0) {
    boss.crouching = false
    boss.dodgeKind = null
    setState(boss, BOSS_STATES.KEEP_DISTANCE)
  }
}

function updateRetreat(boss, playerCenterX, dt) {
  const enemyCenterX = boss.x + (boss.width ?? 0) / 2
  const awayDirection = enemyCenterX < playerCenterX ? -1 : 1
  const distance = Math.abs(playerCenterX - enemyCenterX)
  const retreatSpeed =
    boss.retreatSpeedOverride > 0
      ? boss.retreatSpeedOverride
      : boss.onGround
        ? AI.retreatSpeed
        : AI.airRetreatSpeed

  boss.isDodging = boss.dodgeKind === 'back'
  boss.retreatTimer = Math.max(0, boss.retreatTimer - dt)
  boss.vx = awayDirection * retreatSpeed

  if (boss.escapeTargetDistance > 0 && distance >= boss.escapeTargetDistance) {
    boss.retreatTimer = Math.min(boss.retreatTimer, boss.onGround ? 0 : 0.18)
  }

  if (boss.retreatTimer <= 0 && boss.onGround) {
    boss.dodgeKind = null
    boss.retreatSpeedOverride = 0
    boss.escapeTargetDistance = 0
    setState(boss, BOSS_STATES.KEEP_DISTANCE)
  }
}

function updateStunned(boss, dt) {
  boss.isStunned = true
  boss.vx = 0
  boss.crouching = false
  boss.stunTimer = Math.max(0, boss.stunTimer - dt)

  if (boss.stunTimer <= 0) {
    setState(boss, BOSS_STATES.KEEP_DISTANCE)
  }
}

function chooseDistanceState(boss, playerCenterX, distance) {
  if (distance > AI.farDistance) {
    setState(boss, BOSS_STATES.CHASE)
    return
  }

  if (distance < AI.veryCloseDistance) {
    setState(boss, BOSS_STATES.RETREAT)
    boss.retreatTimer = Math.max(boss.retreatTimer, randomBetween(0.4, 0.72))
    boss.dodgeKind = null
    boss.retreatSpeedOverride = 0
    boss.escapeTargetDistance = 0
    return
  }

  if (distance >= AI.optimalMinDistance && distance <= AI.optimalMaxDistance) {
    setState(boss, BOSS_STATES.KEEP_DISTANCE)
    return
  }

  const enemyCenterX = boss.x + (boss.width ?? 0) / 2
  const tooClose = distance < AI.optimalMinDistance
  const direction = enemyCenterX < playerCenterX ? 1 : -1

  if (tooClose) {
    setState(boss, BOSS_STATES.RETREAT)
    boss.retreatTimer = Math.max(boss.retreatTimer, randomBetween(0.25, 0.5))
  } else {
    setState(boss, BOSS_STATES.CHASE)
  }

  boss.driftDirection = tooClose ? -direction : direction
}

function updateGroundMovement(boss, playerCenterX, distance, dt) {
  const enemyCenterX = boss.x + (boss.width ?? 0) / 2
  const direction = enemyCenterX < playerCenterX ? 1 : -1

  if (boss.aiState === BOSS_STATES.CHASE) {
    boss.vx = direction * AI.walkSpeed
    return
  }

  if (boss.aiState === BOSS_STATES.RETREAT) {
    updateRetreat(boss, playerCenterX, dt)
    return
  }

  if (boss.aiState === BOSS_STATES.KEEP_DISTANCE) {
    if (distance < AI.optimalMinDistance) {
      boss.vx = -direction * AI.retreatSpeed * 0.72
      return
    }

    if (distance > AI.optimalMaxDistance) {
      boss.vx = direction * AI.walkSpeed * 0.82
      return
    }

    if (boss.decisionTimer <= 0) {
      boss.decisionTimer = randomBetween(AI.decisionMin, AI.decisionMax)
      boss.driftDirection =
        Math.random() < AI.driftChance ? (Math.random() < 0.5 ? -1 : 1) : 0
    }

    boss.vx = boss.driftDirection * AI.walkSpeed * 0.35
    return
  }

  boss.vx = 0
}

function maybeAttack(boss) {
  const canThrowFromState = [
    BOSS_STATES.CHASE,
    BOSS_STATES.KEEP_DISTANCE,
    BOSS_STATES.RETREAT,
  ].includes(boss.aiState)

  if (
    !canThrowFromState ||
    boss.attackCooldown > 0 ||
    !boss.onGround
  ) {
    return false
  }

  if (boss.decisionTimer > 0) {
    return false
  }

  boss.decisionTimer = randomBetween(AI.decisionMin, AI.decisionMax)

  if (Math.random() < AI.attackChance) {
    startThrow(boss)
    return true
  }

  return false
}

function applyPhysics(boss, dt) {
  boss.x += boss.vx * dt

  if (!boss.onGround || Math.abs(boss.vy) > 0) {
    boss.vy += AI.gravity * dt
    boss.y += boss.vy * dt

    if (boss.y >= boss.groundY) {
      boss.y = boss.groundY
      boss.vy = 0
      boss.onGround = true

      if (
        boss.aiState === BOSS_STATES.AIRBORNE ||
        (boss.aiState === BOSS_STATES.RETREAT && boss.retreatTimer <= 0)
      ) {
        boss.dodgeKind = null
        setState(boss, BOSS_STATES.KEEP_DISTANCE)
      }
    }
  }

  boss.x = clamp(boss.x, boss.minX ?? 0, boss.maxX ?? Number.POSITIVE_INFINITY)
}

export function stunBoss(boss, duration = AI.stunDuration) {
  if (!boss || boss.mode === 'dying' || boss.mode === 'dead') {
    return boss
  }

  setState(boss, BOSS_STATES.STUNNED)
  boss.stunTimer = Math.max(boss.stunTimer ?? 0, duration)
  boss.pendingDodge = null
  boss.reactionTimer = 0
  boss.crouching = false
  boss.vx = 0
  return boss
}

export function updateBossAI(boss, player, projectiles, deltaTime) {
  const dt = Math.min(deltaTime, 1 / 30)
  const hitbox = getBossHitbox(boss)
  const bossCenterX = hitbox.x + hitbox.width / 2
  const playerCenterX = player.x + player.width / 2
  const distance = Math.abs(playerCenterX - bossCenterX)

  resetFrameFlags(boss)
  updateTimers(boss, dt)
  boss.facing = playerCenterX < bossCenterX ? -1 : 1

  if (boss.aiState === BOSS_STATES.STUNNED) {
    updateStunned(boss, dt)
    applyPhysics(boss, dt)
    return boss
  }

  if (tryCloseContactResponse(boss, playerCenterX, distance)) {
    applyPhysics(boss, dt)
    return boss
  }

  if (boss.aiState === BOSS_STATES.THROW_ATTACK) {
    updateThrow(boss, dt)
    applyPhysics(boss, dt)
    return boss
  }

  if (boss.pendingDodge) {
    boss.reactionTimer = Math.max(0, boss.reactionTimer - dt)

    if (boss.reactionTimer <= 0) {
      startDodge(boss, playerCenterX)
    }
  } else {
    const threat = findIncomingThreat(boss, projectiles)
    maybeScheduleDodge(boss, threat, distance)
  }

  if (boss.aiState === BOSS_STATES.DODGE) {
    updateDodge(boss, dt)
    applyPhysics(boss, dt)
    return boss
  }

  if (boss.aiState === BOSS_STATES.AIRBORNE) {
    boss.isDodging = boss.dodgeKind === 'jump'
    applyPhysics(boss, dt)
    return boss
  }

  chooseDistanceState(boss, playerCenterX, distance)

  if (maybeAttack(boss)) {
    updateThrow(boss, dt)
    applyPhysics(boss, dt)
    return boss
  }

  updateGroundMovement(boss, playerCenterX, distance, dt)
  applyPhysics(boss, dt)
  return boss
}

export function useBossAI() {
  return useMemo(
    () => ({
      states: BOSS_STATES,
      createBossAIState,
      stunBoss,
      updateBossAI,
    }),
    [],
  )
}
