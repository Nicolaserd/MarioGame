# Mario en busca del dato perdido - Handoff

## Resumen

Proyecto de juego 2D en **React + Vite**.

Estado actual:

- Escena a pantalla completa con fondo de oficina en parallax.
- Mundo ancho con camara horizontal que sigue a Mario.
- Un segmento de suelo principal definido en `FLOOR_SEGMENTS`.
- Personaje con gravedad, movimiento horizontal, salto, freno al aterrizar y respawn por caida.
- Estados visuales: `idle`, `correr`, `saltar`, `caer`, `freno`, `lanzar` y `agachado`.
- HUD con vida y municion de pizzas.
- La vida de Mario se muestra como 5 corazones; `visibleHearts` se calcula desde `sceneState.health`, asi que dano `1` quita 1 corazon, dano `2` quita 2, etc.
- Sistema de util activado con `G`, cargas por botellas y gas.
- Enemigo documento con 100 de vida, entrada caminando y barra de vida.
- Menu de pausa con blur sobre el juego, animaciones, controles, ajustes y reinicio.
- Favicon personalizado con la cara de Mario.
- Titulo del documento: `Mario en busca del dato perdido`.

## Stack

- React 19
- Vite
- CSS plano
- Gameplay centralizado principalmente en `src/components/GameScene.jsx`

## Comandos

Instalacion:

```bash
npm install
```

Desarrollo:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

## Controles actuales

- `A` o `ArrowLeft`: mover a la izquierda.
- `D` o `ArrowRight`: mover a la derecha.
- `Space`, `W` o `ArrowUp`: saltar.
- `S` o `ArrowDown`: agacharse.
- `P`: lanzar pizza, o botella durante la parte post-gas de la util.
- `G`: activar la util si hay una botella disponible.
- `O`: activar escudo durante 3 segundos, con cooldown de 9 segundos.
- `M`: forzar muerte del personaje.
- `Escape`: abrir o cerrar el menu de pausa.
- Click en el boton de menu: pausa el juego y abre el menu.

## Archivos importantes

- `index.html`
  - Usa `/mario-face.png` como favicon.
  - Define el titulo de la pestana.
- `package.json`
  - Nombre del proyecto: `mario-en-busca-del-dato-perdido`.
- `src/App.jsx`
  - Renderiza la escena del juego.
- `src/components/GameScene.jsx`
  - Logica principal del juego.
  - Fisica, input, estados de animacion, camara, pizzas, pausa, menu, HUD y anclaje visual de sprites.
- `src/App.css`
  - Layout fullscreen, escena, HUD, hitboxes, menu de pausa y animaciones de menu.
- `src/index.css`
  - Reset y fondo global.
- `public/mario-face.png`
  - Favicon generado desde el sprite idle.

## Assets usados

### Originales

- `assets/Entorno/oficina/fondo.png`
- `assets/Entorno/oficina/fondo1.png`
- `assets/Entorno/oficina/piso.png`
- `assets/Mario/atributos/corazon.png`
- `assets/Mario/atributos/pizza.png`
- `assets/Mario/atributos/lanzar.png`
- `assets/Mario/atributos/pizzalanzada.png`
- `assets/Mario/atributos/Botellas.png`
- `assets/Mario/ide/idle1.png`
- `assets/Mario/ide/idle2.png`
- `assets/Mario/ide/freno.png`
- `assets/Mario/correr/correr1.png`
- `assets/Mario/correr/correr2.png`
- `assets/Mario/correr/correr3.png`
- `assets/Mario/saltar/saltar.png`
- `assets/Mario/caer/caer.png`
- `assets/Mario/agachar/agachar.png`
- `assets/Mario/marioutil/util1.png`
- `assets/Mario/marioutil/util2.png`
- `assets/Mario/marioutil/util3.png`
- `assets/Mario/marioutil/util4.png`
- `assets/Mario/marioutil/util5.png`
- `assets/Mario/marioutil/util6.png`
- `assets/Mario/marioutil/vomitoGas.png`
- `assets/Mario/morir/morir1.png`
- `assets/Mario/morir/morir2.png`
- `assets/Mario/morir/morir3.png`
- `assets/Mario/Escudo/escudo1.png`
- `assets/Mario/Escudo/escudo2.png`
- `assets/Mario/empujado/empuje1.png`
- `assets/Mario/empujado/empuje2.png`
- `assets/Mario/atacado/atacado.png`
- `assets/docuemenemigo/caminar/caminar.png`
- `assets/docuemenemigo/idle/idel_doc_2.png`
- `assets/docuemenemigo/hablar/hablar_doc.png`
- `assets/docuemenemigo/muerte de hoja/muerte_doc.png`
- `assets/docuemenemigo/saltar/salto_doc.png`
- `assets/docuemenemigo/agachar/agachar_doc.png`
- `assets/docuemenemigo/stuneado/stuneado_doc.png`
- `assets/docuemenemigo/atras/atras_doc.png`
- `assets/docuemenemigo/atacar/tirar_doc.png`
- `assets/docuemenemigo/atacar/bola_doc.png`

### Procesados

El juego usa versiones recortadas para Mario:

- `assets/processed/idle1-crop.png`
- `assets/processed/idle2-crop.png`
- `assets/processed/freno-crop.png`
- `assets/processed/correr1-crop.png`
- `assets/processed/correr2-crop.png`
- `assets/processed/correr3-crop.png`
- `assets/processed/saltar-crop.png`
- `assets/processed/caer-crop.png`
- `assets/processed/agachar-crop.png`
- `assets/processed/util1-crop.png`
- `assets/processed/util2-crop.png`
- `assets/processed/util3-crop.png`
- `assets/processed/util4-crop.png`
- `assets/processed/util5-crop.png`
- `assets/processed/util6-crop.png`
- `assets/processed/vomitoGas-crop.png`
- `assets/processed/Botellas-crop.png`
- `assets/processed/morir1-crop.png`
- `assets/processed/morir2-crop.png`
- `assets/processed/morir3-crop.png`
- `assets/processed/escudo1-crop.png`
- `assets/processed/escudo2-crop.png`
- `assets/processed/empuje1-crop.png`
- `assets/processed/empuje2-crop.png`
- `assets/processed/atacado-crop.png`
- `assets/processed/docuemenemigo-caminar1-crop.png`
- `assets/processed/docuemenemigo-caminar2-crop.png`
- `assets/processed/docuemenemigo-idle2-crop.png`
- `assets/processed/docuemenemigo-hablar1-crop.png`
- `assets/processed/docuemenemigo-hablar2-crop.png`
- `assets/processed/docuemenemigo-muerte1-crop.png`
- `assets/processed/docuemenemigo-muerte2-crop.png`
- `assets/processed/docuemenemigo-muerte3-crop.png`
- `assets/processed/docuemenemigo-muerte4-crop.png`
- `assets/processed/docuemenemigo-saltar-crop.png`
- `assets/processed/docuemenemigo-agachar-crop.png`
- `assets/processed/docuemenemigo-stuneado-crop.png`
- `assets/processed/docuemenemigo-atras-crop.png`
- `assets/processed/docuemenemigo-tirar-crop.png`
- `assets/processed/docuemenemigo-bola-crop.png`

Tambien existe `assets/processed/bloque1-crop.png`, pero el suelo actual usa `assets/Entorno/oficina/piso.png`.

## Nota importante sobre sprites

Los PNG originales no venian como sprites compactos clasicos; varias imagenes tienen mucho margen o fondo.

Por eso:

- El juego usa sprites `*-crop.png` para las poses principales de Mario.
- `GameScene.jsx` mantiene metricas manuales en `SPRITE_METRICS`.
- `SPRITE_LAYOUTS` escala cada sprite y conserva el anclaje por pie (`footAnchorX`).
- El render calcula `currentFootAnchorX`, `playerFootX` y `playerFootY` para que la base del personaje no salte entre estados.
- `agachar-crop.png` tiene `visualHeight` especial: se renderiza al `60%` de la altura idle mediante `PLAYER_VISUAL.crouchHeightRatio = 0.6`.
- Los sprites `util1` a `util6` tambien usan metricas en `SPRITE_METRICS` y se animan con `ANIMATION.utilityFrameTime`.

Si se agrega o reemplaza una pose, actualizar `SPRITE_METRICS` y revisar el anclaje de pie.

## Logica actual del personaje

Todo esta centralizado en `src/components/GameScene.jsx`.

### Estados visuales

- `Idle`
- `Corriendo`
- `Saltando`
- `Cayendo`
- `Frenando`
- `Lanzando`
- `Agachado`
- `Muriendo`
- `Escudo`

### Reglas principales

- Si `throwTimer > 0`: usa `lanzar`.
- Si `dying` es true: usa `morir1`, `morir2`, `morir3`.
- Si `shieldTimer > 0`: usa `escudo1` rapidamente y luego `escudo2` hasta terminar el escudo.
- Si la util esta activa antes del gas: usa `util1` a `util6`.
- Despues de lanzar el gas sigue en util durante 10 segundos, pero vuelve a estados normales y puede lanzar botellas con `P`.
- Si esta en el aire y sube: usa `saltar`.
- Si esta en el aire y baja: usa `caer`.
- Si esta en freno: usa `freno`.
- Si esta en suelo y `S`/`ArrowDown` esta presionada: usa `agachar`.
- Si corre en suelo: usa frames de `correr`.
- Si no hay otra accion: usa frames de `idle`.
- Mientras esta agachado, el input horizontal se ignora y no puede saltar hasta soltar abajo.
- Durante el flash y la animacion previa al gas, Mario queda quieto e invulnerable (`player.invulnerable = true`).
- Justo despues de lanzar el gas, Mario deja de ser invulnerable y puede volver a moverse, saltar, correr o agacharse.
- Si se presiona `M` o `health <= 0`, se inicia la muerte: bloquea controles, reproduce `morir1`, `morir2`, `morir3` lento, `morir3` dura un poco mas y sube unos pixeles antes del reinicio.
- Si se presiona `O` y no esta en cooldown, el escudo dura 3 segundos, bloquea correr/saltar y evita dano.

### Fisica

Constantes principales en `PHYSICS`:

- `gravity`
- `acceleration`
- `friction`
- `maxSpeed`
- `jumpVelocity`
- `brakeDuration`
- `landingBrakeDuration`
- `brakeTriggerSpeed`
- `runThreshold`
- `airStateThreshold`

La colision contra piso se resuelve con:

- `FLOOR`
- `FLOOR_SEGMENTS`
- `floorSurfaceY`
- `getFloorSegmentAtFoot`
- `standingOnGround`

### Hitboxes

- Las hitboxes visibles se pueden activar o desactivar desde `Ajustes` en el menu de pausa.
- El hitbox visible de Mario se calcula desde el sprite actual, no desde una caja fija completa.
- Al correr, saltar, caer o agacharse, el rectangulo azul sigue la altura visual renderizada.
- Las pizzas tienen hitbox propio con `PIZZA.hitboxWidth` y `PIZZA.hitboxHeight`.
- El gas de la util tiene hitbox verde y `damage: 5`.
- Las botellas de la util tienen hitbox rosa y `damage: 2`.
- Esos hitboxes son reales para colisionar contra el enemigo documento.

## HUD y menu

HUD:

- Vida con `heartIcon`.
- Municion con `pizzaIcon`.
- Boton de menu a la izquierda del HUD.

Menu de pausa:

- Al abrirse, pausa el loop del juego.
- Resetea las teclas presionadas para evitar movimiento pegado al cerrar.
- Aplica blur, saturacion y oscurecimiento al mundo.
- Tiene animacion de entrada/salida.
- Opciones:
  - `Continuar`
  - `Como jugar`
  - `Ajustes`
  - `Reiniciar`
- Ajustes actuales:
  - Mostrar/ocultar hitboxes.
  - Activar/desactivar animacion suave del menu.

## Pizzas

- `P` lanza una pizza si hay municion y no hay cooldown.
- Cada pizza lanzada lleva `damage: 1`.
- Las pizzas usan `getPizzaHitbox` para golpear al enemigo y desaparecen al impactar.
- La pizza tiene gravedad propia, rebota una vez contra el suelo y luego desaparece.
- La municion se regenera con `PIZZA.regenTime`.

## Util

- Se activa con `G` si hay al menos 1 carga de botella.
- Maximo de cargas: `UTILITY.maxCharges = 2`.
- Cada carga se recupera en `UTILITY.chargeRegenTime = 120` segundos.
- La carga se descuenta al activar la util; desde ahi empieza a contar la recuperacion.
- Antes de la animacion hay 4 segundos de pantallazos blanco/rosa (`UTILITY.flashDuration = 4`).
- Despues entra en fase activa hasta lanzar el gas.
- Durante flash y fase activa previa al gas, Mario queda inmovil e invulnerable.
- La animacion lenta usa `util1` a `util6`.
- En `util6` se lanza una sola vez `vomitoGas`, desde altura de boca, con `damage: 5`.
- Justo despues de lanzar el gas, Mario pasa a `freno`, deja de ser inmune y vuelve a los estados normales.
- Despues del gas, la util sigue 10 segundos (`UTILITY.postGasDuration = 10`), mantiene los rayos y permite lanzar cualquier cantidad de botellas con `P`; cada botella tiene `damage: 2`.
- Gas y botellas usan `getUtilityProjectileHitbox` para golpear al enemigo y desaparecen al impactar.
- Durante esos 10 segundos post-gas Mario ya no esta bloqueado: puede correr, saltar, agacharse y recibir dano.
- Durante toda la fase activa Mario muestra rayos animados rosas y amarillos sin hitbox.
- Proyectiles de util se guardan en `utilityProjectiles` y se actualizan con `stepUtilityProjectiles`.

## Muerte

- Se fuerza con `M`.
- Tambien se dispara cuando `player.health <= 0`.
- Usa `DEATH.frameDurations` para reproducir `morir1`, `morir2` y `morir3` lento.
- `morir3` dura mas y al entrar en ese frame el personaje sube `DEATH.riseDistance` pixeles.
- Durante la muerte no hay control, no hay util, no hay lanzamiento y Mario queda quieto.
- Al terminar, se reinicia el jugador con `createInitialPlayer()`, se suma `deaths` y se limpian pizzas/proyectiles de util.

## Escudo

- Se activa con `O`.
- Dura maximo `SHIELD.duration = 3` segundos.
- Si el usuario suelta `O`, el escudo se desactiva de inmediato.
- Tiene cooldown de `SHIELD.cooldown = 9` segundos.
- Mientras esta activo, Mario queda inmune (`invulnerable = true`), quieto y no puede correr ni saltar.
- La animacion empieza rapido con `escudo1` (`SHIELD.introDuration`) y luego mantiene `escudo2`.
- Al terminar vuelve al estado normal que corresponda segun input/fisica.

## Enemigo documento

- Asset original: `assets/docuemenemigo/caminar/caminar.png`.
- El PNG contiene dos poses; se separaron en:
  - `assets/processed/docuemenemigo-caminar1-crop.png`
  - `assets/processed/docuemenemigo-caminar2-crop.png`
- Idle original:
  - `assets/docuemenemigo/idle/idel_doc_2.png`
- Idle procesado:
  - `assets/processed/docuemenemigo-idle2-crop.png`
- Hablar original:
  - `assets/docuemenemigo/hablar/hablar_doc.png`
- Hablar procesado:
  - `assets/processed/docuemenemigo-hablar1-crop.png`
  - `assets/processed/docuemenemigo-hablar2-crop.png`
- Muerte original:
  - `assets/docuemenemigo/muerte de hoja/muerte_doc.png`
- Muerte procesada:
  - `assets/processed/docuemenemigo-muerte1-crop.png`
  - `assets/processed/docuemenemigo-muerte2-crop.png`
  - `assets/processed/docuemenemigo-muerte3-crop.png`
  - `assets/processed/docuemenemigo-muerte4-crop.png`
- Los frames procesados de muerte estan reescalados contra el area visual del idle (`575x667`) para evitar que el documento se vea mas pequeno al morir.
- Acciones de combate procesadas y escaladas contra el idle:
  - `assets/processed/docuemenemigo-saltar-crop.png`
  - `assets/processed/docuemenemigo-agachar-crop.png`
  - `assets/processed/docuemenemigo-stuneado-crop.png`
  - `assets/processed/docuemenemigo-atras-crop.png`
  - `assets/processed/docuemenemigo-tirar-crop.png`
  - `assets/processed/docuemenemigo-bola-crop.png`
- Tiene `ENEMY.health = 100`.
- Se renderiza a `1.3x` la altura de Mario.
- Usa `ENEMY.groundSink` para bajarlo visualmente y que no parezca flotar.
- Su contenedor visual es amplio (`ENEMY.width = 350`) para que el idle conserve proporcion.
- Su hitbox real es mas angosto (`ENEMY.hitboxWidth = 210`) y centrado dentro del contenedor para quedar pegado al cuerpo.
- `.enemy-sprite img` se posiciona absoluto con `inset: 0`, `height: 100%`, `object-fit: contain` y `max-width: none`; sin esto el idle vertical usa su proporcion natural y puede salirse por abajo.
- Aparece a la derecha cuando Mario se mueve desde el spawn.
- Entra caminando hacia la izquierda alternando los dos frames y luego pasa a hablar.
- En modo hablar alterna suavemente `docuemenemigo-hablar1-crop.png` y `docuemenemigo-hablar2-crop.png`.
- Durante el habla muestra texto arriba con estilo `Courier New` y efecto maquina de escribir.
- Mientras habla no recibe dano; despues de hablar entra en FSM de combate y puede recibir dano en sus estados de pelea.
- Dos segundos despues de terminar el texto vuelve a idle.
- En idle usa solo `assets/processed/docuemenemigo-idle2-crop.png`, sin transicion ni alternancia.
- La IA de combate vive como hook React en `src/hooks/useBossAI.js` y se usa desde `GameScene` con `useBossAI()`.
- FSM del boss: `idle`, `chase`, `keep_distance`, `throw_attack`, `retreat`, `dodge`, `airborne`, `stunned`.
- Controla distancia: persigue si esta lejos, mantiene distancia optima y ataca con bolas de papel, retrocede o esquiva si Mario esta muy cerca.
- Esquiva con reaccion aleatoria: agacharse reduce el hitbox al 50%, saltar evita amenazas bajas y salto hacia atras sirve como escape.
- Si Mario se aproxima demasiado (`AI.closeActionDistance`), el boss decide con cooldown entre salto hacia atras largo o empujar a Mario.
- El salto hacia atras mantiene velocidad de escape hasta llegar a la distancia segura (`AI.closeEscapeTargetDistance`) y luego vuelve a `keep_distance`.
- El empujon se aplica en `applyBossPushToPlayer`: Mario se separa hasta `AI.shoveTargetDistance = 930`, que es 1.5x la distancia segura base.
- El empujon activa una animacion horizontal de `2s`: `empuje1-crop.png` durante el desplazamiento y `empuje2-crop.png` al detenerse; ambos usan la misma escala global que los frames de correr (`PLAYER_VISUAL_SCALE`) y despues vuelve al idle normal.
- Durante el empujon Mario queda pegado al piso (`floorSurfaceY - PLAYER.height`), sin impulso vertical.
- Cuando Mario recibe dano enemigo real, `triggerPlayerHurt` activa `atacado-crop.png` brevemente (`HURT.duration = 0.34`); no se activa si esta invulnerable y no pisa la animacion especial de empujon.
- Despues de escapar o empujar, el boss acorta un poco su cooldown/decision de ataque para poder lanzar proyectiles desde esa zona segura.
- El boss no esquiva siempre: `useBossAI` usa probabilidad, delay de reaccion y cooldown para que cometa errores.
- `tirar_doc` prepara el disparo y luego genera proyectil `docuemenemigo-bola-crop.png`.
- `docuemenemigo-tirar-crop.png` esta reescalado por el cuerpo del documento para que la figura interna coincida con el tamano del idle.
- Solo `docuemenemigo-tirar-crop.png` usa un lienzo mas ancho (`900x690`) para que el brazo extendido quede visible fuera del hitbox normal del cuerpo sin ampliar la colision del enemigo.
- Los proyectiles del boss usan `enemyProjectilesRef` / `enemyProjectiles`, tienen hitbox visible `.enemy-projectile-hitbox` y pueden quitar vida a Mario si no esta invulnerable.
- Cuando los proyectiles del boss hacen dano, restan `projectile.damage` directo a `player.health`; el HUD oculta los corazones vacios con `.heart-row img.heart-empty`.
- La bola del documento usa `ENEMY_BALL.hitboxWidth = 54` y `ENEMY_BALL.hitboxHeight = 54`, centrados sobre el sprite de `58x58`.
- El gas de la util puede poner al boss en `stunned`.
- Tiene hitbox visible cuando `showHitboxes` esta activo.
- El hitbox visible tambien es su hitbox real para recibir dano.
- Recibe dano de pizzas (`1`), gas (`5`) y botellas de util (`2`).
- Cuando su vida llega a `0`, entra en `mode = 'dying'`, reproduce los cuatro frames de muerte de izquierda a derecha con `ENEMY.deathFrameTime = 1.4` y luego desaparece (`active = false`, `defeated = true`).
- Al desaparecer, Mario muestra sobre su cabeza durante `8s`: `Ese documento no estaba bien formateado, hora de ir por unas pizzas`.
- Mario y el enemigo no pueden solaparse: `resolvePlayerEnemyCollision` separa los hitboxes horizontalmente y corta la velocidad de Mario.
- Su barra de vida aparece a la derecha del HUD, a la misma altura que el HUD de Mario.

## Arquitectura actual

- Un componente principal: `GameScene`.
- Estado de alta frecuencia en refs (`playerRef`, `keysRef`, `isPausedRef`).
- Estado visible en React (`sceneState`, `pizzas`, menu, ajustes).
- Proyectiles de util visibles en React (`utilityProjectiles`).
- Proyectiles del boss visibles en React (`enemyProjectiles`).
- `pizzasRef`, `utilityProjectilesRef` y `enemyProjectilesRef` son la fuente runtime para colisiones.
- Estado visible del enemigo (`enemyState`) con fuente en `enemyRef`.
- Loop con `requestAnimationFrame`.
- `startTransition` para actualizaciones visuales.
- Input por listeners globales de teclado.

## Decisiones importantes ya tomadas

- La escena ocupa toda la pantalla.
- El primer viewport es directamente el juego, sin landing page.
- El HUD se mantiene dentro de la escena escalada.
- El suelo actual es una plataforma grande.
- El personaje se ancla por pie para evitar saltos visuales entre sprites.
- El estado agachado mide 60% de la altura idle y su hitbox sigue esa escala.
- La util usa dos espacios de botellas debajo del marcador de municion; las cargas vacias se ven apagadas.
- Cuando se activa una util se descuenta una botella del HUD y se activa la regeneracion.

## Que revisar si otro agente continua

### Si va a tocar animaciones o sprites

Revisar:

- Imports de sprites al inicio de `GameScene.jsx`.
- `SPRITE_METRICS`
- `SPRITE_LAYOUTS`
- `getSpriteLayout`
- `chooseSprite`
- Calculo de `currentFootAnchorX`
- Calculo del hitbox visual cerca de `visualHitboxTop`

Si no se respeta el anclaje por pie, Mario puede deformarse o saltar de posicion entre poses.

### Si va a tocar fisica

Revisar:

- `stepPlayer`
- `standingOnGround`
- `jumpQueued`
- `keys.down`
- `keys.utilityQueued`
- `crouching`
- `utilityPhase`
- `invulnerable`
- `shieldTimer`
- `shieldCooldown`
- `landingBrakeDuration`
- `getCamera`

### Si va a agregar plataformas

La colision ya usa `FLOOR_SEGMENTS`, pero ahora solo hay un segmento enorme:

```js
const FLOOR_SEGMENTS = [
  { x: -120, width: WORLD.width + 240 },
]
```

Para multiples plataformas, conviene ampliar esa lista y resolver colisiones verticales con la plataforma mas cercana bajo el personaje.

### Si va a tocar menu/HUD

Revisar:

- Estados `isMenuOpen`, `activeMenuPanel`, `showHitboxes`, `reducedMenuMotion`.
- `openMenu`, `closeMenu`, `resetGame`.
- CSS de `.game-menu-button`, `.pause-overlay`, `.pause-menu` y `.menu-is-open`.

### Si va a tocar enemigos

Revisar:

- `ENEMY`
- `createInitialEnemy`
- `stepEnemy`
- `src/hooks/useBossAI.js`
- `applyBossPushToPlayer`
- `getEnemyHitbox`
- `getPlayerHitbox`
- `resolvePlayerEnemyCollision`
- `applyEnemyProjectileHits`
- `applyEnemyProjectilesToPlayer`
- `enemyRef` / `enemyState`
- Render de `.enemy-sprite`, `.enemy-hitbox`, `.enemy-projectile` y `.enemy-health-hud`

## Pendiente / posibles siguientes pasos

1. Ajustar balance de la IA del documento enemigo: dano, velocidad, cooldowns y probabilidades.
2. Agregar niveles, plataformas y objetivos.
3. Agregar collectibles o datos perdidos como objetivo del juego.
4. Mejorar colisiones para plataformas multiples.
5. Agregar sonido.
6. Agregar efectos o sonido a disparos, esquivas, stun y muerte del boss.

## Verificacion hecha recientemente

Se verifico:

- `npm run lint`
- `npm run build`
- Prueba visual en navegador del menu de pausa.
- Prueba visual del estado agachado manteniendo `S`.
- Prueba visual del favicon/titulo.
- Prueba visual de la util: `G`, flash, fase activa y gas.

## Observacion final

El `README.md` puede conservar contenido viejo de Vite y no debe tomarse como fuente principal de verdad.

Para continuar el proyecto, usar este archivo como contexto principal:

- `AGENT_HANDOFF.md`
