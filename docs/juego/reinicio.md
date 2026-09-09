# Referencia: reinicio

Consultar solo si la tarea afecta este tema. Las rutas entre backticks son relativas a la raiz del proyecto; contrastar constantes y estado documentado con el codigo.

## Muerte y reinicio

La muerte se inicia si:

- Se presiona `M`.
- `player.health <= 0`.

Flujo actual:

- `startDeath(player)` bloquea acciones, limpia timers de util/lanzamiento/escudo/empujon/dano y deja a Mario quieto.
- `DEATH.frameDurations` reproduce `morir1`, `morir2`, `morir3` lento.
- Al entrar al ultimo frame, Mario sube `DEATH.riseDistance` pixeles.
- Al terminar la animacion, Mario vuelve a `createInitialPlayer()` con freno de aterrizaje.
- Se limpian pizzas, proyectiles de util y proyectiles enemigos mediante `resetProjectiles`.
- Si el boss estaba activo, ya habia entrado y estaba en combate, no se reinicia inmediatamente: se llama `startEnemyCelebration`.
- La celebracion del boss usa `celebrating_walk` hacia la posicion donde murio Mario y luego `celebrating_talk` con el texto `Soy el exploid supremo padre!`.
- Al terminar el texto y el hold de celebracion, `enemy.shouldResetGame = true` y el loop llama `resetGame()`.
- Si el boss no estaba en condiciones de celebrar, el enemigo se reinicia directamente.

Esta parte es sensible: no cambiar `resetProjectiles`, `enemyIsCelebrating`, `enemyShouldCelebrate` o `shouldResetGame` sin probar el flujo completo de muerte.

Volver al [indice del juego](../../AGENT_HANDOFF.md).
