import { attacked, brake, crouch, death1, death2, death3, fall, idle1, idle2, jump, push1, push2, run1, run2, run3, shield1, shield2, throwPose, util1, util2, util3, util4, util5, util6 } from './marioAssets.js'
import { PLAYER_VISUAL } from './marioConstants.js'

export const SPRITE_METRICS = new Map([
  [
    idle1,
    {
      width: 496,
      height: 910,
      footAnchorX: 200.66,
    },
  ],
  [
    idle2,
    {
      width: 512,
      height: 939,
      footAnchorX: 221.29,
    },
  ],
  [
    brake,
    {
      width: 623,
      height: 897,
      footAnchorX: 297.94,
    },
  ],
  [
    run1,
    {
      width: 1076,
      height: 726,
      footAnchorX: 592.74,
    },
  ],
  [
    run2,
    {
      width: 991,
      height: 727,
      footAnchorX: 532.18,
    },
  ],
  [
    run3,
    {
      width: 1078,
      height: 694,
      footAnchorX: 516.94,
    },
  ],
  [
    jump,
    {
      width: 1014,
      height: 797,
      footAnchorX: 425.28,
    },
  ],
  [
    fall,
    {
      width: 851,
      height: 728,
      footAnchorX: 411.53,
    },
  ],
  [
    crouch,
    {
      width: 690,
      height: 790,
      footAnchorX: 310,
      visualHeight: PLAYER_VISUAL.idleHeight * PLAYER_VISUAL.crouchHeightRatio,
    },
  ],
  [
    death1,
    {
      width: 610,
      height: 910,
      footAnchorX: 290,
    },
  ],
  [
    death2,
    {
      width: 1300,
      height: 560,
      footAnchorX: 625,
    },
  ],
  [
    death3,
    {
      width: 1020,
      height: 840,
      footAnchorX: 510,
    },
  ],
  [
    shield1,
    {
      width: 560,
      height: 900,
      footAnchorX: 270,
    },
  ],
  [
    shield2,
    {
      width: 900,
      height: 920,
      footAnchorX: 350,
    },
  ],
  [
    push1,
    {
      width: 1134,
      height: 667,
      footAnchorX: 430,
    },
  ],
  [
    push2,
    {
      width: 1374,
      height: 778,
      footAnchorX: 1020,
    },
  ],
  [
    attacked,
    {
      width: 905,
      height: 954,
      footAnchorX: 452,
    },
  ],
  [
    util1,
    {
      width: 900,
      height: 930,
      footAnchorX: 452,
    },
  ],
  [
    util2,
    {
      width: 900,
      height: 930,
      footAnchorX: 452,
    },
  ],
  [
    util3,
    {
      width: 900,
      height: 930,
      footAnchorX: 452,
    },
  ],
  [
    util4,
    {
      width: 900,
      height: 930,
      footAnchorX: 452,
    },
  ],
  [
    util5,
    {
      width: 900,
      height: 930,
      footAnchorX: 452,
    },
  ],
  [
    util6,
    {
      width: 930,
      height: 945,
      footAnchorX: 472,
    },
  ],
  [
    throwPose,
    {
      width: 1536,
      height: 1024,
      footAnchorX: 545,
    },
  ],
])

export const IDLE_FRAMES = [idle1, idle2]

export const RUN_FRAMES = [run1, run2, run3]

export const UTILITY_FRAMES = [util1, util2, util3, util4, util5, util6]

export const DEATH_FRAMES = [death1, death2, death3]

export const PLAYER_VISUAL_SCALE =
  PLAYER_VISUAL.idleHeight / PLAYER_VISUAL.referenceHeight

export const SPRITE_LAYOUTS = new Map(
  Array.from(SPRITE_METRICS.entries(), ([sprite, metrics]) => [
    sprite,
    (() => {
      const scale =
        metrics.visualHeight === undefined
          ? PLAYER_VISUAL_SCALE
          : metrics.visualHeight / metrics.height

      return {
        width: Number((metrics.width * scale).toFixed(2)),
        height: Number((metrics.height * scale).toFixed(2)),
        footAnchorX: Number((metrics.footAnchorX * scale).toFixed(2)),
      }
    })(),
  ]),
)

export function getSpriteLayout(sprite) {
  return (
    SPRITE_LAYOUTS.get(sprite) ?? {
      width: PLAYER_VISUAL.idleHeight,
      height: PLAYER_VISUAL.idleHeight,
      footAnchorX: PLAYER_VISUAL.idleHeight / 2,
    }
  )
}

