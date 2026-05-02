# Mario en busca del dato perdido

Juego 2D hecho con React + Vite. La escena actual ocurre en una oficina con parallax, mundo horizontal, Mario controlable, HUD, menu de pausa, proyectiles, util, escudo y un boss llamado Documento Corrupto.

Este README resume el estado del proyecto. Para reglas completas de arquitectura, logica y handoff tecnico, revisar `AGENT_HANDOFF.md`.

## Estado Actual

- Pantalla principal: escena jugable de oficina.
- Personajes actuales: Mario, Documento Corrupto y Esbirro Doc.
- Arquitectura modular bajo `src/game/`.
- Loop de juego propio con `requestAnimationFrame`.
- Input global reutilizable.
- HUD, menu de pausa y vinetas de dialogo reutilizables.
- Sistema de proyectiles por configuracion.
- Boss con IA, estados, ataques, esquivas, stun, muerte y celebracion.
- Validacion actual: `npm run lint` y `npm run build` pasan.

## Comandos

```bash
npm install
npm run dev
npm run lint
npm run build
npm run preview
```

## Stack

- React 19.
- Vite 8.
- JavaScript ESM.
- CSS plano.

## Estructura Principal

- `src/App.jsx`: renderiza la escena actual.
- `src/main.jsx`: monta React.
- `src/game/scenes/office/OfficeScene.jsx`: escena principal de oficina.
- `src/game/scenes/office/officeConstants.js`: constantes del mundo, piso y spawn.
- `src/game/scenes/office/officeAssets.js`: fondos y piso.
- `src/game/characters/mario/`: assets y constantes de Mario.
- `src/game/characters/corruptDocument/`: assets y constantes del Documento Corrupto.
- `src/game/characters/docMinion/`: assets y constantes del Esbirro Doc.
- `src/game/projectiles/projectileTypes.js`: configuraciones de pizzas, gas, botellas y bolas del boss.
- `src/game/engine/useGameLoop.js`: loop generico del juego.
- `src/game/engine/useGameInput.js`: teclado y pausa.
- `src/game/physics/collision.js`: utilidades de colision.
- `src/game/ui/`: HUD, menu de pausa y vinetas.
- `src/hooks/useBossAI.js`: IA/FSM del boss.
- `AGENT_HANDOFF.md`: documento tecnico principal del proyecto.

## Controles

- `A` o `ArrowLeft`: mover izquierda.
- `D` o `ArrowRight`: mover derecha.
- `W`, `Space` o `ArrowUp`: saltar.
- `S` o `ArrowDown`: agacharse.
- `P`: lanzar pizza. Durante la util activa, lanza botellas.
- `G`: activar la util.
- `O`: activar escudo mientras se mantiene presionado.
- `M`: forzar muerte de Mario para pruebas.
- `Escape`: abrir o cerrar menu de pausa.

## Gameplay Implementado

### Mario

- Movimiento horizontal con aceleracion, friccion y salto.
- Estados visuales: idle, correr, frenar, saltar, caer, agacharse, lanzar, atacado, empujado, escudo, util y muerte.
- Vida con 5 corazones.
- Municion de pizzas con regeneracion.
- Util con cargas, gas inicial y fase posterior para lanzar botellas.
- Escudo temporal con cooldown.
- Muerte animada con reinicio posterior.

### Documento Corrupto

- Aparece cuando Mario se mueve desde el spawn.
- Entra caminando y habla antes del combate.
- Tiene IA con estados como persecucion, distancia, ataque, retroceso, esquiva, salto, stun y muerte.
- Puede lanzar proyectiles desde distintas distancias.
- Puede esquivar amenazas y saltar hacia atras.
- Si Mario muere durante combate, el boss celebra antes del reinicio.
- Al morir el boss, Mario dice una frase de victoria.

### Esbirro Doc

- Se activa cuando el Documento Corrupto baja a 50% de vida o menos.
- Nace desde el Documento Corrupto, con los pies sobre el piso, y corre hacia Mario.
- Aparece en intervalos aleatorios de 4 a 8 segundos mientras el boss siga vivo.
- Mide 40% de la altura idle de Mario.
- Usa 3 frames recortados desde `assets/docuemenemigo/esbirros/esbirros_doc.png`.
- Tiene hitbox propia.
- Si toca a Mario, hace 1 punto de dano y desaparece.

### Proyectiles

- Pizzas de Mario.
- Gas de la util.
- Botellas durante la fase activa de la util.
- Bolas del Documento Corrupto.

Las bolas del boss:

- Son 50% del tamano anterior.
- Tienen fisica con gravedad.
- Rebotan contra el piso.
- Apuntan anticipando la posicion de Mario.
- Tienen 30% de probabilidad de fallar el apuntado.

## Dialogos

`SpeechBubble` es el componente reusable para vinetas de conversacion.

- La animacion letra por letra vive dentro de `SpeechBubble`.
- Las escenas deben pasar el texto completo.
- No se debe recortar texto desde la escena con `slice` para simular escritura.

## Modularizacion

Reglas base del proyecto:

- No usar ni recrear `src/components/GameScene.jsx`.
- Cada escena nueva debe ir en `src/game/scenes/<nombreEscena>/`.
- Cada personaje nuevo debe ir en `src/game/characters/<nombrePersonaje>/`.
- UI reusable debe ir en `src/game/ui/`.
- Proyectiles y sus configuraciones deben vivir en `src/game/projectiles/`.
- Fisicas y colisiones reutilizables deben vivir en `src/game/physics/`.
- El loop debe mantenerse generico con `useGameLoop`.
- El input global debe pasar por `useGameInput`.
- Aplicar DRY solo cuando la reutilizacion sea real y coherente con la arquitectura.

## Limpieza Realizada

Se eliminaron archivos y carpetas que no estaban en uso:

- README viejo de plantilla Vite.
- `src/components/`.
- `src/assets/` de plantilla.
- `public/favicon.svg`.
- `public/icons.svg`.
- `image/AGENT_HANDOFF/`.
- `output/playwright/`.
- `.playwright-cli/`.
- `.playwright-mcp/`.

No recrear estos elementos salvo que vuelvan a tener un uso real.

## Pendientes Posibles

1. Balancear dificultad del boss.
2. Agregar sonidos.
3. Agregar mas objetivos o escenas.
4. Mejorar plataformas multiples.
5. Persistir estadisticas como muertes o progreso.
6. Seguir extrayendo logica de `OfficeScene.jsx` si la escena crece mas.
