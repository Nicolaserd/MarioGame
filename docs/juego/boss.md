# Boss Documento Corrupto

Consultar para boss documento corrupto. Rutas relativas a la raiz; contrastar valores con el codigo.

## Boss documento

El enemigo se crea en `createInitialEnemy()` con:

- Estado base de IA desde `createBossAIState()`.
- `active: false`, `entered: false`, `mode: 'waiting'`.
- Vida `100`.
- `facing: -1`.
- Sprite inicial `docuemenemigo-idle2-crop.png`.
- Flags de celebracion y reset (`celebrationTargetX`, `celebrationTalkTimer`, `shouldResetGame`).

Aparicion y fases:

- Aparece cuando Mario se mueve mas de `ENEMY.triggerDistance = 24` desde el spawn.
- Spawnea a la derecha usando `spawnDistance = 840` y camina hasta `stopDistance = 560`.
- Entra en `talking` y muestra el texto completo mediante `SpeechBubble`, que aplica el efecto maquina de escribir.
- Mientras camina/habla/celebra/muere no es vulnerable.
- Al terminar de hablar, entra a la FSM de combate.

IA en `useBossAI.js`:

- Estados: `idle`, `chase`, `keep_distance`, `throw_attack`, `retreat`, `dodge`, `airborne`, `stunned`.
- Mantiene distancia optima, persigue si esta lejos y retrocede si esta cerca.
- Lanza bolas de papel con preparacion y cooldown desde estados de suelo (`chase`, `keep_distance`, `retreat`), asi que puede disparar desde distintas distancias.
- `DOCUMENT_ATTACK` define 0,58 segundos de preparacion y 0,94 de accion total. Mantiene reposo durante la carga y muestra lanzamiento al liberar la bola; `BossAttackCue` refleja el mismo temporizador.
- Conserva orientacion durante el ataque; la bola sale por la mano correspondiente. Aturdir cancela el disparo pendiente y cambia el sprite inmediatamente.
- La frecuencia de disparo es relativamente alta: `attackCooldownMin = 1.05`, `attackCooldownMax = 2`, `attackChance = 0.78`.
- Detecta amenazas entrantes y puede agacharse, saltar o saltar hacia atras.
- Usa azar, delay de reaccion y cooldown para no esquivar perfecto siempre.
- Si Mario esta demasiado cerca, puede hacer salto largo hacia atras o empujar a Mario.
- El gas de la util llama `stunBoss`, llevando al estado `stunned`.

Combate y colisiones:

- Hitbox real del boss: `getEnemyHitbox`.
- Si esta agachado o en `BOSS_STATES.DODGE`, el hitbox baja al 50% de altura.
- Recibe dano de pizzas, gas y botellas con `applyEnemyProjectileHits`.
- Al llegar a `health <= 0`, entra en `mode = 'dying'`, reproduce 4 frames de muerte y luego queda `active = false`, `defeated = true`, `mode = 'dead'`.
- Al derrotarlo, Mario muestra por `8s`: `Ese documento no estaba bien formateado, hora de ir por unas pizzas`.
- `resolvePlayerEnemyCollision` evita que Mario y el boss se solapen.
- `applyBossPushToPlayer` ejecuta el empujon del boss sobre Mario.


Relacionados: [esbirros](esbirros.md), [proyectiles](proyectiles.md), [muerte y reinicio](reinicio.md).
