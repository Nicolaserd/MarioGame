import { useId } from 'react'
import actions from '../../../../assets/trump/trump-actions.png'
import dodgeActions from '../../../../assets/trump/trump-dodge.png'
import { getTrumpFrame, getTrumpDodgeFrame } from './trumpAnimation.js'
import { trumpFrameMasks } from './trumpFrameMasks.js'
import { trumpDodgeFrames } from './trumpDodgeFrames.js'
import './trumpAnimation.css'

const ground = [405, 405, 405, 823, 823, 823, 1208, 1204, 1215]

export function TrumpSprite({ pose, hurt, poseTime = 0, attack, vy = 0, dodgeType, dodgeTime = 0 }) {
  const mask = useId()
  const dodgeFrame = getTrumpDodgeFrame(pose, pose === 'dodge-recover' ? poseTime : dodgeTime, vy, dodgeType)
  if (dodgeFrame !== null) {
    const bounds = trumpDodgeFrames[dodgeFrame]
    const scale = 0.874
    const x = 209 - (bounds.minX + bounds.maxX) / 2 * scale
    const y = 405 - (bounds.maxY + 1) * scale
    return <svg className={`trump-frames pose-${pose} ${hurt ? 'is-hit' : ''}`} viewBox="0 0 418 418" role="img" aria-label={`Donald Trump ${pose === 'duck' ? 'agachándose' : pose === 'jump' ? 'saltando' : 'recuperándose'}`} data-dodge-frame={dodgeFrame}>
      <defs><clipPath id={mask}><path d={bounds.path} clipRule="evenodd" /></clipPath></defs>
      <g transform={`translate(${x} ${y}) scale(${scale})`}>
        <image href={dodgeActions} width="1254" height="1254" clipPath={`url(#${mask})`} />
      </g>
    </svg>
  }
  const frame = getTrumpFrame(pose, poseTime) ?? 3
  const x = (frame % 3) * 418
  const y = ground[frame] - 405
  return <svg className={`trump-frames pose-${pose} power-${attack ?? 'none'} ${hurt ? 'is-hit' : ''}`} viewBox="0 0 418 418" role="img" aria-label="Donald Trump, rival ilustrado" data-frame={frame}>
    <defs><clipPath id={mask}><path d={trumpFrameMasks[frame]} clipRule="evenodd" /></clipPath></defs>
    <g transform={`translate(${-x} ${-y})`}>
      <image href={actions} width="1254" height="1254" clipPath={`url(#${mask})`} />
    </g>
  </svg>
}
