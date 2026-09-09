# Sprites y anclaje de Mario

Consultar para sprites y anclaje de mario. Rutas relativas a la raiz; contrastar valores con el codigo.

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
