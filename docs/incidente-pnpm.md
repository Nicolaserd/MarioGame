# Alerta de Kaspersky pendiente

- Fecha: 2026-09-09. El usuario mostro una deteccion de comportamiento `PDM:Trojan.Win32.Generic` en pnpm 12.3.4.
- Ejecutable: `C:/Users/ninchaustegui/AppData/Local/node/corepack/v1/pnpm/12.3.4/pnpm-native.exe`.
- SHA256 observado: `19ACB40343170A98E3C610C1C2C379D0A6F0721EA6C4DD6D1737429FAD63A12E`.
- Authenticode: `NotSigned`. Eso no prueba malware ni permite descartarlo. No se ha verificado la correspondencia con un artefacto oficial firmado.
- Se interrumpieron las sesiones de desarrollo/instalacion y se solicito detener el proceso 25880; Windows seguia enumerandolo en la comprobacion inmediata. No dar por confirmada su terminacion ni la limpieza del equipo.
- Mantener pnpm como gestor del proyecto; no desinstalar ni desactivar npm, pnpm o Corepack. La precaucion se limita al ejecutable detectado: no ejecutarlo ni reinstalarlo para eludir la deteccion. No crear exclusiones ni desactivar el antivirus. Aclarar la alerta con Kaspersky o el administrador antes de reutilizar ese binario.
- Una auditoria de dependencias sin avisos no equivale a una comprobacion antimalware del gestor.

## Trabajo del juego por continuar

La segunda batalla esta implementada en `src/game/scenes/tower/`. La oficina se separo en modulos y ambos capitulos comparten HUD y metricas de Mario. Se validaron lint y build con Node y las herramientas locales existentes, sin ejecutar el binario detectado.

Pasaron nueve pruebas de simulacion y comprobaciones de navegador de transicion, derrota, reintento, victoria y pausa. La transicion y victoria se aceleraron modificando estado solo en el navegador de pruebas; no se agregaron trucos al producto. La verificacion visual se guarda en `output/playwright/`.

Siguen pendientes las comprobaciones rutinarias que ejecutan pnpm y la resolucion de la alerta. Las pruebas funcionales del juego no certifican la seguridad del gestor.

Tras resolver el incidente, verificar el estado del equipo y una distribucion confiable del gestor antes de retirar este bloqueo y continuar las pruebas.

El usuario solicita corregir la forma de actualizar, conservando el gestor. No se ha demostrado que el procedimiento de actualizacion sea la causa ni que la deteccion sea un falso positivo.
