import {
  startTransition,
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  BOSS_STATES,
  createBossAIState,
  stunBoss,
  useBossAI,
} from '../../../hooks/useBossAI.js'
import {
  attacked,
  bottleIcon,
  brake,
  crouch,
  death1,
  death2,
  death3,
  fall,
  heartIcon,
  idle1,
  idle2,
  jump,
  pizzaIcon,
  push1,
  push2,
  run1,
  run2,
  run3,
  shield1,
  shield2,
  throwPose,
  thrownPizza,
  util1,
  util2,
  util3,
  util4,
  util5,
  util6,
  vomitGas,
} from '../../characters/mario/marioAssets.js'
import {
  ANIMATION,
  DEATH,
  HURT,
  PHYSICS,
  PLAYER,
  PLAYER_VISUAL,
  PUSH,
  SHIELD,
} from '../../characters/mario/marioConstants.js'
import {
  enemyBall,
  enemyCrouch,
  enemyDeath1,
  enemyDeath2,
  enemyDeath3,
  enemyDeath4,
  enemyIdle2,
  enemyJump,
  enemyStunned,
  enemyTalk1,
  enemyTalk2,
  enemyThrow,
  enemyWalk1,
  enemyWalk2,
} from '../../characters/corruptDocument/corruptDocumentAssets.js'
import {
  ENEMY,
  ENEMY_CELEBRATION_TEXT,
  ENEMY_TALK_TEXT,
  MARIO_ENEMY_DEFEAT_SPEECH_TIME,
  MARIO_ENEMY_DEFEAT_TEXT,
} from '../../characters/corruptDocument/corruptDocumentConstants.js'
import { DOC_MINION_RUN_FRAMES } from '../../characters/docMinion/docMinionAssets.js'
import { DOC_MINION } from '../../characters/docMinion/docMinionConstants.js'
import { useGameLoop } from '../../engine/useGameLoop.js'
import { useGameInput } from '../../engine/useGameInput.js'
import {
  BOTTLE,
  ENEMY_BALL,
  GAS,
  PIZZA,
  THROW,
  UTILITY,
} from '../../projectiles/projectileTypes.js'
import { clamp, intersects } from '../../physics/collision.js'
import { GameHud } from '../../ui/GameHud.jsx'
import { IntroVideoOverlay } from '../../ui/IntroVideoOverlay.jsx'
import { PauseMenu } from '../../ui/PauseMenu.jsx'
import { SpeechBubble } from '../../ui/SpeechBubble.jsx'
import { backLayer, floorTile, introVideo, midLayer } from './officeAssets.js'
import {
  FLOOR,
  FLOOR_SEGMENTS,
  SCENE,
  SPAWN,
  WORLD,
  floorSurfaceY,
} from './officeConstants.js'

const PARALLAX_LAYERS = [
  {
    name: 'fondo de atras',
    image: backLayer,
    depth: 0.14,
    verticalDepth: 0.08,
    size: '995px 560px',
    className: 'parallax-back',
  },
  {
    name: 'escritorios',
    image: midLayer,
    depth: 0.42,
    verticalDepth: 1,
    size: '690px 460px',
    className: 'parallax-desks',
  },
]

const SPRITE_METRICS = new Map([
  [
    idle1,
    {
      width: 496,
      height: 910,
      footAnchorX: 200.66,
    },
  ],
  [
    idle2,
    {
      width: 512,
      height: 939,
      footAnchorX: 221.29,
    },
  ],
  [
    brake,
    {
      width: 623,
      height: 897,
      footAnchorX: 297.94,
    },
  ],
  [
    run1,
    {
      width: 1076,
      height: 726,
      footAnchorX: 592.74,
    },
  ],
  [
    run2,
    {
      width: 991,
      height: 727,
      footAnchorX: 532.18,
    },
  ],
  [
    run3,
    {
      width: 1078,
      height: 694,
      footAnchorX: 516.94,
    },
  ],
  [
    jump,
    {
      width: 1014,
      height: 797,
      footAnchorX: 425.28,
    },
  ],
  [
    fall,
    {
      width: 851,
      height: 728,
      footAnchorX: 411.53,
    },
  ],
  [
    crouch,
    {
      width: 690,
      height: 790,
      footAnchorX: 310,
      visualHeight: PLAYER_VISUAL.idleHeight * PLAYER_VISUAL.crouchHeightRatio,
    },
  ],
  [
    death1,
    {
      width: 610,
      height: 910,
      footAnchorX: 290,
    },
  ],
  [
    death2,
    {
      width: 1300,
      height: 560,
      footAnchorX: 625,
    },
  ],
  [
    death3,
    {
      width: 1020,
      height: 840,
      footAnchorX: 510,
    },
  ],
  [
    shield1,
    {
      width: 560,
      height: 900,
      footAnchorX: 270,
    },
  ],
  [
    shield2,
    {
      width: 900,
      height: 920,
      footAnchorX: 350,
    },
  ],
  [
    push1,
    {
      width: 1134,
      height: 667,
      footAnchorX: 430,
    },
  ],
  [
    push2,
    {
      width: 1374,
      height: 778,
      footAnchorX: 1020,
    },
  ],
  [
    attacked,
    {
      width: 905,
      height: 954,
      footAnchorX: 452,
    },
  ],
  [
    util1,
    {
      width: 900,
      height: 930,
      footAnchorX: 452,
    },
  ],
  [
    util2,
    {
      width: 900,
      height: 930,
      footAnchorX: 452,
    },
  ],
  [
    util3,
    {
      width: 900,
      height: 930,
      footAnchorX: 452,
    },
  ],
  [
    util4,
    {
      width: 900,
      height: 930,
      footAnchorX: 452,
    },
  ],
  [
    util5,
    {
      width: 900,
      height: 930,
      footAnchorX: 452,
    },
  ],
  [
    util6,
    {
      width: 930,
      height: 945,
      footAnchorX: 472,
    },
  ],
  [
    throwPose,
    {
      width: 1536,
      height: 1024,
      footAnchorX: 545,
    },
  ],
])

const IDLE_FRAMES = [idle1, idle2]
const RUN_FRAMES = [run1, run2, run3]
const UTILITY_FRAMES = [util1, util2, util3, util4, util5, util6]
const DEATH_FRAMES = [death1, death2, death3]
const ENEMY_WALK_FRAMES = [enemyWalk1, enemyWalk2]
const ENEMY_TALK_FRAMES = [enemyTalk1, enemyTalk2]
const ENEMY_DEATH_FRAMES = [enemyDeath1, enemyDeath2, enemyDeath3, enemyDeath4]
const ENEMY_SPRITES = {
  idle: enemyIdle2,
  jump: enemyJump,
  crouch: enemyCrouch,
  stunned: enemyStunned,
  backJump: enemyJump,
  throw: enemyThrow,
}
const PLAYER_VISUAL_SCALE =
  PLAYER_VISUAL.idleHeight / PLAYER_VISUAL.referenceHeight

const SPRITE_LAYOUTS = new Map(
  Array.from(SPRITE_METRICS.entries(), ([sprite, metrics]) => [
    sprite,
    (() => {
      const scale =
        metrics.visualHeight === undefined
          ? PLAYER_VISUAL_SCALE
          : metrics.visualHeight / metrics.height

      return {
        width: Number((metrics.width * scale).toFixed(2)),
        height: Number((metrics.height * scale).toFixed(2)),
        footAnchorX: Number((metrics.footAnchorX * scale).toFixed(2)),
      }
    })(),
  ]),
)

function getFloorSegmentAtFoot(footX) {
  return FLOOR_SEGMENTS.find(
    (segment) => footX >= segment.x + 24 && footX <= segment.x + segment.width - 24,
  )
}

function createInitialPlayer() {
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

function createInitialEnemy() {
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

function getDocMinionSpawnCooldown() {
  return (
    DOC_MINION.spawnCooldownMin +
    Math.random() * (DOC_MINION.spawnCooldownMax - DOC_MINION.spawnCooldownMin)
  )
}

function createInitialDocMinionSystem() {
  return {
    activated: false,
    spawnTimer: getDocMinionSpawnCooldown(),
  }
}

function startEnemyCelebration(enemy, deathX) {
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

function createEmptyKeys() {
  return {
    left: false,
    right: false,
    jumpQueued: false,
    throwQueued: false,
    throwHeld: false,
    utilityQueued: false,
    utilityHeld: false,
    shieldQueued: false,
    shieldHeld: false,
    deathQueued: false,
    down: false,
  }
}

function getSpriteLayout(sprite) {
  return (
    SPRITE_LAYOUTS.get(sprite) ?? {
      width: PLAYER_VISUAL.idleHeight,
      height: PLAYER_VISUAL.idleHeight,
      footAnchorX: PLAYER_VISUAL.idleHeight / 2,
    }
  )
}

function getDeathFrameIndex(deathTimer) {
  let elapsed = 0

  for (let index = 0; index < DEATH.frameDurations.length; index += 1) {
    elapsed += DEATH.frameDurations[index]

    if (deathTimer < elapsed) {
      return index
    }
  }

  return DEATH_FRAMES.length - 1
}

function getDeathDuration() {
  return DEATH.frameDurations.reduce((total, duration) => total + duration, 0)
}

function chooseSprite(player) {
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

  if (player.throwTimer > 0) {
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

function describeAnimation(player) {
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

function createPizza(player) {
  const direction = player.facing < 0 ? -1 : 1
  const handX =
    direction > 0
      ? player.x + PLAYER.width / 2 + THROW.handOffsetX
      : player.x + PLAYER.width / 2 - THROW.handOffsetX - PIZZA.width

  return {
    id: crypto.randomUUID?.() ?? `${performance.now()}-${Math.random()}`,
    x: handX,
    y: player.y + THROW.handOffsetY,
    vx: PIZZA.speed * direction,
    vy: -80,
    damage: PIZZA.damage,
    direction,
    bounces: 0,
    active: true,
  }
}

function createGas(player) {
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

function createBottle(player) {
  const direction = player.facing < 0 ? -1 : 1
  const x =
    direction > 0
      ? player.x + PLAYER.width / 2 + BOTTLE.handOffsetX
      : player.x + PLAYER.width / 2 - BOTTLE.handOffsetX - BOTTLE.width

  return {
    id: crypto.randomUUID?.() ?? `${performance.now()}-${Math.random()}`,
    type: 'bottle',
    image: bottleIcon,
    x,
    y: player.y + BOTTLE.handOffsetY,
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

function createEnemyBall(enemy, player) {
  const playerCenterX = player.x + PLAYER.width / 2
  const playerCenterY = player.y + PLAYER.height * 0.42
  const initialDirection = playerCenterX >= enemy.x + ENEMY.width / 2 ? 1 : -1
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
  const shotDirection = dx >= 0 ? 1 : -1
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

function createDocMinion(enemy, player) {
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

function getPizzaHitbox(pizza) {
  return {
    x: pizza.x + (PIZZA.width - PIZZA.hitboxWidth) / 2,
    y: pizza.y + (PIZZA.height - PIZZA.hitboxHeight) / 2,
    width: PIZZA.hitboxWidth,
    height: PIZZA.hitboxHeight,
  }
}

function getUtilityProjectileHitbox(projectile) {
  return {
    x: projectile.x + (projectile.width - projectile.hitboxWidth) / 2,
    y: projectile.y + (projectile.height - projectile.hitboxHeight) / 2,
    width: projectile.hitboxWidth,
    height: projectile.hitboxHeight,
  }
}

function getEnemyProjectileHitbox(projectile) {
  return {
    x: projectile.x + (projectile.width - projectile.hitboxWidth) / 2,
    y: projectile.y + (projectile.height - projectile.hitboxHeight) / 2,
    width: projectile.hitboxWidth,
    height: projectile.hitboxHeight,
  }
}

function getEnemyHitbox(enemy) {
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

function getDocMinionHitbox(minion) {
  return {
    x: minion.x + (DOC_MINION.width - DOC_MINION.hitboxWidth) / 2,
    y: minion.y + DOC_MINION.height - DOC_MINION.hitboxHeight,
    width: DOC_MINION.hitboxWidth,
    height: DOC_MINION.hitboxHeight,
  }
}

function getPlayerHitbox(player) {
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

function resolvePlayerEnemyCollision(player, enemy) {
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

function applyBossPushToPlayer(player, push, enemy) {
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

function isEnemyVulnerable(enemy) {
  return (
    enemy.active &&
    enemy.entered &&
    !['walking', 'talking', 'celebrating_walk', 'celebrating_talk', 'dying', 'dead'].includes(
      enemy.mode,
    )
  )
}

function applyEnemyProjectileHits(enemy, pizzas, utilityProjectiles) {
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

function stepPizzas(pizzas, deltaTime) {
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

function stepUtilityProjectiles(projectiles, deltaTime) {
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

function stepEnemyProjectiles(projectiles, deltaTime) {
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

function applyEnemyProjectilesToPlayer(player, projectiles) {
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

function shouldDocMinionsRun(enemy) {
  return (
    isEnemyVulnerable(enemy) &&
    enemy.health > 0 &&
    enemy.health <= ENEMY.health * DOC_MINION.activationHealthRatio
  )
}

function stepDocMinions(system, minions, enemy, player, deltaTime) {
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

function applyDocMinionsToPlayer(player, minions) {
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

function toBossThreatProjectiles(pizzas, utilityProjectiles) {
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

function chooseEnemyCombatSprite(enemy) {
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

function stepEnemy(enemy, player, deltaTime, playerProjectiles, updateBossAI) {
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

function startDeath(player) {
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

function triggerPlayerHurt(player) {
  if (player.dying || player.invulnerable) {
    return
  }

  player.hurtTimer = HURT.duration

  if (player.pushTimer <= 0) {
    player.sprite = attacked
  }
}

function easeOutCubic(progress) {
  return 1 - (1 - progress) ** 3
}

function tickPlayerRecoveryTimers(player, timerDt) {
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

function toPlayerStepResult(
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

function stepPushedPlayer(player, timerDt, resetProjectiles) {
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

function stepPlayer(player, keys, deltaTime) {
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
  const wantsCrouch = keys.down && player.onGround && !actionLocked
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
    !actionLocked
  ) {
    player.brakeTimer = PHYSICS.brakeDuration
  }

  if (input !== 0) {
    player.vx += input * PHYSICS.acceleration * dt
    player.facing = input
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

  player.hadInput = rawInput !== 0
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

function toSceneState(player) {
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

function getCamera(player) {
  const targetX = player.x + PLAYER.width / 2 - SCENE.width * 0.22
  const targetY = player.y + PLAYER.height - floorSurfaceY

  return {
    x: clamp(targetX, 0, WORLD.width - SCENE.width),
    y: clamp(targetY, -118, 80),
  }
}

export function OfficeScene() {
  const viewportRef = useRef(null)
  const bossAI = useBossAI()
  const initialPlayer = createInitialPlayer()
  const initialEnemy = createInitialEnemy()
  const keysRef = useRef(createEmptyKeys())
  const isPausedRef = useRef(false)

  const playerRef = useRef(initialPlayer)
  const enemyRef = useRef(initialEnemy)
  const pizzasRef = useRef([])
  const utilityProjectilesRef = useRef([])
  const enemyProjectilesRef = useRef([])
  const docMinionsRef = useRef([])
  const docMinionSystemRef = useRef(createInitialDocMinionSystem())
  const [sceneFit, setSceneFit] = useState({
    scale: 1,
    alignLeft: false,
  })
  const [sceneState, setSceneState] = useState(() => toSceneState(initialPlayer))
  const [pizzas, setPizzas] = useState([])
  const [utilityProjectiles, setUtilityProjectiles] = useState([])
  const [enemyProjectiles, setEnemyProjectiles] = useState([])
  const [docMinions, setDocMinions] = useState([])
  const [enemyState, setEnemyState] = useState(initialEnemy)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isIntroOpen, setIsIntroOpen] = useState(true)
  const [activeMenuPanel, setActiveMenuPanel] = useState('main')
  const [showHitboxes, setShowHitboxes] = useState(true)
  const [reducedMenuMotion, setReducedMenuMotion] = useState(false)
  const currentSpriteLayout = getSpriteLayout(sceneState.sprite)
  const currentSpriteFacesLeft = sceneState.sprite === push1
  const currentSpriteShouldFlip = currentSpriteFacesLeft
    ? sceneState.facing > 0
    : sceneState.facing < 0
  const currentFootAnchorX =
    currentSpriteShouldFlip
      ? currentSpriteLayout.width - currentSpriteLayout.footAnchorX
      : currentSpriteLayout.footAnchorX
  const playerFootX = sceneState.x + PLAYER.width / 2
  const playerFootY = sceneState.y + PLAYER.height
  const visualHitboxTop = Math.max(
    sceneState.y,
    playerFootY - currentSpriteLayout.height + PLAYER_VISUAL.groundSink,
  )
  const visualHitboxHeight = playerFootY - visualHitboxTop
  const camera = getCamera(sceneState)
  const visibleHearts = Math.ceil(clamp(sceneState.health, 0, PLAYER.health))
  const utilityIsFlashing = sceneState.utilityPhase === 'flash'
  const utilityIsActive = sceneState.utilityPhase === 'active'

  const skipIntro = () => {
    keysRef.current = createEmptyKeys()
    setIsIntroOpen(false)
  }

  const openMenu = () => {
    if (isIntroOpen) {
      return
    }
    keysRef.current = createEmptyKeys()
    setActiveMenuPanel('main')
    setIsMenuOpen(true)
  }

  const closeMenu = () => {
    if (isIntroOpen) {
      skipIntro()
      return
    }
    keysRef.current = createEmptyKeys()
    setIsMenuOpen(false)
  }

  const resetGame = () => {
    const nextPlayer = createInitialPlayer()
    const nextEnemy = createInitialEnemy()
    keysRef.current = createEmptyKeys()
    playerRef.current = nextPlayer
    enemyRef.current = nextEnemy
    pizzasRef.current = []
    utilityProjectilesRef.current = []
    enemyProjectilesRef.current = []
    docMinionsRef.current = []
    docMinionSystemRef.current = createInitialDocMinionSystem()
    setSceneState(toSceneState(nextPlayer))
    setPizzas([])
    setUtilityProjectiles([])
    setEnemyProjectiles([])
    setDocMinions([])
    setEnemyState(nextEnemy)
    setActiveMenuPanel('main')
    setIsMenuOpen(false)
    setIsIntroOpen(true)
  }

  useEffect(() => {
    isPausedRef.current = isMenuOpen || isIntroOpen
  }, [isMenuOpen, isIntroOpen])

  useGameInput({
    keysRef,
    isPausedRef,
    onOpenMenu: openMenu,
    onCloseMenu: closeMenu,
  })

  const tick = (deltaTime) => {
    const playerStep = stepPlayer(playerRef.current, keysRef.current, deltaTime)
    let nextPizzas = playerStep.resetProjectiles
      ? []
      : stepPizzas([...pizzasRef.current, ...playerStep.thrownPizzas], deltaTime)
    let nextUtilityProjectiles = playerStep.resetProjectiles
      ? []
      : stepUtilityProjectiles(
          [
            ...utilityProjectilesRef.current,
            ...playerStep.thrownUtilityProjectiles,
          ],
          deltaTime,
        )
    const currentEnemy = enemyRef.current
    const enemyIsCelebrating = [
      'celebrating_walk',
      'celebrating_talk',
    ].includes(currentEnemy.mode)
    const enemyShouldCelebrate =
      playerStep.resetProjectiles &&
      currentEnemy.active &&
      currentEnemy.entered &&
      ![
        'walking',
        'talking',
        'celebrating_walk',
        'celebrating_talk',
        'dying',
        'dead',
      ].includes(currentEnemy.mode)

    if (enemyShouldCelebrate) {
      startEnemyCelebration(
        currentEnemy,
        playerStep.respawnDeathX ?? currentEnemy.x + ENEMY.width / 2,
      )
    }

    const shouldResetEnemy =
      playerStep.resetProjectiles && !enemyShouldCelebrate && !enemyIsCelebrating

    let nextEnemy = shouldResetEnemy
      ? createInitialEnemy()
      : stepEnemy(
          currentEnemy,
          playerRef.current,
          deltaTime,
          toBossThreatProjectiles(nextPizzas, nextUtilityProjectiles),
          bossAI.updateBossAI,
        )
    const hitResult = applyEnemyProjectileHits(
      nextEnemy,
      nextPizzas,
      nextUtilityProjectiles,
    )

    nextEnemy = hitResult.enemy
    nextPizzas = hitResult.pizzas
    nextUtilityProjectiles = hitResult.utilityProjectiles

    if (nextEnemy.shouldResetGame) {
      resetGame()
      return
    }

    let nextDocMinions =
      playerStep.resetProjectiles || !shouldDocMinionsRun(nextEnemy)
        ? []
        : stepDocMinions(
            docMinionSystemRef.current,
            docMinionsRef.current,
            nextEnemy,
            playerRef.current,
            deltaTime,
          )

    if (playerStep.resetProjectiles || !shouldDocMinionsRun(nextEnemy)) {
      docMinionSystemRef.current = createInitialDocMinionSystem()
    }

    nextDocMinions = applyDocMinionsToPlayer(
      playerRef.current,
      nextDocMinions,
    )

    let nextEnemyProjectiles = playerStep.resetProjectiles
      ? []
      : stepEnemyProjectiles(
          [
            ...enemyProjectilesRef.current,
            ...(nextEnemy.thrownEnemyProjectiles ?? []),
          ],
          deltaTime,
        )

    nextEnemyProjectiles = applyEnemyProjectilesToPlayer(
      playerRef.current,
      nextEnemyProjectiles,
    )

    resolvePlayerEnemyCollision(playerRef.current, nextEnemy)
    applyBossPushToPlayer(playerRef.current, nextEnemy.pendingPush, nextEnemy)

    if (nextEnemy.justDefeated) {
      playerRef.current.speechText = MARIO_ENEMY_DEFEAT_TEXT
      playerRef.current.speechTimer = MARIO_ENEMY_DEFEAT_SPEECH_TIME
      nextEnemy.justDefeated = false
    }

    enemyRef.current = nextEnemy
    pizzasRef.current = nextPizzas
    utilityProjectilesRef.current = nextUtilityProjectiles
    enemyProjectilesRef.current = nextEnemyProjectiles
    docMinionsRef.current = nextDocMinions

    startTransition(() => {
      setSceneState(toSceneState(playerRef.current))
      setEnemyState(nextEnemy)
      setPizzas(nextPizzas)
      setUtilityProjectiles(nextUtilityProjectiles)
      setEnemyProjectiles(nextEnemyProjectiles)
      setDocMinions(nextDocMinions)
    })
  }

  useEffect(() => {
    const viewport = viewportRef.current

    if (!viewport) {
      return undefined
    }

    const syncScale = () => {
      const widthScale = viewport.clientWidth / SCENE.width
      const heightScale = viewport.clientHeight / SCENE.height
      const isNarrow = viewport.clientWidth < 720
      const scale = Math.max(widthScale, heightScale)

      setSceneFit({
        scale,
        alignLeft: isNarrow,
      })
    }

    syncScale()

    const observer = new ResizeObserver(() => {
      syncScale()
    })

    observer.observe(viewport)

    return () => {
      observer.disconnect()
    }
  }, [])

  useGameLoop({
    isPausedRef,
    onTick: tick,
  })

  return (
    <section className="game-card">
      <div
        ref={viewportRef}
        className={`game-scene ${isMenuOpen ? 'menu-is-open' : ''} ${
          isIntroOpen ? 'intro-is-open' : ''
        } ${reducedMenuMotion ? 'menu-motion-reduced' : ''} ${
          utilityIsFlashing ? 'utility-flash-active' : ''
        } ${utilityIsActive ? 'utility-is-active' : ''}`}
      >
        <div
          className="game-world"
          style={{
            width: `${SCENE.width}px`,
            height: `${SCENE.height}px`,
            left: sceneFit.alignLeft ? '0' : '50%',
            transformOrigin: sceneFit.alignLeft ? 'left center' : 'center center',
            transform: sceneFit.alignLeft
              ? `translateY(-50%) scale(${sceneFit.scale})`
              : `translate(-50%, -50%) scale(${sceneFit.scale})`,
          }}
        >
          <div
            className={`parallax-layer ${PARALLAX_LAYERS[0].className}`}
            aria-hidden="true"
            style={{
              '--layer-image': `url(${PARALLAX_LAYERS[0].image})`,
              '--layer-size': PARALLAX_LAYERS[0].size,
              transform: `translate3d(${-camera.x * PARALLAX_LAYERS[0].depth}px, ${
                -camera.y * PARALLAX_LAYERS[0].verticalDepth
              }px, 0)`,
            }}
          />

          <div
            className={`parallax-layer ${PARALLAX_LAYERS[1].className}`}
            aria-hidden="true"
            style={{
              '--layer-image': `url(${PARALLAX_LAYERS[1].image})`,
              '--layer-size': PARALLAX_LAYERS[1].size,
              transform: `translate3d(${-camera.x * PARALLAX_LAYERS[1].depth}px, ${
                -camera.y * PARALLAX_LAYERS[1].verticalDepth
              }px, 0)`,
            }}
          />

          <div
            className="world-entities"
            style={{
              width: `${WORLD.width}px`,
              height: `${SCENE.height}px`,
              transform: `translate3d(${-camera.x}px, ${-camera.y}px, 0)`,
            }}
          >
            {FLOOR_SEGMENTS.map((segment) => (
              <div
                key={`${segment.x}-${segment.width}`}
                className="floor-segment"
                style={{
                  left: `${segment.x}px`,
                  top: `${FLOOR.y}px`,
                  width: `${segment.width}px`,
                  height: `${FLOOR.height}px`,
                }}
              >
                <img src={floorTile} alt="Piso de oficina" draggable="false" />
              </div>
            ))}

            {showHitboxes ? (
              <div
                className="player-hitbox"
                aria-hidden="true"
                style={{
                  left: `${sceneState.x}px`,
                  top: `${visualHitboxTop}px`,
                  width: `${PLAYER.width}px`,
                  height: `${visualHitboxHeight}px`,
                }}
              />
            ) : null}

            {pizzas.map((pizza) => {
              const hitbox = getPizzaHitbox(pizza)

              return (
                <div key={pizza.id}>
                  {showHitboxes ? (
                    <div
                      className="pizza-hitbox"
                      aria-hidden="true"
                      style={{
                        left: `${hitbox.x}px`,
                        top: `${hitbox.y}px`,
                        width: `${hitbox.width}px`,
                        height: `${hitbox.height}px`,
                      }}
                    />
                  ) : null}

                  <div
                    className={`pizza-sprite ${
                      pizza.direction < 0 ? 'face-left' : 'face-right'
                    }`}
                    style={{
                      left: `${pizza.x}px`,
                      top: `${pizza.y}px`,
                      width: `${PIZZA.width}px`,
                      height: `${PIZZA.height}px`,
                    }}
                  >
                    <img src={thrownPizza} alt="Pizza lanzada" draggable="false" />
                  </div>
                </div>
              )
            })}

            {utilityProjectiles.map((projectile) => {
              const hitbox = getUtilityProjectileHitbox(projectile)

              return (
                <div key={projectile.id}>
                  {showHitboxes ? (
                    <div
                      className={`utility-hitbox utility-hitbox-${projectile.type}`}
                      aria-hidden="true"
                      style={{
                        left: `${hitbox.x}px`,
                        top: `${hitbox.y}px`,
                        width: `${hitbox.width}px`,
                        height: `${hitbox.height}px`,
                      }}
                    />
                  ) : null}

                  <div
                    className={`utility-projectile utility-projectile-${projectile.type} ${
                      projectile.direction < 0 ? 'face-left' : 'face-right'
                    }`}
                    style={{
                      left: `${projectile.x}px`,
                      top: `${projectile.y}px`,
                      width: `${projectile.width}px`,
                      height: `${projectile.height}px`,
                    }}
                  >
                    <img
                      src={projectile.image}
                      alt=""
                      draggable="false"
                    />
                  </div>
                </div>
              )
            })}

            {enemyProjectiles.map((projectile) => {
              const hitbox = getEnemyProjectileHitbox(projectile)

              return (
                <div key={projectile.id}>
                  {showHitboxes ? (
                    <div
                      className="enemy-projectile-hitbox"
                      aria-hidden="true"
                      style={{
                        left: `${hitbox.x}px`,
                        top: `${hitbox.y}px`,
                        width: `${hitbox.width}px`,
                        height: `${hitbox.height}px`,
                      }}
                    />
                  ) : null}

                  <div
                    className={`enemy-projectile ${
                      projectile.direction < 0 ? 'face-left' : 'face-right'
                    }`}
                    style={{
                      left: `${projectile.x}px`,
                      top: `${projectile.y}px`,
                      width: `${projectile.width}px`,
                      height: `${projectile.height}px`,
                    }}
                  >
                    <img src={projectile.image} alt="" draggable="false" />
                  </div>
                </div>
              )
            })}

            {docMinions.map((minion) => {
              const hitbox = getDocMinionHitbox(minion)
              const frameIndex =
                Math.floor(minion.frameClock / DOC_MINION.frameTime) %
                DOC_MINION_RUN_FRAMES.length

              return (
                <div key={minion.id}>
                  {showHitboxes ? (
                    <div
                      className="doc-minion-hitbox"
                      aria-hidden="true"
                      style={{
                        left: `${hitbox.x}px`,
                        top: `${hitbox.y}px`,
                        width: `${hitbox.width}px`,
                        height: `${hitbox.height}px`,
                      }}
                    />
                  ) : null}

                  <div
                    className={`doc-minion-sprite ${
                      minion.direction < 0 ? 'face-left' : 'face-right'
                    }`}
                    style={{
                      left: `${minion.x}px`,
                      top: `${minion.y}px`,
                      width: `${DOC_MINION.width}px`,
                      height: `${DOC_MINION.height}px`,
                    }}
                  >
                    <img
                      src={DOC_MINION_RUN_FRAMES[frameIndex]}
                      alt=""
                      draggable="false"
                    />
                  </div>
                </div>
              )
            })}

            {enemyState.active ? (
              <div>
                {showHitboxes ? (
                  <div
                    className="enemy-hitbox"
                    aria-hidden="true"
                    style={{
                      left: `${getEnemyHitbox(enemyState).x}px`,
                      top: `${getEnemyHitbox(enemyState).y}px`,
                      width: `${getEnemyHitbox(enemyState).width}px`,
                      height: `${getEnemyHitbox(enemyState).height}px`,
                    }}
                  />
                ) : null}

                <SpeechBubble
                  text={
                    enemyState.mode === 'talking' ||
                    enemyState.mode === 'celebrating_talk'
                      ? enemyState.speechText
                      : ''
                  }
                  x={enemyState.x + ENEMY.width / 2}
                  y={enemyState.y - 112}
                  showCaret
                  charsPerSecond={ENEMY.talkCharsPerSecond}
                />

                <div
                  className={`enemy-sprite ${
                    enemyState.facing < 0 ? 'face-left' : 'face-right'
                  }`}
                  style={{
                    left: `${enemyState.x}px`,
                    top: `${enemyState.y}px`,
                    width: `${ENEMY.width}px`,
                    height: `${ENEMY.height}px`,
                  }}
                >
                  <img src={enemyState.sprite} alt="Enemigo documento" draggable="false" />
                </div>
              </div>
            ) : null}

            <SpeechBubble
              text={sceneState.speechText}
              x={sceneState.x + PLAYER.width / 2}
              y={playerFootY - currentSpriteLayout.height - 92}
              className="player-speech"
              charsPerSecond={ENEMY.talkCharsPerSecond}
            />

            <div
              className={`player-sprite ${
                currentSpriteShouldFlip ? 'face-left' : 'face-right'
              } ${utilityIsActive ? 'utility-aura' : ''}`}
              style={{
                left: `${playerFootX - currentFootAnchorX}px`,
                top: `${playerFootY - currentSpriteLayout.height + PLAYER_VISUAL.groundSink}px`,
                width: `${currentSpriteLayout.width}px`,
                height: `${currentSpriteLayout.height}px`,
              }}
            >
              <img src={sceneState.sprite} alt="Mario" draggable="false" />
            </div>
          </div>

          <GameHud
            playerHealth={visibleHearts}
            maxHealth={PLAYER.health}
            pizzaAmmo={sceneState.pizzaAmmo}
            utilityCharges={sceneState.utilityCharges}
            maxUtilityCharges={UTILITY.maxCharges}
            enemy={enemyState}
            maxEnemyHealth={ENEMY.health}
            heartIcon={heartIcon}
            pizzaIcon={pizzaIcon}
            utilityIcon={bottleIcon}
            onOpenMenu={openMenu}
          />
        </div>

        <div className="utility-flash-screen" aria-hidden="true" />

        <PauseMenu
          isOpen={isMenuOpen}
          activePanel={activeMenuPanel}
          showHitboxes={showHitboxes}
          reducedMotion={reducedMenuMotion}
          onClose={closeMenu}
          onReset={resetGame}
          onSetPanel={setActiveMenuPanel}
          onSetShowHitboxes={setShowHitboxes}
          onSetReducedMotion={setReducedMenuMotion}
        />

        <IntroVideoOverlay
          src={introVideo}
          isOpen={isIntroOpen}
          onSkip={skipIntro}
        />
      </div>
    </section>
  )
}




