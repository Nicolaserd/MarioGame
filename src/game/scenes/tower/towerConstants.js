import { PLAYER, PHYSICS, SHIELD } from '../../characters/mario/marioConstants.js'
export const TOWER = { width: 960, height: 560, floor: 438, gravity: PHYSICS.gravity }
export const HERO = {
  x: 140, width: PLAYER.width, height: PLAYER.height, health: PLAYER.health,
  speed: PHYSICS.maxSpeed, jump: PHYSICS.jumpVelocity,
  ammo: PLAYER.pizzaAmmo, regen: 1.5, throwCooldown: 0.3, shieldDuration: SHIELD.duration,
  shieldCooldown: SHIELD.cooldown, utilityDuration: 8, utilityCharges: 2, immunity: 1,
  crouchHeight: 94, handHeight: 65,
}
