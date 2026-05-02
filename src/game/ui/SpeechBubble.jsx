export function SpeechBubble({ text, x, y, className = '', showCaret = false }) {
  if (!text) {
    return null
  }

  return (
    <div
      className={`enemy-speech ${className}`.trim()}
      aria-live="polite"
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
    >
      {text}
      {showCaret ? (
        <span aria-hidden="true" className="enemy-speech-caret">
          |
        </span>
      ) : null}
    </div>
  )
}
