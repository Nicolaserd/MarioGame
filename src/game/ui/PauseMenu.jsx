export function PauseMenu({
  isOpen,
  activePanel,
  showHitboxes,
  reducedMotion,
  onClose,
  onReset,
  currentLevel,
  onSelectLevel,
  onSetPanel,
  onSetShowHitboxes,
  onSetReducedMotion,
}) {
  if (!isOpen) {
    return null
  }

  return (
    <div
      className="pause-overlay is-visible"
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
                : activePanel === 'levels'
                  ? 'Elegir nivel'
                  : 'Mario en busca del dato perdido'}
          </h2>
        </div>

        {activePanel === 'main' ? (
          <div className="pause-menu-actions">
            <button type="button" className="pause-primary" onClick={onClose}>
              Continuar
            </button>
            <button type="button" onClick={() => onSetPanel('levels')}>
              Elegir nivel
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

        {activePanel === 'levels' ? (
          <div className="pause-panel">
            <p>Cambiar de nivel inicia ese nivel desde el principio.</p>
            {[
              { id: 'office', label: 'Nivel 1 · La oficina' },
              { id: 'tower', label: 'Nivel 2 · La Torre Dorada' },
              { id: 'syt', label: 'Nivel 3 · Sistemas y Tecnología' },
            ].map((level) => (
              <button
                key={level.id}
                type="button"
                aria-current={currentLevel === level.id ? 'true' : undefined}
                onClick={() => currentLevel === level.id ? onClose() : onSelectLevel(level.id)}
              >
                {level.label}{currentLevel === level.id ? ' (actual · continuar)' : ''}
              </button>
            ))}
            <button type="button" onClick={() => onSetPanel('main')}>
              Volver
            </button>
          </div>
        ) : null}

        {activePanel === 'controls' ? (
          <div className="pause-panel">
            <div className="control-list">
              <span>A / Flecha izquierda</span>
              <strong>{currentLevel === 'syt' ? 'Frenar (SyT se acerca)' : 'Mover a la izquierda'}</strong>
              <span>D / Flecha derecha</span>
              <strong>{currentLevel === 'syt' ? 'Acelerar el avance automático' : 'Mover a la derecha'}</strong>
              <span>W / Espacio / Flecha arriba</span>
              <strong>Saltar</strong>
              <span>S / Flecha abajo</span>
              <strong>Agacharse</strong>
              {currentLevel !== 'syt' && <><span>P</span>
              <strong>Lanzar pizza / botella en util</strong>
              <span>G</span>
              <strong>Activar la util</strong>
              <span>O</span>
              <strong>Escudo</strong></>}
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
