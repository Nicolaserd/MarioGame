# Instalacion y actualizacion

Aplicacion: solo al instalar, actualizar o modificar configuracion del stack.

## Gestor y dependencias

- Usar exclusivamente pnpm para instalar, agregar, actualizar, eliminar o ejecutar paquetes y scripts. No usar npm, npx, yarn ni bun.
- Para activar o actualizar pnpm, cumplir primero [comandos](comandos.md). No sustituir automaticamente lanzadores globales ni ejecutar instaladores descargados. Conservar Corepack instalado; antes de invocarlo, comprobar que no vaya a ejecutar el binario detectado pendiente de revision.
- Fijar la version exacta de pnpm en `packageManager` y `engines.pnpm`; mantener ambos sincronizados tras consultar `pnpm view pnpm@latest version` y verificar su seguridad.
- Fijar versiones exactas para React, React DOM, Vite y `@vitejs/plugin-react`. React y React DOM deben tener la misma version. Consultar `engines` y `peerDependencies` antes de actualizar.
- Mantener Node.js en una rama LTS soportada y compatible con el stack (actualmente 24.x).
- El unico lockfile permitido es `pnpm-lock.yaml`, que debe versionarse junto con `package.json` y `pnpm-workspace.yaml`. No crear `package-lock.json`, `npm-shrinkwrap.json`, `yarn.lock`, `bun.lock` ni `bun.lockb`.
- Para instalaciones reproducibles y CI usar `pnpm install --frozen-lockfile`. Las actualizaciones deliberadas regeneran el lockfile con pnpm y se revisan antes de continuar.
- No desactivar validacion TLS, integridad, engines, peer dependencies ni controles de scripts de dependencias para conseguir que una instalacion pase. Revisar individualmente cualquier script de instalacion solicitado por una dependencia.



Consultar [entorno](entorno.md) para seguridad y [validacion](validacion.md) al terminar.
