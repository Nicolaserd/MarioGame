import { useId } from 'react'
import { sytAssets } from './sytAssets.js'
import { sytMasks } from './sytMasks.js'

const feet = { run: [705, 678, 705], attack: [672, 675, 675], jump: [708, 708, 708], minion: [704, 654, 704] }
// The chips are not equally spaced in their source sheet. Crop each solid core;
// the decorative trail is rendered separately and never enlarges the hitbox.
const chips = ['151 268 320 350', '740 267 320 352', '1318 268 320 350']

export function SytSprite({ pose = 'run', clock = 0, kind = 'woman' }) {
  const maskId = useId()
  let sheet = kind === 'woman' ? 'run' : kind
  let frame = Math.floor(clock / 0.12) % 3
  if (kind === 'woman') {
    if (['windup', 'throw', 'point', 'laugh', 'react'].includes(pose)) {
      sheet = 'attack'
      frame = pose === 'windup' || pose === 'react' ? 0 : pose === 'throw' || pose === 'point' ? 1 : 2
    } else if (pose === 'jump') sheet = 'jump'
  }
  const atlas = ['run', 'attack', 'jump', 'minion'].includes(sheet)
  const chip = sheet === 'chip'
  const width = atlas ? 2172 : chip ? 1672 : 1254
  const height = atlas ? 724 : chip ? 941 : sheet === 'server' ? 1266 : 1254
  const cell = atlas ? 724 : chip ? 1672 / 3 : width
  if (!atlas && !chip) frame = 0
  // Atlas coordinates are clipped before scaling: adjacent poses never bleed in.
  const top = atlas ? feet[sheet][frame] - height : 0
  const viewBox = chip ? chips[frame] : `${frame * cell} ${top} ${cell} ${height}`
  return <svg className={`syt-sprite syt-pose-${pose}`} viewBox={viewBox} preserveAspectRatio="xMidYMax meet" role="img"
    aria-label={kind === 'woman' ? 'Mujer SyT' : kind === 'minion' ? 'Esbirro de SyT' : 'Objeto tecnológico'}>
    {sytMasks[sheet] && <defs><clipPath id={maskId}><path d={sytMasks[sheet]} /></clipPath></defs>}
    <image href={sytAssets[sheet]} width={width} height={height} clipPath={sytMasks[sheet] ? `url(#${maskId})` : undefined} />
  </svg>
}
