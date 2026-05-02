export function PauseMenu({
  isOpen,
  activePanel,
  showHitboxes,
  reducedMotion,
  onClose,
  onReset,
  onSetPanel,
  onSetShowHitboxes,
  onSetReducedMotion,
}) {
  return (
    <div
      className="pause-overlay"
      aria-hidden={!isOpen}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        className="pause-menu"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pause-menu-title"
      >
        <div className="pause-menu-header">
          <p className="pause-kicker">Juego en pausa</p>
          <h2 id="pause-menu-title">
            {activePanel === 'controls'
              ? 'Movimientos'
              : activePanel === 'settings'
                ? 'Ajustes'
                : 'Mario en busca del dato perdido'}
          </h2>
        </div>

        {activePanel === 'main' ? (
          <div className="pause-menu-actions">
            <button type="button" className="pause-primary" onClick={onClose}>
              Continuar
            </button>
            <button type="button" onClick={() => onSetPanel('controls')}>
              Como jugar
            </button>
            <button type="button" onClick={() => onSetPanel('settings')}>
              Ajustes
            </button>
            <button type="button" onClick={onReset}>
              Reiniciar
            </button>
          </div>
        ) : null}

        {activePanel === 'controls' ? (
          <div className="pause-panel">
            <div className="control-list">
              <span>A / Flecha izquierda</span>
              <strong>Mover a la izquierda</strong>
              <span>D / Flecha derecha</span>
              <strong>Mover a la derecha</strong>
              <span>W / Espacio / Flecha arriba</span>
              <strong>Saltar</strong>
              <span>S / Flecha abajo</span>
              <strong>Agacharse</strong>
              <span>P</span>
              <strong>Lanzar pizza / botella en util</strong>
              <span>G</span>
              <strong>Activar la util</strong>
              <span>O</span>
              <strong>Escudo</strong>
              <span>M</span>
              <strong>Forzar muerte</strong>
              <span>Escape</span>
              <strong>Pausar o volver al juego</strong>
            </div>
            <button type="button" onClick={() => onSetPanel('main')}>
              Volver
            </button>
          </div>
        ) : null}

        {activePanel === 'settings' ? (
          <div className="pause-panel">
            <label className="setting-row">
              <span>Mostrar hitboxes</span>
              <input
                type="checkbox"
                checked={showHitboxes}
                onChange={(event) => onSetShowHitboxes(event.target.checked)}
              />
            </label>
            <label className="setting-row">
              <span>Animacion suave del menu</span>
              <input
                type="checkbox"
                checked={!reducedMotion}
                onChange={(event) => onSetReducedMotion(!event.target.checked)}
              />
            </label>
            <button type="button" onClick={() => onSetPanel('main')}>
              Volver
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
