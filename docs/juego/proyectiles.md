# Pizzas, util y proyectiles enemigos

Consultar para pizzas, util y proyectiles enemigos. Rutas relativas a la raiz; contrastar valores con el codigo.

## Pizzas

Constantes principales:

- `PIZZA.damage = 1`.
- `PIZZA.speed = 720`.
- `PIZZA.gravity = 220`.
- `PIZZA.maxBounces = 1`.
- `PIZZA.regenTime = 5`.

Reglas:

- `P` lanza pizza si hay ammo y cooldown disponible.
- Cada pizza desaparece al impactar contra el boss.
- Rebota una vez contra el piso y luego desaparece.
- La municion se regenera con timer propio.
- Hitbox real por `getPizzaHitbox`.

## Util

Constantes principales:

- `UTILITY.maxCharges = 3` (primera batalla).
- `UTILITY.chargeRegenTime = 120`.
- `UTILITY.flashDuration = 4`.
- `UTILITY.gasLaunchTime = 2.55`.
- `UTILITY.postGasDuration = 10`.
- `UTILITY.bottleCooldown = 0.38`.

Flujo:

- `G` consume una carga y entra en fase `flash`.
- Durante `flash` y la animacion previa al gas, Mario queda inmovil e invulnerable.
- Despues entra en `active`, anima `util1` a `util6` y lanza una vez `vomitoGas`.
- El gas hace `GAS.damage = 5`, viaja horizontalmente y puede stunear al boss con `stunBoss`.
- Tras lanzar el gas, Mario deja de ser invulnerable y vuelve a moverse.
- La fase activa sigue `10` segundos con aura/rayos; durante ese tiempo `P` lanza botellas.
- Cada botella hace `BOTTLE.damage = 2`.
- Gas y botellas usan `utilityProjectilesRef` y `utilityProjectiles`.

## Proyectiles del boss

- Sprite: `docuemenemigo-bola-crop.png`.
- Tamano `29 x 29`, hitbox `27 x 27` (50% del tamano anterior).
- Dano `1`.
- Velocidad horizontal inicial `315`.
- Apuntan hacia una posicion anticipada de Mario usando su posicion y velocidad (`aimLeadFactor = 0.58`).
- Tienen 30% de probabilidad de fallar el apuntado (`aimMissChance = 0.3`) con desvio aleatorio en X/Y.
- Usan gravedad `720`, rebotan contra el piso hasta `3` veces y pierden velocidad horizontal en cada rebote.
- Lifetime `4.6` segundos.
- Se guardan en `enemyProjectilesRef` y `enemyProjectiles`.
