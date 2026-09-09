# Mario en busca del dato perdido

Juego 2D de oficina con React, Vite, JavaScript ESM y CSS. Incluye Mario, boss Documento Corrupto, esbirros, proyectiles, escudo, util e intro con audio.

Al vencer al Documento Corrupto se abre [La Torre Dorada](docs/juego/torre.md), una segunda batalla con checkpoint propio. Ambos capitulos comparten HUD y escala del protagonista; la oficina empieza con tres gaseosas.

## Iniciar

Requiere Node.js 24.x y la version exacta de pnpm indicada en `package.json`. Usar solo pnpm. Si hace falta activarlo, usar `corepack enable pnpm` o `corepack pnpm`.

Antes de cada tarea, cumplir [la comprobacion del entorno](reglas/entorno.md).

```sh
pnpm check:versions
pnpm install --frozen-lockfile
pnpm check:security
pnpm dev
```

Validacion: `pnpm lint`, `pnpm build`. Vista del build: `pnpm preview`.

## Consultar por tema

| Necesidad | Documento |
| --- | --- |
| Reglas para el agente | [AGENTS.md](AGENTS.md) |
| Elegir una referencia tecnica | [Indice del juego](AGENT_HANDOFF.md) |
| Jugar con teclado | [Controles](docs/juego/controles.md) |
| Encontrar codigo | [Estructura](docs/juego/estructura.md) |
| Estado y futuras mejoras | [Estado](docs/juego/estado.md) |
| Archivos retirados | [Limpieza](docs/juego/limpieza.md) |
| Organizar documentacion | [Reglas de consulta](reglas/README.md) |
