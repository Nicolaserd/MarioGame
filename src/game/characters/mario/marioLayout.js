import * as sprites from './marioAssets.js'
import { PLAYER_VISUAL } from './marioConstants.js'

// Source canvas size, body axis X, sole Y and optional scale correction.
// Dust, wings, outstretched arms and transparent margins never determine body size.
const metrics = {
  idle1: [496, 910, 200.66, 897],
  idle2: [512, 939, 221.29, 926, 884 / 914],
  brake: [623, 897, 297.94, 884],
  run1: [1076, 726, 700, 712],
  run2: [991, 727, 670, 713],
  run3: [1078, 694, 620, 680],
  jump: [1014, 797, 530, 784],
  fall: [851, 728, 411.53, 714],
  crouch: [690, 790, 310, 789, PLAYER_VISUAL.crouchHeightRatio * 910 / 789],
  death1: [610, 910, 290, 909],
  death2: [1300, 560, 625, 549],
  death3: [1020, 840, 510, 839],
  shield1: [560, 900, 270, 899],
  shield2: [900, 920, 350, 919],
  push1: [1134, 667, 430, 654],
  push2: [1374, 778, 1020, 762],
  attacked: [905, 954, 452, 941, 0.9],
  util1: [900, 930, 452, 928, 0.9],
  util2: [900, 930, 452, 929, 0.9],
  util3: [900, 930, 452, 929, 0.9],
  util4: [900, 930, 452, 929, 0.9],
  util5: [900, 930, 452, 929, 0.9],
  util6: [930, 945, 472, 944, 0.86],
  throwPose: [1536, 1024, 600, 916, 884 / 867],
}

export const SPRITE_METRICS = new Map(Object.entries(metrics).map(([name, values]) => {
  const [width, height, footAnchorX, footAnchorY, correction = 1] = values
  return [sprites[name], { width, height, footAnchorX, footAnchorY, correction }]
}))
export const IDLE_FRAMES = [sprites.idle1, sprites.idle2]
export const RUN_FRAMES = [sprites.run1, sprites.run2, sprites.run3]
export const UTILITY_FRAMES = [sprites.util1, sprites.util2, sprites.util3, sprites.util4, sprites.util5, sprites.util6]
export const DEATH_FRAMES = [sprites.death1, sprites.death2, sprites.death3]
export const PLAYER_VISUAL_SCALE = PLAYER_VISUAL.idleHeight / PLAYER_VISUAL.referenceHeight

export const SPRITE_LAYOUTS = new Map(Array.from(SPRITE_METRICS, ([sprite, m]) => {
  const scale = PLAYER_VISUAL_SCALE * m.correction
  return [sprite, {
    width: m.width * scale, height: m.height * scale,
    footAnchorX: m.footAnchorX * scale, footAnchorY: m.footAnchorY * scale,
    bottomOffset: (m.height - m.footAnchorY) * scale,
  }]
}))

export function getSpriteLayout(sprite) {
  return SPRITE_LAYOUTS.get(sprite) ?? {
    width: PLAYER_VISUAL.idleHeight, height: PLAYER_VISUAL.idleHeight,
    footAnchorX: PLAYER_VISUAL.idleHeight / 2, footAnchorY: PLAYER_VISUAL.idleHeight,
    bottomOffset: 0,
  }
}
