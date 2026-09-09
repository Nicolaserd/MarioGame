import { startTransition, useEffect, useRef, useState } from 'react'
import { useBossAI } from '../../../hooks/useBossAI.js'
import { bottleIcon, heartIcon, pizzaIcon, push1, thrownPizza } from '../../characters/mario/marioAssets.js'
import { PLAYER, PLAYER_VISUAL } from '../../characters/mario/marioConstants.js'
import { ENEMY, MARIO_ENEMY_DEFEAT_SPEECH_TIME, MARIO_ENEMY_DEFEAT_TEXT } from '../../characters/corruptDocument/corruptDocumentConstants.js'
import { DOC_MINION_RUN_FRAMES } from '../../characters/docMinion/docMinionAssets.js'
import { DOC_MINION } from '../../characters/docMinion/docMinionConstants.js'
import { useGameLoop } from '../../engine/useGameLoop.js'
import { useGameInput } from '../../engine/useGameInput.js'
import { PIZZA, UTILITY } from '../../projectiles/projectileTypes.js'
import { clamp } from '../../physics/collision.js'
import { floorTile, introVideo } from './officeAssets.js'
import { FLOOR, FLOOR_SEGMENTS, SCENE, WORLD } from './officeConstants.js'
import { PARALLAX_LAYERS, getCamera } from './officeLayout.js'
import { createEmptyKeys } from '../../engine/inputState.js'
import { createInitialPlayer, stepPlayer, toSceneState } from './officePlayer.js'
import { createInitialEnemy, startEnemyCelebration, stepEnemy } from './officeEnemy.js'
import { createInitialDocMinionSystem, getDocMinionHitbox, shouldDocMinionsRun, stepDocMinions, applyDocMinionsToPlayer } from './officeMinions.js'
import { getPizzaHitbox, getUtilityProjectileHitbox, getEnemyProjectileHitbox, getEnemyHitbox, resolvePlayerEnemyCollision, applyBossPushToPlayer, applyEnemyProjectileHits, stepPizzas, stepUtilityProjectiles, stepEnemyProjectiles, applyEnemyProjectilesToPlayer, toBossThreatProjectiles } from './officeCombat.js'
import { GameHud } from '../../ui/GameHud.jsx'
import { IntroVideoOverlay } from '../../ui/IntroVideoOverlay.jsx'
import { PauseMenu } from '../../ui/PauseMenu.jsx'
import { SpeechBubble } from '../../ui/SpeechBubble.jsx'

export function OfficeScene({ onComplete }) {
  const completionTimer = useRef(0)
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
  const [showHitboxes, setShowHitboxes] = useState(false)
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
    isPausedRef.current = false
    setIsIntroOpen(false)
  }

  const openMenu = () => {
    if (isIntroOpen) {
      return
    }
    keysRef.current = createEmptyKeys()
    setActiveMenuPanel('main')
    setIsMenuOpen(true)
    isPausedRef.current = true
  }

  const closeMenu = () => {
    if (isIntroOpen) {
      skipIntro()
      return
    }
    keysRef.current = createEmptyKeys()
    setIsMenuOpen(false)
    isPausedRef.current = false
  }

  const resetGame = () => {
    completionTimer.current = 0
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
    isPausedRef.current = true
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
    if (enemyRef.current.defeated && onComplete) {
      completionTimer.current += Math.min(deltaTime, 0.05)
      if (completionTimer.current >= 6) onComplete()
      return
    }
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
      nextPizzas = []
      nextUtilityProjectiles = []
      nextEnemyProjectiles = []
      nextDocMinions = []
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
      const scale = Math.min(widthScale, heightScale)

      setSceneFit({
        scale,
        alignLeft: false,
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

        {enemyState.defeated && onComplete ? <div className="chapter-transition" role="status"><span>ROUND 01 · COMPLETADO</span><strong>Rival derrotado</strong><small>Siguiente destino: La Torre Dorada</small></div> : null}
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

import { getSpriteLayout } from '../../characters/mario/marioLayout.js'
