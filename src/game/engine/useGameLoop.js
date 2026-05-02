import { useEffect, useRef } from 'react'

export function useGameLoop({ isPausedRef, onTick }) {
  const onTickRef = useRef(onTick)

  useEffect(() => {
    onTickRef.current = onTick
  }, [onTick])

  useEffect(() => {
    let animationFrame = 0
    let previousTime = performance.now()

    const loop = (time) => {
      const deltaTime = (time - previousTime) / 1000
      previousTime = time

      if (!isPausedRef.current) {
        onTickRef.current(deltaTime)
      }

      animationFrame = window.requestAnimationFrame(loop)
    }

    animationFrame = window.requestAnimationFrame(loop)

    return () => {
      window.cancelAnimationFrame(animationFrame)
    }
  }, [isPausedRef])
}
