export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

export function intersects(rectA, rectB) {
  return (
    rectA.x < rectB.x + rectB.width &&
    rectA.x + rectA.width > rectB.x &&
    rectA.y < rectB.y + rectB.height &&
    rectA.y + rectA.height > rectB.y
  )
}
