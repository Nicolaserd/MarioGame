# Tamano y lectura de Markdown

Aplicacion: crear, editar o consultar documentacion. Fuentes revisadas el 2026-09-09.

## Limites documentados

| Herramienta | Criterio oficial |
| --- | --- |
| Codex | `project_doc_max_bytes`: 32 KiB por defecto para el conjunto de instrucciones descubierto, no para cada Markdown del repositorio. [Fuente](https://learn.chatgpt.com/docs/agent-configuration/agents-md) |
| Cursor | Recomienda reglas de menos de 500 lineas, enfocadas y separadas por responsabilidad. Es una recomendacion, no un limite universal de archivos. [Fuente](https://cursor.com/docs/rules) |

Estas fuentes no establecen un maximo universal de tokens para cualquier `.md`.

## Presupuesto de este proyecto

- Cada Markdown: maximo 100 lineas y 500 palabras; comprobar con `pnpm check:docs`.
- `AGENTS.md`: ademas, mantener unas 250 palabras como objetivo de entrada.
- Un archivo por tema consultable; dividir por responsabilidades, nunca cada N lineas de forma automatica.
- El indice enlaza directamente al tema. Evitar cadenas de indices y archivos diminutos que siempre haya que leer juntos.
- No juntar parrafos en una linea para cumplir el limite: no reduce tokens. Palabras, bytes y lineas son indicadores; contar tokens exactos requiere el tokenizer del modelo utilizado.
- Conservar requisitos y excepciones; eliminar duplicados y enlazar fuentes existentes. No abreviar hasta volver ambiguas las reglas.
- Abrir solo documentos aplicables. Para buscar una seccion usar `rg -n '^#{1,3} ' archivo.md` y leer el rango necesario; no volcar carpetas completas.
- No releer archivos sin cambios ni recorrer enlaces de retorno automaticamente.

Estos presupuestos son decisiones locales ajustables con evidencia de uso; no garantizan un porcentaje fijo de ahorro de tokens.
