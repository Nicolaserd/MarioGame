import './App.css'
import { useState } from 'react'
import { OfficeScene } from './game/scenes/office/OfficeScene.jsx'
import { TowerScene } from './game/scenes/tower/TowerScene.jsx'

function App() {
  const [chapter, setChapter] = useState('office')
  return (
    <main className="app-shell">
      {chapter === 'office'
        ? <OfficeScene onComplete={() => setChapter('tower')} />
        : <TowerScene onRestartCampaign={() => setChapter('office')} />}
    </main>
  )
}

export default App
