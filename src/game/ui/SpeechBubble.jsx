import { useEffect, useState } from 'react'

const DEFAULT_CHARS_PER_SECOND = 24

export function SpeechBubble({
  text,
  x,
  y,
  className = '',
  showCaret = false,
  charsPerSecond = DEFAULT_CHARS_PER_SECOND,
}) {
  const [animationState, setAnimationState] = useState({
    sourceText: '',
    visibleText: '',
  })

  useEffect(() => {
    if (!text) {
      const resetId = window.setTimeout(() => {
        setAnimationState({
          sourceText: '',
          visibleText: '',
        })
      }, 0)

      return () => {
        window.clearTimeout(resetId)
      }
    }

    const characters = Array.from(text)
    const safeCharsPerSecond = Math.max(1, charsPerSecond)
    const intervalMs = 1000 / safeCharsPerSecond
    let visibleLength = 0

    const intervalId = window.setInterval(() => {
      visibleLength += 1
      setAnimationState({
        sourceText: text,
        visibleText: characters.slice(0, visibleLength).join(''),
      })

      if (visibleLength >= characters.length) {
        window.clearInterval(intervalId)
      }
    }, intervalMs)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [charsPerSecond, text])

  if (!text) {
    return null
  }

  const visibleText =
    animationState.sourceText === text ? animationState.visibleText : ''

  return (
    <div
      className={`enemy-speech ${className}`.trim()}
      aria-live="polite"
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
    >
      {visibleText}
      {showCaret ? (
        <span aria-hidden="true" className="enemy-speech-caret">
          |
        </span>
      ) : null}
    </div>
  )
}
