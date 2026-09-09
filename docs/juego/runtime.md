# Mundo y loop de juego

Consultar para mundo y loop de juego. Rutas relativas a la raiz; contrastar valores con el codigo.

## Constantes base del juego

En `src/game/scenes/office/officeConstants.js` y `OfficeScene.jsx`:

- `SCENE`: viewport logico de `960 x 560`.
- `WORLD.width`: `4200`.
- `WORLD.killY`: `900`.
- `FLOOR.y`: `460`.
- `FLOOR.surfaceInset`: `10`.
- `floorSurfaceY`: `FLOOR.y + FLOOR.surfaceInset`.
- `FLOOR_SEGMENTS`: actualmente una sola plataforma grande `{ x: -120, width: WORLD.width + 240 }`.
- `SPAWN.x`: `92`.
- `PLAYER`: `width 96`, `height 172`, `health 5`, `pizzaAmmo 5`.
- `ENEMY`: vida `100`, ancho visual `350`, alto `PLAYER.height * 1.3`, hitbox real `210 x ENEMY.height`.

## Arquitectura runtime

`OfficeScene` usa refs para el estado de alta frecuencia y estado React para pintar:

- Refs runtime: `playerRef`, `enemyRef`, `keysRef`, `isPausedRef`, `pizzasRef`, `utilityProjectilesRef`, `enemyProjectilesRef`.
- Estado visible React: `sceneState`, `enemyState`, `pizzas`, `utilityProjectiles`, `enemyProjectiles`, menu, intro y ajustes.
- `isIntroOpen` controla la visibilidad del intro; `isPausedRef.current = isMenuOpen || isIntroOpen` para que el loop quede pausado mientras el intro corre.
- El esbirro doc usa `docMinionsRef`, `docMinions` y `docMinionSystemRef` para spawns activados por vida del boss.
- Loop con `requestAnimationFrame` mediante `useGameLoop({ isPausedRef, onTick })`; cada escena puede pasar su propio `tick`.
- Actualizaciones visuales dentro de `startTransition`.
- Input por listeners globales `keydown`/`keyup` mediante `useGameInput`.

`resetGame()` reinicia jugador, enemigo, proyectiles, teclas, menu y estados visibles, y vuelve a setear `isIntroOpen = true` para mostrar el video de intro otra vez.
