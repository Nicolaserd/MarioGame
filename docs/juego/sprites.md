# Sprites y anclaje de Mario

Consultar para sprites y anclaje de mario. Rutas relativas a la raiz; contrastar valores con el codigo.

## Sprites y anclaje visual

Los sprites de Mario usan recortes procesados (`assets/processed/*-crop.png`) y metricas manuales en `SPRITE_METRICS`.

Puntos criticos:

- `SPRITE_LAYOUTS` escala cada pose usando `PLAYER_VISUAL_SCALE`.
- El render usa `footAnchorX` y `footAnchorY`, medidos sobre el cuerpo y las suelas, no sobre el polvo o el borde transparente. La torre compensa `bottomOffset`; la oficina posiciona desde `footAnchorY`.
- La pose de lanzamiento conserva su lienzo original, compensando sus 108 pixeles transparentes inferiores. Todas las poses conservan su relacion de aspecto.
- En la torre, `max-width: none` evita que la regla global de imagenes aplaste poses mas anchas que la caja de colision. Comprobar ancho CSS real contra `SPRITE_LAYOUTS` al correr y atacar.
- `agachar-crop.png` usa `PLAYER.crouchHeight` compartida con las colisiones; evita reducir cabeza y torso excesivamente.
- Si se agrega/reemplaza una pose, actualizar `SPRITE_METRICS` y probar el anclaje del pie.
- El hitbox visible de Mario se calcula desde el layout del sprite actual, no desde la altura completa fija.

Estados visuales de Mario, en prioridad aproximada dentro de `chooseSprite`:

- `Muriendo`: `morir1`, `morir2`, `morir3`.
- `Empujado`: `empuje1`, `empuje2`.
- `Atacado`: `atacado`.
- `Escudo`: `escudo1`, luego `escudo2`.
- Util activa antes del gas: `util1` a `util6`.
- Agachado: `agachar`, incluso al disparar; tiene prioridad sobre lanzamiento y freno.
- Lanzando en suelo: `lanzar`, inmovil durante el gesto. En aire conserva salto/caida.
- Aire subiendo: `saltar`.
- Aire bajando: `caer`.
- Freno: `freno`.
- Corriendo: `correr1`, `correr2`, `correr3`.
- Idle: `idle1`, `idle2`.

`App` precarga las poses durante la introduccion. Comprobar las transiciones y ambos sentidos con [los casos de validacion](verificacion.md).
