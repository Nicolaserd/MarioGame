# Comandos y herramientas

Aplicacion: antes de ejecutar comandos, instalar herramientas o validar cambios.

- Usar comandos habituales, cortos y explicitos: scripts de `package.json`, `pnpm install --frozen-lockfile`, `pnpm add`, `pnpm update` y `pnpm exec` para herramientas locales ya instaladas.
- Usar solo pnpm como gestor. No ejecutar `pnpm dlx`, `npx` ni descargadores temporales para preparar pruebas.
- Conservar los gestores instalados. Corregir procedimientos de actualizacion; no desactivar ni desinstalar npm, pnpm o Corepack como respuesta automatica a una alerta.
- Preferir herramientas ya disponibles. No instalar utilidades globales, cambiar PATH ni reemplazar lanzadores globales automaticamente para una tarea del proyecto.
- Para nuevas dependencias necesarias, usar instalacion local con pnpm, revisar el origen y actualizar manifiesto y lockfile. Esto requiere que el gestor este habilitado y su incidente de seguridad resuelto.
- Las actualizaciones del gestor deben respetar esta politica: no sustituir automaticamente la instalacion global. Documentar una actualizacion pendiente cuando no pueda hacerse con el entorno disponible y confiable.
- No descargar scripts y ejecutarlos directamente con `Invoke-Expression`, `iex` o tuberias a un interprete. Si hace falta automatizacion, usar archivos legibles y revisables con comandos simples.
- No desactivar el antivirus, crear exclusiones, elevar permisos ni reintentar por otra via una ejecucion detectada como amenaza. Registrar el bloqueo y resolver su causa.
- Si falta una herramienta de pruebas, usar otra ya disponible o informar la validacion pendiente. No presentar comprobaciones incompletas como aprobadas.
- Un comando habitual tambien puede activar el antivirus. No prometer ausencia de alertas ni clasificar una deteccion como falso positivo sin evidencia.

Consultar [dependencias](dependencias.md) para versiones y [validacion](validacion.md) para las comprobaciones. El [incidente de pnpm](../docs/incidente-pnpm.md) permanece pendiente hasta su resolucion documentada.
