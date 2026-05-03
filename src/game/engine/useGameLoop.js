import { useEffect, useRef } from 'react'

export function useGameLoop({ isPausedRef, onTick }) {
  const onTickRef = useRef(onTick)

  useEffect(() => {
    onTickRef.current = onTick
  }, [onTick])

  useEffect(() => {
    let animationFrame = 0
    let intervalId = 0
    let previousTime = performance.now()

    const tick = (time) => {
      const deltaTime = (time - previousTime) / 1000
      if (deltaTime <= 0) {
        return
      }

      previousTime = time

      if (!isPausedRef.current) {
        onTickRef.current(deltaTime)
      }
    }

    const loop = (time) => {
      tick(time)

      animationFrame = window.requestAnimationFrame(loop)
    }

    animationFrame = window.requestAnimationFrame(loop)
    intervalId = window.setInterval(() => {
      const now = performance.now()

      if (now - previousTime > 40) {
        tick(now)
      }
    }, 16)

    return () => {
      window.cancelAnimationFrame(animationFrame)
      window.clearInterval(intervalId)
    }
  }, [isPausedRef])
}
