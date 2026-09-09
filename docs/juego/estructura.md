# Ubicacion de modulos

Consultar para ubicacion de modulos. Rutas relativas a la raiz; contrastar valores con el codigo.

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
- `src/game/characters/docMinion/docMinionAssets.js`: frames importados del esbirro doc.
- `src/game/characters/docMinion/docMinionConstants.js`: tamano, dano, velocidad, hitbox, spawn y timing del esbirro doc.
- `src/game/projectiles/projectileTypes.js`: configuraciones por tipo de proyectil (`PIZZA`, `GAS`, `BOTTLE`, `ENEMY_BALL`, etc.).
- `src/game/engine/useGameLoop.js`: loop generico con `requestAnimationFrame`; recibe `onTick` de la escena.
- `src/game/engine/useGameInput.js`: input global de teclado y pausa.
- `src/game/physics/collision.js`: utilidades generales `clamp` e `intersects`.
- `src/game/ui/GameHud.jsx`: HUD reusable.
- `src/game/ui/PauseMenu.jsx`: menu de pausa reusable.
- `src/game/ui/SpeechBubble.jsx`: viñeta reutilizable de conversacion con caret opcional y efecto maquina de escribir letra por letra.
- `src/game/ui/IntroVideoOverlay.jsx`: overlay reutilizable que reproduce un video de intro, con boton `Skip` en la esquina superior derecha y boton `Iniciar intro` cuando el navegador bloquea el autoplay con audio.
- `src/hooks/useBossAI.js`: FSM/IA del documento enemigo.
- `src/App.css`: estilos de escena, sprites, HUD, hitboxes, menu, efectos de util y responsive.
- `src/index.css`: reset global y fondo base.
- `README.md`: resumen publico del proyecto, estado actual, comandos, controles, modularizacion y limpieza realizada.
- `AGENT_HANDOFF.md`: indice de referencias tecnicas en `docs/juego/`; las reglas estan en `reglas/`.
- Limpieza reciente: tambien se eliminaron artefactos no usados de plantilla/generados (`src/assets/*`, `public/favicon.svg`, `public/icons.svg`, `image/AGENT_HANDOFF/`, `output/playwright/`, `.playwright-cli/`, `.playwright-mcp/`). No recrearlos salvo que vuelvan a tener uso real.
