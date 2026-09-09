# Reglas del proyecto

**Incidente pendiente:** conservar pnpm como gestor. Kaspersky detecto el ejecutable `pnpm-native.exe` 12.3.4; consultar [el incidente](docs/incidente-pnpm.md) antes de usarlo. Corregir el procedimiento de actualizacion sin desactivar gestores ni protecciones. No volver a ejecutar el binario detectado hasta aclarar la alerta.

- Usar exclusivamente pnpm; no usar npm, npx, yarn ni bun. Mantener pnpm, Vite, React y React DOM en la ultima version estable compatible, verificada en vivo y sin vulnerabilidades conocidas aplicables.
- Antes de cada tarea, leer [entorno](reglas/entorno.md), ejecutar `pnpm check:versions` y `pnpm check:security`, y revisar los avisos oficiales alli enlazados. Actualizar y validar primero si corresponde. La inspeccion necesaria para estas comprobaciones puede realizarse antes.
- Abrir y cumplir los documentos de la tabla cuando aplique su condicion. Los enlaces no importan automaticamente su contenido.

| Cuando | Leer |
| --- | --- |
| Ejecutar comandos o preparar herramientas | [Comandos habituales](reglas/comandos.md) |
| Modificar codigo o estructura del juego | [Arquitectura](reglas/arquitectura.md) |
| Cambiar un sistema o investigar su comportamiento | [Indice del juego](AGENT_HANDOFF.md), solo el tema afectado |
| Despues de actualizar y antes de entregar | [Validacion](reglas/validacion.md) |
| Crear o reorganizar reglas/documentacion | [Mantenimiento](reglas/README.md) |

Leer solo los temas aplicables; no recorrer todos los enlaces ni cargar toda la documentacion por defecto. Cada regla tiene una unica fuente: editarla alli y enlazarla desde los indices. Las instrucciones explicitas del usuario prevalecen sobre estas reglas.

Markdown: maximo local de 100 lineas y 500 palabras por archivo; buscar encabezados con `rg -n '^#{1,3} ' archivo.md` antes de leer documentos ajenos al tema. Al editar documentacion, ejecutar `pnpm check:docs`.
