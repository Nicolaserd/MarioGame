import './fightHud.css'

function Resource({ label, value, max, icon }) {
  return <div className="fight-resource" aria-label={`${label} ${value} de ${max}`}>
    <img src={icon} alt="" draggable="false" />
    <span>{label}</span><strong>{value}<small> / {max}</small></strong>
  </div>
}

export function GameHud({
  playerHealth, maxHealth, pizzaAmmo, utilityCharges, maxUtilityCharges,
  enemy, maxEnemyHealth, heartIcon, pizzaIcon, utilityIcon, onOpenMenu,
  enemyName = 'Documento Corrupto', round = '01',
}) {
  const health = Math.max(0, Math.min(maxHealth, playerHealth))
  const bossHealth = Math.max(0, Math.min(maxEnemyHealth, enemy.health))
  return <div className="fight-hud">
    <div className="fight-side fight-player">
      <div className="fight-name"><span>JUGADOR 01</span><strong>MARIO</strong><small>{health} / {maxHealth}</small></div>
      <div className="fight-track" role="progressbar" aria-label="Vida de Mario" aria-valuemin={0} aria-valuemax={maxHealth} aria-valuenow={health}>
        <div className="fight-fill" style={{ width: `${health / maxHealth * 100}%` }} />
      </div>
      <div className="fight-resources">
        <Resource label="PIZZA" value={pizzaAmmo} max={5} icon={pizzaIcon} />
        <Resource label="GASEOSA" value={utilityCharges} max={maxUtilityCharges} icon={utilityIcon} />
        <img className="fight-heart" src={heartIcon} alt="" />
      </div>
    </div>
    <button className="fight-round" type="button" aria-label="Abrir menu del juego" onClick={onOpenMenu}><small>ROUND</small><strong>{round}</strong><span>Ⅱ</span></button>
    <div className="fight-side fight-enemy">
      <div className="fight-name"><span>{enemy.active ? 'BOSS' : 'EN ESPERA'}</span><strong>{enemyName}</strong><small>{bossHealth} / {maxEnemyHealth}</small></div>
      <div className="fight-track" role="progressbar" aria-label={`Vida de ${enemyName}`} aria-valuemin={0} aria-valuemax={maxEnemyHealth} aria-valuenow={bossHealth}>
        <div className="fight-fill" style={{ width: `${bossHealth / maxEnemyHealth * 100}%` }} />
      </div>
      <div className="fight-opponent-note">{enemy.active ? 'LEE SUS ATAQUES · ELIGE TU MOMENTO' : 'AVANZA PARA INICIAR EL COMBATE'}</div>
    </div>
  </div>
}
