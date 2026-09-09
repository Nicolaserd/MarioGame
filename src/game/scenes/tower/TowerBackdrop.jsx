export function TowerBackdrop() {
  return <div className="tower-backdrop" aria-hidden="true">
    <div className="tower-sun" />
    <div className="tower-cloud cloud-one" /><div className="tower-cloud cloud-two" />
    <div className="tower-skyline">{[110, 155, 90, 205, 130, 175, 115, 230, 150, 105, 180, 125].map((height, i) => <i key={i} style={{ height, width: 52 + (i % 3) * 17 }} />)}</div>
    <div className="tower-balustrade" />
    <div className="tower-floor" />
    <div className="tower-sign"><span>THE GOLDEN TOWER</span><small>EL DATO ESTÁ EN LO MÁS ALTO</small></div>
    <div className="tower-podium"><span>T</span><small>THE DEAL</small></div>
    <div className="tower-case">▣<span>DATO PERDIDO</span></div>
  </div>
}
