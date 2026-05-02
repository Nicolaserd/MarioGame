import { useEffect, useRef, useState } from 'react'

export function IntroVideoOverlay({ src, isOpen, onSkip }) {
  const videoRef = useRef(null)
  const [needsUserStart, setNeedsUserStart] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) {
      return undefined
    }

    if (!isOpen) {
      video.pause()
      return undefined
    }

    video.currentTime = 0
    video.muted = false

    const playPromise = video.play()
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.then(
        () => {
          setNeedsUserStart(false)
        },
        () => {
          setNeedsUserStart(true)
        },
      )
    }

    return () => {
      video.pause()
    }
  }, [isOpen])

  const handleStart = () => {
    const video = videoRef.current
    if (!video) {
      return
    }
    video.currentTime = 0
    video.muted = false
    setNeedsUserStart(false)
    video.play().catch(() => {})
  }

  if (!isOpen) {
    return null
  }

  return (
    <div
      className={`intro-overlay ${needsUserStart ? 'is-waiting-for-start' : ''}`}
      role="dialog"
      aria-label="Intro del juego"
    >
      <video
        ref={videoRef}
        className="intro-video"
        src={src}
        playsInline
        preload="auto"
        onEnded={onSkip}
      />
      {needsUserStart ? (
        <button
          type="button"
          className="intro-start-button"
          onClick={handleStart}
        >
          Iniciar intro
        </button>
      ) : null}
      <button
        type="button"
        className="intro-skip-button"
        onClick={onSkip}
        aria-label="Saltar intro"
      >
        Skip »
      </button>
    </div>
  )
}
