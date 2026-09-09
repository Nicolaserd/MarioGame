# Segunda batalla: La Torre Dorada

Consultar al modificar el segundo capitulo. Es una caricatura ficticia de combate, con ataques no realistas.

- Tras terminar la muerte del Documento Corrupto, aparece la transicion durante seis segundos de juego; la pausa detiene ese tiempo.
- `App.jsx` cambia de capitulo y desmonta la oficina. La torre restaura vida y recursos; al perder se reintenta aqui, sin repetir la oficina.
- Trump: 120 de vida; fase rapida desde 60. Alterna contratos que se esquivan agachandose, lingotes con columnas de aviso y un muro que se salta.
- Mario conserva ancho, altura, velocidad, salto y gravedad compartidos con el primer capitulo. Los sprites usan las mismas metricas y anclajes de pies.
- Primera batalla: tres gaseosas. Torre: dos cargas de ocho segundos de botellas; pizzas regeneran cada 1,5 segundos. Estas cifras estan en configuraciones separadas.
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

El enojo ocurre una vez al entrar en fase 2, cancela el aviso pendiente durante 1,8 segundos y retoma un aviso completo. La derrota dura tres segundos y mantiene el ultimo fotograma. Las colisiones conservan sus dimensiones. No es animacion esqueletica.
