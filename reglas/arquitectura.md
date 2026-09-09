# Arquitectura y reutilizacion

Aplicacion: antes de cambiar codigo del juego, UI, fisica o estructura.

## Responsabilidades

- La escena vive en `src/game/scenes/office/OfficeScene.jsx`. No recrear `src/components/GameScene.jsx`.
- Nuevas escenas: `src/game/scenes/<nombre>/`, con assets, constantes y componente propios.
- Nuevos personajes: `src/game/characters/<nombre>/`, con assets, constantes y comportamiento propios.
- UI reutilizable: `src/game/ui/`; no duplicar HUD, menu, dialogos ni overlays.
- Mantener escala logica, anclajes de pies, HUD y legibilidad coherentes entre capitulos. Reutilizar `marioLayout.js`; no redimensionar al protagonista arbitrariamente por escena. Ajustar el viewport conservando toda la arena visible.
- `SpeechBubble` controla la escritura letra por letra. Pasar texto completo; no simularla con `slice` desde escenas.
- Proyectiles: `src/game/projectiles/`. Configurar velocidad, dano y gravedad fuera del JSX.
- La escena coordina colisiones entre personajes y proyectiles; reutilizar `src/game/physics/`.
- Mantener `useGameLoop` generico; cada escena proporciona su tick.
- Input global mediante `useGameInput`; justificar cualquier manejo especial de una escena.

## Reutilizacion

- Antes de crear codigo, buscar modulos y reglas existentes.
- Aplicar DRY cuando coincidan responsabilidades, efectos y razones de cambio. Adaptar diferencias mediante parametros o configuraciones.
- Extraer logica repetida dos o mas veces cuando la reutilizacion sea limpia.
- No crear abstracciones gigantes: pizzas, gas, botellas y bolas pueden compartir motor y conservar comportamientos propios.
- Al mover logica, preservar compatibilidad y ejecutar `pnpm lint` y `pnpm build`.
- Mantener las actualizaciones de herramientas libres de cambios innecesarios del juego.

Consultar el sistema afectado en [el indice tecnico](../AGENT_HANDOFF.md); terminar con [validacion](validacion.md).
