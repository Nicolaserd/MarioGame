import { useEffect } from 'react'

import { useRef } from 'react'
import { clearGameInput } from './inputState.js'

export function useGameInput({ keysRef, isPausedRef, onOpenMenu, onCloseMenu, enabled = true }) {
  const callbacksRef = useRef({ onOpenMenu, onCloseMenu })
  useEffect(() => {
    callbacksRef.current = { onOpenMenu, onCloseMenu }
  }, [onOpenMenu, onCloseMenu])
  useEffect(() => {
    const onKeyChange = (pressed) => (event) => {
      if (!enabled) return
      if (event.target instanceof HTMLElement && (
        event.target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)
      )) return
      const key = typeof event.key === 'string' ? event.key.toLowerCase() : ''
      const code = event.code

      if (pressed && (event.key === 'Escape' || code === 'Escape')) {
        event.preventDefault()
        if (event.repeat) return
        if (isPausedRef.current) {
          callbacksRef.current.onCloseMenu()
        } else {
          callbacksRef.current.onOpenMenu()
        }
        return
      }

      if (isPausedRef.current) {
        if (!pressed) clearGameInput(keysRef)
        return
      }

      if (code === 'ArrowLeft' || code === 'ArrowRight') event.preventDefault()

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
        if (!event.repeat) {
          keysRef.current.jumpQueued = true
        }
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
    const releaseAndPause = () => {
      clearGameInput(keysRef)
      if (enabled && !isPausedRef.current) callbacksRef.current.onOpenMenu()
    }
    const visibilityChange = () => { if (document.hidden) releaseAndPause() }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', releaseAndPause)
    document.addEventListener('visibilitychange', visibilityChange)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', releaseAndPause)
      document.removeEventListener('visibilitychange', visibilityChange)
      clearGameInput(keysRef)
    }
  }, [enabled, isPausedRef, keysRef])
}
