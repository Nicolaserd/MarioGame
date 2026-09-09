# Intro con audio y Skip

Consultar para intro con audio y skip. Rutas relativas a la raiz; contrastar valores con el codigo.

## Intro video

- Componente: `src/game/ui/IntroVideoOverlay.jsx` en `src/game/ui/` para mantenerlo reutilizable.
- Asset: `assets/video/intro1.mp4`, exportado como `introVideo` en `src/game/scenes/office/officeAssets.js`.
- Estado en `OfficeScene`: `isIntroOpen`, inicial `true`. El overlay aparece al cargar la pagina, al recargar y cada vez que `resetGame()` corre (incluyendo el `Reiniciar` del menu y el reset post muerte/celebracion del boss).
- Mientras `isIntroOpen` es `true`:
  - `isPausedRef.current` queda `true`, asi que `useGameLoop` no avanza el tick.
  - Se aplica la clase `intro-is-open` al `.game-scene`, que reusa la regla de blur `filter: blur(5px) saturate(0.72) brightness(0.68)` de `.menu-is-open .game-world`.
  - `openMenu()` queda bloqueado y `closeMenu()` (que es lo que `useGameInput` invoca con `Escape` cuando `isPausedRef.current` es `true`) skipea el intro en vez de cerrar el menu.
- Skip:
  - Boton `Skip »` fijo en la esquina superior derecha del overlay.
  - `Escape` skipea (via el ruteo descrito arriba).
  - `onEnded` del `<video>` tambien llama a `onSkip` para cerrar automaticamente al terminar.
- Autoplay con audio:
  - Se intenta `video.play()` con `muted = false`. Si el navegador resuelve la promesa, suena directamente.
  - Si la promesa rechaza (politica de autoplay del navegador, tipico en primer load/reload), aparece un boton `Iniciar intro` centrado y se aplica la clase `is-waiting-for-start` al overlay; esa clase aplica `filter: blur(14px) brightness(0.45) saturate(0.7)` al `<video>` para no spoilear el primer frame.
  - El click en `Iniciar intro` resetea `currentTime = 0`, `muted = false` y vuelve a llamar `play()`.
- No usar `autoPlay` en el `<video>` ni el fallback `muted = true`: la idea es que el video siempre se reproduzca con audio, y si no se puede, esperar al click. El `<video>` se controla via ref desde el `useEffect` que escucha `isOpen`.
