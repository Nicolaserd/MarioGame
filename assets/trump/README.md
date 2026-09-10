# Arte de Trump

Generado con la herramienta integrada `imagegen`, usando `trump-ready.png` como referencia visual. Recurso conectado al juego: [trump-actions.png](trump-actions.png), nueve poses en una hoja de 1254 x 1254, celdas de 418 pixeles.

El generador dibujo el cuadriculado incluso tras solicitar transparencia. El archivo original se conserva; `trumpFrameMasks.js` contiene contornos SVG de visualizacion que ocultan el exterior sin modificar la imagen. Se comprobaron sobre fondo oscuro y en la arena.

## Prompt de generacion

Create a production game sprite atlas based on the referenced Donald Trump caricature. Preserve the exact painterly thick-outline fighting-game style, blond hair, navy suit, white shirt, red tie, stocky proportions. One square 1536x1536 atlas with EXACTLY 3 columns and 3 rows of equal 512x512 cells. TRANSPARENT alpha background, no checkerboard painted, no background, no grid lines, no text, no scenery, no shadows outside character. All nine characters face LEFT. Same camera and physical scale in every cell: standing character height 420 pixels, ground baseline at 480 pixels within each cell, centered x=256. Keep generous margins, no overlap across cells. Row 1: three frames of casting a power: frame1 anticipation drawing fist backward, frame2 forcefully extending open hand left launching magic (no projectile), frame3 follow-through leaning slightly left with hand lowered. Row2: anger animation: frame1 clenched fists at sides and frowning; frame2 shoulders raised, mouth open shouting, face flushed; frame3 fists raised angrily near shoulders, teeth clenched. Row3: cartoon non-graphic defeat: frame1 stagger backward with surprised face and loose arms; frame2 drop onto one knee slumped head; frame3 collapsed seated on floor head bowed exhausted, legs pointing left. Defeated poses shrink in height naturally, keep same body scale and baseline. FULL BODY visible in each cell including shoes, no cropping. No blood. Nine distinct poses, consistent design. This atlas will be cropped into frames directly by a game engine; strict evenly spaced grid and actual transparent background are essential.

## Intento de extraccion de fondo

Se solicito retirar exclusivamente el cuadriculado, conservar las nueve poses y producir PNG RGBA con alpha cero fuera del personaje. El resultado mantuvo el fondo dibujado; no se usa esa variante.

Esquivas: [seis poses adicionales, origen y prompt](esquivas.md).
