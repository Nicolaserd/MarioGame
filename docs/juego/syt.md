# Nivel 3: Sistemas y Tecnologia

Escena: `src/game/scenes/syt/SytScene.jsx`. Simulacion independiente en `sytSimulation.js`; constantes y progresion en `sytConstants.js`.

## Recorrido y controles

Un unico pasillo continuo de Sistemas y Tecnologia, con camara lateral, suelo continuo y escritorios opcionales como plataformas unidireccionales. El avance automatico completa el recorrido en unos 114 segundos; limite de 120 segundos activos. Pausa y perdida de foco congelan el reloj.

- Espacio, W o arriba: saltar. S o abajo: agacharse manteniendo avance.
- D o derecha: acelerar. A o izquierda: frenar; la perseguidora se acerca.
- Saltar sobre un esbirro al caer lo elimina y produce un rebote. El contacto lateral hace dano.
- USB opcionales: recuperan una vida y aumentan la separacion, sin exceder los maximos.
- Escape: pausa; M conserva el reinicio por muerte de los otros capitulos.
- P, G y O no se usan en este runner; el menu adapta las instrucciones.

Acceso desde el selector compartido o desde la victoria de la Torre Dorada. Reintentar restaura vida, reloj, ataques, distancia e inventario del Nivel 3.

## Persecucion y recursos

SyT permanece detras de Mario y captura al jugador que pierde demasiada distancia. Tiene poses de carrera, preparacion, lanzamiento, senalamiento, salto, risa y reaccion. Usa los originales de `assets/Syt/`; los chips proceden de `mujer/lanzar objetos`, el tecnico de `mujer/esbirro` y los enemigos tecnologicos de `objetos`.

`SytSprite.jsx` recorta las hojas mediante SVG. `scripts/build-syt-masks.ps1` genera las mascaras de presentacion sin modificar los PNG originales. Mario reutiliza `marioLayout.js`. HUD, pausa, dialogos y overlays son compartidos.

Los cuatro tramos cambian a los 30, 60 y 90 segundos. Aumenta la frecuencia y aparecen parejas de chips. Avisos de 1,2 a 1,5 segundos; nunca se solapan instrucciones incompatibles de salto y agachado. Proyectiles configurados en `src/game/projectiles/sytProjectileTypes.js`.

## Verificacion

`tests/sytSimulation.test.mjs` cubre tiempo limite, victoria, captura, colisiones, plataformas, USB, inmunidad y un recorrido completo sin dano a 30/60/120 FPS. Capturas en `output/playwright/syt-*.png`.

Validacion local con Node: pruebas, ESLint y build. Navegador: selector, movimiento, pausa, reintento, derrota y victoria. Algunos estados finales se prepararon exclusivamente en el navegador de pruebas, sin trucos en el producto.

Revision visual: avisos sobre la ruta de salto, plataformas verdes diferenciadas del fondo, sombras de apoyo y estados del HUD coherentes con pausa y resultado. Los chips tienen recortes individuales, tamano vinculado a su colision y salen de la mano actual incluso en parejas. La trayectoria baja se estabiliza antes de alcanzar a Mario; ambos chips se pueden superar con un salto. La numeracion de racks avanza sin reiniciarse. Comparativas: `output/playwright/syt-review-*.png`.

Comprobaciones de pnpm y actualizacion pendientes por el [incidente del gestor](../incidente-pnpm.md). No equivalen a una auditoria de seguridad completada.
