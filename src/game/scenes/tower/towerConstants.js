import { PLAYER, PHYSICS, SHIELD } from '../../characters/mario/marioConstants.js'
import { PIZZA, THROW } from '../../projectiles/projectileTypes.js'
export const TOWER = { width: 960, height: 560, floor: 438, gravity: PHYSICS.gravity }
export const HERO = {
  x: 140, width: PLAYER.width, height: PLAYER.height, health: PLAYER.health,
  speed: PHYSICS.maxSpeed, jump: PHYSICS.jumpVelocity,
  acceleration: PHYSICS.acceleration, friction: PHYSICS.friction, runThreshold: PHYSICS.runThreshold,
  ammo: PLAYER.pizzaAmmo, regen: PIZZA.regenTime, throwCooldown: THROW.duration + THROW.cooldown, shieldDuration: SHIELD.duration,
  shieldCooldown: SHIELD.cooldown, utilityDuration: 8, utilityCharges: 2, immunity: 1,
  crouchHeight: PLAYER.crouchHeight,
}
