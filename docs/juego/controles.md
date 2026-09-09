# Controles

Consultar para controles. Rutas relativas a la raiz; contrastar valores con el codigo.

## Controles

- `A` o `ArrowLeft`: mover izquierda.
- `D` o `ArrowRight`: mover derecha.
- `W`, `Space` o `ArrowUp`: saltar.
- `S` o `ArrowDown`: agacharse.
- `P`: lanzar pizza; durante la fase post-gas de la util lanza botellas.
- `G`: activar la util si hay carga disponible.
- `O`: activar escudo mientras se mantiene presionado.
- `M`: forzar muerte de Mario.
- `Escape`: abrir/cerrar menu de pausa. Si el video de intro esta abierto, `Escape` lo skipea en vez de abrir el menu.
- Boton hamburguesa: abre el menu de pausa.

El menu limpia `keysRef.current` al abrir/cerrar para evitar inputs pegados.
