import { PLAYER, PHYSICS } from '../../characters/mario/marioConstants.js'

export const SYT = {
  width: 960, height: 560, floor: 442, duration: 120, start: 360, finish: 32160,
  speed: 280, sprintSpeed: 296, brakeSpeed: 175, crouchSpeed: 265,
  gravity: PHYSICS.gravity, jump: PHYSICS.jumpVelocity,
  health: PLAYER.health, playerWidth: PLAYER.width, playerHeight: PLAYER.height,
  crouchHeight: PLAYER.crouchHeight, immunity: 1.6,
  initialGap: 225, maxGap: 245, captureGap: 40,
}

export const INTENSITY = [
  { label: 'INICIANDO PERSECUCIÓN', interval: 5.8, warning: 1.5 },
  { label: 'TRÁFICO HOSTIL', interval: 4.8, warning: 1.4 },
  { label: 'SISTEMA EN ALERTA', interval: 4.1, warning: 1.3 },
  { label: 'BORRADO INMINENTE', interval: 3.5, warning: 1.2 },
]

export function formatTime(seconds) {
  const value = Math.max(0, Math.ceil(seconds))
  return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`
}
