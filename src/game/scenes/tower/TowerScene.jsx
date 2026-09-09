import { useEffect, useRef, useState } from 'react'
import { useGameLoop } from '../../engine/useGameLoop.js'
import { useGameInput } from '../../engine/useGameInput.js'
import { createEmptyKeys } from '../../engine/inputState.js'
import { GameHud } from '../../ui/GameHud.jsx'
import { PauseMenu } from '../../ui/PauseMenu.jsx'
import { SpeechBubble } from '../../ui/SpeechBubble.jsx'
import { TrumpSprite } from '../../characters/trump/TrumpSprite.jsx'
import { TRUMP } from '../../characters/trump/trumpConstants.js'
import * as mario from '../../characters/mario/marioAssets.js'
import { getSpriteLayout } from '../../characters/mario/marioLayout.js'
import { createTowerBattle, stepTower } from './towerSimulation.js'
import { TOWER, HERO } from './towerConstants.js'
import { TowerBackdrop } from './TowerBackdrop.jsx'
import './tower.css'
import './towerPolish.css'

function heroSprite(s) {
  const p = s.player
  if (s.mode === 'dying' || s.mode === 'lost') return mario.death3
  if (p.shield) return mario.shield2
  if (p.hurt) return mario.attacked
  if (p.shot > 0.1) return mario.throwPose
  if (p.vy < 0) return mario.jump
  if (p.vy > 0) return mario.fall
  if (p.crouched) return mario.crouch
  if (p.moving) return [mario.run1, mario.run2, mario.run3][Math.floor(s.time * 9) % 3]
  return Math.floor(s.time * 2) % 2 ? mario.idle1 : mario.idle2
}

export function TowerScene({ onRestartCampaign }) {
  const battle = useRef(createTowerBattle())
  const keysRef = useRef(createEmptyKeys())
  const isPausedRef = useRef(false)
  const viewport = useRef(null)
  const [view, setView] = useState(createTowerBattle)
  const [scale, setScale] = useState(1)
  const [paused, setPaused] = useState(false)
  const [panel, setPanel] = useState('main')
  const [hitboxes, setHitboxes] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const openMenu = () => { keysRef.current = {}; isPausedRef.current = true; setPaused(true); setPanel('main') }
  const closeMenu = () => { keysRef.current = {}; isPausedRef.current = false; setPaused(false) }
  const restart = () => {
    battle.current = createTowerBattle()
    setView(structuredClone(battle.current))
    closeMenu()
  }
  const start = () => {
    keysRef.current = {}; battle.current.mode = 'active'; battle.current.speech = ''; battle.current.boss.pose = 'idle'
    setView(structuredClone(battle.current))
  }
  useGameInput({ keysRef, isPausedRef, onOpenMenu: openMenu, onCloseMenu: closeMenu, enabled: view.mode === 'active' })
  useGameLoop({ isPausedRef, onTick: dt => {
    if (['intro', 'won', 'lost'].includes(battle.current.mode)) return
    stepTower(battle.current, keysRef.current, dt)
    setView(structuredClone(battle.current))
  } })
  useEffect(() => {
    const element = viewport.current
    const resize = () => setScale(Math.min(element.clientWidth / TOWER.width, element.clientHeight / TOWER.height))
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  const p = view.player
  const sprite = heroSprite(view)
  const spriteLayout = getSpriteLayout(sprite)
  const footAnchor = p.facing < 0 ? spriteLayout.width - spriteLayout.footAnchorX : spriteLayout.footAnchorX
  const finished = view.mode === 'won' || view.mode === 'lost'
  return <section ref={viewport} className={`tower-viewport ${paused ? 'tower-paused' : ''} ${reducedMotion ? 'tower-reduced' : ''}`} aria-label="Batalla 2: La Torre Dorada">
    <div className="tower-stage" style={{ transform: `translate(-50%, -50%) scale(${scale})` }} data-mode={view.mode}>
      <TowerBackdrop />
      <header className="tower-chapter"><span>02 / LA TORRE DORADA</span><h1>El último trato</h1><small>DONALD TRUMP · {view.phase === 2 ? 'FASE 2 · FIEBRE DEL ORO' : 'EL MAGNATE DE LA AZOTEA'}</small></header>
      <div className="tower-action">
        {view.boss.pose === 'windup' && view.attack?.type === 'gold' && view.targets.map((x, i) => <div key={i} className="gold-warning" style={{ left: x }} />)}
        <div className={`tower-boss ${hitboxes ? 'debug-box' : ''}`} style={{ left: view.boss.x, top: view.boss.y, width: view.boss.width, height: view.boss.height }}><TrumpSprite pose={view.boss.pose} hurt={view.boss.hurt} poseTime={view.boss.poseTime} attack={view.attack?.type} /></div>
        <div className={`tower-hero ${p.hurt ? 'hero-hurt' : ''} ${p.utility ? 'hero-utility' : ''} ${view.mode === 'dying' ? 'hero-dying' : ''} ${hitboxes ? 'debug-box' : ''}`} style={{ left: p.x, top: p.y, width: p.width, height: p.height }}>
          <img src={sprite} alt="Mario" draggable="false" style={{ transform: `scaleX(${p.facing})`, width: spriteLayout.width, height: spriteLayout.height, left: p.width / 2 - footAnchor }} />
          {p.shield > 0 && <i className="tower-shield" />}
        </div>
        {view.projectiles.map(q => <div key={q.id} className={`tower-projectile projectile-${q.type} ${hitboxes ? 'debug-box' : ''}`} style={{ left: q.x, top: q.y, width: q.width, height: q.height }}>
          {q.friendly ? <img src={q.type === 'pizza' ? mario.thrownPizza : mario.bottleIcon} alt="" /> : q.type === 'contract' ? '≡' : q.type === 'gold' ? '$' : null}
        </div>)}
        {view.mode !== 'intro' && <SpeechBubble text={view.speech} x={510} y={168} charsPerSecond={36} className="tower-speech" />}
      </div>
      <GameHud playerHealth={p.health} maxHealth={HERO.health} pizzaAmmo={p.ammo} utilityCharges={p.charges} maxUtilityCharges={HERO.utilityCharges}
        enemyName="Donald Trump" round="02"
        enemy={{ active: true, health: view.boss.health }} maxEnemyHealth={TRUMP.health} heartIcon={mario.heartIcon} pizzaIcon={mario.pizzaIcon} utilityIcon={mario.bottleIcon} onOpenMenu={openMenu} />
      <div className="tower-status"><span>{view.attack ? view.attack.label : 'ENCUENTRA TU MOMENTO'}</span><strong>{view.attack ? view.attack.hint : 'P: pizza · G: botellas · O: escudo'}</strong><small>{p.shieldCooldown > 0 ? `Escudo en ${Math.ceil(p.shieldCooldown)} s` : 'Escudo listo'}{p.utility > 0 ? ` · Botellas: ${Math.ceil(p.utility)} s` : ''}</small></div>
      {view.mode === 'intro' && <div className="tower-overlay"><div className="tower-card" role="dialog" aria-modal="true" aria-labelledby="tower-title">
        <span className="tower-eyebrow">DOCUMENTO CORRUPTO DERROTADO · CAPÍTULO 02</span><h2 id="tower-title">La Torre<br /><em>Dorada.</em></h2>
        <p>El dato perdido está en la última planta. Su dueño tiene otros planes.</p>
        <blockquote>{TRUMP.intro}</blockquote><p className="tower-tip">120 de vida · 3 ataques · 2 fases<br />Salta el muro. Esquiva el oro. Devuelve el trato con una pizza.</p>
        <button autoFocus type="button" onClick={start}>¡Vamos por ese dato! <span>→</span></button><small>Vida y recursos restaurados. Reintento desde esta batalla.</small>
      </div></div>}
      {finished && <div className="tower-overlay"><div className="tower-card" role="dialog" aria-modal="true" aria-labelledby="tower-result">
        <span className="tower-eyebrow">{view.mode === 'won' ? 'ARCHIVO RECUPERADO' : 'CHECKPOINT · TORRE DORADA'}</span><h2 id="tower-result">{view.mode === 'won' ? '¡Trato cerrado!' : 'Una pizza más.'}</h2>
        <p>{view.mode === 'won' ? 'Mario: «El dato es de todos. Las pizzas… esas son mías.»' : 'El magnate ganó esta ronda. Ya conoces sus trucos.'}</p>
        <button type="button" onClick={restart}>{view.mode === 'won' ? 'Repetir la batalla' : 'Reintentar batalla'} →</button>
        <button className="tower-secondary" type="button" onClick={onRestartCampaign}>Volver al primer capítulo</button>
      </div></div>}
      <PauseMenu isOpen={paused} activePanel={panel} showHitboxes={hitboxes} reducedMotion={reducedMotion} onClose={closeMenu} onReset={restart} onSetPanel={setPanel} onSetShowHitboxes={setHitboxes} onSetReducedMotion={setReducedMotion} />
    </div>
  </section>
}
