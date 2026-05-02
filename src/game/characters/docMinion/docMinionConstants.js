import { PLAYER_VISUAL } from '../mario/marioConstants.js'

export const DOC_MINION = {
  activationHealthRatio: 0.5,
  width: 31,
  height: Math.round(PLAYER_VISUAL.idleHeight * 0.4),
  hitboxWidth: 24,
  hitboxHeight: 54,
  damage: 1,
  speed: 245,
  frameTime: 0.1,
  spawnCooldownMin: 4,
  spawnCooldownMax: 8,
  spawnBossOffsetX: 18,
  maxAlive: 4,
  emergeDuration: 0.2,
  groundSink: 0,
}
