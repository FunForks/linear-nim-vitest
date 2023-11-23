import { GameProvider } from './context/GameContext'
import { Rules } from './component/Rules'
import { Game } from './component/Game'

function App() {

  return (
    <GameProvider>
      <Rules />
      <Game />
    </GameProvider>
  )
}

export default App
