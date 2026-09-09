# Validacion y entrega

Aplicacion: despues de actualizar dependencias y antes de cerrar una tarea.

Cumplir [comandos](comandos.md). Un bloqueo de seguridad prevalece sobre esta lista: no ejecutar el gestor detectado ni descargar herramientas temporales para completar las pruebas. Informar los controles pendientes.

## Validacion obligatoria

Despues de actualizar y antes de dar por terminada una tarea:

```sh
pnpm check:versions
pnpm check:security
pnpm lint
pnpm build
```

Resolver los hallazgos aplicables antes de continuar con cambios funcionales. No usar `audit --fix --force`, exclusiones de avisos ni overrides sin investigar y documentar su necesidad. Registrar versiones verificadas, resultados y limitaciones en la entrega. Mantener los comandos de README y handoff en pnpm.


Para cambios del juego, consultar solo el caso aplicable en [verificacion por sistema](../docs/juego/verificacion.md). Para el entorno, ver [entorno](entorno.md).

Al modificar Markdown, ejecutar tambien `pnpm check:docs`: comprueba 100 lineas/500 palabras y destinos de enlaces locales inline; no verifica URLs remotas ni anclas.
