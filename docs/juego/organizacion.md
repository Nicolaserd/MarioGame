# Organizacion del codigo de combate

Consultar antes de modificar el runtime de la oficina. Las rutas siguientes son relativas a `src/game/scenes/office/`.

| Modulo | Responsabilidad |
| --- | --- |
| `OfficeScene.jsx` | Coordina refs, pasos del combate, menus y representacion |
| `officePlayer.js` | Estado inicial, movimiento, gaseosa, recuperacion y muerte de Mario |
| `officeEnemy.js` | Estado inicial, fases, celebracion y muerte del boss |
| `officeCombat.js` | Proyectiles, hitboxes, dano y colisiones entre personajes |
| `officeMinions.js` | Aparicion, movimiento y colisiones de esbirros |
| `officeLayout.js` | Parallax, frames enemigos, piso y camara |

Fuentes compartidas:

- `src/game/characters/mario/marioLayout.js`: metricas de sprites y anclaje de pies; lo utilizan ambos capitulos.
- `src/game/engine/inputState.js`: estado vacio del teclado.
- `src/game/engine/useGameInput.js`: teclado, liberacion al perder foco y pausa.
- `src/game/ui/GameHud.jsx` y `fightHud.css`: barras de vida, recursos y boton de pausa compartidos.

Las referencias historicas a funciones dentro de OfficeScene deben localizarse ahora en estos modulos. No volver a reunir la simulacion en el componente ni duplicar metricas por escena.

La segunda batalla tiene su propio [runtime de torre](torre.md). Los sistemas comparten presentacion y medidas; sus reglas especificas de ataque permanecen separadas.
