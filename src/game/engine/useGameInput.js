import { useEffect } from 'react'

export function useGameInput({ keysRef, isPausedRef, onOpenMenu, onCloseMenu }) {
  useEffect(() => {
    const onKeyChange = (pressed) => (event) => {
      const key = typeof event.key === 'string' ? event.key.toLowerCase() : ''
      const code = event.code

      if (pressed && (event.key === 'Escape' || code === 'Escape')) {
        event.preventDefault()
        if (isPausedRef.current) {
          onCloseMenu()
        } else {
          onOpenMenu()
        }
        return
      }

      if (isPausedRef.current) {
        return
      }

      if (key === 'p' || code === 'KeyP') {
        event.preventDefault()

        if (pressed && !keysRef.current.throwHeld) {
          keysRef.current.throwQueued = true
        }

        keysRef.current.throwHeld = pressed
        return
      }

      if (key === 'g' || code === 'KeyG') {
        event.preventDefault()

        if (pressed && !keysRef.current.utilityHeld) {
          keysRef.current.utilityQueued = true
        }

        keysRef.current.utilityHeld = pressed
        return
      }

      if (key === 'o' || code === 'KeyO') {
        event.preventDefault()

        if (pressed && !keysRef.current.shieldHeld) {
          keysRef.current.shieldQueued = true
        }

        keysRef.current.shieldHeld = pressed
        return
      }

      if (pressed && (key === 'm' || code === 'KeyM')) {
        event.preventDefault()
        keysRef.current.deathQueued = true
        return
      }

      if (event.repeat) {
        return
      }

      if (
        event.key === 'ArrowLeft' ||
        event.code === 'ArrowLeft' ||
        key === 'a' ||
        event.code === 'KeyA'
      ) {
        keysRef.current.left = pressed
      }

      if (
        event.key === 'ArrowRight' ||
        event.code === 'ArrowRight' ||
        key === 'd' ||
        event.code === 'KeyD'
      ) {
        keysRef.current.right = pressed
      }

      if (
        pressed &&
        (event.key === ' ' ||
          event.code === 'Space' ||
          event.key === 'ArrowUp' ||
          event.code === 'ArrowUp' ||
          key === 'w' ||
          event.code === 'KeyW')
      ) {
        event.preventDefault()
        keysRef.current.jumpQueued = true
      }

      if (
        event.key === 'ArrowDown' ||
        event.code === 'ArrowDown' ||
        key === 's' ||
        event.code === 'KeyS'
      ) {
        event.preventDefault()
        keysRef.current.down = pressed
      }
    }

    const handleKeyDown = onKeyChange(true)
    const handleKeyUp = onKeyChange(false)

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [isPausedRef, keysRef, onCloseMenu, onOpenMenu])
}
