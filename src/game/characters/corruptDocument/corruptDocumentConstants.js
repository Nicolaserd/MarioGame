import { PLAYER } from '../mario/marioConstants.js'

export const ENEMY = {
  health: 100,
  width: 350,
  height: Math.round(PLAYER.height * 1.3),
  hitboxWidth: 210,
  hitboxHeight: Math.round(PLAYER.height * 1.3),
  enterSpeed: 132,
  spawnDistance: 840,
  stopDistance: 560,
  triggerDistance: 24,
  walkFrameTime: 0.26,
  talkFrameTime: 0.28,
  talkStartDelay: 0.45,
  talkCharsPerSecond: 24,
  talkHoldAfterText: 2,
  deathFrameTime: 1.4,
  groundSink: 18,
}

export const ENEMY_TALK_TEXT =
  'Soy documento corrupto .doc, vengo como venganza por toda la caca puesta en mí'
export const ENEMY_CELEBRATION_TEXT = 'Soy el exploid supremo padre!'
export const MARIO_ENEMY_DEFEAT_TEXT =
  'Ese documento no estaba bien formateado, hora de ir por unas pizzas'
export const MARIO_ENEMY_DEFEAT_SPEECH_TIME = 8
