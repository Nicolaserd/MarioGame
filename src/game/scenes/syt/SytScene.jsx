import { useEffect, useRef, useState } from 'react'
import { useGameLoop } from '../../engine/useGameLoop.js'
import { useGameInput } from '../../engine/useGameInput.js'
import { createEmptyKeys } from '../../engine/inputState.js'
import { GameHud } from '../../ui/GameHud.jsx'
import { PauseMenu } from '../../ui/PauseMenu.jsx'
import { SpeechBubble } from '../../ui/SpeechBubble.jsx'
import { LevelOverlay } from '../../ui/LevelOverlay.jsx'
import { SytSprite } from '../../characters/syt/SytSprite.jsx'
import { sytAssets } from '../../characters/syt/sytAssets.js'
import * as mario from '../../characters/mario/marioAssets.js'
import { getSpriteLayout } from '../../characters/mario/marioLayout.js'
import { createSytRun, playerBody, stepSytRun } from './sytSimulation.js'
import { SYT, INTENSITY, formatTime } from './sytConstants.js'
import { SytBackdrop } from './SytBackdrop.jsx'
import './syt.css'

function playerSprite(s) {
  if (s.mode === 'lost') return mario.death3
  if (s.player.hurt) return mario.attacked
  if (s.player.crouched) return mario.crouch
  if (!s.player.grounded) return s.player.vy < 0 ? mario.jump : mario.fall
  if (s.mode !== 'active') return mario.idle1
  return [mario.run1, mario.run2, mario.run3][Math.floor(s.player.runClock / 0.11) % 3]
}

export function SytScene({ onSelectLevel }) {
  const run = useRef(createSytRun())
  const keysRef = useRef(createEmptyKeys())
  const isPausedRef = useRef(false)
  const viewport = useRef(null)
  const [view, setView] = useState(createSytRun)
  const [scale, setScale] = useState(1)
  const [paused, setPaused] = useState(false)
  const [panel, setPanel] = useState('main')
  const [hitboxes, setHitboxes] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const openMenu = () => { keysRef.current = createEmptyKeys(); isPausedRef.current = true; setPaused(true); setPanel('main') }
  const closeMenu = () => { keysRef.current = createEmptyKeys(); isPausedRef.current = false; setPaused(false) }
  const restart = () => { run.current = createSytRun(); setView(structuredClone(run.current)); closeMenu() }
  const start = () => {
    keysRef.current = createEmptyKeys(); run.current.mode = 'active'
    setView(structuredClone(run.current))
  }
  useGameInput({ keysRef, isPausedRef, onOpenMenu: openMenu, onCloseMenu: closeMenu, enabled: view.mode === 'active' || paused })
  useGameLoop({ isPausedRef, onTick: dt => {
    if (run.current.mode !== 'active') return
    stepSytRun(run.current, keysRef.current, dt)
    setView(structuredClone(run.current))
  } })
  useEffect(() => {
    for (const src of Object.values(sytAssets)) {
      const image = new Image()
      image.src = src
    }
    const element = viewport.current
    const resize = () => setScale(Math.min(element.clientWidth / SYT.width, element.clientHeight / SYT.height))
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  const p = view.player
  const sprite = playerSprite(view)
  const layout = getSpriteLayout(sprite)
  const body = playerBody(p)
  const progress = Math.min(100, Math.floor((p.x - SYT.start) / (SYT.finish - SYT.start) * 100))
  const remainingMeters = Math.max(0, Math.ceil((SYT.finish - p.x) / 100))
  const imminent = view.hazards.find(h => !h.done && h.delay <= 0)
  const optionalRoute = view.platforms.some(q => q.x + q.width > p.x && q.x < p.x + 650)
  const instruction = view.warning?.action ?? (imminent ? imminent.action === 'high' ? 'AGÁCHATE' : 'SALTA' : optionalRoute ? 'USB · SALTO OPCIONAL' : 'SIGUE CORRIENDO')
  const attackType = view.warning?.type ?? imminent?.action ?? imminent?.type
  const attackLabel = { high: 'CHIP ALTO DESDE ATRÁS →', low: 'CHIP BAJO DESDE ATRÁS →', minion: '← ESBIRRO AL FRENTE', obstacle: '← OBSTÁCULO AL FRENTE', platform: 'PLATAFORMA SEGURA' }[attackType]
  const status = paused ? 'JUEGO EN PAUSA' : { intro: 'LISTO PARA CORRER', active: 'PERSECUCIÓN EN CURSO', won: 'DATO A SALVO', lost: 'MISIÓN FALLIDA' }[view.mode]
  const threat = view.mode === 'active' ? view.gap < 110 ? '¡TE ALCANZA!' : 'SyT TE PERSIGUE' : view.mode === 'won' ? 'ESCAPE COMPLETADO' : view.mode === 'lost' ? 'INTÉNTALO OTRA VEZ' : 'LÍMITE: DOS MINUTOS'
  return <section ref={viewport} className={`syt-viewport ${paused ? 'syt-paused' : ''} ${reducedMotion ? 'syt-reduced' : ''}`} aria-label="Nivel 3: Sistemas y Tecnología">
    <div className="syt-stage" data-mode={view.mode} data-phase={view.phase} style={{ transform: `translate(-50%, -50%) scale(${scale})` }}>
      <SytBackdrop camera={view.camera} />
      <div className="syt-chapter"><span>03 / SISTEMAS Y TECNOLOGÍA</span><strong>El dato no se borra solo.</strong></div>
      <div className="syt-world" style={{ transform: `translateX(${-view.camera}px)` }}>
        <div className="syt-finish" style={{ left: SYT.finish }}><span>SALIDA SEGURA</span><strong>DATO<br />PERDIDO</strong><i>↓</i></div>
        {view.platforms.map(q => <div className={`syt-platform ${hitboxes ? 'syt-show-hitbox' : ''}`} key={q.id} style={{ left: q.x, top: q.y, width: q.width, height: q.height }}><span>↑ BACKUP SEGURO</span></div>)}
        {view.pickups.map(q => <div className="syt-usb" key={q.id} style={{ left: q.x, top: q.y }} aria-label="Memoria USB: recupera una vida"><i /><span>USB</span><small>+1 VIDA</small></div>)}
        <i aria-hidden="true" className="syt-ground-shadow" style={{ left: view.boss.x + 32, top: SYT.floor - 5, width: 147 }} />
        <i aria-hidden="true" className="syt-ground-shadow" style={{ left: p.x + 5, top: SYT.floor - 5, width: 90, opacity: Math.max(0.13, 0.4 - (SYT.floor - p.y - p.height) / 600), transform: `scaleX(${Math.max(0.55, 1 - (SYT.floor - p.y - p.height) / 350)})` }} />
        <div className="syt-pursuer" style={{ left: view.boss.x, top: SYT.floor - 213 }}>
          <SytSprite pose={view.boss.pose} clock={view.elapsed} /><span>MUJER SyT</span>
        </div>
        <div className={`syt-player ${p.hurt ? 'syt-hurt' : ''}`} style={{ left: p.x, top: p.y, width: p.width, height: p.height }}>
          <img src={sprite} alt="Mario" draggable="false" style={{ width: layout.width, height: layout.height, left: p.width / 2 - layout.footAnchorX, bottom: -layout.bottomOffset }} />
        </div>
        {hitboxes && <div className="syt-hitbox" style={{ left: body.x, top: body.y, width: body.width, height: body.height }} />}
        {view.hazards.filter(h => h.delay <= 0).map(h => <div key={h.id} className={`syt-hazard syt-hazard-${h.type} ${hitboxes ? 'syt-show-hitbox' : ''}`}
          style={{ left: h.x, top: h.y, width: h.width, height: h.height }}>
          {h.type === 'chip' ? <i className="syt-chip-trail" aria-hidden="true" /> : <i className="syt-hazard-shadow" aria-hidden="true" />}
          <SytSprite kind={h.type === 'chip' ? 'chip' : h.art} clock={view.elapsed} />
          {h.type !== 'chip' && <span className="syt-enemy-mark">!</span>}
        </div>)}
      </div>
      <GameHud playerHealth={p.health} maxHealth={SYT.health} heartIcon={mario.heartIcon} round="03" enemyName="Sistemas y Tecnología" onOpenMenu={openMenu}
        runner={{ progress, collected: view.collected, pressure: threat, note: `${remainingMeters} m HASTA LA SALIDA · ${INTENSITY[view.phase].label}` }} />
      <div className={`syt-timer ${view.remaining <= 30 ? 'syt-timer-urgent' : ''}`} role="timer" aria-label={`Tiempo restante ${formatTime(view.remaining)}`}><small>BORRADO EN</small><strong>{formatTime(view.remaining)}</strong></div>
      {view.mode === 'active' && <>
        <SpeechBubble text={view.speech} x={35} y={158} charsPerSecond={45} className="syt-speech" />
        <div className={`syt-cue ${view.warning || imminent ? 'syt-cue-active' : ''} ${optionalRoute ? 'syt-cue-optional' : ''}`}>
          <span>{attackLabel ?? (optionalRoute ? 'RECUPERA UNA VIDA' : INTENSITY[view.phase].label)}</span><strong>{instruction}</strong>
          {view.warning && <i className="syt-cue-charge" style={{ transform: `scaleX(${Math.max(0, Math.min(1, 1 - view.warning.remaining / INTENSITY[view.phase].warning))})` }} />}
        </div>
      </>}
      <footer className="syt-status"><span><i /> {status}</span><p><kbd>ESPACIO / W / ↑</kbd> saltar <b>·</b> <kbd>S / ↓</kbd> agacharse <b>·</b> <kbd>A / D</kbd> ritmo</p><small>ESC · PAUSA</small></footer>
      {view.mode === 'intro' && !paused && <LevelOverlay titleId="syt-title" eyebrow="MARIO Y EL DATO PERDIDO · NIVEL 03" title={<>Escape de <em>SyT.</em></>}>
        <p>Un solo pasillo. Dos minutos. Y una administradora que no acepta un «ahora no».</p>
        <blockquote>«¡Mario! ¡Ese dato no tiene permiso de salida!»</blockquote>
        <div className="level-controls"><span><kbd>ESPACIO / W / ↑</kbd> Saltar</span><span><kbd>S / ↓</kbd> Agacharse</span><span><kbd>D / →</kbd> Acelerar</span><span><kbd>A / ←</kbd> Frenar con cuidado</span></div>
        <small>Mario corre automáticamente. Salta sobre obstáculos y esbirros; agáchate ante chips altos. Los USB recuperan una vida. No dejes que SyT te alcance.</small>
        <button autoFocus type="button" onClick={start}>¡Correr con el dato! →</button>
        <button className="level-secondary" type="button" onClick={openMenu}>Elegir nivel / menú</button>
      </LevelOverlay>}
      {(view.mode === 'won' || view.mode === 'lost') && !paused && <LevelOverlay titleId="syt-result" eyebrow={view.mode === 'won' ? 'COPIA SEGURA COMPLETADA · NIVEL 03' : 'CHECKPOINT · SISTEMAS Y TECNOLOGÍA'} title={view.mode === 'won' ? '¡Dato a salvo!' : 'DATO ELIMINADO — MISIÓN FALLIDA'}>
        <p>{view.mode === 'won' ? 'Mario: «¿Ves? La mejor copia de seguridad son unas buenas zapatillas.»' : view.reason}</p>
        <blockquote>{view.speech}</blockquote>
        <small>Tiempo: {formatTime(Math.floor(view.elapsed))} · USB: {view.collected} · Esquivas: {view.dodged} · Esbirros superados: {view.stomped}</small>
        <button type="button" autoFocus onClick={restart}>{view.mode === 'won' ? 'Volver a correr' : 'Reintentar Nivel 3'} →</button>
        <button className="level-secondary" type="button" onClick={openMenu}>Elegir nivel / menú</button>
      </LevelOverlay>}
      <PauseMenu currentLevel="syt" onSelectLevel={onSelectLevel} isOpen={paused} activePanel={panel} showHitboxes={hitboxes} reducedMotion={reducedMotion} onClose={closeMenu} onReset={restart} onSetPanel={setPanel} onSetShowHitboxes={setHitboxes} onSetReducedMotion={setReducedMotion} />
    </div>
  </section>
}
