# Estado y pendientes

Consultar para estado y pendientes. Rutas relativas a la raiz; contrastar valores con el codigo.

## Estado actual

Juego 2D hecho con React + Vite. La pantalla principal es directamente el juego: una escena de oficina con parallax, mundo horizontal ancho, Mario controlable, HUD, menu de pausa, proyectiles, util, escudo y un boss documento con IA propia.

La fuente principal de verdad ahora es `src/game/scenes/office/OfficeScene.jsx`. `src/App.jsx` importa esa escena directamente. La IA del boss vive separada en `src/hooks/useBossAI.js`.

## Pendientes razonables

1. Balancear IA del boss: cooldowns, dano, chances de esquiva y distancia optima.
2. Agregar sonido a salto, lanzamiento, dano, escudo, util, muerte y boss.
3. Agregar objetivo jugable: recolectables, niveles o final de escena.
4. Mejorar sistema de plataformas multiples.
5. Persistir estadisticas si se quiere usar `deaths` como contador real.
6. Pasar mas logica de `OfficeScene.jsx` a modulos si crece mas: comportamiento de Mario, comportamiento del boss, factories de proyectiles y render layers.
