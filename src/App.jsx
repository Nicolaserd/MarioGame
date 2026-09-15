import './App.css'
import { useEffect, useState } from 'react'
import { SPRITE_METRICS } from './game/characters/mario/marioLayout.js'
import { OfficeScene } from './game/scenes/office/OfficeScene.jsx'
import { TowerScene } from './game/scenes/tower/TowerScene.jsx'
import { SytScene } from './game/scenes/syt/SytScene.jsx'
import trumpActions from '../assets/trump/trump-actions.png'
import trumpDodge from '../assets/trump/trump-dodge.png'

function App() {
  const [chapter, setChapter] = useState('office')
  useEffect(() => {
    // Warm the browser's image cache during the intro, before rapid pose changes.
    for (const src of [...SPRITE_METRICS.keys(), trumpActions, trumpDodge]) {
      const image = new Image()
      image.src = src
    }
  }, [])
  return (
    <main className="app-shell">
      {chapter === 'office'
        ? <OfficeScene onComplete={() => setChapter('tower')} onSelectLevel={setChapter} />
        : chapter === 'tower'
          ? <TowerScene onComplete={() => setChapter('syt')} onRestartCampaign={() => setChapter('office')} onSelectLevel={setChapter} />
          : <SytScene onSelectLevel={setChapter} />}
    </main>
  )
}

export default App
