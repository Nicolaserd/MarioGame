import { BOSS_STATES, createBossAIState } from '../../../hooks/useBossAI.js'
import { PLAYER } from '../../characters/mario/marioConstants.js'
import { enemyIdle2, enemyWalk1 } from '../../characters/corruptDocument/corruptDocumentAssets.js'
import { ENEMY, ENEMY_CELEBRATION_TEXT, ENEMY_TALK_TEXT } from '../../characters/corruptDocument/corruptDocumentConstants.js'
import { clamp } from '../../physics/collision.js'
import { SPAWN, WORLD, floorSurfaceY } from './officeConstants.js'
import { ENEMY_WALK_FRAMES, ENEMY_TALK_FRAMES, ENEMY_DEATH_FRAMES, ENEMY_SPRITES } from './officeLayout.js'
import { createEnemyBall, getEnemyHitbox } from './officeCombat.js'

export function createInitialEnemy() {
  return {
    ...createBossAIState(),
    active: false,
    entered: false,
    mode: 'waiting',
    x: 0,
    y: floorSurfaceY - ENEMY.height + ENEMY.groundSink,
    vx: 0,
    vy: 0,
    onGround: true,
    groundY: floorSurfaceY - ENEMY.height + ENEMY.groundSink,
    minX: 0,
    maxX: WORLD.width - ENEMY.width,
    width: ENEMY.width,
    height: ENEMY.height,
    targetX: 0,
    health: ENEMY.health,
    walkClock: 0,
    talkTimer: 0,
    deathTimer: 0,
    speechText: '',
    justDefeated: false,
    defeated: false,
    facing: -1,
    sprite: enemyIdle2,
    celebrationTargetX: 0,
    celebrationTalkTimer: 0,
    shouldResetGame: false,
  }
}

export function startEnemyCelebration(enemy, deathX) {
  const targetX = clamp(
    deathX,
    ENEMY.width / 2,
    WORLD.width - ENEMY.width / 2,
  )

  enemy.mode = 'celebrating_walk'
  enemy.aiState = BOSS_STATES.IDLE
  enemy.celebrationTargetX = targetX
  enemy.celebrationTalkTimer = 0
  enemy.speechText = ''
  enemy.walkClock = 0
  enemy.vx = 0
  enemy.vy = 0
  enemy.onGround = true
  enemy.y = floorSurfaceY - ENEMY.height + ENEMY.groundSink
  enemy.crouching = false
  enemy.isThrowing = false
  enemy.isStunned = false
  enemy.isDodging = false
  enemy.pendingShot = false
  enemy.pendingPush = null
  enemy.shotReleased = false
  enemy.attackTimer = 0
  enemy.dodgeTimer = 0
  enemy.dodgeCooldown = 0
  enemy.dodgeKind = null
  enemy.retreatTimer = 0
  enemy.stunTimer = 0
  enemy.reactionTimer = 0
  enemy.pendingDodge = null
  enemy.driftDirection = 0
  enemy.retreatSpeedOverride = 0
  enemy.escapeTargetDistance = 0
  enemy.thrownEnemyProjectiles = []
  enemy.justDefeated = false
  enemy.shouldResetGame = false
}

export function chooseEnemyCombatSprite(enemy) {
  if (enemy.mode === BOSS_STATES.THROW_ATTACK || enemy.isThrowing) {
    return ENEMY_SPRITES.throw
  }

  if (enemy.mode === BOSS_STATES.STUNNED || enemy.isStunned) {
    return ENEMY_SPRITES.stunned
  }

  if (enemy.crouching) {
    return ENEMY_SPRITES.crouch
  }

  if (!enemy.onGround || enemy.mode === BOSS_STATES.AIRBORNE) {
    return enemy.dodgeKind === 'back' ? ENEMY_SPRITES.backJump : ENEMY_SPRITES.jump
  }

  if (enemy.mode === BOSS_STATES.RETREAT && enemy.dodgeKind === 'back') {
    return ENEMY_SPRITES.backJump
  }

  if (Math.abs(enemy.vx) > 16) {
    const frameIndex =
      Math.floor(enemy.walkClock / ENEMY.walkFrameTime) % ENEMY_WALK_FRAMES.length
    return ENEMY_WALK_FRAMES[frameIndex]
  }

  return ENEMY_SPRITES.idle
}

export function stepEnemy(enemy, player, deltaTime, playerProjectiles, updateBossAI) {
  const dt = Math.min(deltaTime, 1 / 30)
  const movedFromSpawn = Math.abs(player.x - SPAWN.x) > ENEMY.triggerDistance
  enemy.justDefeated = false
  enemy.thrownEnemyProjectiles = []
  enemy.shouldResetGame = false

  if (!enemy.active && !enemy.entered && !enemy.defeated && movedFromSpawn) {
    enemy.active = true
    enemy.mode = 'walking'
    enemy.x = Math.min(player.x + ENEMY.spawnDistance, WORLD.width - ENEMY.width)
    enemy.targetX = Math.min(player.x + ENEMY.stopDistance, WORLD.width - ENEMY.width)
    enemy.y = floorSurfaceY - ENEMY.height
    enemy.y += ENEMY.groundSink
    enemy.walkClock = 0
    enemy.talkTimer = 0
    enemy.deathTimer = 0
    enemy.speechText = ''
    enemy.sprite = enemyWalk1
  }

  if (!enemy.active) {
    return { ...enemy }
  }

  if (enemy.mode === 'dying') {
    enemy.deathTimer += dt

    const frameIndex = Math.min(
      ENEMY_DEATH_FRAMES.length - 1,
      Math.floor(enemy.deathTimer / ENEMY.deathFrameTime),
    )
    enemy.sprite = ENEMY_DEATH_FRAMES[frameIndex]
    enemy.speechText = ''

    if (enemy.deathTimer >= ENEMY.deathFrameTime * ENEMY_DEATH_FRAMES.length) {
      enemy.active = false
      enemy.defeated = true
      enemy.justDefeated = true
      enemy.mode = 'dead'
      enemy.sprite = ENEMY_DEATH_FRAMES[ENEMY_DEATH_FRAMES.length - 1]
    }
  } else if (enemy.mode === 'celebrating_walk') {
    enemy.walkClock += dt
    enemy.y = floorSurfaceY - ENEMY.height + ENEMY.groundSink
    enemy.onGround = true

    const enemyCenterX = enemy.x + ENEMY.width / 2
    const distance = enemy.celebrationTargetX - enemyCenterX
    const direction = distance >= 0 ? 1 : -1
    const absDistance = Math.abs(distance)

    enemy.facing = direction

    if (absDistance <= 4) {
      enemy.x = clamp(
        enemy.celebrationTargetX - ENEMY.width / 2,
        0,
        WORLD.width - ENEMY.width,
      )
      enemy.vx = 0
      enemy.mode = 'celebrating_talk'
      enemy.celebrationTalkTimer = 0
      enemy.speechText = ''
      enemy.sprite = enemyIdle2
    } else {
      const moveDistance = Math.min(absDistance, ENEMY.enterSpeed * dt)
      enemy.x = clamp(
        enemy.x + direction * moveDistance,
        0,
        WORLD.width - ENEMY.width,
      )
      enemy.vx = direction * ENEMY.enterSpeed

      const frameIndex =
        Math.floor(enemy.walkClock / ENEMY.walkFrameTime) % ENEMY_WALK_FRAMES.length
      enemy.sprite = ENEMY_WALK_FRAMES[frameIndex]
    }
  } else if (enemy.mode === 'celebrating_talk') {
    enemy.celebrationTalkTimer += dt
    enemy.y = floorSurfaceY - ENEMY.height + ENEMY.groundSink
    enemy.onGround = true
    enemy.vx = 0

    const playerCenterX = player.x + PLAYER.width / 2
    const enemyCenterX = enemy.x + ENEMY.width / 2
    enemy.facing = playerCenterX < enemyCenterX ? -1 : 1

    const talkingTime = Math.max(
      0,
      enemy.celebrationTalkTimer - ENEMY.talkStartDelay,
    )
    const textDuration = ENEMY_CELEBRATION_TEXT.length / ENEMY.talkCharsPerSecond
    enemy.speechText = talkingTime > 0 ? ENEMY_CELEBRATION_TEXT : ''

    if (talkingTime > 0) {
      const frameIndex =
        Math.floor(talkingTime / ENEMY.talkFrameTime) % ENEMY_TALK_FRAMES.length
      enemy.sprite = ENEMY_TALK_FRAMES[frameIndex]
    } else {
      enemy.sprite = enemyIdle2
    }

    if (talkingTime >= textDuration + ENEMY.talkHoldAfterText) {
      enemy.aiState = BOSS_STATES.IDLE
      enemy.mode = BOSS_STATES.IDLE
      enemy.celebrationTalkTimer = 0
      enemy.speechText = ''
      enemy.sprite = enemyIdle2
      enemy.shouldResetGame = true
    }
  } else if (!enemy.entered) {
    enemy.x = Math.max(enemy.targetX, enemy.x - ENEMY.enterSpeed * dt)
    enemy.walkClock += dt

    const frameIndex =
      Math.floor(enemy.walkClock / ENEMY.walkFrameTime) % ENEMY_WALK_FRAMES.length
    enemy.sprite = ENEMY_WALK_FRAMES[frameIndex]

    if (enemy.x <= enemy.targetX) {
      enemy.entered = true
      enemy.mode = 'talking'
      enemy.walkClock = 0
      enemy.talkTimer = 0
      enemy.speechText = ''
      enemy.sprite = enemyIdle2
    }
  } else if (enemy.mode === 'talking') {
    enemy.talkTimer += dt

    const talkingTime = Math.max(0, enemy.talkTimer - ENEMY.talkStartDelay)
    const textDuration = ENEMY_TALK_TEXT.length / ENEMY.talkCharsPerSecond
    enemy.speechText = talkingTime > 0 ? ENEMY_TALK_TEXT : ''

    if (talkingTime > 0) {
      const frameIndex =
        Math.floor(talkingTime / ENEMY.talkFrameTime) % ENEMY_TALK_FRAMES.length
      enemy.sprite = ENEMY_TALK_FRAMES[frameIndex]
    } else {
      enemy.sprite = enemyIdle2
    }

    if (talkingTime >= textDuration + ENEMY.talkHoldAfterText) {
      enemy.aiState = BOSS_STATES.IDLE
      enemy.mode = BOSS_STATES.IDLE
      enemy.talkTimer = 0
      enemy.speechText = ''
      enemy.sprite = enemyIdle2
    }
  } else {
    enemy.speechText = ''
    enemy.walkClock += dt
    enemy.hitbox = getEnemyHitbox(enemy)
    updateBossAI(
      enemy,
      {
        x: player.x,
        y: player.y,
        width: PLAYER.width,
        height: PLAYER.height,
      },
      playerProjectiles,
      deltaTime,
    )

    if (enemy.pendingShot) {
      enemy.thrownEnemyProjectiles.push(createEnemyBall(enemy, player))
      enemy.pendingShot = false
    }

    enemy.sprite = chooseEnemyCombatSprite(enemy)
  }

  return { ...enemy }
}
