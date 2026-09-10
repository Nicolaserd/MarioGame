# Esquivas de Trump

Consultar al modificar la defensa del segundo jefe. Ataques y fases: [torre](torre.md).

## Comportamiento

- `trumpDefense.js` observa solamente proyectiles amistosos que se aproximan. Predice su altura con velocidad y gravedad; no lee teclas ni evita impactos inevitables a ultima hora.
- Puede esquivar desde el comienzo, durante guardia o los primeros 0,5 segundos de preparacion. Si cancela una preparacion, limpia los avisos y retoma el mismo ataque con un aviso completo. Lanzamiento, preparacion avanzada, enojo y recuperacion siguen siendo vulnerables.
- La colision baja a 124 pixeles al agacharse, excluyendo el borde del pelo. Predice tambien la salida del proyectil: si una pizza descendente no puede pasar completa por arriba, intenta saltarla. Saltar usa velocidad y gravedad reales; los pies aterrizan exactamente en el suelo. No concede invulnerabilidad.
- Tras cada esquiva queda vulnerable durante 0,85 segundos en fase 1 y 0,7 en fase 2. La espera entre esquivas es 3,8/2,6 segundos. Los parametros viven en `TRUMP.dodge`.
- Despues de recuperar un ataque entra brevemente en guardia. Una esquiva pausa el siguiente ataque; nunca libera proyectiles mientras esta en el aire.
- La fase 2 comienza a 75 de vida. Conserva los avisos y corredores seguros, pero acelera ataques y permite esquivar con mayor frecuencia. No restaura vida ni aumenta el dano por impacto.
- Enfado y derrota cancelan la esquiva conservando los pies y la velocidad; si esta en el aire, termina de caer. La pausa congela fisica y fotogramas.

## Arte y verificacion

`TrumpSprite.jsx` usa [trump-dodge.png](../../assets/trump/trump-dodge.png): tres poses de agachado y tres de salto. `trumpDodgeFrames.js` define siluetas y anclajes sobre el atlas original; una escala comun conserva proporciones. La sombra permanece en el suelo. [Prompt y origen](../../assets/trump/esquivas.md).

`tests/trumpDefense.test.mjs` verifica colisiones reales, proyectiles de Mario con gravedad, ventanas vulnerables, fases, aterrizaje y cancelaciones. Las seis poses se compararon con el reposo en `output/playwright/trump-dodge-poses.png`; las capturas de arena incluyen agachado, salto y aterrizaje. Los estados preparados en navegador solo sirven para inspeccion; no agregan controles de depuracion al juego.

La regresion del inicio dispara desde la posicion y temporizadores normales, incluyendo tiempos de fotograma variables. `output/playwright/trump-opening-dodge.png` muestra una esquiva activada con P tras iniciar la batalla, sin preparar la IA.
