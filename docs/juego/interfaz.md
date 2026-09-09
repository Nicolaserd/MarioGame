# HUD, pausa y CSS

Consultar para hud, pausa y css. Rutas relativas a la raiz; contrastar valores con el codigo.

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

- Mostrar/ocultar hitboxes. `showHitboxes` inicia en `false` en ambos capitulos.
- Activar/desactivar animacion suave del menu.

Al abrir el menu:

- `isPausedRef.current = true`.
- Se limpian teclas.
- Se aplica blur/saturacion/oscuridad al mundo.

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
- `.intro-overlay`, `.intro-video`, `.intro-skip-button`, `.intro-start-button`: overlay del video de intro. La clase `.intro-overlay.is-waiting-for-start` aplica blur fuerte al `<video>` mientras se espera el click de `Iniciar intro`. La clase `.intro-is-open` en `.game-scene` reusa el mismo blur que `.menu-is-open` sobre `.game-world`.

Para autoplay, audio y Skip, consultar [intro](intro.md).
