# Movimiento y estado de Mario

Consultar para movimiento y estado de mario. Rutas relativas a la raiz; contrastar valores con el codigo.

## Estado del jugador

`createInitialPlayer()` crea el estado base:

- Posicion inicial sobre el piso.
- Velocidades `vx/vy` en `0`.
- `facing: 1`.
- Timers de freno, lanzamiento, util, escudo, muerte, speech, empujon y dano en `0`.
- `utilityCharges: 3` (primera batalla).
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

Para poses y pies, consultar [sprites](sprites.md); para muerte, [reinicio](reinicio.md).
