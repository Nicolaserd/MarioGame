# Mario en busca del dato perdido - Agent handoff

## Estado actual

Juego 2D hecho con React + Vite. La pantalla principal es directamente el juego: una escena de oficina con parallax, mundo horizontal ancho, Mario controlable, HUD, menu de pausa, proyectiles, util, escudo y un boss documento con IA propia.

La fuente principal de verdad ahora es `src/game/scenes/office/OfficeScene.jsx`. `src/App.jsx` importa esa escena directamente. La IA del boss vive separada en `src/hooks/useBossAI.js`.

## Stack y comandos

- React 19.
- Vite 8.
- CSS plano.
- JavaScript con modulos ESM.

Comandos:

```bash
npm install
npm run dev
npm run build
npm run lint
npm run preview
```

Validacion reciente:

- `npm run lint` pasa.
- `npm run build` pasa.

## Estructura principal

- `index.html`: titulo y favicon de la app.
- `src/main.jsx`: monta React en `#root` con `StrictMode`.
- `src/App.jsx`: renderiza `OfficeScene` dentro de `.app-shell`.
- `src/game/scenes/office/OfficeScene.jsx`: escena actual de oficina; coordina gameplay, estado runtime, personajes, proyectiles, colisiones y render.
- `src/game/scenes/office/officeConstants.js`: constantes de escena (`SCENE`, `WORLD`, `FLOOR`, `FLOOR_SEGMENTS`, `SPAWN`, `floorSurfaceY`).
- `src/game/scenes/office/officeAssets.js`: fondos y piso de la oficina.
- `src/game/characters/mario/marioAssets.js`: assets importados de Mario y su HUD.
- `src/game/characters/mario/marioConstants.js`: dimensiones, vida, fisica, timers y constantes visuales de Mario.
- `src/game/characters/corruptDocument/corruptDocumentAssets.js`: assets importados del documento corrupto.
- `src/game/characters/corruptDocument/corruptDocumentConstants.js`: dimensiones, vida, texto, timing y constantes base del documento corrupto.
- `src/game/projectiles/projectileTypes.js`: configuraciones por tipo de proyectil (`PIZZA`, `GAS`, `BOTTLE`, `ENEMY_BALL`, etc.).
- `src/game/engine/useGameLoop.js`: loop generico con `requestAnimationFrame`; recibe `onTick` de la escena.
- `src/game/engine/useGameInput.js`: input global de teclado y pausa.
- `src/game/physics/collision.js`: utilidades generales `clamp` e `intersects`.
- `src/game/ui/GameHud.jsx`: HUD reusable.
- `src/game/ui/PauseMenu.jsx`: menu de pausa reusable.
- `src/game/ui/SpeechBubble.jsx`: viñeta reutilizable de conversacion con caret opcional y efecto maquina de escribir letra por letra.
- `src/hooks/useBossAI.js`: FSM/IA del documento enemigo.
- `src/App.css`: estilos de escena, sprites, HUD, hitboxes, menu, efectos de util y responsive.
- `src/index.css`: reset global y fondo base.
- `README.md`: resumen publico del proyecto, estado actual, comandos, controles, modularizacion y limpieza realizada.
- `AGENT_HANDOFF.md`: documento raiz de referencia funcional y arquitectonica con reglas detalladas para programar cambios nuevos. El `README.md` viejo de plantilla Vite fue eliminado y reemplazado por un resumen real del proyecto.
- Limpieza reciente: tambien se eliminaron artefactos no usados de plantilla/generados (`src/assets/*`, `public/favicon.svg`, `public/icons.svg`, `image/AGENT_HANDOFF/`, `output/playwright/`, `.playwright-cli/`, `.playwright-mcp/`). No recrearlos salvo que vuelvan a tener uso real.

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

## Controles

- `A` o `ArrowLeft`: mover izquierda.
- `D` o `ArrowRight`: mover derecha.
- `W`, `Space` o `ArrowUp`: saltar.
- `S` o `ArrowDown`: agacharse.
- `P`: lanzar pizza; durante la fase post-gas de la util lanza botellas.
- `G`: activar la util si hay carga disponible.
- `O`: activar escudo mientras se mantiene presionado.
- `M`: forzar muerte de Mario.
- `Escape`: abrir/cerrar menu de pausa.
- Boton hamburguesa: abre el menu de pausa.

El menu limpia `keysRef.current` al abrir/cerrar para evitar inputs pegados.

## Arquitectura runtime

`OfficeScene` usa refs para el estado de alta frecuencia y estado React para pintar:

- Refs runtime: `playerRef`, `enemyRef`, `keysRef`, `isPausedRef`, `pizzasRef`, `utilityProjectilesRef`, `enemyProjectilesRef`.
- Estado visible React: `sceneState`, `enemyState`, `pizzas`, `utilityProjectiles`, `enemyProjectiles`, menu y ajustes.
- Loop con `requestAnimationFrame` mediante `useGameLoop({ isPausedRef, onTick })`; cada escena puede pasar su propio `tick`.
- Actualizaciones visuales dentro de `startTransition`.
- Input por listeners globales `keydown`/`keyup` mediante `useGameInput`.

`resetGame()` reinicia jugador, enemigo, proyectiles, teclas, menu y estados visibles.

## Reglas obligatorias de modularizacion

Estas reglas se deben seguir si o si para cualquier cambio nuevo:

- No recrear `src/components/GameScene.jsx` ni meter logica ahi; la escena actual vive en `src/game/scenes/office/OfficeScene.jsx`.
- Toda escena nueva debe vivir en `src/game/scenes/<nombreEscena>/` con sus propios assets, constantes y componente principal.
- Todo personaje nuevo debe tener carpeta propia en `src/game/characters/<nombrePersonaje>/` para assets, constantes y comportamiento propio.
- Los componentes reutilizables de UI deben ir en `src/game/ui/`; no duplicar HUD, menu, viñetas o overlays dentro de una escena.
- La animacion de texto letra por letra pertenece a `SpeechBubble`; las escenas deben pasar el texto completo y no recortarlo con `slice` para simular escritura.
- Las configuraciones de proyectiles deben vivir en `src/game/projectiles/projectileTypes.js` o en modulos dentro de `src/game/projectiles/`; no hardcodear velocidades/dano/gravedad en JSX si se pueden declarar por tipo.
- La escena coordina reglas de colision entre personajes/proyectiles, pero debe reutilizar utilidades generales de `src/game/physics/` cuando existan.
- El loop debe seguir siendo generico mediante `useGameLoop`; cada escena pasa su propio `tick`.
- El input global debe pasar por `useGameInput`, salvo que una escena tenga una razon fuerte para un input especial.
- Antes de crear codigo nuevo, revisar si ya existe un modulo reusable o una regla planeada que coincida con lo que se quiere aplicar.
- Antes de aplicar DRY, comparar si la logica nueva se puede reutilizar sin forzarla y si coincide con la arquitectura planeada: responsabilidades compatibles, datos adaptables, efectos esperados y una razon de cambio razonablemente cercana.
- Aplicar DRY cuando se pueda usar/reutilizar bien y coincida con lo planeado, aunque no sea identico; adaptar mediante parametros o configuraciones por tipo si eso mantiene claridad.
- Si una logica se repite dos veces o mas y puede reutilizarse de forma limpia, extraerla a un modulo, helper, componente o configuracion compartida.
- No crear abstracciones gigantes que borren diferencias importantes: pizzas, gas, botellas y bolas del boss pueden compartir motor, pero conservar configuraciones/comportamientos por tipo.
- Si se mueve logica, mantener primero compatibilidad y verificar con `npm run lint` y `npm run build`.

## Estado del jugador

`createInitialPlayer()` crea el estado base:

- Posicion inicial sobre el piso.
- Velocidades `vx/vy` en `0`.
- `facing: 1`.
- Timers de freno, lanzamiento, util, escudo, muerte, speech, empujon y dano en `0`.
- `utilityCharges: 2`.
- `health: 5`.
- `pizzaAmmo: 5`.
- `sprite: idle1`.

`deaths` existe en el estado, pero actualmente no se muestra en HUD y tras el flujo actual de muerte se reinicia con `createInitialPlayer()`; no tratarlo como contador persistente.

## Movimiento y fisica de Mario

Constantes en `PHYSICS`:

- Gravedad: `1950`.
- Aceleracion: `1200`.
- Friccion: `1400`.
- Velocidad maxima: `300`.
- Salto: `760`.
- Freno: `brakeDuration 0.38`, `landingBrakeDuration 0.32`.
- Umbrales: `brakeTriggerSpeed 110`, `runThreshold 60`, `airStateThreshold 45`.

Reglas importantes:

- El jugador acelera con izquierda/derecha y se frena por friccion.
- El salto solo ocurre en piso y si no esta bloqueado por estados especiales.
- Agachado ignora input horizontal y no permite saltar hasta soltar abajo.
- Si cae por debajo de `WORLD.killY`, vuelve al spawn con freno de aterrizaje.
- El piso se resuelve con `FLOOR_SEGMENTS`, `getFloorSegmentAtFoot` y `standingOnGround`.
- La camara sigue a Mario con `getCamera` y se limita al mundo.

## Sprites y anclaje visual

Los sprites de Mario usan recortes procesados (`assets/processed/*-crop.png`) y metricas manuales en `SPRITE_METRICS`.

Puntos criticos:

- `SPRITE_LAYOUTS` escala cada pose usando `PLAYER_VISUAL_SCALE`.
- El render usa `footAnchorX`, `playerFootX` y `playerFootY` para que los pies no salten entre animaciones.
- `agachar-crop.png` tiene `visualHeight` especial con `PLAYER_VISUAL.crouchHeightRatio = 0.6`.
- Si se agrega/reemplaza una pose, actualizar `SPRITE_METRICS` y probar el anclaje del pie.
- El hitbox visible de Mario se calcula desde el layout del sprite actual, no desde la altura completa fija.

Estados visuales de Mario, en prioridad aproximada dentro de `chooseSprite`:

- `Muriendo`: `morir1`, `morir2`, `morir3`.
- `Empujado`: `empuje1`, `empuje2`.
- `Atacado`: `atacado`.
- `Escudo`: `escudo1`, luego `escudo2`.
- Util activa antes del gas: `util1` a `util6`.
- Lanzando: `lanzar`.
- Aire subiendo: `saltar`.
- Aire bajando: `caer`.
- Freno: `freno`.
- Agachado: `agachar`.
- Corriendo: `correr1`, `correr2`, `correr3`.
- Idle: `idle1`, `idle2`.

## Muerte y reinicio

La muerte se inicia si:

- Se presiona `M`.
- `player.health <= 0`.

Flujo actual:

- `startDeath(player)` bloquea acciones, limpia timers de util/lanzamiento/escudo/empujon/dano y deja a Mario quieto.
- `DEATH.frameDurations` reproduce `morir1`, `morir2`, `morir3` lento.
- Al entrar al ultimo frame, Mario sube `DEATH.riseDistance` pixeles.
- Al terminar la animacion, Mario vuelve a `createInitialPlayer()` con freno de aterrizaje.
- Se limpian pizzas, proyectiles de util y proyectiles enemigos mediante `resetProjectiles`.
- Si el boss estaba activo, ya habia entrado y estaba en combate, no se reinicia inmediatamente: se llama `startEnemyCelebration`.
- La celebracion del boss usa `celebrating_walk` hacia la posicion donde murio Mario y luego `celebrating_talk` con el texto `Soy el exploid supremo padre!`.
- Al terminar el texto y el hold de celebracion, `enemy.shouldResetGame = true` y el loop llama `resetGame()`.
- Si el boss no estaba en condiciones de celebrar, el enemigo se reinicia directamente.

Esta parte es sensible: no cambiar `resetProjectiles`, `enemyIsCelebrating`, `enemyShouldCelebrate` o `shouldResetGame` sin probar el flujo completo de muerte.

## Vida, dano y estado atacado

- La vida de Mario se muestra con 5 corazones.
- `visibleHearts = Math.ceil(clamp(sceneState.health, 0, PLAYER.health))`.
- Los proyectiles enemigos restan `projectile.damage`; la bola del documento hace `1`.
- `triggerPlayerHurt` muestra `atacado-crop.png` durante `HURT.duration = 0.34`.
- Si Mario esta invulnerable, no recibe dano ni se pisa la animacion especial.

## Escudo

- Se activa con `O` si `shieldCooldown <= 0`.
- Dura como maximo `SHIELD.duration = 3` segundos.
- Si se suelta `O`, termina antes.
- Cooldown: `9` segundos.
- Mientras esta activo, Mario queda quieto e invulnerable.
- Visual: `escudo1` durante `SHIELD.introDuration = 0.22`, luego `escudo2`.

## Pizzas

Constantes principales:

- `PIZZA.damage = 1`.
- `PIZZA.speed = 720`.
- `PIZZA.gravity = 220`.
- `PIZZA.maxBounces = 1`.
- `PIZZA.regenTime = 5`.

Reglas:

- `P` lanza pizza si hay ammo y cooldown disponible.
- Cada pizza desaparece al impactar contra el boss.
- Rebota una vez contra el piso y luego desaparece.
- La municion se regenera con timer propio.
- Hitbox real por `getPizzaHitbox`.

## Util

Constantes principales:

- `UTILITY.maxCharges = 2`.
- `UTILITY.chargeRegenTime = 120`.
- `UTILITY.flashDuration = 4`.
- `UTILITY.gasLaunchTime = 2.55`.
- `UTILITY.postGasDuration = 10`.
- `UTILITY.bottleCooldown = 0.38`.

Flujo:

- `G` consume una carga y entra en fase `flash`.
- Durante `flash` y la animacion previa al gas, Mario queda inmovil e invulnerable.
- Despues entra en `active`, anima `util1` a `util6` y lanza una vez `vomitoGas`.
- El gas hace `GAS.damage = 5`, viaja horizontalmente y puede stunear al boss con `stunBoss`.
- Tras lanzar el gas, Mario deja de ser invulnerable y vuelve a moverse.
- La fase activa sigue `10` segundos con aura/rayos; durante ese tiempo `P` lanza botellas.
- Cada botella hace `BOTTLE.damage = 2`.
- Gas y botellas usan `utilityProjectilesRef` y `utilityProjectiles`.

## Boss documento

El enemigo se crea en `createInitialEnemy()` con:

- Estado base de IA desde `createBossAIState()`.
- `active: false`, `entered: false`, `mode: 'waiting'`.
- Vida `100`.
- `facing: -1`.
- Sprite inicial `docuemenemigo-idle2-crop.png`.
- Flags de celebracion y reset (`celebrationTargetX`, `celebrationTalkTimer`, `shouldResetGame`).

Aparicion y fases:

- Aparece cuando Mario se mueve mas de `ENEMY.triggerDistance = 24` desde el spawn.
- Spawnea a la derecha usando `spawnDistance = 840` y camina hasta `stopDistance = 560`.
- Entra en `talking` y muestra el texto completo mediante `SpeechBubble`, que aplica el efecto maquina de escribir.
- Mientras camina/habla/celebra/muere no es vulnerable.
- Al terminar de hablar, entra a la FSM de combate.

IA en `useBossAI.js`:

- Estados: `idle`, `chase`, `keep_distance`, `throw_attack`, `retreat`, `dodge`, `airborne`, `stunned`.
- Mantiene distancia optima, persigue si esta lejos y retrocede si esta cerca.
- Lanza bolas de papel con preparacion y cooldown desde estados de suelo (`chase`, `keep_distance`, `retreat`), asi que puede disparar desde distintas distancias.
- La frecuencia de disparo es relativamente alta: `attackCooldownMin = 1.05`, `attackCooldownMax = 2`, `attackChance = 0.78`.
- Detecta amenazas entrantes y puede agacharse, saltar o saltar hacia atras.
- Usa azar, delay de reaccion y cooldown para no esquivar perfecto siempre.
- Si Mario esta demasiado cerca, puede hacer salto largo hacia atras o empujar a Mario.
- El gas de la util llama `stunBoss`, llevando al estado `stunned`.

Combate y colisiones:

- Hitbox real del boss: `getEnemyHitbox`.
- Si esta agachado o en `BOSS_STATES.DODGE`, el hitbox baja al 50% de altura.
- Recibe dano de pizzas, gas y botellas con `applyEnemyProjectileHits`.
- Al llegar a `health <= 0`, entra en `mode = 'dying'`, reproduce 4 frames de muerte y luego queda `active = false`, `defeated = true`, `mode = 'dead'`.
- Al derrotarlo, Mario muestra por `8s`: `Ese documento no estaba bien formateado, hora de ir por unas pizzas`.
- `resolvePlayerEnemyCollision` evita que Mario y el boss se solapen.
- `applyBossPushToPlayer` ejecuta el empujon del boss sobre Mario.

Proyectiles del boss:

- Sprite: `docuemenemigo-bola-crop.png`.
- Tamano `29 x 29`, hitbox `27 x 27` (50% del tamano anterior).
- Dano `1`.
- Velocidad horizontal inicial `315`.
- Apuntan hacia una posicion anticipada de Mario usando su posicion y velocidad (`aimLeadFactor = 0.58`).
- Tienen 30% de probabilidad de fallar el apuntado (`aimMissChance = 0.3`) con desvio aleatorio en X/Y.
- Usan gravedad `720`, rebotan contra el piso hasta `3` veces y pierden velocidad horizontal en cada rebote.
- Lifetime `4.6` segundos.
- Se guardan en `enemyProjectilesRef` y `enemyProjectiles`.

## HUD, menu y ajustes

HUD:

- Corazones: `heartIcon`.
- Pizzas disponibles: `pizzaIcon`.
- Cargas de util: `bottleIcon` procesado.
- Barra de vida del boss aparece si `enemyState.active`.
- El boton de menu esta dentro de la escena escalada.

Menu de pausa:

- `Continuar`.
- `Como jugar`.
- `Ajustes`.
- `Reiniciar`.

Ajustes:

- Mostrar/ocultar hitboxes. Nota: `showHitboxes` inicia en `true` actualmente.
- Activar/desactivar animacion suave del menu.

Al abrir el menu:

- `isPausedRef.current = true`.
- Se limpian teclas.
- Se aplica blur/saturacion/oscuridad al mundo.

## Assets realmente importados por el juego

Entorno:

- `assets/Entorno/oficina/fondo.png`.
- `assets/Entorno/oficina/fondo1.png`.
- `assets/Entorno/oficina/piso.png`.

HUD/proyectiles originales:

- `assets/Mario/atributos/corazon.png`.
- `assets/Mario/atributos/pizza.png`.
- `assets/Mario/atributos/lanzar.png`.
- `assets/Mario/atributos/pizzalanzada.png`.

Mario procesado:

- `assets/processed/idle1-crop.png`.
- `assets/processed/idle2-crop.png`.
- `assets/processed/freno-crop.png`.
- `assets/processed/correr1-crop.png`.
- `assets/processed/correr2-crop.png`.
- `assets/processed/correr3-crop.png`.
- `assets/processed/saltar-crop.png`.
- `assets/processed/caer-crop.png`.
- `assets/processed/agachar-crop.png`.
- `assets/processed/morir1-crop.png`.
- `assets/processed/morir2-crop.png`.
- `assets/processed/morir3-crop.png`.
- `assets/processed/escudo1-crop.png`.
- `assets/processed/escudo2-crop.png`.
- `assets/processed/empuje1-crop.png`.
- `assets/processed/empuje2-crop.png`.
- `assets/processed/atacado-crop.png`.
- `assets/processed/util1-crop.png` a `util6-crop.png`.
- `assets/processed/vomitoGas-crop.png`.
- `assets/processed/Botellas-crop.png`.

Boss procesado:

- `assets/processed/docuemenemigo-caminar1-crop.png`.
- `assets/processed/docuemenemigo-caminar2-crop.png`.
- `assets/processed/docuemenemigo-idle2-crop.png`.
- `assets/processed/docuemenemigo-hablar1-crop.png`.
- `assets/processed/docuemenemigo-hablar2-crop.png`.
- `assets/processed/docuemenemigo-muerte1-crop.png` a `docuemenemigo-muerte4-crop.png`.
- `assets/processed/docuemenemigo-saltar-crop.png`.
- `assets/processed/docuemenemigo-agachar-crop.png`.
- `assets/processed/docuemenemigo-stuneado-crop.png`.
- `assets/processed/docuemenemigo-tirar-crop.png`.
- `assets/processed/docuemenemigo-bola-crop.png`.

Existen mas assets originales/procesados en el repo (`fondo2`, `personas`, `bloque1`, `docuemenemigo-idle1-crop`, `docuemenemigo-atras-crop`, etc.), pero actualmente no estan importados por `OfficeScene.jsx`.

## CSS relevante

- `.game-scene`: pantalla completa, fondo base oscuro y overlay de color.
- `.game-world`: escena logica escalada; en mobile puede alinearse a la izquierda.
- `.parallax-layer`: fondos repetidos horizontalmente.
- `.world-entities`: capa donde se renderizan piso, personajes y proyectiles.
- `.player-sprite`, `.enemy-sprite`: render visual de personajes.
- `.player-hitbox`, `.enemy-hitbox`, `.pizza-hitbox`, `.utility-hitbox`, `.enemy-projectile-hitbox`: debug visual de colisiones.
- `.utility-flash-screen`: parpadeo de util.
- `.utility-aura`: rayos alrededor de Mario durante util activa.
- `.health-hud`, `.enemy-health-hud`: HUD.
- `.pause-overlay`, `.pause-menu`: menu de pausa.

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

## Pendientes razonables

1. Balancear IA del boss: cooldowns, dano, chances de esquiva y distancia optima.
2. Agregar sonido a salto, lanzamiento, dano, escudo, util, muerte y boss.
3. Agregar objetivo jugable: recolectables, niveles o final de escena.
4. Mejorar sistema de plataformas multiples.
5. Persistir estadisticas si se quiere usar `deaths` como contador real.
6. Pasar mas logica de `OfficeScene.jsx` a modulos si crece mas: comportamiento de Mario, comportamiento del boss, factories de proyectiles y render layers.

## Nota final

Usar este archivo como contexto principal del repo. Si hay duda, verificar contra `src/game/scenes/office/OfficeScene.jsx` y `src/hooks/useBossAI.js`, que son la fuente real del comportamiento actual.
