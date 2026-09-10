import { PIZZA, BOTTLE } from './projectileTypes.js'

export const TOWER_PROJECTILES = {
  pizza: { ...PIZZA, damage: 4, launchVy: -80 },
  bottle: { ...BOTTLE, damage: 6, launchVy: -110 },
  contract: { width: 42, height: 26, speed: 360, damage: 1 },
  gold: { width: 46, height: 30, speed: 380, damage: 1 },
  wall: { width: 48, height: 62, speed: 290, damage: 1 },
}
