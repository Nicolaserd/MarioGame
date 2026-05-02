export function GameHud({
  playerHealth,
  maxHealth,
  pizzaAmmo,
  utilityCharges,
  maxUtilityCharges,
  enemy,
  maxEnemyHealth,
  heartIcon,
  pizzaIcon,
  utilityIcon,
  onOpenMenu,
}) {
  return (
    <>
      {enemy.active ? (
        <div
          className="enemy-health-hud"
          aria-label={`Vida enemigo ${enemy.health} de ${maxEnemyHealth}`}
        >
          <span>{enemy.health}</span>
          <div className="enemy-health-track">
            <div
              className="enemy-health-fill"
              style={{
                width: `${(enemy.health / maxEnemyHealth) * 100}%`,
              }}
            />
          </div>
        </div>
      ) : null}

      <button
        className="game-menu-button"
        type="button"
        aria-label="Abrir menu del juego"
        onClick={onOpenMenu}
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>

      <div className="health-hud" aria-label={`Vida ${playerHealth} de ${maxHealth}`}>
        <div className="heart-row">
          {Array.from({ length: maxHealth }, (_, index) => (
            <img
              key={index}
              className={index < playerHealth ? 'heart-full' : 'heart-empty'}
              src={heartIcon}
              alt=""
              draggable="false"
            />
          ))}
        </div>

        <div className="pizza-ammo-row" aria-label={`Pizzas ${pizzaAmmo} de 5`}>
          {Array.from({ length: pizzaAmmo }, (_, index) => (
            <img
              key={index}
              className="pizza-full"
              src={pizzaIcon}
              alt=""
              draggable="false"
            />
          ))}
        </div>

        <div
          className="utility-charge-row"
          aria-label={`Util ${utilityCharges} de ${maxUtilityCharges}`}
        >
          {Array.from({ length: utilityCharges }, (_, index) => (
            <img
              key={index}
              className="utility-charge-full"
              src={utilityIcon}
              alt=""
              draggable="false"
            />
          ))}
        </div>
      </div>
    </>
  )
}
