# Referencia: verificacion

Consultar solo si la tarea afecta este tema. Las rutas entre backticks son relativas a la raiz del proyecto; contrastar constantes y estado documentado con el codigo.

## Zonas delicadas para futuros cambios

Si se toca animacion/sprites:

- Revisar `src/game/characters/mario/marioAssets.js`, `marioConstants.js`, `src/game/characters/corruptDocument/corruptDocumentAssets.js` y `corruptDocumentConstants.js`.
- Actualizar `SPRITE_METRICS`.
- Probar `currentFootAnchorX`, `playerFootX`, `playerFootY`.
- Probar hitbox visible con `showHitboxes`.

Si se toca fisica/plataformas:

- Revisar `stepPlayer`, `standingOnGround`, `getFloorSegmentAtFoot`, `FLOOR_SEGMENTS`, `getCamera`, `officeConstants.js` y `physics/collision.js`.
- Para multiples plataformas, no basta con sumar segmentos: conviene resolver colision vertical contra la plataforma mas cercana debajo del jugador.

Si se toca proyectiles:

- Revisar `src/game/projectiles/projectileTypes.js` para velocidades, gravedad, dano, rebotes y parametros de apuntado.
- La escena sigue coordinando colisiones entre proyectiles/personajes; el modulo de proyectiles no decide a quien golpea.

Si se toca muerte/reinicio:

- Revisar `startDeath`, `stepPlayer`, `resetProjectiles`, `startEnemyCelebration`, `enemyShouldCelebrate`, `enemyIsCelebrating`, `nextEnemy.shouldResetGame` y `resetGame`.
- Probar muerte con `M` antes y despues de que el boss entre en combate.

Si se toca el boss:

- Revisar `ENEMY`, `createInitialEnemy`, `stepEnemy`, `useBossAI.js`, `applyEnemyProjectileHits`, `applyEnemyProjectilesToPlayer`, `resolvePlayerEnemyCollision`, `applyBossPushToPlayer`.
- Cuidar que `stepEnemy` setea `enemy.thrownEnemyProjectiles = []` por frame.

Si se toca menu/HUD:

- Revisar `GameHud.jsx`, `PauseMenu.jsx`, `SpeechBubble.jsx`, `openMenu`, `closeMenu`, `resetGame`, `isPausedRef`, `activeMenuPanel`, `showHitboxes`, `reducedMenuMotion`.
- Probar teclado despues de cerrar menu.

Si se toca el intro video:

- Revisar `IntroVideoOverlay.jsx`, `isIntroOpen`, `skipIntro`, `closeMenu` (rutea `Escape` al skip), `openMenu` (queda bloqueado mientras el intro este abierto), `resetGame` (re-abre el intro), el `useEffect` que setea `isPausedRef.current = isMenuOpen || isIntroOpen` y la clase `intro-is-open` en `.game-scene`.
- No volver a poner `autoPlay` en el `<video>` ni un fallback `muted = true`: rompe el requisito de que el video suene siempre con audio.
- Probar primer load (autoplay bloqueado → boton `Iniciar intro` con video en blur), `Skip`, `Escape`, fin natural del video y reset desde el menu de pausa.

Volver al [indice del juego](../../AGENT_HANDOFF.md).
