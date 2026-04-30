import {
  startTransition,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from 'react'
import groundBlock from '../../assets/processed/bloque1-crop.png'
import run1 from '../../assets/processed/correr1-crop.png'
import run2 from '../../assets/processed/correr2-crop.png'
import run3 from '../../assets/processed/correr3-crop.png'
import brake from '../../assets/processed/freno-crop.png'
import idle1 from '../../assets/processed/idle1-crop.png'
import idle2 from '../../assets/processed/idle2-crop.png'

const SCENE = {
  width: 960,
  height: 560,
}

const GROUND = {
  width: 760,
  height: 310,
  bottom: 26,
  surfaceInset: 34,
}

const PLAYER = {
  width: 176,
  height: 236,
}

const PLAYER_VISUAL = {
  idleHeight: 60,
  referenceHeight: 910,
}

const PHYSICS = {
  gravity: 1950,
  acceleration: 1200,
  friction: 1400,
  maxSpeed: 220,
  brakeDuration: 0.18,
  brakeTriggerSpeed: 110,
  runThreshold: 60,
}

const ANIMATION = {
  idleFrameTime: 0.5,
  runFrameTime: 0.11,
}

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
])

const IDLE_FRAMES = [idle1, idle2]
const RUN_FRAMES = [run1, run2, run3]
const PLAYER_VISUAL_SCALE =
  PLAYER_VISUAL.idleHeight / PLAYER_VISUAL.referenceHeight

const SPRITE_LAYOUTS = new Map(
  Array.from(SPRITE_METRICS.entries(), ([sprite, metrics]) => [
    sprite,
    {
      width: Number((metrics.width * PLAYER_VISUAL_SCALE).toFixed(2)),
      height: Number((metrics.height * PLAYER_VISUAL_SCALE).toFixed(2)),
      footAnchorX: Number((metrics.footAnchorX * PLAYER_VISUAL_SCALE).toFixed(2)),
    },
  ]),
)

const groundRect = {
  x: (SCENE.width - GROUND.width) / 2,
  y: SCENE.height - GROUND.height - GROUND.bottom,
  width: GROUND.width,
  height: GROUND.height,
}

const groundSurfaceY = groundRect.y + GROUND.surfaceInset

function createInitialPlayer() {
  return {
    x: groundRect.x + groundRect.width / 2 - PLAYER.width / 2,
    y: groundSurfaceY - PLAYER.height - 136,
    vx: 0,
    vy: 0,
    facing: 1,
    onGround: false,
    brakeTimer: 0,
    idleClock: 0,
    runClock: 0,
    hadInput: false,
    sprite: idle1,
  }
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
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

function chooseSprite(player) {
  if (!player.onGround) {
    return RUN_FRAMES[1]
  }

  if (player.brakeTimer > 0) {
    return brake
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
  if (!player.onGround) {
    return 'Cayendo'
  }

  if (player.brakeTimer > 0) {
    return 'Frenando'
  }

  if (Math.abs(player.vx) > PHYSICS.runThreshold) {
    return 'Corriendo'
  }

  return 'Idle'
}

function stepPlayer(player, keys, deltaTime) {
  const dt = Math.min(deltaTime, 1 / 30)
  const input = (keys.right ? 1 : 0) - (keys.left ? 1 : 0)
  const previousBottom = player.y + PLAYER.height
  const releasedMovement = player.hadInput && input === 0

  if (releasedMovement && Math.abs(player.vx) > PHYSICS.brakeTriggerSpeed) {
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

  player.x = clamp(player.x, 12, SCENE.width - PLAYER.width - 12)

  const currentBottom = player.y + PLAYER.height
  const playerFoot = player.x + PLAYER.width / 2
  const standingOnGround =
    player.vy >= 0 &&
    previousBottom <= groundSurfaceY &&
    currentBottom >= groundSurfaceY &&
    playerFoot >= groundRect.x + 28 &&
    playerFoot <= groundRect.x + groundRect.width - 28

  if (standingOnGround) {
    player.y = groundSurfaceY - PLAYER.height
    player.vy = 0
    player.onGround = true
  } else {
    player.onGround = false
  }

  if (player.y > SCENE.height + 240) {
    Object.assign(player, createInitialPlayer())
  }

  if (player.onGround && Math.abs(player.vx) > PHYSICS.runThreshold) {
    player.runClock += dt
    player.idleClock = 0
  } else if (player.onGround && player.brakeTimer <= 0) {
    player.idleClock += dt
    player.runClock = 0
  }

  player.brakeTimer = Math.max(0, player.brakeTimer - dt)
  player.hadInput = input !== 0
  player.sprite = chooseSprite(player)

  return {
    x: player.x,
    y: player.y,
    sprite: player.sprite,
    facing: player.facing,
    onGround: player.onGround,
    animation: describeAnimation(player),
    speed: Math.round(Math.abs(player.vx)),
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
  }
}

export function GameScene() {
  const viewportRef = useRef(null)
  const initialPlayer = createInitialPlayer()
  const keysRef = useRef({
    left: false,
    right: false,
  })

  const playerRef = useRef(initialPlayer)
  const [worldScale, setWorldScale] = useState(1)
  const [sceneState, setSceneState] = useState(() => toSceneState(initialPlayer))
  const currentSpriteLayout = getSpriteLayout(sceneState.sprite)
  const currentFootAnchorX =
    sceneState.facing < 0
      ? currentSpriteLayout.width - currentSpriteLayout.footAnchorX
      : currentSpriteLayout.footAnchorX
  const playerFootX = sceneState.x + PLAYER.width / 2
  const playerFootY = sceneState.y + PLAYER.height

  useEffect(() => {
    const onKeyChange = (pressed) => (event) => {
      if (event.repeat) {
        return
      }

      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') {
        keysRef.current.left = pressed
      }

      if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') {
        keysRef.current.right = pressed
      }
    }

    const handleKeyDown = onKeyChange(true)
    const handleKeyUp = onKeyChange(false)

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  const tick = useEffectEvent((deltaTime) => {
    stepPlayer(playerRef.current, keysRef.current, deltaTime)

    startTransition(() => {
      setSceneState(toSceneState(playerRef.current))
    })
  })

  useEffect(() => {
    const viewport = viewportRef.current

    if (!viewport) {
      return undefined
    }

    const syncScale = () => {
      const widthScale = viewport.clientWidth / SCENE.width
      const heightScale = viewport.clientHeight / SCENE.height
      setWorldScale(Math.min(widthScale, heightScale))
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

  useEffect(() => {
    let animationFrame = 0
    let previousTime = performance.now()

    const loop = (time) => {
      const deltaTime = (time - previousTime) / 1000
      previousTime = time
      tick(deltaTime)
      animationFrame = window.requestAnimationFrame(loop)
    }

    animationFrame = window.requestAnimationFrame(loop)

    return () => {
      window.cancelAnimationFrame(animationFrame)
    }
  }, [])

  return (
    <section className="game-card">
      <div
        ref={viewportRef}
        className="game-scene"
      >
        <div
          className="game-world"
          style={{
            width: `${SCENE.width}px`,
            height: `${SCENE.height}px`,
            transform: `translate(-50%, -50%) scale(${worldScale})`,
          }}
        >
          <div className="hud hud-left">
            <span>Movimiento</span>
            <strong>A / D o flechas</strong>
          </div>

          <div className="hud hud-right">
            <span>Estado</span>
            <strong>{sceneState.animation}</strong>
          </div>

          <div className="hud hud-bottom">
            <span>Velocidad</span>
            <strong>{sceneState.speed}</strong>
          </div>

          <div
            className="ground-platform"
            style={{
              left: `${groundRect.x}px`,
              top: `${groundRect.y}px`,
              width: `${groundRect.width}px`,
              height: `${groundRect.height}px`,
            }}
          >
            <img src={groundBlock} alt="Bloque de suelo" draggable="false" />
          </div>

          <div
            className={`player-sprite ${
              sceneState.facing < 0 ? 'face-left' : 'face-right'
            }`}
            style={{
              left: `${playerFootX - currentFootAnchorX}px`,
              top: `${playerFootY - currentSpriteLayout.height}px`,
              width: `${currentSpriteLayout.width}px`,
              height: `${currentSpriteLayout.height}px`,
            }}
          >
            <img src={sceneState.sprite} alt="Mario" draggable="false" />
          </div>
        </div>
      </div>
    </section>
  )
}
