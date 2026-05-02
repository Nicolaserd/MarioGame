export const SCENE = {
  width: 960,
  height: 560,
}

export const WORLD = {
  width: 4200,
  killY: 900,
}

export const FLOOR = {
  y: 460,
  height: 136,
  surfaceInset: 10,
}

export const FLOOR_SEGMENTS = [
  { x: -120, width: WORLD.width + 240 },
]

export const SPAWN = {
  x: 92,
}

export const floorSurfaceY = FLOOR.y + FLOOR.surfaceInset
