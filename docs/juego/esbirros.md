# Esbirro Doc

Consultar para esbirro doc. Rutas relativas a la raiz; contrastar valores con el codigo.

Esbirro doc:

- Personaje definido en `src/game/characters/docMinion/`.
- Sprite fuente original: `assets/docuemenemigo/esbirros/esbirros_doc.png`.
- Frames recortados generados: `assets/processed/esbirro-doc-run1-crop.png`, `esbirro-doc-run2-crop.png`, `esbirro-doc-run3-crop.png`.
- Se activa cuando la vida del boss llega a `50%` o menos (`activationHealthRatio = 0.5`).
- Nace desde la posicion del boss documento enemigo, con los pies sobre el piso, y corre hacia Mario.
- Mientras el boss siga vivo y vulnerable en esa fase, aparece con intervalo aleatorio entre `4` y `8` segundos.
- Mide `40%` de la altura idle visual de Mario (`PLAYER_VISUAL.idleHeight`).
- Tiene hitbox propia `24 x 54`.
- Hace `1` punto de dano al tocar a Mario y desaparece al impactar.
- Deja de aparecer cuando el boss muere; tambien se limpian si Mario muere, si el boss deja de estar vulnerable o si se reinicia la partida.
