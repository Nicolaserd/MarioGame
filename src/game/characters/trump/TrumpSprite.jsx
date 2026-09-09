import { useId } from 'react'
import ready from '../../../../assets/trump/trump-ready.png'
import actions from '../../../../assets/trump/trump-actions.png'
import { getTrumpFrame } from './trumpAnimation.js'
import { trumpFrameMasks } from './trumpFrameMasks.js'
import './trumpAnimation.css'

// Vector silhouette prevents the generated matte from covering the arena.
const silhouette = 'M354 79L382 62L417 36L475 18L563 10L665 18L712 47L739 104L748 174L766 239L791 265L777 292L750 308L827 330L869 348L893 403L931 451L967 493L1003 534L1017 606L1009 677L980 733L954 752L948 824L968 889L954 935L929 952L952 1004L965 1056L937 1131L895 1257L877 1324L908 1361L985 1394L1010 1432L1008 1458L955 1471L826 1471L713 1462L660 1441L651 1396L678 1354L684 1293L660 1234L630 1178L601 1136L572 1128L533 1158L484 1230L431 1282L385 1352L330 1396L285 1430L284 1476L257 1501L215 1516L123 1523L30 1510L18 1484L34 1447L61 1414L72 1387L71 1339L89 1299L101 1208L130 1112L173 1049L203 970L196 928L161 899L148 866L148 820L175 761L212 702L241 662L246 609L205 604L148 581L109 547L80 507L69 462L49 423L34 381L39 347L73 327L118 338L103 321L56 311L26 295L19 278L28 267L49 272L114 297L170 314L202 338L250 322L325 305L390 305L412 274L420 251L391 251L385 233L401 210L423 198L396 173L370 160L351 137L347 109Z'

export function TrumpSprite({ pose, hurt, poseTime = 0, attack }) {
  const mask = useId()
  const frame = getTrumpFrame(pose, poseTime)
  if (frame !== null) {
    const x = (frame % 3) * 418
    const y = frame >= 6 ? 803 : Math.floor(frame / 3) * 418
    return <svg className={`trump-frames pose-${pose} power-${attack ?? 'none'} ${hurt ? 'is-hit' : ''}`} viewBox="0 0 418 418" role="img" aria-label="Donald Trump, rival ilustrado" data-frame={frame}>
      <defs><clipPath id={mask}><path d={trumpFrameMasks[frame]} clipRule="evenodd" /></clipPath></defs>
      <g transform={`translate(${-x} ${-y})`}>
        <image href={actions} width="1254" height="1254" clipPath={`url(#${mask})`} />
      </g>
    </svg>
  }
  return <svg className={`trump-illustration pose-${pose} ${hurt ? 'is-hit' : ''}`} viewBox="0 0 1024 1536" role="img" aria-label="Donald Trump, rival ilustrado">
    <defs><clipPath id={mask}><path d={silhouette} /></clipPath></defs>
    <image href={ready} width="1024" height="1536" clipPath={`url(#${mask})`} />
  </svg>
}
