export const PLAYER = {
  width: 96,
  height: 172,
  health: 5,
  pizzaAmmo: 5,
}

export const PLAYER_VISUAL = {
  idleHeight: 172,
  referenceHeight: 910,
  crouchHeightRatio: 0.6,
  groundSink: 1,
}

export const PHYSICS = {
  gravity: 1950,
  acceleration: 1200,
  friction: 1400,
  maxSpeed: 300,
  jumpVelocity: 760,
  brakeDuration: 0.38,
  landingBrakeDuration: 0.32,
  brakeTriggerSpeed: 110,
  runThreshold: 60,
  airStateThreshold: 45,
}

export const PUSH = {
  duration: 2,
  slideDuration: 1.28,
}

export const HURT = {
  duration: 0.34,
}

export const ANIMATION = {
  idleFrameTime: 0.5,
  runFrameTime: 0.11,
  utilityFrameTime: 0.5,
}

export const DEATH = {
  frameDurations: [1.35, 1.35, 2.1],
  riseDistance: 38,
}

export const SHIELD = {
  duration: 3,
  cooldown: 9,
  introDuration: 0.22,
}
