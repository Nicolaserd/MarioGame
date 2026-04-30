import './App.css'
import { GameScene } from './components/GameScene.jsx'

function App() {
  return (
    <main className="app-shell">
      <section className="app-copy">
        <h1>Mario ya cae sobre su bloque de suelo</h1>
        <p className="description">
          Dejamos la base del juego lista con gravedad, una plataforma con tu
          sprite de suelo y las animaciones de <code>idle</code>,{' '}
          <code>correr</code> y <code>freno</code>.
        </p>
      </section>

      <GameScene />
    </main>
  )
}

export default App
