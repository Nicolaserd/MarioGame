import { PLAYER } from '../../characters/mario/marioConstants.js'
import { enemyCrouch, enemyDeath1, enemyDeath2, enemyDeath3, enemyDeath4, enemyIdle2, enemyJump, enemyStunned, enemyTalk1, enemyTalk2, enemyThrow, enemyWalk1, enemyWalk2 } from '../../characters/corruptDocument/corruptDocumentAssets.js'
import { clamp } from '../../physics/collision.js'
import { backLayer, midLayer } from './officeAssets.js'
import { FLOOR_SEGMENTS, SCENE, WORLD, floorSurfaceY } from './officeConstants.js'

export const PARALLAX_LAYERS = [
  {
    name: 'fondo de atras',
    image: backLayer,
    depth: 0.14,
    verticalDepth: 0.08,
    size: '995px 560px',
    className: 'parallax-back',
  },
  {
    name: 'escritorios',
    image: midLayer,
    depth: 0.42,
    verticalDepth: 1,
    size: '690px 460px',
    className: 'parallax-desks',
  },
]

export const ENEMY_WALK_FRAMES = [enemyWalk1, enemyWalk2]

export const ENEMY_TALK_FRAMES = [enemyTalk1, enemyTalk2]

export const ENEMY_DEATH_FRAMES = [enemyDeath1, enemyDeath2, enemyDeath3, enemyDeath4]

export const ENEMY_SPRITES = {
  idle: enemyIdle2,
  jump: enemyJump,
  crouch: enemyCrouch,
  stunned: enemyStunned,
  backJump: enemyJump,
  throw: enemyThrow,
}

export function getFloorSegmentAtFoot(footX) {
  return FLOOR_SEGMENTS.find(
    (segment) => footX >= segment.x + 24 && footX <= segment.x + segment.width - 24,
  )
}

export function getCamera(player) {
  const targetX = player.x + PLAYER.width / 2 - SCENE.width * 0.22
  const targetY = player.y + PLAYER.height - floorSurfaceY

  return {
    x: clamp(targetX, 0, WORLD.width - SCENE.width),
    y: clamp(targetY, -118, 80),
  }
}
