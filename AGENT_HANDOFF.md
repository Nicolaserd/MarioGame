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
- Sistema de util activado con `G`, cargas por botellas y gas.
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

### Reglas principales

- Si `throwTimer > 0`: usa `lanzar`.
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
- Cada pizza lanzada lleva `damage: 1`; las colisiones futuras deben restar ese valor al objetivo impactado.
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
- Durante esos 10 segundos post-gas Mario ya no esta bloqueado: puede correr, saltar, agacharse y recibir dano.
- Durante toda la fase activa Mario muestra rayos animados rosas y amarillos sin hitbox.
- Proyectiles de util se guardan en `utilityProjectiles` y se actualizan con `stepUtilityProjectiles`.

## Arquitectura actual

- Un componente principal: `GameScene`.
- Estado de alta frecuencia en refs (`playerRef`, `keysRef`, `isPausedRef`).
- Estado visible en React (`sceneState`, `pizzas`, menu, ajustes).
- Proyectiles de util visibles en React (`utilityProjectiles`).
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

## Pendiente / posibles siguientes pasos

1. Agregar enemigos o dano real para usar el sistema de vida mas alla del HUD.
2. Agregar niveles, plataformas y objetivos.
3. Agregar collectibles o datos perdidos como objetivo del juego.
4. Mejorar colisiones para plataformas multiples.
5. Agregar sonido.
6. Pulir las colisiones de pizzas y gas con enemigos usando `damage`.

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
