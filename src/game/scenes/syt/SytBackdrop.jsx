import { memo } from 'react'

function Bay({ index, slot }) {
  return <g transform={`translate(${slot * 480} 0)`}>
    <path d="M8 110H454V436H8Z" fill="#71817b" stroke="#263f42" strokeWidth="9" />
    <path d="M17 121H444V423H17Z" fill="url(#syt-wall)" />
    <path d="M40 138H218M40 144H218" stroke="#f9e4b4" strokeWidth="4" />
    <path d="M25 159V383H80M35 169V369H75" fill="none" stroke="#586766" strokeWidth="4" />
    <rect x="260" y="151" width="163" height="278" rx="5" fill="#182d37" stroke="#98a69b" strokeWidth="4" />
    <rect x="271" y="163" width="142" height="19" fill="#293c41" />
    <text x="280" y="176" fill="#eddaaf" fontSize="8" fontFamily="monospace">SyT / NODO {index + 1}</text>
    {Array.from({ length: 7 }, (_, i) => <g key={i} transform={`translate(274 ${194 + i * 30})`}>
      <rect width="136" height="25" rx="2" fill="#334a50" stroke="#0b2027" strokeWidth="2" />
      <path d="M9 7H78M9 12H78M9 17H78" stroke="#142830" strokeWidth="3" />
      <circle cx="99" cy="12" r="3" fill={i % 3 ? '#a6e8c3' : '#ffc272'} />
      <circle cx="114" cy="12" r="3" fill="#70bebe" />
    </g>)}
    <path d="M421 174Q452 178 440 260T425 418M426 185Q467 253 437 368" fill="none" stroke="#e1aa6d" strokeWidth="3" />
    <rect x="54" y="214" width="167" height="109" rx="6" fill="#1b3038" stroke="#b3b6a1" strokeWidth="4" />
    <rect x="65" y="225" width="145" height="83" fill="#102e32" />
    <text x="74" y="242" fill="#9cddc3" fontSize="9" fontFamily="monospace">{index % 2 ? 'backup.restore(dato)' : '> sistemas.en_linea'}</text>
    <path d="M74 254H161M74 263H188M84 272H143M84 282H172M74 293H129" stroke="#72afa4" strokeWidth="3" />
    <path d="M134 325V346M109 346H160" stroke="#293e44" strokeWidth="9" />
    <rect x="41" y="355" width="201" height="15" rx="3" fill="#c3aa81" stroke="#3a4542" strokeWidth="3" />
    <path d="M52 370V440M227 370V440" stroke="#374d50" strokeWidth="10" />
    <path d="M89 344H171L180 353H80Z" fill="#37454a" stroke="#afbbaf" strokeWidth="2" />
    <ellipse cx="199" cy="350" rx="10" ry="5" fill="#adc1b4" />
    <path d="M201 346Q226 333 211 325" fill="none" stroke="#314b4c" strokeWidth="2" />
    <g transform="translate(62 364)"><rect width="52" height="41" rx="11" fill="#607771" stroke="#233f45" strokeWidth="4" /><path d="M23 39V62M4 69L23 61L48 69" stroke="#233f45" strokeWidth="5" /></g>
    <rect x="166" y="387" width="38" height="33" rx="3" fill="#b0b8a6" stroke="#30454a" strokeWidth="2" />
    <path d="M170 395H199M175 388V379H196V388" fill="#f1e5ca" stroke="#30454a" strokeWidth="2" />
    <rect x="40" y="178" width="125" height="22" rx="2" fill="#dcc9a0" />
    <text x="50" y="193" fill="#684632" fontSize="9" fontFamily="monospace">⚠ NO DESCONECTAR</text>
    <g transform="translate(178 176)"><path d="M0 20V0M46 20V0" stroke="#233c43" strokeWidth="4" /><rect y="17" width="46" height="12" rx="2" fill="#304c51" stroke="#a7b7a0" strokeWidth="2" /><path d="M7 22H11M15 22H19M23 22H27M31 22H35" stroke="#b1eebf" strokeWidth="3" /></g>
    <g transform="translate(128 385)"><rect width="24" height="33" rx="2" fill="#b5bbaa" stroke="#385057" strokeWidth="2" /><circle cx="12" cy="13" r="9" fill="#617a77" stroke="#d6dcc8" /><path d="M12 13L20 22M4 29H14" stroke="#d6dcc8" strokeWidth="2" /></g>
    {index % 2 === 0 && <g transform="translate(128 255)"><rect width="71" height="42" fill="#dfceac" stroke="#6a5247" strokeWidth="2" /><rect width="71" height="11" fill="#995e4b" /><text x="6" y="9" fill="#fff0d2" fontSize="7" fontFamily="monospace">ERROR ×</text><text x="6" y="27" fill="#714334" fontSize="8" fontFamily="monospace">DATO: 404</text></g>}
    <path d="M235 106V133H404V147" fill="none" stroke="#c7aa72" strokeWidth="4" />
  </g>
}

const Room = memo(function Room({ firstBay }) {
  return <svg width="1440" height="442" viewBox="0 0 1440 442" aria-hidden="true">
    <defs><linearGradient id="syt-wall" x2="0" y2="1"><stop stopColor="#8f9c8c" /><stop offset="1" stopColor="#b4b49a" /></linearGradient></defs>
    {[0, 1, 2].map(slot => <Bay key={slot} slot={slot} index={firstBay + slot} />)}
  </svg>
})

export function SytBackdrop({ camera }) {
  const offset = camera * 0.48
  return <div className="syt-backdrop" aria-hidden="true">
    <div className="syt-ceiling" style={{ backgroundPositionX: -camera * 0.22 }} />
    <div className="syt-room" style={{ transform: `translateX(${-offset % 480}px)` }}><Room firstBay={Math.floor(offset / 480)} /></div>
    <div className="syt-room-shade" />
    <div className="syt-floor" style={{ backgroundPositionX: -camera }} />
    <div className="syt-floor-edge" style={{ backgroundPositionX: -camera }} />
  </div>
}
