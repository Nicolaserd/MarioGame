# MarioGame - Handoff

## Resumen

Proyecto base de juego 2D en **React + Vite**.

Estado actual:

- Escena a pantalla completa.
- Un bloque de suelo principal.
- Personaje con gravedad.
- Movimiento horizontal.
- Salto.
- Estados visuales de `idle`, `correr`, `saltar`, `caer` y `freno`.
- Al aterrizar desde el aire, el personaje pasa por `freno` antes de volver a `idle`.

## Stack

- React 19
- Vite
- CSS plano
- Un solo componente principal de gameplay por ahora

## Comandos

Instalación:

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

- `A` o `ArrowLeft`: mover a la izquierda
- `D` o `ArrowRight`: mover a la derecha
- `Space`, `W` o `ArrowUp`: saltar

## Archivos importantes

- `src/App.jsx`
  - Renderiza solo la escena del juego.
- `src/components/GameScene.jsx`
  - Lógica principal del juego.
  - Física, input, estados de animación, anclaje visual de sprites y loop.
- `src/App.css`
  - Layout fullscreen y estilo de la escena/HUD.
- `src/index.css`
  - Reset y fondo global.
- `.gitignore`
  - Ya ignora `node_modules`, `dist`, `.playwright-cli/` y `output/playwright/`.

## Assets usados

### Originales

- `assets/Entorno/Verde/bloque1.png`
- `assets/Mario/ide/idle1.png`
- `assets/Mario/ide/idle2.png`
- `assets/Mario/ide/freno.png`
- `assets/Mario/correr/correr1.png`
- `assets/Mario/correr/correr2.png`
- `assets/Mario/correr/correr3.png`
- `assets/Mario/saltar/saltar.png`
- `assets/Mario/caer/caer.png`

### Procesados

Se usan versiones recortadas en:

- `assets/processed/bloque1-crop.png`
- `assets/processed/idle1-crop.png`
- `assets/processed/idle2-crop.png`
- `assets/processed/freno-crop.png`
- `assets/processed/correr1-crop.png`
- `assets/processed/correr2-crop.png`
- `assets/processed/correr3-crop.png`
- `assets/processed/saltar-crop.png`
- `assets/processed/caer-crop.png`

## Nota importante sobre sprites

Los PNG originales no venían como sprites compactos clásicos; eran imágenes grandes con mucho margen transparente.

Por eso:

- se generaron versiones `*-crop.png`
- el juego usa esas versiones procesadas
- `GameScene.jsx` tiene métricas manuales por sprite para evitar deformaciones
- el render usa anclaje por pie para que la base del personaje no salte entre estados

## Lógica actual del personaje

Todo está centralizado en `src/components/GameScene.jsx`.

### Estados visuales

- `Idle`
- `Corriendo`
- `Saltando`
- `Cayendo`
- `Frenando`

### Reglas principales

- Si está en suelo y sin input fuerte: `idle`
- Si corre en suelo: `correr`
- Si sube con velocidad negativa: `saltar`
- Si baja en el aire: `caer`
- Si suelta movimiento o aterriza: `freno`

### Física

Actualmente existen estas constantes en `PHYSICS`:

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

### Ajustes visuales

En `PLAYER_VISUAL`:

- `idleHeight`
  - altura visual base del personaje
- `referenceHeight`
  - usada para escalar sprites proporcionalmente
- `groundSink`
  - baja visualmente el sprite unos píxeles para que no parezca flotando

## Arquitectura actual

La arquitectura todavía es simple:

- un componente `GameScene`
- estado derivado desde refs
- loop con `requestAnimationFrame`
- input por listeners globales de teclado
- `startTransition` para actualizar UI

Todavía no hay:

- motor de colisiones con múltiples plataformas
- cámara
- niveles
- enemigos
- collectibles
- sonido
- sistema de vidas

## Decisiones importantes ya tomadas

- La escena ocupa **toda la pantalla**.
- Se eliminó el texto superior explicativo.
- El HUD sigue visible dentro de la escena.
- El suelo actual es una sola plataforma grande.
- El personaje es pequeño respecto al escenario a propósito, siguiendo el ajuste pedido.

## Qué revisar si otro agente continúa

### Si va a tocar animaciones

Revisar:

- `SPRITE_METRICS`
- `SPRITE_LAYOUTS`
- `getSpriteLayout`
- cálculo de `currentFootAnchorX`

Si no se respeta eso, el personaje se deforma o “salta” de posición entre sprites.

### Si va a tocar físicas

Revisar:

- `stepPlayer`
- lógica de `standingOnGround`
- `jumpQueued`
- transición al aterrizaje con `landingBrakeDuration`

### Si va a agregar plataformas

Hoy la colisión está hecha solo contra un bloque principal:

- `groundRect`
- `groundSurfaceY`

Para múltiples plataformas, conviene refactorizar a una lista de colisionables y resolver el suelo más cercano por frame.

## Siguiente paso sugerido

El siguiente agente probablemente debería hacer una de estas cosas:

1. Agregar más plataformas y colisiones reales.
2. Hacer que la cámara siga al personaje.
3. Mejorar el movimiento aéreo.
4. Agregar límites de escenario y respawn más limpio.
5. Cambiar el HUD o quitarlo si ya no se necesita.

## Verificación ya hecha

Se verificó en navegador que funcionen:

- `idle`
- `correr`
- `saltar`
- `caer`
- aterrizaje en `freno`

También se comprobó:

- `npm run lint`
- `npm run build`

## Observación final

El `README.md` todavía conserva contenido viejo de Vite y no es la mejor fuente de verdad.

Para continuar el proyecto, usar este archivo como contexto principal:

- `AGENT_HANDOFF.md`
