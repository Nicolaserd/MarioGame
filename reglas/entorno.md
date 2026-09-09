# Comprobacion inicial

Aplicacion: antes de cada tarea; la inspeccion necesaria para verificar el entorno puede hacerse primero.

1. Ejecutar `pnpm check:versions`. Consultar versiones en vivo; no asumir que el lockfile, un documento o una conversacion siguen vigentes.
2. Ejecutar `pnpm check:security`, incluidas dependencias de desarrollo. Revisar avisos oficiales de [pnpm](https://github.com/pnpm/pnpm/security/advisories), [Vite](https://github.com/vitejs/vite/security/advisories) y [React](https://github.com/react/react/security/advisories).
3. Si falta instalar o hay versiones nuevas, leer [dependencias](dependencias.md). Actualizar primero pnpm, Vite, React, React DOM y su plugin oficial a las ultimas estables compatibles; revisar migraciones. Estas actualizaciones rutinarias estan autorizadas sin nueva confirmacion.
4. Usar versiones estables no deprecadas; excluir alpha, beta, rc, canary, nightly, experimental y `next`. Verificar la etiqueta `latest`: no garantiza seguridad.
5. Ante una vulnerabilidad sin corregir o incompatibilidad, documentar el bloqueo y la alternativa estable evaluada; no degradar silenciosamente ni ocultar avisos.
6. Sin conexion o con auditoria fallida, informar verificacion incompleta. Una auditoria limpia solo indica ausencia de vulnerabilidades conocidas por esa fuente.

Actualizar y [validar](validacion.md) antes de cambios funcionales. Abrir solo la documentacion aplicable segun [AGENTS.md](../AGENTS.md).
