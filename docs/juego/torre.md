# Segunda batalla: La Torre Dorada

Consultar al modificar el segundo capitulo. Es una caricatura ficticia de combate, con ataques no realistas.

- Tras terminar la muerte del Documento Corrupto, aparece la transicion durante seis segundos de juego; la pausa detiene ese tiempo.
- `App.jsx` cambia de capitulo y desmonta la oficina. La torre restaura vida y recursos; al perder se reintenta aqui, sin repetir la oficina.
- Trump: 150 de vida; fase rapida desde 75. Alterna contratos, lingotes por carriles y muros. Las rafagas liberan tres contratos en fase 1 y cuatro en fase 2, cada uno desde la mano con su gesto de lanzamiento.
- Mario conserva ancho, altura, velocidad, salto y gravedad compartidos con el primer capitulo. Los sprites usan las mismas metricas y anclajes de pies.
- Primera batalla: tres gaseosas. Torre: dos cargas de ocho segundos de botellas. Pizzas regeneran cada cinco segundos en ambos capitulos.
- Vida: cinco puntos. Escudo: tres segundos, cooldown nueve; al soltar O termina. Un impacto concede un segundo de invulnerabilidad.
- Introduccion y resultados no aceptan acciones de combate. Perder foco pausa; mantener Escape no alterna repetidamente el menu.

## Ubicacion

| Archivo | Responsabilidad |
| --- | --- |
| `src/game/scenes/tower/TowerScene.jsx` | Interfaz, input, pausa y montaje |
| `src/game/scenes/tower/towerSimulation.js` | Simulacion con pasos pequenos y colisiones |
| `src/game/scenes/tower/towerConstants.js` | Arena y recursos |
| `src/game/characters/trump/` | Arte, poses, vida y ataques |
| `src/game/projectiles/towerProjectileTypes.js` | Dimensiones y dano |
| `src/game/ui/GameHud.jsx` | HUD compartido por ambas batallas |
| `tests/towerSimulation.test.mjs` | Regresiones del combate |

Trump usa nueve fotogramas en `assets/trump/trump-actions.png`: tres de lanzamiento compartidos por los poderes, tres de enojo y tres de derrota. `trumpAnimation.js` selecciona el fotograma con tiempo de simulacion; la pausa lo congela. `trumpFrameMasks.js` oculta el fondo dibujado por el generador mediante siluetas de visualizacion.

Reposo y recuperacion usan la misma hoja para evitar cambios de proporciones. [Origen del arte y prompt](../../assets/trump/README.md). Mario comparte anclajes de mano, dimensiones, velocidad, gravedad, orientacion y cooldown de proyectiles con la oficina. Dano en torre: pizza cuatro, botella seis.

El enojo ocurre una vez al entrar en fase 2, cancela el aviso pendiente durante 1,8 segundos y retoma un aviso completo. La derrota dura tres segundos y mantiene el ultimo fotograma. Las [esquivas de Trump](trump-esquivas.md) modifican altura y posicion de su colision; tienen seis poses adicionales y recuperacion vulnerable.

`towerAttacks.js` coordina patrones, avisos y liberacion. La segunda fase abre con muro, reduce preparacion al 80% y recuperacion de 1,15 a 0,7 segundos. El oro deja corredores de 142 pixeles para Mario (96); las columnas siguen visibles durante la caida. Enfado y final cancelan rafagas pendientes. `BossAttackCue` comparte el indicador de carga con el Documento Corrupto.
