# Reglas y consulta

Entrada del agente: [AGENTS.md](../AGENTS.md). Abrir solo el documento cuya condicion corresponda.

| Cuando | Documento |
| --- | --- |
| Antes de cada tarea | [Entorno y seguridad](entorno.md) |
| Ejecutar comandos o preparar herramientas | [Comandos habituales](comandos.md) |
| Instalar o actualizar herramientas | [Dependencias](dependencias.md) |
| Cambiar codigo o modulos del juego | [Arquitectura](arquitectura.md) |
| Cerrar una tarea | [Validacion](validacion.md) |
| Crear, editar o consultar Markdown | [Tamano y lectura](tamano-documentos.md) |

El [indice tecnico](../AGENT_HANDOFF.md) enlaza directamente a cada sistema del juego.

Cada regla tiene una sola fuente. Cambiarla alli y actualizar sus enlaces; no copiarla en otros indices. Los enlaces no importan contenido automaticamente ni obligan a recorrer todos los documentos.

Mantener los minimos universales en AGENTS; los detalles se consultan por tarea. No configurar el handoff como instrucciones automaticas ni concatenar todos los Markdown. Los AGENTS anidados se reservan para areas con reglas propias.

Comprobar cambios documentales con `pnpm check:docs`. Para ver medidas por archivo: `pnpm check:docs --verbose`.
