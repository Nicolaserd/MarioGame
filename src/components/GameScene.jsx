import {
  startTransition,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from 'react'
import backLayer from '../../assets/Entorno/oficina/fondo.png'
import midLayer from '../../assets/Entorno/oficina/fondo1.png'
import floorTile from '../../assets/Entorno/oficina/piso.png'
import heartIcon from '../../assets/Mario/atributos/corazon.png'
import pizzaIcon from '../../assets/Mario/atributos/pizza.png'
import throwPose from '../../assets/Mario/atributos/lanzar.png'
import thrownPizza from '../../assets/Mario/atributos/pizzalanzada.png'
import fall from '../../assets/processed/caer-crop.png'
import run1 from '../../assets/processed/correr1-crop.png'
import run2 from '../../assets/processed/correr2-crop.png'
import run3 from '../../assets/processed/correr3-crop.png'
import brake from '../../assets/processed/freno-crop.png'
import idle1 from '../../assets/processed/idle1-crop.png'
import idle2 from '../../assets/processed/idle2-crop.png'
import jump from '../../assets/processed/saltar-crop.png'

const SCENE = {
  width: 960,
  height: 560,
}

const WORLD = {
  width: 4200,
  killY: 900,
}

const FLOOR = {
  y: 460,
  height: 136,
  surfaceInset: 10,
}

const FLOOR_SEGMENTS = [
  { x: -120, width: WORLD.width + 240 },
]

const SPAWN = {
  x: 92,
}

const floorSurfaceY = FLOOR.y + FLOOR.surfaceInset

const PLAYER = {
  width: 96,
  height: 172,
  health: 5,
  pizzaAmmo: 5,
}

const PLAYER_VISUAL = {
  idleHeight: 172,
  referenceHeight: 910,
  groundSink: 1,
}

const PHYSICS = {
  gravity: 1950,
  acceleration: 1200,
  friction: 1400,
  maxSpeed: 300,
  jumpVelocity: 760,
  brakeDuration: 0.38,
  landingBrakeDuration: 0.32,
  brakeTriggerSpeed: 110,
  runThreshold: 60,
  airStateThreshold: 45,
}

const THROW = {
  duration: 0.28,
  cooldown: 0.18,
  handOffsetX: 68,
  handOffsetY: 63,
}

const PIZZA = {
  width: 84,
  height: 56,
  hitboxWidth: 58,
  hitboxHeight: 20,
  speed: 720,
  gravity: 220,
  floorBounceVelocity: 260,
  maxBounces: 1,
  regenTime: 5,
}

const ANIMATION = {
  idleFrameTime: 0.5,
  runFrameTime: 0.11,
}

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
    hadInput: false,
    sprite: idle1,
    deaths: 0,
    health: PLAYER.health,
    pizzaAmmo: PLAYER.pizzaAmmo,
    pizzaRegenTimer: 0,
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
  if (player.throwTimer > 0) {
    return throwPose
  }

  if (!player.onGround) {
    return player.vy < -PHYSICS.airStateThreshold ? jump : fall
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
    direction,
    bounces: 0,
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

function stepPlayer(player, keys, deltaTime) {
  const dt = Math.min(deltaTime, 1 / 30)
  const input = (keys.right ? 1 : 0) - (keys.left ? 1 : 0)
  const thrownPizzas = []
  const wasOnGround = player.onGround
  const previousBottom = player.y + PLAYER.height
  const releasedMovement = player.hadInput && input === 0

  if (keys.jumpQueued && player.onGround) {
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
    player.pizzaAmmo > 0
  ) {
    player.pizzaAmmo -= 1
    player.throwTimer = THROW.duration
    player.throwCooldown = THROW.duration + THROW.cooldown
    player.brakeTimer = 0
    thrownPizzas.push(createPizza(player))
  }

  keys.throwQueued = false

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

  if (player.y > WORLD.killY) {
    const deaths = player.deaths + 1
    Object.assign(player, createInitialPlayer(), {
      deaths,
      brakeTimer: PHYSICS.landingBrakeDuration,
    })
  }

  if (player.onGround && Math.abs(player.vx) > PHYSICS.runThreshold) {
    player.runClock += dt
    player.idleClock = 0
  } else if (player.onGround && player.brakeTimer <= 0) {
    player.idleClock += dt
    player.runClock = 0
  }

  player.brakeTimer = Math.max(0, player.brakeTimer - dt)
  player.throwTimer = Math.max(0, player.throwTimer - dt)
  player.throwCooldown = Math.max(0, player.throwCooldown - dt)

  if (player.pizzaAmmo < PLAYER.pizzaAmmo) {
    player.pizzaRegenTimer += dt

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
    deaths: player.deaths,
    health: player.health,
    pizzaAmmo: player.pizzaAmmo,
    thrownPizzas,
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

export function GameScene() {
  const viewportRef = useRef(null)
  const initialPlayer = createInitialPlayer()
  const keysRef = useRef({
    left: false,
    right: false,
    jumpQueued: false,
    throwQueued: false,
    throwHeld: false,
  })

  const playerRef = useRef(initialPlayer)
  const [sceneFit, setSceneFit] = useState({
    scale: 1,
    alignLeft: false,
  })
  const [sceneState, setSceneState] = useState(() => toSceneState(initialPlayer))
  const [pizzas, setPizzas] = useState([])
  const currentSpriteLayout = getSpriteLayout(sceneState.sprite)
  const currentFootAnchorX =
    sceneState.facing < 0
      ? currentSpriteLayout.width - currentSpriteLayout.footAnchorX
      : currentSpriteLayout.footAnchorX
  const playerFootX = sceneState.x + PLAYER.width / 2
  const playerFootY = sceneState.y + PLAYER.height
  const camera = getCamera(sceneState)

  useEffect(() => {
    const onKeyChange = (pressed) => (event) => {
      const key = typeof event.key === 'string' ? event.key.toLowerCase() : ''
      const code = event.code

      if (key === 'p' || code === 'KeyP') {
        event.preventDefault()

        if (pressed && !keysRef.current.throwHeld) {
          keysRef.current.throwQueued = true
        }

        keysRef.current.throwHeld = pressed
        return
      }

      if (event.repeat) {
        return
      }

      if (
        event.key === 'ArrowLeft' ||
        event.code === 'ArrowLeft' ||
        key === 'a' ||
        event.code === 'KeyA'
      ) {
        keysRef.current.left = pressed
      }

      if (
        event.key === 'ArrowRight' ||
        event.code === 'ArrowRight' ||
        key === 'd' ||
        event.code === 'KeyD'
      ) {
        keysRef.current.right = pressed
      }

      if (
        pressed &&
        (event.key === ' ' ||
          event.code === 'Space' ||
          event.key === 'ArrowUp' ||
          event.code === 'ArrowUp' ||
          key === 'w' ||
          event.code === 'KeyW')
      ) {
        event.preventDefault()
        keysRef.current.jumpQueued = true
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
    const playerStep = stepPlayer(playerRef.current, keysRef.current, deltaTime)

    startTransition(() => {
      setSceneState(toSceneState(playerRef.current))
      setPizzas((currentPizzas) =>
        stepPizzas([...currentPizzas, ...playerStep.thrownPizzas], deltaTime),
      )
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

            <div
              className="player-hitbox"
              aria-hidden="true"
              style={{
                left: `${sceneState.x}px`,
                top: `${sceneState.y}px`,
                width: `${PLAYER.width}px`,
                height: `${PLAYER.height}px`,
              }}
            />

            {pizzas.map((pizza) => {
              const hitbox = getPizzaHitbox(pizza)

              return (
                <div key={pizza.id}>
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

            <div
              className={`player-sprite ${
                sceneState.facing < 0 ? 'face-left' : 'face-right'
              }`}
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

          <div className="health-hud" aria-label={`Vida ${sceneState.health} de 5`}>
            <div className="heart-row">
              {Array.from({ length: PLAYER.health }, (_, index) => (
                <img
                  key={index}
                  className={index < sceneState.health ? 'heart-full' : 'heart-empty'}
                  src={heartIcon}
                  alt=""
                  draggable="false"
                />
              ))}
            </div>

            <div
              className="pizza-ammo-row"
              aria-label={`Pizzas ${sceneState.pizzaAmmo} de 5`}
            >
              {Array.from({ length: sceneState.pizzaAmmo }, (_, index) => (
                <img
                  key={index}
                  className="pizza-full"
                  src={pizzaIcon}
                  alt=""
                  draggable="false"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
