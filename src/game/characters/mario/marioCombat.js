import { PLAYER } from './marioConstants.js'

// Hand anchors measured in the displayed standing/crouching poses, from the feet.
export function getMarioLaunchOrigin(player, projectile) {
  const crouched = player.crouching ?? player.crouched ?? false
  const handX = crouched ? 54 : 78
  const handHeight = crouched ? 90 : 132
  const facing = player.facing < 0 ? -1 : 1
  return {
    x: player.x + PLAYER.width / 2 + facing * handX - (facing < 0 ? projectile.width : 0),
    y: player.y + PLAYER.height - handHeight - projectile.height / 2,
  }
}
